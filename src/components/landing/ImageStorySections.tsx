"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const blocks = [
  {
    id: "field-operations",
    title: "From tour bus to festival field",
    body: "Give your production team and medical partners the same plan—who is booked, when they arrive, and what is included. Less time chasing spreadsheets, more time locking in the run of show.",
    imageSrc: "/landing-page/landing-1.jpg",
    imageAlt:
      "Medical standby and ambulance vehicle at an outdoor event venue",
    imageOnRight: true,
  },
  {
    id: "unified-marketplace",
    title: "One place for coverage and gear",
    body: "Ambuhub keeps standby, transport, staff, and equipment listings connected—so you can secure medical coverage for opening night and source kit for the fleet without switching between disconnected tools.",
    imageSrc: "/landing-page/landing-2.jpg",
    imageAlt:
      "Ambulance and medical professionals preparing kit for an event",
    imageOnRight: false,
  },
] as const;

function slideUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 56 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-72px" },
    transition: { duration: 0.6, delay, ease },
  } as const;
}

export function ImageStorySections() {
  return (
    <>
      {blocks.map((block, index) => (
        <section
          key={block.id}
          id={block.id}
          className={
            index % 2 === 0
              ? "border-t border-blue-200/50 bg-gradient-to-b from-white via-blue-50/50 to-sky-50/60 py-16 sm:py-20 lg:py-24"
              : "border-t border-indigo-200/50 bg-gradient-to-b from-cyan-50/80 via-sky-50/70 to-blue-100/70 py-16 sm:py-20 lg:py-24"
          }
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-14 xl:gap-16">
              <motion.div
                {...slideUp(0)}
                className={
                  block.imageOnRight
                    ? "order-2 lg:order-1"
                    : "order-2 lg:order-2"
                }
              >
                <h2 className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
                  {block.title}
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-blue-900/75">
                  {block.body}
                </p>
              </motion.div>

              <motion.div
                {...slideUp(0.1)}
                className={
                  block.imageOnRight
                    ? "order-1 lg:order-2"
                    : "order-1 lg:order-1"
                }
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-2 border-sky-300/60 bg-gradient-to-br from-sky-100 to-blue-100 shadow-xl shadow-blue-900/15 ring-2 ring-blue-400/20">
                  <Image
                    src={block.imageSrc}
                    alt={block.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={index === 0}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
