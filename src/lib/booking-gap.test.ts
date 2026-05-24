import { describe, expect, it } from "vitest";
import {
  gapHoursToInputLabel,
  gapMinutesToHours,
  parseGapHoursForPatch,
} from "@/lib/booking-gap";

describe("parseGapHoursForPatch", () => {
  it("returns hours for API payload", () => {
    expect(parseGapHoursForPatch("2")).toBe(2);
    expect(parseGapHoursForPatch("")).toBe(0);
    expect(parseGapHoursForPatch("25")).toBeNull();
  });
});

describe("gapHoursToInputLabel", () => {
  it("formats stored minutes as hour input", () => {
    expect(gapHoursToInputLabel(gapMinutesToHours(120))).toBe("2");
  });
});
