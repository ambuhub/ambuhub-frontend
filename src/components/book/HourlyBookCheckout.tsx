"use client";

import {
  hourOptionGroupsForDay,
  hourSelectionToFormValues,
  isHourRangeWithinFreeSlots,
  isValidBookingStartHour,
  parseHourlyBookPayload,
  rangeFromHourSelection,
} from "@/lib/hourly-book-slots";
import type { HourlyBookingDayDto, HourlyDayKind } from "@/lib/hourly-booking-schedule";
import { previewBookLineTotalNgn } from "@/lib/book-form-datetime";
import type { BookingAvailabilityResponse } from "@/lib/marketplace-book";
import {
  formatHirePricePeriodSuffix,
  formatPricingPeriodLabel,
} from "@/lib/pricing-period";
import type { MarketplaceServiceRow } from "@/lib/service-category-page-data";
import { useMemo, useState } from "react";

const naira = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 });

function formatNaira(value: number): string {
  return `₦${naira.format(value)}`;
}

const LEGEND_SWATCH_BASE = "h-4 w-4 shrink-0 rounded border";

const LEGEND_SWATCH: Record<"default" | "custom" | "unavailable", string> = {
  default: "border-cyan-200 bg-cyan-50",
  custom: "border-violet-300 bg-violet-50",
  unavailable: "border-slate-200 bg-slate-100",
};

function kindLabel(kind: HourlyDayKind): string {
  if (kind === "custom") return "Custom hours";
  if (kind === "closed") return "Closed";
  if (kind === "unavailable") return "Unavailable";
  return "Default hours";
}

function kindClass(kind: HourlyDayKind, hasFree: boolean): string {
  if (kind === "closed" || kind === "unavailable" || !hasFree) {
    return `${LEGEND_SWATCH.unavailable} text-slate-400 cursor-not-allowed`;
  }
  if (kind === "custom") {
    return `${LEGEND_SWATCH.custom} text-violet-900 hover:border-violet-400`;
  }
  return `${LEGEND_SWATCH.default} text-slate-800 hover:border-cyan-400 hover:bg-cyan-100`;
}

type Props = {
  service: MarketplaceServiceRow;
  availability: BookingAvailabilityResponse;
  bookStart: string;
  bookEnd: string;
  onBookStartChange: (v: string) => void;
  onBookEndChange: (v: string) => void;
  onClearError: () => void;
};

