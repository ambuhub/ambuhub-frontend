"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, UserRound } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const clientSteps = [
  "Create a free client account and complete your profile.",
  "Browse services by category—transport, personnel, equipment, and more.",
  "Compare listings and reach out or book when you find the right provider.",
  "Track bookings and keep details in one place from your dashboard.",
] as const;

const providerSteps = [
  "Sign up as a service provider and add your business details.",
  "Publish listings for the categories you cover—scope, pricing, and stock where it applies.",
  "Use your provider dashboard to manage listings and stay on top of activity.",
  "Update or add listings anytime as your coverage or inventory changes.",
] as const;

function StepList({
  steps,
  accentClass,
}: {
  steps: readonly string[];
  accentClass: string;
}) {
  return (
    <ol className="mt-6 space-y-4">
      {steps.map((text, i) => (
        <li key={i} className="flex gap-3">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${accentClass}`}
          >
            {i + 1}
          </span>
          <span className="pt-0.5 text-sm leading-relaxed text-blue-950/85">
            {text}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function HowToUseSection() {
  return (
    <section
      id="how-to-use"
      className="border-t border-blue-200/60 bg-gradient-to-b from-white via-sky-50/90 to-blue-100/80 py-16 sm:py-20 lg:py-24"
      aria-labelledby="how-to-use-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2
            id="how-to-use-heading"
            className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl"
          >
            How to use Ambuhub
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-blue-900/75">
            Whether you are booking coverage or listing it, the flow stays
            straightforward.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-10">
          <motion.div
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
              <h3 className="text-xl font-semibold tracking-tight text-blue-950">
                As a client
              </h3>
            </div>
            <StepList
              steps={clientSteps}
              accentClass="bg-sky-500 text-white shadow-md shadow-sky-500/25"
            />
            <p className="mt-8 text-sm">
              <Link
                href="/auth"
                className="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
              >
                Sign up as a client
              </Link>
            </p>
          </motion.div>

          <motion.div
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
              <h3 className="text-xl font-semibold tracking-tight text-blue-950">
                As a service provider
              </h3>
            </div>
            <StepList
              steps={providerSteps}
              accentClass="bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
            />
            <p className="mt-8 text-sm">
              <Link
                href="/auth"
                className="font-semibold text-indigo-700 hover:text-indigo-950 hover:underline"
              >
                Sign up as a provider
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
