import type { BookingWindow } from "@/lib/booking-window";
import { countBillableBookDaysInRange } from "@/lib/book-availability-calendar";
import type { HourlyBookingDayDto } from "@/lib/hourly-booking-schedule";
import {
  formatInstantAsDateInputLagos,
  lagosWallClockToDate,
} from "@/lib/hire-return-window";
import { computeHireBillableUnitsClient } from "@/lib/hire-pricing-client";
import { LISTING_PRICING_PERIOD } from "@/lib/pricing-period";

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export type BookFormRange = { start: Date; end: Date };
export type PickedFreeSlot = { isoStart: string; isoEnd: string };

/** Parse YYYY-MM-DD into Lagos wall-clock instants using the provider booking window. */
export function parseCalendarBookFormToRange(
  startRaw: string,
  endRaw: string,
  window: BookingWindow,
): BookFormRange | null {
  const sm = startRaw.trim().match(DATE_ONLY_RE);
  const em = endRaw.trim().match(DATE_ONLY_RE);
  if (!sm || !em) {
    return null;
  }

  const start = lagosWallClockToDate(
    parseInt(sm[1], 10),
    parseInt(sm[2], 10),
    parseInt(sm[3], 10),
    window.timeStart,
  );
  const end = lagosWallClockToDate(
    parseInt(em[1], 10),
    parseInt(em[2], 10),
    parseInt(em[3], 10),
    window.timeEnd,
  );

  if (end.getTime() <= start.getTime()) {
    return null;
  }

  return { start, end };
}

/** Parse daily book checkout form fields using the provider booking window. */
export function parseBookFormToRange(
  startRaw: string,
  endRaw: string,
  bookingWindow?: BookingWindow | null,
): BookFormRange | null {
  if (!bookingWindow) {
    return null;
  }
  const a = startRaw.trim();
  const b = endRaw.trim();
  if (!a || !b) {
    return null;
  }
  if (DATE_ONLY_RE.test(a) && DATE_ONLY_RE.test(b)) {
    return parseCalendarBookFormToRange(a, b, bookingWindow);
  }
  return null;
}

export function isBookingRangeWithinFreeSlots(
  range: BookFormRange,
  freeRanges: { start: string; end: string }[],
): boolean {
  const startMs = range.start.getTime();
  const endMs = range.end.getTime();
  return freeRanges.some((r) => {
    const fs = new Date(r.start).getTime();
    const fe = new Date(r.end).getTime();
    return startMs >= fs && endMs <= fe;
  });
}

export function isBookRangeWithinFreeSlots(
  startRaw: string,
  endRaw: string,
  freeRanges: { start: string; end: string }[],
  bookingWindow?: BookingWindow | null,
): boolean | null {
  if (!freeRanges.length || !startRaw.trim() || !endRaw.trim()) {
    return null;
  }
  const range = parseBookFormToRange(startRaw, endRaw, bookingWindow);
  if (!range) {
    return false;
  }
  return isBookingRangeWithinFreeSlots(range, freeRanges);
}

export function previewBookLineTotal(
  startRaw: string,
  endRaw: string,
  unitPrice: number,
  bookingWindow?: BookingWindow | null,
  days?: HourlyBookingDayDto[] | null,
): { billableUnits: number; lineTotal: number } | null {
  if (days?.length) {
    const billableUnits = countBillableBookDaysInRange(startRaw, endRaw, days);
    if (billableUnits < 1) {
      return null;
    }
    const lineTotal = Math.round(unitPrice * billableUnits);
    return { billableUnits, lineTotal };
  }
  const range = parseBookFormToRange(startRaw, endRaw, bookingWindow);
  if (!range) {
    return null;
  }
  try {
    const billableUnits = computeHireBillableUnitsClient(range.start, range.end);
    const lineTotal = Math.round(unitPrice * billableUnits);
    return { billableUnits, lineTotal };
  } catch {
    return null;
  }
}

/** Canonical booking instants for a clicked free-range slot (daily billing). */
export function freeRangeToBookingRange(
  isoStart: string,
  isoEnd: string,
): BookFormRange | null {
  const slotStart = new Date(isoStart);
  const slotEnd = new Date(isoEnd);
  if (Number.isNaN(slotStart.getTime()) || Number.isNaN(slotEnd.getTime())) {
    return null;
  }
  if (slotEnd.getTime() <= slotStart.getTime()) {
    return null;
  }
  return { start: slotStart, end: slotEnd };
}

/** Map a free-range instant pair to form field values after the user clicks a slot. */
export function freeRangeToFormValues(
  isoStart: string,
  isoEnd: string,
): { bookStart: string; bookEnd: string } | null {
  const range = freeRangeToBookingRange(isoStart, isoEnd);
  if (!range) {
    return null;
  }
  return {
    bookStart: formatInstantAsDateInputLagos(range.start),
    bookEnd: formatInstantAsDateInputLagos(range.end),
  };
}

export function formValuesMatchPickedSlot(
  startRaw: string,
  endRaw: string,
  picked: PickedFreeSlot,
): boolean {
  const expected = freeRangeToFormValues(picked.isoStart, picked.isoEnd);
  if (!expected) {
    return false;
  }
  return (
    expected.bookStart === startRaw.trim() && expected.bookEnd === endRaw.trim()
  );
}

/** Payload strings for POST book-checkout (YYYY-MM-DD daily range). */
export function bookFormToCheckoutPayload(
  startRaw: string,
  endRaw: string,
  bookingWindow?: BookingWindow | null,
): { bookStart: string; bookEnd: string } | null {
  const range = parseBookFormToRange(startRaw, endRaw, bookingWindow);
  if (!range) {
    return null;
  }
  return {
    bookStart: startRaw.trim(),
    bookEnd: endRaw.trim(),
  };
}

const LAGOS_TZ = "Africa/Lagos";

export function formatBookRangeLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      timeZone: LAGOS_TZ,
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

/** @deprecated Daily-only billing; kept for transitional call sites. */
export const BOOK_PRICING_PERIOD = LISTING_PRICING_PERIOD;
