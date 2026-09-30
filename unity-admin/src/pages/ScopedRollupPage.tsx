import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { formatDate, scalarize } from '../utils/format';
import { Badge, Button, Card, CardHead, EmptyState, LoadingBlock } from '../components/ui/primitives';
import './dashboard.css';

/*
 * The scoped health roll-ups behind the dashboard: one page shape, two scopes.
 *
 *   customer  (CustomerDasboardController, controllers/v3/ul-admin/customerdashboardcontroller.js)
 *     datacenter/{org}/get_customer_datacenters/
 *     cabinet/{org}/get_customer_colocations/
 *     v3/private_cloud/{org}/get_customer_private_clouds/
 *     v3/public_cloud/{org}/get_customer_public_clouds/
 *     v3/schedules/{org}/impact/                     maintenance affecting them
 *
 *   datacenter (DatacenterControllerv3, controllers/v3/ul-admin/datacentercontroller.js)
 *     v3/private_cloud/{dc}/get_datacenter_private_clouds/
 *     v3/public_cloud/{dc}/get_datacenter_public_clouds/
 *     cabinet/{dc}/get_datacenter_colocations/
 *     datacenter/{dc}/get_datacenters_widgets/       the signed-vs-provisioned counters
 *
 * Each roll-up answers { info: [ ... ] } where every entry carries host_stats and
 * service_stats in the same normal/warning/critical shape the dashboard already renders.
 * Several of these endpoints return 500 on the SF deployment; each panel fails on its own
 * and says so rather than blanking the page.
 */

type Scope = 'customer' | 'datacenter';

interface Panel {
  key: string;
  label: string;
  icon: string;
  uri: (id: string) => string;
  to?: string;
}

const CUSTOMER_PANELS: Panel[] = [
  { key: 'datacenters', label: 'Datacenters', icon: 'database', uri: (id) => `datacenter/${id}/get_customer_datacenters`, to: '/datacenter/' },
  { key: 'colocations', label: 'Colocations', icon: 'building-2', uri: (id) => `cabinet/${id}/get_customer_colocations` },
  { key: 'private', label: 'Private Clouds', icon: 'cloud', uri: (id) => `v3/private_cloud/${id}/get_customer_private_clouds` },
  { key: 'public', label: 'Public Clouds', icon: 'box', uri: (id) => `v3/public_cloud/${id}/get_customer_public_clouds` },
];

const DATACENTER_PANELS: Panel[] = [
  { key: 'private', label: 'Private Clouds', icon: 'cloud', uri: (id) => `v3/private_cloud/${id}/get_datacenter_private_clouds` },
  { key: 'public', label: 'Public Clouds', icon: 'box', uri: (id) => `v3/public_cloud/${id}/get_datacenter_public_clouds` },
  { key: 'colocations', label: 'Colocations', icon: 'building-2', uri: (id) => `cabinet/${id}/get_datacenter_colocations` },
];

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const info = (v: unknown): ApiRecord[] => {
  if (Array.isArray(v)) return v as ApiRecord[];
  if (v && typeof v === 'object') {
    const o = v as ApiRecord;
    if (Array.isArray(o.info)) return o.info as ApiRecord[];
    if (Array.isArray(o.results)) return o.results as ApiRecord[];
  }
  return [];
};

function StatBar({ stats }: { stats: unknown }) {
  const o = (stats && typeof stats === 'object' ? stats : {}) as ApiRecord;
  const segs = [
    { v: num(o.normal), cls: 'seg-good' },
    { v: num(o.warning), cls: 'seg-warn' },
    { v: num(o.critical), cls: 'seg-bad' },
  ];
  const total = segs.reduce((s, x) => s + x.v, 0);
  if (total === 0) return <span className="u-faint">-</span>;
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className="stacked-bar" style={{ width: 90 }}>
        {segs.filter((s) => s.v > 0).map((s, i) => (
          <span key={i} className={`stacked-seg ${s.cls}`} style={{ width: `${(s.v / total) * 100}%` }} />
        ))}
      </span>
      <span className="mono" style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)' }}>
        {segs[0].v}/{segs[1].v}/{segs[2].v}
      </span>
    </span>
  );
}

