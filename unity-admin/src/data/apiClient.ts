import { ApiRecord, NormalizedList, Paginated } from './types';

// The admin API is reached through the unity proxy at the same origin the app is
// served from. Base path is '/rest/' (NOT '/rest/api/v1/') per the legacy AngularJS
// api_paths.js constants. During `npm run dev`, vite.config.ts proxies /rest -> mock.
export const API_BASE = '/rest';

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

// Join the base with a resource path, tolerating leading/trailing slashes and
// absolute paths (endpoints that already start with /rest are passed through).
export function buildUrl(resourcePath: string): string {
  if (/^https?:\/\//i.test(resourcePath)) return resourcePath;
  let p = resourcePath.trim();
  if (p.startsWith('/rest')) return p;
  if (!p.startsWith('/')) p = `/${p}`;
  return `${API_BASE}${p}`;
}

function withTrailingSlash(url: string): string {
  const [pathPart, query] = url.split('?');
  const normalized = pathPart.endsWith('/') ? pathPart : `${pathPart}/`;
  return query ? `${normalized}?${query}` : normalized;
}

// Marker for a body that could not be parsed as JSON, so `request` can turn it into
// a visible error instead of letting it flow on as data.
const NOT_JSON = Symbol('not-json');

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return NOT_JSON;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init && init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
    ...init,
  });
  const body = await parseBody(res);
  if (!res.ok) {
    throw new ApiError(
      `Request failed: ${res.status} ${res.statusText}`,
      res.status,
      body === NOT_JSON ? null : body
    );
  }
  // A 200 that is not JSON means something answered in the API's place - typically a
  // static server returning index.html for /rest/... . Treat it as an error rather than
  // letting the caller normalize HTML into an empty list and render a false "no data".
  if (body === NOT_JSON) {
    throw new ApiError(
      `Expected JSON from ${url} but received ${res.headers.get('content-type') || 'an unknown type'}. ` +
        'Is the API reachable from this origin?',
      res.status,
      null
    );
  }
  return body as T;
}

// Normalize the three list shapes this API returns into { items, count }:
//   [...]                                   bare array
//   { count, next, previous, results: [] }   DRF pagination envelope
//   { data: [...] }                          the UnityConnect / Megaport endpoints
export function normalizeList<T = ApiRecord>(raw: unknown): NormalizedList<T> {
  if (Array.isArray(raw)) {
    return { items: raw as T[], count: raw.length };
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.results)) {
      const page = raw as Paginated<T>;
      return { items: page.results, count: typeof page.count === 'number' ? page.count : page.results.length };
    }
    if (Array.isArray(obj.data)) {
      const items = obj.data as T[];
      return { items, count: typeof obj.count === 'number' ? obj.count : items.length };
    }
  }
  return { items: [], count: 0 };
}

/* ---- Collection cache -------------------------------------------------------
 *
 * Collections are fetched whole (see the note on list() below), and the biggest are
 * genuinely large - the user collection is ~1.8MB / 1600+ records. Every route visit
 * remounts its page, every tab flip changes activeUri, and each one re-downloaded the
 * lot. This keeps one entry per URL and one in-flight promise per URL, so concurrent
 * callers share a request and a revisit is free.
 *
 * SCOPED TO list() DELIBERATELY. It must NOT wrap request(), because data/task.ts
 * polls the SAME /task/{id}/ url up to 20 times through api.rawGet -> request(); a
 * cache there would pin the first PENDING response and hang every celery-backed flow
 * (VM lists, db_instance populate) until the poll budget expired.
 *
 * Stale-while-revalidate: a cached entry is returned immediately and refreshed in the
 * background, so a list is never blank on revisit but never indefinitely stale either.
 * Writes drop the affected prefix - see invalidateCollections().
 */
const COLLECTION_TTL_MS = 30000;

interface CacheEntry {
  data: NormalizedList<unknown>;
  ts: number;
}

const collectionCache = new Map<string, CacheEntry>();
const collectionInflight = new Map<string, Promise<NormalizedList<unknown>>>();

/* Drop every cached collection whose path starts with this resource. A write to
   `org` also invalidates `org?search=x`, and `fast/org` is dropped alongside `org`
   because they project the same records. */
