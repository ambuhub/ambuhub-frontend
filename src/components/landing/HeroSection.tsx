"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";

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
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-ambuhub-200 bg-white/80 px-3 py-1 text-xs font-medium text-ambuhub-800 shadow-sm backdrop-blur sm:text-sm"
            >
              <Shield className="h-3.5 w-3.5 text-ambuhub-brand" aria-hidden />
              Emergency-ready operations
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -48 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]"
            >
              Dispatch and coordinate emergency response with confidence
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/70"
            >
              Ambuhub brings ambulances, first responders, and control rooms onto
              one clear workflow—so teams see the full picture and act faster.
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
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:justify-self-end"
          >
            <div className="relative rounded-2xl border border-ambuhub-100 bg-white p-6 shadow-xl shadow-ambuhub-900/5 sm:p-8">
              <div className="absolute -right-6 -top-6 hidden h-24 w-24 rounded-full bg-ambuhub-200/60 blur-2xl sm:block" />
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-ambuhub-700">
                  Live overview
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Active units", value: "12", tone: "text-ambuhub-brand" },
                    { label: "Incidents triaged", value: "48", tone: "text-foreground" },
                    { label: "Avg. response sync", value: "< 2m", tone: "text-foreground/80" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between rounded-xl bg-ambuhub-surface px-4 py-3"
                    >
                      <span className="text-sm text-foreground/70">{row.label}</span>
                      <span className={`text-sm font-semibold ${row.tone}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-foreground/50">
                  Illustrative preview—connect your fleet when you are ready.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
