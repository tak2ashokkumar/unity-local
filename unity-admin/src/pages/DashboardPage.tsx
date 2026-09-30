import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useList } from '../data/useResource';
import { ApiRecord } from '../data/types';
import { fkText, formatDate, scalarize } from '../utils/format';
import { Button, Card, CardHead, IconAction, Spinner, Badge, BadgeTone } from '../components/ui/primitives';
import { ConfirmDialog, FormModal } from '../components/ui/Overlay';
import { useToast } from '../components/ui/Toast';
import { api } from '../data/apiClient';
import { Icon } from '../components/ui/Icon';
import './dashboard.css';

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

interface Seg {
  value: number;
  cls: string;
  label: string;
}

function StackedBar({ segments }: { segments: Seg[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <>
      <div className="stacked-bar">
        {total === 0 ? (
          <div className="stacked-seg" style={{ width: '100%', background: 'var(--slate-100)' }} />
        ) : (
          segments.map((s, i) => (
            <div key={i} className={`stacked-seg ${s.cls}`} style={{ width: `${(s.value / total) * 100}%` }} title={`${s.label}: ${s.value}`} />
          ))
        )}
      </div>
      <div className="stat-legend">
        {segments.map((s, i) => (
          <span className="lg" key={i}>
            <span className="dot" style={{ background: `var(--${s.cls === 'seg-good' ? 'success' : s.cls === 'seg-warn' ? 'warning' : s.cls === 'seg-info' ? 'info' : 'danger'})` }} />
            {s.label} <strong>{s.value}</strong>
          </span>
        ))}
      </div>
    </>
  );
}

function StatLine({ label, segments }: { label: string; segments: Seg[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <div className="stat-line">
      <div className="stat-line-head">
        <span className="sl-label">{label}</span>
        <span className="sl-total">{total || '-'}</span>
      </div>
      <StackedBar segments={segments} />
    </div>
  );
}

function KpiCard({
  icon,
  value,
  label,
  to,
  accent,
  accentDark,
  loading,
  error,
}: {
  icon: string;
  value: ReactNode;
  label: string;
  to: string;
  accent: string;
  accentDark: string;
  loading?: boolean;
  error?: string | null;
}) {
  const accentStyle = { '--kpi-accent': accent, '--kpi-accent-dark': accentDark } as CSSProperties;
  return (
    <div className="kpi-card" style={accentStyle} title={error ? String(error) : undefined}>
      <div className="kpi-icon">
        <Icon name={icon} size={24} />
      </div>
      <div className="kpi-meta">
        <div className="kpi-value" style={error ? { color: 'var(--danger)', fontSize: 'var(--fs-md)' } : undefined}>
          {loading ? <Spinner /> : error ? 'Error' : value}
        </div>
        <div className="kpi-label">{label}</div>
        <Link className="kpi-link" to={to}>
          View all <Icon name="arrow-right" size={12} />
        </Link>
      </div>
    </div>
  );
}

const STATUS_TONE: Record<string, BadgeTone> = {
  open: 'info',
  pending: 'warning',
  solved: 'success',
  closed: 'neutral',
  new: 'brand',
  high: 'danger',
  urgent: 'danger',
  normal: 'info',
  low: 'neutral',
};

function toneFor(v: unknown): BadgeTone {
  return STATUS_TONE[String(v).toLowerCase()] || 'neutral';
}

const MAINT_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  F: { label: 'Future Plan', tone: 'info' },
  O: { label: 'Ongoing', tone: 'warning' },
  C: { label: 'Complete', tone: 'success' },
};

/* Pin a customer onto the dashboard.
   Legacy: AddCustomerWidgetModalController (uladmincontroller.js:294) POSTs the picked
   organization object straight to /rest/pinned_organization/, and popCust() DELETEs
   /rest/pinned_organization/{id}. Both actions were missing from the port, so the widget
   was read-only and there was no way to add or remove a customer. */
function PinCustomerModal({ onClose, onPinned }: { onClose: () => void; onPinned: () => void }) {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<ApiRecord[]>([]);
  const [org, setOrg] = useState<ApiRecord | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    if (query.trim().length < 2) {
      setOptions([]);
      return;
    }
    const s = ++seq.current;
    const t = window.setTimeout(() => {
      api
        .list<ApiRecord>('fast/org', { search: query.trim() })
        .then((res) => {
          if (s === seq.current) setOptions(res.items.slice(0, 20));
        })
        .catch(() => {
          if (s === seq.current) setOptions([]);
        });
    }, 250);
    return () => window.clearTimeout(t);
  }, [query]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org || saving) return;
    setSaving(true);
    try {
      await api.create('pinned_organization', org);
      toast.success(`Pinned ${scalarize(org.name)} to the dashboard.`, 'Pinned');
      onPinned();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not pin this customer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal title="Add Customer Widget" subtitle="Pin a customer's health summary to the dashboard." onClose={onClose}>
      <form className="record-form" onSubmit={submit}>
        <div className="form-grid">
          <div className="field field-full typeahead">
            <label>
              Organization<span className="req">*</span>
            </label>
            <input
              type="text"
              value={query}
              placeholder="Type an organization to search..."
              onChange={(e) => {
                setQuery(e.target.value);
                setOrg(null);
                setShowOptions(true);
              }}
              onFocus={() => setShowOptions(true)}
              onBlur={() => window.setTimeout(() => setShowOptions(false), 150)}
            />
            {showOptions && options.length > 0 && (
              <div className="typeahead-menu">
                {options.map((o) => (
                  <button
                    type="button"
                    key={String(o.id)}
                    className="ta-opt"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setOrg(o);
                      setQuery(scalarize(o.name));
                      setShowOptions(false);
                    }}
                  >
                    {scalarize(o.name)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="form-actions">
          <Button variant="default" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={!org || saving} loading={saving}>
            Confirm
          </Button>
        </div>
      </form>
    </FormModal>
  );
}

export function DashboardPage() {
  const toast = useToast();
  const [pinOpen, setPinOpen] = useState(false);
  const [unpinTarget, setUnpinTarget] = useState<ApiRecord | null>(null);
  const [unpinning, setUnpinning] = useState(false);
  const dc = useList<ApiRecord>('datacenter');
  const priv = useList<ApiRecord>('v3.1/private_cloud');
  const aws = useList<ApiRecord>('v3/aws');
  const azure = useList<ApiRecord>('v3/azure');
  const colo = useList<ApiRecord>('cabinet/get_colocations');
  const pinned = useList<ApiRecord>('pinned_organization');
  const hosts = useList<ApiRecord>('host_monitor');
  const maint = useList<ApiRecord>('v3/mschedules');

  const pubCount = (aws.count || 0) + (azure.count || 0);
  const pubLoading = aws.loading || azure.loading;
  const pubError = aws.error && azure.error ? `${aws.error}; ${azure.error}` : null;

  // Production lists every datacenter and every pinned customer (the card scrolls),
  // so these are not truncated.
  const datacenters = dc.items;
  const customers = pinned.items;

  const confirmUnpin = async () => {
    if (!unpinTarget) return;
    setUnpinning(true);
    try {
      await api.remove('pinned_organization', String(unpinTarget.id));
      toast.success(`Removed ${scalarize(unpinTarget.name)} from the dashboard.`, 'Unpinned');
      pinned.reload();
    } catch {
      toast.error('Could not remove this customer widget.');
    } finally {
      setUnpinning(false);
      setUnpinTarget(null);
    }
  };

  return (
    <div className="content-fade">
      {/* KPI row */}
      <div className="kpi-row">
        <KpiCard icon="database" value={dc.count} label="Data Centers" to="/datacenter" accent="#279b6c" accentDark="#1a6647" loading={dc.loading} error={dc.error} />
        <KpiCard icon="cloud" value={priv.count} label="Private Clouds" to="/cloud" accent="#3d9bc4" accentDark="#256a89" loading={priv.loading} error={priv.error} />
        <KpiCard icon="box" value={pubCount} label="Public Clouds" to="/aws-dashboard" accent="#e8a13a" accentDark="#b97d1e" loading={pubLoading} error={pubError} />
        <KpiCard icon="building-2" value={colo.count} label="Colocations" to="/cabinet" accent="#7a6ff0" accentDark="#5849c4" loading={colo.loading} error={colo.error} />
      </div>

      {/* Datacenters + Pinned customers */}
      <div className="dash-cols-dc" style={{ marginBottom: 18 }}>
        <Card>
          <CardHead title="Datacenter Health" icon="database" action={<Badge tone="brand">{dc.count} sites</Badge>} />
          {dc.loading ? (
            <div className="dash-card-loading">
              <Spinner large />
            </div>
          ) : dc.error ? (
            <div className="dash-table-empty" style={{ color: 'var(--danger)', padding: '24px 20px' }}>
              <div>Failed to load datacenter data: {dc.error}</div>
              <div style={{ marginTop: 10 }}>
                <Button variant="default" size="sm" icon="refresh-cw" onClick={() => dc.reload()}>
                  Retry
                </Button>
              </div>
            </div>
          ) : datacenters.length === 0 ? (
            <div className="dash-table-empty">No datacenter data available.</div>
          ) : (
            <div className="widget-scroll widget-grid-2col">
              {datacenters.map((d, i) => (
                <div className="mini-widget" key={String(d.id ?? i)}>
                  <div className="mini-widget-head">
                    <span className="mw-title">
                      <span className="mw-ic">
                        <Icon name="database" size={15} />
                      </span>
                      {String(d.name || 'Datacenter')}
                      {d.location != null && d.location !== '' && (
                        <span className="u-faint" style={{ fontWeight: 400 }}>
                          &nbsp;/ {fkText(d.location)}
                        </span>
                      )}
                    </span>
                    <span className="mw-throughput">{num(d.throughput)} Mbps</span>
                  </div>
                  <StatLine
                    label="Alerts"
                    segments={[
                      { value: num((d.alerts as ApiRecord)?.normal), cls: 'seg-good', label: 'Normal' },
                      { value: num((d.alerts as ApiRecord)?.warning), cls: 'seg-warn', label: 'Warning' },
                      { value: num((d.alerts as ApiRecord)?.critical), cls: 'seg-bad', label: 'Critical' },
                    ]}
                  />
                  <StatLine
                    label="Connectivity"
                    segments={[
                      { value: num((d.connectivity as ApiRecord)?.connected), cls: 'seg-good', label: 'Connected' },
                      { value: num((d.connectivity as ApiRecord)?.retrying), cls: 'seg-warn', label: 'Retrying' },
                      { value: num((d.connectivity as ApiRecord)?.disconnected), cls: 'seg-bad', label: 'Down' },
                    ]}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHead
            title="Pinned Customers"
            icon="pin"
            action={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Badge tone="brand">{pinned.count}</Badge>
                <Button variant="default" size="sm" icon="plus" onClick={() => setPinOpen(true)}>
                  Pin
                </Button>
              </div>
            }
          />
          {pinned.loading ? (
            <div className="dash-card-loading">
              <Spinner large />
            </div>
          ) : pinned.error ? (
            <div className="dash-table-empty" style={{ color: 'var(--danger)', padding: '24px 20px' }}>
              <div>Failed to load pinned customers: {pinned.error}</div>
              <div style={{ marginTop: 10 }}>
                <Button variant="default" size="sm" icon="refresh-cw" onClick={() => pinned.reload()}>
                  Retry
                </Button>
              </div>
            </div>
          ) : customers.length === 0 ? (
            <div className="dash-table-empty">No pinned customers.</div>
          ) : (
            <div className="widget-scroll">
              {customers.map((c, i) => (
                <div className="mini-widget" key={String(c.id ?? i)}>
                  <div className="mini-widget-head">
                    <span className="mw-title">
                      <span className="mw-ic">
                        <Icon name="building" size={15} />
                      </span>
                      {/* Legacy linked the pinned card to that customer's dashboard. */}
                      <Link className="cell-link" to={`/customer-dashboard/${String(c.id ?? '')}`}>
                        {String(c.name || 'Customer')}
                      </Link>
                    </span>
                    <span className="mw-throughput">
                      {num(c.throughput)} Mbps
                      <IconAction icon="x" title={`Unpin ${String(c.name || 'customer')}`} danger onClick={() => setUnpinTarget(c)} />
                    </span>
                  </div>
                  <StatLine
                    label="Hosts"
                    segments={[
                      { value: num((c.host_stats as ApiRecord)?.normal), cls: 'seg-good', label: 'Up' },
                      { value: num((c.host_stats as ApiRecord)?.warning), cls: 'seg-warn', label: 'Warn' },
                      { value: num((c.host_stats as ApiRecord)?.critical), cls: 'seg-bad', label: 'Down' },
                    ]}
                  />
                  <StatLine
                    label="Services"
                    segments={[
                      { value: num((c.service_stats as ApiRecord)?.normal), cls: 'seg-good', label: 'OK' },
                      { value: num((c.service_stats as ApiRecord)?.warning), cls: 'seg-warn', label: 'Warn' },
                      { value: num((c.service_stats as ApiRecord)?.critical), cls: 'seg-bad', label: 'Crit' },
                    ]}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Host alerts + Maintenance events */}
      <div className="dash-cols">
        <Card>
          <CardHead
            title="Host Alerts"
            icon="activity"
            action={
              <Link className="cell-link" to="/integ/net" style={{ fontSize: 'var(--fs-xs)' }}>
                View all
              </Link>
            }
          />
          <MiniTable
            loading={hosts.loading}
            error={hosts.error}
            onRetry={() => hosts.reload()}
            rows={hosts.items.slice(0, 6)}
            empty="No host alerts."
            columns={[
              { header: 'Instance', render: (r) => scalarize(r.instance ?? r.name ?? r.host ?? '-') },
              { header: 'State', render: (r) => <Badge tone={toneFor(r.last_known_state ?? r.state)}>{scalarize(r.last_known_state ?? r.state ?? 'Unknown')}</Badge> },
              { header: 'Last Checked', mono: true, render: (r) => formatDate(r.last_checked ?? r.last_check) || '-' },
            ]}
          />
        </Card>

        <Card>
          <CardHead
            title="Maintenance Events"
            icon="calendar"
            action={
              <Link className="cell-link" to="/maintenance-schedules" style={{ fontSize: 'var(--fs-xs)' }}>
                View all
              </Link>
            }
          />
          <MiniTable
            loading={maint.loading}
            error={maint.error}
            onRetry={() => maint.reload()}
            rows={maint.items.slice(0, 8)}
            empty="No scheduled maintenance."
            columns={[
              { header: 'Description', render: (r) => scalarize(r.description ?? r.name ?? '-') },
              {
                header: 'Status',
                render: (r) => {
                  const s = MAINT_STATUS[String(r.status)] || { label: scalarize(r.status ?? '-'), tone: 'neutral' as BadgeTone };
                  return <Badge tone={s.tone}>{s.label}</Badge>;
                },
              },
              { header: 'Datacenter', render: (r) => fkText(r.colo_cloud ?? r.datacenter) || '-' },
              { header: 'Start', mono: true, render: (r) => formatDate(r.start_date) || '-' },
              { header: 'End', mono: true, render: (r) => formatDate(r.end_date) || '-' },
            ]}
          />
        </Card>
      </div>

      {pinOpen && (
        <PinCustomerModal
          onClose={() => setPinOpen(false)}
          onPinned={() => {
            setPinOpen(false);
            pinned.reload();
          }}
        />
      )}

      {unpinTarget && (
        <ConfirmDialog
          title="Remove customer widget?"
          message={
            <>
              Remove <strong>{scalarize(unpinTarget.name)}</strong> from the dashboard? The customer itself is not
              affected.
            </>
          }
          loading={unpinning}
          onConfirm={confirmUnpin}
          onCancel={() => setUnpinTarget(null)}
        />
      )}
    </div>
  );
}

interface MiniColumn {
  header: string;
  render: (row: ApiRecord) => ReactNode;
  mono?: boolean;
}

function MiniTable({
  rows,
  columns,
  loading,
  error,
  onRetry,
  empty,
}: {
  rows: ApiRecord[];
  columns: MiniColumn[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  empty: string;
}) {
  if (loading) {
    return (
      <div className="dash-card-loading">
        <Spinner />
      </div>
    );
  }
  if (error) {
    return (
      <div className="dash-table-empty" style={{ color: 'var(--danger)', padding: '24px 20px' }}>
        <div>Failed to load data: {error}</div>
        {onRetry && (
          <div style={{ marginTop: 10 }}>
            <Button variant="default" size="sm" icon="refresh-cw" onClick={onRetry}>
              Retry
            </Button>
          </div>
        )}
      </div>
    );
  }
  if (rows.length === 0) {
    return <div className="dash-table-empty">{empty}</div>;
  }
  return (
    <div className="table-wrap">
      <table className="mini-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.header}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={String(row.id ?? row.uuid ?? i)}>
              {columns.map((c) => (
                <td key={c.header} className={c.mono ? 'mt-mono' : undefined}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
