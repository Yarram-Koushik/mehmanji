"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Plus, CalendarHeart, MapPin, Users, ArrowRight, Sparkles, Trash2, Calendar, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface WeddingItem {
  id: string;
  familyName: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  city: string;
  themeColor: string;
  _count: {
    guests: number;
    events: number;
  };
}

export default function WeddingsPage() {
  const { toast } = useToast();
  const [weddings, setWeddings] = React.useState<WeddingItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [weddingToDelete, setWeddingToDelete] = React.useState<WeddingItem | null>(null);
  const [deleting, setDeleting] = React.useState(false);

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

  const [formData, setFormData] = React.useState({
    brideName: "",
    groomName: "",
    familyName: "",
    weddingDate: new Date().toISOString().split("T")[0],
    venue: "",
    city: "",
    themeColor: "#C5A059",
    includeDefaultFunctions: true,
  });

  const loadWeddings = async () => {
    try {
      const res = await fetch("/api/weddings");
      if (res.ok) {
        const data = await res.json();
        setWeddings(data);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load weddings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadWeddings();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/weddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast({
          title: "Shaadi Mubarak! 🎊",
          description: formData.includeDefaultFunctions
            ? "Wedding created with default Mehendi, Sangeet & Reception events."
            : "Wedding created successfully. You can now add custom functions.",
        });
        setOpenModal(false);
        setFormData({
          brideName: "",
          groomName: "",
          familyName: "",
          weddingDate: new Date().toISOString().split("T")[0],
          venue: "",
          city: "",
          themeColor: "#C5A059",
          includeDefaultFunctions: true,
        });
        loadWeddings();
      } else {
        const err = await res.json();
        toast({ title: "Failed to create", description: err.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not create wedding", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

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
        setWeddings((prev) => prev.filter((w) => w.id !== weddingToDelete.id));
        setWeddingToDelete(null);
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

  const updateBrideOrGroom = (field: "brideName" | "groomName", val: string) => {
    const updated = { ...formData, [field]: val };
    if (!formData.familyName || formData.familyName.includes("&") || formData.familyName.includes("Wedding")) {
      const b = field === "brideName" ? val : formData.brideName;
      const g = field === "groomName" ? val : formData.groomName;
      if (b && g) {
        updated.familyName = `The ${b} & ${g} Wedding`;
      }
    }
    setFormData(updated);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE5DF]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#FBF8F1] border border-[#C5A059]/30 text-[#C5A059] text-[11px] font-semibold tracking-wider uppercase mb-1.5">
            <Sparkles className="w-3 h-3" />
            Celebration Portfolio
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1F1E1C]">
            Weddings &amp; Celebrations
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6A63] mt-1">
            Manage multiple client weddings or family celebrations with precision.
          </p>
        </div>

        {/* Create Wedding Dialog */}
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button className="bg-[#C5A059] hover:bg-[#B08D47] text-white shadow-sm font-medium text-xs sm:text-sm cursor-pointer h-10 px-4">
              <Plus className="w-4 h-4 mr-1.5" />
              New Wedding
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white border-[#EAE5DF] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-bold text-[#1F1E1C]">
                Create New Wedding
              </DialogTitle>
              <DialogDescription className="text-xs text-[#6E6A63] pt-1 leading-relaxed">
                Enter wedding celebration details and choose whether to include default ceremonies.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bride" className="text-xs font-semibold text-[#6E6A63]">
                    Bride&apos;s Name
                  </Label>
                  <Input
                    id="bride"
                    placeholder="e.g. Priya"
                    value={formData.brideName}
                    onChange={(e) => updateBrideOrGroom("brideName", e.target.value)}
                    required
                    className="h-10 border-[#EAE5DF]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="groom" className="text-xs font-semibold text-[#6E6A63]">
                    Groom&apos;s Name
                  </Label>
                  <Input
                    id="groom"
                    placeholder="e.g. Rohan"
                    value={formData.groomName}
                    onChange={(e) => updateBrideOrGroom("groomName", e.target.value)}
                    required
                    className="h-10 border-[#EAE5DF]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="family" className="text-xs font-semibold text-[#6E6A63]">
                  Wedding Title / Family Name
                </Label>
                <Input
                  id="family"
                  placeholder="e.g. The Sharma &amp; Patel Wedding"
                  value={formData.familyName}
                  onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                  required
                  className="h-10 border-[#EAE5DF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="date" className="text-xs font-semibold text-[#6E6A63]">
                    Main Wedding Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.weddingDate}
                    onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                    required
                    className="h-10 border-[#EAE5DF]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-semibold text-[#6E6A63]">
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g. Jaipur, Rajasthan"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="h-10 border-[#EAE5DF]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="venue" className="text-xs font-semibold text-[#6E6A63]">
                  Main Venue Name
                </Label>
                <Input
                  id="venue"
                  placeholder="e.g. The Grand Palace &amp; Lawns"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  required
                  className="h-10 border-[#EAE5DF]"
                />
              </div>

              {/* Default Functions Toggle */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EAE5DF] flex items-center justify-between gap-3">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F1E1C]">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Include Default Functions</span>
                  </div>
                  <p className="text-[11px] text-[#6E6A63] leading-snug">
                    {formData.includeDefaultFunctions
                      ? "Pre-create standard ceremonies (Mehendi, Sangeet, Pheras & Reception). Timings can be edited anytime."
                      : "Create a blank wedding. You can add your custom functions manually."}
                  </p>
                </div>
                <Switch
                  checked={formData.includeDefaultFunctions}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, includeDefaultFunctions: checked })
                  }
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenModal(false)}
                  className="border-[#EAE5DF] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#C5A059] hover:bg-[#B08D47] text-white cursor-pointer"
                >
                  {submitting ? "Creating..." : "Create Wedding"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid of Weddings */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 bg-white rounded-2xl border border-[#EAE5DF] animate-pulse" />
          ))}
        </div>
      ) : weddings.length === 0 ? (
        <Card className="border-[#EAE5DF] p-12 text-center bg-white">
          <CalendarHeart className="w-12 h-12 text-[#C5A059] mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#1F1E1C]">No Weddings Found</h3>
          <p className="text-xs text-[#6E6A63] mt-1 mb-4">
            Click the button above to register your first wedding celebration.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weddings.map((w) => (
            <Card
              key={w.id}
              className="border-[#EAE5DF] bg-white hover:border-[#C5A059]/50 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3 p-6">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider">
                    {w.city}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(w)}
                      className="h-7 px-2 text-[11px] font-medium text-[#1F1E1C] border-[#EAE5DF] hover:border-[#C5A059] hover:text-[#C5A059] transition-colors cursor-pointer"
                      title="Edit Wedding Details"
                    >
                      <Pencil className="w-3 h-3 mr-1 text-[#C5A059]" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWeddingToDelete(w)}
                      className="h-7 px-2 text-[11px] font-medium text-rose-600 border-rose-200 bg-rose-50/50 hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer"
                      title="Delete Wedding"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
                <CardTitle className="font-serif text-xl font-bold text-[#1F1E1C] mt-2.5">
                  {w.familyName}
                </CardTitle>
                <CardDescription className="text-xs text-[#6E6A63] font-medium">
                  {w.brideName} &amp; {w.groomName}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 px-6 pb-6">
                <div className="flex items-center justify-between text-xs text-[#6E6A63]">
                  <span className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-[#C5A059]" />
                    <span className="truncate">{w.venue}</span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums ml-2">
                    {formatDate(w.weddingDate)}
                  </span>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EAE5DF] flex items-center justify-around text-center">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-[#6E6A63] block">
                      Guests
                    </span>
                    <span className="font-serif text-lg font-bold text-[#1F1E1C] tabular-nums">
                      {w._count.guests}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-[#EAE5DF]" />
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-[#6E6A63] block">
                      Ceremonies
                    </span>
                    <span className="font-serif text-lg font-bold text-[#C5A059] tabular-nums">
                      {w._count.events}
                    </span>
                  </div>
                </div>

                <Link href={`/weddings/${w.id}`} className="block">
                  <Button className="w-full bg-[#1F2E23] hover:bg-[#152018] text-white text-xs font-medium h-9 cursor-pointer">
                    Manage Wedding &amp; Guests
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#C5A059]" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
                <Label htmlFor="list-edit-bride" className="text-xs font-semibold text-[#6E6A63]">
                  Bride&apos;s Name
                </Label>
                <Input
                  id="list-edit-bride"
                  value={editFormData.brideName}
                  onChange={(e) => setEditFormData({ ...editFormData, brideName: e.target.value })}
                  required
                  className="h-10 border-[#EAE5DF]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="list-edit-groom" className="text-xs font-semibold text-[#6E6A63]">
                  Groom&apos;s Name
                </Label>
                <Input
                  id="list-edit-groom"
                  value={editFormData.groomName}
                  onChange={(e) => setEditFormData({ ...editFormData, groomName: e.target.value })}
                  required
                  className="h-10 border-[#EAE5DF]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="list-edit-family" className="text-xs font-semibold text-[#6E6A63]">
                Wedding Title / Family Name
              </Label>
              <Input
                id="list-edit-family"
                value={editFormData.familyName}
                onChange={(e) => setEditFormData({ ...editFormData, familyName: e.target.value })}
                required
                className="h-10 border-[#EAE5DF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="list-edit-date" className="text-xs font-semibold text-[#6E6A63]">
                  Main Wedding Date
                </Label>
                <Input
                  id="list-edit-date"
                  type="date"
                  value={editFormData.weddingDate}
                  onChange={(e) => setEditFormData({ ...editFormData, weddingDate: e.target.value })}
                  required
                  className="h-10 border-[#EAE5DF]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="list-edit-city" className="text-xs font-semibold text-[#6E6A63]">
                  City
                </Label>
                <Input
                  id="list-edit-city"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                  required
                  className="h-10 border-[#EAE5DF]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="list-edit-venue" className="text-xs font-semibold text-[#6E6A63]">
                Main Venue Name
              </Label>
              <Input
                id="list-edit-venue"
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
    </div>
  );
}
