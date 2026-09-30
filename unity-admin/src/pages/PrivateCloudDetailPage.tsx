import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { formatDate, scalarize } from '../utils/format';
import { Badge, Button, Card, CardHead, EmptyState, LoadingBlock } from '../components/ui/primitives';

/*
 * Private cloud detail. The port had no detail page for a private cloud at all, so the
 * platform's resources - its servers, VMs, switches, firewalls, vCenters, storage - were
 * unreachable from the panel.
 *
 *   GET v3.1/private_cloud/{uuid}/
 *
 * Verified live against KVM-Cluster (uuid e0f4aa17-...): the DETAIL endpoint answers 200
 * and carries every child collection, even though the LIST endpoint
 * (/rest/v3.1/private_cloud/) is currently returning a Django 500 on this deployment.
 * That outage is why the Private Clouds list cannot reach here by clicking today.
 */

interface Collection {
  key: string;
  label: string;
  icon: string;
  /* Route prefix for a row that can be opened, when one exists in this app. */
  to?: string;
  idField?: string;
}

const COLLECTIONS: Collection[] = [
  { key: 'servers', label: 'Servers', icon: 'server', to: '/server/', idField: 'id' },
  { key: 'vms', label: 'Virtual Machines', icon: 'cloud' },
  { key: 'switch', label: 'Switches', icon: 'network', to: '/switch/', idField: 'id' },
  { key: 'firewall', label: 'Firewalls', icon: 'shield' },
  { key: 'load_balancer', label: 'Load Balancers', icon: 'scale' },
  { key: 'virtual_load_balancers', label: 'Virtual Load Balancers', icon: 'scale' },
  { key: 'storage_device', label: 'Storage Devices', icon: 'hard-drive' },
  { key: 'vcenters', label: 'vCenters', icon: 'cloud' },
  { key: 'openstack_proxy', label: 'OpenStack Proxies', icon: 'cloud' },
  { key: 'customdevice', label: 'Custom Devices', icon: 'box' },
  { key: 'upstream_providers', label: 'Upstream Providers', icon: 'cable' },
];

const obj = (v: unknown): ApiRecord | null =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as ApiRecord) : null;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="kv-row">
      <div className="kv-label">{label}</div>
      <div className="kv-value">{children}</div>
    </div>
  );
}

function YesNo({ value }: { value: unknown }) {
  return value ? <Badge tone="success" dot>Yes</Badge> : <Badge tone="neutral">No</Badge>;
}

export function PrivateCloudDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRecord(await api.detail<ApiRecord>('v3.1/private_cloud', id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load this private cloud.');
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
          <LoadingBlock label="Loading private cloud..." />
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
            title="Private cloud not found"
            message={error || 'This private cloud could not be loaded.'}
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

  const customer = obj(record.customer);
  const datacenter = obj(record.colocation_cloud);
  const populated = COLLECTIONS.filter((c) => Array.isArray(record[c.key]) && (record[c.key] as unknown[]).length > 0);

  return (
    <div className="content-fade">
      <div style={{ marginBottom: 14 }}>
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => navigate('/cloud')}>
          Back to Private Clouds
        </Button>
      </div>

      <div className="detail-grid">
        <div className="detail-col">
          <Card>
            <CardHead
              title={scalarize(record.name) || 'Private Cloud'}
              icon="cloud"
              action={
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Badge tone="info">{scalarize(record.platform_type) || 'Unknown'}</Badge>
                  <Link className="cell-link" to={`/cloud-vm-list/${id}`} style={{ fontSize: 'var(--fs-xs)' }}>
                    Virtual machines
                  </Link>
                </div>
              }
            />
            <div>
              <Row label="Cloud Name">{scalarize(record.name) || '-'}</Row>
              <Row label="Customer">
                {customer?.id ? (
                  <Link className="cell-link" to={`/org/${String(customer.id)}`}>
                    {scalarize(customer.name)}
                  </Link>
                ) : (
                  '-'
                )}
              </Row>
              <Row label="Datacenter">{scalarize(datacenter?.name ?? datacenter?.id) || '-'}</Row>
              <Row label="Platform Type">{scalarize(record.platform_type) || '-'}</Row>
              <Row label="vCPUs">{scalarize(record.vcpu) || '-'}</Row>
              <Row label="RAM (GB)">{scalarize(record.memory) || '-'}</Row>
              <Row label="Storage (TB)">{scalarize(record.storage) || '-'}</Row>
              <Row label="UUID">
                <span className="mono">{scalarize(record.uuid) || '-'}</span>
              </Row>
            </div>
          </Card>
        </div>

        <div className="detail-col">
          <Card>
            <CardHead title="Discovery and Management" icon="settings-2" />
            <div>
              <Row label="Managed">
                <YesNo value={record.is_managed} />
              </Row>
              <Row label="Through Collector">
                <YesNo value={record.through_collector} />
              </Row>
              <Row label="Collector">{scalarize(record.collector) || '-'}</Row>
              <Row label="Discover Resources">
                <YesNo value={record.discover_resources} />
              </Row>
              <Row label="Discover Dependency">
                <YesNo value={record.discover_dependency} />
              </Row>
              <Row label="Ingest Event">
                <YesNo value={record.ingest_event} />
              </Row>
              <Row label="Created">{formatDate(record.created_at) || '-'}</Row>
              <Row label="Updated">{formatDate(record.updated_at) || '-'}</Row>
            </div>
          </Card>
        </div>
      </div>

      {populated.length === 0 ? (
        <Card style={{ marginTop: 18 }}>
          <CardHead title="Resources" icon="boxes" />
          <EmptyState icon="boxes" title="No resources" message="Nothing has been discovered in this cloud yet." />
        </Card>
      ) : (
        populated.map((c) => {
          const rows = record[c.key] as ApiRecord[];
          return (
            <Card key={c.key} style={{ marginTop: 18 }}>
              <CardHead title={c.label} icon={c.icon} action={<Badge tone="brand">{rows.length}</Badge>} />
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>UUID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => {
                      const rid = c.idField ? r[c.idField] : undefined;
                      const name = scalarize(r.name ?? r.display_name ?? r.hostname) || '-';
                      return (
                        <tr key={String(r.id ?? r.uuid ?? i)}>
                          <td>
                            {c.to && rid !== undefined && rid !== null ? (
                              <Link className="cell-link" to={`${c.to}${String(rid)}`}>
                                {name}
                              </Link>
                            ) : (
                              name
                            )}
                          </td>
                          <td className="cell-mono">{scalarize(r.uuid) || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
