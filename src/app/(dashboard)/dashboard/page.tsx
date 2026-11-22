"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Users,
  CheckCircle2,
  Clock,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Plus,
  UtensilsCrossed,
  CalendarHeart,
  MessageCircle,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface WeddingItem {
  id: string;
  familyName: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  city: string;
  _count: {
    guests: number;
    events: number;
  };
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [weddings, setWeddings] = React.useState<WeddingItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [weddingToDelete, setWeddingToDelete] = React.useState<WeddingItem | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [stats, setStats] = React.useState({
    totalWeddings: 0,
    totalGuests: 0,
    totalConfirmed: 0,
    totalPending: 0,
    estimatedSavings: 0,
  });

  const handleDeleteWedding = async () => {
    if (!weddingToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/weddings/${weddingToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({
          title: "Wedding Deleted",
          description: `"${weddingToDelete.familyName}" has been removed from both client and server.`,
        });
        const remaining = weddings.filter((w) => w.id !== weddingToDelete.id);
        setWeddings(remaining);
        setWeddingToDelete(null);
        if (remaining.length === 0) {
          setStats({
            totalWeddings: 0,
            totalGuests: 0,
            totalConfirmed: 0,
            totalPending: 0,
            estimatedSavings: 0,
          });
        }
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
    async function loadData() {
      try {
        const res = await fetch("/api/weddings");
        if (res.ok) {
          const data: WeddingItem[] = await res.json();
          setWeddings(data);

          // If we have a wedding, fetch detailed stats for the first one
          if (data.length > 0) {
            const detailRes = await fetch(`/api/weddings/${data[0].id}`);
            if (detailRes.ok) {
              const detail = await detailRes.json();
              const s = detail.stats || {};
              // ₹1,800 saved per unconfirmed/declined plate that wasn't blindly prepared
              const nonShowCount = s.totalDeclined + Math.round((s.totalPending || 0) * 0.4);
              setStats({
                totalWeddings: data.length,
                totalGuests: s.totalGuests || 0,
                totalConfirmed: s.totalConfirmed || 0,
                totalPending: s.totalPending || 0,
                estimatedSavings: nonShowCount * 1800,
              });
            }
          }
        }
      } catch (e) {
        console.error("Dashboard error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-stone-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-stone-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DDD3]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1C1917]">
            Guest Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            Real-time RSVP headcount, catering calculations, and WhatsApp coordination.
          </p>
        </div>
        <Link href="/weddings">
          <Button className="bg-[#B91C6C] hover:bg-[#9D174D] text-white shadow-sm font-semibold text-xs sm:text-sm cursor-pointer">
            <Plus className="w-4 h-4 mr-1.5" />
            Create New Wedding
          </Button>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Guests */}
        <Card className="border-[#E8DDD3] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
              Total Guests Invited
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-pink-100 text-[#B91C6C] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#1C1917]">{stats.totalGuests}</div>
            <p className="text-[11px] text-[#78716C] mt-1">
              Across all registered events
            </p>
          </CardContent>
        </Card>

        {/* Confirmed Headcount */}
        <Card className="border-[#E8DDD3] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
              Confirmed Coming
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600">{stats.totalConfirmed}</div>
            <p className="text-[11px] text-[#78716C] mt-1">
              Attending the primary wedding event
            </p>
          </CardContent>
        </Card>

        {/* Pending RSVPs */}
        <Card className="border-[#E8DDD3] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
              Pending / Unconfirmed
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#D97706] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#D97706]">{stats.totalPending}</div>
            <p className="text-[11px] text-[#78716C] mt-1">
              Awaiting WhatsApp confirmation
            </p>
          </CardContent>
        </Card>

        {/* Estimated Catering Waste Prevented */}
        <Card className="border-[#B91C6C]/30 bg-gradient-to-br from-[#FFFBF5] to-[#FCE7F3]/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#B91C6C]">
              Catering Saved
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[#B91C6C] text-white flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#B91C6C]">
              ₹{stats.estimatedSavings.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-[#78716C] mt-1">
              Saved by avoiding phantom catering plates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wedding List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1C1917]">Your Weddings</h2>
          <span className="text-xs text-[#78716C]">
            {weddings.length} Active {weddings.length === 1 ? "Wedding" : "Weddings"}
          </span>
        </div>

        {weddings.length === 0 ? (
          <Card className="border-[#E8DDD3] p-12 text-center bg-white">
            <div className="w-16 h-16 rounded-2xl bg-[#FCE7F3] text-[#B91C6C] flex items-center justify-center mx-auto mb-4">
              <CalendarHeart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#1C1917]">No Weddings Yet</h3>
            <p className="text-sm text-[#78716C] max-w-sm mx-auto mt-2">
              Create your first wedding to start adding guests and sending WhatsApp RSVPs.
            </p>
            <Link href="/weddings" className="inline-block mt-6">
              <Button className="bg-[#B91C6C] hover:bg-[#9D174D] text-white">
                Create Wedding Now
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {weddings.map((w) => (
              <Card
                key={w.id}
                className="border-[#E8DDD3] hover:border-[#B91C6C]/40 bg-white transition-all shadow-sm hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="bg-[#FCE7F3] text-[#B91C6C] border-0 text-[10px] font-bold uppercase tracking-wider mb-2">
                        {w.city}
                      </Badge>
                      <CardTitle className="text-xl font-bold text-[#1C1917]">
                        {w.familyName}
                      </CardTitle>
                      <CardDescription className="text-xs text-[#78716C] mt-1">
                        {w.brideName} &amp; {w.groomName}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-xs font-semibold text-[#78716C] block">
                          Date
                        </span>
                        <span className="text-xs font-bold text-[#1C1917]">
                          {formatDate(w.weddingDate)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setWeddingToDelete(w)}
                        className="h-8 w-8 p-0 text-[#78716C] hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                        title="Delete Wedding"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="p-3 bg-[#FFFBF5] rounded-xl border border-[#E8DDD3] grid grid-cols-2 gap-2 text-center">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#78716C] block">
                        Invited Guests
                      </span>
                      <span className="text-lg font-black text-[#1C1917]">
                        {w._count.guests}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#78716C] block">
                        Sub-Events
                      </span>
                      <span className="text-lg font-black text-[#D97706]">
                        {w._count.events}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#78716C] truncate">
                    📍 <strong>Venue:</strong> {w.venue}
                  </p>

                  {/* Action Shortcuts */}
                  <div className="pt-2 border-t border-[#E8DDD3] grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Link href={`/weddings/${w.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-[11px] font-semibold border-[#E8DDD3] cursor-pointer">
                        Overview
                      </Button>
                    </Link>
                    <Link href={`/weddings/${w.id}/guests`}>
                      <Button variant="outline" size="sm" className="w-full text-[11px] font-semibold text-[#B91C6C] border-[#B91C6C]/30 bg-[#FCE7F3]/40 cursor-pointer">
                        <Users className="w-3.5 h-3.5 mr-1" />
                        Guests
                      </Button>
                    </Link>
                    <Link href={`/weddings/${w.id}/events`}>
                      <Button variant="outline" size="sm" className="w-full text-[11px] font-semibold text-[#D97706] border-[#D97706]/30 bg-[#FEF3C7]/40 cursor-pointer">
                        <CalendarHeart className="w-3.5 h-3.5 mr-1" />
                        Events
                      </Button>
                    </Link>
                    <Link href={`/weddings/${w.id}/reports`}>
                      <Button variant="outline" size="sm" className="w-full text-[11px] font-semibold text-emerald-700 border-emerald-300 bg-emerald-50 cursor-pointer">
                        <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                        Catering
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!weddingToDelete} onOpenChange={(open) => !open && setWeddingToDelete(null)}>
        <DialogContent className="max-w-md bg-white border-[#E8DDD3]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete Wedding Celebration?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#78716C] pt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-[#1C1917] font-bold">&quot;{weddingToDelete?.familyName}&quot;</strong>?
              <br /><br />
              This will permanently delete the wedding and all of its associated sub-events, guests, RSVPs, and catering reports from both client and server. <strong>This action cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setWeddingToDelete(null)}
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
