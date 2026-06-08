import type { MarketplaceServiceRow } from "@/lib/service-category-page-data";
import { parseSupportedCurrency, type SupportedCurrency } from "@/lib/currency";

export function normalizeListingStock(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
      return null;
    }
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && Number.isInteger(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return null;
}

export function normalizeListingPrice(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0) {
      return null;
    }
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return null;
}

export function getListingStock(svc: Pick<MarketplaceServiceRow, "stock">): number | null {
  return normalizeListingStock(svc.stock);
}

export function getListingPrice(svc: Pick<MarketplaceServiceRow, "price">): number | null {
  return normalizeListingPrice(svc.price);
}

export function getListingCurrency(
  svc: Pick<MarketplaceServiceRow, "currency" | "countryCode">,
): SupportedCurrency {
  if (svc.currency) {
    return parseSupportedCurrency(svc.currency);
  }
  const country = svc.countryCode?.trim().toUpperCase() ?? "";
  return country === "GH" ? "GHS" : "NGN";
}

export function isSalePurchasable(svc: MarketplaceServiceRow): boolean {
  const stock = getListingStock(svc);
  const price = getListingPrice(svc);
  return (
    svc.listingType === "sale" &&
    svc.isAvailable !== false &&
    price !== null &&
    stock !== null &&
    stock >= 1
  );
}

export function saleUnavailableReason(svc: MarketplaceServiceRow): string | null {
  if (svc.listingType !== "sale") {
    return null;
  }
  if (svc.isAvailable === false) {
    return "This listing is not currently available.";
  }
  const price = getListingPrice(svc);
  if (price === null) {
    return "Price not set — provider must update this listing.";
  }
  const stock = getListingStock(svc);
  if (stock === null) {
    return "Stock not set — provider must update this listing.";
  }
  if (stock < 1) {
    return "Out of stock.";
  }
  return null;
}

export function formatStockLabel(
  listingType: "sale" | "hire" | "book" | null,
  stock: number | null | undefined,
): string {
  const normalized = normalizeListingStock(stock);
  if (
    (listingType === "sale" || listingType === "hire") &&
    normalized !== null
  ) {
    return `Stock: ${normalized}`;
  }
  return "Stock: N/A";
}
