"use client";

import { API_PROXY_PREFIX } from "@/lib/api";
import { AMBUHUB_SERVICE_SLUGS } from "@/lib/ambuhub-services";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  stock: number | null;
  price: number | null;
  pricingPeriod:
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | null;
  isAvailable?: boolean;
  departmentSlug: string;
  departmentName: string;
  category: { id: string; slug: string; name: string };
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
};

export default function ProviderListingsPage() {
  const [services, setServices] = useState<MyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTabSlug, setActiveTabSlug] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
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
            throw new Error("Sign in as a service provider to see your listings.");
          }
          if (res.status === 403) {
            throw new Error("Only service providers can view listings.");
          }
          throw new Error(data.message ?? "Could not load listings.");
        }

        if (!cancelled) {
          setServices(data.services ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sections = useMemo(() => {
    const result: { slug: string; categoryName: string; items: MyService[] }[] =
      [];
    for (const slug of AMBUHUB_SERVICE_SLUGS) {
      const items = services.filter((s) => s.category.slug === slug);
      if (items.length === 0) {
        continue;
      }
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
        if (!byName.has(key)) {
          byName.set(key, []);
        }
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
    const hasActive = sections.some((section) => section.slug === activeTabSlug);
    if (!hasActive) {
      setActiveTabSlug(sections[0].slug);
    }
  }, [activeTabSlug, sections]);

  const activeSection = useMemo(
    () => sections.find((section) => section.slug === activeTabSlug) ?? null,
    [activeTabSlug, sections],
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          My listings
        </h1>
        <p className="mt-4 text-slate-600">Loading your services…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          My listings
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          My listings
        </h1>
        <p className="mt-2 text-slate-600">
          Services and equipment you have published.
        </p>
        <div className="mt-10 rounded-2xl border border-dashed border-blue-300 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 px-6 py-16 text-center text-slate-600">
          No listings yet. Use{" "}
          <Link
            href="/provider/services/add"
            className="font-medium text-ambuhub-brand hover:underline"
          >
            Add service
          </Link>{" "}
          to create one.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        My listings
      </h1>
      <p className="mt-2 text-slate-600">
        Services and equipment you have published, grouped by category.
      </p>

      <div className="mt-10 rounded-3xl border border-blue-100 bg-white/95 p-4 shadow-lg shadow-slate-200/70 backdrop-blur-sm sm:p-5">
        <div className="border-b border-blue-100">
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
          <section className="pt-5">
            <ul className="grid gap-4 sm:grid-cols-2">
              {activeSection.items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/provider/listings/${item.id}`}
                    className="block overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-cyan-50/70 shadow-md shadow-blue-100/60 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <div className="flex gap-0 sm:gap-0">
                      {item.photoUrls[0] ? (
                        <div className="relative h-28 w-28 shrink-0 bg-blue-100/70">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.photoUrls[0]}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : null}
                      <div className="min-w-0 flex-1 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700/85">
                            {item.departmentName}
                          </p>
                          {item.isAvailable === false ? (
                            <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                              Unavailable
                            </span>
                          ) : null}
                        </div>
                        <h3 className="mt-1 font-semibold text-slate-900">
                          {item.title}
                        </h3>
                        <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                          {item.description}
                        </p>
                        <p className="mt-3 text-xs font-semibold text-blue-700">
                          View details
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <p className="mt-10 text-center text-sm text-slate-600">
        <Link
          href="/provider/services/add"
          className="font-medium text-ambuhub-brand hover:underline"
        >
          Add another service
        </Link>
      </p>
    </div>
  );
}
