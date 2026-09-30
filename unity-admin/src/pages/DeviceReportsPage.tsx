import { useEffect, useRef, useState } from 'react';
import { api, API_BASE } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { scalarize } from '../utils/format';
import { Button, Card, CardHead, EmptyState, LoadingBlock } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';

/*
 * Device Reports - ports DeviceReportsController
 * (controllers/v3/ul-admin/devicereportcontroller.js) and templates/v3/device_reports.html.
 *
 * The port had registered this route as a generic CRUD list on a `device_reports`
 * resource, which does not exist (GET /rest/device_reports/ -> 404) and offered
 * Create / Edit / Delete on a read-only report. The real screen is an organization +
 * date-range query:
 *
 *   GET /rest/devicereport/get_device_report/?start_date&end_date&user_organization
 *   GET /rest/devicereport/download/?<same params>     (the Export button)
 *
 * Dates are sent as full ISO timestamps snapped to the start and end of the chosen
 * days, exactly as the legacy moment() calls did.
 */

const COLUMNS: { key: string; label: string }[] = [
  { key: 'firewall_count', label: 'Firewall' },
  { key: 'switch_count', label: 'Switch' },
  { key: 'hypervisor_count', label: 'Hypervisor' },
  { key: 'virtual_machine_count', label: 'Virtual Machine' },
  { key: 'load_balancer_count', label: 'Load Balancer' },
  { key: 'custom_device_count', label: 'Other Device' },
  { key: 'baremetal_server_count', label: 'BareMetal Server' },
  { key: 'cabinet_count', label: 'Cabinet' },
  { key: 'total_count', label: 'Total' },
];

function isoDay(value: string, endOfDay: boolean): string {
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  if (endOfDay) d.setHours(23, 59, 59, 0);
  else d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function DeviceReportsPage() {
  const toast = useToast();
  const [org, setOrg] = useState<ApiRecord | null>(null);
  const [orgQuery, setOrgQuery] = useState('');
  const [orgOptions, setOrgOptions] = useState<ApiRecord[]>([]);
  const [showOrgs, setShowOrgs] = useState(false);
  // Legacy defaulted to the last 30 days.
  const [startDate, setStartDate] = useState(daysAgo(30));
  const [endDate, setEndDate] = useState(daysAgo(0));

  const [rows, setRows] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ran, setRan] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    if (orgQuery.trim().length < 2) {
      setOrgOptions([]);
      return;
    }
    const s = ++seq.current;
    const t = window.setTimeout(() => {
      api
        .list<ApiRecord>('fast/org', { search: orgQuery.trim() })
        .then((res) => {
          if (s === seq.current) setOrgOptions(res.items.slice(0, 20));
        })
        .catch(() => {
          if (s === seq.current) setOrgOptions([]);
        });
    }, 250);
    return () => window.clearTimeout(t);
  }, [orgQuery]);

  const params = (): Record<string, string> => {
    const p: Record<string, string> = {
      start_date: isoDay(startDate, false),
      end_date: isoDay(endDate, true),
    };
    /* Angular's $httpParamSerializer DROPS null params, so "all organizations" means
       the key is absent - not present and empty. */
    if (org) p.user_organization = String(org.id);
    return p;
  };

  const run = async () => {
    setLoading(true);
    setRows([]);
    setError(null);
    try {
      const res = await api.get<unknown>('devicereport/get_device_report', params());
      setRows(Array.isArray(res) ? (res as ApiRecord[]) : []);
      setRan(true);
    } catch (err) {
      setRows([]);
      setRan(true);
      const msg = err instanceof Error ? err.message : 'Could not load the device report.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onExport = () => {
    const qs = new URLSearchParams(params());
    window.open(`${API_BASE}/devicereport/download/?${qs.toString()}`, '_blank', 'noopener');
    toast.info('Export requested. The download opens in a new tab.', 'Export');
  };

  return (
    <div className="content-fade">
      <Card style={{ marginBottom: 18 }}>
        <CardHead
          title="Device Reports"
          icon="bar-chart-3"
          action={
            <Button variant="default" size="sm" icon="download" disabled={!ran || loading} onClick={onExport}>
              Export
            </Button>
          }
        />
        <div className="queue-controls">
          <div className="field typeahead" style={{ flex: '1 1 280px', maxWidth: 380 }}>
            <label>Organization</label>
            <input
              type="text"
              value={orgQuery}
              placeholder="Type org to search (leave empty for all)..."
              onChange={(e) => {
                setOrgQuery(e.target.value);
                setOrg(null);
                setShowOrgs(true);
              }}
              onFocus={() => setShowOrgs(true)}
              onBlur={() => window.setTimeout(() => setShowOrgs(false), 150)}
            />
            {showOrgs && orgOptions.length > 0 && (
              <div className="typeahead-menu">
                {orgOptions.map((o) => (
                  <button
                    type="button"
                    key={String(o.id)}
                    className="ta-opt"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setOrg(o);
                      setOrgQuery(scalarize(o.name));
                      setShowOrgs(false);
                    }}
                  >
                    {scalarize(o.name)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="field" style={{ maxWidth: 190 }}>
            <label>From</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="field" style={{ maxWidth: 190 }}>
            <label>To</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <Button variant="primary" icon="search" disabled={loading} onClick={run}>
            Run Report
          </Button>
        </div>
      </Card>

      <Card>
        <CardHead title="Device Counts" icon="list" />
        {loading ? (
          <LoadingBlock label="Building the report..." />
        ) : error ? (
          <EmptyState
            icon="alert-triangle"
            title="Failed to build report"
            message={error}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={run}>
                Retry
              </Button>
            }
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon="bar-chart-3"
            title={ran ? 'No results' : 'No report yet'}
            message={ran ? 'No device counts for this organization and date range.' : 'Choose a date range and run the report.'}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {COLUMNS.map((c) => (
                    <th key={c.key} className="col-center">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={String(r.id ?? i)}>
                    {COLUMNS.map((c) => (
                      <td key={c.key} className="col-center cell-mono">
                        {scalarize(r[c.key]) || '0'}
                      </td>
                    ))}
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
