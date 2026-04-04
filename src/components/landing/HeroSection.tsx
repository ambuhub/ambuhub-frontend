"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays } from "lucide-react";
import { ServiceHubGraphic } from "@/components/landing/ServiceHubGraphic";

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-to-b from-ambuhub-50 via-white to-white"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgb(0 105 180 / 0.12) 0%, transparent 45%), radial-gradient(circle at 80% 60%, rgb(2 132 199 / 0.1) 0%, transparent 40%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.55fr)] lg:items-stretch lg:gap-6 xl:gap-8">
          <div className="min-w-0 self-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-ambuhub-200 bg-white/80 px-3 py-1 text-xs font-medium text-ambuhub-800 shadow-sm backdrop-blur sm:text-sm"
            >
              <CalendarDays
                className="h-3.5 w-3.5 text-ambuhub-brand"
                aria-hidden
              />
              Concerts, venues & tours
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -48 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]"
            >
              Book ambulance coverage, crew, and equipment in one place
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/70"
            >
              Planning a show, festival, or corporate event? Ambuhub connects
              you with providers for on-site medical standby, scheduled
              transports, qualified personnel, and ambulance gear—before the
              doors open.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ambuhub-brand px-6 py-3.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-ambuhub-brand-dark"
              >
                Request a demo
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-ambuhub-200 bg-white px-6 py-3.5 text-base font-semibold text-ambuhub-900 transition-colors hover:bg-ambuhub-50"
              >
                See how it works
              </Link>
            </motion.div>
          </div>
          <ServiceHubGraphic />
        </div>
      </div>
    </section>
  );
}
