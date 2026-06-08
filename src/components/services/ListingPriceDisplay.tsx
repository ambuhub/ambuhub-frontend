import type { ReactNode } from "react";
import { formatMoney } from "@/lib/currency";
import { getListingCurrency, getListingPrice } from "@/lib/marketplace-listing";
import type { MarketplaceServiceRow } from "@/lib/service-category-page-data";

export function formatListingMoney(
  service: MarketplaceServiceRow,
  amount?: number | null,
): string {
  const value = amount ?? getListingPrice(service);
  if (value == null) {
    return "—";
  }
  return formatMoney(value, getListingCurrency(service));
}

type ListingPriceLinesProps = {
  service: MarketplaceServiceRow;
  className?: string;
  suffix?: ReactNode;
};

export function ListingPriceLines({
  service,
  className,
  suffix,
}: ListingPriceLinesProps) {
  const price = getListingPrice(service);
  if (price == null) {
    return null;
  }

  return (
    <div className={className}>
      <p>
        {formatMoney(price, getListingCurrency(service))}
        {suffix}
      </p>
    </div>
  );
}
