"use client";

import { motion } from "framer-motion";
import { BadgeCheck, CalendarClock, Package, Users } from "lucide-react";

const features = [
  {
    title: "Vetted provider profiles",
    description:
      "Compare coverage areas, credentials, and reviews before you book standby or transport.",
    icon: BadgeCheck,
  },
  {
    title: "Structured bookings",
    description:
      "Dates, venues, and scope stay in one thread—so organizers and providers stay aligned.",
    icon: CalendarClock,
  },
  {
    title: "Equipment marketplace",
    description:
      "List or source stretchers, monitors, and vehicle kit alongside your service bookings.",
    icon: Package,
  },
  {
    title: "Personnel on demand",
    description:
      "Post shifts or browse medics and drivers for tours, standby, and short-term coverage.",
    icon: Users,
  },
] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, x: -32 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="border-t border-ambuhub-100 bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for events, venues, and fleets
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-foreground/70">
            Ambuhub is for promoters, operators, and buyers who plan ahead—clear
            listings, shared expectations, and less back-and-forth before show day.
          </p>
        </motion.div>

        <motion.ul
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8"
        >
          {features.map((f) => (
            <motion.li
              key={f.title}
              variants={item}
              className="group rounded-2xl border border-ambuhub-100 bg-ambuhub-surface/60 p-6 transition-shadow hover:shadow-md lg:p-8"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ambuhub-brand text-white shadow-sm">
                <f.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                {f.description}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
