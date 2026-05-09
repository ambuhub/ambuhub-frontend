import type { PricingPeriod } from "@/lib/pricing-period";

const HOUR_MS = 3600000;

function inclusiveUtcCalendarDays(start: Date, end: Date): number {
  const s = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const e = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  return Math.floor((e - s) / 86400000) + 1;
}

/** Parse hire window for preview (same rules as backend). */
export function parseHireInstantRangeClient(
  pricingPeriod: PricingPeriod,
  hireStartRaw: string,
  hireEndRaw: string,
): { start: Date; end: Date } {
  const a = (hireStartRaw ?? "").trim();
  const b = (hireEndRaw ?? "").trim();
  if (!a || !b) {
    throw new Error("hireStart and hireEnd are required");
  }

  if (pricingPeriod === "hourly") {
    const start = new Date(a);
    const end = new Date(b);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error("hireStart and hireEnd must be valid date-times");
    }
    return { start, end };
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

export function computeHireBillableUnitsClient(
  pricingPeriod: PricingPeriod,
  start: Date,
  end: Date,
): number {
  if (end.getTime() <= start.getTime()) {
    throw new Error("Hire end must be after hire start");
  }

  if (pricingPeriod === "hourly") {
    const ms = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(ms / HOUR_MS));
  }

  const inclusiveDays = inclusiveUtcCalendarDays(start, end);

  if (pricingPeriod === "daily") {
    return Math.max(1, inclusiveDays);
  }

  if (pricingPeriod === "weekly") {
    return Math.max(1, Math.ceil(inclusiveDays / 7));
  }

  if (pricingPeriod === "monthly") {
    const sy = start.getUTCFullYear();
    const sm = start.getUTCMonth();
    const sd = start.getUTCDate();
    const ey = end.getUTCFullYear();
    const em = end.getUTCMonth();
    const ed = end.getUTCDate();
    let months = (ey - sy) * 12 + (em - sm);
    if (ed < sd) {
      months -= 1;
    }
    return Math.max(1, months + 1);
  }

  if (pricingPeriod === "yearly") {
    const sy = start.getUTCFullYear();
    const ey = end.getUTCFullYear();
    let years = ey - sy;
    if (
      end.getUTCMonth() < start.getUTCMonth() ||
      (end.getUTCMonth() === start.getUTCMonth() && end.getUTCDate() < start.getUTCDate())
    ) {
      years -= 1;
    }
    return Math.max(1, years + 1);
  }

  throw new Error(`Unsupported pricing period: ${String(pricingPeriod)}`);
}

export function previewHireLineTotalNgn(
  pricingPeriod: PricingPeriod,
  hireStartRaw: string,
  hireEndRaw: string,
  unitPrice: number,
  quantity: number,
): { billableUnits: number; lineTotalNgn: number } | null {
  try {
    const { start, end } = parseHireInstantRangeClient(
      pricingPeriod,
      hireStartRaw,
      hireEndRaw,
    );
    const billableUnits = computeHireBillableUnitsClient(pricingPeriod, start, end);
    const lineTotalNgn = Math.round(unitPrice * quantity * billableUnits);
    return { billableUnits, lineTotalNgn };
  } catch {
    return null;
  }
}
