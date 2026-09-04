"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  API_PAGE_SIZE,
  EMPTY_PAGE_META,
  type PaginationMeta,
} from "@/lib/paginate";

export type PaginatedFetcher<T> = (
  page: number,
  limit: number,
) => Promise<{ items: T[]; meta: PaginationMeta }>;

export type PaginatedList<T> = {
  items: T[];
  meta: PaginationMeta;
  /** True on the first load, when there is nothing to show yet. */
  loading: boolean;
  /** True while appending a further page, so the list stays visible. */
  loadingMore: boolean;
  error: string | null;
  /** Appends the next page — the mobile "Load more" action. */
  loadMore: () => void;
  /** Replaces the list with one page — the desktop numbered-page action. */
  goToPage: (page: number) => void;
  /** Re-fetches the current page, discarding anything appended. */
  refresh: () => void;
};

/**
 * Drives a paginated list that supports both interaction models on one screen:
 * appending pages on small screens and jumping between pages on large ones.
 *
 * `loadMore` appends so the reader keeps their place while scrolling;
 * `goToPage` replaces so a page number always means exactly that page. Both
 * write to the same `page`, so switching between them mid-session stays
 * coherent.
 */
export function usePaginatedList<T>(
  fetcher: PaginatedFetcher<T>,
  options: { limit?: number; enabled?: boolean; resetKey?: string } = {},
): PaginatedList<T> {
  const limit = options.limit ?? API_PAGE_SIZE;
  const enabled = options.enabled ?? true;
  // Changing this restarts the list at page 1 — for filters and sorting, where
  // holding the current page would show a page that no longer means the same thing.
  const resetKey = options.resetKey ?? "";

  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_PAGE_META);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ignore responses from superseded requests, so fast clicking cannot leave
  // an earlier page's rows on screen.
  const requestRef = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(
    async (page: number, mode: "replace" | "append") => {
      const requestId = requestRef.current + 1;
      requestRef.current = requestId;

      if (mode === "append") {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const result = await fetcherRef.current(page, limit);
        if (requestRef.current !== requestId) {
          return;
        }
        setItems((prev) =>
          mode === "append" ? [...prev, ...result.items] : result.items,
        );
        setMeta(result.meta);
      } catch (err) {
        if (requestRef.current !== requestId) {
          return;
        }
        setError(err instanceof Error ? err.message : "Could not load this list.");
        if (mode === "replace") {
          setItems([]);
          setMeta(EMPTY_PAGE_META);
        }
      } finally {
        if (requestRef.current === requestId) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [limit],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void run(1, "replace");
  }, [enabled, run, resetKey]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || !meta.hasMore) {
      return;
    }
    void run(meta.page + 1, "append");
  }, [loading, loadingMore, meta.hasMore, meta.page, run]);

  const goToPage = useCallback(
    (page: number) => {
      if (loading || loadingMore || page === meta.page) {
        return;
      }
      void run(page, "replace");
    },
    [loading, loadingMore, meta.page, run],
  );

  const refresh = useCallback(() => {
    void run(meta.page, "replace");
  }, [meta.page, run]);

  return { items, meta, loading, loadingMore, error, loadMore, goToPage, refresh };
}
