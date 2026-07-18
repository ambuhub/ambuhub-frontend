"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  CalendarDays,
  Package,
  Receipt,
  ShoppingCart,
  Truck,
  UserRound,
  Users,
  Workflow,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const clientSteps = [
  "Create a free client account and complete your profile.",
  "Browse services by category—transport, personnel, equipment, and more.",
  "Compare listings and book when you find the right provider.",
  "Track bookings and keep details in one place from your dashboard.",
] as const;

const providerSteps = [
  "Sign up as a service provider and add your business details.",
  "Publish listings—scope, pricing, availability, and stock where it applies.",
  "Manage bookings, schedules, and sales from your provider dashboard.",
  "Get paid into your wallet and withdraw your earnings.",
] as const;

const transactModes = [
  {
    title: "Book",
    tagline: "Daily standby & scheduled coverage",
    body: "Reserve ambulance standby and medical teams by the day for events, with provider availability and schedules built in.",
    icon: CalendarDays,
    accent: "from-sky-500 to-blue-600 shadow-sky-600/30",
  },
  {
    title: "Hire",
    tagline: "Short-term rentals & personnel",
    body: "Hire vehicles, equipment, or qualified personnel for a defined window, with clear return and coverage terms.",
    icon: Truck,
    accent: "from-indigo-600 to-blue-800 shadow-indigo-700/30",
  },
  {
    title: "Buy & sell",
    tagline: "Equipment marketplace",
    body: "Purchase stretchers, monitors, and vehicle kit—or list your own stock for buyers across the marketplace.",
    icon: ShoppingCart,
    accent: "from-cyan-500 to-teal-600 shadow-teal-600/30",
  },
] as const;

const features = [
  {
    title: "Vetted provider profiles",
    description:
      "Compare coverage areas, credentials, and reviews before you commit.",
    icon: BadgeCheck,
  },
  {
    title: "Structured bookings",
    description:
      "Dates, venues, and scope stay organized so everyone stays aligned.",
    icon: CalendarClock,
  },
  {
    title: "Equipment marketplace",
    description:
      "List or source kit alongside your service bookings in one platform.",
    icon: Package,
  },
  {
    title: "Personnel on demand",
    description:
      "Post shifts or browse medics and drivers for standby and coverage.",
    icon: Users,
  },
] as const;

function StepList({
  items,
  accentClass,
  stepTextClass,
}: {
  items: readonly string[];
  accentClass: string;
  stepTextClass: string;
}) {
  return (
    <ol className="mt-6 space-y-4">
      {items.map((text, i) => (
        <li key={i} className="flex gap-3">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${accentClass}`}
          >
            {i + 1}
          </span>
          <span className={`pt-0.5 text-sm leading-relaxed ${stepTextClass}`}>
            {text}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function HowItWorksPageContent() {
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
              <Workflow className="h-3.5 w-3.5 text-sky-400" aria-hidden />
              From discovery to show day
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              How Ambuhub works
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/75">
              A clear path for booking ambulance coverage, hiring crew, servicing
              fleets, and trading equipment—built so organizers and providers stay
              aligned without the back-and-forth.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-blue-200/60 bg-gradient-to-b from-white via-sky-50/90 to-blue-100/80 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
              Two ways to use Ambuhub
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-blue-900/75">
              Whether you are booking coverage or providing it, the flow stays
              straightforward.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-10">
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-48px" }}
              transition={{ duration: 0.5, ease, delay: 0.05 }}
              className="rounded-2xl border border-blue-200/80 bg-white p-6 shadow-lg shadow-blue-900/5 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-950 ring-1 ring-blue-200/80">
                  <UserRound className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="text-xl font-semibold tracking-tight text-blue-950">
                  As a client
                </h3>
              </div>
              <StepList
                items={clientSteps}
                accentClass="bg-blue-950 text-white"
                stepTextClass="text-blue-950"
              />
              <Link
                href="/auth?signup=1"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-950 transition-colors hover:text-blue-800 hover:underline"
              >
                Sign up as a client
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-48px" }}
              transition={{ duration: 0.5, ease, delay: 0.1 }}
              className="rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 p-6 shadow-xl shadow-blue-950/30 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm">
                  <Building2 className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="text-xl font-semibold tracking-tight text-white">
                  As a service provider
                </h3>
              </div>
              <StepList
                items={providerSteps}
                accentClass="bg-white/20 text-white ring-1 ring-white/30"
                stepTextClass="text-white/90"
              />
              <Link
                href="/auth?signup=1"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-sky-100 hover:underline"
              >
                Sign up as a provider
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-t border-blue-200/70 bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
              Ways to transact
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-blue-900/75">
              Listings come in three forms so providers can offer exactly what
              fits—and clients book the right way every time.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:gap-8">
            {transactModes.map((mode, i) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={mode.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease }}
                  className="rounded-2xl border-2 border-sky-200/70 bg-white p-6 shadow-lg shadow-sky-600/10 sm:p-8"
                >
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${mode.accent}`}
                  >
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-blue-950">
                    {mode.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-900/55">
                    {mode.tagline}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-blue-900/70">
                    {mode.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative border-t border-blue-200/60 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-16 sm:py-20 lg:py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 0% 0%, rgb(56 189 248 / 0.45), transparent 45%), radial-gradient(circle at 100% 80%, rgb(129 140 248 / 0.35), transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease }}
            className="max-w-2xl"
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Why it stays simple
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-sky-100/90">
              The platform keeps listings clear and expectations shared, so there is
              less back-and-forth before show day.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.08, ease }}
                  className="group rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg shadow-black/10 backdrop-blur-md transition-all hover:border-sky-300/40 hover:bg-white/15 hover:shadow-xl lg:p-8"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-600/30">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-sky-100/85">
                    {f.description}
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
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/30">
                <Receipt className="h-6 w-6" aria-hidden />
              </span>
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Ready to get started?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/90">
                Create an account to book coverage, hire personnel, or publish your
                services on the marketplace.
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
                  href="/services"
                  className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  Browse services
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
