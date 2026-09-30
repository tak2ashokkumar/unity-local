import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiError, API_BASE } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { scalarize } from '../utils/format';
import { Card, Button, Badge, LoadingBlock, EmptyState, IconAction } from '../components/ui/primitives';
import { FormModal } from '../components/ui/Overlay';
import { Typeahead } from '../components/forms/Typeahead';
import { Pagination } from '../components/ui/Pagination';
import { Icon } from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';

/*
 * Activity Log - a filtered audit report, not a CRUD list.
 *
 * Ported from AdminAuditLogController (controllers/cloud.js:2588) +
 * templates/activity_log.html.
 *
 * The date range is NOT optional. The legacy page always sends start_date and
 * end_date (defaulting to the last 7 days) and every filter re-issues the same
 * call. Running this endpoint unfiltered is what broke the generic-list version:
 * GET /rest/activity_logs/ with no params does not return - it was still hanging
 * after 25s against SF, so the page sat on "Loading activity log..." forever.
 *
 *   GET /rest/activity_logs/?start_date&end_date[&user_organization][&customer_log][&filter_logins=3]
 *   Export: the same query string against /rest/activity_logs/download/
 *
 * The Changes column is resolved entirely client-side: each row already carries a
 * `changes` JSON STRING, so the diff dialog just parses it. There is no diff
 * endpoint. Legacy parsed it unguarded; this one tolerates malformed values.
 */
type LogScope = 'all_logs' | 'all_logins' | 'customer_logs';

const SCOPES: { key: LogScope; label: string }[] = [
  { key: 'all_logs', label: 'All' },
  { key: 'all_logins', label: 'Login Activity (All customers)' },
  { key: 'customer_logs', label: 'Customer Only' },
];

// 0 / 1 / 2 are django-auditlog's action codes (change_action_to_text in the legacy
// controller). Live data may also carry human strings, so unknown values pass through.
const ACTIONS: Record<string, { label: string; tone: 'success' | 'info' | 'danger' }> = {
  '0': { label: 'CREATED', tone: 'success' },
  '1': { label: 'UPDATED', tone: 'info' },
  '2': { label: 'DELETED', tone: 'danger' },
};

/* Local ISO-8601 WITH offset, e.g. 2026-08-14T00:00:00+05:30 - what moment().format()
   produced for the legacy page. Sending UTC here would silently shift the window. */
