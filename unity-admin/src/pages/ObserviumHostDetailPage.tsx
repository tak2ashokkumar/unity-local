import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { formatDate, scalarize } from '../utils/format';
import { Badge, Button, Card, CardHead, EmptyState, LoadingBlock } from '../components/ui/primitives';

/*
 * Observium host detail with its interface table (ULDBService2.observium_host(),
 * uldb-service.js:3103, path '/observium_host/'). The port listed hosts but had no
 * detail route, so a host's interfaces were unreachable.
 *
 *   GET observium_host/{id}/   the host, carrying its `interfaces`
 */

const list = (v: unknown): ApiRecord[] => (Array.isArray(v) ? (v as ApiRecord[]) : []);
const obj = (v: unknown): ApiRecord | null =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as ApiRecord) : null;

/* Observium reports speeds in bits/sec and counters as bytes/sec. */
const speed = (bps: unknown): string => {
  const n = Number(bps);
  if (!Number.isFinite(n) || n === 0) return '-';
  if (n >= 1e9) return `${n / 1e9} Gbps`;
  if (n >= 1e6) return `${n / 1e6} Mbps`;
  return `${n} bps`;
};

const rate = (bytesPerSec: unknown): string => {
  const n = Number(bytesPerSec);
  if (!Number.isFinite(n) || n === 0) return '0';
  const mbps = (n * 8) / 1e6;
  return `${mbps.toFixed(2)} Mbps`;
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="kv-row">
      <div className="kv-label">{label}</div>
      <div className="kv-value">{children}</div>
    </div>
  );
}

export function ObserviumHostDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [host, setHost] = useState<ApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setHost(await api.detail<ApiRecord>('observium_host', id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load this host.');
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
          <LoadingBlock label="Loading host..." />
        </Card>
      </div>
    );
  }

  if (error || !host) {
    return (
      <div className="content-fade">
        <Card>
          <EmptyState
            icon="alert-triangle"
            title="Host not found"
            message={error || 'Could not load this host.'}
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

  const interfaces = list(host.interfaces);
  const instance = obj(host.observium_instance);
  const customer = obj(host.customer);

  return (
    <div className="content-fade">
      <div style={{ marginBottom: 14 }}>
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => navigate('/integ/net')}>
          Back to Networking
        </Button>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <CardHead
          title={scalarize(host.hostname) || 'Observium Host'}
          icon="radio"
          action={
            <Badge tone={scalarize(host.status) === 'up' ? 'success' : 'danger'} dot>
              {scalarize(host.status) || 'unknown'}
            </Badge>
          }
        />
        <div>
          <Row label="Hostname">{scalarize(host.hostname) || '-'}</Row>
          <Row label="Device ID">
            <span className="mono">{scalarize(host.device_id) || '-'}</span>
          </Row>
          <Row label="Observium Instance">{scalarize(instance?.account_name) || '-'}</Row>
          <Row label="Customer">
            {customer?.id ? (
              <Link className="cell-link" to={`/org/${String(customer.id)}`}>
                {scalarize(customer.name)}
              </Link>
            ) : (
              '-'
            )}
          </Row>
          <Row label="Location">{scalarize(host.location) || '-'}</Row>
          <Row label="OS">{scalarize(host.os) || '-'}</Row>
          <Row label="Type">{scalarize(host.type ?? host.device_type) || '-'}</Row>
          <Row label="Serial">
            <span className="mono">{scalarize(host.serial) || '-'}</span>
          </Row>
          <Row label="Version">{scalarize(host.version) || '-'}</Row>
          <Row label="Uptime">{scalarize(host.uptime_human) || scalarize(host.uptime) || '-'}</Row>
          <Row label="Last Polled">{formatDate(host.last_polled) || '-'}</Row>
        </div>
      </Card>

      <Card>
        <CardHead title="Interfaces" icon="cable" action={<Badge tone="brand">{interfaces.length}</Badge>} />
        {interfaces.length === 0 ? (
          <EmptyState icon="cable" title="No interfaces" message="This host reports no interfaces." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Interface</th>
                  <th>Alias</th>
                  <th className="col-center">Oper</th>
                  <th className="col-center">Admin</th>
                  <th className="col-num">Speed</th>
                  <th className="col-num">In</th>
                  <th className="col-num">Out</th>
                </tr>
              </thead>
              <tbody>
                {interfaces.map((f, i) => (
                  <tr key={String(f.id ?? i)}>
                    <td className="cell-mono">{scalarize(f.ifName) || '-'}</td>
                    <td>{scalarize(f.ifAlias) || '-'}</td>
                    <td className="col-center">
                      <Badge tone={scalarize(f.ifOperStatus) === 'up' ? 'success' : 'danger'} dot>
                        {scalarize(f.ifOperStatus) || '-'}
                      </Badge>
                    </td>
                    <td className="col-center">
                      <Badge tone={scalarize(f.ifAdminStatus) === 'up' ? 'success' : 'neutral'}>
                        {scalarize(f.ifAdminStatus) || '-'}
                      </Badge>
                    </td>
                    <td className="col-num cell-mono">{speed(f.ifSpeed)}</td>
                    <td className="col-num cell-mono">{rate(f.ifInOctets_rate)}</td>
                    <td className="col-num cell-mono">{rate(f.ifOutOctets_rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
