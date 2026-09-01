"use client";

import { useEffect, useState } from "react";
import type { PublicAuthUser } from "@/lib/auth-redirect";

function displayNameFromUser(user: PublicAuthUser): string {
  const business = user.businessName?.trim();
  if (business) {
    return business;
  }
  const personal = `${user.firstName} ${user.lastName}`.trim();
  return personal || "Dashboard";
}

export function ProviderDashboardTitle() {
  const [title, setTitle] = useState("Dashboard");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as { user?: PublicAuthUser };
        if (!cancelled && data.user) {
          setTitle(displayNameFromUser(data.user));
        }
      } catch {
        /* keep Dashboard fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
      {title}
    </h1>
  );
}
