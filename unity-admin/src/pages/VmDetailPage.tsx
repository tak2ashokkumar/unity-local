import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { formatDate, scalarize } from '../utils/format';
import { FieldDef } from '../config/fieldTypes';
import { Badge, Button, Card, CardHead, EmptyState, LoadingBlock } from '../components/ui/primitives';
import { FormModal } from '../components/ui/Overlay';
import { RecordForm } from '../components/forms/RecordForm';
import { useToast } from '../components/ui/Toast';

/*
 * Virtual machine detail - ports VirtualServerDetailController (controllers/generic.js:360)
 * and templates/virtualserver-detail.html. The generic detail page showed the VM's own
 * scalars and nothing else, losing:
 *
 *   - the Instance panel (the ORDER behind the VM: hostname, OS, ordered date, who last
 *     modified it) and its Modify Instance action
 *   - the ICDS Connection Details table
 *   - Modify (edit the VM itself)
 *
 * Everything comes from GET vm/{id}/, which carries `instance` and `icds` inline -
 * vm/{id}/related_details/ returns a 500 on this deployment and is not used.
 * Verified live against VM 644: the record answers 200 with customer, os and
 * private_cloud populated; `instance` and `icds` are null on every VM sampled, so both
 * panels render their empty state rather than a broken table.
 */

const VM_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Name', cell: 'text', required: true },
  { name: 'alias', label: 'Alias', cell: 'text' },
  { name: 'num_cpus', label: 'CPUs', cell: 'number', input: 'number' },
  { name: 'num_cores', label: 'Cores', cell: 'number', input: 'number' },
  { name: 'memory_mb', label: 'Memory (MB)', cell: 'number', input: 'number' },
  { name: 'capacity_gb', label: 'Disk Capacity (GB)', cell: 'number', input: 'number' },
  { name: 'ethports', label: 'NICs', cell: 'number', input: 'number' },
  { name: 'management_ip', label: 'Management IP', cell: 'mono' },
];

/* ULDBService2.instance().fields() - uldb-service.js:805. */
const INSTANCE_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Hostname', cell: 'text' },
  {
    name: 'os',
    label: 'Operating System',
    cell: 'fk',
    subfield: 'full_name',
    input: 'typeahead',
    lookupUri: 'os',
    lookupAccessor: 'full_name',
  },
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

