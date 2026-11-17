"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Plus, CalendarHeart, MapPin, Users, ArrowRight, Sparkles } from "lucide-react";
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

  const [formData, setFormData] = React.useState({
    brideName: "",
    groomName: "",
    familyName: "",
    weddingDate: new Date().toISOString().split("T")[0],
    venue: "",
    city: "",
    themeColor: "#B91C6C",
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
          description: "Wedding created with default Mehendi, Sangeet & Reception events.",
        });
        setOpenModal(false);
        setFormData({
          brideName: "",
          groomName: "",
          familyName: "",
          weddingDate: new Date().toISOString().split("T")[0],
          venue: "",
          city: "",
          themeColor: "#B91C6C",
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

  // Auto-generate family name suggestion when bride/groom typed
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD3]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1C1917]">
            Weddings &amp; Celebrations
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            Manage multiple client weddings or family celebrations in one place.
          </p>
        </div>

        {/* Create Wedding Dialog */}
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button className="bg-[#B91C6C] hover:bg-[#9D174D] text-white shadow-sm font-semibold text-xs sm:text-sm cursor-pointer">
              <Plus className="w-4 h-4 mr-1.5" />
              New Wedding
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white border-[#E8DDD3]">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#1C1917]">
                Create New Wedding
              </DialogTitle>
              <DialogDescription className="text-xs text-[#78716C]">
                We will automatically setup standard Indian sub-events (Mehendi, Sangeet, Pheras, Reception) which you can customize anytime.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bride" className="text-xs font-semibold text-[#78716C]">
                    Bride&apos;s Name
                  </Label>
                  <Input
                    id="bride"
                    placeholder="e.g. Priya"
                    value={formData.brideName}
                    onChange={(e) => updateBrideOrGroom("brideName", e.target.value)}
                    required
                    className="h-9 border-[#E8DDD3]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="groom" className="text-xs font-semibold text-[#78716C]">
                    Groom&apos;s Name
                  </Label>
                  <Input
                    id="groom"
                    placeholder="e.g. Rohan"
                    value={formData.groomName}
                    onChange={(e) => updateBrideOrGroom("groomName", e.target.value)}
                    required
                    className="h-9 border-[#E8DDD3]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="family" className="text-xs font-semibold text-[#78716C]">
                  Wedding Title / Family Name
                </Label>
                <Input
                  id="family"
                  placeholder="e.g. The Sharma &amp; Patel Wedding"
                  value={formData.familyName}
                  onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                  required
                  className="h-9 border-[#E8DDD3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="date" className="text-xs font-semibold text-[#78716C]">
                    Main Wedding Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.weddingDate}
                    onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                    required
                    className="h-9 border-[#E8DDD3]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-semibold text-[#78716C]">
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g. Jaipur, Rajasthan"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="h-9 border-[#E8DDD3]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="venue" className="text-xs font-semibold text-[#78716C]">
                  Main Venue Name
                </Label>
                <Input
                  id="venue"
                  placeholder="e.g. The Grand Palace &amp; Lawns"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  required
                  className="h-9 border-[#E8DDD3]"
                />
              </div>

              <div className="p-3 bg-[#FFFBF5] rounded-lg border border-[#E8DDD3] flex items-center gap-2 text-xs text-[#78716C]">
                <Sparkles className="w-4 h-4 text-[#D97706] shrink-0" />
                <span>Default Mehendi, Sangeet &amp; Reception sub-events will be pre-created.</span>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenModal(false)}
                  className="border-[#E8DDD3] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#B91C6C] hover:bg-[#9D174D] text-white cursor-pointer"
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
            <div key={i} className="h-48 bg-stone-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : weddings.length === 0 ? (
        <Card className="border-[#E8DDD3] p-12 text-center bg-white">
          <CalendarHeart className="w-12 h-12 text-[#B91C6C] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#1C1917]">No Weddings Found</h3>
          <p className="text-xs text-[#78716C] mt-1 mb-4">
            Click the button above to register your first wedding.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weddings.map((w) => (
            <Card
              key={w.id}
              className="border-[#E8DDD3] bg-white hover:border-[#B91C6C]/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-[#FCE7F3] text-[#B91C6C] border-0 text-[10px] font-bold">
                    {w.city}
                  </Badge>
                  <span className="text-xs font-semibold text-[#78716C]">
                    {formatDate(w.weddingDate)}
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-[#1C1917] mt-2">
                  {w.familyName}
                </CardTitle>
                <CardDescription className="text-xs text-[#78716C]">
                  {w.brideName} &amp; {w.groomName}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-[#78716C]">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-[#B91C6C]" />
                  <span className="truncate">{w.venue}</span>
                </div>

                <div className="p-3 bg-[#FFFBF5] rounded-xl border border-[#E8DDD3] flex items-center justify-around text-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#78716C] block">
                      Guests
                    </span>
                    <span className="text-base font-black text-[#1C1917]">
                      {w._count.guests}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-[#E8DDD3]" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#78716C] block">
                      Events
                    </span>
                    <span className="text-base font-black text-[#D97706]">
                      {w._count.events}
                    </span>
                  </div>
                </div>

                <Link href={`/weddings/${w.id}`} className="block">
                  <Button className="w-full bg-[#B91C6C] hover:bg-[#9D174D] text-white text-xs font-semibold h-9 cursor-pointer">
                    Manage Wedding &amp; Guests
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
