"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { COUNTRIES, type Country } from "@/lib/countries";

type Props = {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
};

export function CountrySelect({
  id = "country-select",
  value,
  onChange,
  required = false,
  placeholder = "Select country",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [search]);

  const selected = useMemo(
    () => COUNTRIES.find((c) => c.name === value) ?? null,
    [value],
  );

  useEffect(() => {
    setHighlightedIndex(0);
  }, [search, open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open) {
      searchInputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(
      `[data-index="${highlightedIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, open]);

  const selectCountry = useCallback(
    (c: Country) => {
      onChange(c.name);
      setOpen(false);
      setSearch("");
    },
    [onChange],
  );

  const listboxId = `${id}-listbox`;
  const triggerClass = `${className} flex w-full items-center justify-between gap-2 text-left`;

  const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const handleListNavigation = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setSearch("");
      return;
    }
    if (e.key === "Tab") {
      setOpen(false);
      setSearch("");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) =>
        Math.min(i + 1, Math.max(filtered.length - 1, 0)),
      );
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter") {
      const item = filtered[highlightedIndex];
      if (item) {
        e.preventDefault();
        selectCountry(item);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="hidden"
        name="country"
        value={value}
        readOnly
        tabIndex={-1}
        autoComplete="country-name"
        aria-hidden
      />
      <button
        type="button"
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-required={required}
        className={triggerClass}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {selected ? (
            <>
              <img
                src={selected.flagUrl}
                srcSet={`${selected.flagUrl} 1x, ${selected.flagUrl2x} 2x`}
                alt=""
                width={20}
                height={15}
                loading="lazy"
                className="shrink-0 rounded-sm object-cover"
              />
              <span className="truncate">{selected.name}</span>
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
          <div className="px-2 pb-2">
            <input
              ref={searchInputRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleListNavigation}
              placeholder="Search countries"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20"
              aria-label="Search countries"
            />
          </div>
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Countries"
            className="max-h-60 overflow-y-auto px-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">No matches</li>
            ) : (
              filtered.map((c, index) => (
                <li
                  key={c.code}
                  data-index={index}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm ${
                    index === highlightedIndex
                      ? "bg-blue-50 text-blue-950"
                      : "text-slate-900 hover:bg-slate-50"
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectCountry(c);
                  }}
                >
                  <img
                    src={c.flagUrl}
                    srcSet={`${c.flagUrl} 1x, ${c.flagUrl2x} 2x`}
                    alt=""
                    width={20}
                    height={15}
                    loading="lazy"
                    className="shrink-0 rounded-sm object-cover"
                  />
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <span className="shrink-0 text-xs uppercase text-slate-400">
                    {c.code}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
