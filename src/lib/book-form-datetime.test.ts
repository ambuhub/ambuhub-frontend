import { describe, expect, it } from "vitest";
import type { BookingWindow } from "@/lib/booking-window";
import {
  formValuesMatchPickedSlot,
  freeRangeToFormValues,
  isBookRangeWithinFreeSlots,
  parseCalendarBookFormToRange,
  parseBookFormToRange,
} from "@/lib/book-form-datetime";
import { lagosWallClockToDate } from "@/lib/hire-return-window";

const BOOKING_WINDOW: BookingWindow = {
  daysOfWeek: [1, 2, 3, 4, 5],
  timeStart: "09:00",
  timeEnd: "16:00",
};

describe("parseCalendarBookFormToRange", () => {
  it("allows same start/end date with end after start in WAT", () => {
    const range = parseCalendarBookFormToRange(
      "2026-05-26",
      "2026-05-26",
      BOOKING_WINDOW,
    );
    expect(range).not.toBeNull();
    expect(range!.end.getTime()).toBeGreaterThan(range!.start.getTime());
  });

  it("spans multi-day ranges using window hours on first and last day", () => {
    const range = parseCalendarBookFormToRange(
      "2026-05-26",
      "2026-05-28",
      BOOKING_WINDOW,
    );
    expect(range).not.toBeNull();
    expect(range!.end.getTime()).toBeGreaterThan(range!.start.getTime());
  });
});

describe("daily slot click", () => {
  it("validates after mapping slot to same-day date fields", () => {
    const slotStart = lagosWallClockToDate(2026, 5, 26, "09:00");
    const slotEnd = lagosWallClockToDate(2026, 5, 26, "16:00");
    const freeRanges = [
      { start: slotStart.toISOString(), end: slotEnd.toISOString() },
    ];

    const form = freeRangeToFormValues(
      "daily",
      freeRanges[0].start,
      freeRanges[0].end,
    );
    expect(form).toEqual({
      bookStart: "2026-05-26",
      bookEnd: "2026-05-26",
    });

    expect(
      isBookRangeWithinFreeSlots(
        "daily",
        form!.bookStart,
        form!.bookEnd,
        freeRanges,
        BOOKING_WINDOW,
      ),
    ).toBe(true);

    expect(
      formValuesMatchPickedSlot("daily", form!.bookStart, form!.bookEnd, {
        isoStart: freeRanges[0].start,
        isoEnd: freeRanges[0].end,
      }),
    ).toBe(true);
  });
});

describe("hourly slot click", () => {
  it("validates one-hour slice inside free range", () => {
    const slotStart = lagosWallClockToDate(2026, 5, 26, "09:00");
    const slotEnd = lagosWallClockToDate(2026, 5, 26, "16:00");
    const freeRanges = [
      { start: slotStart.toISOString(), end: slotEnd.toISOString() },
    ];

    const form = freeRangeToFormValues(
      "hourly",
      freeRanges[0].start,
      freeRanges[0].end,
    );
    expect(form).not.toBeNull();

    const range = parseBookFormToRange(
      "hourly",
      form!.bookStart,
      form!.bookEnd,
    );
    expect(range).not.toBeNull();
    expect(range!.end.getTime() - range!.start.getTime()).toBe(3600000);

    expect(
      isBookRangeWithinFreeSlots(
        "hourly",
        form!.bookStart,
        form!.bookEnd,
        freeRanges,
      ),
    ).toBe(true);
  });
});
