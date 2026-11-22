"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  UtensilsCrossed,
  LayoutDashboard,
  CalendarHeart,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function DashboardInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen w-full bg-[#FAF8F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C5A059] flex items-center justify-center text-white shadow-md shadow-[#C5A059]/20 animate-pulse">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-[#6E6A63]">Loading MehmanJi...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      label: "Weddings",
      href: "/weddings",
      icon: CalendarHeart,
      active: pathname?.startsWith("/weddings") || false,
    },
  ];

  return (
    <div className="h-screen w-full overflow-hidden bg-[#FAF8F5] flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-[#EAE5DF] shrink-0 z-30">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1F2E23] to-[#C5A059] flex items-center justify-center text-white shadow-sm">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-lg text-[#1F1E1C] tracking-tight">
            Mehman<span className="text-[#C5A059]">Ji</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-[#6E6A63] hover:text-[#1F1E1C] rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay (Static Left Component) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#EAE5DF] flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:h-full md:shrink-0 overflow-y-auto ${
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col">
          {/* Logo & Tagline */}
          <div className="p-6 border-b border-[#EAE5DF] shrink-0">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#1F2E23] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] shadow-sm group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-[#1F1E1C]">
                  Mehman<span className="text-[#C5A059]">Ji</span>
                </span>
                <span className="text-[9px] block font-semibold text-[#6E6A63] tracking-[0.2em] uppercase">
                  Guest &amp; Catering Planner
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    item.active
                      ? "bg-[#FBF8F1] text-[#C5A059] font-semibold border-l-2 border-[#C5A059] pl-3"
                      : "text-[#6E6A63] hover:bg-[#FAF8F5] hover:text-[#1F1E1C]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.active ? "text-[#C5A059]" : "text-[#6E6A63]"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Value Reminder Box */}
          <div className="p-4 mx-4 mt-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DF]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C5A059] mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Catering Tip</span>
            </div>
            <p className="text-[11px] text-[#6E6A63] leading-relaxed">
              Always verify your final Veg, Non-Veg &amp; Jain plate count with your Halwai 48 hours before the function to avoid excess catering cost.
            </p>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-[#EAE5DF] bg-[#FAF8F5]/50 shrink-0 mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#1F2E23] text-[#C5A059] border border-[#C5A059]/30 flex items-center justify-center font-serif font-bold text-xs shrink-0">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-[#1F1E1C] truncate">{session?.user?.name || "Organizer"}</p>
                <p className="text-[10px] text-[#6E6A63] truncate">{session?.user?.email}</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full justify-center text-xs text-[#6E6A63] hover:text-rose-600 border-[#EAE5DF] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Viewport (Inner Scroller for Right Component) */}
      <main className="flex-1 h-full overflow-y-auto min-w-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <React.Suspense
      fallback={
        <div className="h-screen w-full bg-[#FAF8F5] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#C5A059] flex items-center justify-center text-white animate-pulse">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#6E6A63]">Loading MehmanJi...</p>
          </div>
        </div>
      }
    >
      <DashboardInner>{children}</DashboardInner>
    </React.Suspense>
  );
}
