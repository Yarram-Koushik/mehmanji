"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Pencil,
  MapPin,
  Calendar,
  Hourglass,
  ChefHat,
  Leaf,
  Drum,
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

interface WeddingDetailData {
  stats?: {
    totalGuests: number;
    totalConfirmed: number;
    totalDeclined: number;
    totalMaybe: number;
    totalPending: number;
    vegCount: number;
    nonVegCount: number;
    jainCount: number;
    veganCount: number;
  };
  events?: Array<{
    id: string;
    name: string;
    type: string;
    eventDate: string;
    startTime: string;
    venue: string;
  }>;
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [weddings, setWeddings] = React.useState<WeddingItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [weddingToDelete, setWeddingToDelete] = React.useState<WeddingItem | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [firstWeddingDetail, setFirstWeddingDetail] = React.useState<WeddingDetailData | null>(null);
  const [stats, setStats] = React.useState({
    totalWeddings: 0,
    totalGuests: 0,
    totalConfirmed: 0,
    totalPending: 0,
    totalDeclined: 0,
    estimatedSavings: 0,
    vegCount: 0,
    nonVegCount: 0,
    jainCount: 0,
  });

  // Edit Wedding State
  const [weddingToEdit, setWeddingToEdit] = React.useState<WeddingItem | null>(null);
  const [editFormData, setEditFormData] = React.useState({
    brideName: "",
    groomName: "",
    familyName: "",
    weddingDate: "",
    venue: "",
    city: "",
  });
  const [editing, setEditing] = React.useState(false);

  const handleOpenEdit = (w: WeddingItem) => {
    setWeddingToEdit(w);
    const dateStr = w.weddingDate ? new Date(w.weddingDate).toISOString().split("T")[0] : "";
    setEditFormData({
      brideName: w.brideName,
      groomName: w.groomName,
      familyName: w.familyName,
      weddingDate: dateStr,
      venue: w.venue,
      city: w.city,
    });
  };

