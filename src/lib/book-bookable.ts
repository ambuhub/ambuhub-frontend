import { hasValidBookingWindow, type BookingWindow } from "@/lib/booking-window";
import { isPricingPeriod } from "@/lib/pricing-period";
import type { MarketplaceServiceRow } from "@/lib/service-category-page-data";

export function isBookBookable(svc: MarketplaceServiceRow): boolean {
  return (
    svc.listingType === "book" &&
    typeof svc.price === "number" &&
    svc.price >= 0 &&
    svc.pricingPeriod != null &&
    isPricingPeriod(svc.pricingPeriod) &&
    svc.isAvailable !== false &&
    hasValidBookingWindow(svc.bookingWindow ?? null)
  );
}

export function bookUnavailableReason(svc: MarketplaceServiceRow): string {
  if (svc.listingType !== "book") {
    return "This listing is not a book listing.";
  }
  if (!hasValidBookingWindow(svc.bookingWindow ?? null)) {
    return "This listing has no booking schedule. Booking is unavailable until the provider updates it.";
  }
  if (typeof svc.price !== "number" || svc.price < 0) {
    return "This listing does not have a valid booking price.";
  }
  if (!svc.pricingPeriod || !isPricingPeriod(svc.pricingPeriod)) {
    return "This listing is missing a billing period.";
  }
  if (svc.isAvailable === false) {
    return "This listing is not currently available.";
  }
  return "This listing cannot be booked right now.";
}
