import Image from "next/image";
import Link from "next/link";
import { FALLBACK_THUMB, isCloudinaryHost } from "@/lib/landing-service-categories";
import {
  getCategoryPageTitleDescription,
  type DepartmentServiceSection,
  type ServiceCategoryPageDto,
} from "@/lib/service-category-page-data";

const BANNER_SIZES = "100vw";
const CARD_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";

const bannerImgBase = "h-full w-full object-cover";

const TALL_TOP_BIAS_BANNER_SLUGS = new Set([
  "personnel",
  "medical-transport",
  "ambulance-servicing",
]);

/** Taller shell + top-biased crop (same as landing Personnel card treatment). */
function categoryBannerImageClass(categorySlug: string): string {
  const position = TALL_TOP_BIAS_BANNER_SLUGS.has(categorySlug)
    ? " object-[center_22%]"
    : " object-center";
  return bannerImgBase + position;
}

function CategoryBannerImage({
  src,
  alt,
  categorySlug,
}: {
  src: string;
  alt: string;
  categorySlug: string;
}) {
  const trimmed = src.trim();
  const imgClass = categoryBannerImageClass(categorySlug);

  if (trimmed.startsWith("/")) {
    return (
      <Image
        src={trimmed}
        alt={alt}
        fill
        priority
        className={imgClass}
        sizes={BANNER_SIZES}
      />
    );
  }

  if (trimmed.startsWith("http") && isCloudinaryHost(trimmed)) {
    return (
      <Image
        src={trimmed}
        alt={alt}
        fill
        priority
        className={imgClass}
        sizes={BANNER_SIZES}
      />
    );
  }

  if (trimmed.startsWith("http")) {
    return (
      <img
        src={trimmed}
        alt={alt}
        className={`absolute inset-0 ${imgClass}`}
      />
    );
  }

  return (
    <Image
      src={FALLBACK_THUMB}
      alt={alt}
      fill
      priority
      className={imgClass}
      sizes={BANNER_SIZES}
    />
  );
}

function ServiceCardImage({
  photoUrl,
  alt,
}: {
  photoUrl?: string | null;
  alt: string;
}) {
  const src = photoUrl?.trim();

  if (!src) {
    return (
      <Image
        src={FALLBACK_THUMB}
        alt={alt}
        fill
        className="object-cover object-center"
        sizes={CARD_SIZES}
      />
    );
  }

  if (src.startsWith("/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-center"
        sizes={CARD_SIZES}
      />
    );
  }

  if (src.startsWith("http") && isCloudinaryHost(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-center"
        sizes={CARD_SIZES}
      />
    );
  }

  if (src.startsWith("http")) {
    return (
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    );
  }

  return (
    <Image
      src={FALLBACK_THUMB}
      alt={alt}
      fill
      className="object-cover object-center"
      sizes={CARD_SIZES}
    />
  );
}

type Props = {
  category: ServiceCategoryPageDto;
  sections: DepartmentServiceSection[];
};

export function CategoryServiceListing({ category, sections }: Props) {
  const { title, description } = getCategoryPageTitleDescription(category);
  const bannerSrc =
    category.bannerUrl?.trim() ||
    category.thumbnailUrl?.trim() ||
    "";

  const tallBannerShellClass =
    "relative mt-6 h-56 max-h-96 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-ambuhub-100 to-ambuhub-200/80 sm:mt-8 sm:h-72 md:mt-10 md:h-96";
  const defaultBannerShellClass =
    "relative mt-6 h-40 max-h-64 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-ambuhub-100 to-ambuhub-200/80 sm:mt-8 sm:h-52 md:mt-10 md:h-64";
  const bannerShellClass = TALL_TOP_BIAS_BANNER_SLUGS.has(category.slug)
    ? tallBannerShellClass
    : defaultBannerShellClass;

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={bannerShellClass} aria-hidden={!bannerSrc}>
          {bannerSrc ? (
            <CategoryBannerImage
              src={bannerSrc}
              alt={`${category.name} — banner`}
              categorySlug={category.slug}
            />
          ) : null}
        </div>

        <div className="mt-8 sm:mt-10">
          <p className="text-sm font-medium text-ambuhub-brand">Services</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-foreground/70 sm:mt-4 sm:text-lg">
            {description}
          </p>
        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-7xl flex-1 px-4 pb-14 sm:mt-12 sm:px-6 sm:pb-16 lg:mt-14 lg:px-8 lg:pb-20">
        {sections.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ambuhub-200 bg-ambuhub-surface/50 px-6 py-12 text-center text-foreground/60">
            No listings in this category yet. Check back soon or explore other
            services from the home page.
          </p>
        ) : (
          <div className="flex flex-col gap-10 sm:gap-12 lg:gap-14">
            {sections.map((section, sectionIndex) => (
              <section
                key={section.key}
                aria-labelledby={`dept-heading-${section.key}`}
                className="min-w-0"
              >
                {sectionIndex > 0 ? (
                  <div
                    className="mb-8 h-px w-full bg-ambuhub-200/90 sm:mb-10"
                    aria-hidden
                  />
                ) : null}
                <h2
                  id={`dept-heading-${section.key}`}
                  className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
                >
                  {section.heading}
                </h2>
                <ul className="mt-5 grid grid-cols-1 gap-5 min-w-0 sm:grid-cols-2 sm:gap-5 lg:mt-6 lg:grid-cols-4 lg:gap-6">
                  {section.services.map((svc) => (
                    <li key={svc.id} className="min-w-0">
                      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-ambuhub-100 bg-white shadow-sm">
                        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-ambuhub-100">
                          <ServiceCardImage
                            photoUrl={svc.photoUrls[0]}
                            alt={svc.title}
                          />
                        </div>
                        <div className="flex flex-1 flex-col p-5 sm:p-6">
                          <h3 className="text-base font-semibold text-foreground">
                            {svc.title}
                          </h3>
                          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-foreground/70">
                            {svc.description}
                          </p>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <Link
          href="/#services"
          className="mt-10 inline-flex text-sm font-semibold text-ambuhub-brand hover:underline sm:mt-12"
        >
          &larr; Back to services
        </Link>
      </div>
    </>
  );
}
