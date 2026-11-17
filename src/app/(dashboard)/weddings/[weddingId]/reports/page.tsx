"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  FileSpreadsheet,
  Printer,
  Download,
  ArrowLeft,
  UtensilsCrossed,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CateringReportData {
  wedding: {
    id: string;
    familyName: string;
    brideName: string;
    groomName: string;
    weddingDate: string;
  };
  reports: Array<{
    eventId: string;
    eventName: string;
    eventType: string;
    eventDate: string;
    startTime: string;
    venue: string;
    stats: {
      totalGuestsInvited: number;
      totalConfirmed: number;
      totalDeclined: number;
      totalMaybe: number;
      totalPending: number;
      totalPartySize: number;
      bufferRecommendation: number;
      totalPlatesWithBuffer: number;
      vegCount: number;
      nonVegCount: number;
      jainCount: number;
      veganCount: number;
    };
    guestBreakdown: Array<{
      guestId: string;
      guestName: string;
      groupName: string;
      phone: string;
      status: string;
      partySize: number;
      vegCount: number;
      nonVegCount: number;
      jainCount: number;
      veganCount: number;
      arrivalTime: string;
      dietaryNotes: string;
    }>;
  }>;
}

function ReportsPageInner() {
  const params = useParams();
  const { toast } = useToast();
  const weddingId = params?.weddingId as string;

  const [data, setData] = React.useState<CateringReportData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedEventId, setSelectedEventId] = React.useState<string>("ALL");

  React.useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/weddings/${weddingId}/reports`);
        if (res.ok) {
          const reportJson = await res.json();
          setData(reportJson);
        } else {
          toast({ title: "Failed to load report", variant: "destructive" });
        }
      } catch {
        toast({ title: "Error generating report", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    if (weddingId) fetchReport();
  }, [weddingId, toast]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!data) return;

    let csv = "Event,Guest Name,Group,Phone,Status,Party Size,Veg,Jain,Non-Veg,Vegan,Arrival,Dietary Notes\n";

    data.reports.forEach((rep) => {
      rep.guestBreakdown.forEach((g) => {
        csv += `"${rep.eventName}","${g.guestName}","${g.groupName}","${g.phone}","${g.status}",${g.partySize},${g.vegCount},${g.jainCount},${g.nonVegCount},${g.veganCount},"${g.arrivalTime}","${g.dietaryNotes.replace(/"/g, '""')}"\n`;
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Catering_Report_${data.wedding.familyName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "CSV Downloaded", description: "Catering data exported successfully." });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-stone-200 rounded animate-pulse" />
        <div className="h-64 bg-stone-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold">Report not available</h2>
      </div>
    );
  }

  const displayedReports =
    selectedEventId === "ALL"
      ? data.reports
      : data.reports.filter((r) => r.eventId === selectedEventId);

  return (
    <div className="space-y-8 print:p-0">
      {/* Header & Print Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD3] print:hidden">
        <div className="flex items-center gap-3">
          <Link href={`/weddings/${weddingId}`}>
            <Button variant="ghost" size="sm" className="p-2 h-auto text-[#78716C] hover:text-[#1C1917]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1C1917]">
              Caterer Handover &amp; Food Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C]">
              {data.wedding.familyName} • Exact plate counts and Maharaj instructions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Event Filter dropdown */}
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="h-9 text-xs rounded-lg border border-[#E8DDD3] bg-white px-3 text-[#1C1917] outline-none"
          >
            <option value="ALL">All Sub-Events Combined</option>
            {data.reports.map((r) => (
              <option key={r.eventId} value={r.eventId}>
                {r.eventName}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="border-[#E8DDD3] text-xs font-semibold h-9 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-[#B91C6C] hover:bg-[#9D174D] text-white text-xs font-semibold h-9 shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print for Caterer
          </Button>
        </div>
      </div>

      {/* Printable Sheet Header (Visible when printed) */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <h1 className="text-2xl font-black text-black">
          Catering Order &amp; Meal Headcount Sheet
        </h1>
        <p className="text-sm text-gray-700">
          Wedding: {data.wedding.familyName} ({data.wedding.brideName} &amp; {data.wedding.groomName})
        </p>
        <p className="text-xs text-gray-500">
          Generated via MehmanJi Guest Intelligence Platform on {new Date().toLocaleDateString("en-IN")}
        </p>
      </div>

      {/* Reports by Event */}
      <div className="space-y-8">
        {displayedReports.map((report) => (
          <div key={report.eventId} className="space-y-4">
            {/* Event Summary Card */}
            <Card className="border-[#E8DDD3] bg-white shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#FFFBF5] to-[#FCE7F3]/30 border-b border-[#E8DDD3] pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Badge className="bg-[#B91C6C] text-white text-[10px] font-bold mb-1">
                      {report.eventType}
                    </Badge>
                    <CardTitle className="text-xl font-black text-[#1C1917]">
                      {report.eventName}
                    </CardTitle>
                    <CardDescription className="text-xs text-[#78716C]">
                      📅 {formatDate(report.eventDate)} • ⏰ {report.startTime || "Evening"} • 📍 {report.venue || "Main Banquet"}
                    </CardDescription>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block">
                      Total Recommended Plates
                    </span>
                    <span className="text-3xl font-black text-[#B91C6C]">
                      {report.stats.totalPlatesWithBuffer} Plates
                    </span>
                    <span className="text-[11px] text-[#78716C] block mt-0.5">
                      ({report.stats.totalPartySize} confirmed + {report.stats.bufferRecommendation} buffer)
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* 4 Food Category Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Veg */}
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-xs font-bold uppercase text-emerald-800 block">
                      Vegetarian
                    </span>
                    <div className="text-3xl font-black text-emerald-700 mt-1">
                      {report.stats.vegCount}
                    </div>
                    <span className="text-[11px] text-emerald-600 block mt-1">
                      Standard Veg Buffet
                    </span>
                  </div>

                  {/* Pure Jain */}
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-xs font-bold uppercase text-amber-800 block">
                      Pure Jain (No Onion/Garlic)
                    </span>
                    <div className="text-3xl font-black text-amber-700 mt-1">
                      {report.stats.jainCount}
                    </div>
                    <span className="text-[11px] text-amber-600 block mt-1">
                      Dedicated Counter
                    </span>
                  </div>

                  {/* Non-Veg */}
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <span className="text-xs font-bold uppercase text-red-800 block">
                      Non-Vegetarian
                    </span>
                    <div className="text-3xl font-black text-red-700 mt-1">
                      {report.stats.nonVegCount}
                    </div>
                    <span className="text-[11px] text-red-600 block mt-1">
                      Chicken / Mutton / Fish
                    </span>
                  </div>

                  {/* Vegan / Special */}
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                    <span className="text-xs font-bold uppercase text-purple-800 block">
                      Vegan / Special Diet
                    </span>
                    <div className="text-3xl font-black text-purple-700 mt-1">
                      {report.stats.veganCount}
                    </div>
                    <span className="text-[11px] text-purple-600 block mt-1">
                      Dairy-free &amp; Nut allergies
                    </span>
                  </div>
                </div>

                {/* Buffer Recommendation Box */}
                <div className="p-4 rounded-xl bg-[#FFFBF5] border border-[#D97706]/30 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#D97706] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
                      Maharaj Buffer Recommendation (+{report.stats.bufferRecommendation} Plates)
                    </h4>
                    <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
                      We added a 10% safety buffer over the {report.stats.totalPartySize} confirmed guests. Advise the caterer to keep raw ingredients ready for an additional {report.stats.bufferRecommendation} plates without cooking everything in advance.
                    </p>
                  </div>
                </div>

                {/* Confirmed Guests Table with Dietary Notes */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-3">
                    Guest Breakdown &amp; Special Dietary Requests
                  </h4>
                  <div className="overflow-x-auto border border-[#E8DDD3] rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#FFFBF5] text-[#78716C] font-semibold border-b border-[#E8DDD3]">
                        <tr>
                          <th className="py-2.5 px-3">Guest Name</th>
                          <th className="py-2.5 px-3">Group</th>
                          <th className="py-2.5 px-3 text-center">Party Size</th>
                          <th className="py-2.5 px-3 text-center">Veg</th>
                          <th className="py-2.5 px-3 text-center">Jain</th>
                          <th className="py-2.5 px-3 text-center">Non-Veg</th>
                          <th className="py-2.5 px-3">Arrival Timing</th>
                          <th className="py-2.5 px-3">Dietary / Chef Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8DDD3]/80">
                        {report.guestBreakdown
                          .filter((g) => g.status === "CONFIRMED")
                          .map((g) => (
                            <tr key={g.guestId} className="hover:bg-stone-50/60">
                              <td className="py-2.5 px-3 font-bold text-[#1C1917]">
                                {g.guestName}
                              </td>
                              <td className="py-2.5 px-3 text-[#78716C]">
                                {g.groupName}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold">
                                {g.partySize}
                              </td>
                              <td className="py-2.5 px-3 text-center text-emerald-700 font-semibold">
                                {g.vegCount}
                              </td>
                              <td className="py-2.5 px-3 text-center text-amber-700 font-semibold">
                                {g.jainCount}
                              </td>
                              <td className="py-2.5 px-3 text-center text-red-700 font-semibold">
                                {g.nonVegCount}
                              </td>
                              <td className="py-2.5 px-3 text-[#78716C]">
                                {g.arrivalTime === "BEFORE_EVENT" && "Early arrival"}
                                {g.arrivalTime === "ON_TIME" && "On time"}
                                {g.arrivalTime === "SLIGHTLY_LATE" && "Slightly late"}
                                {g.arrivalTime === "LATE" && "Late arrival"}
                              </td>
                              <td className="py-2.5 px-3 text-[#B91C6C] font-medium">
                                {g.dietaryNotes || "—"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <React.Suspense fallback={<div className="h-64 w-full bg-stone-200 rounded-2xl animate-pulse" />}>
      <ReportsPageInner />
    </React.Suspense>
  );
}
