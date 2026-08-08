export type AmbuhubServiceSlug =
  | "medical-transport"
  | "personnel"
  | "ambulance-servicing"
  | "ambulance-equipment";

export type AmbuhubServiceMeta = {
  slug: AmbuhubServiceSlug;
  title: string;
  description: string;
};

/** Capitalize the first letter of each word; keep small words lowercase mid-title. */
export function toTitleCase(input: string | null | undefined): string {
  const str = (input ?? "").trim();
  if (!str) return "";
  const smallWords = new Set([
    "a",
    "an",
    "and",
    "as",
    "at",
    "but",
    "by",
    "for",
    "in",
    "nor",
    "of",
    "on",
    "or",
    "the",
    "to",
    "vs",
    "via",
  ]);
  const parts = str.toLowerCase().split(/(\s+|\/|-|_)/);
  let wordIndex = 0;
  return parts
    .map((part) => {
      if (!part || /^[\s/\-_]+$/.test(part)) {
        return part;
      }
      const isFirst = wordIndex === 0;
      wordIndex += 1;
      if (!isFirst && smallWords.has(part)) {
        return part;
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");
}

export const AMBUHUB_SERVICES: AmbuhubServiceMeta[] = [
  {
    slug: "medical-transport",
    title: "Medical Transport",
    description:
      "Find air/ground ambulance providers for all your medical transport needs and events",
  },
  {
    slug: "personnel",
    title: "Ambulance Personnel",
    description:
      "Find medics, drivers and support staff for your event and medical transport",
  },
  {
    slug: "ambulance-servicing",
    title: "Ambulance Sales and Servicing",
    description:
      "Find Ambulance manufacturers, dealers, and service companies.",
  },
  {
    slug: "ambulance-equipment",
    title: "Ambulance Equipment",
    description:
      "Buy and sell stretchers, monitors, AEDs, defibrillators, ambulance consumables and other ambulance equipment.",
  },
];

export function getServiceBySlug(
  slug: string,
): AmbuhubServiceMeta | undefined {
  return AMBUHUB_SERVICES.find((s) => s.slug === slug);
}

export const AMBUHUB_SERVICE_SLUGS = AMBUHUB_SERVICES.map((s) => s.slug);

export function isAmbuhubServiceSlug(s: string): s is AmbuhubServiceSlug {
  return (AMBUHUB_SERVICE_SLUGS as readonly string[]).includes(s);
}
