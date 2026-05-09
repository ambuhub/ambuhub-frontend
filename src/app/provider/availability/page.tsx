"use client";

import { API_PROXY_PREFIX } from "@/lib/api";
import { AMBUHUB_SERVICE_SLUGS } from "@/lib/ambuhub-services";
import { AMBUHUB_MARKETPLACE_INVALIDATE_EVENT } from "@/lib/cache-tags";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const TAB_SHADE_CLASSES = [
  "from-blue-700 to-cyan-600 border-blue-500/70 text-white shadow-blue-900/35",
  "from-sky-700 to-blue-600 border-sky-500/70 text-white shadow-sky-900/35",
  "from-indigo-700 to-blue-600 border-indigo-500/70 text-white shadow-indigo-900/35",
  "from-cyan-700 to-blue-600 border-cyan-500/70 text-white shadow-cyan-900/35",
] as const;

function tabShadeClass(index: number): string {
  return TAB_SHADE_CLASSES[index % TAB_SHADE_CLASSES.length];
}

type MyService = {
  id: string;
  title: string;
  description: string;
  listingType: "sale" | "hire" | "book" | null;
  isAvailable?: boolean;
  departmentName: string;
  category: { id: string; slug: string; name: string };
  photoUrls: string[];
};

function listingTypeLabel(t: MyService["listingType"]): string {
  if (t === "sale") return "Sale";
  if (t === "hire") return "Hire";
  if (t === "book") return "Book";
  return "—";
}

