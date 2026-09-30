import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, buildUrl } from '../data/apiClient';
import { awaitTask } from '../data/task';
import { ApiRecord } from '../data/types';
import { scalarize } from '../utils/format';
import { FieldDef } from '../config/fieldTypes';
import { Badge, Button, Card, CardHead, EmptyState, IconAction, LoadingBlock } from '../components/ui/primitives';
import { ConfirmDialog, FormModal } from '../components/ui/Overlay';
import { RecordForm } from '../components/forms/RecordForm';
import { useToast } from '../components/ui/Toast';

/*
 * Cloud VM list - ports CloudVirtualMachineController (controllers/cloud.js:606) and
 * templates/cloud/private_cloud_vms.html. The port had no route to a cloud's VMs at all.
 *
 *   GET  fast/private_cloud/{uuid}/                     the cloud, for its platform_type
 *   GET  vmware/migrate/virtual_machines/?cloud_id=     VMware VMs   (async: task_id)
 *   GET  openstack/migration/{uuid}/virtual_machines/   OpenStack VMs (async)
 *   POST vmware/migrate/power_on/    { vm_id, cloud_uuid }
 *   POST openstack/migration/power_on/
 *   web console -> /vmware-vm/webconsole/... (VMware) or /openstack-vm/webconsole/...
 *
 * Columns are the legacy field list (cloud.js:678): name, os_name, host_name, cpu_core,
 * vcpus, guest_memory, management_ip, state.
 *
 * NOTE on this deployment: the VMware VM-list task is accepted (202) but its celery
 * worker never settles - it cannot reach that vCenter - so the wait is bounded and
 * reported rather than left spinning.
 */

const LIST_TIMEOUT_MS = 45000;

const asRows = (v: unknown): ApiRecord[] => {
  if (Array.isArray(v)) return v as ApiRecord[];
  if (v && typeof v === 'object') {
    const o = v as ApiRecord;
    for (const k of ['results', 'data', 'result', 'info']) if (Array.isArray(o[k])) return o[k] as ApiRecord[];
  }
  return [];
};

const IP_FIELDS: FieldDef[] = [
  { name: 'management_ip', label: 'Management IP Address', cell: 'mono', required: true },
];

