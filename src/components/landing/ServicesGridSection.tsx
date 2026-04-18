import Image from "next/image";
import Link from "next/link";
import { getServiceBySlug } from "@/lib/ambuhub-services";
import {
  FALLBACK_THUMB,
  fetchLandingServiceCategories,
  isCloudinaryHost,
  orderLandingCategories,
  type LandingServiceCategory,
} from "@/lib/landing-service-categories";

const accentBorder = [
  "border-ambuhub-brand/30 hover:border-ambuhub-brand/60",
  "border-ambuhub-600/25 hover:border-ambuhub-600/50",
  "border-orange-700/25 hover:border-orange-700/45",
] as const;

function cardDescription(category: LandingServiceCategory): string {
  const note = category.note?.trim();
  if (note) {
    return note;
  }
  const staticMeta = getServiceBySlug(category.slug);
  if (staticMeta) {
    return staticMeta.description;
  }
  return "Explore providers and listings in this category.";
}

const cardImageBaseClass =
  "object-cover transition-transform duration-300 group-hover:scale-[1.03]";

/** Personnel thumb: bias toward upper area (faces) but not as tight as object-top. */
function cardImageClass(slug: string): string {
  const focus =
    slug === "personnel" ? " object-[center_22%]" : "";
  return cardImageBaseClass + focus;
}

function CategoryCardImage({
  slug,
  thumbnailUrl,
  alt,
}: {
  slug: string;
  thumbnailUrl?: string | null;
  alt: string;
}) {
  const src = thumbnailUrl?.trim();
  const imgClass = cardImageClass(slug);

  if (!src) {
    return (
      <Image
        src={FALLBACK_THUMB}
        alt={alt}
        fill
        className={imgClass}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />
    );
  }

  if (src.startsWith("/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={imgClass}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />
    );
  }

  if (src.startsWith("http") && isCloudinaryHost(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={imgClass}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />
    );
  }

  if (src.startsWith("http")) {
    return (
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full ${imgClass}`}
      />
    );
  }

  return (
    <Image
      src={FALLBACK_THUMB}
      alt={alt}
      fill
      className={imgClass}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
    />
  );
}

export async function ServicesGridSection() {
  const rows = await fetchLandingServiceCategories();
  const categories = orderLandingCategories(rows);

  return (
    <section
      id="services"
      className="border-t border-ambuhub-100 bg-gradient-to-b from-white to-ambuhub-50/50 py-16 sm:py-20 lg:py-24"
      aria-labelledby="services-grid-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="services-grid-heading"
          className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          Our services
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-foreground/70">
          Medical transport, personnel, fleet servicing, and equipment—explore
          each path on one platform.
        </p>

        {categories.length === 0 ? (
          <p className="mt-10 text-center text-sm text-foreground/60">
            Service categories could not be loaded. Check that the API is
            reachable and try again shortly.
          </p>
        ) : (
          <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {categories.map((category, i) => (
              <li key={category.id} className="min-w-0">
                <Link
                  href={`/services/${category.slug}`}
                  className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors hover:bg-ambuhub-surface/60 ${accentBorder[i % accentBorder.length]}`}
                >
                  <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-ambuhub-100">
                    <CategoryCardImage
                      slug={category.slug}
                      thumbnailUrl={category.thumbnailUrl}
                      alt={category.name}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <span className="text-lg font-semibold text-foreground group-hover:text-ambuhub-brand">
                      {category.name}
                    </span>
                    <span className="mt-2 flex-1 text-sm leading-relaxed text-foreground/70">
                      {cardDescription(category)}
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
        )}
      </div>
    </section>
  );
}
