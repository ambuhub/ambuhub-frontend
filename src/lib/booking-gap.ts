/** Gap between bookings is configured in hours; API stores minutes and exposes bookingGapHours. */

export const MAX_BOOKING_GAP_HOURS = 24;

export function gapMinutesToHours(minutes: number): number {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return 0;
  }
  return minutes / 60;
}

export function gapHoursToMinutes(hours: number): number {
  if (!Number.isFinite(hours) || hours <= 0) {
    return 0;
  }
  return Math.round(hours * 60);
}

/** Display value for hour inputs (from API hours or stored minutes). */
export function gapHoursToInputLabel(hours: number): string {
  if (hours <= 0) {
    return "0";
  }
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

export function gapMinutesToInputLabel(minutes: number): string {
  return gapHoursToInputLabel(gapMinutesToHours(minutes));
}

export function parseGapHoursInput(raw: string): number | null {
  const t = raw.trim();
  if (!t) {
    return 0;
  }
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0 || n > MAX_BOOKING_GAP_HOURS) {
    return null;
  }
  return gapHoursToMinutes(n);
}

/** Client PATCH payload: hours as entered by the provider. */
export function parseGapHoursForPatch(raw: string): number | null {
  const t = raw.trim();
  if (!t) {
    return 0;
  }
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0 || n > MAX_BOOKING_GAP_HOURS) {
    return null;
  }
  return n;
}

export function formatBookingGapHoursLabel(hours: number): string {
  if (hours <= 0) {
    return "";
  }
  const label = gapHoursToInputLabel(hours);
  return `${label}h buffer after each booking`;
}
