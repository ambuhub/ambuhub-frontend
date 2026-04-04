import Link from "next/link";
import {
  Ambulance,
  CarFront,
  Package,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AMBUHUB_SERVICES } from "@/lib/ambuhub-services";

const icons: LucideIcon[] = [Ambulance, CarFront, Users, Package];

const accentBorder = [
  "border-ambuhub-brand/30 hover:border-ambuhub-brand/60",
  "border-ambuhub-900/20 hover:border-ambuhub-900/40",
  "border-ambuhub-600/25 hover:border-ambuhub-600/50",
  "border-orange-700/25 hover:border-orange-700/45",
] as const;

const iconTone = [
  "text-ambuhub-brand",
  "text-ambuhub-900",
  "text-ambuhub-600",
  "text-orange-700",
] as const;

export function ServicesGridSection() {
  return (
    <section
      id="services"
      className="border-t border-ambuhub-100 bg-gradient-to-b from-white to-ambuhub-50/50 py-16 sm:py-20 lg:py-24"
      aria-labelledby="services-grid-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2
          id="services-grid-heading"
          className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          Our services
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-foreground/70">
          Standby, scheduled transport, personnel, and equipment—explore each path
          on one platform.
        </p>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:gap-6">
          {AMBUHUB_SERVICES.map((service, i) => {
            const Icon = icons[i];
            return (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className={`group flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm transition-colors hover:bg-ambuhub-surface/60 sm:p-7 ${accentBorder[i]}`}
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-ambuhub-surface ${iconTone[i]}`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="mt-4 text-lg font-semibold text-foreground group-hover:text-ambuhub-brand">
                    {service.title}
                  </span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-foreground/70">
                    {service.description}
                  </span>
                  <span className="mt-4 text-sm font-medium text-ambuhub-brand">
                    Learn more
                    <span
                      className="ml-1 inline-block transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    >
                      &rarr;
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
