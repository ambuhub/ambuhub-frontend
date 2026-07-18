export type MarketplaceBrowseCountry = "NG" | "GH";

export const BROWSE_COUNTRY_COOKIE = "ambuhub-browse-country";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

export function parseBrowseCountry(
  value: string | undefined | null,
): MarketplaceBrowseCountry | null {
  const code = value?.trim().toUpperCase();
  if (code === "NG" || code === "GH") {
    return code;
  }
  return null;
}

/** Client-only: read the browse-country cookie. */
export function readBrowseCountryCookie(): MarketplaceBrowseCountry | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${BROWSE_COUNTRY_COOKIE}=`));
  if (!match) {
    return null;
  }
  return parseBrowseCountry(decodeURIComponent(match.split("=").slice(1).join("=")));
}

/** Client-only: persist or clear the browse-country cookie. */
export function writeBrowseCountryCookie(
  code: MarketplaceBrowseCountry | null,
): void {
  if (typeof document === "undefined") {
    return;
  }
  if (code === null) {
    document.cookie = `${BROWSE_COUNTRY_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }
  document.cookie = `${BROWSE_COUNTRY_COOKIE}=${encodeURIComponent(code)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}
