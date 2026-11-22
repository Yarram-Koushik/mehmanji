"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  CalendarHeart,
  Plus,
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Trash2,
  Users,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SubEvent {
  id: string;
  name: string;
  type: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  sortOrder: number;
  rsvps: Array<{
    status: string;
    partySize: number;
    vegCount: number;
    nonVegCount: number;
    jainCount: number;
  }>;
}

function EventsPageInner() {
  const params = useParams();
  const { toast } = useToast();
  const weddingId = params?.weddingId as string;

  const [events, setEvents] = React.useState<SubEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [openAddModal, setOpenAddModal] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [eventToDelete, setEventToDelete] = React.useState<SubEvent | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: "",
    type: "OTHER",
    eventDate: new Date().toISOString().split("T")[0],
    startTime: "6:00 PM",
    endTime: "10:00 PM",
    venue: "",
    address: "",
  });

  const loadEvents = async () => {
    try {
      const res = await fetch(`/api/weddings/${weddingId}/events`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load events", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (weddingId) loadEvents();
  }, [weddingId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/weddings/${weddingId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sortOrder: events.length + 1,
        }),
      });

      if (res.ok) {
        toast({ title: "Sub-event added! 🎊", description: `${formData.name} added.` });
        setOpenAddModal(false);
        setFormData({
          name: "",
          type: "OTHER",
          eventDate: new Date().toISOString().split("T")[0],
          startTime: "6:00 PM",
          endTime: "10:00 PM",
          venue: "",
          address: "",
        });
        loadEvents();
      } else {
        const err = await res.json();
        toast({ title: "Failed to add", description: err.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not create event", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/weddings/${weddingId}/events/${eventToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({ title: "Event deleted", description: `"${eventToDelete.name}" has been removed.` });
        setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
        setEventToDelete(null);
      } else {
        const err = await res.json();
        toast({ title: "Failed to delete", description: err.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not delete event", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD3]">
        <div className="flex items-center gap-3">
          <Link href={`/weddings/${weddingId}`}>
            <Button variant="ghost" size="sm" className="p-2 h-auto text-[#78716C] hover:text-[#1C1917]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1C1917]">
              Wedding Sub-Events
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C]">
              Manage multi-day ceremonies: Mehendi, Sangeet, Haldi, Pheras &amp; Reception.
            </p>
          </div>
        </div>

        {/* Add Event Dialog */}
        <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
          <DialogTrigger asChild>
            <Button className="bg-[#B91C6C] hover:bg-[#9D174D] text-white text-xs font-semibold h-9 shadow-sm cursor-pointer">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Sub-Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white border-[#E8DDD3]">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#1C1917]">
                Add Wedding Ceremony / Event
              </DialogTitle>
              <DialogDescription className="text-xs text-[#78716C]">
                Guests will be prompted to RSVP for this specific ceremony.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <Label htmlFor="ename" className="text-xs font-semibold text-[#78716C]">
                  Event Name *
                </Label>
                <Input
                  id="ename"
                  placeholder="e.g. Haldi Rasam or Cocktail Evening"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-9 border-[#E8DDD3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="etype" className="text-xs font-semibold text-[#78716C]">
                    Ceremony Type
                  </Label>
                  <select
                    id="etype"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-9 rounded-md border border-[#E8DDD3] bg-white px-2.5 text-xs text-[#1C1917] outline-none"
                  >
                    <option value="MEHENDI">Mehendi</option>
                    <option value="SANGEET">Sangeet</option>
                    <option value="WEDDING">Wedding Ceremony</option>
                    <option value="RECEPTION">Reception</option>
                    <option value="OTHER">Other / Pooja</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edate" className="text-xs font-semibold text-[#78716C]">
                    Date *
                  </Label>
                  <Input
                    id="edate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    required
                    className="h-9 border-[#E8DDD3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="stime" className="text-xs font-semibold text-[#78716C]">
                    Start Time
                  </Label>
                  <Input
                    id="stime"
                    placeholder="e.g. 7:00 PM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="h-9 border-[#E8DDD3]"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="etime" className="text-xs font-semibold text-[#78716C]">
                    End Time
                  </Label>
                  <Input
                    id="etime"
                    placeholder="e.g. 11:30 PM"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="h-9 border-[#E8DDD3]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="evenue" className="text-xs font-semibold text-[#78716C]">
                  Venue / Banquet Hall
                </Label>
                <Input
                  id="evenue"
                  placeholder="e.g. Royal Crystal Ballroom, 2nd Floor"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="h-9 border-[#E8DDD3]"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenAddModal(false)}
                  className="border-[#E8DDD3]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#B91C6C] hover:bg-[#9D174D] text-white"
                >
                  {submitting ? "Adding..." : "Add Event"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-stone-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="border-[#E8DDD3] p-12 text-center bg-white">
          <CalendarHeart className="w-12 h-12 text-[#B91C6C] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1C1917]">No Sub-Events Configured</h3>
          <p className="text-xs text-[#78716C] mt-1 mb-4">
            Add your ceremonies like Mehendi, Sangeet, or Pheras so guests can RSVP to each.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((ev) => {
            const confirmedRsvps = ev.rsvps.filter((r) => r.status === "CONFIRMED");
            const totalParty = confirmedRsvps.reduce((sum, r) => sum + r.partySize, 0);
            const veg = confirmedRsvps.reduce((sum, r) => sum + r.vegCount, 0);
            const jain = confirmedRsvps.reduce((sum, r) => sum + r.jainCount, 0);
            const nonVeg = confirmedRsvps.reduce((sum, r) => sum + r.nonVegCount, 0);

            return (
              <Card
                key={ev.id}
                className="border-[#E8DDD3] bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-[#FCE7F3] text-[#B91C6C] border-0 text-[10px] font-bold">
                      {ev.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEventToDelete(ev)}
                      className="h-7 w-7 p-0 text-[#78716C] hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Sub-Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <h3 className="text-lg font-bold text-[#1C1917]">{ev.name}</h3>

                  <div className="space-y-1.5 mt-3 text-xs text-[#78716C]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#B91C6C]" />
                      <span>{formatDate(ev.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>
                        {ev.startTime || "TBD"} {ev.endTime && `- ${ev.endTime}`}
                      </span>
                    </div>
                    {ev.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate">{ev.venue}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Attendance Snapshot */}
                <div className="mt-5 pt-3 border-t border-[#E8DDD3] bg-[#FFFBF5] -mx-5 -mb-5 p-3.5 rounded-b-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-[#1C1917]">{totalParty} Plates Confirmed</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-semibold">
                    <span className="text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                      {veg} Veg
                    </span>
                    <span className="text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded">
                      {jain} Jain
                    </span>
                    {nonVeg > 0 && (
                      <span className="text-red-700 bg-red-100/60 px-1.5 py-0.5 rounded">
                        {nonVeg} Non-Veg
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Event Confirmation Dialog */}
      <Dialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <DialogContent className="max-w-md bg-white border-[#E8DDD3]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete Ceremony / Sub-Event?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#78716C] pt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-[#1C1917] font-bold">&quot;{eventToDelete?.name}&quot;</strong>?
              <br /><br />
              All RSVP responses and meal preferences for this specific event will also be permanently removed from both client and server. <strong>This action cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEventToDelete(null)}
              disabled={deleting}
              className="border-[#E8DDD3] cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              {deleting ? "Deleting..." : "Yes, Delete Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function EventsPage() {
  return (
    <React.Suspense fallback={<div className="h-64 w-full bg-stone-200 rounded-2xl animate-pulse" />}>
      <EventsPageInner />
    </React.Suspense>
  );
}
