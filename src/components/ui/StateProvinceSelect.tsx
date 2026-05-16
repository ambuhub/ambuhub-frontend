"use client";

import { API_PROXY_PREFIX } from "@/lib/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type StateOption = { code: string; name: string };

type Props = {
  id?: string;
  countryCode: string;
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function StateProvinceSelect({
  id = "state-province-select",
  countryCode,
  value,
  onChange,
  required = false,
  placeholder = "Select state / province",
  className = "",
  disabled = false,
}: Props) {
  const [states, setStates] = useState<StateOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const country = countryCode.trim().toUpperCase();
  const useManualEntry = !loading && states.length === 0 && !!country && !fetchError;

  useEffect(() => {
    if (!country) {
      setStates([]);
      setFetchError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    void (async () => {
      try {
        const res = await fetch(
          `${API_PROXY_PREFIX}/country-codes/${encodeURIComponent(country)}/states`,
          { credentials: "include" },
        );
        const data = (await res.json()) as { states?: StateOption[]; message?: string };
        if (!res.ok) throw new Error(data.message ?? "Could not load states");
        if (!cancelled) setStates(data.states ?? []);
      } catch (err) {
        if (!cancelled) {
          setStates([]);
          setFetchError(err instanceof Error ? err.message : "Could not load states");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [country]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return states;
    return states.filter((s) => s.name.toLowerCase().includes(q));
  }, [search, states]);

  const selected = useMemo(
    () => states.find((s) => s.code === value.trim()) ?? null,
    [states, value],
  );

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const selectState = useCallback(
    (s: StateOption) => {
      onChange(s.code);
      setOpen(false);
      setSearch("");
    },
    [onChange],
  );

  const isDisabled = disabled || !country || loading;
  const triggerClass = `${className} flex w-full items-center justify-between gap-2 text-left`;

  if (useManualEntry) {
    return (
      <div className="w-full">
        <input
          id={id}
          type="text"
          name="stateProvince"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          placeholder="Enter state or province"
          className={className}
          autoComplete="address-level1"
        />
        <p className="mt-1 text-xs text-slate-500">
          No predefined subdivisions for this country; enter manually.
        </p>
      </div>
    );
  }

  const displayLabel = loading
    ? "Loading states…"
    : fetchError
      ? fetchError
      : selected
        ? selected.name
        : placeholder;

  return (
    <div ref={containerRef} className="relative w-full">
      <input type="hidden" name="stateProvince" value={value} readOnly tabIndex={-1} aria-hidden />
      <button
        type="button"
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-required={required}
        disabled={isDisabled}
        className={triggerClass}
        onClick={() => !isDisabled && setOpen((o) => !o)}
      >
        <span className={`min-w-0 flex-1 truncate ${!selected && !loading ? "text-slate-400" : ""}`}>
          {displayLabel}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && !isDisabled ? (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
          <div className="px-2 pb-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search states"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20"
            />
          </div>
          <ul role="listbox" className="max-h-60 overflow-y-auto px-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">No matches</li>
            ) : (
              filtered.map((s) => (
                <li key={s.code}>
                  <button
                    type="button"
                    className="w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectState(s);
                    }}
                  >
                    {s.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
