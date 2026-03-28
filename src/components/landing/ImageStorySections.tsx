"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const blocks = [
  {
    id: "field-operations",
    title: "Clarity from the control room to the street",
    body: "Give supervisors and crews the same operational picture—who is moving, where help is needed, and what changed in the last few minutes. Fewer radio round-trips, more time focused on patients and safety.",
    imageSrc: "/landing-page/landing-1.jpg",
    imageAlt:
      "Emergency response team coordinating ambulance and field operations",
    imageOnRight: true,
  },
  {
    id: "unified-response",
    title: "One workflow for a faster, calmer response",
    body: "Ambuhub is built so dispatch, ambulances, and partner agencies can align without juggling spreadsheets and group chats. Structured updates and shared context help every handoff feel deliberate—not rushed.",
    imageSrc: "/landing-page/landing-2.jpg",
    imageAlt: "Ambulance and emergency medical professionals in action",
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
              ? "border-t border-ambuhub-100 bg-white py-16 sm:py-20 lg:py-24"
              : "border-t border-ambuhub-100 bg-gradient-to-b from-ambuhub-surface/80 to-white py-16 sm:py-20 lg:py-24"
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
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {block.title}
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-foreground/70">
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
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-ambuhub-100 bg-ambuhub-50 shadow-xl shadow-ambuhub-900/[0.06]">
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
