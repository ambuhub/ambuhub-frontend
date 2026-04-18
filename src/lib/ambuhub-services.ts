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

export const AMBUHUB_SERVICES: AmbuhubServiceMeta[] = [
  {
    slug: "medical-transport",
    title: "Medical transport",
    description:
      "Event standby and planned transports—ground or air—with vetted providers.",
  },
  {
    slug: "personnel",
    title: "Ambulance personnel",
    description:
      "Find medics, drivers, and support staff for shifts, tours, or short-term coverage.",
  },
  {
    slug: "ambulance-servicing",
    title: "Ambulance servicing",
    description:
      "Ambulance sales and maintenance—keep your fleet road-ready with trusted providers.",
  },
  {
    slug: "ambulance-equipment",
    title: "Ambulance equipment",
    description:
      "Buy and sell stretchers, monitors, vehicle kit, and other ambulance-related gear.",
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
