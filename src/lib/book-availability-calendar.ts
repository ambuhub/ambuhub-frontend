import {
  getLagosDateParts,
  lagosWallClockToDate,
} from "@/lib/hire-return-window";
import {
  lagosDateString,
  listNext30LagosDates,
  type HourlyBookingDayDto,
  type HourlyDayKind,
} from "@/lib/hourly-booking-schedule";

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const LEGEND_SWATCH_BASE = "h-4 w-4 shrink-0 rounded border";

export const LEGEND_SWATCH: Record<"default" | "custom" | "unavailable", string> = {
  default: "border-cyan-200 bg-cyan-50",
  custom: "border-violet-300 bg-violet-50",
  unavailable: "border-slate-200 bg-slate-100",
};

export function kindLabel(kind: HourlyDayKind): string {
  if (kind === "custom") return "Custom hours";
  if (kind === "closed") return "Closed";
  if (kind === "unavailable") return "Unavailable";
  return "Default hours";
}

export function kindClass(kind: HourlyDayKind, hasFree: boolean): string {
  if (kind === "closed" || kind === "unavailable" || !hasFree) {
    return `${LEGEND_SWATCH.unavailable} text-slate-400 cursor-not-allowed`;
  }
  if (kind === "custom") {
    return `${LEGEND_SWATCH.custom} text-violet-900 hover:border-violet-400`;
  }
  return `${LEGEND_SWATCH.default} text-slate-800 hover:border-cyan-400 hover:bg-cyan-100`;
}

/** Filter API days to the 30-day WAT horizon used by provider overrides. */
export function normalizeBookDays(
  days: HourlyBookingDayDto[] | undefined | null,
  horizon: string[] = listNext30LagosDates(),
): HourlyBookingDayDto[] {
  if (!days?.length) {
    return [];
  }
  const horizonSet = new Set(horizon);
  const byDate = new Map(days.map((d) => [d.date, d]));
  return horizon
    .map((date) => byDate.get(date))
    .filter((d): d is HourlyBookingDayDto => d != null);
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  if (!start || !end) {
    return false;
  }
  const lo = start <= end ? start : end;
  const hi = start <= end ? end : start;
  return date >= lo && date <= hi;
}

export function formatCalendarMonthLabel(dateStr: string): string {
  const [y, m] = dateStr.split("-").map((x) => parseInt(x, 10));
  const probe = new Date(Date.UTC(y, m - 1, 1, 12, 0));
  return probe.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function lagosWeekdayIndex(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map((x) => parseInt(x, 10));
  const probe = lagosWallClockToDate(y, m, d, "12:00");
  return getLagosDateParts(probe).dayOfWeek;
}

export type BookCalendarMonthGroup = {
  monthKey: string;
  label: string;
  leadPad: number;
  days: HourlyBookingDayDto[];
};

export function groupBookDaysByMonth(
  days: HourlyBookingDayDto[],
): BookCalendarMonthGroup[] {
  const groups: BookCalendarMonthGroup[] = [];
  let current: BookCalendarMonthGroup | null = null;

  for (const day of days) {
    const monthKey = day.date.slice(0, 7);
    if (!current || current.monthKey !== monthKey) {
      current = {
        monthKey,
        label: formatCalendarMonthLabel(day.date),
        leadPad: lagosWeekdayIndex(day.date),
        days: [day],
      };
      groups.push(current);
    } else {
      current.days.push(day);
    }
  }

  return groups;
}

/** True when both dates are valid YYYY-MM-DD and start is on or before end. */
export function isOrderedBookDateRange(startRaw: string, endRaw: string): boolean {
  const a = startRaw.trim();
  const b = endRaw.trim();
  return DATE_ONLY_RE.test(a) && DATE_ONLY_RE.test(b) && a <= b;
}

export type BookRangeHighlightAnchors = {
  ordered: boolean;
  billableDates: string[];
  highlightStart: string | null;
  highlightEnd: string | null;
};

/** Visual anchors for calendar range highlighting (billable days only). */
export function resolveBookRangeHighlightAnchors(
  bookStart: string,
  bookEnd: string,
  days: HourlyBookingDayDto[],
): BookRangeHighlightAnchors {
  const ordered = isOrderedBookDateRange(bookStart, bookEnd);
  if (!ordered) {
    return {
      ordered: false,
      billableDates: [],
      highlightStart: null,
      highlightEnd: null,
    };
  }
  const billableDates = listBillableDatesInRange(bookStart, bookEnd, days);
  return {
    ordered: true,
    billableDates,
    highlightStart: billableDates[0] ?? null,
    highlightEnd: billableDates.at(-1) ?? null,
  };
}

/** Inclusive Lagos YYYY-MM-DD strings from start through end (empty when inverted). */
export function enumerateBookDateRange(startRaw: string, endRaw: string): string[] {
  const a = startRaw.trim();
  const b = endRaw.trim();
  if (!DATE_ONLY_RE.test(a) || !DATE_ONLY_RE.test(b)) {
    return [];
  }
  if (a > b) {
    return [];
  }
  const lo = a;
  const hi = b;
  const dates: string[] = [];
  let cur = lo;
  let guard = 0;
  while (cur <= hi && guard < 120) {
    guard++;
    dates.push(cur);
    const [y, m, d] = cur.split("-").map((x) => parseInt(x, 10));
    const next = new Date(lagosWallClockToDate(y, m, d, "12:00").getTime() + 86400000);
    cur = lagosDateString(next);
  }
  return dates;
}

/** Count calendar days in range that have at least one free slot. */
export function countBillableBookDaysInRange(
  bookStart: string,
  bookEnd: string,
  days: HourlyBookingDayDto[],
): number {
  if (!isOrderedBookDateRange(bookStart, bookEnd)) {
    return 0;
  }
  const rangeDates = enumerateBookDateRange(bookStart, bookEnd);
  if (rangeDates.length === 0) {
    return 0;
  }
  const byDate = new Map(days.map((d) => [d.date, d]));
  let count = 0;
  for (const date of rangeDates) {
    const day = byDate.get(date);
    if (day && day.freeSlots.length > 0) {
      count++;
    }
  }
  return count;
}

export function listBillableDatesInRange(
  bookStart: string,
  bookEnd: string,
  days: HourlyBookingDayDto[],
): string[] {
  if (!isOrderedBookDateRange(bookStart, bookEnd)) {
    return [];
  }
  const rangeDates = enumerateBookDateRange(bookStart, bookEnd);
  const byDate = new Map(days.map((d) => [d.date, d]));
  return rangeDates.filter((date) => {
    const day = byDate.get(date);
    return !!day && day.freeSlots.length > 0;
  });
}

/** True when at least one day in the range is billable (unavailable days are skipped). */
export function hasBillableDaysInBookRange(
  bookStart: string,
  bookEnd: string,
  days: HourlyBookingDayDto[],
): boolean {
  return countBillableBookDaysInRange(bookStart, bookEnd, days) >= 1;
}

/** @deprecated Use hasBillableDaysInBookRange — kept for transitional imports. */
export function isDailyBookDateRangeAvailable(
  bookStart: string,
  bookEnd: string,
  days: HourlyBookingDayDto[],
): boolean {
  return hasBillableDaysInBookRange(bookStart, bookEnd, days);
}