export function HourlyBookCheckout({
  service,
  availability,
  bookStart,
  bookEnd,
  onBookStartChange,
  onBookEndChange,
  onClearError,
}: Props) {
  const days = availability.days ?? [];
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const first = days.find((d) => d.freeSlots.length > 0);
    return first?.date ?? days[0]?.date ?? "";
  });
  const [pickStartIso, setPickStartIso] = useState<string | null>(null);
  const [startHint, setStartHint] = useState<string | null>(null);

  const selectedDay = useMemo(
    () => days.find((d) => d.date === selectedDate) ?? null,
    [days, selectedDate],
  );

  const hourGroups = useMemo(
    () => (selectedDay ? hourOptionGroupsForDay(selectedDay) : []),
    [selectedDay],
  );

  const hourOptions = useMemo(
    () => hourGroups.flatMap((g) => g.options),
    [hourGroups],
  );

  const payload = useMemo(() => {
    if (!bookStart.trim() || !bookEnd.trim()) {
      return null;
    }
    return parseHourlyBookPayload(bookStart, bookEnd);
  }, [bookStart, bookEnd]);

  const preview = useMemo(() => {
    if (!payload || !service.price) {
      return null;
    }
    return previewBookLineTotalNgn(
      "hourly",
      bookStart,
      bookEnd,
      service.price,
      availability.bookingWindow ?? service.bookingWindow,
    );
  }, [
    payload,
    service.price,
    bookStart,
    bookEnd,
    availability.bookingWindow,
    service.bookingWindow,
  ]);

  const rangeValid = useMemo(() => {
    if (!payload || !selectedDay) {
      return null;
    }
    return isHourRangeWithinFreeSlots(
      payload.bookStart,
      payload.bookEnd,
      selectedDay.freeSlots,
    );
  }, [payload, selectedDay]);

  function selectDate(date: string) {
    setSelectedDate(date);
    setPickStartIso(null);
    setStartHint(null);
    onBookStartChange("");
    onBookEndChange("");
    onClearError();
  }

  function handleHourClick(iso: string) {
    onClearError();
    setStartHint(null);
    const freeSlots = selectedDay?.freeSlots ?? [];
    if (!pickStartIso) {
      if (!isValidBookingStartHour(iso, freeSlots)) {
        setStartHint("Select an earlier hour to start your booking.");
        return;
      }
      setPickStartIso(iso);
      const form = hourSelectionToFormValues(iso, iso);
      onBookStartChange(form.bookStart);
      onBookEndChange("");
      return;
    }

    const range = rangeFromHourSelection(pickStartIso, iso);
    if (!range) {
      if (!isValidBookingStartHour(iso, freeSlots)) {
        setStartHint("Select an earlier hour to start your booking.");
        return;
      }
      setPickStartIso(iso);
      const form = hourSelectionToFormValues(iso, iso);
      onBookStartChange(form.bookStart);
      onBookEndChange("");
      return;
    }

    const form = hourSelectionToFormValues(range.bookStart, range.bookEnd);
    onBookStartChange(form.bookStart);
    onBookEndChange(form.bookEnd);
    setPickStartIso(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span className={`${LEGEND_SWATCH_BASE} ${LEGEND_SWATCH.default}`} />
          Default hours
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={`${LEGEND_SWATCH_BASE} ${LEGEND_SWATCH.custom}`} />
          Custom hours
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={`${LEGEND_SWATCH_BASE} ${LEGEND_SWATCH.unavailable}`} />
          Unavailable
        </span>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground">Choose a day (WAT)</h2>
        <div className="mt-3 grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map((day: HourlyBookingDayDto) => {
            const hasFree = day.freeSlots.length > 0;
            const isSelected = day.date === selectedDate;
            return (
              <button
                key={day.date}
                type="button"
                disabled={!hasFree}
                onClick={() => selectDate(day.date)}
                title={`${day.date} · ${kindLabel(day.kind)}`}
                className={`flex min-h-[3.25rem] flex-col items-center justify-center rounded-lg border px-1 py-2 text-center text-[11px] font-medium transition sm:text-xs ${
                  isSelected
                    ? "border-cyan-600 bg-cyan-600 text-white shadow-md"
                    : kindClass(day.kind, hasFree)
                }`}
              >
                <span>{day.date.slice(8)}</span>
                {day.kind === "custom" && !isSelected ? (
                  <span className="mt-0.5 text-[9px] uppercase tracking-wide text-violet-700">
                    custom
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay ? (
        <div className="rounded-2xl border border-cyan-200/60 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">
            Available hours · {selectedDay.date} ({kindLabel(selectedDay.kind)})
          </h2>
          <p className="mt-1 text-xs text-foreground/60">
            Click a start hour, then an end hour (booking runs until that end time, WAT).
            {(availability.bookingGapHours ?? 0) > 0
              ? ` ${availability.bookingGapHours}h buffer applies after each booking.`
              : null}
          </p>
          {hourGroups.length > 0 ? (
            <div className="mt-4 space-y-4">
              {hourGroups.map((group) => (
                <div key={group.windowLabel || "default"}>
                  {group.windowLabel ? (
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-800">
                      {group.windowLabel}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((h) => {
                      const isStart = pickStartIso === h.iso;
                      const payloadNow = parseHourlyBookPayload(bookStart, bookEnd);
                      const isInRange =
                        payloadNow &&
                        new Date(h.iso).getTime() >=
                          new Date(payloadNow.bookStart).getTime() &&
                        new Date(h.iso).getTime() < new Date(payloadNow.bookEnd).getTime();
                      return (
                        <button
                          key={h.iso}
                          type="button"
                          onClick={() => handleHourClick(h.iso)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                            isStart
                              ? "border-cyan-600 bg-cyan-600 text-white"
                              : isInRange
                                ? "border-cyan-400 bg-cyan-100 text-cyan-950"
                                : "border-slate-200 bg-slate-50 hover:border-cyan-400"
                          }`}
                        >
                          {h.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-foreground/60">No open hours on this day.</p>
          )}
          {pickStartIso ? (
            <p className="mt-3 text-xs font-medium text-cyan-800">
              Select an end time (after {hourOptions.find((o) => o.iso === pickStartIso)?.label}).
            </p>
          ) : null}
          {startHint ? (
            <p className="mt-2 text-xs font-medium text-amber-800">{startHint}</p>
          ) : null}
          {bookStart && bookEnd ? (
            <p className="mt-3 text-sm text-foreground/80">
              Selected: {bookStart.replace("T", " ")} → {bookEnd.replace("T", " ")}
            </p>
          ) : null}
          {rangeValid === false ? (
            <p className="mt-2 text-xs text-amber-800">
              Selected range is outside available hours or overlaps another booking.
            </p>
          ) : null}
          {preview ? (
            <p className="mt-4 text-lg font-semibold text-foreground">
              Total: {formatNaira(preview.lineTotalNgn)}
              <span className="ml-2 text-sm font-normal text-foreground/60">
                ({preview.billableUnits} × {formatPricingPeriodLabel("hourly")}
                {typeof service.price === "number"
                  ? ` @ ${formatNaira(service.price)} ${formatHirePricePeriodSuffix("hourly")}`
                  : null}
                )
              </span>
            </p>
          ) : null}
        </div>
      ) : null}

    </div>
  );
}
