/**
 * Client helpers for the API's standard pagination envelope.
 *
 * Every paginated list endpoint returns 20 rows per page by default and merges
 * `page`, `limit`, `total`, `totalPages` and `hasMore` alongside its own list
 * key. See [pagination.ts](ambuhub-backend/src/shared/lib/pagination.ts).
 */

export const API_PAGE_SIZE = 20;
export const API_MAX_PAGE_SIZE = 100;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

/** Empty metadata for error paths, so callers never handle a null meta. */
export const EMPTY_PAGE_META: PaginationMeta = {
  page: 1,
  limit: API_PAGE_SIZE,
  total: 0,
  totalPages: 1,
  hasMore: false,
};

export function readPaginationMeta(data: unknown): PaginationMeta {
  if (!data || typeof data !== "object") {
    return EMPTY_PAGE_META;
  }
  const d = data as Partial<PaginationMeta>;
  return {
    page: typeof d.page === "number" ? d.page : 1,
    limit: typeof d.limit === "number" ? d.limit : API_PAGE_SIZE,
    total: typeof d.total === "number" ? d.total : 0,
    totalPages: typeof d.totalPages === "number" ? d.totalPages : 1,
    hasMore: d.hasMore === true,
  };
}

/** Appends `page` and `limit` to a query string. */
export function withPageParams(
  search: URLSearchParams,
  page?: number,
  limit?: number,
): URLSearchParams {
  if (page != null) search.set("page", String(page));
  if (limit != null) search.set("limit", String(limit));
  return search;
}

/**
 * Walks every page of a list endpoint and returns the combined rows.
 *
 * For screens that genuinely need the complete set — a category browse page, or
 * a settings screen that configures each row. Requests the largest allowed page
 * so the walk is as few round trips as possible, and stops at `maxPages` so a
 * bad `hasMore` can never loop forever.
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number, limit: number) => Promise<{ items: T[]; meta: PaginationMeta }>,
  options: { maxPages?: number } = {},
): Promise<T[]> {
  const maxPages = options.maxPages ?? 50;
  const all: T[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const { items, meta } = await fetchPage(page, API_MAX_PAGE_SIZE);
    all.push(...items);
    if (!meta.hasMore || items.length === 0) {
      break;
    }
  }

  return all;
}
