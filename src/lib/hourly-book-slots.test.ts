import { describe, expect, it } from "vitest";
import {
  hourOptionGroupsForDay,
  hourOptionsFromFreeSlots,
  isHourRangeWithinFreeSlots,
  isValidBookingStartHour,
  rangeFromHourSelection,
} from "@/lib/hourly-book-slots";
import type { HourlyBookingDayDto } from "@/lib/hourly-booking-schedule";
import { lagosWallClockToDate } from "@/lib/hire-return-window";

describe("hourOptionsFromFreeSlots", () => {
  it("lists hour starts plus closing boundary for end selection", () => {
    const start = lagosWallClockToDate(2026, 5, 26, "09:00");
    const end = lagosWallClockToDate(2026, 5, 26, "12:00");
    const options = hourOptionsFromFreeSlots([
      { start: start.toISOString(), end: end.toISOString() },
    ]);
    expect(options).toHaveLength(4);
    expect(options.map((o) => o.label)).toContain("12:00 PM");
  });

  it("includes 4pm end boundary for 9am-4pm window", () => {
    const start = lagosWallClockToDate(2026, 5, 26, "09:00");
    const end = lagosWallClockToDate(2026, 5, 26, "16:00");
    const options = hourOptionsFromFreeSlots([
      { start: start.toISOString(), end: end.toISOString() },
    ]);
    const labels = options.map((o) => o.label);
    expect(labels).toContain("4:00 PM");
    expect(labels[labels.length - 1]).toMatch(/4:00\s*PM/i);
  });
});

describe("isValidBookingStartHour", () => {
  it("rejects closing hour that is end-only", () => {
    const start = lagosWallClockToDate(2026, 5, 26, "09:00");
    const end = lagosWallClockToDate(2026, 5, 26, "16:00");
    const freeSlots = [{ start: start.toISOString(), end: end.toISOString() }];
    const fourPm = lagosWallClockToDate(2026, 5, 26, "16:00").toISOString();
    const threePm = lagosWallClockToDate(2026, 5, 26, "15:00").toISOString();
    expect(isValidBookingStartHour(fourPm, freeSlots)).toBe(false);
    expect(isValidBookingStartHour(threePm, freeSlots)).toBe(true);
  });
});

describe("hourOptionGroupsForDay", () => {
  it("returns one group per custom window", () => {
    const start1 = lagosWallClockToDate(2026, 5, 26, "03:00");
    const end1 = lagosWallClockToDate(2026, 5, 26, "06:00");
    const start2 = lagosWallClockToDate(2026, 5, 26, "10:00");
    const end2 = lagosWallClockToDate(2026, 5, 26, "16:00");
    const day: HourlyBookingDayDto = {
      date: "2026-05-26",
      kind: "custom",
      windows: [
        { timeStart: "03:00", timeEnd: "06:00" },
        { timeStart: "10:00", timeEnd: "16:00" },
      ],
      freeSlots: [
        { start: start1.toISOString(), end: end1.toISOString() },
        { start: start2.toISOString(), end: end2.toISOString() },
      ],
    };
    const groups = hourOptionGroupsForDay(day);
    expect(groups).toHaveLength(2);
    expect(groups[0].windowLabel).toMatch(/3:00/);
    expect(groups[1].windowLabel).toMatch(/10:00/);
    expect(groups[0].options.length).toBeGreaterThan(0);
    expect(groups[1].options.map((o) => o.label).at(-1)).toMatch(/4:00\s*PM/i);
  });
});

describe("hour range selection", () => {
  it("validates range inside free slots", () => {
    const start = lagosWallClockToDate(2026, 5, 26, "11:00");
    const end = lagosWallClockToDate(2026, 5, 26, "18:00");
    const freeSlots = [{ start: start.toISOString(), end: end.toISOString() }];
    const range = rangeFromHourSelection(
      lagosWallClockToDate(2026, 5, 26, "11:00").toISOString(),
      lagosWallClockToDate(2026, 5, 26, "15:00").toISOString(),
    );
    expect(range).not.toBeNull();
    expect(
      isHourRangeWithinFreeSlots(range!.bookStart, range!.bookEnd, freeSlots),
    ).toBe(true);
  });

  it("allows booking from 9am to 4pm when window ends at 4pm", () => {
    const start = lagosWallClockToDate(2026, 5, 26, "09:00");
    const end = lagosWallClockToDate(2026, 5, 26, "16:00");
    const freeSlots = [{ start: start.toISOString(), end: end.toISOString() }];
    const range = rangeFromHourSelection(
      start.toISOString(),
      end.toISOString(),
    );
    expect(range).not.toBeNull();
    expect(
      isHourRangeWithinFreeSlots(range!.bookStart, range!.bookEnd, freeSlots),
    ).toBe(true);
  });
});
