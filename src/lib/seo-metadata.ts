import type { Metadata } from "next";

export function siteMetadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return new URL(explicit);
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return new URL(`https://${vercel}`);
  }
  return new URL("http://localhost:3000");
}

export function publicPageMetadata(
  title: string,
  description: string,
): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: `${title} | Ambuhub`,
      description,
      siteName: "Ambuhub",
      type: "website",
    },
  };
}

export function privatePageMetadata(
  title: string,
  description: string,
): Metadata {
  return {
    title,
    description,
    robots: { index: false, follow: false },
  };
}
