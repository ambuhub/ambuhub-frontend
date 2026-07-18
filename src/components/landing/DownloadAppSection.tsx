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
      className="relative flex items-center justify-center overflow-hidden border-t border-blue-300/40 bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 py-14 sm:py-16 lg:max-h-[50vh] lg:py-10"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgb(125 211 252 / 0.5), transparent 45%), radial-gradient(circle at 85% 85%, rgb(99 102 241 / 0.45), transparent 40%)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-6xl justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:gap-8 lg:flex-row lg:items-center lg:gap-6 xl:gap-8">
          <motion.div
            {...slideUp(0.1)}
            className="order-2 max-w-md text-center lg:order-1 lg:text-left"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-200 sm:text-xs">
              Connect on the go
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:leading-snug">
              One Platform, Every Ambulance
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-sky-100/90 sm:text-base">
              Connect to ambulance service providers near you when it matters.
            </p>
            <h3 className="mt-5 text-sm font-bold text-white sm:text-base">
              Download the Ambu<span className="text-red-500">H</span>ub app
              below
            </h3>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <AppStoreBadge />
              <GooglePlayBadge />
            </div>
            <p className="mt-2 text-xs text-sky-200/80">Mobile apps coming soon.</p>
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
