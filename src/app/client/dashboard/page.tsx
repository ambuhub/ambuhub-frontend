"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ClipboardList,
  Heart,
  Package,
  ShoppingBag,
  Siren,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import {
  AMBUHUB_SERVICES,
  type AmbuhubServiceSlug,
} from "@/lib/ambuhub-services";
import { CLIENT_CATEGORY_BULLETS } from "@/lib/client-dashboard-category-cards";

const ease = [0.22, 1, 0.36, 1] as const;

const categoryVisuals: Record<
  AmbuhubServiceSlug,
  {
    icon: typeof Truck;
    image: string;
    accent: string;
  }
> = {
  "medical-transport": {
    icon: Truck,
    image: "/landing-page/landing-2.png",
    accent: "from-sky-600/90 via-blue-700/75 to-slate-950/85",
  },
  personnel: {
    icon: Users,
    image: "/landing-page/landing-3.png",
    accent: "from-cyan-600/90 via-teal-700/70 to-slate-950/85",
  },
  "ambulance-servicing": {
    icon: Wrench,
    image: "/landing-page/landing-4.png",
    accent: "from-blue-700/90 via-indigo-800/70 to-slate-950/85",
  },
  "ambulance-equipment": {
    icon: Package,
    image: "/landing-page/landing-5.png",
    accent: "from-ambuhub-brand/90 via-sky-800/70 to-slate-950/85",
  },
};

const quickActions = [
  {
    href: "/client/dispatch",
    label: "Request ambulance",
    hint: "Live dispatch to your location",
    icon: Siren,
    tone: "bg-red-600 text-white hover:bg-red-700 shadow-red-900/25",
  },
  {
    href: "/client/dispatch/requests",
    label: "My requests",
    hint: "Track active and past trips",
    icon: ClipboardList,
    tone: "bg-white text-slate-900 hover:bg-sky-50 border border-slate-200",
  },
  {
    href: "/client/orders",
    label: "Orders",
    hint: "Hire, book, and purchases",
    icon: ShoppingBag,
    tone: "bg-white text-slate-900 hover:bg-sky-50 border border-slate-200",
  },
  {
    href: "/client/favorite",
    label: "Favorites",
    hint: "Saved providers and listings",
    icon: Heart,
    tone: "bg-white text-slate-900 hover:bg-sky-50 border border-slate-200",
  },
] as const;

function greetingHourLabel(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function ClientDashboardPage() {
  const { user, loading } = useSessionAndCart();

  const displayName =
    user && (user.firstName || user.lastName)
      ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
      : null;

  const hello = loading
    ? "Welcome back"
    : displayName
      ? `${greetingHourLabel()}, ${displayName}`
      : greetingHourLabel();

  return (
    <div className="mx-auto max-w-6xl space-y-8 sm:space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease }}
        className="relative isolate overflow-hidden rounded-[28px] shadow-xl shadow-slate-900/20"
        aria-labelledby="client-dashboard-hero"
      >
        <div className="absolute inset-0" aria-hidden>
          <Image
            src="/landing-page/hero-bg.png"
            alt=""
            fill
            priority
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover object-[70%_center] sm:object-[55%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-blue-950/35" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(14,165,233,0.28),_transparent_55%)]" />
        </div>

        <div className="relative flex min-h-[280px] flex-col justify-end gap-6 px-5 py-7 sm:min-h-[320px] sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300/90">
              Ambuhub client hub
            </p>
            <h1
              id="client-dashboard-hero"
              className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.6rem] lg:leading-tight"
            >
              {hello}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
              Need coverage now, or ready to browse transport, crew, and
              equipment? Your next move starts here.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/client/dispatch"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-700"
            >
              <Siren className="h-4 w-4" aria-hidden />
              Request ambulance
            </Link>
            <Link
              href="/services/medical-transport"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Browse marketplace
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </motion.section>

      <section aria-labelledby="quick-actions-heading">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease }}
        >
          <h2
            id="quick-actions-heading"
            className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
          >
            Jump back in
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Shortcuts for the things clients use most.
          </p>
        </motion.div>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.li
                key={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 + index * 0.06, ease }}
              >
                <Link
                  href={action.href}
                  className={`group flex h-full flex-col rounded-2xl px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${action.tone}`}
                >
                  <Icon className="h-5 w-5 opacity-90" aria-hidden />
                  <span className="mt-3 text-sm font-semibold">{action.label}</span>
                  <span
                    className={`mt-1 text-xs leading-snug ${
                      action.href === "/client/dispatch"
                        ? "text-white/80"
                        : "text-slate-500"
                    }`}
                  >
                    {action.hint}
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="explore-services-heading">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease }}
        >
          <h2
            id="explore-services-heading"
            className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
          >
            Explore Ambuhub services
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Transport, crew, servicing, and equipment — pick a lane and browse
            live listings.
          </p>
        </motion.div>

        <ul className="mt-5 grid gap-5 sm:grid-cols-2">
          {AMBUHUB_SERVICES.map((svc, index) => {
            const visual = categoryVisuals[svc.slug];
            const Icon = visual.icon;
            const bullets = CLIENT_CATEGORY_BULLETS[svc.slug];
            return (
              <motion.li
                key={svc.slug}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-48px" }}
                transition={{ duration: 0.55, delay: index * 0.07, ease }}
              >
                <Link
                  href={`/services/${svc.slug}`}
                  className="group relative flex min-h-[280px] overflow-hidden rounded-[24px] shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <Image
                    src={visual.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${visual.accent}`}
                    aria-hidden
                  />
                  <div className="relative z-10 flex w-full flex-col justify-end p-5 sm:p-6">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="mt-4 text-xl font-bold tracking-tight text-white">
                      {svc.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">
                      {svc.description}
                    </p>
                    <ul className="mt-4 space-y-1.5 text-xs text-white/75 sm:text-sm">
                      {bullets.map((line) => (
                        <li key={line} className="flex gap-2">
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300"
                            aria-hidden
                          />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-200 transition group-hover:gap-2.5 group-hover:text-white">
                      Browse {svc.title}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
