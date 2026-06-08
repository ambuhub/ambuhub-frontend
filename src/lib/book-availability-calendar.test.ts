import { describe, expect, it } from "vitest";
import {
  countBillableBookDaysInRange,
  enumerateBookDateRange,
  groupBookDaysByMonth,
  hasBillableDaysInBookRange,
  isDateInRange,
  isOrderedBookDateRange,
  kindClass,
  normalizeBookDays,
  resolveBookRangeHighlightAnchors,
} from "@/lib/book-availability-calendar";
import type { HourlyBookingDayDto } from "@/lib/hourly-booking-schedule";

const sampleDays: HourlyBookingDayDto[] = [
  {
    date: "2026-05-29",
    kind: "default",
    windows: [{ timeStart: "09:00", timeEnd: "17:00" }],
    freeSlots: [{ start: "2026-05-29T08:00:00.000Z", end: "2026-05-29T16:00:00.000Z" }],
  },
  {
    date: "2026-05-30",
    kind: "custom",
    windows: [{ timeStart: "10:00", timeEnd: "14:00" }],
    freeSlots: [{ start: "2026-05-30T09:00:00.000Z", end: "2026-05-30T13:00:00.000Z" }],
  },
  {
    date: "2026-06-01",
    kind: "closed",
    windows: [],
    freeSlots: [],
  },
];

describe("normalizeBookDays", () => {
  it("returns empty array when days missing", () => {
    expect(normalizeBookDays(undefined)).toEqual([]);
    expect(normalizeBookDays([])).toEqual([]);
  });

  it("filters to the provided horizon", () => {
    const horizon = ["2026-05-29", "2026-05-30"];
    expect(normalizeBookDays(sampleDays, horizon)).toHaveLength(2);
    expect(normalizeBookDays(sampleDays, horizon)[1].kind).toBe("custom");
  });
});

describe("kindClass", () => {
  it("uses violet styling for custom days with availability", () => {
    expect(kindClass("custom", true)).toContain("violet");
  });

  it("uses cyan styling for default days with availability", () => {
    expect(kindClass("default", true)).toContain("cyan");
  });

  it("disables closed days", () => {
    expect(kindClass("closed", false)).toContain("cursor-not-allowed");
  });
});

describe("isDateInRange", () => {
  it("detects dates inside an inclusive range", () => {
    expect(isDateInRange("2026-05-30", "2026-05-29", "2026-05-31")).toBe(true);
    expect(isDateInRange("2026-05-28", "2026-05-29", "2026-05-31")).toBe(false);
  });
});

describe("groupBookDaysByMonth", () => {
  it("groups consecutive days by month with weekday padding", () => {
    const groups = groupBookDaysByMonth(sampleDays);
    expect(groups).toHaveLength(2);
    expect(groups[0].days).toHaveLength(2);
    expect(groups[1].days[0].date).toBe("2026-06-01");
    expect(groups[1].leadPad).toBeGreaterThanOrEqual(0);
  });
});

describe("enumerateBookDateRange", () => {
  it("lists inclusive dates between start and end", () => {
    expect(enumerateBookDateRange("2026-05-29", "2026-05-31")).toEqual([
      "2026-05-29",
      "2026-05-30",
      "2026-05-31",
    ]);
  });

  it("returns empty when start is after end", () => {
    expect(enumerateBookDateRange("2026-05-31", "2026-05-29")).toEqual([]);
  });
});

describe("isOrderedBookDateRange", () => {
  it("accepts valid ordered ranges", () => {
    expect(isOrderedBookDateRange("2026-05-29", "2026-05-31")).toBe(true);
    expect(isOrderedBookDateRange("2026-05-29", "2026-05-29")).toBe(true);
  });

  it("rejects inverted ranges", () => {
    expect(isOrderedBookDateRange("2026-05-31", "2026-05-29")).toBe(false);
  });
});

