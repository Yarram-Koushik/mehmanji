"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed,
  MessageCircle,
  Users,
  PieChart,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ChevronRight,
  Heart,
  Calendar,
  AlertTriangle,
  ChefHat,
  ShieldCheck,
  Star,
} from "lucide-react";

export default function LandingPage() {
  // Interactive Catering Waste Calculator
  const [invitedCount, setInvitedCount] = React.useState(400);
  const [costPerPlate, setCostPerPlate] = React.useState(1800);

  // Industry stats: ~28-35% of Indian wedding guests who say "yes" don't show up
  const noShowPercent = 0.3;
  const noShowGuests = Math.round(invitedCount * noShowPercent);
  const potentialSavings = noShowGuests * costPerPlate;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F1E1C] font-sans selection:bg-[#C5A059] selection:text-white">
      {/* Top Luxury Announcement Bar */}
      <div className="bg-[#152018] text-[#C5A059] text-xs font-medium py-2.5 px-4 text-center border-b border-[#C5A059]/20 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Indians spend ₹50 Lakh on weddings, yet estimate catering with &quot;bro I think Sharma uncle will come&quot; 🍽️</span>
        <span className="hidden sm:inline bg-[#C5A059]/20 border border-[#C5A059]/40 text-white rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold">
          Now Solved
        </span>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE5DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#1F2E23] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] shadow-sm group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#1F1E1C]">
                Mehman<span className="text-[#C5A059]">Ji</span>
              </span>
              <span className="text-[9px] block font-semibold text-[#6E6A63] tracking-[0.2em] uppercase -mt-0.5">
                Guest &amp; Catering Planner
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6E6A63]">
            <a href="#problem" className="hover:text-[#1F1E1C] transition-colors">The Paneer Problem</a>
            <a href="#calculator" className="hover:text-[#1F1E1C] transition-colors">Savings Calculator</a>
            <a href="#features" className="hover:text-[#1F1E1C] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#1F1E1C] transition-colors">How It Works</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium text-[#1F1E1C] hover:text-[#C5A059] cursor-pointer">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#1F2E23] hover:bg-[#152018] text-[#C5A059] border border-[#C5A059]/40 shadow-sm font-medium text-sm cursor-pointer h-10 px-4">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section: Dribbble Wedlux Editorial Inspiration */}
      <section className="relative overflow-hidden bg-[#1F2E23] text-white pt-16 pb-24 lg:pt-24 lg:pb-32 border-b border-[#C5A059]/20">
        {/* Subtle Decorative Starburst & Light */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#C5A059]/10 blur-[120px] rounded-full pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-emerald-950/40 blur-[100px] rounded-full pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Ab Pata Chalega Kaun Aa Raha Hai{" "}
            <span className="italic font-normal text-[#C5A059]">
              Paneer Khane!
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed font-light">
            Stop guessing how many guests will show up. MehmanJi collects real WhatsApp confirmations, exact Veg vs Jain vs Non-Veg plate counts, and arrival times without downloading any apps.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-[#C5A059] hover:bg-[#B08D47] text-white font-medium text-base shadow-xl shadow-[#C5A059]/20 cursor-pointer h-12 px-7">
                Start Managing Guests Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-stone-600 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 font-medium text-base cursor-pointer h-12 px-7">
                Explore Demo Wedding
              </Button>
            </Link>
          </div>

          {/* Social Proof Strip with Editorial Numbers */}
          <div className="mt-16 pt-10 border-t border-stone-700/60 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#C5A059] block tabular-nums">
                ₹2.16L+
              </span>
              <span className="text-xs text-stone-300 mt-0.5 block font-medium">Average Catering Saved</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-white block tabular-nums">
                100%
              </span>
              <span className="text-xs text-stone-300 mt-0.5 block font-medium">WhatsApp 1-Click RSVP</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#7A8B74] block tabular-nums">
                Veg / Jain
              </span>
              <span className="text-xs text-stone-300 mt-0.5 block font-medium">Dietary Breakdown</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-white block tabular-nums">
                0 Apps
              </span>
              <span className="text-xs text-stone-300 mt-0.5 block font-medium">No App Download Needed</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Indian Wedding Reality Section */}
      <section id="problem" className="py-20 lg:py-28 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FBF8F1] border border-[#C5A059]/30 text-[#C5A059] text-xs font-semibold uppercase tracking-wider mb-2">
              The ₹50 Lakh Paradox
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1F1E1C]">
              The Most Expensive Mistake in Indian Weddings
            </h2>
            <p className="mt-4 text-base text-[#6E6A63] leading-relaxed">
              We hire international photographers, 5-star decorators, and celebrity DJs. But when calculating how much food to prepare, we rely on intuition.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-[#EAE5DF] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:border-[#C5A059]/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#EAE5DF] text-[#1F1E1C] flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-[#C5A059]" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1F1E1C]">You Invite 400 People</h3>
              <p className="mt-2 text-sm text-[#6E6A63] leading-relaxed">
                Everyone says &quot;Arre beta, of course we are coming! Whole family will be there!&quot; You book food for 400 with a 10% safety buffer.
              </p>
              <div className="mt-6 font-serif text-2xl font-bold text-[#1F1E1C] tabular-nums">
                400 Plates Booked
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#EAE5DF] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:border-amber-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-6">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1F1E1C]">Only 280 Show Up</h3>
              <p className="mt-2 text-sm text-[#6E6A63] leading-relaxed">
                Wedding day arrives. Sharma uncle got stuck in traffic, cousins had exams, and office colleagues sent blessings over WhatsApp.
              </p>
              <div className="mt-6 font-serif text-2xl font-bold text-amber-700 tabular-nums">
                120 Missing Guests
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1F2E23] to-[#152018] text-white border border-[#C5A059]/30 shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#C5A059] text-white flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#C5A059]">₹2.16 Lakhs Wasted</h3>
              <p className="mt-2 text-sm text-stone-300 leading-relaxed font-light">
                120 untouched gourmet plates thrown away or paid to the caterer for empty chairs. That money could have funded your luxury honeymoon!
              </p>
              <div className="mt-6 font-serif text-2xl font-bold text-white tabular-nums">
                Direct Money Down The Drain
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Savings Calculator */}
      <section id="calculator" className="py-20 bg-white border-y border-[#EAE5DF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FBF8F1] border border-[#C5A059]/30 text-[#C5A059] text-xs font-semibold uppercase tracking-wider mb-2">
              Live Catering Calculation
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1F1E1C]">
              How Much Can MehmanJi Save Your Wedding?
            </h2>
            <p className="mt-3 text-sm text-[#6E6A63]">
              Drag the sliders below to calculate your family&apos;s potential catering savings.
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF8F5] border border-[#EAE5DF] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Sliders */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6E6A63]">Total Guests Invited</label>
                    <span className="font-serif text-xl font-bold text-[#1F1E1C] tabular-nums">{invitedCount} Guests</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1500"
                    step="50"
                    value={invitedCount}
                    onChange={(e) => setInvitedCount(Number(e.target.value))}
                    className="w-full accent-[#C5A059] cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-[#6E6A63] mt-1 tabular-nums">
                    <span>100</span>
                    <span>500</span>
                    <span>1000</span>
                    <span>1500</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6E6A63]">Catering Cost Per Plate (₹)</label>
                    <span className="font-serif text-xl font-bold text-[#C5A059] tabular-nums">₹{costPerPlate.toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range"
                    min="800"
                    max="5000"
                    step="100"
                    value={costPerPlate}
                    onChange={(e) => setCostPerPlate(Number(e.target.value))}
                    className="w-full accent-[#C5A059] cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-[#6E6A63] mt-1">
                    <span>₹800 (Standard)</span>
                    <span>₹2,500 (Premium)</span>
                    <span>₹5,000 (Luxury)</span>
                  </div>
                </div>
              </div>

              {/* Calculated Result Card */}
              <div className="p-7 rounded-2xl bg-white border border-[#EAE5DF] text-center shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6A63]">Estimated Catering Waste Prevented</p>
                <div className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#C5A059] tabular-nums">
                  ₹{potentialSavings.toLocaleString("en-IN")}
                </div>
                <p className="mt-1 text-xs text-[#6E6A63] tabular-nums">
                  (~{noShowGuests} unconfirmed plates prevented from waste)
                </p>

                <div className="mt-6 pt-4 border-t border-[#EAE5DF] flex items-center justify-between text-xs text-[#6E6A63]">
                  <span>Average MehmanJi Cost:</span>
                  <span className="font-semibold text-[#7A8B74]">₹1,999 (One-time)</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs font-semibold text-[#7A8B74]">
                  <span>Expected ROI:</span>
                  <span className="font-bold text-sm tabular-nums">{(potentialSavings / 1999).toFixed(0)}x Return</span>
                </div>

                <Link href="/signup" className="block mt-6">
                  <Button className="w-full bg-[#1F2E23] hover:bg-[#152018] text-[#C5A059] border border-[#C5A059]/40 font-medium text-sm shadow-md cursor-pointer h-11">
                    Save This Money Now
                    <ArrowRight className="w-4 h-4 ml-1.5 text-[#C5A059]" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FBF8F1] border border-[#C5A059]/30 text-[#C5A059] text-xs font-semibold uppercase tracking-wider mb-2">
              Zero Effort for Guests
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1F1E1C]">
              How MehmanJi Works Over WhatsApp
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-8 rounded-2xl bg-white border border-[#EAE5DF] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EAE5DF] text-[#C5A059] font-serif font-bold text-lg flex items-center justify-center mb-6">
                  01
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1F1E1C]">Add Ceremonies &amp; Guests</h3>
                <p className="mt-3 text-sm text-[#6E6A63] leading-relaxed">
                  Enter your Mehendi, Sangeet, Wedding, and Reception ceremonies. Add single guests or upload your Excel contact list in one click.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#C5A059]">
                <Calendar className="w-4 h-4" />
                <span>Supports multi-day ceremonies</span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#EAE5DF] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-serif font-bold text-lg flex items-center justify-center mb-6">
                  02
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1F1E1C]">Send 1-Click WhatsApp Link</h3>
                <p className="mt-3 text-sm text-[#6E6A63] leading-relaxed">
                  Tap &quot;Share on WhatsApp&quot; to send an invitation. Guests tap the link on their phone — no login, no password, no app download.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#25D366]">
                <MessageCircle className="w-4 h-4" />
                <span>Native WhatsApp integration</span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#EAE5DF] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#F2F5F0] border border-[#7A8B74]/30 text-[#7A8B74] font-serif font-bold text-lg flex items-center justify-center mb-6">
                  03
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1F1E1C]">Live Plate Count &amp; Halwai Sheet</h3>
                <p className="mt-3 text-sm text-[#6E6A63] leading-relaxed">
                  Watch live responses roll in: Veg vs Non-Veg vs Jain plate counts, +1 attendees, and arrival time. Export instant PDF report for your caterer.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#7A8B74]">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Printable Halwai Food Sheet</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 lg:py-28 bg-white border-t border-[#EAE5DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FBF8F1] border border-[#C5A059]/30 text-[#C5A059] text-xs font-semibold uppercase tracking-wider mb-2">
              Everything You Need
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1F1E1C]">
              Engineered For The Complexities of Indian Weddings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DF] shadow-sm hover:border-[#C5A059]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE5DF] text-[#C5A059] flex items-center justify-center mb-4">
                <ChefHat className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-xl font-bold text-[#1F1E1C]">Dietary Preferences Breakdown</h4>
              <p className="mt-2 text-xs text-[#6E6A63] leading-relaxed">
                Know exactly how many pure Jain meals (no onion/garlic), strict vegetarian, and non-vegetarian plates are needed per event.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DF] shadow-sm hover:border-[#C5A059]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE5DF] text-[#25D366] flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-xl font-bold text-[#1F1E1C]">Gentle WhatsApp Follow-ups</h4>
              <p className="mt-2 text-xs text-[#6E6A63] leading-relaxed">
                Send polite, respectful reminder messages to pending guests with one tap. No awkward phone calls asking if they are coming.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DF] shadow-sm hover:border-[#C5A059]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE5DF] text-[#C5A059] flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-xl font-bold text-[#1F1E1C]">Arrival Timing Intelligence</h4>
              <p className="mt-2 text-xs text-[#6E6A63] leading-relaxed">
                Know who is arriving on time for the Muhurat, who is arriving early for Mehendi setup, and who will land late after work.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DF] shadow-sm hover:border-[#C5A059]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE5DF] text-[#7A8B74] flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-xl font-bold text-[#1F1E1C]">Smart Guest Grouping</h4>
              <p className="mt-2 text-xs text-[#6E6A63] leading-relaxed">
                Segment guests by Ladkiwale, Ladkewale, College Gang, Society Uncle-Aunties, and Office Colleagues with color tags.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DF] shadow-sm hover:border-[#C5A059]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE5DF] text-[#C5A059] flex items-center justify-center mb-4">
                <PieChart className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-xl font-bold text-[#1F1E1C]">Buffer Recommendation Engine</h4>
              <p className="mt-2 text-xs text-[#6E6A63] leading-relaxed">
                Intelligent algorithm automatically recommends the optimum 10-15% safety buffer so food never runs out and never goes to waste.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DF] shadow-sm hover:border-[#C5A059]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE5DF] text-[#7A8B74] flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-xl font-bold text-[#1F1E1C]">Caterer Handover PDF &amp; CSV</h4>
              <p className="mt-2 text-xs text-[#6E6A63] leading-relaxed">
                One-click export ready to hand over directly to Maharaj / Banquet Banquet Manager with precise meal counts and special notes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 lg:py-28 bg-[#1F2E23] text-white border-t border-[#C5A059]/20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 border border-[#C5A059]/30 text-[#C5A059] text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Seamless Wedding Management
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            Stop Guessing. Start Celebrating.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-300 max-w-xl mx-auto font-light">
            Give your wedding celebration the precision it deserves. Save lakhs on wasted food and give your guests a smooth WhatsApp RSVP experience.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto bg-[#C5A059] hover:bg-[#B08D47] text-white font-medium text-base shadow-xl shadow-[#C5A059]/20 cursor-pointer h-12 px-7">
                Create Your Wedding — Free
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-stone-600 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 font-medium cursor-pointer h-12 px-7">
                View Sample Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#EAE5DF] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1F2E23] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-lg text-[#1F1E1C]">
              Mehman<span className="text-[#C5A059]">Ji</span>
            </span>
            <span className="text-xs text-[#6E6A63] ml-2">
              © 2026. Built with ❤️ for Modern Indian Weddings.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#6E6A63]">
            <Link href="/login" className="hover:text-[#1F1E1C] transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-[#1F1E1C] transition-colors">Register Wedding</Link>
            <span>End-to-End Guest Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
