"use client";

import { HireReturnWindowFields } from "@/components/provider/HireReturnWindowFields";
import { AMBUHUB_MARKETPLACE_INVALIDATE_EVENT } from "@/lib/cache-tags";
import {
  gapHoursToInputLabel,
  gapMinutesToHours,
  parseGapHoursForPatch,
} from "@/lib/booking-gap";
import {
  EMPTY_HOURLY_SCHEDULE,
  getOverrideForDate,
  hasValidHourlySchedule,
  listNext30LagosDates,
  resolveHourlyBookingSchedule,
  validateHourlyScheduleClient,
  type HourlyBookingSchedule,
  type HourlyScheduleOverride,
  type TimeRange,
} from "@/lib/hourly-booking-schedule";
import { patchBookingSettings } from "@/lib/marketplace-book";
import {
  PRICING_PERIODS,
  formatPricingPeriodLabel,
  isPricingPeriod,
  type PricingPeriod,
} from "@/lib/pricing-period";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

function gapHoursFromItem(item: {
  bookingGapHours?: number | null;
  bookingGapMinutes?: number | null;
}): number {
  if (typeof item.bookingGapHours === "number") {
    return item.bookingGapHours;
  }
  if (typeof item.bookingGapMinutes === "number") {
    return gapMinutesToHours(item.bookingGapMinutes);
  }
  return 0;
}

type ServiceRow = {
  id: string;
  title: string;
  listingType: "sale" | "hire" | "book" | null;
  price?: number | null;
  pricingPeriod?: PricingPeriod | null;
  bookingWindow?: HourlyBookingSchedule["default"] | null;
  hourlyBookingSchedule?: HourlyBookingSchedule | null;
  bookingGapMinutes?: number | null;
  bookingGapHours?: number | null;
};

type Props = {
  item: ServiceRow;
  onSaved?: () => void;
  pricingPeriod: PricingPeriod | "";
  onPricingPeriodChange: (period: PricingPeriod | "") => void;
};

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map((x) => parseInt(x, 10));
  const probe = new Date(Date.UTC(y, m - 1, d, 12, 0));
  return probe.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function emptyWindow(): TimeRange {
  return { timeStart: "09:00", timeEnd: "17:00" };
}

type Next30DaysOverridesProps = {
  schedule: HourlyBookingSchedule;
  horizonDates: string[];
  setOverrideKind: (date: string, kind: "default" | "closed" | "custom") => void;
  updateCustomWindows: (date: string, windows: TimeRange[]) => void;
};

