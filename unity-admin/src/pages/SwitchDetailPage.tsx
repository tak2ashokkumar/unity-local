import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { scalarize } from '../utils/format';
import { Badge, Button, Card, CardHead, EmptyState, LoadingBlock } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';

/*
 * Switch detail - ports SwitchDetailController (controllers/generic.js:247) and
 * templates/switch-detail.html, which the port had replaced with a flat field dump.
 *
 * Two panels were lost. What this backend can actually supply, verified live against
 * switch 4712:
 *
 *   Inherited Properties - the switch record carries only `model: {id, name}`, NOT the
 *     `switch_model_details` blob the legacy template bound (that key is absent). The
 *     real source is GET switchmodel/{id}/, which has every inherited property. Note
 *     the fields are port_speed_mbps / uplink_port_speed_mbps here, so the legacy
 *     column names (port_speed / uplink_port_speed) rendered blank even in the old
 *     panel.
 *
 *   Ports - the switch record has no `ports` key either. The port records live at
 *     GET switchport/, which ignores ?switch=<id> (it returned a different switch's
 *     rows), so the whole collection (154 rows) is fetched once and filtered here.
 *     These are port GROUPS - {name, customer, ports:[ids]} - not the per-port
 *     {port_number, port_type, port_mode} rows the legacy template expected; that
 *     shape is not served by this API.
 */

interface SwitchModel extends ApiRecord {
  name?: string;
  num_ports?: number;
  num_uplink_ports?: number;
  port_speed_mbps?: number;
  uplink_port_speed_mbps?: number;
  port_phy?: string;
  uplink_port_phy?: string;
}

const speed = (mbps: unknown): string => {
  const n = Number(mbps);
  if (!Number.isFinite(n) || n === 0) return '-';
  return n >= 1000 ? `${n / 1000} Gbps` : `${n} Mbps`;
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="kv-row">
      <div className="kv-label">{label}</div>
      <div className="kv-value">{children}</div>
    </div>
  );
}

export function SwitchDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [record, setRecord] = useState<ApiRecord | null>(null);
  const [model, setModel] = useState<SwitchModel | null>(null);
  const [ports, setPorts] = useState<ApiRecord[]>([]);
  const [portsLoading, setPortsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rec = await api.detail<ApiRecord>('switch', id);
      setRecord(rec);

      const modelRef = rec.model as ApiRecord | undefined;
      if (modelRef?.id !== undefined && modelRef?.id !== null) {
        api
          .detail<SwitchModel>('switchmodel', String(modelRef.id))
          .then(setModel)
          .catch(() => setModel(null));
      }

      api
        .list<ApiRecord>('switchport')
        .then(({ items }) =>
          setPorts(items.filter((p) => String((p.switch as ApiRecord)?.id ?? '') === String(rec.id)))
        )
        .catch(() => {
          setPorts([]);
          toast.error('Could not load the switch ports.');
        })
        .finally(() => setPortsLoading(false));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load this switch.');
      setPortsLoading(false);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="content-fade">
        <Card>
          <LoadingBlock label="Loading switch..." />
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
            title="Switch not found"
            message={error || 'This switch could not be loaded.'}
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

  const customers = Array.isArray(record.customers) ? (record.customers as ApiRecord[]) : [];

  return (
    <div className="content-fade">
      <div style={{ marginBottom: 14 }}>
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => navigate('/switch')}>
          Back to Switches
        </Button>
      </div>

      <div className="detail-grid">
        <div className="detail-col">
          <Card>
            <CardHead
              title={scalarize(record.name) || 'Switch'}
              icon="network"
              action={record.is_shared ? <Badge tone="info">Shared</Badge> : undefined}
            />
            <div>
              <Row label="Name">{scalarize(record.name) || '-'}</Row>
              <Row label="Asset Tag">{scalarize(record.asset_tag) || '-'}</Row>
              <Row label="IP Address">
                <span className="mono">{scalarize(record.ip_address ?? record.management_ip) || '-'}</span>
              </Row>
              <Row label="Serial Number">
                <span className="mono">{scalarize(record.serial_number) || '-'}</span>
              </Row>
              <Row label="Salesforce ID">{scalarize(record.salesforce_id) || '-'}</Row>
              <Row label="Cabinet">{scalarize((record.cabinet as ApiRecord)?.name ?? record.cabinet) || '-'}</Row>
              <Row label="Customers">
                {customers.length
                  ? customers.map((c, i) => (
                      <span className="chip" key={i}>
                        {scalarize(c.name)}
                      </span>
                    ))
                  : '-'}
              </Row>
            </div>
          </Card>
        </div>

        <div className="detail-col">
          <Card>
            <CardHead title="Inherited Properties" icon="layers" />
            {!model ? (
              <EmptyState
                icon="layers"
                title="No model"
                message="This switch has no model, so there are no inherited properties."
              />
            ) : (
              <div>
                <Row label="Model">
                  <Link className="cell-link" to={`/switchmodel/${String(model.id)}`}>
                    {scalarize(model.name)}
                  </Link>
                </Row>
                <Row label="Total Ports">{scalarize(model.num_ports) || '-'}</Row>
                <Row label="Total Uplink Ports">{scalarize(model.num_uplink_ports) || '-'}</Row>
                <Row label="Port Speed">{speed(model.port_speed_mbps)}</Row>
                <Row label="Uplink Port Speed">{speed(model.uplink_port_speed_mbps)}</Row>
                <Row label="Port PHY">{scalarize(model.port_phy) || '-'}</Row>
                <Row label="Uplink Port PHY">{scalarize(model.uplink_port_phy) || '-'}</Row>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Card style={{ marginTop: 18 }}>
        <CardHead title="Ports" icon="cable" action={<Badge tone="brand">{ports.length}</Badge>} />
        {portsLoading ? (
          <LoadingBlock label="Loading ports..." />
        ) : ports.length === 0 ? (
          <EmptyState icon="cable" title="No ports" message="No port groups are assigned to this switch." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Port Name</th>
                  <th>Customer</th>
                  <th className="col-center">Ports</th>
                </tr>
              </thead>
              <tbody>
                {ports.map((p) => (
                  <tr key={String(p.id)}>
                    <td>{scalarize(p.name) || '-'}</td>
                    <td>
                      {(p.customer as ApiRecord)?.id ? (
                        <Link className="cell-link" to={`/org/${String((p.customer as ApiRecord).id)}`}>
                          {scalarize((p.customer as ApiRecord).name)}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="col-center">{Array.isArray(p.ports) ? p.ports.length : '-'}</td>
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