export function VmDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [record, setRecord] = useState<ApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<'vm' | 'instance' | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRecord(await api.detail<ApiRecord>('vm', id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load this virtual machine.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const saveVm = async (values: ApiRecord) => {
    if (!record) return;
    setSaving(true);
    try {
      const res = await api.update<ApiRecord>('vm', id, { ...record, ...values });
      setRecord({ ...record, ...values, ...res });
      toast.success(`Updated ${scalarize(record.name)}`, 'Saved');
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update this VM.');
    } finally {
      setSaving(false);
    }
  };

  const saveInstance = async (values: ApiRecord) => {
    const instance = obj(record?.instance);
    if (!record || !instance) return;
    setSaving(true);
    try {
      // Legacy modifyInstance() PUT the whole Instance resource.
      const res = await api.update<ApiRecord>('instance', String(instance.id), { ...instance, ...values });
      setRecord({ ...record, instance: { ...instance, ...values, ...res } });
      toast.success('Instance updated.', 'Saved');
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update the instance.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="content-fade">
        <Card>
          <LoadingBlock label="Loading virtual machine..." />
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
            title="VM not found"
            message={error || 'This VM could not be loaded.'}
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
  const os = obj(record.os);
  const cloud = obj(record.private_cloud);
  const server = obj(record.server);
  const instance = obj(record.instance);
  const icds = Array.isArray(record.icds) ? (record.icds as ApiRecord[]) : [];

  return (
    <div className="content-fade">
      <div style={{ marginBottom: 14 }}>
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => navigate('/vm')}>
          Back to Virtual Machines
        </Button>
      </div>

      <div className="detail-grid">
        <div className="detail-col">
          <Card>
            <CardHead
              title={scalarize(record.name) || 'Virtual Machine'}
              icon="cloud"
              action={<Badge tone="info">{scalarize(record.vm_type) || 'VM'}</Badge>}
            />
            <div>
              <Row label="Name">{scalarize(record.name) || '-'}</Row>
              <Row label="Alias">{scalarize(record.alias) || '-'}</Row>
              <Row label="Display Name">{scalarize(record.display_name) || '-'}</Row>
              <Row label="Customer">
                {customer?.id ? (
                  <Link className="cell-link" to={`/org/${String(customer.id)}`}>
                    {scalarize(customer.name)}
                  </Link>
                ) : (
                  '-'
                )}
              </Row>
              <Row label="Operating System">{scalarize(os?.full_name ?? os?.name) || '-'}</Row>
              <Row label="Private Cloud">
                {cloud?.uuid ? (
                  <Link className="cell-link" to={`/cloud/${String(cloud.uuid)}`}>
                    {scalarize(cloud.name)}
                  </Link>
                ) : (
                  scalarize(cloud?.name) || '-'
                )}
              </Row>
              <Row label="Hypervisor">
                {server?.id ? (
                  <Link className="cell-link" to={`/server/${String(server.id)}`}>
                    {scalarize(server.name)}
                  </Link>
                ) : (
                  '-'
                )}
              </Row>
              <Row label="Management IP">
                <span className="mono">{scalarize(record.management_ip) || '-'}</span>
              </Row>
              <Row label="CPUs">{scalarize(record.num_cpus) || '-'}</Row>
              <Row label="Cores">{scalarize(record.num_cores) || '-'}</Row>
              <Row label="Memory (MB)">{scalarize(record.memory_mb) || '-'}</Row>
              <Row label="Disk Capacity (GB)">{scalarize(record.capacity_gb) || '-'}</Row>
              <Row label="NICs">{scalarize(record.ethports) || '-'}</Row>
              <Row label="UUID">
                <span className="mono">{scalarize(record.uuid) || '-'}</span>
              </Row>
            </div>
            <div className="card-foot">
              <Button variant="primary" size="sm" icon="pencil" onClick={() => setEditing('vm')}>
                Modify
              </Button>
            </div>
          </Card>
        </div>

        <div className="detail-col">
          <Card>
            <CardHead title="Instance" icon="package" />
            {!instance ? (
              <EmptyState
                icon="package"
                title="No instance"
                message="This VM has no instance record - it was not provisioned through an order."
              />
            ) : (
              <div>
                <Row label="Hostname">{scalarize(instance.name) || '-'}</Row>
                <Row label="UUID">
                  <span className="mono">{scalarize(instance.uuid) || '-'}</span>
                </Row>
                <Row label="Operating System">
                  {scalarize(obj(instance.os)?.full_name ?? obj(instance.os)?.name) || '-'}
                </Row>
                <Row label="Ordered Date">{formatDate(instance.ordered_date) || '-'}</Row>
                <Row label="Last Modified By">{scalarize(instance.modified_user) || '-'}</Row>
              </div>
            )}
            {instance && (
              <div className="card-foot">
                <Button variant="primary" size="sm" icon="pencil" onClick={() => setEditing('instance')}>
                  Modify Instance
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Card style={{ marginTop: 18 }}>
        <CardHead title="Connection Details" icon="cable" action={<Badge tone="brand">{icds.length}</Badge>} />
        {icds.length === 0 ? (
          <EmptyState icon="cable" title="No connections" message="No ICDS connections are recorded for this VM." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ethernet</th>
                  <th>Ethernet Type</th>
                  <th>MAC Address</th>
                  <th>IP Address</th>
                  <th>Default Gateway</th>
                  <th>VLAN</th>
                  <th className="col-center">Management Interface</th>
                </tr>
              </thead>
              <tbody>
                {icds.map((c, i) => (
                  <tr key={String(c.id ?? i)}>
                    <td>{scalarize(c.ethernet) || '-'}</td>
                    <td>{scalarize(c.ethernet_type) || '-'}</td>
                    <td className="cell-mono">{scalarize(c.mac_address) || '-'}</td>
                    <td className="cell-mono">{scalarize(c.ip_address) || '-'}</td>
                    <td className="cell-mono">{scalarize(c.default_gateway) || '-'}</td>
                    <td>{scalarize(c.vlan) || '-'}</td>
                    <td className="col-center">
                      {c.management_interface ? <Badge tone="success" dot>Yes</Badge> : <Badge tone="neutral">No</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editing === 'vm' && (
        <FormModal title="Modify Virtual Machine" subtitle={scalarize(record.name)} onClose={() => setEditing(null)}>
          <RecordForm
            fields={VM_FIELDS}
            method="Edit"
            initial={record}
            submitting={saving}
            onSubmit={saveVm}
            onCancel={() => setEditing(null)}
          />
        </FormModal>
      )}

      {editing === 'instance' && instance && (
        <FormModal title="Modify Instance" subtitle={scalarize(instance.name)} onClose={() => setEditing(null)}>
          <RecordForm
            fields={INSTANCE_FIELDS}
            method="Edit"
            initial={instance}
            submitting={saving}
            onSubmit={saveInstance}
            onCancel={() => setEditing(null)}
          />
        </FormModal>
      )}
    </div>
  );
}
