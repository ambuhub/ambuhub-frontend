"use client";

import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Post your need or browse listings",
    body: "Describe your event, transport, staffing, or equipment ask—or explore what providers already offer.",
  },
  {
    step: "02",
    title: "Compare providers and confirm details",
    body: "Review profiles, scope, and pricing, then lock dates, locations, and deliverables in writing.",
  },
  {
    step: "03",
    title: "Book and coordinate on the day",
    body: "Keep contact details, schedules, and handoffs in one place from load-in through wrap.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="border-t border-ambuhub-100 bg-gradient-to-b from-ambuhub-surface to-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-foreground/70">
            A simple flow promoters, venues, and providers can adopt quickly—without
            sacrificing the rigor professional medical coverage deserves.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3 lg:gap-10">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, x: i % 2 === 0 ? -36 : 36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative rounded-2xl border border-ambuhub-100 bg-white p-6 shadow-sm lg:p-8"
            >
              <span className="text-sm font-bold tabular-nums text-ambuhub-brand">
                {s.step}
              </span>
              <h3 className="mt-3 text-xl font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
