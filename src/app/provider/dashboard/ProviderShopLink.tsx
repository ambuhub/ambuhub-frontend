"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, Store } from "lucide-react";
import type { PublicAuthUser } from "@/lib/auth-redirect";

export function ProviderShopLink() {
  const [shopSlug, setShopSlug] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as { user?: PublicAuthUser };
        const slug = data.user?.shopSlug?.trim() || null;
        if (!cancelled) {
          setShopSlug(slug);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const shopPath = shopSlug ? `/shop/${encodeURIComponent(shopSlug)}` : null;

  const handleCopy = useCallback(async () => {
    if (!shopPath || typeof window === "undefined") {
      return;
    }
    const url = `${window.location.origin}${shopPath}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [shopPath]);

  if (!loaded) {
    return null;
  }

  if (!shopPath) {
    return (
      <span
        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-400"
        title="Complete your business profile to get a shop link"
      >
        <Store className="h-4 w-4" aria-hidden />
        My shop
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={shopPath}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900"
      >
        <Store className="h-4 w-4" aria-hidden />
        My shop
      </Link>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        aria-label={copied ? "Copied" : "Copy shop link"}
        title={copied ? "Copied" : "Copy shop link"}
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-600" aria-hidden />
        ) : (
          <Copy className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
