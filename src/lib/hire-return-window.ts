import type { PricingPeriod } from "@/lib/pricing-period";

const LAGOS_TZ = "Africa/Lagos";
const HH_MM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type HireReturnWindow = {
  daysOfWeek: DayOfWeek[];
  timeStart: string;
  timeEnd: string;
};

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const WEEKDAY_INDICES: DayOfWeek[] = [1, 2, 3, 4, 5];

export const EMPTY_HIRE_RETURN_WINDOW: HireReturnWindow = {
  daysOfWeek: [],
  timeStart: "09:00",
  timeEnd: "16:00",
};

function parseHmToMinutes(hm: string): number {
  const m = hm.match(HH_MM);
  if (!m) return NaN;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

export function formatHm12(hm: string): string {
  const mins = parseHmToMinutes(hm);
  if (Number.isNaN(mins)) return hm;
  const h24 = Math.floor(mins / 60);
  const min = mins % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(min).padStart(2, "0")} ${period}`;
}

export function getLagosDateParts(d: Date): {
  dayOfWeek: DayOfWeek;
  minutesSinceMidnight: number;
  year: number;
  month: number;
  day: number;
} {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: LAGOS_TZ,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const weekday = get("weekday");
  const dayIndex = DAY_LABELS.indexOf(weekday as (typeof DAY_LABELS)[number]);
  if (dayIndex < 0) {
    throw new Error("Could not resolve weekday in Africa/Lagos");
  }

  const hour = parseInt(get("hour"), 10);
  const minute = parseInt(get("minute"), 10);

  return {
    dayOfWeek: dayIndex as DayOfWeek,
    minutesSinceMidnight: hour * 60 + minute,
    year: parseInt(get("year"), 10),
    month: parseInt(get("month"), 10),
    day: parseInt(get("day"), 10),
  };
}

function formatDaysSummary(days: DayOfWeek[]): string {
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.length === 5 && sorted.join(",") === "1,2,3,4,5") {
    return "Mon–Fri";
  }
  if (sorted.length === 7) {
    return "Every day";
  }
  return sorted.map((d) => DAY_LABELS[d]).join(", ");
}

export function formatHireReturnWindowSummary(window: HireReturnWindow): string {
  if (window.daysOfWeek.length === 0) {
    return "No return days selected";
  }
  const days = formatDaysSummary(window.daysOfWeek);
  return `${days}, ${formatHm12(window.timeStart)} – ${formatHm12(window.timeEnd)} (WAT)`;
}

export function validateHireReturnWindowClient(window: HireReturnWindow): string | null {
  if (window.daysOfWeek.length === 0) {
    return "Select at least one return day.";
  }
  if (!HH_MM.test(window.timeStart) || !HH_MM.test(window.timeEnd)) {
    return "Enter valid return hours.";
  }
  if (parseHmToMinutes(window.timeStart) >= parseHmToMinutes(window.timeEnd)) {
    return "Return end time must be after start time.";
  }
  return null;
}

export function parseHireEndForValidation(
  hireEndRaw: string,
  pricingPeriod: PricingPeriod,
): Date | null {
  const b = hireEndRaw.trim();
  if (!b) return null;
  if (pricingPeriod === "hourly") {
    const d = new Date(b);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/;
  const m = b.match(dateOnly);
  if (m) {
    return new Date(Date.UTC(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10)));
  }
  const d = new Date(b);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function assertHireEndAllowedClient(
  hireEnd: Date,
  window: HireReturnWindow,
  pricingPeriod: PricingPeriod,
): string | null {
  try {
    const parts = getLagosDateParts(hireEnd);
    if (!window.daysOfWeek.includes(parts.dayOfWeek)) {
      const allowed = formatDaysSummary(window.daysOfWeek);
      return `Return must be on an allowed day (${allowed}, WAT).`;
    }
    if (pricingPeriod === "hourly") {
      const startM = parseHmToMinutes(window.timeStart);
      const endM = parseHmToMinutes(window.timeEnd);
      if (parts.minutesSinceMidnight < startM || parts.minutesSinceMidnight > endM) {
        return `Return time must be between ${formatHm12(window.timeStart)} and ${formatHm12(window.timeEnd)} (WAT).`;
      }
    }
    return null;
  } catch {
    return "Could not validate return time.";
  }
}

export function resolveCanonicalHireEndClient(
  hireEnd: Date,
  window: HireReturnWindow,
  pricingPeriod: PricingPeriod,
): Date {
  if (pricingPeriod === "hourly") {
    return hireEnd;
  }
  const parts = getLagosDateParts(hireEnd);
  const [eh, em] = window.timeEnd.split(":").map((x) => parseInt(x, 10));
  const utcGuess = Date.UTC(parts.year, parts.month - 1, parts.day, eh, em, 0, 0);
  let candidate = new Date(utcGuess);
  const check = getLagosDateParts(candidate);
  if (
    check.year !== parts.year ||
    check.month !== parts.month ||
    check.day !== parts.day ||
    check.minutesSinceMidnight !== eh * 60 + em
  ) {
    const offsetMin = check.minutesSinceMidnight - (eh * 60 + em);
    candidate = new Date(candidate.getTime() - offsetMin * 60 * 1000);
  }
  return candidate;
}

export function formatReturnDeadlineClient(
  hireEnd: Date,
  window: HireReturnWindow,
  pricingPeriod: PricingPeriod,
): string {
  const canonical = resolveCanonicalHireEndClient(hireEnd, window, pricingPeriod);
  return new Intl.DateTimeFormat(undefined, {
    timeZone: LAGOS_TZ,
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(canonical);
}

/** Map HTML time input value (HH:mm) — passthrough for API. */
export function timeInputToHm(value: string): string {
  const t = value.trim();
  if (HH_MM.test(t)) return t;
  return t.slice(0, 5);
}

export function hmToTimeInput(hm: string): string {
  return hm.length >= 5 ? hm.slice(0, 5) : hm;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function minutesToHm(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

/** Build a Date for a wall-clock time on a calendar day in Africa/Lagos. */
export function lagosWallClockToDate(
  year: number,
  month: number,
  day: number,
  hm: string,
): Date {
  const [eh, em] = hm.split(":").map((x) => parseInt(x, 10));
  const utcGuess = Date.UTC(year, month - 1, day, eh, em, 0, 0);
  let candidate = new Date(utcGuess);
  const check = getLagosDateParts(candidate);
  if (
    check.year !== year ||
    check.month !== month ||
    check.day !== day ||
    check.minutesSinceMidnight !== eh * 60 + em
  ) {
    const offsetMin = check.minutesSinceMidnight - (eh * 60 + em);
    candidate = new Date(candidate.getTime() - offsetMin * 60 * 1000);
  }
  return candidate;
}

function toDateInputValue(d: Date): string {
  const p = getLagosDateParts(d);
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
}

function toDatetimeLocalValue(d: Date): string {
  const p = getLagosDateParts(d);
  const h = Math.floor(p.minutesSinceMidnight / 60);
  const m = p.minutesSinceMidnight % 60;
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}T${pad2(h)}:${pad2(m)}`;
}