function localIso(d: Date): string {
  const pad = (n: number, w = 2) => String(Math.abs(Math.floor(n))).padStart(w, '0');
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(off / 60)}:${pad(off % 60)}`
  );
}

function toDateInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfDay(value: string): Date {
  const d = new Date(`${value}T00:00:00`);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(value: string): Date {
  const d = new Date(`${value}T00:00:00`);
  d.setHours(23, 59, 59, 0);
  return d;
}

function actorLabel(row: ApiRecord): string {
  const actor = row.actor as ApiRecord | null;
  if (actor && actor.email) return String(actor.email);
  // Legacy: a null actor on a user2 record shows the record itself, else "System".
  const ct = row.content_type as ApiRecord | undefined;
  if (ct && ct.app_label === 'user2') return scalarize(row.object_repr);
  return 'System';
}

function modelLabel(row: ApiRecord): string {
  const ct = row.content_type as ApiRecord | undefined;
  if (!ct) return '-';
  return [ct.app_label, ct.model].filter(Boolean).join('.') || scalarize(ct.readable_model_name);
}

function formatTimestamp(v: unknown): string {
  if (!v) return 'N/A';
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

/* `changes` is a JSON string of { field: [before, after] }. */
function parseChanges(raw: unknown): { field: string; before: string; after: string }[] | null {
  if (!raw) return null;
  let obj: unknown = raw;
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!obj || typeof obj !== 'object') return null;
  return Object.entries(obj as Record<string, unknown>).map(([field, pair]) => {
    const arr = Array.isArray(pair) ? pair : [null, pair];
    return { field, before: scalarize(arr[0]), after: scalarize(arr[1]) };
  });
}

export function ActivityLogPage() {
  const toast = useToast();
  const today = useMemo(() => new Date(), []);
  const weekAgo = useMemo(() => new Date(Date.now() - 7 * 864e5), []);

  const [from, setFrom] = useState(toDateInput(weekAgo));
  const [to, setTo] = useState(toDateInput(today));
  const [org, setOrg] = useState<ApiRecord | null>(null);
  const [scope, setScope] = useState<LogScope>('all_logs');

  const [rows, setRows] = useState<ApiRecord[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [diff, setDiff] = useState<ApiRecord | null>(null);

  // Exactly the legacy parameter set.
  const params = useCallback((): Record<string, string | number> => {
    const p: Record<string, string | number> = {
      start_date: localIso(startOfDay(from)),
      end_date: localIso(endOfDay(to)),
    };
    if (org?.id) {
      p.user_organization = String(org.id);
      if (scope === 'customer_logs') p.customer_log = String(org.id);
    }
    if (scope === 'all_logins') p.filter_logins = 3;
    return p;
  }, [from, to, org, scope]);

  /*
   * Bounded wait. This endpoint is slow on real data - a 1-day window measured
   * 43.6s against SF before failing - and an unbounded spinner just looks hung.
   * Losing the race surfaces an actionable message instead.
   */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const TIMEOUT_MS = 20000;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
    }, TIMEOUT_MS);
    try {
      const result = await Promise.race([
        api.list<ApiRecord>('activity_logs', params()),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`The activity log did not respond within ${TIMEOUT_MS / 1000}s. Narrow the date range and try again.`)),
            TIMEOUT_MS
          )
        ),
      ]);
      setRows(result.items);
      setCount(result.count);
      setPage(1);
    } catch (err) {
      setRows([]);
      setCount(0);
      setError(
        timedOut && !(err instanceof ApiError)
          ? (err as Error).message
          : err instanceof ApiError
          ? err.message
          : 'Could not load the activity log.'
      );
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportUrl = () => {
    const qs = new URLSearchParams();
    Object.entries(params()).forEach(([k, v]) => qs.set(k, String(v)));
    return `${API_BASE}/activity_logs/download/?${qs.toString()}`;
  };

  const onExport = () => {
    // Same query string as the table, per the legacy Export anchor.
    window.open(exportUrl(), '_blank', 'noopener');
    toast.info('Export requested. The download opens in a new tab.', 'Export');
  };

  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const changes = diff ? parseChanges(diff.changes) : null;

  return (
    <div className="content-fade">
      <Card style={{ marginBottom: 18 }}>
        <div className="toolbar" style={{ flexWrap: 'wrap', gap: 14 }}>
          <div className="field" style={{ minWidth: 220, marginBottom: 0 }}>
            <label>Organization</label>
            <Typeahead
              value={org}
              lookupUri="fast/org"
              accessor="name"
              placeholder="Type org to search..."
              onChange={setOrg}
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>From</label>
            <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>To</label>
            <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Log type</label>
            <select value={scope} onChange={(e) => setScope(e.target.value as LogScope)}>
              {SCOPES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="toolbar-spacer" />
          <Button variant="primary" icon="search" onClick={load} loading={loading}>
            Apply
          </Button>
          <Button variant="default" icon="download" onClick={onExport} disabled={loading}>
            Export
          </Button>
        </div>
        {scope === 'customer_logs' && !org && (
          <div style={{ padding: '0 18px 14px', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
            Pick an organization - without one, &quot;Customer Only&quot; returns the same rows as &quot;All&quot;.
          </div>
        )}
      </Card>

      <Card>
        <div className="toolbar">
          <span className="toolbar-count">
            {count} {count === 1 ? 'entry' : 'entries'}
          </span>
          <div className="toolbar-spacer" />
        </div>

        {loading ? (
          <LoadingBlock label="Loading activity log..." />
        ) : error ? (
          <EmptyState
            icon="alert-triangle"
            title="Couldn't load data"
            message={error}
            action={
              <Button variant="default" icon="refresh-cw" onClick={load}>
                Retry
              </Button>
            }
          />
        ) : rows.length === 0 ? (
          <EmptyState icon="inbox" title="No records to display" message="Try a wider date range." />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Model Name</th>
                    <th>Object</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Time</th>
                    <th className="col-actions">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row, i) => {
                    const a = ACTIONS[String(row.action)];
                    const has = !!parseChanges(row.changes)?.length;
                    return (
                      <tr key={String(row.id ?? i)}>
                        <td title={modelLabel(row)}>{modelLabel(row)}</td>
                        <td title={scalarize(row.object_repr)}>{scalarize(row.object_repr) || '-'}</td>
                        <td title={actorLabel(row)}>{actorLabel(row)}</td>
                        <td>
                          {a ? <Badge tone={a.tone}>{a.label}</Badge> : scalarize(row.action) || '-'}
                        </td>
                        <td className="cell-mono">{formatTimestamp(row.timestamp)}</td>
                        <td className="col-actions">
                          {has ? (
                            <IconAction icon="info" title="View changes" onClick={() => setDiff(row)} />
                          ) : (
                            <span className="na">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              pageSize={pageSize}
              total={rows.length}
              onPage={setPage}
              onPageSize={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          </>
        )}
      </Card>

      {diff && (
        <FormModal
          title="Changes"
          subtitle={`${modelLabel(diff)} - ${scalarize(diff.object_repr)}`}
          onClose={() => setDiff(null)}
        >
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            {changes && changes.length ? (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Before</th>
                      <th>After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((c) => (
                      <tr key={c.field}>
                        <td>{c.field}</td>
                        <td className="cell-mono">{c.before || <span className="na">-</span>}</td>
                        <td className="cell-mono">{c.after || <span className="na">-</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: 20, color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>
                <Icon name="info" size={15} /> This entry records no field-level changes.
              </div>
            )}
          </div>
          <div className="form-actions">
            <Button variant="default" onClick={() => setDiff(null)}>
              Close
            </Button>
          </div>
        </FormModal>
      )}
    </div>
  );
}
