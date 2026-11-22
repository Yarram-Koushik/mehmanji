"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Heart,
  Calendar,
  MapPin,
  Clock,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Users,
  Send,
  PartyPopper,
} from "lucide-react";
import { formatDate, sortEventsChronologically } from "@/lib/utils";

interface RsvpEvent {
  id: string;
  name: string;
  type: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
}

interface RsvpGuestData {
  guest: {
    id: string;
    name: string;
    phone: string;
    email: string;
    token: string;
  };
  wedding: {
    id: string;
    brideName: string;
    groomName: string;
    familyName: string;
    weddingDate: string;
    venue: string;
    city: string;
    themeColor: string;
    coverImageUrl: string;
  };
  events: RsvpEvent[];
  existingRsvps: Array<{
    eventId: string;
    status: string;
    partySize: number;
    vegCount: number;
    nonVegCount: number;
    jainCount: number;
    veganCount: number;
    arrivalTime: string;
    dietaryNotes: string;
  }>;
}

function GuestRsvpInner() {
  const params = useParams();
  const { toast } = useToast();
  const token = params?.token as string;

  const [data, setData] = React.useState<RsvpGuestData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  // Form state per event: eventId -> state
  const [rsvpState, setRsvpState] = React.useState<
    Record<
      string,
      {
        status: "CONFIRMED" | "DECLINED" | "MAYBE" | "PENDING";
        partySize: number;
        vegCount: number;
        nonVegCount: number;
        jainCount: number;
        veganCount: number;
        arrivalTime: "BEFORE_EVENT" | "ON_TIME" | "SLIGHTLY_LATE" | "LATE";
        dietaryNotes: string;
      }
    >
  >({});

  React.useEffect(() => {
    async function loadRsvp() {
      try {
        const res = await fetch(`/api/rsvp/${token}`);
        if (res.ok) {
          const json: RsvpGuestData = await res.json();
          setData(json);

          // Initialize form state from existing RSVPs or defaults
          const initialMap: typeof rsvpState = {};
          json.events.forEach((ev) => {
            const existing = json.existingRsvps.find((r) => r.eventId === ev.id);
            if (existing && existing.status !== "PENDING") {
              initialMap[ev.id] = {
                status: existing.status as "CONFIRMED" | "DECLINED" | "MAYBE",
                partySize: existing.partySize || 1,
                vegCount: existing.vegCount || 0,
                nonVegCount: existing.nonVegCount || 0,
                jainCount: existing.jainCount || 0,
                veganCount: existing.veganCount || 0,
                arrivalTime: (existing.arrivalTime as "BEFORE_EVENT" | "ON_TIME" | "SLIGHTLY_LATE" | "LATE") || "ON_TIME",
                dietaryNotes: existing.dietaryNotes || "",
              };
            } else {
              // Default prefill: Confirmed with 1 Veg plate
              initialMap[ev.id] = {
                status: "CONFIRMED",
                partySize: 1,
                vegCount: 1,
                nonVegCount: 0,
                jainCount: 0,
                veganCount: 0,
                arrivalTime: "ON_TIME",
                dietaryNotes: "",
              };
            }
          });
          setRsvpState(initialMap);
        } else {
          toast({ title: "Invalid Link", description: "This invitation link was not found.", variant: "destructive" });
        }
      } catch {
        toast({ title: "Error", description: "Failed to load invitation", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    if (token) loadRsvp();
  }, [token, toast]);

  const updateEventRsvp = (eventId: string, partial: Partial<(typeof rsvpState)[string]>) => {
    setRsvpState((prev) => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        ...partial,
      },
    }));
  };

  // Adjust party size and balance food counters
  const handlePartySizeChange = (eventId: string, newSize: number) => {
    const clamped = Math.max(1, Math.min(10, newSize));
    const current = rsvpState[eventId];
    const totalSpecific = current.nonVegCount + current.jainCount + current.veganCount;
    const remainingVeg = Math.max(0, clamped - totalSpecific);

    updateEventRsvp(eventId, {
      partySize: clamped,
      vegCount: remainingVeg,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        rsvps: Object.entries(rsvpState).map(([eventId, form]) => ({
          eventId,
          status: form.status,
          partySize: form.status === "CONFIRMED" ? form.partySize : 1,
          vegCount: form.status === "CONFIRMED" ? form.vegCount : 0,
          nonVegCount: form.status === "CONFIRMED" ? form.nonVegCount : 0,
          jainCount: form.status === "CONFIRMED" ? form.jainCount : 0,
          veganCount: form.status === "CONFIRMED" ? form.veganCount : 0,
          arrivalTime: form.arrivalTime,
          dietaryNotes: form.dietaryNotes,
        })),
      };

      const res = await fetch(`/api/rsvp/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
        toast({
          title: "Attendance Confirmed! 🎉",
          description: "Thank you for confirming. The family has been notified!",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const err = await res.json();
        toast({ title: "Submission Failed", description: err.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not submit your confirmation. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1F2E23] text-[#C5A059] border border-[#C5A059]/40 flex items-center justify-center mx-auto animate-pulse">
            <Heart className="w-6 h-6 fill-[#C5A059]" />
          </div>
          <p className="text-sm font-medium text-[#6E6A63]">Opening Wedding Invitation...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center border-[#EAE5DF] bg-white rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[#1F1E1C]">Invalid Invitation Link</h2>
          <p className="text-xs text-[#6E6A63] mt-2 leading-relaxed">
            This invitation link is expired or does not exist. Please contact the wedding organizer on WhatsApp for a new link.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F1E1C] pb-20 font-sans">
      {/* Decorative Top Accent Bar */}
      <div className="h-2 bg-gradient-to-r from-[#1F2E23] via-[#C5A059] to-[#1F2E23]" />

      <div className="max-w-2xl mx-auto px-4 pt-6 sm:pt-10 space-y-6">
        {/* Luxury Wedding Invitation Card */}
        <div className="rounded-3xl bg-white border border-[#EAE5DF] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] overflow-hidden text-center p-7 sm:p-11 relative">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FBF8F1] border border-[#C5A059]/30 text-[#C5A059] text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Wedding Celebration</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1F1E1C] tracking-tight">
            {data.wedding.familyName}
          </h1>

          <p className="font-serif text-lg sm:text-xl text-[#C5A059] font-medium mt-1.5 italic">
            Celebrating {data.wedding.brideName} &amp; {data.wedding.groomName}
          </p>

          <div className="my-6 py-4 border-y border-[#EAE5DF] grid grid-cols-2 gap-2 text-xs">
            <div className="flex flex-col items-center">
              <Calendar className="w-4 h-4 text-[#C5A059] mb-1" />
              <span className="font-semibold text-[#1F1E1C] tabular-nums">{formatDate(data.wedding.weddingDate)}</span>
              <span className="text-[#6E6A63] text-[11px]">Wedding Date</span>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-4 h-4 text-[#7A8B74] mb-1" />
              <span className="font-semibold text-[#1F1E1C] truncate max-w-[180px]">{data.wedding.city}</span>
              <span className="text-[#6E6A63] text-[11px] truncate max-w-[180px]">{data.wedding.venue}</span>
            </div>
          </div>

          {/* Personal Greeting for Guest */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DF] text-center">
            <p className="text-[11px] uppercase tracking-wider text-[#6E6A63] font-semibold">
              Personal Invitation For
            </p>
            <h2 className="font-serif text-2xl font-bold text-[#1F1E1C] mt-1">
              Namaste, {data.guest.name}! 🙏
            </h2>
            <p className="text-xs text-[#6E6A63] mt-2 max-w-md mx-auto leading-relaxed">
              We would be truly honored by your presence and warm blessings. Please let us know if you can attend so we can arrange comfortable hospitality and fresh meals for you.
            </p>
          </div>
        </div>

        {/* Success Confirmation Banner if already submitted */}
        {submitted && (
          <div className="p-6 rounded-2xl bg-[#F2F5F0] border border-[#7A8B74]/30 text-center animate-fade-in shadow-sm">
            <PartyPopper className="w-10 h-10 text-[#7A8B74] mx-auto mb-2" />
            <h3 className="font-serif text-xl font-bold text-[#1F1E1C]">
              Shukriya! Your Response is Confirmed 🎊
            </h3>
            <p className="text-xs text-[#6E6A63] mt-1.5 leading-relaxed">
              Your attendance and dietary preferences have been saved. You can reopen this link anytime to update your plans if anything changes.
            </p>
          </div>
        )}

        {/* RSVP Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#1F1E1C] px-1">
              Confirm For Each Ceremony
            </h3>

            {sortEventsChronologically(data.events).map((event) => {
              const current = rsvpState[event.id] || {
                status: "CONFIRMED",
                partySize: 1,
                vegCount: 1,
                nonVegCount: 0,
                jainCount: 0,
                veganCount: 0,
                arrivalTime: "ON_TIME",
                dietaryNotes: "",
              };

              return (
                <Card
                  key={event.id}
                  className={`border transition-all shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] rounded-2xl ${
                    current.status === "CONFIRMED"
                      ? "border-[#7A8B74]/40 bg-white"
                      : current.status === "DECLINED"
                      ? "border-rose-200 bg-stone-50/50"
                      : "border-[#EAE5DF] bg-white"
                  }`}
                >
                  <CardHeader className="pb-3 p-6">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="default" className="text-[10px] font-semibold uppercase tracking-wider mb-2">
                          {event.type}
                        </Badge>
                        <CardTitle className="font-serif text-xl font-bold text-[#1F1E1C]">
                          {event.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-[#6E6A63] mt-1 flex flex-wrap items-center gap-2">
                          <span>📅 <span className="tabular-nums">{formatDate(event.eventDate)}</span></span>
                          {event.startTime && <span>• ⏰ {event.startTime}</span>}
                          {event.venue && <span>• 📍 {event.venue}</span>}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 px-6 pb-6 pt-1">
                    {/* Status Toggle Buttons */}
                    <div>
                      <Label className="text-xs font-semibold text-[#6E6A63] block mb-2">
                        Are you attending this ceremony?
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => updateEventRsvp(event.id, { status: "CONFIRMED" })}
                          className={`py-2.5 px-3 rounded-[10px] text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            current.status === "CONFIRMED"
                              ? "bg-[#7A8B74] text-white border-[#7A8B74] shadow-sm"
                              : "bg-white text-[#1F1E1C] border-[#EAE5DF] hover:bg-[#F2F5F0]"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Coming
                        </button>

                        <button
                          type="button"
                          onClick={() => updateEventRsvp(event.id, { status: "MAYBE" })}
                          className={`py-2.5 px-3 rounded-[10px] text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            current.status === "MAYBE"
                              ? "bg-[#C5A059] text-white border-[#C5A059] shadow-sm"
                              : "bg-white text-[#1F1E1C] border-[#EAE5DF] hover:bg-[#FBF8F1]"
                          }`}
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          Maybe
                        </button>

                        <button
                          type="button"
                          onClick={() => updateEventRsvp(event.id, { status: "DECLINED" })}
                          className={`py-2.5 px-3 rounded-[10px] text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            current.status === "DECLINED"
                              ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                              : "bg-white text-[#1F1E1C] border-[#EAE5DF] hover:bg-rose-50"
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cannot Come
                        </button>
                      </div>
                    </div>

                    {/* Attending Details: Party Size, Food Breakdown, Arrival Time */}
                    {current.status === "CONFIRMED" && (
                      <div className="space-y-4 pt-3 border-t border-[#EAE5DF] animate-fade-in">
                        {/* Party Size Selector */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs font-semibold text-[#1F1E1C]">
                              Total People Attending (including you)
                            </Label>
                            <span className="text-xs font-bold text-[#C5A059] tabular-nums">
                              {current.partySize} {current.partySize === 1 ? "Person" : "People"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => handlePartySizeChange(event.id, num)}
                                className={`w-9 h-9 rounded-[10px] font-semibold text-xs border transition-all cursor-pointer ${
                                  current.partySize === num
                                    ? "bg-[#1F2E23] text-white border-[#1F2E23]"
                                    : "bg-white text-[#6E6A63] border-[#EAE5DF] hover:bg-[#FAF8F5]"
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Food Preferences Breakdown */}
                        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DF] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#1F1E1C] flex items-center gap-1.5">
                              <UtensilsCrossed className="w-3.5 h-3.5 text-[#C5A059]" />
                              Food &amp; Dietary Requirements
                            </span>
                            <span className="text-[10px] text-[#6E6A63] tabular-nums">
                              Total: {current.vegCount + current.jainCount + current.nonVegCount + current.veganCount} / {current.partySize} plates
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5 text-xs">
                            {/* Veg */}
                            <div className="p-2.5 bg-white rounded-lg border border-[#EAE5DF] flex items-center justify-between">
                              <span className="font-medium text-[#7A8B74]">🥗 Vegetarian</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateEventRsvp(event.id, { vegCount: Math.max(0, current.vegCount - 1) })}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold hover:bg-stone-200"
                                >
                                  -
                                </button>
                                <span className="font-bold w-4 text-center tabular-nums">{current.vegCount}</span>
                                <button
                                  type="button"
                                  onClick={() => updateEventRsvp(event.id, { vegCount: current.vegCount + 1 })}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold hover:bg-stone-200"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Jain */}
                            <div className="p-2.5 bg-white rounded-lg border border-[#EAE5DF] flex items-center justify-between">
                              <span className="font-medium text-[#C5A059]">🪷 Pure Jain</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateEventRsvp(event.id, { jainCount: Math.max(0, current.jainCount - 1) })}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold hover:bg-stone-200"
                                >
                                  -
                                </button>
                                <span className="font-bold w-4 text-center tabular-nums">{current.jainCount}</span>
                                <button
                                  type="button"
                                  onClick={() => updateEventRsvp(event.id, { jainCount: current.jainCount + 1 })}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold hover:bg-stone-200"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Non-Veg */}
                            <div className="p-2.5 bg-white rounded-lg border border-[#EAE5DF] flex items-center justify-between">
                              <span className="font-medium text-rose-700">🍗 Non-Veg</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateEventRsvp(event.id, { nonVegCount: Math.max(0, current.nonVegCount - 1) })}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold hover:bg-stone-200"
                                >
                                  -
                                </button>
                                <span className="font-bold w-4 text-center tabular-nums">{current.nonVegCount}</span>
                                <button
                                  type="button"
                                  onClick={() => updateEventRsvp(event.id, { nonVegCount: current.nonVegCount + 1 })}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold hover:bg-stone-200"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Vegan */}
                            <div className="p-2.5 bg-white rounded-lg border border-[#EAE5DF] flex items-center justify-between">
                              <span className="font-medium text-[#6E6A63]">🌱 Vegan</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateEventRsvp(event.id, { veganCount: Math.max(0, current.veganCount - 1) })}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold hover:bg-stone-200"
                                >
                                  -
                                </button>
                                <span className="font-bold w-4 text-center tabular-nums">{current.veganCount}</span>
                                <button
                                  type="button"
                                  onClick={() => updateEventRsvp(event.id, { veganCount: current.veganCount + 1 })}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold hover:bg-stone-200"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Arrival Time */}
                        <div>
                          <Label className="text-xs font-semibold text-[#6E6A63] block mb-1.5">
                            Estimated Arrival Time
                          </Label>
                          <select
                            value={current.arrivalTime}
                            onChange={(e) =>
                              updateEventRsvp(event.id, {
                                arrivalTime: e.target.value as (typeof current)["arrivalTime"],
                              })
                            }
                            className="w-full h-10 rounded-[10px] border border-[#EAE5DF] bg-white px-3 text-xs text-[#1F1E1C] outline-none focus:border-[#C5A059]"
                          >
                            <option value="BEFORE_EVENT">Early arrival (Will help with setup / pre-ceremony)</option>
                            <option value="ON_TIME">Right on time for the Muhurat / Event start</option>
                            <option value="SLIGHTLY_LATE">Slightly late (Within 30-45 mins)</option>
                            <option value="LATE">Late evening (Coming directly for Dinner/Reception)</option>
                          </select>
                        </div>

                        {/* Special Dietary / Wishes Notes */}
                        <div>
                          <Label className="text-xs font-semibold text-[#6E6A63] block mb-1">
                            Dietary Allergies or Special Requests
                          </Label>
                          <Input
                            placeholder="e.g. No gluten / strictly no garlic for Dadi / high chair for baby"
                            value={current.dietaryNotes}
                            onChange={(e) => updateEventRsvp(event.id, { dietaryNotes: e.target.value })}
                            className="h-10 text-xs border-[#EAE5DF]"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-12 bg-[#1F2E23] hover:bg-[#152018] text-[#C5A059] border border-[#C5A059]/40 font-medium text-base shadow-lg shadow-[#1F2E23]/20 cursor-pointer"
          >
            {submitting ? "Saving Your Response..." : "Confirm Attendance & Food Preferences"}
            {!submitting && <Send className="w-4 h-4 ml-2 text-[#C5A059]" />}
          </Button>

          <p className="text-center text-xs text-[#6E6A63]">
            You can reopen this WhatsApp link anytime if your plans or food choices change.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function GuestRsvpPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1F2E23] text-[#C5A059] flex items-center justify-center mx-auto animate-pulse">
              <Heart className="w-6 h-6 fill-[#C5A059]" />
            </div>
            <p className="text-sm font-semibold text-[#6E6A63]">Opening Wedding Invitation...</p>
          </div>
        </div>
      }
    >
      <GuestRsvpInner />
    </React.Suspense>
  );
}