  const handleUpdateWedding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingToEdit) return;
    setEditing(true);

    try {
      const res = await fetch(`/api/weddings/${weddingToEdit.id}`, {
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
        setWeddings((prev) =>
          prev.map((item) => (item.id === weddingToEdit.id ? { ...item, ...updated } : item))
        );
        setWeddingToEdit(null);
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

  const handleDeleteWedding = async () => {
    if (!weddingToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/weddings/${weddingToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({
          title: "Wedding Removed 🗑️",
          description: `"${weddingToDelete.familyName}" and all guest details have been removed.`,
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
            totalDeclined: 0,
            estimatedSavings: 0,
            vegCount: 0,
            nonVegCount: 0,
            jainCount: 0,
          });
          setFirstWeddingDetail(null);
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

          if (data.length > 0) {
            const detailRes = await fetch(`/api/weddings/${data[0].id}`);
            if (detailRes.ok) {
              const detail = await detailRes.json();
              setFirstWeddingDetail(detail);
              const s = detail.stats || {};
              const nonShowCount = (s.totalDeclined || 0) + Math.round((s.totalPending || 0) * 0.4);
              setStats({
                totalWeddings: data.length,
                totalGuests: s.totalGuests || 0,
                totalConfirmed: s.totalConfirmed || 0,
                totalPending: s.totalPending || 0,
                totalDeclined: s.totalDeclined || 0,
                estimatedSavings: nonShowCount * 1800,
                vegCount: s.vegCount || 0,
                nonVegCount: s.nonVegCount || 0,
                jainCount: s.jainCount || 0,
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

  // Compute countdown to nearest wedding
  const activeWedding = weddings[0];
  const daysUntil = React.useMemo(() => {
    if (!activeWedding?.weddingDate) return null;
    const target = new Date(activeWedding.weddingDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  }, [activeWedding]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-64 bg-[#EAE5DF]/60 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-[#EAE5DF] animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-white rounded-2xl border border-[#EAE5DF] animate-pulse" />
          <div className="h-64 bg-white rounded-2xl border border-[#EAE5DF] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE5DF]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#FBF8F1] border border-[#C5A059]/30 text-[#C5A059] text-[11px] font-semibold tracking-wider uppercase mb-1.5">
            <Sparkles className="w-3 h-3" />
            Executive Guest Intelligence
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1F1E1C]">
            Wedding Guest &amp; Catering Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6A63] mt-1">
            Real-time guest confirmations, Halwai plate calculations, and WhatsApp invitations.
          </p>
        </div>
        <Link href="/weddings">
          <Button className="bg-[#C5A059] hover:bg-[#B08D47] text-white shadow-sm font-medium text-xs sm:text-sm cursor-pointer h-10 px-4">
            <Plus className="w-4 h-4 mr-1.5" />
            Create New Wedding
          </Button>
        </Link>
      </div>

      {/* Bento Grid: Row 1 - Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Confirmed Coming */}
        <Card className="border-[#EAE5DF] bg-white hover:border-[#7A8B74]/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63]">
              Confirmed Coming
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-[#F2F5F0] text-[#7A8B74] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="font-serif text-3xl font-bold text-[#7A8B74] tabular-nums">
              {stats.totalConfirmed}
            </div>
            <p className="text-[11px] text-[#6E6A63] mt-1">
              Guaranteed attendees for celebration
            </p>
          </CardContent>
        </Card>

        {/* Total Guests Invited */}
        <Card className="border-[#EAE5DF] bg-white hover:border-[#C5A059]/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63]">
              Total Guests Invited
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-[#FBF8F1] text-[#C5A059] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="font-serif text-3xl font-bold text-[#1F1E1C] tabular-nums">
              {stats.totalGuests}
            </div>
            <p className="text-[11px] text-[#6E6A63] mt-1">
              Registered across all functions
            </p>
          </CardContent>
        </Card>

        {/* Awaiting Response */}
        <Card className="border-[#EAE5DF] bg-white hover:border-amber-400 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63]">
              Awaiting Response
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="font-serif text-3xl font-bold text-amber-600 tabular-nums">
              {stats.totalPending}
            </div>
            <p className="text-[11px] text-[#6E6A63] mt-1">
              Awaiting WhatsApp confirmation
            </p>
          </CardContent>
        </Card>

        {/* Catering Savings */}
        <Card className="border-[#C5A059]/30 bg-gradient-to-br from-[#1F2E23] to-[#152018] text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-[#C5A059]">
              Catering Saved
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-[#C5A059] text-white flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="font-serif text-3xl font-bold text-white tabular-nums">
              ₹{stats.estimatedSavings.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-[#FAF8F5]/80 mt-1">
              Prevented from phantom food plates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bento Grid: Row 2 - Deep Dive Spotlight Modules */}
      {activeWedding && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bento Spotlight: Upcoming Wedding Countdown (2 cols) */}
          <div className="lg:col-span-2 rounded-2xl border border-[#EAE5DF] bg-white p-6 sm:p-7 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-[10px] tracking-wider uppercase font-semibold">
                    Spotlight Celebration
                  </Badge>
                  <span className="text-xs text-[#6E6A63]">•</span>
                  <span className="text-xs text-[#6E6A63] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                    {activeWedding.venue}, {activeWedding.city}
                  </span>
                </div>
                {daysUntil !== null && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBF8F1] border border-[#C5A059]/30 text-xs font-semibold text-[#C5A059]">
                    <Hourglass className="w-3.5 h-3.5" />
                    <span>
                      {daysUntil > 0 ? `${daysUntil} Days Remaining` : daysUntil === 0 ? "Today is the Big Day! 🎊" : "Celebration Concluded"}
                    </span>
                  </div>
                )}
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1E1C]">
                {activeWedding.familyName}
              </h2>
              <p className="text-sm text-[#6E6A63] mt-1">
                Celebrating the holy union of <strong className="text-[#1F1E1C] font-semibold">{activeWedding.brideName}</strong> and <strong className="text-[#1F1E1C] font-semibold">{activeWedding.groomName}</strong>.
              </p>

              {/* Progress Bar of Confirmations */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6E6A63] font-medium">Guest Confirmation Progress</span>
                  <span className="font-semibold text-[#1F1E1C]">
                    {stats.totalGuests > 0
                      ? `${Math.round((stats.totalConfirmed / stats.totalGuests) * 100)}% Confirmed`
                      : "0%"}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#FAF8F5] border border-[#EAE5DF] overflow-hidden flex">
                  <div
                    className="h-full bg-[#7A8B74] transition-all"
                    style={{
                      width: `${stats.totalGuests > 0 ? (stats.totalConfirmed / stats.totalGuests) * 100 : 0}%`,
                    }}
                    title="Confirmed"
                  />
                  <div
                    className="h-full bg-[#C5A059] transition-all"
                    style={{
                      width: `${stats.totalGuests > 0 ? (stats.totalPending / stats.totalGuests) * 100 : 0}%`,
                    }}
                    title="Pending"
                  />
                  <div
                    className="h-full bg-rose-400 transition-all"
                    style={{
                      width: `${stats.totalGuests > 0 ? (stats.totalDeclined / stats.totalGuests) * 100 : 0}%`,
                    }}
                    title="Declined"
                  />
                </div>
                <div className="flex items-center gap-4 text-[11px] text-[#6E6A63] pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#7A8B74]" /> Confirmed ({stats.totalConfirmed})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C5A059]" /> Pending ({stats.totalPending})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" /> Declined ({stats.totalDeclined})
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-5 border-t border-[#EAE5DF] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#6E6A63]">
                <Calendar className="w-4 h-4 text-[#C5A059]" />
                <span>{formatDate(activeWedding.weddingDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/weddings/${activeWedding.id}/guests`}>
                  <Button variant="outline" size="sm" className="text-xs font-medium cursor-pointer">
                    <Users className="w-3.5 h-3.5 mr-1.5 text-[#C5A059]" />
                    Guest List
                  </Button>
                </Link>
                <Link href={`/weddings/${activeWedding.id}/reports`}>
                  <Button size="sm" className="bg-[#1F2E23] hover:bg-[#152018] text-white text-xs font-medium cursor-pointer">
                    <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-[#C5A059]" />
                    Catering Sheet
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Bento Spotlight: Catering & Dietary Breakdown (1 col) */}
          <div className="rounded-2xl border border-[#EAE5DF] bg-white p-6 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6A63] flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-[#C5A059]" />
                  Food Plate Ratios
                </span>
                <span className="text-[11px] font-medium text-[#7A8B74] bg-[#F2F5F0] px-2 py-0.5 rounded-full">
                  Halwai Ready
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-[#1F1E1C]">
                Dietary Preferences
              </h3>
              <p className="text-xs text-[#6E6A63] mt-1">
                Live confirmed count of plates needed from your kitchen team.
              </p>

              <div className="mt-5 space-y-3.5">
                {/* Pure Veg */}
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DF] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-sm border-2 border-emerald-600 flex items-center justify-center p-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1F1E1C]">Standard Vegetarian</p>
                      <p className="text-[10px] text-[#6E6A63]">Confirmed guests</p>
                    </div>
                  </div>
                  <span className="font-serif text-lg font-bold text-[#1F1E1C] tabular-nums">
                    {stats.vegCount} plates
                  </span>
                </div>

                {/* Jain Food */}
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DF] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-sm border-2 border-amber-600 flex items-center justify-center p-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1F1E1C]">Jain (No Onion/Garlic)</p>
                      <p className="text-[10px] text-[#6E6A63]">Separate vessel prep</p>
                    </div>
                  </div>
                  <span className="font-serif text-lg font-bold text-amber-700 tabular-nums">
                    {stats.jainCount} plates
                  </span>
                </div>

                {/* Non-Veg */}
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DF] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-sm border-2 border-rose-600 flex items-center justify-center p-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1F1E1C]">Non-Vegetarian</p>
                      <p className="text-[10px] text-[#6E6A63]">Cocktail / Dinner</p>
                    </div>
                  </div>
                  <span className="font-serif text-lg font-bold text-rose-700 tabular-nums">
                    {stats.nonVegCount} plates
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#EAE5DF]">
              <Link href={`/weddings/${activeWedding.id}/reports`} className="block">
                <Button variant="outline" size="sm" className="w-full text-xs font-medium cursor-pointer">
                  View Full Halwai Catering Sheet
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Wedding List Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1F1E1C]">Your Weddings</h2>
            <p className="text-xs text-[#6E6A63]">Manage active celebrations and sub-events</p>
          </div>
          <span className="text-xs font-medium text-[#6E6A63]">
            {weddings.length} Active {weddings.length === 1 ? "Wedding" : "Weddings"}
          </span>
        </div>

        {weddings.length === 0 ? (
          <Card className="border-[#EAE5DF] p-12 text-center bg-white">
            <div className="w-16 h-16 rounded-2xl bg-[#FBF8F1] text-[#C5A059] flex items-center justify-center mx-auto mb-4 border border-[#C5A059]/30">
              <CalendarHeart className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1F1E1C]">No Weddings Yet</h3>
            <p className="text-sm text-[#6E6A63] max-w-sm mx-auto mt-2">
              Create your first wedding to start adding guests and sending WhatsApp invitations.
            </p>
            <Link href="/weddings" className="inline-block mt-6">
              <Button className="bg-[#C5A059] hover:bg-[#B08D47] text-white">
                Create Wedding Now
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {weddings.map((w) => (
              <Card
                key={w.id}
                className="border-[#EAE5DF] hover:border-[#C5A059]/60 bg-white transition-all shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]"
              >
                <CardHeader className="pb-3 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider mb-2">
                        {w.city}
                      </Badge>
                      <CardTitle className="font-serif text-2xl font-bold text-[#1F1E1C]">
                        {w.familyName}
                      </CardTitle>
                      <CardDescription className="text-xs text-[#6E6A63] mt-1 font-medium">
                        {w.brideName} &amp; {w.groomName}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[11px] font-medium text-[#6E6A63] block">
                          Date
                        </span>
                        <span className="text-xs font-semibold text-[#1F1E1C] tabular-nums">
                          {formatDate(w.weddingDate)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(w)}
                        className="h-8 px-2.5 text-xs font-medium text-[#C5A059] border-[#C5A059]/30 bg-[#FBF8F1] hover:bg-[#F5EEDB] transition-colors ml-1 cursor-pointer"
                        title="Edit Wedding Details"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setWeddingToDelete(w)}
                        className="h-8 px-2.5 text-xs font-medium text-rose-600 border-rose-200 bg-rose-50/50 hover:bg-rose-100 hover:text-rose-700 transition-colors ml-1 cursor-pointer"
                        title="Delete Wedding"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 px-6 pb-6">
                  <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EAE5DF] grid grid-cols-2 gap-2 text-center">
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-[#6E6A63] block">
                        Invited Guests
                      </span>
                      <span className="font-serif text-xl font-bold text-[#1F1E1C] tabular-nums">
                        {w._count.guests}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-[#6E6A63] block">
                        Ceremonies
                      </span>
                      <span className="font-serif text-xl font-bold text-[#C5A059] tabular-nums">
                        {w._count.events}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#6E6A63] truncate">
                    📍 <strong className="text-[#1F1E1C] font-medium">Venue:</strong> {w.venue}
                  </p>

                  {/* Action Shortcuts */}
                  <div className="pt-2 border-t border-[#EAE5DF] grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Link href={`/weddings/${w.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-[11px] font-medium border-[#EAE5DF] cursor-pointer">
                        Overview
                      </Button>
                    </Link>
                    <Link href={`/weddings/${w.id}/guests`}>
                      <Button variant="outline" size="sm" className="w-full text-[11px] font-medium text-[#C5A059] border-[#C5A059]/30 bg-[#FBF8F1] hover:bg-[#F5EEDB] cursor-pointer">
                        <Users className="w-3.5 h-3.5 mr-1" />
                        Guest List
                      </Button>
                    </Link>
                    <Link href={`/weddings/${w.id}/events`}>
                      <Button variant="outline" size="sm" className="w-full text-[11px] font-medium text-[#1F2E23] border-[#1F2E23]/20 bg-[#FAF8F5] hover:bg-stone-100 cursor-pointer">
                        <CalendarHeart className="w-3.5 h-3.5 mr-1" />
                        Functions
                      </Button>
                    </Link>
                    <Link href={`/weddings/${w.id}/reports`}>
                      <Button variant="outline" size="sm" className="w-full text-[11px] font-medium text-[#7A8B74] border-[#7A8B74]/30 bg-[#F2F5F0] hover:bg-[#E5ECE2] cursor-pointer">
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
        <DialogContent className="max-w-md bg-white border-[#EAE5DF] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-rose-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              Remove Wedding Celebration?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6E6A63] pt-2 leading-relaxed">
              Are you sure you want to remove <strong className="text-[#1F1E1C] font-semibold">&quot;{weddingToDelete?.familyName}&quot;</strong>?
              <br /><br />
              This will remove this wedding celebration, all its functions (Mehendi, Sangeet, etc.), guest lists, and Halwai catering sheets. <strong className="text-rose-600">This action cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setWeddingToDelete(null)}
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

      {/* Edit Wedding Modal Dialog */}
      <Dialog open={!!weddingToEdit} onOpenChange={(open) => !open && setWeddingToEdit(null)}>
        <DialogContent className="max-w-md bg-white border-[#EAE5DF] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold text-[#1F1E1C] flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#C5A059]" />
              Edit Wedding Details
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6E6A63] pt-1">
              Correct names, wedding date, city, or venue. Changes reflect immediately across all invites.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateWedding} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dash-edit-bride" className="text-xs font-semibold text-[#6E6A63]">
                  Bride&apos;s First Name
                </Label>
                <Input
                  id="dash-edit-bride"
                  required
                  placeholder="e.g. Priya"
                  value={editFormData.brideName}
                  onChange={(e) => setEditFormData({ ...editFormData, brideName: e.target.value })}
                  className="rounded-xl border-[#EAE5DF] focus-visible:ring-[#C5A059] text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dash-edit-groom" className="text-xs font-semibold text-[#6E6A63]">
                  Groom&apos;s First Name
                </Label>
                <Input
                  id="dash-edit-groom"
                  required
                  placeholder="e.g. Rohan"
                  value={editFormData.groomName}
                  onChange={(e) => setEditFormData({ ...editFormData, groomName: e.target.value })}
                  className="rounded-xl border-[#EAE5DF] focus-visible:ring-[#C5A059] text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dash-edit-family" className="text-xs font-semibold text-[#6E6A63]">
                Wedding Title / Family Name
              </Label>
              <Input
                id="dash-edit-family"
                required
                placeholder="e.g. The Priya & Rohan Wedding"
                value={editFormData.familyName}
                onChange={(e) => setEditFormData({ ...editFormData, familyName: e.target.value })}
                className="rounded-xl border-[#EAE5DF] focus-visible:ring-[#C5A059] text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dash-edit-date" className="text-xs font-semibold text-[#6E6A63]">
                  Wedding Date
                </Label>
                <Input
                  id="dash-edit-date"
                  type="date"
                  required
                  value={editFormData.weddingDate}
                  onChange={(e) => setEditFormData({ ...editFormData, weddingDate: e.target.value })}
                  className="rounded-xl border-[#EAE5DF] focus-visible:ring-[#C5A059] text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dash-edit-city" className="text-xs font-semibold text-[#6E6A63]">
                  City / Location
                </Label>
                <Input
                  id="dash-edit-city"
                  required
                  placeholder="e.g. Hyderabad"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                  className="rounded-xl border-[#EAE5DF] focus-visible:ring-[#C5A059] text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dash-edit-venue" className="text-xs font-semibold text-[#6E6A63]">
                Primary Venue / Hall
              </Label>
              <Input
                id="dash-edit-venue"
                required
                placeholder="e.g. Kukatpally / Taj Krishna"
                value={editFormData.venue}
                onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })}
                className="rounded-xl border-[#EAE5DF] focus-visible:ring-[#C5A059] text-sm"
              />
            </div>

            <DialogFooter className="pt-3 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setWeddingToEdit(null)}
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
    </div>
  );
}
