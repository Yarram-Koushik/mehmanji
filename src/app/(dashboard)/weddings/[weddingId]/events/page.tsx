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
  Sparkles,
  Pencil,
} from "lucide-react";
import { formatDate, sortEventsChronologically } from "@/lib/utils";

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
  const sortedEvents = React.useMemo(() => sortEventsChronologically(events), [events]);
  const [loading, setLoading] = React.useState(true);
  const [openAddModal, setOpenAddModal] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [eventToDelete, setEventToDelete] = React.useState<SubEvent | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Edit event state
  const [eventToEdit, setEventToEdit] = React.useState<SubEvent | null>(null);
  const [editFormData, setEditFormData] = React.useState({
    name: "",
    type: "OTHER",
    eventDate: "",
    startTime: "",
    endTime: "",
    venue: "",
    address: "",
  });
  const [editing, setEditing] = React.useState(false);

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
        setEvents(sortEventsChronologically(data));
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
        toast({ title: "Ceremony Added! 🎊", description: `"${formData.name}" has been added.` });
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

  const handleOpenEdit = (ev: SubEvent) => {
    setEventToEdit(ev);
    const dateStr = ev.eventDate ? new Date(ev.eventDate).toISOString().split("T")[0] : "";
    setEditFormData({
      name: ev.name,
      type: ev.type,
      eventDate: dateStr,
      startTime: ev.startTime || "",
      endTime: ev.endTime || "",
      venue: ev.venue || "",
      address: ev.address || "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventToEdit) return;
    setEditing(true);

    try {
      const res = await fetch(`/api/weddings/${weddingId}/events/${eventToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        const updated = await res.json();
        toast({ title: "Ceremony Updated! 🎊", description: `"${editFormData.name}" updated successfully.` });
        setEvents((prev) =>
          sortEventsChronologically(
            prev.map((e) => (e.id === eventToEdit.id ? { ...e, ...updated, rsvps: e.rsvps } : e))
          )
        );
        setEventToEdit(null);
      } else {
        const err = await res.json();
        toast({ title: "Update Failed", description: err.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not update ceremony details", variant: "destructive" });
    } finally {
      setEditing(false);
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
        toast({ title: "Function Removed 🗑️", description: `"${eventToDelete.name}" has been removed from your wedding schedule.` });
        setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
        setEventToDelete(null);
      } else {
        const err = await res.json();
        toast({ title: "Failed to remove", description: err.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not remove function", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE5DF]">
        <div className="flex items-center gap-3">
          <Link href={`/weddings/${weddingId}`}>
            <Button variant="ghost" size="sm" className="p-2 h-auto text-[#6E6A63] hover:text-[#1F1E1C]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#FBF8F1] border border-[#C5A059]/30 text-[#C5A059] text-[11px] font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="w-3 h-3" />
              Ceremony Schedule
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1F1E1C]">
              Functions &amp; Ceremonies
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6A63] mt-0.5">
              Manage multi-day ceremonies: Mehendi, Sangeet, Haldi, Pheras &amp; Reception.
            </p>
          </div>
        </div>

        {/* Add Event Dialog */}
        <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
          <DialogTrigger asChild>
            <Button className="bg-[#C5A059] hover:bg-[#B08D47] text-white text-xs font-medium h-10 px-4 shadow-sm cursor-pointer">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Function
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white border-[#EAE5DF] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-bold text-[#1F1E1C]">
                Add Wedding Ceremony / Function
              </DialogTitle>
              <DialogDescription className="text-xs text-[#6E6A63] pt-1">
                Guests can choose whether they are attending this specific ceremony.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <Label htmlFor="ename" className="text-xs font-semibold text-[#6E6A63]">
                  Event Name *
                </Label>
                <Input
                  id="ename"
                  placeholder="e.g. Haldi Rasam or Cocktail Evening"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-10 border-[#EAE5DF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="etype" className="text-xs font-semibold text-[#6E6A63]">
                    Ceremony Type
                  </Label>
                  <select
                    id="etype"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-10 rounded-[10px] border border-[#EAE5DF] bg-white px-3 text-xs text-[#1F1E1C] outline-none focus:border-[#C5A059]"
                  >
                    <option value="MEHENDI">Mehendi</option>
                    <option value="SANGEET">Sangeet</option>
                    <option value="WEDDING">Wedding Ceremony</option>
                    <option value="RECEPTION">Reception</option>
                    <option value="OTHER">Other / Pooja</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edate" className="text-xs font-semibold text-[#6E6A63]">
                    Date *
                  </Label>
                  <Input
                    id="edate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    required
                    className="h-10 border-[#EAE5DF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="stime" className="text-xs font-semibold text-[#6E6A63]">
                    Start Time
                  </Label>
                  <Input
                    id="stime"
                    placeholder="e.g. 7:00 PM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="h-10 border-[#EAE5DF]"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="etime" className="text-xs font-semibold text-[#6E6A63]">
                    End Time
                  </Label>
                  <Input
                    id="etime"
                    placeholder="e.g. 11:30 PM"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="h-10 border-[#EAE5DF]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="evenue" className="text-xs font-semibold text-[#6E6A63]">
                  Venue / Banquet Hall
                </Label>
                <Input
                  id="evenue"
                  placeholder="e.g. Royal Crystal Ballroom, 2nd Floor"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="h-10 border-[#EAE5DF]"
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenAddModal(false)}
                  className="border-[#EAE5DF] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#C5A059] hover:bg-[#B08D47] text-white cursor-pointer"
                >
                  {submitting ? "Adding..." : "Add Event"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events Vertical Timeline */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-white rounded-2xl border border-[#EAE5DF] animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="border-[#EAE5DF] p-12 text-center bg-white">
          <CalendarHeart className="w-12 h-12 text-[#C5A059] mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#1F1E1C]">No Functions Configured</h3>
          <p className="text-xs text-[#6E6A63] mt-1 mb-4">
            Add ceremonies like Mehendi, Sangeet, or Pheras so guests can RSVP to each.
          </p>
        </Card>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-3.5 before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-[#C5A059] before:via-[#EAE5DF] before:to-[#7A8B74]">
          {sortedEvents.map((ev) => {
            const confirmedRsvps = ev.rsvps.filter((r) => r.status === "CONFIRMED");
            const totalParty = confirmedRsvps.reduce((sum, r) => sum + r.partySize, 0);
            const veg = confirmedRsvps.reduce((sum, r) => sum + r.vegCount, 0);
            const jain = confirmedRsvps.reduce((sum, r) => sum + r.jainCount, 0);
            const nonVeg = confirmedRsvps.reduce((sum, r) => sum + r.nonVegCount, 0);

            return (
              <div key={ev.id} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-6 sm:-left-8 top-6 w-5 h-5 rounded-full bg-white border-2 border-[#C5A059] shadow-sm flex items-center justify-center transition-transform group-hover:scale-110">
                  <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                </div>

                {/* Event Card */}
                <Card className="border-[#EAE5DF] bg-white p-6 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:border-[#C5A059]/50 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="default" className="text-[10px] font-semibold uppercase tracking-wider">
                          {ev.type}
                        </Badge>
                        <span className="text-xs font-semibold text-[#6E6A63] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#EAE5DF]">
                          {ev.startTime || "TBD"} {ev.endTime && `- ${ev.endTime}`}
                        </span>
                      </div>

                      <h3 className="font-serif text-2xl font-bold text-[#1F1E1C]">{ev.name}</h3>

                      <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-[#6E6A63]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span className="tabular-nums font-medium">{formatDate(ev.eventDate)}</span>
                        </span>
                        {ev.venue && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#7A8B74]" />
                            <span>{ev.venue}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons: Edit & Delete */}
                    <div className="self-start sm:self-auto flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(ev)}
                        className="h-8 px-2.5 text-xs font-medium text-[#1F1E1C] border-[#EAE5DF] hover:border-[#C5A059] hover:text-[#C5A059] transition-colors cursor-pointer"
                        title="Edit Ceremony Details / Timings"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1 text-[#C5A059]" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEventToDelete(ev)}
                        className="h-8 px-2.5 text-xs font-medium text-rose-600 border-rose-200 bg-rose-50/50 hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer"
                        title="Delete Sub-Event"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Attendance Snapshot */}
                  <div className="mt-5 pt-4 border-t border-[#EAE5DF] flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] -mx-6 -mb-6 p-4 rounded-b-2xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#7A8B74]" />
                      <span className="font-medium text-xs text-[#1F1E1C]">
                        <strong className="font-bold tabular-nums">{totalParty}</strong> Plates Confirmed
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#7A8B74] bg-[#F2F5F0] border border-[#7A8B74]/20 px-2 py-0.5 rounded-md font-medium tabular-nums">
                        {veg} Veg
                      </span>
                      <span className="text-[#C5A059] bg-[#FDF8EE] border border-[#C5A059]/20 px-2 py-0.5 rounded-md font-medium tabular-nums">
                        {jain} Jain
                      </span>
                      {nonVeg > 0 && (
                        <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md font-medium tabular-nums">
                          {nonVeg} Non-Veg
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Event Dialog */}
      <Dialog open={!!eventToEdit} onOpenChange={(open) => !open && setEventToEdit(null)}>
        <DialogContent className="max-w-md bg-white border-[#EAE5DF] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold text-[#1F1E1C] flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#C5A059]" />
              Edit Ceremony Details
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6E6A63] pt-1">
              Update timings, ceremony date, or venue location. Changes will reflect instantly on guest RSVP links.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <Label htmlFor="edit-ename" className="text-xs font-semibold text-[#6E6A63]">
                Ceremony / Function Name *
              </Label>
              <Input
                id="edit-ename"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
                className="h-10 border-[#EAE5DF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-etype" className="text-xs font-semibold text-[#6E6A63]">
                  Ceremony Type
                </Label>
                <select
                  id="edit-etype"
                  value={editFormData.type}
                  onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                  className="w-full h-10 rounded-[10px] border border-[#EAE5DF] bg-white px-3 text-xs text-[#1F1E1C] outline-none focus:border-[#C5A059]"
                >
                  <option value="MEHENDI">Mehendi</option>
                  <option value="SANGEET">Sangeet</option>
                  <option value="WEDDING">Wedding Ceremony</option>
                  <option value="RECEPTION">Reception</option>
                  <option value="OTHER">Other / Pooja</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-edate" className="text-xs font-semibold text-[#6E6A63]">
                  Date *
                </Label>
                <Input
                  id="edit-edate"
                  type="date"
                  value={editFormData.eventDate}
                  onChange={(e) => setEditFormData({ ...editFormData, eventDate: e.target.value })}
                  required
                  className="h-10 border-[#EAE5DF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-stime" className="text-xs font-semibold text-[#6E6A63]">
                  Start Time
                </Label>
                <Input
                  id="edit-stime"
                  placeholder="e.g. 7:00 PM"
                  value={editFormData.startTime}
                  onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                  className="h-10 border-[#EAE5DF]"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-etime" className="text-xs font-semibold text-[#6E6A63]">
                  End Time
                </Label>
                <Input
                  id="edit-etime"
                  placeholder="e.g. 11:30 PM"
                  value={editFormData.endTime}
                  onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                  className="h-10 border-[#EAE5DF]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-evenue" className="text-xs font-semibold text-[#6E6A63]">
                Venue / Banquet Hall
              </Label>
              <Input
                id="edit-evenue"
                placeholder="e.g. Royal Crystal Ballroom, 2nd Floor"
                value={editFormData.venue}
                onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })}
                className="h-10 border-[#EAE5DF]"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEventToEdit(null)}
                disabled={editing}
                className="border-[#EAE5DF] cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editing}
                className="bg-[#C5A059] hover:bg-[#B08D47] text-white cursor-pointer"
              >
                {editing ? "Saving Changes..." : "Save Ceremony Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Event Confirmation Dialog */}
      <Dialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <DialogContent className="max-w-md bg-white border-[#EAE5DF] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-rose-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              Remove Function / Ceremony?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6E6A63] pt-2 leading-relaxed">
              Are you sure you want to remove <strong className="text-[#1F1E1C] font-semibold">&quot;{eventToDelete?.name}&quot;</strong>?
              <br /><br />
              All guest attendance confirmations and meal preferences for this specific function will also be deleted. <strong className="text-rose-600">This action cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEventToDelete(null)}
              disabled={deleting}
              className="border-[#EAE5DF] cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
            >
              {deleting ? "Removing..." : "Yes, Remove Function"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function EventsPage() {
  return (
    <React.Suspense fallback={<div className="h-64 w-full bg-white rounded-2xl border border-[#EAE5DF] animate-pulse" />}>
      <EventsPageInner />
    </React.Suspense>
  );
}