export default function ProviderAvailabilityPage() {
  const [services, setServices] = useState<MyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTabSlug, setActiveTabSlug] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_PROXY_PREFIX}/services/me`, {
        credentials: "include",
      });
      const data = (await res.json()) as {
        services?: MyService[];
        message?: string;
      };
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Sign in as a service provider to manage availability.");
        }
        if (res.status === 403) {
          throw new Error("Only service providers can manage availability.");
        }
        throw new Error(data.message ?? "Could not load listings.");
      }
      setServices(data.services ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sections = useMemo(() => {
    const result: { slug: string; categoryName: string; items: MyService[] }[] =
      [];
    for (const slug of AMBUHUB_SERVICE_SLUGS) {
      const items = services.filter((s) => s.category.slug === slug);
      if (items.length === 0) continue;
      result.push({
        slug,
        categoryName: items[0].category.name,
        items,
      });
    }
    const known = new Set<string>([...AMBUHUB_SERVICE_SLUGS]);
    const unknown = services.filter((s) => !known.has(s.category.slug));
    if (unknown.length > 0) {
      const byName = new Map<string, MyService[]>();
      for (const s of unknown) {
        const key = s.category.slug;
        if (!byName.has(key)) byName.set(key, []);
        byName.get(key)!.push(s);
      }
      for (const [, items] of byName) {
        result.push({
          slug: items[0].category.slug,
          categoryName: items[0].category.name,
          items,
        });
      }
    }
    return result;
  }, [services]);

  useEffect(() => {
    if (sections.length === 0) {
      setActiveTabSlug("");
      return;
    }
    const hasActive = sections.some((s) => s.slug === activeTabSlug);
    if (!hasActive) setActiveTabSlug(sections[0].slug);
  }, [activeTabSlug, sections]);

  const activeSection = useMemo(
    () => sections.find((s) => s.slug === activeTabSlug) ?? null,
    [activeTabSlug, sections],
  );

  async function handleToggle(item: MyService, next: boolean) {
    const prev = item.isAvailable !== false;
    if (next === prev) return;

    setRowError(null);
    setSavingId(item.id);
    setServices((list) =>
      list.map((s) =>
        s.id === item.id ? { ...s, isAvailable: next } : s,
      ),
    );

    try {
      const res = await fetch(
        `${API_PROXY_PREFIX}/services/${encodeURIComponent(item.id)}/availability`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAvailable: next }),
        },
      );
      const data = (await res.json()) as { service?: MyService; message?: string };
      if (!res.ok) {
        throw new Error(data.message ?? "Could not update availability.");
      }
      if (data.service) {
        setServices((list) =>
          list.map((s) =>
            s.id === item.id
              ? { ...s, isAvailable: data.service!.isAvailable !== false }
              : s,
          ),
        );
      }
      window.dispatchEvent(
        new CustomEvent(AMBUHUB_MARKETPLACE_INVALIDATE_EVENT),
      );
    } catch (e) {
      setRowError(
        e instanceof Error ? e.message : "Could not update availability.",
      );
      setServices((list) =>
        list.map((s) =>
          s.id === item.id ? { ...s, isAvailable: prev } : s,
        ),
      );
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Availability
        </h1>
        <p className="mt-4 text-foreground/70">Loading your listings…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Availability
        </h1>
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Availability
        </h1>
        <p className="mt-2 text-foreground/70">
          Turn listings on or off for the public marketplace. When a listing is
          off, buyers will not see it on category pages and sale items cannot be
          added to cart.
        </p>
        <div className="mt-10 rounded-2xl border border-dashed border-ambuhub-200 bg-ambuhub-50/50 px-6 py-16 text-center text-foreground/60">
          No listings yet.{" "}
          <Link
            href="/provider/services/add"
            className="font-semibold text-ambuhub-brand hover:underline"
          >
            Add a service
          </Link>{" "}
          first.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Availability
      </h1>
      <p className="mt-2 text-foreground/70">
        Control whether each listing appears on the public marketplace. Sale,
        hire, and book listings can be set to <strong>available</strong> or{" "}
        <strong>not available</strong>. Unavailable listings are hidden from
        buyers; sale items also cannot be added to cart.
      </p>

      {rowError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {rowError}
        </p>
      ) : null}

      <div className="mt-10 rounded-3xl border border-ambuhub-100 bg-white/95 p-4 shadow-lg shadow-slate-200/70 backdrop-blur-sm sm:p-5">
        <div className="border-b border-ambuhub-100">
          <div className="-mb-px flex flex-wrap gap-2">
            {sections.map((section, index) => {
              const isActive = section.slug === activeTabSlug;
              return (
                <button
                  key={section.slug}
                  type="button"
                  onClick={() => setActiveTabSlug(section.slug)}
                  className={`rounded-t-xl border border-b-0 px-4 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? `bg-gradient-to-r shadow-md ${tabShadeClass(index)}`
                      : "border-transparent bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-800"
                  }`}
                >
                  {section.categoryName}
                </button>
              );
            })}
          </div>
        </div>

        {activeSection ? (
          <ul className="divide-y divide-ambuhub-100 pt-4">
            {activeSection.items.map((item) => {
              const available = item.isAvailable !== false;
              const busy = savingId === item.id;
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex gap-3">
                    {item.photoUrls[0] ? (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ambuhub-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.photoUrls[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ambuhub-brand">
                        {item.departmentName} · {listingTypeLabel(item.listingType)}
                      </p>
                      <p className="mt-0.5 font-semibold text-foreground">
                        {item.title}
                      </p>
                      <Link
                        href={`/provider/listings/${item.id}/edit`}
                        className="mt-1 inline-block text-xs font-medium text-ambuhub-brand hover:underline"
                      >
                        Edit listing
                      </Link>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:pl-4">
                    <span
                      className={`text-sm font-medium ${
                        available ? "text-emerald-700" : "text-foreground/50"
                      }`}
                    >
                      {available ? "Available" : "Not available"}
                    </span>
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <span className="sr-only">Available on marketplace</span>
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={available}
                        disabled={busy}
                        onChange={(e) => void handleToggle(item, e.target.checked)}
                      />
                      <span
                        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                          available ? "bg-emerald-500" : "bg-slate-300"
                        } ${busy ? "opacity-50" : ""} peer-focus-visible:ring-2 peer-focus-visible:ring-ambuhub-brand peer-focus-visible:ring-offset-2`}
                        aria-hidden
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                            available ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </span>
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
