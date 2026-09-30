import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { scalarize } from '../utils/format';
import { Badge, Button, Card, CardHead, EmptyState, LoadingBlock } from '../components/ui/primitives';
// Reuses the dashboard's stacked-bar styles rather than defining a second set.
import './dashboard.css';

/*
 * Datacenter detail. The port rendered this as a generic read-only field dump, which
 * flattened the health roll-ups into raw "[object Object]"-ish cells - the record's most
 * useful content is four STAT OBJECTS, not scalars:
 *
 *   GET datacenter/{id}/ -> { alerts, connectivity, device, host_stats, service_stats,
 *                             throughput, status, location }
 *
 * Verified live against ASH1 (id 8): alerts {warning:40, critical:30, normal:30},
 * connectivity {connected:50, retrying:30, disconnected:20}, device {warning:60,
 * critical:20, normal:20}.
 *
 * The legacy page ALSO drilled into the datacenter's private clouds, public clouds,
 * colocations and a widgets summary. All four of those endpoints are dead on this
 * deployment and cannot be shown:
 *   v3/private_cloud/{id}/get_datacenter_private_clouds/  -> 500
 *   v3/public_cloud/{id}/get_datacenter_public_clouds/    -> 404
 *   cabinet/{id}/get_datacenter_colocations/              -> 500
 *   datacenter/{id}/get_datacenters_widgets/              -> 500
 */

interface Seg {
  label: string;
  value: number;
  cls: string;
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/* The three stat objects all use the same normal / warning / critical keys. */
function statSegments(bag: unknown): Seg[] | null {
  const o = bag && typeof bag === 'object' ? (bag as ApiRecord) : null;
  if (!o) return null;
  const segs: Seg[] = [
    { label: 'Normal', value: num(o.normal), cls: 'seg-good' },
    { label: 'Warning', value: num(o.warning), cls: 'seg-warn' },
    { label: 'Critical', value: num(o.critical), cls: 'seg-bad' },
  ];
  return segs.some((s) => s.value > 0) ? segs : null;
}

function connectivitySegments(bag: unknown): Seg[] | null {
  const o = bag && typeof bag === 'object' ? (bag as ApiRecord) : null;
  if (!o) return null;
  const segs: Seg[] = [
    { label: 'Connected', value: num(o.connected), cls: 'seg-good' },
    { label: 'Retrying', value: num(o.retrying), cls: 'seg-warn' },
    { label: 'Disconnected', value: num(o.disconnected), cls: 'seg-bad' },
  ];
  return segs.some((s) => s.value > 0) ? segs : null;
}

function StatPanel({ title, icon, segments }: { title: string; icon: string; segments: Seg[] | null }) {
  const total = segments ? segments.reduce((s, x) => s + x.value, 0) : 0;
  return (
    <Card style={{ marginBottom: 18 }}>
      <CardHead title={title} icon={icon} action={segments ? <Badge tone="brand">{total}</Badge> : undefined} />
      {!segments ? (
        <EmptyState icon={icon} title="No data" message={`No ${title.toLowerCase()} are reported for this datacenter.`} />
      ) : (
        <div style={{ padding: '16px 20px 20px' }}>
          <div className="stacked-bar" style={{ marginBottom: 12 }}>
            {segments
              .filter((s) => s.value > 0)
              .map((s) => (
                <span
                  key={s.label}
                  className={`stacked-seg ${s.cls}`}
                  style={{ width: `${(s.value / total) * 100}%` }}
                  title={`${s.label}: ${s.value}`}
                />
              ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
            {segments.map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span
                  className="dot"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: `var(--${s.cls === 'seg-good' ? 'success' : s.cls === 'seg-warn' ? 'warning' : 'danger'})`,
                  }}
                />
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{s.label}</span>
                <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-strong)' }}>{s.value}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="kv-row">
      <div className="kv-label">{label}</div>
      <div className="kv-value">{children}</div>
    </div>
  );
}

export function DatacenterDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRecord(await api.detail<ApiRecord>('datacenter', id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load this datacenter.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="content-fade">
        <Card>
          <LoadingBlock label="Loading datacenter..." />
        </Card>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="content-fade">
        <Card>
          <EmptyState
            icon="alert-triangle"
            title="Datacenter not found"
            message={error || 'This datacenter could not be loaded.'}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={load}>
                Retry
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="content-fade">
      <div style={{ marginBottom: 14 }}>
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => navigate('/datacenter')}>
          Back to Datacenters
        </Button>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <CardHead
          title={scalarize(record.name) || 'Datacenter'}
          icon="database"
          action={
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {record.status === 1 ? <Badge tone="success" dot>Up</Badge> : <Badge tone="warning" dot>Check</Badge>}
              <Link className="cell-link" to={`/datacenter-rollup/${id}`} style={{ fontSize: 'var(--fs-xs)' }}>
                Clouds and colocations
              </Link>
            </div>
          }
        />
        <div>
          <Row label="Name">{scalarize(record.name) || '-'}</Row>
          <Row label="Location">{scalarize(record.location) || '-'}</Row>
          <Row label="Throughput">{scalarize(record.throughput) || '0'}</Row>
          <Row label="UUID">
            <span className="mono">{scalarize(record.uuid) || '-'}</span>
          </Row>
        </div>
      </Card>

      <div className="detail-grid">
        <div className="detail-col">
          <StatPanel title="Alerts" icon="activity" segments={statSegments(record.alerts)} />
          <StatPanel title="Devices" icon="server" segments={statSegments(record.device)} />
        </div>
        <div className="detail-col">
          <StatPanel title="Connectivity" icon="cable" segments={connectivitySegments(record.connectivity)} />
          <StatPanel title="Hosts" icon="network" segments={statSegments(record.host_stats)} />
          <StatPanel title="Services" icon="list-checks" segments={statSegments(record.service_stats)} />
        </div>
      </div>
    </div>
  );
}
