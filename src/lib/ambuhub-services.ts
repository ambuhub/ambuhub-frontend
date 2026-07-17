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
      "Find air/ground ambulance providers for all your medical transport needs and events",
  },
  {
    slug: "personnel",
    title: "Ambulance personnel",
    description:
      "Find medics, drivers and support staff for your event and medical transport",
  },
  {
    slug: "ambulance-servicing",
    title: "Ambulance sales and servicing",
    description:
      "Find Ambulance manufacturers, dealers, and service companies.",
  },
  {
    slug: "ambulance-equipment",
    title: "Ambulance equipment",
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
