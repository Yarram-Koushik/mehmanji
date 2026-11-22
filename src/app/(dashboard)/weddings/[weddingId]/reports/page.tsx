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
  ChefHat,
  Calendar,
  MapPin,
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
        <div className="h-8 w-48 bg-white rounded-xl border border-[#EAE5DF] animate-pulse" />
        <div className="h-64 bg-white rounded-2xl border border-[#EAE5DF] animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <h2 className="font-serif text-2xl font-bold text-[#1F1E1C]">Report not available</h2>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE5DF] print:hidden">
        <div className="flex items-center gap-3">
          <Link href={`/weddings/${weddingId}`}>
            <Button variant="ghost" size="sm" className="p-2 h-auto text-[#6E6A63] hover:text-[#1F1E1C]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#FBF8F1] border border-[#C5A059]/30 text-[#C5A059] text-[11px] font-semibold tracking-wider uppercase mb-1">
              <ChefHat className="w-3 h-3" />
              Kitchen &amp; Banquet Intelligence
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1F1E1C]">
              Halwai &amp; Catering Food Sheet
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6A63] mt-0.5">
              {data.wedding.familyName} • Exact plate counts, Veg/Jain breakdown, and Maharaj instructions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Event Filter dropdown */}
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="h-10 text-xs rounded-[10px] border border-[#EAE5DF] bg-white px-3 text-[#1F1E1C] outline-none focus:border-[#C5A059]"
          >
            <option value="ALL">All Functions Combined</option>
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
            className="border-[#EAE5DF] text-xs font-medium h-10 px-3.5 cursor-pointer hover:border-[#C5A059]"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-[#C5A059]" />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-[#1F2E23] hover:bg-[#152018] text-white text-xs font-medium h-10 px-4 shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-[#C5A059]" />
            Print for Caterer
          </Button>
        </div>
      </div>

      {/* Printable Sheet Header (Visible when printed) */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <h1 className="font-serif text-2xl font-bold text-black">
          Halwai Catering &amp; Food Plate Order Sheet
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
            <Card className="border-[#EAE5DF] bg-white shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
              <CardHeader className="bg-[#FAF8F5] border-b border-[#EAE5DF] p-6 pb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <Badge variant="default" className="text-[10px] font-semibold uppercase tracking-wider mb-2">
                      {report.eventType}
                    </Badge>
                    <CardTitle className="font-serif text-2xl font-bold text-[#1F1E1C]">
                      {report.eventName}
                    </CardTitle>
                    <CardDescription className="text-xs text-[#6E6A63] mt-1 flex flex-wrap items-center gap-3">
                      <span>📅 <span className="tabular-nums">{formatDate(report.eventDate)}</span></span>
                      <span>•</span>
                      <span>⏰ {report.startTime || "Evening"}</span>
                      <span>•</span>
                      <span>📍 {report.venue || "Main Banquet"}</span>
                    </CardDescription>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6A63] block">
                      Total Recommended Plates
                    </span>
                    <span className="font-serif text-3xl sm:text-4xl font-bold text-[#C5A059] tabular-nums">
                      {report.stats.totalPlatesWithBuffer} Plates
                    </span>
                    <span className="text-[11px] text-[#6E6A63] block mt-0.5 tabular-nums">
                      ({report.stats.totalPartySize} confirmed + {report.stats.bufferRecommendation} safety buffer)
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* 4 Food Category Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Veg */}
                  <div className="p-4 rounded-xl bg-[#F2F5F0] border border-[#7A8B74]/20">
                    <span className="text-xs font-semibold uppercase text-[#7A8B74] block">
                      Vegetarian
                    </span>
                    <div className="font-serif text-3xl font-bold text-[#7A8B74] mt-1 tabular-nums">
                      {report.stats.vegCount}
                    </div>
                    <span className="text-[11px] text-[#6E6A63] block mt-1">
                      Standard Veg Buffet
                    </span>
                  </div>

                  {/* Pure Jain */}
                  <div className="p-4 rounded-xl bg-[#FDF8EE] border border-[#C5A059]/20">
                    <span className="text-xs font-semibold uppercase text-[#C5A059] block">
                      Pure Jain (No Onion/Garlic)
                    </span>
                    <div className="font-serif text-3xl font-bold text-[#C5A059] mt-1 tabular-nums">
                      {report.stats.jainCount}
                    </div>
                    <span className="text-[11px] text-[#6E6A63] block mt-1">
                      Dedicated Counter
                    </span>
                  </div>

                  {/* Non-Veg */}
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                    <span className="text-xs font-semibold uppercase text-rose-700 block">
                      Non-Vegetarian
                    </span>
                    <div className="font-serif text-3xl font-bold text-rose-700 mt-1 tabular-nums">
                      {report.stats.nonVegCount}
                    </div>
                    <span className="text-[11px] text-[#6E6A63] block mt-1">
                      Chicken / Mutton / Fish
                    </span>
                  </div>

                  {/* Vegan / Special */}
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DF]">
                    <span className="text-xs font-semibold uppercase text-[#6E6A63] block">
                      Vegan / Special Diet
                    </span>
                    <div className="font-serif text-3xl font-bold text-[#1F1E1C] mt-1 tabular-nums">
                      {report.stats.veganCount}
                    </div>
                    <span className="text-[11px] text-[#6E6A63] block mt-1">
                      Dairy-free &amp; Nut allergies
                    </span>
                  </div>
                </div>

                {/* Buffer Recommendation Box */}
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DF] flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FBF8F1] border border-[#C5A059]/30 text-[#C5A059] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#1F1E1C] uppercase tracking-wider">
                      Maharaj Buffer Recommendation (+{report.stats.bufferRecommendation} Plates)
                    </h4>
                    <p className="text-xs text-[#6E6A63] mt-1 leading-relaxed">
                      We added a 10% safety buffer over the {report.stats.totalPartySize} confirmed guests. Advise the caterer to keep raw ingredients ready for an additional {report.stats.bufferRecommendation} plates without cooking everything in advance.
                    </p>
                  </div>
                </div>

                {/* Confirmed Guests Table with Dietary Notes */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6E6A63] mb-3">
                    Guest Breakdown &amp; Special Dietary Requests
                  </h4>
                  <div className="overflow-x-auto border border-[#EAE5DF] rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#FAF8F5] text-[#6E6A63] font-semibold border-b border-[#EAE5DF]">
                        <tr>
                          <th className="py-3 px-3.5">Guest Name</th>
                          <th className="py-3 px-3.5">Group</th>
                          <th className="py-3 px-3.5 text-center">Party Size</th>
                          <th className="py-3 px-3.5 text-center">Veg</th>
                          <th className="py-3 px-3.5 text-center">Jain</th>
                          <th className="py-3 px-3.5 text-center">Non-Veg</th>
                          <th className="py-3 px-3.5">Arrival Timing</th>
                          <th className="py-3 px-3.5">Dietary / Chef Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAE5DF]">
                        {report.guestBreakdown
                          .filter((g) => g.status === "CONFIRMED")
                          .map((g) => (
                            <tr key={g.guestId} className="hover:bg-[#FAF8F5]/60 transition-colors">
                              <td className="py-3 px-3.5 font-serif font-bold text-[#1F1E1C]">
                                {g.guestName}
                              </td>
                              <td className="py-3 px-3.5 text-[#6E6A63]">
                                {g.groupName}
                              </td>
                              <td className="py-3 px-3.5 text-center font-bold text-[#1F1E1C] tabular-nums">
                                {g.partySize}
                              </td>
                              <td className="py-3 px-3.5 text-center text-[#7A8B74] font-semibold tabular-nums">
                                {g.vegCount}
                              </td>
                              <td className="py-3 px-3.5 text-center text-[#C5A059] font-semibold tabular-nums">
                                {g.jainCount}
                              </td>
                              <td className="py-3 px-3.5 text-center text-rose-700 font-semibold tabular-nums">
                                {g.nonVegCount}
                              </td>
                              <td className="py-3 px-3.5 text-[#6E6A63]">
                                {g.arrivalTime === "BEFORE_EVENT" && "Early arrival"}
                                {g.arrivalTime === "ON_TIME" && "On time"}
                                {g.arrivalTime === "SLIGHTLY_LATE" && "Slightly late"}
                                {g.arrivalTime === "LATE" && "Late arrival"}
                              </td>
                              <td className="py-3 px-3.5 text-[#C5A059] font-medium">
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
    <React.Suspense fallback={<div className="h-64 w-full bg-white rounded-2xl border border-[#EAE5DF] animate-pulse" />}>
      <ReportsPageInner />
    </React.Suspense>
  );
}
