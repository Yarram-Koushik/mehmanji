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
      // Parse CSV or lines: "Name, Phone, Email"
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
  const handleDeleteGuest = async (guestId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;

    try {
      const res = await fetch(`/api/weddings/${weddingId}/guests/${guestId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({ title: "Guest removed", description: `${name} has been removed.` });
        setGuests(guests.filter((g) => g.id !== guestId));
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete guest", variant: "destructive" });
    }
  };

  // Copy RSVP link
  const handleCopyLink = (token: string, name: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const url = `${origin}/rsvp/${token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "RSVP Link Copied! 📋",
      description: `Sharable link for ${name} copied to clipboard.`,
    });
  };

  // Filtered guest list
  const filteredGuests = guests.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.phone.includes(search) ||
      g.email.toLowerCase().includes(search.toLowerCase());

    const matchGroup = selectedGroup === "ALL" || g.groupId === selectedGroup;

    // Check main event status
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD3]">
        <div className="flex items-center gap-3">
          <Link href={`/weddings/${weddingId}`}>
            <Button variant="ghost" size="sm" className="p-2 h-auto text-[#78716C] hover:text-[#1C1917]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1C1917]">
              Guest List &amp; WhatsApp Invitations
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C]">
              {wedding?.familyName} • {guests.length} Total Registered Guests
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {/* Bulk Import Dialog */}
          <Dialog open={openBulkModal} onOpenChange={setOpenBulkModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[#E8DDD3] text-xs font-semibold h-9 cursor-pointer">
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Bulk CSV Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white border-[#E8DDD3]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-[#1C1917]">
                  Bulk Import Guests
                </DialogTitle>
                <DialogDescription className="text-xs text-[#78716C]">
                  Paste multiple guests, one per line in the format: <br />
                  <code className="bg-[#FFFBF5] text-[#B91C6C] px-1 py-0.5 rounded font-mono text-[11px]">
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
                  className="w-full text-xs font-mono p-3 rounded-lg border border-[#E8DDD3] focus:border-[#B91C6C] outline-none"
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenBulkModal(false)}
                    className="border-[#E8DDD3]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#B91C6C] hover:bg-[#9D174D] text-white"
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
              <Button className="bg-[#B91C6C] hover:bg-[#9D174D] text-white text-xs font-semibold h-9 shadow-sm cursor-pointer">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Guest
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white border-[#E8DDD3]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-[#1C1917]">
                  Add Wedding Guest
                </DialogTitle>
                <DialogDescription className="text-xs text-[#78716C]">
                  We will generate a unique WhatsApp invitation link for this guest.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddSingle} className="space-y-3.5 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="gname" className="text-xs font-semibold text-[#78716C]">
                    Guest / Family Name *
                  </Label>
                  <Input
                    id="gname"
                    placeholder="e.g. Ramesh Uncle & Family"
                    value={singleForm.name}
                    onChange={(e) => setSingleForm({ ...singleForm, name: e.target.value })}
                    required
                    className="h-9 border-[#E8DDD3]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="gphone" className="text-xs font-semibold text-[#78716C]">
                      WhatsApp Number
                    </Label>
                    <Input
                      id="gphone"
                      placeholder="+91 98765 43210"
                      value={singleForm.phone}
                      onChange={(e) => setSingleForm({ ...singleForm, phone: e.target.value })}
                      className="h-9 border-[#E8DDD3]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="gemail" className="text-xs font-semibold text-[#78716C]">
                      Email (Optional)
                    </Label>
                    <Input
                      id="gemail"
                      type="email"
                      placeholder="ramesh@gmail.com"
                      value={singleForm.email}
                      onChange={(e) => setSingleForm({ ...singleForm, email: e.target.value })}
                      className="h-9 border-[#E8DDD3]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ggroup" className="text-xs font-semibold text-[#78716C]">
                    Guest Group
                  </Label>
                  <select
                    id="ggroup"
                    value={singleForm.groupId}
                    onChange={(e) => setSingleForm({ ...singleForm, groupId: e.target.value })}
                    className="w-full h-9 rounded-md border border-[#E8DDD3] bg-white px-3 text-xs text-[#1C1917] outline-none"
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
                  <Label htmlFor="gnotes" className="text-xs font-semibold text-[#78716C]">
                    Organizer Notes (Internal)
                  </Label>
                  <Input
                    id="gnotes"
                    placeholder="e.g. Ladkewale, strict Jain, needs ground floor room"
                    value={singleForm.notes}
                    onChange={(e) => setSingleForm({ ...singleForm, notes: e.target.value })}
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
                    {submitting ? "Adding..." : "Add Guest & Generate Link"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-[#E8DDD3] shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs border-[#E8DDD3]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 text-xs rounded-lg border border-[#E8DDD3] bg-white px-2.5 text-[#1C1917] outline-none"
          >
            <option value="ALL">All RSVP Statuses</option>
            <option value="CONFIRMED">Confirmed Coming</option>
            <option value="PENDING">Pending Response</option>
            <option value="MAYBE">Tentative / Maybe</option>
            <option value="DECLINED">Declined</option>
          </select>

          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="h-9 text-xs rounded-lg border border-[#E8DDD3] bg-white px-2.5 text-[#1C1917] outline-none"
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
            <div key={i} className="h-16 bg-stone-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredGuests.length === 0 ? (
        <Card className="border-[#E8DDD3] p-12 text-center bg-white">
          <Users className="w-12 h-12 text-[#78716C]/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1C1917]">No Guests Found</h3>
          <p className="text-xs text-[#78716C] mt-1 mb-4">
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
            const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
            const rsvpUrl = `${origin}/rsvp/${guest.token}`;
            const message = generateInviteMessage(
              guest.name,
              wedding?.familyName || "Our Wedding",
              wedding ? formatDate(wedding.weddingDate) : "",
              guest.token
            );
            const waLink = generateWhatsAppLink(guest.phone, message);

            return (
              <Card
                key={guest.id}
                className="border-[#E8DDD3] bg-white hover:border-[#B91C6C]/30 transition-colors p-4 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Guest Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#FFFBF5] border border-[#E8DDD3] flex items-center justify-center font-bold text-sm text-[#B91C6C] shrink-0">
                      {guest.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-[#1C1917]">{guest.name}</h4>
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

                      <div className="flex items-center gap-3 text-xs text-[#78716C] mt-0.5">
                        {guest.phone && <span>📞 {guest.phone}</span>}
                        {guest.notes && <span className="italic truncate max-w-xs">📝 {guest.notes}</span>}
                      </div>
                    </div>
                  </div>

                  {/* RSVP Status & Headcount */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {status === "CONFIRMED" && (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold">
                          Confirmed ({partySize} {partySize === 1 ? "Person" : "People"})
                        </span>
                        <div className="text-[10px] font-semibold text-emerald-700 ml-1 border-l border-emerald-300 pl-2">
                          {primaryRsvp?.vegCount > 0 && `${primaryRsvp.vegCount} Veg `}
                          {primaryRsvp?.jainCount > 0 && `${primaryRsvp.jainCount} Jain `}
                          {primaryRsvp?.nonVegCount > 0 && `${primaryRsvp.nonVegCount} Non-Veg `}
                        </div>
                      </div>
                    )}

                    {status === "PENDING" && (
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-amber-800">
                        <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                        <span className="text-xs font-bold">Pending Confirmation</span>
                      </div>
                    )}

                    {status === "DECLINED" && (
                      <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg text-red-800">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span className="text-xs font-bold">Cannot Attend</span>
                      </div>
                    )}

                    {status === "MAYBE" && (
                      <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-blue-800">
                        <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-bold">Tentative</span>
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
                          className="bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs h-8 px-2.5 cursor-pointer shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5 mr-1" />
                          WhatsApp
                        </Button>
                      </a>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(guest.token, guest.name)}
                        title="Copy Guest RSVP Link"
                        className="h-8 px-2.5 border-[#E8DDD3] text-[#1C1917] cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
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
                          className="h-8 px-2.5 border-[#E8DDD3] text-[#78716C] hover:text-[#B91C6C] cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGuest(guest.id, guest.name)}
                        className="h-8 px-2 text-[#78716C] hover:text-red-600 cursor-pointer"
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
    </div>
  );
}

export default function GuestsPage() {
  return (
    <React.Suspense fallback={<div className="h-64 w-full bg-stone-200 rounded-2xl animate-pulse" />}>
      <GuestsPageInner />
    </React.Suspense>
  );
}
