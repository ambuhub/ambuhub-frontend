import Image from "next/image";
import Link from "next/link";
import { AMBUHUB_SERVICES } from "@/lib/ambuhub-services";

const serviceImages = [
  "/landing-page/landing-3.png",
  "/landing-page/landing-4.png",
  "/landing-page/landing-5.png",
] as const;

const accentBorder = [
  "border-ambuhub-brand/30 hover:border-ambuhub-brand/60",
  "border-ambuhub-600/25 hover:border-ambuhub-600/50",
  "border-orange-700/25 hover:border-orange-700/45",
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
          Medical transport, personnel, and equipment—explore each path on one
          platform.
        </p>
        <ul className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {AMBUHUB_SERVICES.map((service, i) => (
            <li key={service.slug} className="min-w-0">
              <Link
                href={`/services/${service.slug}`}
                className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors hover:bg-ambuhub-surface/60 ${accentBorder[i]}`}
              >
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-ambuhub-100">
                  <Image
                    src={serviceImages[i]}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <span className="text-lg font-semibold text-foreground group-hover:text-ambuhub-brand">
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
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
