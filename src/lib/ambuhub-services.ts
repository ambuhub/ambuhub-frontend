export type AmbuhubServiceSlug =
  | "emergency-medical-transport"
  | "non-emergency-medical-transport"
  | "personnel"
  | "ambulance-servicing";

export type AmbuhubServiceMeta = {
  slug: AmbuhubServiceSlug;
  title: string;
  description: string;
};

export const AMBUHUB_SERVICES: AmbuhubServiceMeta[] = [
  {
    slug: "emergency-medical-transport",
    title: "Emergency Medical Transport",
    description:
      "Book on-site ambulance coverage for concerts, sports, corporate events, and other venues.",
  },
  {
    slug: "non-emergency-medical-transport",
    title: "Non Emergency Medical Transport",
    description:
      "Arrange planned, non-urgent transports with vetted providers and clear scheduling.",
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
