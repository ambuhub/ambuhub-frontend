"use client";

import {
  groupBookDaysByMonth,
  kindClass,
  kindLabel,
  LEGEND_SWATCH,
  LEGEND_SWATCH_BASE,
  normalizeBookDays,
  resolveBookRangeHighlightAnchors,
  WEEKDAY_HEADERS,
} from "@/lib/book-availability-calendar";
import type { HourlyBookingDayDto } from "@/lib/hourly-booking-schedule";
import { useMemo } from "react";

type Props = {
  days: HourlyBookingDayDto[];
  bookStart: string;
  bookEnd: string;
  onDaySelect: (day: HourlyBookingDayDto) => void;
};

export function BookAvailabilityCalendar({
  days,
  bookStart,
  bookEnd,
  onDaySelect,
}: Props) {
  const calendarDays = useMemo(() => normalizeBookDays(days), [days]);
  const monthGroups = useMemo(() => groupBookDaysByMonth(calendarDays), [calendarDays]);
  const rangeHighlight = useMemo(
    () => resolveBookRangeHighlightAnchors(bookStart, bookEnd, calendarDays),
    [bookStart, bookEnd, calendarDays],
  );
  const billableInRange = useMemo(
    () => new Set(rangeHighlight.billableDates),
    [rangeHighlight.billableDates],
  );

  if (calendarDays.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-cyan-200/60 bg-white p-4 shadow-sm">
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

      <h2 className="mt-4 text-sm font-semibold text-foreground">Choose dates (WAT)</h2>
      <p className="mt-1 text-xs text-foreground/60">
        Click an available day to start your booking. Click a later day to extend the end
        date, or click an earlier day to start over.
      </p>

      <div className="mt-4 space-y-5">
        {monthGroups.map((group) => (
          <div key={group.monthKey}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {group.label}
            </p>
            <div className="mb-1 grid grid-cols-7 gap-1.5 sm:gap-2">
              {WEEKDAY_HEADERS.map((label) => (
                <span
                  key={`${group.monthKey}-${label}`}
                  className="text-center text-[10px] font-medium text-slate-400"
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {Array.from({ length: group.leadPad }).map((_, i) => (
                <span key={`${group.monthKey}-pad-${i}`} aria-hidden />
              ))}
              {group.days.map((day) => {
                const hasFree = day.freeSlots.length > 0;
                const isStartAnchor = day.date === rangeHighlight.highlightStart;
                const isEndAnchor = day.date === rangeHighlight.highlightEnd;
                const isAnchor = isStartAnchor || isEndAnchor;
                const inBillableRange =
                  rangeHighlight.ordered &&
                  billableInRange.has(day.date) &&
                  !isAnchor;

                return (
                  <button
                    key={day.date}
                    type="button"
                    disabled={!hasFree}
                    onClick={() => onDaySelect(day)}
                    title={`${day.date} · ${kindLabel(day.kind)}`}
                    className={`flex min-h-[3.25rem] flex-col items-center justify-center rounded-lg border px-1 py-2 text-center text-[11px] font-medium transition sm:text-xs ${
                      isAnchor
                        ? "border-cyan-600 bg-cyan-600 text-white shadow-md"
                        : inBillableRange
                          ? "border-cyan-300 bg-cyan-100 text-cyan-950 ring-1 ring-cyan-400/50"
                          : kindClass(day.kind, hasFree)
                    }`}
                  >
                    <span>{day.date.slice(8)}</span>
                    {day.kind === "custom" && !isAnchor ? (
                      <span className="mt-0.5 text-[9px] uppercase tracking-wide text-violet-700">
                        custom
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
