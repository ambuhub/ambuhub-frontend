import { API_PROXY_PREFIX } from "@/lib/api";
import type { MarketplaceServiceRow } from "@/lib/service-category-page-data";

function proxyUrl(path: string): string {
  const base = API_PROXY_PREFIX.replace(/\/$/, "");
  const p = path.replace(/^\//, "");
  return `${base}/${p}`;
}

function parseServiceList(data: unknown): MarketplaceServiceRow[] {
  const d = data as { services?: unknown };
  return Array.isArray(d.services) ? (d.services as MarketplaceServiceRow[]) : [];
}

export async function fetchMyFavoriteServices(): Promise<MarketplaceServiceRow[]> {
  const res = await fetch(proxyUrl("services/favorites/me"), {
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new Error("Sign in to view your saved listings.");
  }
  let data: unknown = {};
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    const msg =
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Could not load favorites.";
    throw new Error(msg);
  }
  return parseServiceList(data);
}

export async function addFavoriteService(
  serviceId: string,
): Promise<MarketplaceServiceRow[]> {
  const res = await fetch(proxyUrl("services/favorites/me"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ serviceId }),
  });
  let data: unknown = {};
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (res.status === 401) {
    throw new Error(
      "You need to be logged in to save favorites. Sign in, then try again.",
    );
  }
  if (!res.ok) {
    const msg =
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Could not add to favorites.";
    throw new Error(msg);
  }
  return parseServiceList(data);
}

export async function removeFavoriteService(
  serviceId: string,
): Promise<MarketplaceServiceRow[]> {
  const res = await fetch(
    proxyUrl(`services/favorites/me/${encodeURIComponent(serviceId)}`),
    { method: "DELETE", credentials: "include" },
  );
  let data: unknown = {};
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (res.status === 401) {
    throw new Error("Sign in to manage your saved listings.");
  }
  if (!res.ok) {
    const msg =
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Could not remove from favorites.";
    throw new Error(msg);
  }
  return parseServiceList(data);
}
