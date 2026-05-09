import type { AmbuhubServiceSlug } from "@/lib/ambuhub-services";

/** Three highlight bullets per category for the client dashboard cards. */
export const CLIENT_CATEGORY_BULLETS: Record<
  AmbuhubServiceSlug,
  readonly [string, string, string]
> = {
  "medical-transport": [
    "Event standby and scheduled transports",
    "Ground and air options from vetted providers",
    "Clear scope and pricing before you book",
  ],
  personnel: [
    "Medics, drivers, and support staff",
    "Shifts, tours, or short-term coverage",
    "Match skills to your operating needs",
  ],
  "ambulance-servicing": [
    "Sales and servicing in one place",
    "Keep your fleet inspection-ready",
    "Trusted workshops and suppliers",
  ],
  "ambulance-equipment": [
    "Stretchers, monitors, and vehicle kit",
    "Buy or sell verified listings",
    "Compare stock and delivery options",
  ],
};
