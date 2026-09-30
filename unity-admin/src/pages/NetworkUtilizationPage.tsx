import { useEffect, useRef, useState } from 'react';
import { api } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { scalarize } from '../utils/format';
import { Badge, Button, Card, CardHead, EmptyState, LoadingBlock } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';

/*
 * Customer Utilization + Transit Port Graphs - the two tabs of System Monitoring >
 * Networking that the port dropped (controllers/networking.js:39). The three inventory
 * tabs it kept (Observium Hosts / Transit Ports / Graphed Ports) are still the generic
 * tabbed list at /integ/net; these two are charts, not tables, so they live here.
 *
 *   GET graphed_port/?organization_id={id}   the organization's graphed ports
 *   GET org/{id}/network_stats/              -> { day, week, month, year }, each a map of
 *                                               interface -> { total: { percentile } }
 *
 * Verified live: network_stats answers 200 for org 328 with all four period buckets
 * present but empty, and graphed_port answers 200 with count 0 - this deployment has no
 * Observium port data, so both panels show their empty state here.
 */

const PERIODS: { key: string; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

interface Bar {
  label: string;
  value: number;
}

/* stats[period] is { <interface>: { total: { percentile } } }. */
function toBars(bucket: unknown): Bar[] {
  if (!bucket || typeof bucket !== 'object') return [];
  return Object.entries(bucket as Record<string, unknown>)
    .map(([label, v]) => {
      const total = v && typeof v === 'object' ? (v as ApiRecord).total : null;
      const pct = total && typeof total === 'object' ? Number((total as ApiRecord).percentile) : NaN;
      return { label, value: Number.isFinite(pct) ? pct : 0 };
    })
    .sort((a, b) => b.value - a.value);
}

function BarChart({ bars }: { bars: Bar[] }) {
  const max = bars.reduce((m, b) => Math.max(m, b.value), 0) || 1;
  return (
    <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {bars.map((b) => (
        <div key={b.label} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 30%) 1fr auto', gap: 12, alignItems: 'center' }}>
          <span
            className="u-truncate"
            title={b.label}
            style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}
          >
            {b.label}
          </span>
          <span className="stacked-bar">
            <span className="stacked-seg seg-info" style={{ width: `${(b.value / max) * 100}%` }} />
          </span>
          <strong style={{ fontSize: 'var(--fs-xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>
            {b.value.toFixed(2)}
          </strong>
        </div>
      ))}
    </div>
  );
}

export function NetworkUtilizationPage() {
  const toast = useToast();
  const [org, setOrg] = useState<ApiRecord | null>(null);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<ApiRecord[]>([]);
  const [showOptions, setShowOptions] = useState(false);

  const [ports, setPorts] = useState<ApiRecord[]>([]);
  const [stats, setStats] = useState<ApiRecord | null>(null);
  const [period, setPeriod] = useState('day');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
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

  const load = async () => {
    if (!org) return;
    setLoading(true);
    setPorts([]);
    setStats(null);
    setError(null);
    try {
      const [p, s] = await Promise.all([
        api.list<ApiRecord>('graphed_port', { organization_id: String(org.id) }),
        api.get<ApiRecord>(`org/${String(org.id)}/network_stats`).catch(() => null),
      ]);
      setPorts(p.items);
      setStats(s);
      setLoaded(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not load network utilization.';
      setError(msg);
      toast.error(msg);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const bars = toBars(stats ? stats[period] : null);

  return (
    <div className="content-fade">
      <Card style={{ marginBottom: 18 }}>
        <CardHead title="Customer Utilization" icon="radio" />
        <div className="queue-controls">
          <div className="field typeahead" style={{ flex: '1 1 300px', maxWidth: 420 }}>
            <label>Organization</label>
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
          <Button variant="primary" icon="search" disabled={!org || loading} onClick={load}>
            Load
          </Button>
        </div>
      </Card>

      <Card style={{ marginBottom: 18 }}>
        <CardHead
          title="Transit Port Graphs"
          icon="bar-chart-3"
          action={
            <div style={{ display: 'flex', gap: 4 }}>
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`btn btn-sm ${p.key === period ? 'btn-primary' : 'btn-default'}`}
                  onClick={() => setPeriod(p.key)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          }
        />
        {loading ? (
          <LoadingBlock label="Loading utilization..." />
        ) : error ? (
          <EmptyState
            icon="alert-triangle"
            title="Failed to load utilization"
            message={error}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={load}>
                Retry
              </Button>
            }
          />
        ) : bars.length === 0 ? (
          <EmptyState
            icon="bar-chart-3"
            title={loaded ? 'No utilization data' : 'No organization selected'}
            message={
              loaded
                ? 'This organization has no interface percentiles recorded for the selected period.'
                : 'Choose an organization and press Load.'
            }
          />
        ) : (
          <BarChart bars={bars} />
        )}
      </Card>

      <Card>
        <CardHead title="Graphed Ports" icon="cable" action={<Badge tone="brand">{ports.length}</Badge>} />
        {loading ? (
          <LoadingBlock label="Loading ports..." />
        ) : ports.length === 0 ? (
          <EmptyState
            icon="cable"
            title={loaded ? 'No graphed ports' : 'No organization selected'}
            message={loaded ? 'This organization has no graphed ports.' : 'Choose an organization and press Load.'}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Switch</th>
                  <th>Interface Name</th>
                  <th>Organization</th>
                </tr>
              </thead>
              <tbody>
                {ports.map((p, i) => (
                  <tr key={String(p.id ?? i)}>
                    <td>{scalarize((p.switch as ApiRecord)?.name ?? p.switch) || '-'}</td>
                    <td className="cell-mono">{scalarize(p.interface_name) || '-'}</td>
                    <td>{scalarize((p.organization as ApiRecord)?.name ?? p.organization) || '-'}</td>
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