/** Next hire start/end that satisfy the return window (WAT). */
export function suggestNextValidHirePeriod(
  window: HireReturnWindow,
  pricingPeriod: PricingPeriod,
): { hireStart: string; hireEnd: string } | null {
  if (window.daysOfWeek.length === 0) {
    return null;
  }
  const now = new Date();
  const startM = parseHmToMinutes(window.timeStart);
  const endM = parseHmToMinutes(window.timeEnd);

  for (let offset = 0; offset < 14; offset++) {
    const probe = new Date(now.getTime() + offset * 86400000);
    const parts = getLagosDateParts(probe);
    if (!window.daysOfWeek.includes(parts.dayOfWeek)) {
      continue;
    }

    if (pricingPeriod === "hourly") {
      if (offset === 0 && parts.minutesSinceMidnight > endM) {
        continue;
      }
      let endMin = startM + 60;
      if (offset === 0 && parts.minutesSinceMidnight >= startM) {
        endMin = Math.min(parts.minutesSinceMidnight + 60, endM);
      }
      const endDate = lagosWallClockToDate(
        parts.year,
        parts.month,
        parts.day,
        minutesToHm(endMin),
      );
      const startDate =
        offset === 0 && parts.minutesSinceMidnight < endM
          ? now
          : lagosWallClockToDate(parts.year, parts.month, parts.day, window.timeStart);
      if (endDate.getTime() <= startDate.getTime()) {
        continue;
      }
      return {
        hireStart: toDatetimeLocalValue(startDate),
        hireEnd: toDatetimeLocalValue(endDate),
      };
    }

    const dateStr = `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
    return { hireStart: dateStr, hireEnd: dateStr };
  }
  return null;
}

export function hasValidHireReturnWindow(
  window: HireReturnWindow | null | undefined,
): window is HireReturnWindow {
  return !!window && window.daysOfWeek.length > 0;
}
