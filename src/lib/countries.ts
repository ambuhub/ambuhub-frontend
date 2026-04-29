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
