/** Next.js `fetch` cache tag for `/api/services/marketplace` (invalidate on listing mutations). */
export const MARKETPLACE_SERVICES_CACHE_TAG = "marketplace-services";

/** Browser `CustomEvent` name: open category pages refetch marketplace without a full reload. */
export const AMBUHUB_MARKETPLACE_INVALIDATE_EVENT =
  "ambuhub-marketplace-invalidate";

/** Call after listing mutations so `/services/[category]` (and similar) update via `CategoryServiceListing`. */
export function dispatchMarketplaceInvalidate(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(AMBUHUB_MARKETPLACE_INVALIDATE_EVENT));
}
