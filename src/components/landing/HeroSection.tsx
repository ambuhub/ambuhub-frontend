"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays } from "lucide-react";
import { ServiceHubGraphic } from "@/components/landing/ServiceHubGraphic";

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative flex min-h-[calc(100dvh-4rem)] flex-col justify-center overflow-hidden bg-slate-950 sm:min-h-[calc(100dvh-4.25rem)] lg:h-[calc(100dvh-4.25rem)] lg:max-h-[calc(100dvh-4.25rem)]"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src="/landing-page/hero-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center] sm:object-[60%_center] lg:object-[45%_center]"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/10"
        aria-hidden
      />
      <div className="relative mx-auto flex w-full max-w-7xl items-center px-4 py-10 sm:px-6 sm:py-12 lg:h-full lg:min-h-0 lg:py-2 lg:px-8">
        <div className="grid w-full min-h-0 items-center gap-8 lg:grid-cols-[minmax(0,0.5fr)_minmax(0,1.5fr)] lg:gap-3 xl:gap-5">
          <div className="min-w-0 self-center lg:max-w-md xl:max-w-lg">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 shadow-sm backdrop-blur lg:text-[11px] lg:px-2.5 lg:py-0.5"
            >
              <CalendarDays
                className="h-3.5 w-3.5 text-sky-400"
                aria-hidden
              />
              Ambulances, ambulance crew, and equipment
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -48 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 text-4xl font-bold tracking-tight text-[#FFE566] sm:mt-5 sm:text-5xl lg:mt-3 lg:text-[2rem] lg:leading-[1.15] xl:text-[2.25rem]"
              style={{
                textShadow:
                  "0 0 12px rgba(255, 215, 0, 0.85), 0 0 28px rgba(255, 200, 50, 0.55), 0 0 48px rgba(255, 180, 0, 0.35)",
              }}
            >
              A marketplace that links clients to everything ambulance-related
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:mt-5 sm:text-lg lg:mt-2.5 lg:max-w-none lg:text-sm lg:leading-snug"
            >
              Do you need an air or ground ambulance, repatriation of remains,
              hearse, ambulance crew, or ambulance equipment? Are you an
              ambulance service provider, personnel, or ambulance equipment
              provider? AMBUHUB is a one-stop platform connecting you with
              trusted ambulance and medical transport providers
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:items-center lg:mt-4 lg:gap-2.5"
            >
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-ambuhub-brand px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-ambuhub-brand-dark sm:px-5 sm:py-2.5 lg:px-4 lg:py-2 lg:text-[13px]"
              >
                Contact us
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-transparent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:px-5 sm:py-2.5 lg:px-4 lg:py-2 lg:text-[13px]"
              >
                See how it works
              </Link>
            </motion.div>
          </div>
          <div className="hidden h-full min-h-0 max-h-full overflow-hidden lg:flex lg:items-end lg:justify-end">
            <ServiceHubGraphic />
          </div>
        </div>
      </div>
    </section>
  );
}
