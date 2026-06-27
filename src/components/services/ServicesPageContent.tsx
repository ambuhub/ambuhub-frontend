"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Package,
  Stethoscope,
  Truck,
} from "lucide-react";
import { ServiceCategoryCard } from "@/components/services/ServiceCategoryCard";
import type { LandingServiceCategory } from "@/lib/landing-service-categories";

const ease = [0.22, 1, 0.36, 1] as const;

const highlights = [
  {
    title: "Book on-site coverage",
    body: "Line up ambulance standby and medical teams for concerts, festivals, and corporate events.",
    icon: CalendarDays,
    accent: "from-sky-500 to-blue-600 shadow-sky-600/30",
  },
  {
    title: "Hire personnel & transport",
    body: "Find medics, drivers, and planned transfers when you need flexible staffing or movement.",
    icon: Stethoscope,
    accent: "from-indigo-600 to-blue-800 shadow-indigo-700/30",
  },
  {
    title: "Fleet & equipment",
    body: "Source servicing, vehicles, stretchers, monitors, and kit from verified marketplace providers.",
    icon: Package,
    accent: "from-cyan-500 to-teal-600 shadow-teal-600/30",
  },
] as const;

const slugIcons: Record<string, typeof Truck> = {
  "medical-transport": Truck,
  personnel: Stethoscope,
  "ambulance-servicing": Building2,
  "ambulance-equipment": Package,
};

type Props = {
  categories: LandingServiceCategory[];
};

export function ServicesPageContent({ categories }: Props) {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-blue-50/40 via-white to-sky-50/50">
      <section className="relative overflow-hidden bg-black">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.22]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgb(0 105 180 / 0.4) 0%, transparent 45%), radial-gradient(circle at 80% 60%, rgb(2 132 199 / 0.3) 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 shadow-sm backdrop-blur sm:text-sm">
              <Truck className="h-3.5 w-3.5 text-sky-400" aria-hidden />
              One marketplace for medical coverage
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Our services
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/75">
              Medical transport, personnel, fleet servicing, and equipment—browse
              categories, compare providers, and book what your event or operation
              needs.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative border-t border-blue-200/70 bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 py-16 sm:py-20 lg:py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 20% 0%, rgb(56 189 248 / 0.35), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgb(99 102 241 / 0.22), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl">
              Browse by category
            </h2>
            <p className="mt-4 text-base leading-relaxed text-blue-900/75 sm:text-lg">
              Choose a path below to explore listings, compare providers, and
              start booking.
            </p>
          </motion.div>

          {categories.length === 0 ? (
            <p className="mt-10 text-center text-sm text-blue-900/60">
              Service categories could not be loaded. Check that the API is
              reachable and try again shortly.
            </p>
          ) : (
            <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {categories.map((category, i) => {
                const Icon = slugIcons[category.slug] ?? Truck;
                return (
                  <motion.li
                    key={category.id}
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease }}
                    className="min-w-0"
                  >
                    <div className="relative">
                      <span
                        className="pointer-events-none absolute -right-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 text-white shadow-lg shadow-blue-700/25"
                        aria-hidden
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <ServiceCategoryCard category={category} index={i} />
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="border-t border-blue-200/50 bg-gradient-to-b from-white via-sky-50/90 to-blue-100/80 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl">
              Built for events and operations
            </h2>
            <p className="mt-4 text-base leading-relaxed text-blue-900/75 sm:text-lg">
              Whether you are promoting a show or running a fleet, Ambuhub keeps
              discovery and booking in one place.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:gap-8">
            {highlights.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -28 : 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease }}
                  className="rounded-2xl border-2 border-sky-200/70 bg-white p-6 shadow-lg shadow-sky-600/10 sm:p-8"
                >
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${item.accent}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-blue-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-blue-900/70">
                    {item.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-blue-200/40 bg-gradient-to-b from-cyan-50/50 via-blue-50 to-sky-100/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-sky-600 to-indigo-700 px-6 py-12 text-center shadow-2xl shadow-blue-900/35 ring-2 ring-white/25 sm:px-10 sm:py-14"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-35 mix-blend-soft-light"
              aria-hidden
              style={{
                backgroundImage:
                  "radial-gradient(circle at 15% 20%, rgb(255 255 255 / 0.5), transparent 42%), radial-gradient(circle at 90% 80%, rgb(56 189 248 / 0.5), transparent 38%)",
              }}
            />
            <div className="relative">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Ready to explore or list?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/90">
                Create an account to book coverage, hire personnel, or publish
                your services on the marketplace.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/auth?signup=1"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-blue-700 shadow-md transition-colors hover:bg-sky-50"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
