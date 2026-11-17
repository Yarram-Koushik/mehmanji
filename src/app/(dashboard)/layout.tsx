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
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#B91C6C] flex items-center justify-center text-white animate-pulse">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-[#78716C]">Loading MehmanJi...</p>
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
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#E8DDD3] sticky top-0 z-30">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#B91C6C] to-[#D97706] flex items-center justify-center text-white shadow-sm">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span className="font-bold text-[#1C1917]">
            Mehman<span className="text-[#B91C6C]">Ji</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-[#78716C] hover:text-[#1C1917]"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#E8DDD3] flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo & Tagline */}
          <div className="p-6 border-b border-[#E8DDD3]/80">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#B91C6C] to-[#D97706] flex items-center justify-center text-white shadow-md shadow-[#B91C6C]/20">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-[#1C1917]">
                  Mehman<span className="text-[#B91C6C]">Ji</span>
                </span>
                <span className="text-[9px] block font-bold text-[#D97706] tracking-widest uppercase">
                  Guest Intelligence
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
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    item.active
                      ? "bg-[#FCE7F3] text-[#B91C6C]"
                      : "text-[#78716C] hover:bg-[#FFFBF5] hover:text-[#1C1917]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.active ? "text-[#B91C6C]" : "text-[#78716C]"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Value Reminder Box */}
          <div className="p-4 mx-4 mt-4 rounded-xl bg-gradient-to-br from-[#FFFBF5] to-[#FEF3C7]/40 border border-[#D97706]/20">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D97706] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Catering Tip</span>
            </div>
            <p className="text-[11px] text-[#78716C] leading-relaxed">
              Always verify your Jain and Veg headcount 48 hours before Sangeet to save on excess preparations.
            </p>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-[#E8DDD3] bg-stone-50/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#B91C6C] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#1C1917] truncate">{session?.user?.name || "Organizer"}</p>
                <p className="text-[10px] text-[#78716C] truncate">{session?.user?.email}</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full justify-center text-xs text-[#78716C] hover:text-red-600 border-[#E8DDD3] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto min-h-screen">
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
        <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#B91C6C] flex items-center justify-center text-white animate-pulse">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#78716C]">Loading MehmanJi...</p>
          </div>
        </div>
      }
    >
      <DashboardInner>{children}</DashboardInner>
    </React.Suspense>
  );
}
