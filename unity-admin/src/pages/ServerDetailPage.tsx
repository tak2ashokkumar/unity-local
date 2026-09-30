import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError, buildUrl } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { scalarize } from '../utils/format';
import { Badge, Button, Card, CardHead, EmptyState, LoadingBlock } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';

/*
 * Server detail - ports ServerDetailController (controllers/system.js:23) and the five
 * templates under templates/server/. The port rendered a flat field dump, losing every
 * related-data table on the page.
 *
 * All five tabs come from two calls:
 *   GET server/{id}/                  the server itself (Core)
 *   GET server/{id}/related_details/  -> { server: { instance, cabinet, switch, pdu,
 *                                         conn_details, chassis, cpu, memory, nic,
 *                                         disks, ipmi_attributes } }
 * Verified live against server 724: related_details answers 200 and populates `cabinet`;
 * the other collections are null for that server, which the tabs render as an empty
 * state rather than a broken table.
 */

type TabKey = 'core' | 'hardware' | 'location' | 'networking' | 'power';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'core', label: 'Core' },
  { key: 'hardware', label: 'Hardware Info' },
  { key: 'location', label: 'Location' },
  { key: 'networking', label: 'Networking' },
  { key: 'power', label: 'Power and IPMI' },
];

const list = (v: unknown): ApiRecord[] => (Array.isArray(v) ? (v as ApiRecord[]) : []);
const obj = (v: unknown): ApiRecord | null => (v && typeof v === 'object' && !Array.isArray(v) ? (v as ApiRecord) : null);

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="kv-row">
      <div className="kv-label">{label}</div>
      <div className="kv-value">{children}</div>
    </div>
  );
}

