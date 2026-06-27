"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

function slideUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-48px" },
    transition: { duration: 0.5, delay, ease },
  } as const;
}

function AppStoreBadge() {
  return (
    <span
      aria-disabled="true"
      className="inline-block cursor-not-allowed"
      title="Coming soon"
    >
      <Image
        src="/landing-page/apple_store.svg"
        alt="Download on the App Store (coming soon)"
        width={120}
        height={40}
        className="h-9 w-auto opacity-90"
      />
    </span>
  );
}

function GooglePlayBadge() {
  return (
    <span
      aria-disabled="true"
      className="inline-block cursor-not-allowed"
      title="Coming soon"
    >
      <Image
        src="/landing-page/google_store.svg"
        alt="Get it on Google Play (coming soon)"
        width={239}
        height={71}
        className="h-9 w-auto opacity-90"
      />
    </span>
  );
}

export function DownloadAppSection() {
  return (
    <section
      id="download-app"
      className="flex items-center justify-center border-t border-slate-200/80 bg-white py-12 sm:py-16 lg:max-h-[50vh] lg:py-0"
    >
      <div className="mx-auto flex w-full max-w-6xl justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:gap-8 lg:flex-row lg:items-center lg:gap-6 xl:gap-8">
          <motion.div
            {...slideUp(0.1)}
            className="order-2 max-w-md text-center lg:order-1 lg:text-left"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:text-xs">
              Connect on the go
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-blue-950 sm:text-2xl lg:text-[1.65rem] lg:leading-snug">
              Coverage that&apos;s in the palm of your hand
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-blue-900/75 sm:text-[0.9375rem]">
              Browse listings, book coverage, and stay in sync with providers—everything
              you need for events and medical transport, in one app.
            </p>
            <h3 className="mt-4 text-sm font-bold text-blue-950 sm:text-base">
              Download the Ambuhub app below
            </h3>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <AppStoreBadge />
              <GooglePlayBadge />
            </div>
            <p className="mt-2 text-xs text-slate-500">Mobile apps coming soon.</p>
          </motion.div>

          <motion.div {...slideUp(0)} className="order-1 shrink-0 lg:order-2">
            <div className="relative aspect-[3/4] w-[150px] sm:w-[170px] lg:w-[min(16vw,180px)]">
              <Image
                src="/landing-page/landing-6.png"
                alt="Ambuhub mobile app on a smartphone"
                fill
                className="object-contain object-center"
                sizes="180px"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
