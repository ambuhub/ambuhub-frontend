"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { PaginationMeta } from "@/lib/paginate";

/**
 * Builds a compact page list with ellipses, e.g. 1 … 4 5 6 … 20.
 *
 * Always includes the first and last page so those stay one click away, plus a
 * window around the current page. Returns numbers to render and `"gap"` markers
 * for the ellipses.
 */
export function buildPageWindow(
  current: number,
  totalPages: number,
  maxButtons = 7,
): (number | "gap")[] {
  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const window = new Set<number>([1, totalPages, current]);
  const side = Math.max(1, Math.floor((maxButtons - 3) / 2));
  for (let offset = 1; offset <= side; offset += 1) {
    if (current - offset > 1) window.add(current - offset);
    if (current + offset < totalPages) window.add(current + offset);
  }

  const pages = [...window].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  let previous = 0;
  for (const page of pages) {
    if (previous && page - previous > 1) {
      out.push("gap");
    }
    out.push(page);
    previous = page;
  }
  return out;
}

type Props = {
  meta: PaginationMeta;
  /** Rows currently rendered — may exceed `meta.limit` after "Load more". */
  shownCount: number;
  loadingMore: boolean;
  onLoadMore: () => void;
  onGoToPage: (page: number) => void;
  /** Plural noun for the summary line, e.g. "orders". */
  itemNoun?: string;
  className?: string;
};

/**
 * Pagination that adapts to the screen rather than the other way round:
 * a single "Load more" button on phones, where appending suits scrolling and
 * small tap targets, and numbered pages from `sm` up, matching the table-style
 * screens on desktop.
 *
 * Both controls render; CSS decides which is visible, so there is no layout
 * shift or JS width measurement on first paint.
 */
export function Pagination({
  meta,
  shownCount,
  loadingMore,
  onLoadMore,
  onGoToPage,
  itemNoun = "items",
  className,
}: Props) {
  if (meta.total === 0 || (meta.totalPages <= 1 && !meta.hasMore)) {
    return null;
  }

  const pages = buildPageWindow(meta.page, meta.totalPages);

  return (
    <nav
      className={`mt-4 border-t border-slate-200 pt-4 ${className ?? ""}`}
      aria-label="Pagination"
    >
      {/* Small screens: append the next page. */}
      <div className="sm:hidden">
        <p className="mb-2 text-center text-xs text-slate-500" aria-live="polite">
          Showing {shownCount} of {meta.total} {itemNoun}
        </p>
        {meta.hasMore ? (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </button>
        ) : (
          <p className="text-center text-xs text-slate-400">
            You have reached the end.
          </p>
        )}
      </div>

      {/* Large screens: jump between pages. */}
      <div className="hidden items-center justify-between gap-3 sm:flex">
        <p className="text-sm text-slate-500">
          Page {meta.page} of {meta.totalPages}
          <span className="text-slate-400">
            {" "}
            · {meta.total} {itemNoun}
          </span>
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onGoToPage(meta.page - 1)}
            disabled={meta.page <= 1}
            aria-label="Previous page"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            <span className="hidden md:inline">Previous</span>
          </button>

          {pages.map((page, index) =>
            page === "gap" ? (
              <span
                key={`gap-${index}`}
                className="px-1 text-sm text-slate-400"
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onGoToPage(page)}
                aria-label={`Page ${page}`}
                aria-current={page === meta.page ? "page" : undefined}
                className={`min-w-[2.25rem] rounded-lg border px-2.5 py-2 text-sm font-medium transition ${
                  page === meta.page
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => onGoToPage(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            aria-label="Next page"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="hidden md:inline">Next</span>
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </nav>
  );
}
