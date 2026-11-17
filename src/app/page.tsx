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
    <div className="min-h-screen bg-[#FFFBF5] text-[#1C1917] selection:bg-[#B91C6C] selection:text-white">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-[#B91C6C] via-[#9D174D] to-[#D97706] text-white text-xs font-semibold py-2.5 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>Indians spend ₹50 Lakh on weddings, yet estimate catering with &quot;bro I think Sharma uncle will come&quot; 🍽️</span>
        <span className="hidden sm:inline bg-white/20 rounded-full px-2 py-0.5 text-[10px]">Now Solved</span>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-[#FFFBF5]/90 backdrop-blur-md border-b border-[#E8DDD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#B91C6C] to-[#D97706] flex items-center justify-center text-white shadow-md shadow-[#B91C6C]/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-[#1C1917]">
                Mehman<span className="text-[#B91C6C]">Ji</span>
              </span>
              <span className="text-[10px] block font-bold text-[#D97706] tracking-widest uppercase -mt-1">
                Guest Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#78716C]">
            <a href="#problem" className="hover:text-[#B91C6C] transition-colors">The Paneer Problem</a>
            <a href="#calculator" className="hover:text-[#B91C6C] transition-colors">Savings Calculator</a>
            <a href="#features" className="hover:text-[#B91C6C] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#B91C6C] transition-colors">How It Works</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-semibold cursor-pointer">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#B91C6C] hover:bg-[#9D174D] text-white shadow-sm font-semibold text-sm cursor-pointer">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#FCE7F3]/60 via-[#FEF3C7]/40 to-transparent blur-3xl -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCE7F3] border border-[#B91C6C]/20 text-[#B91C6C] text-xs font-bold uppercase tracking-wider mb-6">
            <Heart className="w-3.5 h-3.5 fill-[#B91C6C]" />
            Built for Modern Indian Weddings
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#1C1917] max-w-4xl mx-auto leading-[1.1]">
            Ab Pata Chalega Kaun Aa Raha Hai{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B91C6C] via-[#D97706] to-[#B91C6C]">
              Paneer Khane!
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#78716C] max-w-2xl mx-auto leading-relaxed">
            Stop guessing guest headcounts. MehmanJi collects real confirmations, Veg vs Non-Veg vs Jain food counts, and arrival times — directly over WhatsApp.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-[#B91C6C] hover:bg-[#9D174D] text-white font-bold text-base shadow-lg shadow-[#B91C6C]/25 cursor-pointer">
                Start Managing Guests Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-[#E8DDD3] bg-white hover:bg-[#F5EFEB] font-semibold text-base cursor-pointer">
                Explore Demo Wedding
              </Button>
            </Link>
          </div>

          {/* Social Proof Strip */}
          <div className="mt-12 pt-8 border-t border-[#E8DDD3]/80 flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-sm text-[#78716C]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span><strong>WhatsApp 1-Click</strong> RSVP</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span><strong>Veg / Non-Veg / Jain</strong> Ratios</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span><strong>Export PDF</strong> for Caterer</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span><strong>Zero App Install</strong> for Guests</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Indian Wedding Reality Section */}
      <section id="problem" className="py-20 bg-white border-y border-[#E8DDD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#D97706]">The ₹50 Lakh Paradox</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#1C1917]">
              The Most Expensive Mistake in Indian Weddings
            </p>
            <p className="mt-4 text-base text-[#78716C]">
              We hire international photographers, 5-star decorators, and celebrity DJs. But when calculating how much food to prepare, we rely on intuition.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#FFFBF5] border border-[#E8DDD3] relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1C1917]">You Invite 400 People</h3>
              <p className="mt-2 text-sm text-[#78716C] leading-relaxed">
                Everyone says &quot;Arre beta, of course we are coming! Whole family will be there!&quot; You book food for 400 with 10% buffer.
              </p>
              <div className="mt-6 text-2xl font-black text-[#1C1917]">400 Plates Booked</div>
            </div>

            <div className="p-8 rounded-2xl bg-[#FFFBF5] border border-[#E8DDD3] relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center mb-6">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1C1917]">Only 280 Show Up</h3>
              <p className="mt-2 text-sm text-[#78716C] leading-relaxed">
                Wedding day arrives. Sharma uncle got stuck in traffic, cousins had exams, colleagues sent blessings on WhatsApp.
              </p>
              <div className="mt-6 text-2xl font-black text-[#D97706]">120 Missing Guests</div>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#B91C6C]/5 to-[#B91C6C]/15 border border-[#B91C6C]/30 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#B91C6C] text-white flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#B91C6C]">₹2.16 Lakhs Wasted</h3>
              <p className="mt-2 text-sm text-[#78716C] leading-relaxed">
                120 untouched gourmet plates thrown away or paid to caterer for empty chairs. That money could have paid for your honeymoon!
              </p>
              <div className="mt-6 text-2xl font-black text-[#B91C6C]">Direct Money Down The Drain</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Savings Calculator */}
      <section id="calculator" className="py-20 bg-gradient-to-b from-[#FFFBF5] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#B91C6C]">Live Estimation</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#1C1917]">
              How Much Can MehmanJi Save Your Wedding?
            </p>
            <p className="mt-3 text-sm text-[#78716C]">
              Drag the sliders below to calculate your family&apos;s potential catering savings.
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E8DDD3] shadow-xl shadow-stone-200/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Sliders */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-[#1C1917]">Total Guests Invited</label>
                    <span className="text-lg font-black text-[#B91C6C]">{invitedCount} Guests</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1500"
                    step="50"
                    value={invitedCount}
                    onChange={(e) => setInvitedCount(Number(e.target.value))}
                    className="w-full accent-[#B91C6C] cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-[#78716C] mt-1">
                    <span>100</span>
                    <span>500</span>
                    <span>1000</span>
                    <span>1500</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-[#1C1917]">Catering Cost Per Plate (₹)</label>
                    <span className="text-lg font-black text-[#D97706]">₹{costPerPlate.toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range"
                    min="800"
                    max="5000"
                    step="100"
                    value={costPerPlate}
                    onChange={(e) => setCostPerPlate(Number(e.target.value))}
                    className="w-full accent-[#D97706] cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-[#78716C] mt-1">
                    <span>₹800 (Standard)</span>
                    <span>₹2,500 (Premium)</span>
                    <span>₹5,000 (5-Star Luxury)</span>
                  </div>
                </div>
              </div>

              {/* Calculated Result Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FFFBF5] to-[#FCE7F3]/40 border border-[#B91C6C]/20 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-[#78716C]">Estimated Waste Without MehmanJi</p>
                <div className="mt-2 text-3xl sm:text-4xl font-black text-[#B91C6C]">
                  ₹{potentialSavings.toLocaleString("en-IN")}
                </div>
                <p className="mt-1 text-xs text-[#78716C]">
                  (~{noShowGuests} unconfirmed plates wasted)
                </p>

                <div className="mt-6 pt-4 border-t border-[#E8DDD3] flex items-center justify-between text-xs font-medium text-[#1C1917]">
                  <span>Average MehmanJi Cost:</span>
                  <span className="font-bold text-emerald-700">₹1,999 (One-time)</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>Net Expected ROI:</span>
                  <span className="text-sm">{(potentialSavings / 1999).toFixed(0)}x Return</span>
                </div>

                <Link href="/signup" className="block mt-6">
                  <Button className="w-full bg-[#B91C6C] hover:bg-[#9D174D] text-white font-bold text-sm shadow-md cursor-pointer">
                    Save This Money Now
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white border-y border-[#E8DDD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#B91C6C]">Zero Effort for Guests</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#1C1917]">
              How MehmanJi Works Over WhatsApp
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-8 rounded-2xl bg-[#FFFBF5] border border-[#E8DDD3] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#B91C6C] text-white font-black text-lg flex items-center justify-center mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold text-[#1C1917]">Add Guests & Sub-Events</h3>
                <p className="mt-3 text-sm text-[#78716C] leading-relaxed">
                  Enter your Mehendi, Sangeet, Wedding, and Reception events. Add single guests or upload your whole Excel contact list in one click.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#B91C6C]">
                <Calendar className="w-4 h-4" />
                <span>Supports multiple wedding days</span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-[#FFFBF5] border border-[#E8DDD3] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white font-black text-lg flex items-center justify-center mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold text-[#1C1917]">Send 1-Click WhatsApp Link</h3>
                <p className="mt-3 text-sm text-[#78716C] leading-relaxed">
                  Tap &quot;Share on WhatsApp&quot; to send a customized card. Guests tap the link on their phone — no login, no password, no app download.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <MessageCircle className="w-4 h-4" />
                <span>Native WhatsApp integration</span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-[#FFFBF5] border border-[#E8DDD3] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#D97706] text-white font-black text-lg flex items-center justify-center mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold text-[#1C1917]">Live Food & Headcount Tracker</h3>
                <p className="mt-3 text-sm text-[#78716C] leading-relaxed">
                  Watch live responses roll in: Veg vs Non-Veg vs Jain food counts, +1 attendees, and arrival time. Export instant PDF report for your caterer.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#D97706]">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Printable Caterer Handover</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 bg-[#FFFBF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#B91C6C]">Everything You Need</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#1C1917]">
              Engineered For The Complexities of Desi Weddings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E8DDD3] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-pink-100 text-[#B91C6C] flex items-center justify-center mb-4">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#1C1917]">Dietary Preferences Breakdown</h4>
              <p className="mt-2 text-xs text-[#78716C] leading-relaxed">
                Know exactly how many pure Jain meals (no onion/garlic), strict vegetarian, and non-vegetarian plates are needed per event.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E8DDD3] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#1C1917]">Gentle WhatsApp Follow-ups</h4>
              <p className="mt-2 text-xs text-[#78716C] leading-relaxed">
                Send polite, respectful reminder messages to pending guests with one tap. No awkward phone calls asking if they are coming.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E8DDD3] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-[#D97706] flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#1C1917]">Arrival Timing Intelligence</h4>
              <p className="mt-2 text-xs text-[#78716C] leading-relaxed">
                Know who is coming on time, who is arriving early for Mehendi setup, and who will land late after work.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E8DDD3] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#1C1917]">Smart Guest Grouping</h4>
              <p className="mt-2 text-xs text-[#78716C] leading-relaxed">
                Segment guests by Ladkiwale, Ladkewale, College Gang, Society Uncle-Aunties, and Office Colleagues with color tags.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E8DDD3] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <PieChart className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#1C1917]">Buffer Recommendation Engine</h4>
              <p className="mt-2 text-xs text-[#78716C] leading-relaxed">
                Intelligent algorithm automatically recommends the optimum 10-15% safety buffer so food never runs out and never goes to waste.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E8DDD3] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#1C1917]">Caterer Handover PDF</h4>
              <p className="mt-2 text-xs text-[#78716C] leading-relaxed">
                One-click export ready to hand over directly to Maharaj / Banquet Banquet Manager with precise meal counts and special notes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-[#B91C6C] via-[#9D174D] to-[#D97706] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Stop Guessing. Start Celebrating.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/90 max-w-xl mx-auto">
            Give your wedding the precision it deserves. Save lakhs on wasted food and give your guests a smooth WhatsApp RSVP experience.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto bg-white text-[#B91C6C] hover:bg-stone-100 font-bold text-base shadow-xl cursor-pointer">
                Create Your Wedding — Free
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 font-semibold cursor-pointer">
                View Sample Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8DDD3] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#B91C6C] to-[#D97706] flex items-center justify-center text-white">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="font-bold text-[#1C1917]">
              Mehman<span className="text-[#B91C6C]">Ji</span>
            </span>
            <span className="text-xs text-[#78716C] ml-2">
              © 2026. Built with ❤️ for Indian Weddings.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#78716C]">
            <Link href="/login" className="hover:text-[#B91C6C]">Sign In</Link>
            <Link href="/signup" className="hover:text-[#B91C6C]">Register Wedding</Link>
            <span>End-to-End Guest Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
