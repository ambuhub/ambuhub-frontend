import Image from "next/image";
import Link from "next/link";
import { getServiceBySlug } from "@/lib/ambuhub-services";
import {
  FALLBACK_THUMB,
  isCloudinaryHost,
  type LandingServiceCategory,
} from "@/lib/landing-service-categories";

const accentBorder = [
  "border-blue-400/50 shadow-md shadow-blue-500/10 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-400/20",
  "border-sky-400/50 shadow-md shadow-sky-500/10 hover:border-sky-500 hover:shadow-lg hover:shadow-sky-400/20",
  "border-cyan-400/50 shadow-md shadow-cyan-500/10 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-400/15",
  "border-indigo-400/45 shadow-md shadow-indigo-500/10 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-400/15",
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

function cardImageClass(slug: string): string {
  const focus = slug === "personnel" ? " object-[center_22%]" : "";
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

type Props = {
  category: LandingServiceCategory;
  index: number;
  className?: string;
};

export function ServiceCategoryCard({ category, index, className }: Props) {
  return (
    <Link
      href={`/services/${category.slug}`}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border-2 bg-white/95 backdrop-blur-sm transition-all hover:bg-white ${accentBorder[index % accentBorder.length]} ${className ?? ""}`}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gradient-to-br from-blue-100 via-sky-50 to-cyan-50">
        <CategoryCardImage
          slug={category.slug}
          thumbnailUrl={category.thumbnailUrl}
          alt={category.name}
        />
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <span className="text-lg font-semibold text-blue-950 group-hover:text-blue-700">
          {category.name}
        </span>
        <span className="mt-2 flex-1 text-sm leading-relaxed text-blue-900/70">
          {cardDescription(category)}
        </span>
        <span className="mt-4 text-sm font-semibold text-sky-700 group-hover:text-blue-700">
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
  );
}
