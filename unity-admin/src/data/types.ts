// Shared data-layer types for the admin API (Django REST Framework style).

// A record can be anything the mock returns; the generic engine treats rows as
// loose key/value maps and reads columns by field path.
export type ApiRecord = Record<string, unknown>;

// DRF paginated envelope. Some mock fixtures return a bare array instead, which
// the client normalizes into this same shape (see apiClient.normalizeList).
export interface Paginated<T = ApiRecord> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Inline foreign-key objects are consistently expanded as { url, id, name, ... }.
export interface FkRef {
  url?: string;
  id?: number | string;
  name?: string;
  [k: string]: unknown;
}

export interface NormalizedList<T = ApiRecord> {
  items: T[];
  count: number;
}
