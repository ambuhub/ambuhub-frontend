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
      className="border-t border-blue-200/50 bg-gradient-to-b from-sky-100/90 via-blue-50 to-cyan-50/80 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-blue-900/75">
            A simple flow promoters, venues, and providers can adopt quickly—without
            sacrificing the rigor professional medical coverage deserves.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3 lg:gap-10">
          {steps.map((s, i) => {
            const cardTint =
              i === 0
                ? "border-sky-300/70 bg-gradient-to-br from-white to-sky-50 shadow-sky-500/15"
                : i === 1
                  ? "border-blue-300/70 bg-gradient-to-br from-white to-blue-50 shadow-blue-600/15"
                  : "border-cyan-300/70 bg-gradient-to-br from-white to-cyan-50 shadow-cyan-600/12";
            const stepBadge =
              i === 0
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                : i === 1
                  ? "bg-blue-700 text-white shadow-md shadow-blue-700/30"
                  : "bg-teal-600 text-white shadow-md shadow-teal-600/30";
            return (
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
                className={`relative rounded-2xl border-2 p-6 shadow-lg lg:p-8 ${cardTint}`}
              >
                <span
                  className={`inline-flex min-w-[2.25rem] items-center justify-center rounded-lg px-2 py-1 text-sm font-bold tabular-nums ${stepBadge}`}
                >
                  {s.step}
                </span>
                <h3 className="mt-3 text-xl font-semibold text-blue-950">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-900/70">
                  {s.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
