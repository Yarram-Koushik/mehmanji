"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  CalendarHeart,
  FileSpreadsheet,
  MapPin,
  Calendar,
  UtensilsCrossed,
  Copy,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Trash2,
  ChefHat,
  Leaf,
  Pencil,
} from "lucide-react";
import { formatDate, sortEventsChronologically } from "@/lib/utils";

interface WeddingDetail {
  id: string;
  familyName: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  city: string;
  themeColor: string;
  events: Array<{
    id: string;
    name: string;
    type: string;
    eventDate: string;
    startTime: string;
    venue: string;
  }>;
  guests: Array<{
    id: string;
    name: string;
    phone: string;
    token: string;
    rsvps: Array<{
      status: string;
      partySize: number;
    }>;
  }>;
  stats: {
    totalGuests: number;
    totalConfirmed: number;
    totalDeclined: number;
    totalMaybe: number;
    totalPending: number;
    totalPartySize: number;
    vegCount: number;
    nonVegCount: number;
    jainCount: number;
    veganCount: number;
  };
}

function WeddingOverviewInner() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const weddingId = params?.weddingId as string;

  const [wedding, setWedding] = React.useState<WeddingDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  // Edit Wedding Modal State
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState({
    brideName: "",
    groomName: "",
    familyName: "",
    weddingDate: "",
    venue: "",
    city: "",
  });

  const handleDeleteWedding = async () => {
    if (!wedding) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/weddings/${weddingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({
          title: "Wedding Removed 🗑️",
          description: `"${wedding.familyName}" and all guest responses have been completely removed.`,
        });
        router.push("/weddings");
      } else {
        const err = await res.json();
        toast({ title: "Failed to delete", description: err.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not delete wedding", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenEdit = () => {
    if (!wedding) return;
    const dateStr = wedding.weddingDate
      ? new Date(wedding.weddingDate).toISOString().split("T")[0]
      : "";
    setEditFormData({
      brideName: wedding.brideName,
      groomName: wedding.groomName,
      familyName: wedding.familyName,
      weddingDate: dateStr,
      venue: wedding.venue,
      city: wedding.city,
    });
    setOpenEditModal(true);
  };

  const handleUpdateWedding = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(true);

    try {
      const res = await fetch(`/api/weddings/${weddingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        const updated = await res.json();
        toast({
          title: "Wedding Details Updated! 🎊",
          description: `"${editFormData.familyName}" details have been updated.`,
        });
        setWedding((prev) => (prev ? { ...prev, ...updated } : null));
        setOpenEditModal(false);
      } else {
        const err = await res.json();
        toast({ title: "Update Failed", description: err.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not update wedding details", variant: "destructive" });
    } finally {
      setEditing(false);
    }
  };

  React.useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/weddings/${weddingId}`);
        if (res.ok) {
          const data = await res.json();
          setWedding(data);
        } else {
          toast({ title: "Failed to load wedding", variant: "destructive" });
        }
      } catch {
        toast({ title: "Error fetching wedding details", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    if (weddingId) fetchDetail();
  }, [weddingId, toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="text-center py-16">
        <h2 className="font-serif text-2xl font-bold text-[#1F1E1C]">Wedding not found</h2>
        <Link href="/weddings">
          <Button className="mt-4">Back to Weddings</Button>
        </Link>
      </div>
    );
  }

  const sampleGuestToken = wedding.guests[0]?.token || "";

  return (
    <div className="space-y-8">
      {/* Wedding Header Card: Editorial Deep Forest Banner */}
      <div className="p-7 sm:p-9 rounded-2xl bg-[#1F2E23] border border-[#C5A059]/30 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#C5A059]/10 blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C5A059] border border-[#C5A059]/30 text-xs font-semibold backdrop-blur-sm mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wedding Celebration Hub</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
              {wedding.familyName}
            </h1>
            <p className="text-sm sm:text-base text-stone-300 mt-1.5 font-normal">
              Celebrating <strong className="text-white font-medium">{wedding.brideName}</strong> &amp; <strong className="text-white font-medium">{wedding.groomName}</strong>
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs sm:text-sm text-stone-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#C5A059]" />
                <span className="tabular-nums">{formatDate(wedding.weddingDate)}</span>
              </span>
              <span className="text-stone-500">•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C5A059]" />
                {wedding.venue}, {wedding.city}
              </span>
            </div>
          </div>

          {/* Quick Sub-navigation Buttons */}
          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="outline"
              onClick={handleOpenEdit}
              className="border-stone-600 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 font-medium text-xs h-10 cursor-pointer"
            >
              <Pencil className="w-4 h-4 mr-1.5 text-[#C5A059]" />
              Edit Wedding
            </Button>
            <Link href={`/weddings/${weddingId}/guests`}>
              <Button className="bg-[#C5A059] hover:bg-[#B08D47] text-white font-medium text-xs h-10 shadow-sm cursor-pointer">
                <Users className="w-4 h-4 mr-1.5" />
                Guest List ({wedding.stats?.totalGuests || 0})
              </Button>
            </Link>
            <Link href={`/weddings/${weddingId}/events`}>
              <Button variant="outline" className="border-stone-600 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 font-medium text-xs h-10 cursor-pointer">
                <CalendarHeart className="w-4 h-4 mr-1.5 text-[#C5A059]" />
                Functions ({wedding.events.length})
              </Button>
            </Link>
            <Link href={`/weddings/${weddingId}/reports`}>
              <Button variant="outline" className="border-stone-600 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 font-medium text-xs h-10 cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 mr-1.5 text-[#7A8B74]" />
                Halwai Catering Sheet
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteModal(true)}
              className="border-rose-900/50 bg-rose-950/30 text-rose-200 hover:bg-rose-700 hover:text-white font-medium text-xs h-10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Remove
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Summary Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Confirmed */}
        <Card className="border-[#EAE5DF] bg-white shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:border-[#7A8B74]/50 transition-colors">
          <CardHeader className="pb-1 p-5">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] flex items-center justify-between">
              <span>Confirmed Coming</span>
              <CheckCircle2 className="w-4 h-4 text-[#7A8B74]" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="font-serif text-3xl font-bold text-[#7A8B74] tabular-nums">
              {wedding.stats?.totalConfirmed || 0}
            </div>
            <p className="text-[11px] text-[#6E6A63] mt-1 tabular-nums">
              Total {wedding.stats?.totalPartySize || 0} plates needed
            </p>
          </CardContent>
        </Card>

        {/* Pending Headcount */}
        <Card className="border-[#EAE5DF] bg-white shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:border-[#C5A059]/50 transition-colors">
          <CardHeader className="pb-1 p-5">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] flex items-center justify-between">
              <span>Awaiting Response</span>
              <Clock className="w-4 h-4 text-[#C5A059]" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="font-serif text-3xl font-bold text-[#C5A059] tabular-nums">
              {wedding.stats?.totalPending || 0}
            </div>
            <p className="text-[11px] text-[#6E6A63] mt-1">
              Need WhatsApp reminder
            </p>
          </CardContent>
        </Card>

        {/* Declined */}
        <Card className="border-[#EAE5DF] bg-white shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:border-rose-300 transition-colors">
          <CardHeader className="pb-1 p-5">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] flex items-center justify-between">
              <span>Cannot Attend</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="font-serif text-3xl font-bold text-rose-600 tabular-nums">
              {wedding.stats?.totalDeclined || 0}
            </div>
            <p className="text-[11px] text-[#6E6A63] mt-1">
              Confirmed not attending
            </p>
          </CardContent>
        </Card>

        {/* Maybe / Tentative */}
        <Card className="border-[#EAE5DF] bg-white shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:border-amber-300 transition-colors">
          <CardHeader className="pb-1 p-5">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63] flex items-center justify-between">
              <span>Tentative (Maybe)</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="font-serif text-3xl font-bold text-amber-600 tabular-nums">
              {wedding.stats?.totalMaybe || 0}
            </div>
            <p className="text-[11px] text-[#6E6A63] mt-1">
              Checking family schedules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dietary Breakdown Bar */}
      <Card className="border-[#EAE5DF] bg-white shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)]">
        <CardHeader className="pb-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-xl font-bold text-[#1F1E1C] flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-[#C5A059]" />
                Food Preferences (Confirmed Guests)
              </CardTitle>
              <CardDescription className="text-xs text-[#6E6A63] mt-0.5">
                Real dietary counts for the Maharaj &amp; banquet chefs.
              </CardDescription>
            </div>
            <Link href={`/weddings/${weddingId}/reports`}>
              <Button variant="ghost" size="sm" className="text-xs text-[#C5A059] font-medium hover:text-[#B08D47]">
                Full Report &rarr;
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-[#F2F5F0] border border-[#7A8B74]/20">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7A8B74] block">
                Vegetarian
              </span>
              <span className="font-serif text-2xl font-bold text-[#7A8B74] tabular-nums">
                {wedding.stats?.vegCount || 0}
              </span>
              <span className="text-[10px] text-[#6E6A63] block mt-0.5">Standard Veg Plates</span>
            </div>

            <div className="p-4 rounded-xl bg-[#FDF8EE] border border-[#C5A059]/20">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C5A059] block">
                Pure Jain
              </span>
              <span className="font-serif text-2xl font-bold text-[#C5A059] tabular-nums">
                {wedding.stats?.jainCount || 0}
              </span>
              <span className="text-[10px] text-[#6E6A63] block mt-0.5">No Onion / Garlic</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-700 block">
                Non-Vegetarian
              </span>
              <span className="font-serif text-2xl font-bold text-rose-700 tabular-nums">
                {wedding.stats?.nonVegCount || 0}
              </span>
              <span className="text-[10px] text-[#6E6A63] block mt-0.5">Chicken / Mutton</span>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DF]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6A63] block">
                Vegan / Special
              </span>
              <span className="font-serif text-2xl font-bold text-[#1F1E1C] tabular-nums">
                {wedding.stats?.veganCount || 0}
              </span>
              <span className="text-[10px] text-[#6E6A63] block mt-0.5">Dairy-free / Allergies</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Functions & Ceremonies List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1F1E1C]">Scheduled Functions &amp; Ceremonies</h2>
            <p className="text-xs text-[#6E6A63]">Multi-day ceremonies configured for this wedding</p>
          </div>
          <Link href={`/weddings/${weddingId}/events`}>
            <Button variant="outline" size="sm" className="text-xs font-medium border-[#EAE5DF] cursor-pointer">
              Manage Functions
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortEventsChronologically(wedding.events).map((event) => (
            <Card key={event.id} className="border-[#EAE5DF] bg-white p-5 flex flex-col justify-between hover:border-[#C5A059]/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider">
                    {event.type}
                  </Badge>
                  <span className="text-xs font-medium text-[#6E6A63]">
                    {event.startTime || "TBD"}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1F1E1C]">{event.name}</h3>
                <p className="text-xs text-[#6E6A63] mt-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                  {event.venue || wedding.venue}
                </p>
                <p className="text-xs text-[#6E6A63] mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#7A8B74]" />
                  <span className="tabular-nums">{formatDate(event.eventDate)}</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAE5DF] flex items-center justify-between">
                <span className="text-xs text-[#6E6A63]">Tracked in WhatsApp invite</span>
                <Link href={`/weddings/${weddingId}/guests`}>
                  <Button variant="ghost" size="sm" className="text-xs font-medium text-[#C5A059] hover:text-[#B08D47] p-0 h-auto">
                    View Guest List &rarr;
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Guest Invitation Link Test Banner */}
      {sampleGuestToken && (
        <Card className="border-[#C5A059]/40 bg-gradient-to-r from-white via-[#FBF8F1] to-white p-6 rounded-2xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#C5A059] uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Test Guest Experience</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1F1E1C]">
                Experience the WhatsApp Invitation as a Guest
              </h3>
              <p className="text-xs text-[#6E6A63] mt-1">
                Open a sample invite link in a new tab to see what your family &amp; guests see when they confirm.
              </p>
            </div>
            <a
              href={`/rsvp/${sampleGuestToken}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-[#1F2E23] hover:bg-[#152018] text-white text-xs font-medium whitespace-nowrap cursor-pointer">
                Open Sample Guest Invite
                <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-[#C5A059]" />
              </Button>
            </a>
          </div>
        </Card>
      )}

      {/* Edit Wedding Modal Dialog */}
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent className="max-w-md bg-white border-[#EAE5DF] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold text-[#1F1E1C] flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#C5A059]" />
              Edit Wedding Details
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6E6A63] pt-1">
              Correct names, wedding date, city, or venue. Changes reflect immediately across all invites and catering sheets.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateWedding} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-bride" className="text-xs font-semibold text-[#6E6A63]">
                  Bride&apos;s Name
                </Label>
                <Input
                  id="edit-bride"
                  value={editFormData.brideName}
                  onChange={(e) => setEditFormData({ ...editFormData, brideName: e.target.value })}
                  required
                  className="h-10 border-[#EAE5DF]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-groom" className="text-xs font-semibold text-[#6E6A63]">
                  Groom&apos;s Name
                </Label>
                <Input
                  id="edit-groom"
                  value={editFormData.groomName}
                  onChange={(e) => setEditFormData({ ...editFormData, groomName: e.target.value })}
                  required
                  className="h-10 border-[#EAE5DF]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-family" className="text-xs font-semibold text-[#6E6A63]">
                Wedding Title / Family Name
              </Label>
              <Input
                id="edit-family"
                value={editFormData.familyName}
                onChange={(e) => setEditFormData({ ...editFormData, familyName: e.target.value })}
                required
                className="h-10 border-[#EAE5DF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-date" className="text-xs font-semibold text-[#6E6A63]">
                  Main Wedding Date
                </Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editFormData.weddingDate}
                  onChange={(e) => setEditFormData({ ...editFormData, weddingDate: e.target.value })}
                  required
                  className="h-10 border-[#EAE5DF]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-city" className="text-xs font-semibold text-[#6E6A63]">
                  City
                </Label>
                <Input
                  id="edit-city"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                  required
                  className="h-10 border-[#EAE5DF]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-venue" className="text-xs font-semibold text-[#6E6A63]">
                Main Venue Name
              </Label>
              <Input
                id="edit-venue"
                value={editFormData.venue}
                onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })}
                required
                className="h-10 border-[#EAE5DF]"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenEditModal(false)}
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
                {editing ? "Saving..." : "Save Wedding Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent className="max-w-md bg-white border-[#EAE5DF] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-rose-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              Remove Entire Wedding Celebration?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6E6A63] pt-2 leading-relaxed">
              Are you sure you want to remove <strong className="text-[#1F1E1C] font-semibold">&quot;{wedding.familyName}&quot;</strong>?
              <br /><br />
              This will remove this wedding celebration, all its functions (Mehendi, Sangeet, etc.), guest lists, and Halwai catering sheets. <strong className="text-rose-600">This action cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenDeleteModal(false)}
              disabled={deleting}
              className="border-[#EAE5DF] cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteWedding}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
            >
              {deleting ? "Removing..." : "Yes, Remove Wedding"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function WeddingOverviewPage() {
  return (
    <React.Suspense fallback={<div className="h-48 w-full bg-white rounded-2xl border border-[#EAE5DF] animate-pulse" />}>
      <WeddingOverviewInner />
    </React.Suspense>
  );
}