function MiniTable({
  title,
  icon,
  columns,
  rows,
  empty,
}: {
  title: string;
  icon: string;
  columns: { label: string; get: (r: ApiRecord) => React.ReactNode; mono?: boolean }[];
  rows: ApiRecord[];
  empty: string;
}) {
  return (
    <Card style={{ marginBottom: 18 }}>
      <CardHead title={title} icon={icon} action={<Badge tone="brand">{rows.length}</Badge>} />
      {rows.length === 0 ? (
        <EmptyState icon={icon} title={`No ${title.toLowerCase()}`} message={empty} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.label}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={String(r.id ?? i)}>
                  {columns.map((c) => (
                    <td key={c.label} className={c.mono ? 'cell-mono' : undefined}>
                      {c.get(r) ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export function ServerDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [server, setServer] = useState<ApiRecord | null>(null);
  const [related, setRelated] = useState<ApiRecord | null>(null);
  const [tab, setTab] = useState<TabKey>('core');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rec = await api.detail<ApiRecord>('server', id);
      setServer(rec);
      const rel = await api
        .rawGet<ApiRecord>(buildUrl(`server/${id}/related_details`))
        .catch(() => null);
      setRelated(rel ? (obj(rel.server) ?? rel) : null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load this server.');
      toast.error('Could not load the server.');
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
          <LoadingBlock label="Loading server..." />
        </Card>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="content-fade">
        <Card>
          <EmptyState
            icon="alert-triangle"
            title="Server not found"
            message={error || 'This server could not be loaded.'}
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

  const rel = related || {};
  const customer = obj(server.customer);
  const cabinet = obj(rel.cabinet);
  const instance = obj(rel.instance);
  const chassis = obj(rel.chassis);

  return (
    <div className="content-fade">
      <div style={{ marginBottom: 14 }}>
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => navigate('/server')}>
          Back to Servers
        </Button>
      </div>

      <div className="page-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`tab-btn${t.key === tab ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'core' && (
        <Card>
          <CardHead title={scalarize(server.name) || 'Server'} icon="server" />
          <div>
            <Row label="Name">{scalarize(server.name) || '-'}</Row>
            <Row label="Alias">{scalarize(server.alias) || '-'}</Row>
            <Row label="Asset Tag">{scalarize(server.asset_tag) || '-'}</Row>
            <Row label="Serial Number">
              <span className="mono">{scalarize(server.serial_number) || '-'}</span>
            </Row>
            <Row label="CPUs">{scalarize(server.num_cpus) || '-'}</Row>
            <Row label="Cores">{scalarize(server.num_cores) || '-'}</Row>
            <Row label="Memory (MB)">{scalarize(server.memory_mb) || '-'}</Row>
            <Row label="Capacity (GB)">{scalarize(server.capacity_gb) || '-'}</Row>
            <Row label="Salesforce ID">{scalarize(server.salesforce_id) || '-'}</Row>
            <Row label="Customer">
              {customer?.id ? (
                <Link className="cell-link" to={`/org/${String(customer.id)}`}>
                  {scalarize(customer.name)}
                </Link>
              ) : (
                '-'
              )}
            </Row>
            <Row label="Instance">{instance ? scalarize(instance.name ?? instance.id) : '-'}</Row>
          </div>
        </Card>
      )}

      {tab === 'hardware' && (
        <>
          <MiniTable
            title="CPU"
            icon="cpu"
            rows={list(rel.cpu)}
            empty="No CPU inventory is recorded for this server."
            columns={[
              { label: 'Model', get: (r) => scalarize(r.cpu_type) },
              { label: 'Serial number', mono: true, get: (r) => scalarize(r.serialnumber) },
              { label: 'Status', get: (r) => scalarize(r.status) },
              { label: 'Is Allocated', get: (r) => (r.is_allocated ? 'Yes' : 'No') },
            ]}
          />
          <MiniTable
            title="Memory"
            icon="memory-stick"
            rows={list(rel.memory)}
            empty="No memory inventory is recorded for this server."
            columns={[
              { label: 'Type', get: (r) => scalarize(r.memory_type) },
              { label: 'Serial number', mono: true, get: (r) => scalarize(r.serialnumber) },
              { label: 'Capacity', get: (r) => scalarize(r.mem_capacity) },
              { label: 'Measure Type', get: (r) => scalarize(r.measuretype) },
            ]}
          />
          <MiniTable
            title="Disks"
            icon="hard-drive"
            rows={list(rel.disks)}
            empty="No disks are recorded for this server."
            columns={[
              { label: 'Type', get: (r) => scalarize(r.disk_type) },
              { label: 'Serial number', mono: true, get: (r) => scalarize(r.serialnumber) },
              { label: 'Spare Disk', get: (r) => (r.spare_disk ? 'Yes' : 'No') },
              { label: 'Is Allocated', get: (r) => (r.is_allocated ? 'Yes' : 'No') },
              { label: 'Raid Config', get: (r) => scalarize(obj(r.raid_config)?.id) },
            ]}
          />
          {chassis && (
            <Card>
              <CardHead title="Chassis" icon="box" />
              <div>
                <Row label="Type">{scalarize(chassis.type) || '-'}</Row>
                <Row label="Serial Number">
                  <span className="mono">{scalarize(chassis.serialnumber) || '-'}</span>
                </Row>
              </div>
            </Card>
          )}
        </>
      )}

      {tab === 'location' && (
        <Card>
          <CardHead title="Cabinet Details" icon="building-2" />
          {!cabinet ? (
            <EmptyState icon="building-2" title="No cabinet" message="This server is not assigned to a cabinet." />
          ) : (
            <div>
              <Row label="Name">{scalarize(cabinet.name) || '-'}</Row>
              <Row label="Model">{scalarize(obj(obj(cabinet.related)?.cabientmodel)?.model) || '-'}</Row>
              <Row label="Position">{scalarize(server.position) || '-'}</Row>
              <Row label="Size">{scalarize(server.size) || '-'}</Row>
            </div>
          )}
        </Card>
      )}

      {tab === 'networking' && (
        <>
          <MiniTable
            title="NICs"
            icon="network"
            rows={list(rel.nic)}
            empty="No network cards are recorded for this server."
            columns={[
              { label: 'Assettag', get: (r) => scalarize(r.assettag) },
              { label: 'Type', get: (r) => scalarize(obj(r.nic_model_details)?.controller) },
              { label: 'Serial number', mono: true, get: (r) => scalarize(r.serialnumber) },
              { label: 'MAC Address', mono: true, get: (r) => scalarize(r.mac_address) },
              { label: 'Is Allocated', get: (r) => (r.is_allocated ? 'Yes' : 'No') },
            ]}
          />
          <MiniTable
            title="Switches"
            icon="network"
            rows={list(rel.switch)}
            empty="This server is not connected to a switch."
            columns={[
              { label: 'Name', get: (r) => scalarize(r.name) },
              { label: 'Model', get: (r) => scalarize(obj(r.switch_model)?.model) },
              { label: 'Assettag', get: (r) => scalarize(r.assettag) },
              { label: 'Serial number', mono: true, get: (r) => scalarize(r.serialnumber) },
              { label: 'VTP Mode', get: (r) => scalarize(r.vtp_mode) },
              { label: 'Status', get: (r) => scalarize(obj(r.status_details)?.status_type) },
            ]}
          />
          <MiniTable
            title="Connections"
            icon="cable"
            rows={list(rel.conn_details)}
            empty="No ethernet connections are recorded for this server."
            columns={[
              { label: 'Ethernet', get: (r) => scalarize(r.ethernet) },
              { label: 'MAC Address', mono: true, get: (r) => scalarize(r.mac_address) },
              { label: 'Management Interface', get: (r) => (r.management_interface ? 'Yes' : 'No') },
              { label: 'Bridge Mode', get: (r) => (r.bridge_mode ? 'Yes' : 'No') },
              { label: 'IP Address', mono: true, get: (r) => scalarize(r.ip_address) },
              { label: 'Default Gateway', mono: true, get: (r) => scalarize(r.default_gateway) },
              { label: 'PXE Interface', get: (r) => (r.pxe_interface ? 'Yes' : 'No') },
              { label: 'VLAN', get: (r) => scalarize(r.vlan) },
            ]}
          />
        </>
      )}

      {tab === 'power' && (
        <>
          <MiniTable
            title="PDU Ports"
            icon="plug"
            rows={list(rel.pdu)}
            empty="This server is not connected to a PDU."
            columns={[
              { label: 'Name', get: (r) => scalarize(obj(obj(r.related)?.system_port)?.name) },
              { label: 'Assettag', get: (r) => scalarize(obj(obj(r.related)?.pdu)?.assettag) },
              { label: 'Port Number', get: (r) => scalarize(r.pdu_port_number) },
            ]}
          />
          <MiniTable
            title="IPMI"
            icon="terminal"
            rows={list(rel.ipmi_attributes)}
            empty="No IPMI attributes are recorded for this server."
            columns={[
              { label: 'IP Address', mono: true, get: (r) => scalarize(r.ip_address) },
              { label: 'MAC Address', mono: true, get: (r) => scalarize(r.mac_address) },
              { label: 'User', get: (r) => scalarize(r.ipmi_user) },
              { label: 'Port', get: (r) => scalarize(r.ipmiport) },
            ]}
          />
        </>
      )}
    </div>
  );
}
