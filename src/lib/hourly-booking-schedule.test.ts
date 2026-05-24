import { describe, expect, it } from "vitest";
import {
  lagosDateString,
  listNext30LagosDates,
  resolveHourlyBookingSchedule,
  validateHourlyScheduleClient,
  type HourlyBookingSchedule,
} from "@/lib/hourly-booking-schedule";

const validDefault: HourlyBookingSchedule = {
  default: {
    daysOfWeek: [1, 2, 3, 4, 5],
    timeStart: "09:00",
    timeEnd: "17:00",
  },
  overrides: [],
};

describe("resolveHourlyBookingSchedule", () => {
  it("migrates from bookingWindow when hourly schedule empty", () => {
    const resolved = resolveHourlyBookingSchedule(
      { default: { daysOfWeek: [], timeStart: "09:00", timeEnd: "17:00" }, overrides: [] },
      { daysOfWeek: [1], timeStart: "10:00", timeEnd: "16:00" },
    );
    expect(resolved?.default.timeStart).toBe("10:00");
    expect(resolved?.overrides).toEqual([]);
  });
});

describe("validateHourlyScheduleClient", () => {
  it("rejects override outside 30-day horizon", () => {
    const past = "2000-01-01";
    const err = validateHourlyScheduleClient({
      ...validDefault,
      overrides: [{ date: past, kind: "closed" }],
    });
    expect(err).toMatch(/30 days/);
  });

  it("accepts override on a date in the horizon", () => {
    const date = listNext30LagosDates()[0];
    const err = validateHourlyScheduleClient({
      ...validDefault,
      overrides: [
        {
          date,
          kind: "custom",
          windows: [
            { timeStart: "09:00", timeEnd: "12:00" },
            { timeStart: "14:00", timeEnd: "18:00" },
          ],
        },
      ],
    });
    expect(err).toBeNull();
  });

  it("rejects duplicate override dates", () => {
    const date = lagosDateString();
    const err = validateHourlyScheduleClient({
      ...validDefault,
      overrides: [
        { date, kind: "closed" },
        { date, kind: "closed" },
      ],
    });
    expect(err).toMatch(/Duplicate/);
  });
});
