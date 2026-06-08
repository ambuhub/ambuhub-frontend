"use client";

import {
  listNext30LagosDates,
  type HourlyScheduleOverride,
  type TimeRange,
} from "@/lib/hourly-booking-schedule";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo } from "react";

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

type Props = {
  overrides: HourlyScheduleOverride[];
  onChange: (overrides: HourlyScheduleOverride[]) => void;
};

export function DailyScheduleOverridesEditor({ overrides, onChange }: Props) {
  const horizonDates = useMemo(() => listNext30LagosDates(), []);

  const setOverrideKind = useCallback(
    (date: string, kind: "default" | "closed" | "custom") => {
      const rest = overrides.filter((o) => o.date !== date);
      if (kind === "default") {
        onChange(rest);
        return;
      }
      if (kind === "closed") {
        onChange([...rest, { date, kind: "closed" }]);
        return;
      }
      const existing = overrides.find(
        (o): o is Extract<HourlyScheduleOverride, { kind: "custom" }> =>
          o.date === date && o.kind === "custom",
      );
      onChange([
        ...rest,
        { date, kind: "custom", windows: existing?.windows ?? [emptyWindow()] },
      ]);
    },
    [overrides, onChange],
  );

  const updateCustomWindows = useCallback(
    (date: string, windows: TimeRange[]) => {
      onChange([
        ...overrides.filter((o) => o.date !== date),
        { date, kind: "custom" as const, windows },
      ]);
    },
    [overrides, onChange],
  );

  return (
    <div>
      <p className="text-sm font-semibold text-slate-800">Next 30 days</p>
      <p className="mt-0.5 text-xs text-slate-600">
        Override specific dates in the next 30 days (WAT). Mark days closed, or set custom
        hours (multiple windows per day allowed).
      </p>
      <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
        {horizonDates.map((date) => {
          const override = overrides.find((o) => o.date === date) ?? null;
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
