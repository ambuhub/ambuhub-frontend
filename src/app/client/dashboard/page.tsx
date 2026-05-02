"use client";

import Link from "next/link";
import { CheckCircle2, Package, Truck, Users, Wrench } from "lucide-react";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import { AMBUHUB_SERVICES, type AmbuhubServiceSlug } from "@/lib/ambuhub-services";
import { CLIENT_CATEGORY_BULLETS } from "@/lib/client-dashboard-category-cards";

const categoryIcons: Record<
  AmbuhubServiceSlug,
  typeof Truck
> = {
  "medical-transport": Truck,
  personnel: Users,
  "ambulance-servicing": Wrench,
  "ambulance-equipment": Package,
};

export default function ClientDashboardPage() {
  const { user, loading } = useSessionAndCart();

  const displayName =
    user && (user.firstName || user.lastName)
      ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
      : null;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-[26px] border border-blue-100/80 bg-white/95 p-5 shadow-xl shadow-slate-200/70 backdrop-blur-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ambuhub-brand sm:text-3xl">
              {loading ? (
                "Hello…"
              ) : displayName ? (
                <>Hello, {displayName}</>
              ) : (
                "Hello there"
              )}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              What would you like to do today?
            </p>
          </div>
          <nav
            className="flex shrink-0 flex-wrap items-center gap-1 text-sm text-slate-500 sm:justify-end"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="text-slate-500 hover:text-ambuhub-brand">
              Home
            </Link>
            <span className="text-slate-400" aria-hidden>
              /
            </span>
            <span className="font-medium text-ambuhub-brand">Dashboard</span>
          </nav>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AMBUHUB_SERVICES.map((svc) => {
            const Icon = categoryIcons[svc.slug];
            const bullets = CLIENT_CATEGORY_BULLETS[svc.slug];
            return (
              <Link
                key={svc.slug}
                href={`/services/${svc.slug}`}
                className="group flex h-full min-h-[280px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-cyan-600 text-white shadow-md shadow-blue-900/25">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h2 className="mt-4 text-lg font-bold tracking-tight text-slate-900">
                    {svc.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {svc.description}
                  </p>
                  <ul className="mt-4 flex flex-col gap-2.5 text-sm text-slate-700">
                    {bullets.map((line) => (
                      <li key={line} className="flex gap-2">
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-green-600"
                          aria-hidden
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto border-t border-slate-100 bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3.5 text-center text-sm font-semibold text-white transition group-hover:opacity-95">
                  Browse {svc.title}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
