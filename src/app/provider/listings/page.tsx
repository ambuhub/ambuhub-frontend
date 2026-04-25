"use client";

import { API_PROXY_PREFIX } from "@/lib/api";
import { AMBUHUB_SERVICE_SLUGS } from "@/lib/ambuhub-services";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type MyService = {
  id: string;
  title: string;
  description: string;
  listingType: "sale" | "rent" | null;
  stock: number | null;
  price: number | null;
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

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          My listings
        </h1>
        <p className="mt-4 text-foreground/70">Loading your services…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          My listings
        </h1>
        <p className="mt-2 text-foreground/70">
          Services and equipment you have published.
        </p>
        <div className="mt-10 rounded-2xl border border-dashed border-ambuhub-200 bg-white px-6 py-16 text-center text-foreground/55">
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
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        My listings
      </h1>
      <p className="mt-2 text-foreground/70">
        Services and equipment you have published, grouped by category.
      </p>

      <div className="mt-10 space-y-12">
        {sections.map((section) => (
          <section key={section.slug}>
            <h2 className="border-b border-ambuhub-200 pb-2 text-lg font-semibold text-foreground">
              {section.categoryName}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {section.items.map((item) => (
                <li
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-ambuhub-100 bg-white shadow-sm"
                >
                  <div className="flex gap-0 sm:gap-0">
                    {item.photoUrls[0] ? (
                      <div className="relative h-28 w-28 shrink-0 bg-ambuhub-surface">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.photoUrls[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0 flex-1 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                        {item.departmentName}
                      </p>
                      <h3 className="mt-1 font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-foreground/70">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-foreground/55">
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
