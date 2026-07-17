"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ConciergeBell,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Users,
  X,
} from "lucide-react";
import { API_AUTH_BFF_PREFIX } from "@/lib/api";
import { AmbuhubLogo } from "@/components/AmbuhubLogo";
import { AdminNotificationBadge } from "@/components/admin/AdminNotificationBadge";
import { AdminNotificationBellDropdown } from "@/components/notifications/AdminNotificationBellDropdown";
import { unregisterFcmToken } from "@/components/notifications/FcmProvider";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/listings", label: "Listings", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/concierge-requests", label: "Concierge requests", icon: ConciergeBell },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/admin/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    await unregisterFcmToken();
    try {
      await fetch(`${API_AUTH_BFF_PREFIX}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      console.warn("Logout request failed; redirecting anyway");
    }
    window.location.href = "/auth";
  }

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full flex-1 items-stretch overflow-hidden bg-slate-100">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex min-h-[100dvh] w-64 shrink-0 flex-col border-r border-indigo-900/60 bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950 shadow-xl shadow-indigo-950/40 transition-transform duration-200 md:relative md:z-0 md:h-[100dvh] md:min-h-[100dvh] md:self-stretch md:translate-x-0 md:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-indigo-900/60 px-4 md:h-16">
          <Link
            href="/admin/dashboard"
            className="flex min-w-0 items-center gap-2"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="relative flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md">
              <AmbuhubLogo width={48} className="object-contain" />
            </span>
            <span className="truncate text-lg font-semibold tracking-tight text-indigo-200">
              Ambuhub
            </span>
            <span className="shrink-0 rounded-md bg-indigo-500/25 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-100 ring-1 ring-indigo-400/30">
              Admin
            </span>
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden p-3"
          aria-label="Admin"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-500/20 text-indigo-100 ring-1 ring-indigo-400/30"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
                <span className="min-w-0 flex-1">{item.label}</span>
                {item.href === "/admin/notifications" ? (
                  <AdminNotificationBadge />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-indigo-900/60 p-3">
          <Link
            href="/"
            className="mb-2 block rounded-xl px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
          >
            View public site
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col self-stretch md:min-h-[100dvh]">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-indigo-900/60 bg-slate-950 px-4 md:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-200 hover:bg-white/10"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-indigo-100">Admin</span>
          <div className="ml-auto">
            <AdminNotificationBellDropdown />
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-slate-100 via-indigo-50/20 to-slate-100 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
