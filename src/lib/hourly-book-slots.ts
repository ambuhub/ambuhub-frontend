import type { HourlyBookingDayDto, TimeRange } from "@/lib/hourly-booking-schedule";
import {
  formatInstantAsDatetimeLocalLagos,
  getLagosDateParts,
  lagosWallClockToDate,
  parseDatetimeLocalLagos,
} from "@/lib/hire-return-window";

const HOUR_MS = 3600000;
const LAGOS_TZ = "Africa/Lagos";

export type HourOption = {
  /** ISO instant at this hour start (WAT) */
  iso: string;
  label: string;
};

export type HourOptionGroup = {
  /** e.g. "3:00 AM – 6:00 AM" — empty when only one unnamed group */
  windowLabel: string;
  options: HourOption[];
};

function formatHm12(hm: string): string {
  const [h, m] = hm.split(":").map((x) => parseInt(x, 10));
  const d = new Date(Date.UTC(2000, 0, 1, h, m));
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

export function formatWindowRangeLabel(window: TimeRange): string {
  return `${formatHm12(window.timeStart)} – ${formatHm12(window.timeEnd)}`;
}

function freeSlotsWithinWindow(
  date: string,
  window: TimeRange,
  freeSlots: { start: string; end: string }[],
): { start: string; end: string }[] {
  const [y, m, d] = date.split("-").map((x) => parseInt(x, 10));
  const wStart = lagosWallClockToDate(y, m, d, window.timeStart).getTime();
  const wEnd = lagosWallClockToDate(y, m, d, window.timeEnd).getTime();
  const clipped: { start: string; end: string }[] = [];

  for (const slot of freeSlots) {
    const s = new Date(slot.start).getTime();
    const e = new Date(slot.end).getTime();
    if (Number.isNaN(s) || Number.isNaN(e)) {
      continue;
    }
    const start = Math.max(s, wStart);
    const end = Math.min(e, wEnd);
    if (start < end) {
      clipped.push({
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
      });
    }
  }
  return clipped;
}

/** One row per scheduled window so multi-window custom days are clear to clients. */
export function hourOptionGroupsForDay(day: HourlyBookingDayDto): HourOptionGroup[] {
  const { date, windows, freeSlots } = day;

  if (windows.length > 1) {
    return windows
      .map((window) => ({
        windowLabel: formatWindowRangeLabel(window),
        options: hourOptionsFromFreeSlots(freeSlotsWithinWindow(date, window, freeSlots)),
      }))
      .filter((g) => g.options.length > 0);
  }

  const options = hourOptionsFromFreeSlots(freeSlots);
  if (options.length === 0) {
    return [];
  }

  const label =
    windows.length === 1 ? formatWindowRangeLabel(windows[0]) : "";
  return [{ windowLabel: label, options }];
}

export function formatHourLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    timeZone: LAGOS_TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function pushHourOption(
  options: HourOption[],
  seen: Set<string>,
  cursor: Date,
): void {
  const iso = cursor.toISOString();
  if (seen.has(iso)) {
    return;
  }
  seen.add(iso);
  options.push({ iso, label: formatHourLabel(iso) });
}

/** True when a full hour can start at this boundary inside a free slot. */
export function isValidBookingStartHour(
  iso: string,
  freeSlots: { start: string; end: string }[],
): boolean {
  const start = new Date(iso).getTime();
  if (Number.isNaN(start)) {
    return false;
  }
  return freeSlots.some((s) => {
    const fs = new Date(s.start).getTime();
    const fe = new Date(s.end).getTime();
    return start >= fs && start + HOUR_MS <= fe;
  });
}

/**
 * Hour boundaries for start/end selection: valid booking starts plus the slot
 * closing hour (e.g. 4:00 PM when the window ends at 16:00) for end selection.
 */
export function hourOptionsFromFreeSlots(
  freeSlots: { start: string; end: string }[],
): HourOption[] {
  const options: HourOption[] = [];
  const seen = new Set<string>();

  for (const slot of freeSlots) {
    const start = new Date(slot.start);
    const end = new Date(slot.end);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      continue;
    }
    const startParts = getLagosDateParts(start);
    const pad = (n: number) => String(n).padStart(2, "0");
    let hour = Math.floor(startParts.minutesSinceMidnight / 60);
    if (
      lagosWallClockToDate(startParts.year, startParts.month, startParts.day, `${pad(hour)}:00`).getTime() <
      start.getTime()
    ) {
      hour += 1;
    }
    let cursor = lagosWallClockToDate(
      startParts.year,
      startParts.month,
      startParts.day,
      `${pad(hour)}:00`,
    );
    const endMs = end.getTime();
    while (cursor.getTime() + HOUR_MS <= endMs) {
      pushHourOption(options, seen, cursor);
      hour += 1;
      cursor = lagosWallClockToDate(
        startParts.year,
        startParts.month,
        startParts.day,
        `${pad(hour)}:00`,
      );
    }

    const endParts = getLagosDateParts(end);
    if (endParts.minutesSinceMidnight % 60 === 0) {
      const endHour = Math.floor(endParts.minutesSinceMidnight / 60);
      const closing = lagosWallClockToDate(
        endParts.year,
        endParts.month,
        endParts.day,
        `${pad(endHour)}:00`,
      );
      if (closing.getTime() <= endMs && closing.getTime() + HOUR_MS > endMs) {
        pushHourOption(options, seen, closing);
      }
    }
  }

  options.sort((a, b) => a.iso.localeCompare(b.iso));
  return options;
}

export function rangeFromHourSelection(
  startIso: string,
  endHourStartIso: string,
): { bookStart: string; bookEnd: string } | null {
  const start = new Date(startIso);
  const endHourStart = new Date(endHourStartIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(endHourStart.getTime())) {
    return null;
  }
  if (endHourStart.getTime() <= start.getTime()) {
    return null;
  }
  return {
    bookStart: start.toISOString(),
    bookEnd: endHourStart.toISOString(),
  };
}

export function isHourRangeWithinFreeSlots(
  startIso: string,
  endIso: string,
  freeSlots: { start: string; end: string }[],
): boolean {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return false;
  }
  return freeSlots.some((s) => {
    const fs = new Date(s.start).getTime();
    const fe = new Date(s.end).getTime();
    return start >= fs && end <= fe;
  });
}

export function hourSelectionToFormValues(
  startIso: string,
  endIso: string,
): { bookStart: string; bookEnd: string } {
  return {
    bookStart: formatInstantAsDatetimeLocalLagos(new Date(startIso)),
    bookEnd: formatInstantAsDatetimeLocalLagos(new Date(endIso)),
  };
}

export function parseHourlyBookPayload(
  bookStartRaw: string,
  bookEndRaw: string,
): { bookStart: string; bookEnd: string } | null {
  const start = parseDatetimeLocalLagos(bookStartRaw);
  const end = parseDatetimeLocalLagos(bookEndRaw);
  if (!start || !end || end.getTime() <= start.getTime()) {
    return null;
  }
  return {
    bookStart: start.toISOString(),
    bookEnd: end.toISOString(),
  };
}

export function dateFromIsoInLagos(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: LAGOS_TZ });
}

export function addDaysToDateString(dateStr: string, offset: number): string {
  const [y, m, d] = dateStr.split("-").map((x) => parseInt(x, 10));
  const base = lagosWallClockToDate(y, m, d, "12:00");
  const next = new Date(base.getTime() + offset * 86400000);
  return next.toLocaleDateString("en-CA", { timeZone: LAGOS_TZ });
}
