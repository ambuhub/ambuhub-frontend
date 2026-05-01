import worldCountries from "world-countries";

export type Country = {
  code: string;
  name: string;
  flagUrl: string;
  flagUrl2x: string;
};

export const COUNTRIES: Country[] = worldCountries
  .filter((c) => typeof c.cca2 === "string" && c.cca2.length === 2)
  .map((c) => {
    const code = c.cca2.toLowerCase();
    return {
      code,
      name: c.name.common,
      flagUrl: `https://flagcdn.com/w40/${code}.png`,
      flagUrl2x: `https://flagcdn.com/w80/${code}.png`,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

/** ISO alpha-2 (any case) -> English common name, or null if unknown */
export function getCountryNameByCode(isoAlpha2: string): string | null {
  const key = isoAlpha2?.trim().toLowerCase();
  if (!key || key.length !== 2) return null;
  const row = COUNTRIES.find((c) => c.code === key);
  return row?.name ?? null;
}