export function ScopedRollupPage({ scope }: { scope: Scope }) {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const panels = scope === 'customer' ? CUSTOMER_PANELS : DATACENTER_PANELS;
  const [data, setData] = useState<Record<string, ApiRecord[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [subject, setSubject] = useState<ApiRecord | null>(null);
  const [widgets, setWidgets] = useState<ApiRecord | null>(null);
  const [schedules, setSchedules] = useState<ApiRecord[]>([]);
  const [schedulesError, setSchedulesError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setData({});
    setErrors({});
    setSchedulesError(null);
    try {
      setSubject(await api.detail<ApiRecord>(scope === 'customer' ? 'org' : 'datacenter', id).catch(() => null));

      await Promise.all(
        panels.map(async (p) => {
          try {
            const res = await api.get<unknown>(p.uri(id));
            setData((prev) => ({ ...prev, [p.key]: info(res) }));
          } catch (err) {
            setErrors((prev) => ({ ...prev, [p.key]: err instanceof Error ? err.message : 'Unavailable' }));
          }
        })
      );

      if (scope === 'datacenter') {
        try {
          const w = await api.get<ApiRecord>(`datacenter/${id}/get_datacenters_widgets`);
          setWidgets((w?.info as ApiRecord) || w);
        } catch {
          setWidgets(null);
        }
      } else {
        try {
          const s = await api.get<unknown>(`v3/schedules/${id}/impact`);
          setSchedules(info(s));
        } catch (err) {
          setSchedulesError(err instanceof Error ? err.message : 'Could not load maintenance impact.');
          setSchedules([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [id, scope, panels]);

  useEffect(() => {
    load();
  }, [load]);

  const title = scalarize(subject?.name) || (scope === 'customer' ? 'Customer' : 'Datacenter');

  return (
    <div className="content-fade">
      <div style={{ marginBottom: 14 }}>
        <Button
          variant="ghost"
          size="sm"
          icon="arrow-left"
          onClick={() => navigate(scope === 'customer' ? '/dashboard' : '/datacenter')}
        >
          {scope === 'customer' ? 'Back to Dashboard' : 'Back to Datacenters'}
        </Button>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <CardHead
          title={title}
          icon={scope === 'customer' ? 'building' : 'database'}
          action={
            scope === 'customer' && subject?.id ? (
              <Link className="cell-link" to={`/org/${String(subject.id)}`} style={{ fontSize: 'var(--fs-xs)' }}>
                Open organization
              </Link>
            ) : undefined
          }
        />
        {scope === 'datacenter' && widgets && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 0 }}>
            {[
              ['Organizations', widgets.organizations],
              ['Hypervisors Signed', widgets.hypervisor_signed],
              ['Hypervisors Provisioned', widgets.hypervisor_provisioned],
              ['VMs Signed', widgets.vm_signed],
              ['VMs Provisioned', widgets.vm_provisioned],
            ].map(([label, value]) => (
              <div key={String(label)} style={{ padding: '14px 20px', borderRight: '1px solid var(--divider)' }}>
                <div style={{ fontSize: 'var(--fs-2xs)', textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text-muted)' }}>
                  {String(label)}
                </div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 600, marginTop: 3 }}>
                  {scalarize(value) || '0'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {loading ? (
        <Card>
          <LoadingBlock label="Loading roll-ups..." />
        </Card>
      ) : (
        panels.map((p) => {
          const rows = data[p.key] || [];
          const err = errors[p.key];
          return (
            <Card key={p.key} style={{ marginBottom: 18 }}>
              <CardHead title={p.label} icon={p.icon} action={<Badge tone="brand">{rows.length}</Badge>} />
              {err ? (
                <EmptyState
                  icon="alert-triangle"
                  title={`${p.label} unavailable`}
                  message={err}
                  action={
                    <Button variant="default" size="sm" icon="refresh-cw" onClick={load}>
                      Retry
                    </Button>
                  }
                />
              ) : rows.length === 0 ? (
                <EmptyState icon={p.icon} title={`No ${p.label.toLowerCase()}`} message="Nothing in this scope." />
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Hosts</th>
                        <th>Services</th>
                        <th className="col-num">Throughput</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={String(r.id ?? i)}>
                          <td>
                            {p.to && r.id != null ? (
                              <Link className="cell-link" to={`${p.to}${String(r.id)}`}>
                                {scalarize(r.name) || '-'}
                              </Link>
                            ) : (
                              scalarize(r.name) || '-'
                            )}
                          </td>
                          <td><StatBar stats={r.host_stats} /></td>
                          <td><StatBar stats={r.service_stats} /></td>
                          <td className="col-num cell-mono">{scalarize(r.throughput) || '0'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          );
        })
      )}

      {scope === 'customer' && (
        <Card>
          <CardHead title="Maintenance Impact" icon="calendar" action={<Badge tone="brand">{schedules.length}</Badge>} />
          {schedulesError ? (
            <EmptyState
              icon="alert-triangle"
              title="Maintenance impact unavailable"
              message={schedulesError}
              action={
                <Button variant="default" size="sm" icon="refresh-cw" onClick={load}>
                  Retry
                </Button>
              }
            />
          ) : schedules.length === 0 ? (
            <EmptyState icon="calendar" title="No maintenance" message="No maintenance affects this customer." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Datacenter</th>
                    <th>Start</th>
                    <th>End</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s, i) => {
                    // Legacy mapped these single-letter codes to words.
                    const label = { C: 'Completed', F: 'Future Plan', O: 'Ongoing' }[String(s.status)] || scalarize(s.status);
                    const tone = s.status === 'O' ? 'warning' : s.status === 'C' ? 'neutral' : 'info';
                    return (
                      <tr key={String(s.id ?? i)}>
                        <td>{scalarize(s.description) || '-'}</td>
                        <td><Badge tone={tone as 'info'}>{label || '-'}</Badge></td>
                        <td>{scalarize(s.colo_cloud) || '-'}</td>
                        <td className="cell-mono">{formatDate(s.start_date) || '-'}</td>
                        <td className="cell-mono">{formatDate(s.end_date) || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