export function CloudVmListPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [cloud, setCloud] = useState<ApiRecord | null>(null);
  const [vms, setVms] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [powerOn, setPowerOn] = useState<ApiRecord | null>(null);
  const [ipFor, setIpFor] = useState<ApiRecord | null>(null);
  const [busy, setBusy] = useState(false);

  const platform = scalarize(cloud?.platform_type);
  const openstack = platform.toLowerCase().includes('openstack');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setVms([]);
    try {
      const c = await api.detail<ApiRecord>('fast/private_cloud', id);
      setCloud(c);
      const p = scalarize(c.platform_type).toLowerCase();
      if (!p.includes('vmware') && !p.includes('openstack')) {
        setError(`This feature is not available for ${scalarize(c.platform_type) || 'this'} Cloud`);
        return;
      }
      const res = await Promise.race([
        p.includes('openstack')
          ? api.get<ApiRecord>(`openstack/migration/${id}/virtual_machines`)
          : api.get<ApiRecord>('vmware/migrate/virtual_machines', { cloud_id: id }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`The hypervisor did not answer within ${LIST_TIMEOUT_MS / 1000}s.`)), LIST_TIMEOUT_MS)
        ),
      ]);
      const taskId = (res?.celery_task as ApiRecord | undefined)?.task_id ?? res?.task_id;
      setVms(asRows(taskId ? await awaitTask(String(taskId), 40) : res));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this cloud.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const idOf = (vm: ApiRecord) => String(vm.instance_id ?? vm.uuid ?? vm.id ?? '');

  const confirmPowerOn = async () => {
    if (!powerOn) return;
    setBusy(true);
    try {
      await api.rawPost(buildUrl(openstack ? 'openstack/migration/power_on' : 'vmware/migrate/power_on'), {
        vm_id: idOf(powerOn),
        cloud_uuid: id,
      });
      toast.success('VM Powered On', 'Power');
      setPowerOn(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not power the VM on.');
    } finally {
      setBusy(false);
    }
  };

  const saveIp = async (values: ApiRecord) => {
    if (!ipFor) return;
    setBusy(true);
    try {
      await api.rawPost(buildUrl(`${openstack ? 'openstack/migration' : 'vmware/migrate'}/${idOf(ipFor)}`), {
        cloud_id: id,
        management_ip: values.management_ip,
      });
      toast.success('Associated Management IP.', 'Saved');
      setIpFor(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not associate the IP.');
    } finally {
      setBusy(false);
    }
  };

  const isOn = (vm: ApiRecord) => {
    const s = scalarize(vm.state ?? vm.power_state);
    return s === 'poweredOn' || s.toUpperCase() === 'ACTIVE';
  };

  return (
    <div className="content-fade">
      <div style={{ marginBottom: 14 }}>
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => navigate(`/cloud/${id}`)}>
          Back to Cloud
        </Button>
      </div>

      <Card>
        <CardHead
          title={`Virtual Machines in ${scalarize(cloud?.name) || 'this cloud'}`}
          icon="cloud"
          action={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {platform && <Badge tone="info">{platform}</Badge>}
              <Badge tone="brand">{vms.length}</Badge>
              <Button variant="default" size="sm" icon="refresh-cw" onClick={load} disabled={loading}>
                Refresh
              </Button>
            </div>
          }
        />
        {loading ? (
          <LoadingBlock label="Asking the hypervisor for its virtual machines..." />
        ) : error ? (
          <EmptyState
            icon="alert-triangle"
            title="Could not list virtual machines"
            message={error}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={load}>
                Retry
              </Button>
            }
          />
        ) : vms.length === 0 ? (
          <EmptyState icon="cloud" title="No virtual machines" message="This cloud reported no virtual machines." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Operating System</th>
                  <th>Host Name</th>
                  <th className="col-num">CPU Cores</th>
                  <th className="col-num">vCPUs</th>
                  <th className="col-num">Memory</th>
                  <th>Management IP</th>
                  <th className="col-center">Power State</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vms.map((vm, i) => (
                  <tr key={idOf(vm) || i}>
                    <td>{scalarize(vm.name ?? vm.vm_name) || '-'}</td>
                    <td>{scalarize(vm.os_name ?? vm.guest_os) || '-'}</td>
                    <td>{scalarize(vm.host_name) || '-'}</td>
                    <td className="col-num">{scalarize(vm.cpu_core ?? vm.cpus) || '-'}</td>
                    <td className="col-num">{scalarize(vm.vcpus) || '-'}</td>
                    <td className="col-num">{scalarize(vm.guest_memory ?? vm.ram_size) || '-'}</td>
                    <td className="cell-mono">{scalarize(vm.management_ip ?? vm.internal_ip) || '-'}</td>
                    <td className="col-center">
                      <Badge tone={isOn(vm) ? 'success' : 'neutral'} dot>
                        {scalarize(vm.state ?? vm.power_state) || '-'}
                      </Badge>
                    </td>
                    <td className="col-actions">
                      <span className="row-actions" style={{ opacity: 1 }}>
                        {!isOn(vm) && <IconAction icon="play" title="Power On" onClick={() => setPowerOn(vm)} />}
                        <IconAction
                          icon="terminal"
                          title="Web Console"
                          onClick={() =>
                            navigate(
                              `/${openstack ? 'openstack-vm' : 'vmware-vm'}/console/${idOf(vm)}`
                            )
                          }
                        />
                        <IconAction icon="network" title="Add Management IP Address" onClick={() => setIpFor(vm)} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {powerOn && (
        <ConfirmDialog
          title="Power on VM?"
          message={
            <>
              Power on <strong>{scalarize(powerOn.name ?? powerOn.vm_name)}</strong>?
            </>
          }
          loading={busy}
          onConfirm={confirmPowerOn}
          onCancel={() => setPowerOn(null)}
        />
      )}

      {ipFor && (
        <FormModal
          title="Add Management IP Address"
          subtitle={scalarize(ipFor.name ?? ipFor.vm_name)}
          onClose={() => setIpFor(null)}
        >
          <RecordForm
            fields={IP_FIELDS}
            method="Add"
            submitting={busy}
            onSubmit={saveIp}
            onCancel={() => setIpFor(null)}
          />
        </FormModal>
      )}

    </div>
  );
}