describe("resolveBookRangeHighlightAnchors", () => {
  const weekDays: HourlyBookingDayDto[] = [
    {
      date: "2026-06-01",
      kind: "default",
      windows: [{ timeStart: "09:00", timeEnd: "17:00" }],
      freeSlots: [{ start: "2026-06-01T08:00:00.000Z", end: "2026-06-01T16:00:00.000Z" }],
    },
    {
      date: "2026-06-02",
      kind: "default",
      windows: [{ timeStart: "09:00", timeEnd: "17:00" }],
      freeSlots: [{ start: "2026-06-02T08:00:00.000Z", end: "2026-06-02T16:00:00.000Z" }],
    },
    {
      date: "2026-06-03",
      kind: "closed",
      windows: [],
      freeSlots: [],
    },
    {
      date: "2026-06-04",
      kind: "default",
      windows: [{ timeStart: "09:00", timeEnd: "17:00" }],
      freeSlots: [{ start: "2026-06-04T08:00:00.000Z", end: "2026-06-04T16:00:00.000Z" }],
    },
    {
      date: "2026-06-05",
      kind: "default",
      windows: [{ timeStart: "09:00", timeEnd: "17:00" }],
      freeSlots: [{ start: "2026-06-05T08:00:00.000Z", end: "2026-06-05T16:00:00.000Z" }],
    },
  ];

  it("anchors to first and last billable days, skipping unavailable middle days", () => {
    const anchors = resolveBookRangeHighlightAnchors("2026-06-01", "2026-06-05", weekDays);
    expect(anchors.ordered).toBe(true);
    expect(anchors.billableDates).toEqual([
      "2026-06-01",
      "2026-06-02",
      "2026-06-04",
      "2026-06-05",
    ]);
    expect(anchors.highlightStart).toBe("2026-06-01");
    expect(anchors.highlightEnd).toBe("2026-06-05");
    expect(anchors.billableDates).not.toContain("2026-06-03");
  });

  it("snaps start anchor when bookStart falls on a closed day", () => {
    const anchors = resolveBookRangeHighlightAnchors("2026-06-03", "2026-06-05", weekDays);
    expect(anchors.highlightStart).toBe("2026-06-04");
    expect(anchors.highlightEnd).toBe("2026-06-05");
  });

  it("snaps end anchor when bookEnd falls on a closed day", () => {
    const anchors = resolveBookRangeHighlightAnchors("2026-06-01", "2026-06-03", weekDays);
    expect(anchors.highlightStart).toBe("2026-06-01");
    expect(anchors.highlightEnd).toBe("2026-06-02");
  });

  it("returns empty anchors when range order is invalid", () => {
    const anchors = resolveBookRangeHighlightAnchors("2026-06-05", "2026-06-01", weekDays);
    expect(anchors.ordered).toBe(false);
    expect(anchors.billableDates).toEqual([]);
    expect(anchors.highlightStart).toBeNull();
    expect(anchors.highlightEnd).toBeNull();
  });
});

describe("countBillableBookDaysInRange", () => {
  const threeDayHorizon: HourlyBookingDayDto[] = [
    sampleDays[0],
    sampleDays[1],
    {
      date: "2026-05-31",
      kind: "default",
      windows: [{ timeStart: "09:00", timeEnd: "17:00" }],
      freeSlots: [{ start: "2026-05-31T08:00:00.000Z", end: "2026-05-31T16:00:00.000Z" }],
    },
  ];

  it("counts only days with free slots", () => {
    expect(countBillableBookDaysInRange("2026-05-29", "2026-05-31", threeDayHorizon)).toBe(
      3,
    );
  });

  it("skips unavailable days in the middle of a range", () => {
    const withGap: HourlyBookingDayDto[] = [
      sampleDays[0],
      { date: "2026-05-30", kind: "closed", windows: [], freeSlots: [] },
      {
        date: "2026-05-31",
        kind: "default",
        windows: [{ timeStart: "09:00", timeEnd: "17:00" }],
        freeSlots: [{ start: "2026-05-31T08:00:00.000Z", end: "2026-05-31T16:00:00.000Z" }],
      },
    ];
    expect(countBillableBookDaysInRange("2026-05-29", "2026-05-31", withGap)).toBe(2);
    expect(hasBillableDaysInBookRange("2026-05-29", "2026-05-31", withGap)).toBe(true);
  });

  it("returns zero when no billable days exist in range", () => {
    expect(countBillableBookDaysInRange("2026-06-01", "2026-06-01", sampleDays)).toBe(0);
    expect(hasBillableDaysInBookRange("2026-06-01", "2026-06-01", sampleDays)).toBe(false);
  });

  it("returns zero when start is after end", () => {
    expect(countBillableBookDaysInRange("2026-05-31", "2026-05-29", threeDayHorizon)).toBe(0);
    expect(hasBillableDaysInBookRange("2026-05-31", "2026-05-29", threeDayHorizon)).toBe(false);
  });
});