function Next30DaysOverrides({
  schedule,
  horizonDates,
  setOverrideKind,
  updateCustomWindows,
}: Next30DaysOverridesProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-800">Next 30 days</p>
      <p className="mt-0.5 text-xs text-slate-600">
        Mark days closed, or set custom hours (multiple windows per day allowed).
      </p>
      <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
        {horizonDates.map((date) => {
          const override = getOverrideForDate(schedule, date);
          const kind = override?.kind ?? "default";
          return (
            <li key={date} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-slate-800">{formatDateLabel(date)}</span>
                <select
                  value={kind}
                  onChange={(e) =>
                    setOverrideKind(date, e.target.value as "default" | "closed" | "custom")
                  }
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                >
                  <option value="default">Use default</option>
                  <option value="closed">Closed</option>
                  <option value="custom">Custom hours</option>
                </select>
              </div>
              {override?.kind === "custom" ? (
                <div className="mt-2 space-y-2 border-t border-slate-100 pt-2">
                  {override.windows.map((w, idx) => (
                    <div key={idx} className="flex flex-wrap items-end gap-2">
                      <label className="text-xs text-slate-600">
                        From
                        <input
                          type="time"
                          value={w.timeStart}
                          onChange={(e) => {
                            const next = [...override.windows];
                            next[idx] = { ...w, timeStart: e.target.value.slice(0, 5) };
                            updateCustomWindows(date, next);
                          }}
                          className="mt-0.5 block rounded border border-slate-200 px-2 py-1"
                        />
                      </label>
                      <label className="text-xs text-slate-600">
                        To
                        <input
                          type="time"
                          value={w.timeEnd}
                          onChange={(e) => {
                            const next = [...override.windows];
                            next[idx] = { ...w, timeEnd: e.target.value.slice(0, 5) };
                            updateCustomWindows(date, next);
                          }}
                          className="mt-0.5 block rounded border border-slate-200 px-2 py-1"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          updateCustomWindows(
                            date,
                            override.windows.filter((_, i) => i !== idx),
                          )
                        }
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                        aria-label="Remove window"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      updateCustomWindows(date, [...override.windows, emptyWindow()])
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-800"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add window
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function HourlyScheduleEditor({
  item,
  onSaved,
  pricingPeriod,
  onPricingPeriodChange,
}: Props) {
  const initial = useMemo(
    () =>
      resolveHourlyBookingSchedule(item.hourlyBookingSchedule, item.bookingWindow) ??
      EMPTY_HOURLY_SCHEDULE,
    [item.hourlyBookingSchedule, item.bookingWindow],
  );

  const [schedule, setSchedule] = useState<HourlyBookingSchedule>(initial);
  const [gapHours, setGapHours] = useState(gapHoursToInputLabel(gapHoursFromItem(item)));
  const [price, setPrice] = useState(item.price != null ? String(item.price) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const horizonDates = useMemo(() => listNext30LagosDates(), []);
  const showOverrides = pricingPeriod === "hourly";

  useEffect(() => {
    setSchedule(
      resolveHourlyBookingSchedule(item.hourlyBookingSchedule, item.bookingWindow) ??
        EMPTY_HOURLY_SCHEDULE,
    );
    setGapHours(gapHoursToInputLabel(gapHoursFromItem(item)));
    setPrice(item.price != null ? String(item.price) : "");
  }, [item]);

  const setOverrideKind = useCallback((date: string, kind: "default" | "closed" | "custom") => {
    setSchedule((prev) => {
      const rest = prev.overrides.filter((o) => o.date !== date);
      if (kind === "default") {
        return { ...prev, overrides: rest };
      }
      if (kind === "closed") {
        return { ...prev, overrides: [...rest, { date, kind: "closed" }] };
      }
      const existing = prev.overrides.find(
        (o): o is Extract<HourlyScheduleOverride, { kind: "custom" }> =>
          o.date === date && o.kind === "custom",
      );
      return {
        ...prev,
        overrides: [
          ...rest,
          { date, kind: "custom", windows: existing?.windows ?? [emptyWindow()] },
        ],
      };
    });
  }, []);

  const updateCustomWindows = useCallback((date: string, windows: TimeRange[]) => {
    setSchedule((prev) => ({
      ...prev,
      overrides: [
        ...prev.overrides.filter((o) => o.date !== date),
        { date, kind: "custom" as const, windows },
      ],
    }));
  }, []);

  const ready =
    hasValidHourlySchedule(schedule) &&
    price.trim() !== "" &&
    Number.isFinite(Number(price)) &&
    Number(price) >= 0;

  const save = useCallback(async () => {
    setError(null);
    setSuccess(false);
    const validation = validateHourlyScheduleClient(schedule);
    if (validation) {
      setError(validation);
      return;
    }
    const parsedPrice = Number(price);
    if (!price.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Enter a valid price.");
      return;
    }
    const gapH = parseGapHoursForPatch(gapHours);
    if (gapH === null) {
      setError("Gap must be a non-negative number of hours (max 24).");
      return;
    }
    if (pricingPeriod !== "hourly") {
      setError("Select hourly billing to save an hourly schedule.");
      return;
    }
    setSaving(true);
    try {
      await patchBookingSettings(item.id, {
        hourlyBookingSchedule: schedule,
        bookingGapHours: gapH,
        price: parsedPrice,
        pricingPeriod: "hourly",
      });
      setSuccess(true);
      window.dispatchEvent(new CustomEvent(AMBUHUB_MARKETPLACE_INVALIDATE_EVENT));
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }, [schedule, gapHours, price, pricingPeriod, item.id, onSaved]);

  return (
    <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-cyan-950">Hourly booking schedule</p>
        {ready ? (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            Ready for booking
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
            Incomplete
          </span>
        )}
      </div>

      <div className="mt-4 space-y-6">
        <div>
          <p className="text-sm font-semibold text-slate-800">Default weekly hours (WAT)</p>
          <p className="mt-0.5 text-xs text-slate-600">
            Applies to each selected weekday unless you override a specific date below.
          </p>
          <div className="mt-3">
            <HireReturnWindowFields
              value={schedule.default}
              onChange={(defaultSchedule) =>
                setSchedule((prev) => ({ ...prev, default: defaultSchedule }))
              }
              labelClass="block text-sm font-semibold text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800">
            Buffer after each booking (hours)
          </label>
          <p className="mt-0.5 text-xs text-slate-600">
            Time required after a booking ends before the next can start. Example: booking
            11:00–15:00 with a 2h buffer → next slot from 17:00.
          </p>
          <input
            type="number"
            min={0}
            step={0.5}
            value={gapHours}
            onChange={(e) => setGapHours(e.target.value)}
            className="mt-1.5 w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-800">Price (₦)</label>
            <input
              type="number"
              min={0}
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-800">Billing period</label>
            <select
              value={pricingPeriod}
              onChange={(e) =>
                onPricingPeriodChange(isPricingPeriod(e.target.value) ? e.target.value : "")
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select period</option>
              {PRICING_PERIODS.map((p) => (
                <option key={p} value={p}>
                  {formatPricingPeriodLabel(p)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Date overrides apply only while billing is hourly.
            </p>
          </div>
        </div>

        {showOverrides ? (
          <Next30DaysOverrides
            schedule={schedule}
            horizonDates={horizonDates}
            setOverrideKind={setOverrideKind}
            updateCustomWindows={updateCustomWindows}
          />
        ) : null}

        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-700">Booking settings saved.</p> : null}
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save booking settings"}
        </button>
      </div>
    </div>
  );
}
