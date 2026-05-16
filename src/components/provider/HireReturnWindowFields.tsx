"use client";

import {
  DAY_LABELS,
  EMPTY_HIRE_RETURN_WINDOW,
  WEEKDAY_INDICES,
  hmToTimeInput,
  timeInputToHm,
  type DayOfWeek,
  type HireReturnWindow,
} from "@/lib/hire-return-window";

type Props = {
  value: HireReturnWindow;
  onChange: (next: HireReturnWindow) => void;
  labelClass?: string;
  inputClass?: string;
};

export function HireReturnWindowFields({
  value,
  onChange,
  labelClass = "block text-sm font-semibold text-blue-950",
  inputClass = "mt-1.5 w-full rounded-xl border border-blue-200/90 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-600/30",
}: Props) {
  const selected = new Set(value.daysOfWeek);

  function toggleDay(day: DayOfWeek) {
    const next = new Set(selected);
    if (next.has(day)) {
      next.delete(day);
    } else {
      next.add(day);
    }
    onChange({
      ...value,
      daysOfWeek: [...next].sort((a, b) => a - b) as DayOfWeek[],
    });
  }

  function setWeekdays() {
    onChange({ ...value, daysOfWeek: [...WEEKDAY_INDICES] });
  }

  return (
    <div className="space-y-4">
      <div>
        <span className={labelClass}>Return days (WAT)</span>
        <p className="mt-1 text-xs text-slate-600">
          When customers may return hired items to your office.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={setWeekdays}
            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100"
          >
            Weekdays (Mon–Fri)
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {DAY_LABELS.map((label, index) => {
            const day = index as DayOfWeek;
            const on = selected.has(day);
            return (
              <button
                key={label}
                type="button"
                aria-pressed={on}
                onClick={() => toggleDay(day)}
                className={`min-w-[3rem] rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  on
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="return-time-start" className={labelClass}>
            Return from
          </label>
          <input
            id="return-time-start"
            type="time"
            required
            value={hmToTimeInput(value.timeStart || EMPTY_HIRE_RETURN_WINDOW.timeStart)}
            onChange={(e) =>
              onChange({ ...value, timeStart: timeInputToHm(e.target.value) })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="return-time-end" className={labelClass}>
            Return until
          </label>
          <input
            id="return-time-end"
            type="time"
            required
            value={hmToTimeInput(value.timeEnd || EMPTY_HIRE_RETURN_WINDOW.timeEnd)}
            onChange={(e) =>
              onChange({ ...value, timeEnd: timeInputToHm(e.target.value) })
            }
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}

