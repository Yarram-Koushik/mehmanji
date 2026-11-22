"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { formatDate } from "@/lib/utils";

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

  const handleDeleteWedding = async () => {
    if (!wedding) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/weddings/${weddingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({
          title: "Wedding Deleted",
          description: `"${wedding.familyName}" has been completely removed from both client and server.`,
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
        <Skeleton className="h-28 w-full rounded-2xl" />
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
        <h2 className="text-xl font-bold">Wedding not found</h2>
        <Link href="/weddings">
          <Button className="mt-4">Back to Weddings</Button>
        </Link>
      </div>
    );
  }

  const sampleGuestToken = wedding.guests[0]?.token || "";

  return (
    <div className="space-y-8">
      {/* Wedding Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#B91C6C] via-[#9D174D] to-[#D97706] text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wedding Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {wedding.familyName}
            </h1>
            <p className="text-sm sm:text-base text-white/90 mt-1">
              Celebrating {wedding.brideName} &amp; {wedding.groomName}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs sm:text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(wedding.weddingDate)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {wedding.venue}, {wedding.city}
              </span>
            </div>
          </div>

          {/* Quick Sub-navigation Buttons */}
          <div className="flex flex-wrap gap-2.5">
            <Link href={`/weddings/${weddingId}/guests`}>
              <Button className="bg-white text-[#B91C6C] hover:bg-white/90 font-bold text-xs h-10 shadow-sm cursor-pointer">
                <Users className="w-4 h-4 mr-1.5" />
                Manage Guests ({wedding.stats?.totalGuests || 0})
              </Button>
            </Link>
            <Link href={`/weddings/${weddingId}/events`}>
              <Button variant="outline" className="border-white text-white hover:bg-white/10 font-semibold text-xs h-10 cursor-pointer">
                <CalendarHeart className="w-4 h-4 mr-1.5" />
                Sub-Events ({wedding.events.length})
              </Button>
            </Link>
            <Link href={`/weddings/${weddingId}/reports`}>
              <Button variant="outline" className="border-white text-white hover:bg-white/10 font-semibold text-xs h-10 cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                Catering Sheet
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteModal(true)}
              className="border-red-300/60 bg-red-950/20 text-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 font-semibold text-xs h-10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete Wedding
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Confirmed */}
        <Card className="border-[#E8DDD3] bg-white shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#78716C] flex items-center justify-between">
              <span>Confirmed RSVP</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600">
              {wedding.stats?.totalConfirmed || 0}
            </div>
            <p className="text-[11px] text-[#78716C] mt-1">
              Total {wedding.stats?.totalPartySize || 0} plates needed
            </p>
          </CardContent>
        </Card>

        {/* Pending Headcount */}
        <Card className="border-[#E8DDD3] bg-white shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#78716C] flex items-center justify-between">
              <span>Pending RSVP</span>
              <Clock className="w-4 h-4 text-[#D97706]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#D97706]">
              {wedding.stats?.totalPending || 0}
            </div>
            <p className="text-[11px] text-[#78716C] mt-1">
              Need WhatsApp nudge
            </p>
          </CardContent>
        </Card>

        {/* Declined */}
        <Card className="border-[#E8DDD3] bg-white shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#78716C] flex items-center justify-between">
              <span>Declined</span>
              <XCircle className="w-4 h-4 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-red-600">
              {wedding.stats?.totalDeclined || 0}
            </div>
            <p className="text-[11px] text-[#78716C] mt-1">
              Confirmed not attending
            </p>
          </CardContent>
        </Card>

        {/* Maybe / Tentative */}
        <Card className="border-[#E8DDD3] bg-white shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#78716C] flex items-center justify-between">
              <span>Tentative (Maybe)</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-blue-600">
              {wedding.stats?.totalMaybe || 0}
            </div>
            <p className="text-[11px] text-[#78716C] mt-1">
              Checking schedules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dietary Breakdown Bar */}
      <Card className="border-[#E8DDD3] bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#1C1917] flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-[#B91C6C]" />
                Food Preferences (Confirmed Guests)
              </CardTitle>
              <CardDescription className="text-xs text-[#78716C]">
                Real dietary counts for the Maharaj &amp; banquet chefs.
              </CardDescription>
            </div>
            <Link href={`/weddings/${weddingId}/reports`}>
              <Button variant="ghost" size="sm" className="text-xs text-[#B91C6C] font-semibold">
                Full Report &rarr;
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                Vegetarian
              </span>
              <span className="text-2xl font-black text-emerald-700">
                {wedding.stats?.vegCount || 0}
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">Regular Veg</span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                Pure Jain
              </span>
              <span className="text-2xl font-black text-amber-700">
                {wedding.stats?.jainCount || 0}
              </span>
              <span className="text-[10px] text-amber-600 block mt-0.5">No Onion / Garlic</span>
            </div>

            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 block">
                Non-Vegetarian
              </span>
              <span className="text-2xl font-black text-red-700">
                {wedding.stats?.nonVegCount || 0}
              </span>
              <span className="text-[10px] text-red-600 block mt-0.5">Chicken / Mutton</span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">
                Vegan / Special
              </span>
              <span className="text-2xl font-black text-purple-700">
                {wedding.stats?.veganCount || 0}
              </span>
              <span className="text-[10px] text-purple-600 block mt-0.5">Dairy-free / Allergies</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-Events List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1C1917]">Scheduled Sub-Events</h2>
          <Link href={`/weddings/${weddingId}/events`}>
            <Button variant="outline" size="sm" className="text-xs font-semibold border-[#E8DDD3]">
              Manage Events
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wedding.events.map((event) => (
            <Card key={event.id} className="border-[#E8DDD3] bg-white p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-[#FFFBF5] text-[#D97706] border border-[#E8DDD3] text-[10px] font-bold">
                    {event.type}
                  </Badge>
                  <span className="text-xs font-semibold text-[#78716C]">
                    {event.startTime || "TBD"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1C1917]">{event.name}</h3>
                <p className="text-xs text-[#78716C] mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#B91C6C]" />
                  {event.venue || wedding.venue}
                </p>
                <p className="text-xs text-[#78716C] mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
                  {formatDate(event.eventDate)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E8DDD3] flex items-center justify-between">
                <span className="text-xs text-[#78716C]">Tracked in RSVP form</span>
                <Link href={`/weddings/${weddingId}/guests`}>
                  <Button variant="ghost" size="sm" className="text-xs font-semibold text-[#B91C6C] p-0 h-auto">
                    View Guests &rarr;
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Guest Invitation Link Test Banner */}
      {sampleGuestToken && (
        <Card className="border-[#B91C6C]/30 bg-gradient-to-r from-[#FFFBF5] to-[#FCE7F3]/40 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#B91C6C] uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Test Guest Experience</span>
              </div>
              <h3 className="text-base font-bold text-[#1C1917]">
                Experience the WhatsApp RSVP Flow as a Guest
              </h3>
              <p className="text-xs text-[#78716C] mt-1">
                Open a live sample invitation link in a new tab to see exactly what your guests experience.
              </p>
            </div>
            <a
              href={`/rsvp/${sampleGuestToken}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-[#B91C6C] hover:bg-[#9D174D] text-white text-xs font-semibold whitespace-nowrap cursor-pointer">
                Open Guest RSVP Page
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </a>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent className="max-w-md bg-white border-[#E8DDD3]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete Entire Wedding Celebration?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#78716C] pt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-[#1C1917] font-bold">&quot;{wedding.familyName}&quot;</strong>?
              <br /><br />
              This will permanently delete the wedding celebration and all of its associated sub-events, guests, RSVPs, dietary records, and catering reports from both client and server. <strong>This action cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenDeleteModal(false)}
              disabled={deleting}
              className="border-[#E8DDD3] cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteWedding}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              {deleting ? "Deleting..." : "Yes, Delete Wedding"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function WeddingOverviewPage() {
  return (
    <React.Suspense fallback={<div className="h-48 w-full bg-stone-200 rounded-2xl animate-pulse" />}>
      <WeddingOverviewInner />
    </React.Suspense>
  );
}
