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
import { formatDate } from "@/lib/utils";

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
    // By default, set vegCount to clamped if no other diet set
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
          title: "RSVP Confirmed! 🎉",
          description: "Your response has been saved. The family has been notified!",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const err = await res.json();
        toast({ title: "Submission Failed", description: err.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not submit RSVP. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#B91C6C] text-white flex items-center justify-center mx-auto animate-pulse">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <p className="text-sm font-semibold text-[#78716C]">Opening Wedding Invitation...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center border-[#E8DDD3] bg-white">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#1C1917]">Invalid Invitation Link</h2>
          <p className="text-xs text-[#78716C] mt-2">
            This invitation link is expired or does not exist. Please contact the wedding organizer on WhatsApp for a new link.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] text-[#1C1917] pb-16">
      {/* Decorative Top Accent Bar */}
      <div className="h-2 bg-gradient-to-r from-[#B91C6C] via-[#D97706] to-[#B91C6C]" />

      <div className="max-w-2xl mx-auto px-4 pt-6 sm:pt-10 space-y-6">
        {/* Wedding Invitation Card */}
        <div className="rounded-3xl bg-white border border-[#E8DDD3] shadow-xl shadow-stone-200/50 overflow-hidden text-center p-6 sm:p-10 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCE7F3] text-[#B91C6C] text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Wedding Celebration</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
            {data.wedding.familyName}
          </h1>

          <p className="text-base sm:text-lg text-[#B91C6C] font-semibold mt-1">
            {data.wedding.brideName} &amp; {data.wedding.groomName}
          </p>

          <div className="my-6 py-4 border-y border-[#E8DDD3] grid grid-cols-2 gap-2 text-xs">
            <div className="flex flex-col items-center">
              <Calendar className="w-4 h-4 text-[#D97706] mb-1" />
              <span className="font-bold text-[#1C1917]">{formatDate(data.wedding.weddingDate)}</span>
              <span className="text-[#78716C] text-[11px]">Wedding Date</span>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-4 h-4 text-[#B91C6C] mb-1" />
              <span className="font-bold text-[#1C1917] truncate max-w-[180px]">{data.wedding.city}</span>
              <span className="text-[#78716C] text-[11px] truncate max-w-[180px]">{data.wedding.venue}</span>
            </div>
          </div>

          {/* Personal Greeting for Guest */}
          <div className="p-4 rounded-2xl bg-[#FFFBF5] border border-[#E8DDD3] text-center">
            <p className="text-xs uppercase tracking-wider text-[#78716C] font-semibold">
              Personal Invitation For
            </p>
            <h2 className="text-xl font-black text-[#1C1917] mt-0.5">
              Namaste, {data.guest.name}! 🙏
            </h2>
            <p className="text-xs text-[#78716C] mt-1.5 max-w-md mx-auto leading-relaxed">
              We would be honored by your presence and blessings. Please confirm your attendance below so we can arrange comfortable hospitality and meals for you.
            </p>
          </div>
        </div>

        {/* Success Confirmation Banner if already submitted */}
        {submitted && (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-center animate-fade-in">
            <PartyPopper className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-emerald-900">
              Shukriya! Your RSVP is Confirmed 🎊
            </h3>
            <p className="text-xs text-emerald-700 mt-1">
              Your attendance and food preferences have been saved. You can return to this link anytime to update your plans if anything changes.
            </p>
          </div>
        )}

        {/* RSVP Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#78716C] px-1">
              Confirm For Each Ceremony
            </h3>

            {data.events.map((event) => {
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
                  className={`border transition-all shadow-sm ${
                    current.status === "CONFIRMED"
                      ? "border-emerald-300 bg-white"
                      : current.status === "DECLINED"
                      ? "border-red-200 bg-stone-50/50"
                      : "border-[#E8DDD3] bg-white"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge className="bg-[#FFFBF5] text-[#D97706] border border-[#E8DDD3] text-[10px] font-bold mb-1">
                          {event.type}
                        </Badge>
                        <CardTitle className="text-lg font-bold text-[#1C1917]">
                          {event.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-[#78716C] mt-0.5">
                          📅 {formatDate(event.eventDate)} {event.startTime && `• ⏰ ${event.startTime}`}
                          {event.venue && ` • 📍 ${event.venue}`}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-1">
                    {/* Status Toggle Buttons */}
                    <div>
                      <Label className="text-xs font-semibold text-[#78716C] block mb-2">
                        Are you attending this ceremony?
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => updateEventRsvp(event.id, { status: "CONFIRMED" })}
                          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            current.status === "CONFIRMED"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : "bg-white text-[#1C1917] border-[#E8DDD3] hover:bg-emerald-50"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Coming
                        </button>

                        <button
                          type="button"
                          onClick={() => updateEventRsvp(event.id, { status: "MAYBE" })}
                          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            current.status === "MAYBE"
                              ? "bg-[#D97706] text-white border-[#D97706] shadow-sm"
                              : "bg-white text-[#1C1917] border-[#E8DDD3] hover:bg-amber-50"
                          }`}
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          Maybe
                        </button>

                        <button
                          type="button"
                          onClick={() => updateEventRsvp(event.id, { status: "DECLINED" })}
                          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            current.status === "DECLINED"
                              ? "bg-red-600 text-white border-red-600 shadow-sm"
                              : "bg-white text-[#1C1917] border-[#E8DDD3] hover:bg-red-50"
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cannot Come
                        </button>
                      </div>
                    </div>

                    {/* Attending Details: Party Size, Food Breakdown, Arrival Time */}
                    {current.status === "CONFIRMED" && (
                      <div className="space-y-4 pt-3 border-t border-[#E8DDD3] animate-fade-in">
                        {/* Party Size Selector */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs font-semibold text-[#1C1917]">
                              Total People Attending (including you)
                            </Label>
                            <span className="text-xs font-bold text-[#B91C6C]">
                              {current.partySize} {current.partySize === 1 ? "Person" : "People"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => handlePartySizeChange(event.id, num)}
                                className={`w-9 h-9 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                                  current.partySize === num
                                    ? "bg-[#B91C6C] text-white border-[#B91C6C]"
                                    : "bg-white text-[#78716C] border-[#E8DDD3] hover:bg-[#FFFBF5]"
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Food Preferences Breakdown */}
                        <div className="p-3.5 rounded-xl bg-[#FFFBF5] border border-[#E8DDD3] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                              <UtensilsCrossed className="w-3.5 h-3.5 text-[#B91C6C]" />
                              Food &amp; Dietary Requirements
                            </span>
                            <span className="text-[10px] text-[#78716C]">
                              Total: {current.vegCount + current.jainCount + current.nonVegCount + current.veganCount} / {current.partySize} plates
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {/* Veg */}
                            <div className="p-2 bg-white rounded-lg border border-[#E8DDD3] flex items-center justify-between">
                              <span className="font-medium text-emerald-800">🥗 Vegetarian</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateEventRsvp(event.id, { vegCount: Math.max(0, current.vegCount - 1) })}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold"
                                >
                                  -
                                </button>
                                <span className="font-bold w-4 text-center">{current.vegCount}</span>
                                <button
                                  type="button"
                                  onClick={() => updateEventRsvp(event.id, { vegCount: current.vegCount + 1 })}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Jain */}
                            <div className="p-2 bg-white rounded-lg border border-[#E8DDD3] flex items-center justify-between">
                              <span className="font-medium text-amber-800">🪷 Pure Jain</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateEventRsvp(event.id, { jainCount: Math.max(0, current.jainCount - 1) })}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold"
                                >
                                  -
                                </button>
                                <span className="font-bold w-4 text-center">{current.jainCount}</span>
                                <button
                                  type="button"
                                  onClick={() => updateEventRsvp(event.id, { jainCount: current.jainCount + 1 })}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Non-Veg */}
                            <div className="p-2 bg-white rounded-lg border border-[#E8DDD3] flex items-center justify-between">
                              <span className="font-medium text-red-800">🍗 Non-Veg</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateEventRsvp(event.id, { nonVegCount: Math.max(0, current.nonVegCount - 1) })}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold"
                                >
                                  -
                                </button>
                                <span className="font-bold w-4 text-center">{current.nonVegCount}</span>
                                <button
                                  type="button"
                                  onClick={() => updateEventRsvp(event.id, { nonVegCount: current.nonVegCount + 1 })}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Vegan */}
                            <div className="p-2 bg-white rounded-lg border border-[#E8DDD3] flex items-center justify-between">
                              <span className="font-medium text-purple-800">🌱 Vegan</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateEventRsvp(event.id, { veganCount: Math.max(0, current.veganCount - 1) })}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold"
                                >
                                  -
                                </button>
                                <span className="font-bold w-4 text-center">{current.veganCount}</span>
                                <button
                                  type="button"
                                  onClick={() => updateEventRsvp(event.id, { veganCount: current.veganCount + 1 })}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Arrival Time */}
                        <div>
                          <Label className="text-xs font-semibold text-[#78716C] block mb-1.5">
                            Estimated Arrival Time
                          </Label>
                          <select
                            value={current.arrivalTime}
                            onChange={(e) =>
                              updateEventRsvp(event.id, {
                                arrivalTime: e.target.value as (typeof current)["arrivalTime"],
                              })
                            }
                            className="w-full h-9 rounded-lg border border-[#E8DDD3] bg-white px-3 text-xs text-[#1C1917] outline-none"
                          >
                            <option value="BEFORE_EVENT">Early arrival (Will help with setup / pre-ceremony)</option>
                            <option value="ON_TIME">Right on time for the Muhurat / Event start</option>
                            <option value="SLIGHTLY_LATE">Slightly late (Within 30-45 mins)</option>
                            <option value="LATE">Late evening (Coming directly for Dinner/Reception)</option>
                          </select>
                        </div>

                        {/* Special Dietary / Wishes Notes */}
                        <div>
                          <Label className="text-xs font-semibold text-[#78716C] block mb-1">
                            Dietary Allergies or Special Requests
                          </Label>
                          <Input
                            placeholder="e.g. No gluten / strictly no garlic for Dadi / high chair for baby"
                            value={current.dietaryNotes}
                            onChange={(e) => updateEventRsvp(event.id, { dietaryNotes: e.target.value })}
                            className="h-9 text-xs border-[#E8DDD3]"
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
            className="w-full h-12 bg-[#B91C6C] hover:bg-[#9D174D] text-white font-bold text-base shadow-xl shadow-[#B91C6C]/25 cursor-pointer"
          >
            {submitting ? "Submitting RSVP..." : "Save My RSVP Confirmation"}
            {!submitting && <Send className="w-4 h-4 ml-2" />}
          </Button>

          <p className="text-center text-xs text-[#78716C]">
            You can bookmark or reopen this WhatsApp link anytime to adjust your RSVP.
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
        <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#B91C6C] text-white flex items-center justify-center mx-auto animate-pulse">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <p className="text-sm font-semibold text-[#78716C]">Opening Wedding Invitation...</p>
          </div>
        </div>
      }
    >
      <GuestRsvpInner />
    </React.Suspense>
  );
}
