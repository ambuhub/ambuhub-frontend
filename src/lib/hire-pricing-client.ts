import { LISTING_PRICING_PERIOD } from "@/lib/pricing-period";

function inclusiveUtcCalendarDays(start: Date, end: Date): number {
  const s = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const e = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  return Math.floor((e - s) / 86400000) + 1;
}

/** Parse hire window as UTC calendar dates (YYYY-MM-DD preferred). */
export function parseHireInstantRangeClient(
  hireStartRaw: string,
  hireEndRaw: string,
): { start: Date; end: Date } {
  const a = (hireStartRaw ?? "").trim();
  const b = (hireEndRaw ?? "").trim();
  if (!a || !b) {
    throw new Error("hireStart and hireEnd are required");
  }

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/;
  const parseDay = (raw: string, label: string): Date => {
    const m = raw.match(dateOnly);
    if (!m) {
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) {
        throw new Error(`${label} must be YYYY-MM-DD or a valid date`);
      }
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    }
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10) - 1;
    const day = parseInt(m[3], 10);
    return new Date(Date.UTC(y, mo, day));
  };

  return {
    start: parseDay(a, "hireStart"),
    end: parseDay(b, "hireEnd"),
  };
}

export function computeHireBillableUnitsClient(start: Date, end: Date): number {
  if (end.getTime() <= start.getTime()) {
    throw new Error("Hire end must be after hire start");
  }
  return Math.max(1, inclusiveUtcCalendarDays(start, end));
}

export function previewHireLineTotal(
  hireStartRaw: string,
  hireEndRaw: string,
  unitPrice: number,
  quantity: number,
): { billableUnits: number; lineTotal: number } | null {
  try {
    const { start, end } = parseHireInstantRangeClient(hireStartRaw, hireEndRaw);
    const billableUnits = computeHireBillableUnitsClient(start, end);
    const lineTotal = Math.round(unitPrice * quantity * billableUnits);
    return { billableUnits, lineTotal };
  } catch {
    return null;
  }
}

/** @deprecated Use daily-only helpers; kept for call sites passing period. */
export function previewHireLineTotalLegacy(
  _pricingPeriod: typeof LISTING_PRICING_PERIOD,
  hireStartRaw: string,
  hireEndRaw: string,
  unitPrice: number,
  quantity: number,
): { billableUnits: number; lineTotal: number } | null {
  return previewHireLineTotal(hireStartRaw, hireEndRaw, unitPrice, quantity);
}
