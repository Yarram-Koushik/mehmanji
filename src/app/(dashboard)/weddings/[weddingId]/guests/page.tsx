"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Users,
  Search,
  Plus,
  Upload,
  MessageCircle,
  Copy,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Phone,
  Send,
  Zap,
  Download,
  ChevronRight,
  Play,
  FileSpreadsheet,
  Layers,
  Info,
} from "lucide-react";
import { generateWhatsAppLink, generateInviteMessage, formatDate } from "@/lib/utils";

interface GuestItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  token: string;
  notes: string;
  groupId: string | null;
  group: { id: string; name: string; color: string } | null;
  rsvps: Array<{
    eventId: string;
    status: string;
    partySize: number;
    vegCount: number;
    nonVegCount: number;
    jainCount: number;
    veganCount: number;
    arrivalTime: string;
    dietaryNotes: string;
    event: { name: string; type: string };
  }>;
}

interface WeddingInfo {
  id: string;
  familyName: string;
  weddingDate: string;
  venue: string;
  city: string;
}

function GuestsPageInner() {
  const params = useParams();
  const { toast } = useToast();
  const weddingId = params?.weddingId as string;

  const [wedding, setWedding] = React.useState<WeddingInfo | null>(null);
  const [guests, setGuests] = React.useState<GuestItem[]>([]);
  const [groups, setGroups] = React.useState<Array<{ id: string; name: string; color: string }>>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [search, setSearch] = React.useState("");
  const [selectedGroup, setSelectedGroup] = React.useState("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState("ALL");

  // Modals
  const [openAddModal, setOpenAddModal] = React.useState(false);
  const [openBulkModal, setOpenBulkModal] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [guestToDelete, setGuestToDelete] = React.useState<GuestItem | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Single guest form
  const [singleForm, setSingleForm] = React.useState({
    name: "",
    phone: "",
    email: "",
    groupId: "",
    notes: "",
  });

  // Bulk guest import form
  const [bulkText, setBulkText] = React.useState("");

  // Broadcast modal state
  const [openBroadcastModal, setOpenBroadcastModal] = React.useState(false);
  const [broadcastTargetStatus, setBroadcastTargetStatus] = React.useState("ALL");
  const [broadcastTargetGroup, setBroadcastTargetGroup] = React.useState("ALL");
  const [broadcastCustomNote, setBroadcastCustomNote] = React.useState("");
  const [broadcasting, setBroadcasting] = React.useState(false);
  const [broadcastProgress, setBroadcastProgress] = React.useState(0);
  const [broadcastTab, setBroadcastTab] = React.useState<"AUTOMATED" | "DISPATCHER" | "EXPORT">("AUTOMATED");
  const [broadcastResult, setBroadcastResult] = React.useState<{
    mode: string;
    metaApiConfigured: boolean;
    totalTargets: number;
    successful: number;
    failed: number;
    message: string;
  } | null>(null);

  // Fast Dispatcher queue state
  const [dispatcherIndex, setDispatcherIndex] = React.useState(0);

  const broadcastEligibleGuests = React.useMemo(() => {
    return guests.filter((g) => {
      if (broadcastTargetGroup !== "ALL" && g.groupId !== broadcastTargetGroup) return false;
      if (broadcastTargetStatus !== "ALL") {
        const status = g.rsvps[0]?.status || "PENDING";
        if (status !== broadcastTargetStatus) return false;
      }
      return true;
    });
  }, [guests, broadcastTargetGroup, broadcastTargetStatus]);

  const currentDispatcherGuest = broadcastEligibleGuests[dispatcherIndex] || broadcastEligibleGuests[0];

  const handleDispatcherSendAndNext = () => {
    if (!currentDispatcherGuest) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3005";
    const message = generateInviteMessage(
      currentDispatcherGuest.name,
      wedding?.familyName || "Our Wedding",
      wedding ? formatDate(wedding.weddingDate) : "",
      currentDispatcherGuest.token,
      origin
    ) + (broadcastCustomNote ? `\n\n📌 Note: ${broadcastCustomNote}` : "");
    const waLink = generateWhatsAppLink(currentDispatcherGuest.phone, message);
    window.open(waLink, "_blank");

    if (dispatcherIndex < broadcastEligibleGuests.length - 1) {
      setDispatcherIndex((prev) => prev + 1);
    } else {
      toast({
        title: "All Invitations Sent! 🎊",
        description: `Completed queue for all ${broadcastEligibleGuests.length} guests.`,
      });
    }
  };

  const handleBulkBroadcast = async () => {
    setBroadcasting(true);
    setBroadcastResult(null);
    setBroadcastProgress(20);

    const interval = setInterval(() => {
      setBroadcastProgress((p) => (p < 85 ? p + 15 : p));
    }, 300);

    try {
      const res = await fetch(`/api/weddings/${weddingId}/guests/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus: broadcastTargetStatus,
          targetGroup: broadcastTargetGroup,
          customNote: broadcastCustomNote,
        }),
      });

      clearInterval(interval);
      setBroadcastProgress(100);

      const data = await res.json();
      if (res.ok) {
        setBroadcastResult(data);
        toast({
          title: "Broadcast Complete! 🚀",
          description: `Dispatched invitations to ${data.successful} guests.`,
        });
        loadData();
      } else {
        toast({
          title: "Broadcast Failed",
          description: data.error || "Could not complete broadcast",
          variant: "destructive",
        });
      }
    } catch {
      clearInterval(interval);
      toast({ title: "Error", description: "Failed to run broadcast", variant: "destructive" });
    } finally {
      setBroadcasting(false);
    }
  };

  const handleExportBroadcastCSV = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3005";
    let csv = "Name,Phone,Group,Status,RSVP_Link,WhatsApp_Direct_Link,Personal_Invite_Message\n";
    broadcastEligibleGuests.forEach((g) => {
      const primaryRsvp = g.rsvps[0];
      const status = primaryRsvp?.status || "PENDING";
      const groupName = g.group?.name || "General";
      const message = generateInviteMessage(
        g.name,
        wedding?.familyName || "Our Wedding",
        wedding ? formatDate(wedding.weddingDate) : "",
        g.token,
        origin
      ) + (broadcastCustomNote ? `\n\nNote: ${broadcastCustomNote}` : "");
      const waLink = generateWhatsAppLink(g.phone, message);
      const rsvpUrl = `${origin}/rsvp/${g.token}`;

      csv += `"${g.name.replace(/"/g, '""')}","${g.phone}","${groupName}","${status}","${rsvpUrl}","${waLink}","${message.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${wedding?.familyName || "Wedding"}_Bulk_WhatsApp_Invites.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Broadcast CSV Exported! 📥",
      description: `Downloaded ${broadcastEligibleGuests.length} personalized guest messages.`,
    });
  };

  const loadData = async () => {
    try {
      // 1. Fetch wedding info
      const wRes = await fetch(`/api/weddings/${weddingId}`);
      if (wRes.ok) {
        const wData = await wRes.json();
        setWedding({
          id: wData.id,
          familyName: wData.familyName,
          weddingDate: wData.weddingDate,
          venue: wData.venue,
          city: wData.city,
        });
        setGroups(wData.guestGroups || []);
      }

      // 2. Fetch guests
      const gRes = await fetch(`/api/weddings/${weddingId}/guests`);
      if (gRes.ok) {
        const gData = await gRes.json();
        setGuests(gData);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load guest data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (weddingId) loadData();
  }, [weddingId]);

  // Handle single guest creation
  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/weddings/${weddingId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...singleForm,
          groupId: singleForm.groupId === "none" ? null : singleForm.groupId || null,
        }),
      });

      if (res.ok) {
        toast({ title: "Guest added!", description: `${singleForm.name} added to guest list.` });
        setOpenAddModal(false);
        setSingleForm({ name: "", phone: "", email: "", groupId: "", notes: "" });
        loadData();
      } else {
        const err = await res.json();
        toast({ title: "Failed to add", description: err.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not add guest", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle bulk import
  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const lines = bulkText.split("\n").filter((l) => l.trim().length > 0);
      const parsedGuests = lines.map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        return {
          name: parts[0] || "Guest",
          phone: parts[1] || "",
          email: parts[2] || "",
          groupId: null,
        };
      });

      const res = await fetch(`/api/weddings/${weddingId}/guests/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: parsedGuests }),
      });

      if (res.ok) {
        const data = await res.json();
        toast({ title: "Import successful! 🎊", description: data.message });
        setOpenBulkModal(false);
        setBulkText("");
        loadData();
      } else {
        const err = await res.json();
        toast({ title: "Bulk import failed", description: err.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not process bulk import", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete guest
  const handleDeleteConfirm = async () => {
    if (!guestToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/weddings/${weddingId}/guests/${guestToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({ title: "Guest Removed 🗑️", description: `"${guestToDelete.name}" has been removed from your guest list.` });
        setGuests((prev) => prev.filter((g) => g.id !== guestToDelete.id));
        setGuestToDelete(null);
      } else {
        const err = await res.json();
        toast({ title: "Failed to remove", description: err.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to remove guest", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  // Copy RSVP link
  const handleCopyLink = (token: string, name: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3005";
    const url = `${origin}/rsvp/${token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Invitation Link Copied! 📋",
      description: `Personal invite link for ${name} copied to clipboard.`,
    });
  };

  // Copy full invite message for WhatsApp
  const handleCopyInviteMessage = (messageText: string, name: string) => {
    navigator.clipboard.writeText(messageText);
    toast({
      title: "WhatsApp Message Copied! 📋",
      description: `Formatted invitation message for ${name} copied to clipboard.`,
    });
  };

  // Filtered guest list
  const filteredGuests = guests.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.phone.includes(search) ||
      g.email.toLowerCase().includes(search.toLowerCase());

    const matchGroup = selectedGroup === "ALL" || g.groupId === selectedGroup;

    const primaryRsvp = g.rsvps[0];
    const matchStatus =
      selectedStatus === "ALL" ||
      (primaryRsvp && primaryRsvp.status === selectedStatus) ||
      (!primaryRsvp && selectedStatus === "PENDING");

    return matchSearch && matchGroup && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
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
              Guest Directory
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1F1E1C]">
              Guest List &amp; WhatsApp Invitations
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6A63]">
              {wedding?.familyName} • <strong className="text-[#1F1E1C] font-semibold tabular-nums">{guests.length}</strong> Total Registered Guests
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1-Click Bulk WhatsApp Broadcast Button */}
          <Button
            onClick={() => {
              setOpenBroadcastModal(true);
              setBroadcastResult(null);
              setDispatcherIndex(0);
            }}
            className="bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold h-10 px-4 shadow-sm cursor-pointer flex items-center gap-2 transition-all"
          >
            <Send className="w-4 h-4" />
            1-Click WhatsApp Broadcast
          </Button>

          {/* Bulk Import Dialog */}
          <Dialog open={openBulkModal} onOpenChange={setOpenBulkModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[#EAE5DF] text-xs font-medium h-10 px-3.5 cursor-pointer hover:border-[#C5A059]">
                <Upload className="w-3.5 h-3.5 mr-1.5 text-[#C5A059]" />
                Bulk CSV Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white border-[#EAE5DF] rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl font-bold text-[#1F1E1C]">
                  Bulk Import Guests
                </DialogTitle>
                <DialogDescription className="text-xs text-[#6E6A63] pt-1">
                  Paste multiple guests, one per line in the format: <br />
                  <code className="bg-[#FAF8F5] text-[#C5A059] border border-[#EAE5DF] px-1.5 py-0.5 rounded font-mono text-[11px] mt-1 inline-block">
                    Name, Phone, Email
                  </code>
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleBulkImport} className="space-y-4 pt-2">
                <textarea
                  rows={6}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`Sharma Uncle, +919811122233, sharma@gmail.com\nAnkit Patel, +919822233344, ankit@patel.com\nMeera Nair, +919833344455`}
                  required
                  className="w-full text-xs font-mono p-3.5 rounded-[10px] border border-[#EAE5DF] focus:border-[#C5A059] outline-none"
                />

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenBulkModal(false)}
                    className="border-[#EAE5DF] cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#C5A059] hover:bg-[#B08D47] text-white cursor-pointer"
                  >
                    {submitting ? "Importing..." : "Import Guests"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Add Single Guest Dialog */}
          <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
            <DialogTrigger asChild>
              <Button className="bg-[#C5A059] hover:bg-[#B08D47] text-white text-xs font-medium h-10 px-4 shadow-sm cursor-pointer">
                <Plus className="w-4 h-4 mr-1.5" />
                Add Guest
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white border-[#EAE5DF] rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl font-bold text-[#1F1E1C]">
                  Add Wedding Guest
                </DialogTitle>
                <DialogDescription className="text-xs text-[#6E6A63] pt-1">
                  We will generate a unique WhatsApp invitation link for this guest.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddSingle} className="space-y-3.5 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="gname" className="text-xs font-semibold text-[#6E6A63]">
                    Guest / Family Name *
                  </Label>
                  <Input
                    id="gname"
                    placeholder="e.g. Ramesh Uncle & Family"
                    value={singleForm.name}
                    onChange={(e) => setSingleForm({ ...singleForm, name: e.target.value })}
                    required
                    className="h-10 border-[#EAE5DF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="gphone" className="text-xs font-semibold text-[#6E6A63]">
                      WhatsApp Number
                    </Label>
                    <Input
                      id="gphone"
                      placeholder="+91 98765 43210"
                      value={singleForm.phone}
                      onChange={(e) => setSingleForm({ ...singleForm, phone: e.target.value })}
                      className="h-10 border-[#EAE5DF]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="gemail" className="text-xs font-semibold text-[#6E6A63]">
                      Email (Optional)
                    </Label>
                    <Input
                      id="gemail"
                      type="email"
                      placeholder="ramesh@gmail.com"
                      value={singleForm.email}
                      onChange={(e) => setSingleForm({ ...singleForm, email: e.target.value })}
                      className="h-10 border-[#EAE5DF]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ggroup" className="text-xs font-semibold text-[#6E6A63]">
                    Guest Group
                  </Label>
                  <select
                    id="ggroup"
                    value={singleForm.groupId}
                    onChange={(e) => setSingleForm({ ...singleForm, groupId: e.target.value })}
                    className="w-full h-10 rounded-[10px] border border-[#EAE5DF] bg-white px-3 text-xs text-[#1F1E1C] outline-none focus:border-[#C5A059]"
                  >
                    <option value="none">-- No Group / General --</option>
                    {groups.map((grp) => (
                      <option key={grp.id} value={grp.id}>
                        {grp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="gnotes" className="text-xs font-semibold text-[#6E6A63]">
                    Organizer Notes (Internal)
                  </Label>
                  <Input
                    id="gnotes"
                    placeholder="e.g. Ladkewale, strict Jain, needs ground floor room"
                    value={singleForm.notes}
                    onChange={(e) => setSingleForm({ ...singleForm, notes: e.target.value })}
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
                    {submitting ? "Adding..." : "Add Guest & Generate Link"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Export Broadcast CSV */}
          <Button
            variant="outline"
            onClick={handleExportBroadcastCSV}
            title="Download formatted spreadsheet for WhatsApp bulk tools"
            className="border-[#EAE5DF] text-[#1F1E1C] hover:border-[#C5A059] text-xs font-medium h-10 px-3 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-[#C5A059]" />
            Export WhatsApp CSV
          </Button>
        </div>
      </div>

      {/* 1-Click WhatsApp Broadcast Center Dialog */}
      <Dialog open={openBroadcastModal} onOpenChange={setOpenBroadcastModal}>
        <DialogContent className="max-w-lg bg-white border-[#EAE5DF] rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="pb-3 border-b border-[#EAE5DF]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 text-[#25D366] flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="font-serif text-xl font-bold text-[#1F1E1C]">
                    WhatsApp Broadcast
                  </DialogTitle>
                  <DialogDescription className="text-[11px] text-[#6E6A63]">
                    Send personalized invitations in one click
                  </DialogDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5 tabular-nums">
                {broadcastEligibleGuests.length} Recipients
              </Badge>
            </div>
          </DialogHeader>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#FAF8F5] rounded-xl border border-[#EAE5DF] my-3 text-xs">
            <button
              type="button"
              onClick={() => setBroadcastTab("AUTOMATED")}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                broadcastTab === "AUTOMATED"
                  ? "bg-white text-[#1F1E1C] shadow-sm font-semibold border border-[#EAE5DF]"
                  : "text-[#6E6A63] hover:text-[#1F1E1C]"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#C5A059]" />
              1-Click Send
            </button>
            <button
              type="button"
              onClick={() => setBroadcastTab("DISPATCHER")}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                broadcastTab === "DISPATCHER"
                  ? "bg-white text-[#1F1E1C] shadow-sm font-semibold border border-[#EAE5DF]"
                  : "text-[#6E6A63] hover:text-[#1F1E1C]"
              }`}
            >
              <Play className="w-3.5 h-3.5 text-[#25D366]" />
              Step Queue
            </button>
            <button
              type="button"
              onClick={() => setBroadcastTab("EXPORT")}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                broadcastTab === "EXPORT"
                  ? "bg-white text-[#1F1E1C] shadow-sm font-semibold border border-[#EAE5DF]"
                  : "text-[#6E6A63] hover:text-[#1F1E1C]"
              }`}
            >
              <Download className="w-3.5 h-3.5 text-[#7A8B74]" />
              Export CSV
            </button>
          </div>

          {/* Audience Filter Bar */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-[10px] font-semibold uppercase text-[#6E6A63] block mb-1">Send To</label>
              <select
                value={broadcastTargetStatus}
                onChange={(e) => {
                  setBroadcastTargetStatus(e.target.value);
                  setDispatcherIndex(0);
                }}
                className="w-full h-8 rounded-lg border border-[#EAE5DF] bg-[#FAF8F5] px-2 text-xs text-[#1F1E1C] outline-none focus:border-[#C5A059]"
              >
                <option value="ALL">All Registered ({guests.length})</option>
                <option value="PENDING">Awaiting Response ({guests.filter(g => (g.rsvps[0]?.status || "PENDING") === "PENDING").length})</option>
                <option value="CONFIRMED">Confirmed Only</option>
                <option value="MAYBE">Tentative Only</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase text-[#6E6A63] block mb-1">Guest Group</label>
              <select
                value={broadcastTargetGroup}
                onChange={(e) => {
                  setBroadcastTargetGroup(e.target.value);
                  setDispatcherIndex(0);
                }}
                className="w-full h-8 rounded-lg border border-[#EAE5DF] bg-[#FAF8F5] px-2 text-xs text-[#1F1E1C] outline-none focus:border-[#C5A059]"
              >
                <option value="ALL">All Groups</option>
                {groups.map((grp) => (
                  <option key={grp.id} value={grp.id}>{grp.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Note input */}
          <div className="mb-3">
            <Input
              placeholder="Add an optional note (e.g. Please confirm before Friday for catering)..."
              value={broadcastCustomNote}
              onChange={(e) => setBroadcastCustomNote(e.target.value)}
              className="h-8 text-xs border-[#EAE5DF] bg-[#FAF8F5] placeholder:text-[#6E6A63]/60"
            />
          </div>

          {/* TAB 1: 1-Click Automated Broadcast */}
          {broadcastTab === "AUTOMATED" && (
            <div className="space-y-3">
              {/* Message Live Preview Card */}
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DF] text-xs text-[#1F1E1C] space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#6E6A63] font-medium border-b border-[#EAE5DF] pb-1.5 mb-1.5">
                  <span>Sample Preview ({broadcastEligibleGuests[0]?.name || "Guest"})</span>
                  <span className="text-[#25D366] font-semibold flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> WhatsApp Invite
                  </span>
                </div>
                <p className="line-clamp-2 text-[#6E6A63] italic">
                  &ldquo;Namaste {broadcastEligibleGuests[0]?.name || "Guest"}! You are cordially invited to {wedding?.familyName || "Our Wedding"} on {wedding ? formatDate(wedding.weddingDate) : ""}...&rdquo;
                </p>
              </div>

              {/* Progress bar when broadcasting */}
              {broadcasting && (
                <div className="space-y-1.5 p-3 rounded-xl bg-stone-50 border border-[#EAE5DF]">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#1F1E1C]">
                    <span className="flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A059] animate-spin" />
                      Sending to {broadcastEligibleGuests.length} guests...
                    </span>
                    <span className="tabular-nums text-xs">{broadcastProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className="h-full bg-[#25D366] transition-all duration-300"
                      style={{ width: `${broadcastProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Broadcast Result Summary */}
              {broadcastResult && (
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Dispatched to <strong>{broadcastResult.successful}</strong> of {broadcastResult.totalTargets} guests</span>
                  </div>
                  {broadcastResult.failed > 0 && (
                    <span className="text-rose-600 text-[11px] font-medium">({broadcastResult.failed} missing phone)</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE5DF]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenBroadcastModal(false)}
                  disabled={broadcasting}
                  className="h-9 px-3.5 text-xs border-[#EAE5DF] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleBulkBroadcast}
                  disabled={broadcasting || broadcastEligibleGuests.length === 0}
                  className="h-9 px-4 text-xs font-semibold bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  {broadcasting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send to All {broadcastEligibleGuests.length} Guests
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: Rapid WhatsApp Queue Dispatcher */}
          {broadcastTab === "DISPATCHER" && (
            <div className="space-y-3">
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE5DF] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-[#6E6A63] uppercase tracking-wider">
                    Guest {dispatcherIndex + 1} of {broadcastEligibleGuests.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={dispatcherIndex === 0}
                      onClick={() => setDispatcherIndex((p) => Math.max(0, p - 1))}
                      className="h-6 px-2 text-[10px] border-[#EAE5DF]"
                    >
                      Prev
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={dispatcherIndex >= broadcastEligibleGuests.length - 1}
                      onClick={() => setDispatcherIndex((p) => Math.min(broadcastEligibleGuests.length - 1, p + 1))}
                      className="h-6 px-2 text-[10px] border-[#EAE5DF]"
                    >
                      Skip
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-[#EAE5DF]">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#1F1E1C]">
                      {currentDispatcherGuest?.name}
                    </h4>
                    <p className="text-[11px] text-[#6E6A63]">
                      📞 {currentDispatcherGuest?.phone || "No phone number"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleDispatcherSendAndNext}
                    className="h-8 px-3 text-xs bg-[#25D366] hover:bg-[#1EBE5D] text-white font-medium cursor-pointer"
                  >
                    Open &amp; Next ➡️
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-[#EAE5DF]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenBroadcastModal(false)}
                  className="h-9 px-3.5 text-xs border-[#EAE5DF] cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: Bulk Sender CSV Export */}
          {broadcastTab === "EXPORT" && (
            <div className="space-y-3">
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE5DF] space-y-3">
                <p className="text-xs text-[#6E6A63] leading-relaxed">
                  Export pre-formatted CSV with personalized RSVP links for WhatsApp bulk sender extensions (WAPlus, WA Sender) or WhatsApp Business broadcast lists.
                </p>
                <Button
                  type="button"
                  onClick={handleExportBroadcastCSV}
                  className="w-full bg-[#7A8B74] hover:bg-[#687863] text-white text-xs font-semibold h-9 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download Broadcast CSV ({broadcastEligibleGuests.length} Guests)
                </Button>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-[#EAE5DF]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenBroadcastModal(false)}
                  className="h-9 px-3.5 text-xs border-[#EAE5DF] cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-[#EAE5DF] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#6E6A63] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-xs border-[#EAE5DF]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 text-xs rounded-[10px] border border-[#EAE5DF] bg-white px-3 text-[#1F1E1C] outline-none focus:border-[#C5A059]"
          >
            <option value="ALL">All Attendance Statuses</option>
            <option value="CONFIRMED">Confirmed Coming</option>
            <option value="PENDING">Awaiting Response</option>
            <option value="MAYBE">Tentative / Maybe</option>
            <option value="DECLINED">Cannot Attend (Declined)</option>
          </select>

          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="h-10 text-xs rounded-[10px] border border-[#EAE5DF] bg-white px-3 text-[#1F1E1C] outline-none focus:border-[#C5A059]"
          >
            <option value="ALL">All Guest Groups</option>
            {groups.map((grp) => (
              <option key={grp.id} value={grp.id}>
                {grp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Guests Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-[#EAE5DF] animate-pulse" />
          ))}
        </div>
      ) : filteredGuests.length === 0 ? (
        <Card className="border-[#EAE5DF] p-12 text-center bg-white">
          <Users className="w-12 h-12 text-[#6E6A63]/50 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#1F1E1C]">No Guests Found</h3>
          <p className="text-xs text-[#6E6A63] mt-1 mb-4">
            {search ? "No guests match your search query." : "Start by adding your first wedding guest."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredGuests.map((guest) => {
            const primaryRsvp = guest.rsvps[0];
            const status = primaryRsvp?.status || "PENDING";
            const partySize = primaryRsvp?.partySize || 1;

            // Generate WhatsApp Link
            const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3005";
            const message = generateInviteMessage(
              guest.name,
              wedding?.familyName || "Our Wedding",
              wedding ? formatDate(wedding.weddingDate) : "",
              guest.token,
              origin
            );
            const waLink = generateWhatsAppLink(guest.phone, message);

            return (
              <Card
                key={guest.id}
                className="border-[#EAE5DF] bg-white hover:border-[#C5A059]/40 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] transition-all p-4 sm:p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Guest Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#EAE5DF] flex items-center justify-center font-serif font-bold text-sm text-[#C5A059] shrink-0">
                      {guest.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-serif text-base font-bold text-[#1F1E1C]">{guest.name}</h4>
                        {guest.group && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${guest.group.color}15`,
                              color: guest.group.color,
                            }}
                          >
                            {guest.group.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#6E6A63] mt-1">
                        {guest.phone && <span className="tabular-nums">📞 {guest.phone}</span>}
                        {guest.notes && <span className="italic truncate max-w-xs text-stone-500">📝 {guest.notes}</span>}
                      </div>
                    </div>
                  </div>

                  {/* RSVP Status & Headcount */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {status === "CONFIRMED" && (
                      <div className="flex items-center gap-2 bg-[#F2F5F0] border border-[#7A8B74]/20 px-3 py-1.5 rounded-full text-[#7A8B74]">
                        <CheckCircle2 className="w-4 h-4 text-[#7A8B74]" />
                        <span className="text-xs font-semibold tabular-nums">
                          Confirmed ({partySize} {partySize === 1 ? "Person" : "People"})
                        </span>
                        <div className="text-[10px] font-medium text-[#7A8B74] ml-1 border-l border-[#7A8B74]/30 pl-2 tabular-nums">
                          {primaryRsvp?.vegCount > 0 && `${primaryRsvp.vegCount} Veg `}
                          {primaryRsvp?.jainCount > 0 && `${primaryRsvp.jainCount} Jain `}
                          {primaryRsvp?.nonVegCount > 0 && `${primaryRsvp.nonVegCount} Non-Veg `}
                        </div>
                      </div>
                    )}

                    {status === "PENDING" && (
                      <div className="flex items-center gap-1.5 bg-[#FDF8EE] border border-[#C5A059]/20 px-3 py-1.5 rounded-full text-[#C5A059]">
                        <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span className="text-xs font-semibold">Pending Confirmation</span>
                      </div>
                    )}

                    {status === "DECLINED" && (
                      <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full text-rose-700">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-xs font-semibold">Cannot Attend</span>
                      </div>
                    )}

                    {status === "MAYBE" && (
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-amber-700">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs font-semibold">Tentative</span>
                      </div>
                    )}

                    {/* Actions: WhatsApp Send, Copy Link, Open */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Send invite or reminder on WhatsApp"
                      >
                        <Button
                          size="sm"
                          className="bg-[#25D366] hover:bg-[#1EBE5D] text-white font-medium text-xs h-8 px-2.5 cursor-pointer shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5 mr-1" />
                          WhatsApp
                        </Button>
                      </a>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyInviteMessage(message, guest.name)}
                        title="Copy Formatted WhatsApp Message"
                        className="h-8 px-2.5 border-[#EAE5DF] text-[#1F1E1C] hover:text-[#C5A059] hover:border-[#C5A059] text-xs font-medium cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        Copy Message
                      </Button>

                      <a
                        href={`/rsvp/${guest.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open RSVP page"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 border-[#EAE5DF] text-[#6E6A63] hover:text-[#C5A059] cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setGuestToDelete(guest)}
                        className="h-8 px-2 text-[#6E6A63] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove Guest"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Guest Confirmation Dialog */}
      <Dialog open={!!guestToDelete} onOpenChange={(open) => !open && setGuestToDelete(null)}>
        <DialogContent className="max-w-md bg-white border-[#EAE5DF] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-rose-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              Remove Guest?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6E6A63] pt-2 leading-relaxed">
              Are you sure you want to remove <strong className="text-[#1F1E1C] font-semibold">&quot;{guestToDelete?.name}&quot;</strong> from your guest list?
              <br /><br />
              Their attendance confirmation, number of family members, and meal preferences will also be removed. <strong className="text-rose-600">This action cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setGuestToDelete(null)}
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
              {deleting ? "Removing..." : "Yes, Remove Guest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function GuestsPage() {
  return (
    <React.Suspense fallback={<div className="h-64 w-full bg-white rounded-2xl border border-[#EAE5DF] animate-pulse" />}>
      <GuestsPageInner />
    </React.Suspense>
  );
}
