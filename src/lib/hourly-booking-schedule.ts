import type { BookingWindow } from "@/lib/booking-window";
import {
  EMPTY_HIRE_RETURN_WINDOW,
  formatHireReturnWindowSummary,
  getLagosDateParts,
  lagosWallClockToDate,
  type HireReturnWindow,
} from "@/lib/hire-return-window";

export const HOURLY_OVERRIDE_HORIZON_DAYS = 30;

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const HH_MM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type TimeRange = {
  timeStart: string;
  timeEnd: string;
};

export type HourlyScheduleOverride =
  | { date: string; kind: "closed" }
  | { date: string; kind: "custom"; windows: TimeRange[] };

export type HourlyBookingSchedule = {
  default: HireReturnWindow;
  overrides: HourlyScheduleOverride[];
};

export type HourlyDayKind = "default" | "custom" | "closed" | "unavailable";

export type HourlyBookingDayDto = {
  date: string;
  kind: HourlyDayKind;
  windows: TimeRange[];
  freeSlots: { start: string; end: string }[];
};

export const EMPTY_HOURLY_SCHEDULE: HourlyBookingSchedule = {
  default: EMPTY_HIRE_RETURN_WINDOW,
  overrides: [],
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function lagosDateString(d: Date = new Date()): string {
  const p = getLagosDateParts(d);
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
}

export function listNext30LagosDates(from: Date = new Date()): string[] {
  const dates: string[] = [];
  const p = getLagosDateParts(from);
  let cur = lagosDateString(from);
  for (let i = 0; i < HOURLY_OVERRIDE_HORIZON_DAYS; i++) {
    dates.push(cur);
    const [y, m, d] = cur.split("-").map((x) => parseInt(x, 10));
    const next = new Date(lagosWallClockToDate(y, m, d, "12:00").getTime() + 86400000);
    cur = lagosDateString(next);
  }
  return dates;
}

export function resolveHourlyBookingSchedule(
  hourly: HourlyBookingSchedule | null | undefined,
  bookingWindow: BookingWindow | null | undefined,
): HourlyBookingSchedule | null {
  if (hourly?.default?.daysOfWeek?.length) {
    return hourly;
  }
  if (bookingWindow?.daysOfWeek?.length) {
    return { default: bookingWindow, overrides: [] };
  }
  return null;
}

export function hasValidHourlySchedule(
  schedule: HourlyBookingSchedule | null | undefined,
): schedule is HourlyBookingSchedule {
  return !!schedule && schedule.default.daysOfWeek.length > 0;
}

export function formatHourlyScheduleSummary(schedule: HourlyBookingSchedule): string {
  return formatHireReturnWindowSummary(schedule.default);
}

export function getOverrideForDate(
  schedule: HourlyBookingSchedule,
  date: string,
): HourlyScheduleOverride | null {
  return schedule.overrides.find((o) => o.date === date) ?? null;
}

export function validateHourlyScheduleClient(
  schedule: HourlyBookingSchedule,
): string | null {
  if (schedule.default.daysOfWeek.length === 0) {
    return "Select at least one default weekday.";
  }
  if (!HH_MM.test(schedule.default.timeStart) || !HH_MM.test(schedule.default.timeEnd)) {
    return "Enter valid default hours.";
  }
  const startM =
    parseInt(schedule.default.timeStart.slice(0, 2), 10) * 60 +
    parseInt(schedule.default.timeStart.slice(3), 10);
  const endM =
    parseInt(schedule.default.timeEnd.slice(0, 2), 10) * 60 +
    parseInt(schedule.default.timeEnd.slice(3), 10);
  if (startM >= endM) {
    return "Default end time must be after start time.";
  }

  const today = lagosDateString();
  const horizon = listNext30LagosDates()[listNext30LagosDates().length - 1];
  const seen = new Set<string>();
  for (const o of schedule.overrides) {
    if (!DATE_ONLY_RE.test(o.date)) {
      return "Override dates must be YYYY-MM-DD.";
    }
    if (o.date < today || o.date > horizon) {
      return "Overrides must be within the next 30 days (WAT).";
    }
    if (seen.has(o.date)) {
      return `Duplicate override for ${o.date}.`;
    }
    seen.add(o.date);
    if (o.kind === "custom") {
      if (!o.windows.length) {
        return `Add at least one window for ${o.date}.`;
      }
      for (const w of o.windows) {
        if (!HH_MM.test(w.timeStart) || !HH_MM.test(w.timeEnd)) {
          return "Custom windows need valid HH:mm times.";
        }
      }
    }
  }
  return null;
}

export {
  gapMinutesToInputLabel as gapMinutesToHoursLabel,
  parseGapHoursInput,
} from "@/lib/booking-gap";