export function invalidateCollections(resourcePath: string): void {
  const base = withTrailingSlash(buildUrl(resourcePath));
  const bare = base.replace(/^\/rest\//, '').replace(/\/$/, '');
  const tail = bare.replace(/^fast\//, '');
  for (const key of Array.from(collectionCache.keys())) {
    const k = key.replace(/^\/rest\//, '');
    if (k.startsWith(bare) || k.startsWith(`fast/${tail}`) || k.startsWith(tail)) {
      collectionCache.delete(key);
      collectionInflight.delete(key);
    }
  }
}

/* Wipe everything - used when the session identity changes (impersonation). */
export function invalidateAllCollections(): void {
  collectionCache.clear();
  collectionInflight.clear();
}

export const api = {
  /* Fetch a full collection (no pagination params -> the API returns the whole set;
     this backend does not paginate unless asked, and asking truncates - see
     useResource.ts). Cached per URL; pass `fresh` to bypass, e.g. an explicit Refresh. */
  async list<T = ApiRecord>(
    resourcePath: string,
    params?: Record<string, string | number>,
    opts?: { fresh?: boolean }
  ): Promise<NormalizedList<T>> {
    const url = new URL(withTrailingSlash(buildUrl(resourcePath)), window.location.origin);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    }
    const key = url.pathname + url.search;

    const fetchNow = (): Promise<NormalizedList<T>> => {
      const p = request<unknown>(key)
        .then((raw) => {
          const normalized = normalizeList<T>(raw);
          collectionCache.set(key, { data: normalized as NormalizedList<unknown>, ts: Date.now() });
          return normalized;
        })
        .finally(() => {
          collectionInflight.delete(key);
        });
      collectionInflight.set(key, p as Promise<NormalizedList<unknown>>);
      return p;
    };

    if (opts?.fresh) {
      collectionCache.delete(key);
      return fetchNow();
    }

    const hit = collectionCache.get(key);
    if (hit) {
      // Serve immediately; refresh behind the scenes when the entry has aged out.
      // The revalidation error is swallowed on purpose - the caller already has data
      // and an unhandled rejection here would surface as a spurious failure.
      if (Date.now() - hit.ts > COLLECTION_TTL_MS && !collectionInflight.has(key)) {
        fetchNow().catch(() => undefined);
      }
      return hit.data as NormalizedList<T>;
    }

    const pending = collectionInflight.get(key);
    if (pending) return pending as Promise<NormalizedList<T>>;

    return fetchNow();
  },

  // Fetch a single record by id/uuid.
  async detail<T = ApiRecord>(resourcePath: string, id: string | number): Promise<T> {
    const url = withTrailingSlash(`${buildUrl(resourcePath)}/${id}`);
    return request<T>(url);
  },

  async create<T = ApiRecord>(resourcePath: string, payload: ApiRecord): Promise<T> {
    const url = withTrailingSlash(buildUrl(resourcePath));
    const res = await request<T>(url, { method: 'POST', body: JSON.stringify(payload) });
    invalidateCollections(resourcePath);
    return res;
  },

  // Legacy admin uses PUT for the master-modal save (see api/admin-api.js update:{method:'PUT'}).
  async update<T = ApiRecord>(resourcePath: string, id: string | number, payload: ApiRecord): Promise<T> {
    const url = withTrailingSlash(`${buildUrl(resourcePath)}/${id}`);
    const res = await request<T>(url, { method: 'PUT', body: JSON.stringify(payload) });
    invalidateCollections(resourcePath);
    return res;
  },

  /* Partial update. The generic engine PUTs whole records, but resources that carry
     an uploaded file must PATCH - see GenericListPage.handleSubmit. */
  async patch<T = ApiRecord>(resourcePath: string, id: string | number, payload: ApiRecord): Promise<T> {
    const url = withTrailingSlash(`${buildUrl(resourcePath)}/${id}`);
    const res = await request<T>(url, { method: 'PATCH', body: JSON.stringify(payload) });
    invalidateCollections(resourcePath);
    return res;
  },

  /* DELETE a path the API itself supplied (e.g. user.ticket_user.url), already
     reduced to a local path so it goes through the proxy. */
  async removeAbsolute(absolutePath: string): Promise<void> {
    await request<unknown>(withTrailingSlash(absolutePath), { method: 'DELETE' });
  },

  async remove(resourcePath: string, id: string | number): Promise<void> {
    invalidateCollections(resourcePath);
    const url = withTrailingSlash(`${buildUrl(resourcePath)}/${id}`);
    await request<void>(url, { method: 'DELETE' });
  },

  // Some admin tools live OUTSIDE the /rest namespace (/func/*, /tools/*, /hijack/*).
  // These helpers take an absolute path and bypass the /rest base entirely.
  async rawGet<T = unknown>(absolutePath: string): Promise<T> {
    return request<T>(withTrailingSlash(absolutePath));
  },

  async rawPost<T = unknown>(absolutePath: string, payload: ApiRecord = {}): Promise<T> {
    return request<T>(withTrailingSlash(absolutePath), { method: 'POST', body: JSON.stringify(payload) });
  },

  // POST to an absolute path whose SUCCESS response is plain text, not JSON.
  // `request` deliberately throws on a non-JSON 200 (that is how a static server
  // answering in the API's place is caught), but a few Django endpoints answer
  // with text by design - change_own_password is posted with responseType 'text'
  // in the old portal - so those need their own path through the client.
  /* PUT to a path outside /rest (the Salesforce bridge is mounted at /salesforce). */
  async putRaw<T = unknown>(absolutePath: string, payload: ApiRecord = {}): Promise<T> {
    return request<T>(withTrailingSlash(absolutePath), { method: 'PUT', body: JSON.stringify(payload) });
  },

  async postTextResponse(absolutePath: string, payload: ApiRecord = {}): Promise<string> {
    const res = await fetch(withTrailingSlash(absolutePath), {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'text/plain, application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (!res.ok) {
      let body: unknown = text;
      try {
        body = JSON.parse(text);
      } catch {
        /* keep the raw text - these endpoints report errors as a plain string */
      }
      throw new ApiError(`Request failed: ${res.status} ${res.statusText}`, res.status, body);
    }
    return text;
  },

  /* Upload a file as multipart/form-data.
     `request` force-sets Content-Type: application/json whenever a body is present,
     which makes it unusable for a file upload - the browser must set the multipart
     boundary itself. The legacy importer posts exactly one part, field `excel_file`
     (controllers/tools.js ImporterController via ng-file-upload). */
  async postFile<T = unknown>(absolutePath: string, fieldName: string, file: File): Promise<T> {
    const form = new FormData();
    form.append(fieldName, file);
    const res = await fetch(withTrailingSlash(absolutePath), {
      method: 'POST',
      credentials: 'include',
      body: form, // no Content-Type header on purpose
    });
    const body = await parseBody(res);
    if (!res.ok) {
      throw new ApiError(`Upload failed: ${res.status} ${res.statusText}`, res.status, body === NOT_JSON ? null : body);
    }
    if (body === NOT_JSON) {
      throw new ApiError(`Expected JSON from ${absolutePath} but got something else.`, res.status, null);
    }
    return body as T;
  },

  /* Save a record that carries one or more File values.
     Django REST parses multipart the same way it parses JSON, so the whole record
     goes in as form fields with the File parts alongside - this is what the legacy
     panel's ng-file-upload Upload.upload({data: formData}) produced. Booleans have
     to be spelled out because FormData stringifies everything. */
  async saveMultipart<T = ApiRecord>(
    resourcePath: string,
    id: string | number | null,
    payload: ApiRecord,
    method: 'POST' | 'PATCH' | 'PUT' = 'POST'
  ): Promise<T> {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (v instanceof File) form.append(k, v);
      else if (typeof v === 'boolean') form.append(k, v ? 'true' : 'false');
      else if (typeof v === 'object') form.append(k, JSON.stringify(v));
      else form.append(k, String(v));
    });
    const base = buildUrl(resourcePath);
    const path = id === null || id === undefined ? base : `${base}/${id}`;
    const res = await fetch(withTrailingSlash(path), {
      method,
      credentials: 'include',
      // The proxy attaches Origin / Referer / X-CSRFToken for writes, so no CSRF
      // header is set here - same as postFile above.
      body: form, // no Content-Type header on purpose - the browser sets the boundary
    });
    const body = await parseBody(res);
    if (!res.ok) {
      throw new ApiError(`Upload failed: ${res.status} ${res.statusText}`, res.status, body === NOT_JSON ? null : body);
    }
    invalidateCollections(resourcePath);
    return (body === NOT_JSON ? {} : body) as T;
  },

  /* Options for a picker. Most lookups are plain lists, but some endpoints answer
     with an object holding several lists - /rest/org/{id}/get_groups_roles/ returns
     { roles, groups } and feeds two different fields - so `resultKey` selects one. */
  async options<T = ApiRecord>(
    resourcePath: string,
    resultKey?: string,
    params?: Record<string, string | number>
  ): Promise<T[]> {
    if (!resultKey) {
      const { items } = await api.list<T>(resourcePath, params);
      return items;
    }
    const raw = await api.get<Record<string, unknown>>(resourcePath, params);
    const arr = raw && typeof raw === 'object' ? raw[resultKey] : null;
    return Array.isArray(arr) ? (arr as T[]) : [];
  },

  // Raw GET for bespoke endpoints (dashboard aggregates, lookups).
  async get<T = unknown>(resourcePath: string, params?: Record<string, string | number>): Promise<T> {
    const url = new URL(withTrailingSlash(buildUrl(resourcePath)), window.location.origin);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    }
    return request<T>(url.pathname + url.search);
  },
};
