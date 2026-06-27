"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  Heart,
  LayoutDashboard,
  ListChecks,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const clientGuide = [
  {
    title: "Create your account",
    body: "Sign up as a client with your email, complete your profile, and verify your details so providers know who they are coordinating with.",
    icon: UserRound,
  },
  {
    title: "Browse and compare",
    body: "Open Services to explore categories—medical transport, personnel, fleet servicing, and equipment. Open any listing to see scope, pricing, and provider details.",
    icon: Search,
  },
  {
    title: "Book, hire, or buy",
    body: "Use Book for daily event coverage, Hire for rentals and short-term staffing, or add sale items to your cart. Confirm dates, locations, and terms before checkout.",
    icon: ShoppingCart,
  },
  {
    title: "Track from your dashboard",
    body: "View orders, bookings, favorites, notifications, and receipts from your client dashboard. Keep schedules and handoffs in one place through to wrap.",
    icon: LayoutDashboard,
  },
] as const;

const providerGuide = [
  {
    title: "Register as a provider",
    body: "Choose the provider role at signup, add your business name, contact details, and coverage area so clients can find and trust your listings.",
    icon: Building2,
  },
  {
    title: "Publish your listings",
    body: "From your provider dashboard, add services with the right category and listing type—sale, hire, or book—plus pricing, stock, or availability schedules.",
    icon: ListChecks,
  },
  {
    title: "Manage activity",
    body: "Respond to bookings, update availability, and monitor sales from your dashboard. Personnel and hire bookings show schedules you can coordinate with clients.",
    icon: CalendarDays,
  },
  {
    title: "Get paid",
    body: "Completed orders credit your provider wallet. Review balances and withdraw earnings when payout options are available for your account.",
    icon: Wallet,
  },
] as const;

const clientFeatures = [
  { label: "Orders & receipts", icon: Package },
  { label: "Favorites", icon: Heart },
  { label: "Notifications", icon: Bell },
  { label: "Concierge requests", icon: Sparkles },
] as const;

const providerFeatures = [
  { label: "Listings manager", icon: ListChecks },
  { label: "Bookings & sales", icon: CalendarDays },
  { label: "Availability", icon: LayoutDashboard },
  { label: "Wallet & payouts", icon: Wallet },
] as const;

function StepList({
  steps,
  accentClass,
}: {
  steps: readonly { title: string; body: string; icon: typeof UserRound }[];
  accentClass: string;
}) {
  return (
    <ol className="mt-8 space-y-6">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <li key={step.title} className="flex gap-4">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${accentClass}`}
            >
              {i + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-blue-900/45" aria-hidden />
                <h3 className="font-semibold text-blue-950">{step.title}</h3>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-blue-900/70">
                {step.body}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function HowToUsePageContent() {
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
              <Sparkles className="h-3.5 w-3.5 text-sky-400" aria-hidden />
              Practical guides for every role
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              How to use Ambuhub
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/75">
              Step-by-step guidance for clients booking coverage and providers
              listing services—so you can get value from the platform from day
              one.
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
              Choose your path
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-blue-900/75">
              Whether you are booking coverage or listing it, the flow stays
              straightforward.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-10">
            <motion.article
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-48px" }}
              transition={{ duration: 0.5, ease, delay: 0.05 }}
              className="rounded-2xl border-2 border-sky-300/70 bg-gradient-to-br from-white to-sky-100/90 p-6 shadow-lg shadow-sky-600/10 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-600/30">
                  <UserRound className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="text-xl font-semibold tracking-tight text-blue-950">
                  As a client
                </h2>
              </div>
              <StepList
                steps={clientGuide}
                accentClass="bg-sky-500 text-white shadow-md shadow-sky-500/25"
              />
              <Link
                href="/auth?signup=1"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-900 hover:underline"
              >
                Sign up as a client
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-48px" }}
              transition={{ duration: 0.5, ease, delay: 0.1 }}
              className="rounded-2xl border-2 border-indigo-300/70 bg-gradient-to-br from-white to-indigo-100/90 p-6 shadow-lg shadow-indigo-600/10 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-800 text-white shadow-md shadow-indigo-700/30">
                  <Building2 className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="text-xl font-semibold tracking-tight text-blue-950">
                  As a service provider
                </h2>
              </div>
              <StepList
                steps={providerGuide}
                accentClass="bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
              />
              <Link
                href="/auth?signup=1"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 transition-colors hover:text-indigo-950 hover:underline"
              >
                Sign up as a provider
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </motion.article>
          </div>
        </div>
      </section>

      <section className="border-t border-blue-200/50 bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
              What you will find in your dashboard
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-blue-900/75">
              After signing in, everything you need is organized by role.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease }}
              className="rounded-2xl border-2 border-sky-200/70 bg-white p-6 shadow-lg sm:p-8"
            >
              <h3 className="text-lg font-semibold text-blue-950">Client tools</h3>
              <ul className="mt-6 grid grid-cols-2 gap-4">
                {clientFeatures.map((f) => {
                  const Icon = f.icon;
                  return (
                    <li
                      key={f.label}
                      className="flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/50 px-4 py-3"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
                      <span className="text-sm font-medium text-blue-950">
                        {f.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease, delay: 0.08 }}
              className="rounded-2xl border-2 border-indigo-200/70 bg-white p-6 shadow-lg sm:p-8"
            >
              <h3 className="text-lg font-semibold text-blue-950">Provider tools</h3>
              <ul className="mt-6 grid grid-cols-2 gap-4">
                {providerFeatures.map((f) => {
                  const Icon = f.icon;
                  return (
                    <li
                      key={f.label}
                      className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
                      <span className="text-sm font-medium text-blue-950">
                        {f.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
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
                Ready to try it yourself?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/90">
                Create a free account, explore the marketplace, or read more about
                how the platform works behind the scenes.
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
                  href="/how-it-works"
                  className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  How it works
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  FAQ
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
