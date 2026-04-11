"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Calendar,
  CalendarClock,
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  MessageSquare,
  PackagePlus,
  Settings,
  X,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/api";

const navItems = [
  {
    href: "/provider/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/provider/services/add",
    label: "Add service",
    icon: PackagePlus,
  },
  {
    href: "/provider/listings",
    label: "My listings",
    icon: List,
  },
  {
    href: "/provider/bookings",
    label: "Bookings",
    icon: Calendar,
  },
  {
    href: "/provider/availability",
    label: "Availability",
    icon: CalendarClock,
  },
  {
    href: "/provider/messages",
    label: "Messages",
    icon: MessageSquare,
  },
  {
    href: "/provider/profile",
    label: "Business profile",
    icon: Building2,
  },
  {
    href: "/provider/settings",
    label: "Settings",
    icon: Settings,
  },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/provider/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ProviderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    try {
      await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      console.warn("Logout request failed; redirecting anyway");
    }
    window.location.href = "/auth";
  }

  return (
    <div className="flex min-h-full flex-1 bg-ambuhub-surface">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-ambuhub-900/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-ambuhub-200 bg-white shadow-lg transition-transform duration-200 md:static md:z-0 md:translate-x-0 md:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-ambuhub-100 px-4 md:h-16">
          <Link
            href="/provider/dashboard"
            className="text-lg font-semibold tracking-tight text-ambuhub-brand"
            onClick={() => setSidebarOpen(false)}
          >
            Ambuhub
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-foreground/70 hover:bg-ambuhub-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Provider">
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
                    ? "bg-ambuhub-brand/10 text-ambuhub-brand"
                    : "text-foreground/80 hover:bg-ambuhub-50 hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-ambuhub-100 p-3">
          <Link
            href="/"
            className="mb-2 block rounded-xl px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-ambuhub-50 hover:text-foreground"
          >
            View public site
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground/80 hover:bg-ambuhub-50"
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ambuhub-200 bg-white px-4 md:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-foreground hover:bg-ambuhub-50"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-foreground">Provider</span>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
