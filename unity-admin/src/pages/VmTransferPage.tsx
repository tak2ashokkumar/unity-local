import { useCallback, useEffect, useState } from 'react';
import { api, buildUrl } from '../data/apiClient';
import { awaitTask } from '../data/task';
import { ApiRecord } from '../data/types';
import { formatDate, scalarize } from '../utils/format';
import { FieldDef } from '../config/fieldTypes';
import { Badge, Button, Card, CardHead, EmptyState, IconAction, LoadingBlock } from '../components/ui/primitives';
import { FormModal } from '../components/ui/Overlay';
import { RecordForm } from '../components/forms/RecordForm';
import { useToast } from '../components/ui/Toast';

/*
 * VM Migration and VM Backup - one flow, two verbs (VmMigrationController and
 * VmBackupController, controllers/cloud.js:947 / :1211). The port listed the VMs and
 * stopped there: neither the action itself nor Backup History survived.
 *
 *   choose org -> choose one of its clouds -> list that cloud's VMs
 *     vmware/migrate/virtual_machines/?cloud_id={uuid}
 *     openstack/migration/{uuid}/virtual_machines/
 *   pick a target account (AWS or Azure) and submit
 *     POST vmware/migrate/vm_migrate/       { vm_id, target_type, cloud_uuid, account }
 *     POST openstack/migration/vm_migrate/  (same body)
 *     POST vmware/migrate/vmware_vm_backup/ (backup mode)
 *   history
 *     vmware/migrate/{id}/vmware_backup_history/     -> { vmware_backup_list }
 *     v3/vm_backup/{id}/openstack_backup_history/    -> { openstack_backup_list }
 *
 * Two guards are the legacy controller's, and both matter: only VMware and OpenStack
 * clouds are supported, and a VM must be POWERED OFF before it can be moved
 * (vmware 'poweredOff' / openstack 'SHUTOFF').
 */

export interface VmTransferProps {
  mode: 'migrate' | 'backup';
  title: string;
  description: string;
  icon: string;
}

const asRows = (v: unknown): ApiRecord[] => {
  if (Array.isArray(v)) return v as ApiRecord[];
  if (v && typeof v === 'object') {
    const o = v as ApiRecord;
    for (const k of ['results', 'data', 'result', 'info']) if (Array.isArray(o[k])) return o[k] as ApiRecord[];
  }
  return [];
};

const platformOf = (c: ApiRecord | undefined): string => scalarize(c?.platform_type).toLowerCase();
const isOpenStack = (c: ApiRecord | undefined) => platformOf(c).includes('openstack');
const isVmware = (c: ApiRecord | undefined) => platformOf(c).includes('vmware');

const POWERED_OFF = (row: ApiRecord, openstack: boolean) =>
  openstack ? scalarize(row.power_state).toUpperCase() === 'SHUTOFF' : scalarize(row.power_state) === 'poweredOff';

export function VmTransferPage({ mode, title, description, icon }: VmTransferProps) {
  const toast = useToast();

  const [orgs, setOrgs] = useState<ApiRecord[]>([]);
  const [orgId, setOrgId] = useState('');
  const [clouds, setClouds] = useState<ApiRecord[]>([]);
  const [cloudUuid, setCloudUuid] = useState('');
  const [vms, setVms] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState<string | null>(null);

  const [target, setTarget] = useState<{ vm: ApiRecord; type: 'AWS' | 'Azure'; accounts: ApiRecord[] } | null>(null);
  const [history, setHistory] = useState<{ vm: ApiRecord; rows: ApiRecord[] } | null>(null);
  const [busy, setBusy] = useState(false);

  const cloud = clouds.find((c) => String(c.uuid ?? c.id) === cloudUuid);
  const openstack = isOpenStack(cloud);

  useEffect(() => {
    let active = true;
    api
      .list<ApiRecord>('fast/org', { page_size: 500 })
      .then(({ items }) => active && setOrgs(items))
      .catch(() => active && setOrgs([]));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setCloudUuid('');
    setVms([]);
    setError(null);
    setUnsupported(null);
    if (!orgId) {
      setClouds([]);
      return;
    }
    /* Guarded like every sibling page (OrgScopedToolPage, DashboardPage, useResource).
       Without it a slow response for org A lands after org B's and repaints the cloud
       dropdown with the WRONG tenant's clouds - and this page then migrates or backs up
       a VM into whatever account that dropdown named. */
    let active = true;
    api
      .list<ApiRecord>('fast/private_cloud', { org_id: orgId })
      .then(({ items }) => active && setClouds(items))
      .catch(() => active && setClouds([]));
    return () => {
      active = false;
    };
  }, [orgId]);

  const loadVms = useCallback(async () => {
    if (!cloudUuid) return;
    if (!isVmware(cloud) && !isOpenStack(cloud)) {
      setVms([]);
      setUnsupported(`This feature is not available for ${scalarize(cloud?.platform_type) || 'this'} Cloud`);
      return;
    }
    setUnsupported(null);
    setError(null);
    setLoading(true);
    setVms([]);
    try {
      const res = isOpenStack(cloud)
        ? await api.get<ApiRecord>(`openstack/migration/${cloudUuid}/virtual_machines`)
        : await api.get<ApiRecord>('vmware/migrate/virtual_machines', { cloud_id: cloudUuid });
      const taskId = (res?.celery_task as ApiRecord | undefined)?.task_id ?? res?.task_id;
      setVms(asRows(taskId ? await awaitTask(String(taskId)) : res));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not load the virtual machines.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [cloudUuid, cloud, toast]);

  /* Target accounts come from the public-cloud lists, scoped to the same organization. */
  const openTarget = async (vm: ApiRecord, type: 'AWS' | 'Azure') => {
    if (!POWERED_OFF(vm, openstack)) {
      toast.error(`Power off ${scalarize(vm.vm_name)} before ${mode === 'backup' ? 'backing it up' : 'migrating it'}.`);
      return;
    }
    try {
      const res = await api.list<ApiRecord>(type === 'AWS' ? 'v3/aws' : 'v3/azure', { org_id: orgId });
      setTarget({ vm, type, accounts: res.items });
    } catch {
      toast.error(`Could not load the ${type} accounts.`);
    }
  };

  const submitTransfer = async (values: ApiRecord) => {
    if (!target) return;
    setBusy(true);
    try {
      const path =
        mode === 'backup'
          ? 'vmware/migrate/vmware_vm_backup'
          : openstack
          ? 'openstack/migration/vm_migrate'
          : 'vmware/migrate/vm_migrate';
      await api.rawPost(buildUrl(path), {
        vm_id: target.vm.instance_id ?? target.vm.uuid ?? target.vm.id,
        target_type: target.type,
        cloud_uuid: cloudUuid,
        account: values.account,
      });
      toast.success(
        mode === 'backup'
          ? 'VM back up Process Initiated. Process will take a while'
          : 'VM migration initiated successfully. Process will take a while.',
        mode === 'backup' ? 'Backup' : 'Migration'
      );
      setTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'The request failed.');
    } finally {
      setBusy(false);
    }
  };

  const openHistory = async (vm: ApiRecord) => {
    const id = String(vm.instance_id ?? vm.id ?? '');
    try {
      const res = openstack
        ? await api.get<ApiRecord>(`v3/vm_backup/${id}/openstack_backup_history`)
        : await api.get<ApiRecord>(`vmware/migrate/${id}/vmware_backup_history`);
      const rows = asRows(res?.vmware_backup_list ?? res?.openstack_backup_list ?? res);
      setHistory({ vm, rows });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load the backup history.');
    }
  };

  const accountFields: FieldDef[] = [
    {
      name: 'account',
      label: `${target?.type || 'Target'} Account`,
      cell: 'text',
      input: 'obj_choices',
      required: true,
      objChoices: (target?.accounts || []).map((a) => ({
        value: String(a.id),
        label: `${scalarize(a.account_name ?? a.name)} (${scalarize(a.region) || 'region'})`,
      })),
    },
  ];

  return (
    <div className="content-fade">
      <Card style={{ marginBottom: 18 }}>
        <CardHead title={title} icon={icon} />
        <div style={{ padding: '14px 20px 0', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>{description}</div>
        <div className="queue-controls">
          <div className="field" style={{ flex: '1 1 260px', maxWidth: 360 }}>
            <label>Organization</label>
            <select value={orgId} onChange={(e) => setOrgId(e.target.value)}>
              <option value="">Select an organization</option>
              {orgs.map((o) => (
                <option key={String(o.id)} value={String(o.id)}>
                  {scalarize(o.name)}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ flex: '1 1 260px', maxWidth: 360 }}>
            <label>Cloud</label>
            <select value={cloudUuid} disabled={!orgId} onChange={(e) => setCloudUuid(e.target.value)}>
              <option value="">{orgId ? 'Select a cloud' : 'Select an organization first'}</option>
              {clouds.map((c) => (
                <option key={String(c.uuid ?? c.id)} value={String(c.uuid ?? c.id)}>
                  {scalarize(c.name)} ({scalarize(c.platform_type)})
                </option>
              ))}
            </select>
          </div>
          <Button variant="primary" icon="search" disabled={!cloudUuid || loading} onClick={loadVms}>
            Get VMs
          </Button>
        </div>
        {unsupported && (
          <div className="form-banner" style={{ margin: '0 20px 18px' }}>
            {unsupported}
          </div>
        )}
      </Card>

      <Card>
        <CardHead title="Virtual Machines" icon="cloud" action={<Badge tone="brand">{vms.length}</Badge>} />
        {loading ? (
          <LoadingBlock label="Loading virtual machines..." />
        ) : error ? (
          <EmptyState
            icon="alert-triangle"
            title="Failed to load virtual machines"
            message={error}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={loadVms}>
                Retry
              </Button>
            }
          />
        ) : vms.length === 0 ? (
          <EmptyState
            icon="cloud"
            title="No virtual machines"
            message={cloudUuid ? 'This cloud returned no virtual machines.' : 'Choose an organization and cloud, then press Get VMs.'}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>VM Name</th>
                  <th>Guest OS</th>
                  <th className="col-num">CPUs</th>
                  <th className="col-num">RAM (MB)</th>
                  <th>Internal IP</th>
                  <th className="col-center">Power State</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vms.map((vm, i) => {
                  const off = POWERED_OFF(vm, openstack);
                  return (
                    <tr key={String(vm.instance_id ?? vm.uuid ?? i)}>
                      <td>{scalarize(vm.vm_name ?? vm.name) || '-'}</td>
                      <td>{scalarize(vm.guest_os) || '-'}</td>
                      <td className="col-num">{scalarize(vm.cpus) || '-'}</td>
                      <td className="col-num">{scalarize(vm.ram_size) || '-'}</td>
                      <td className="cell-mono">{scalarize(vm.internal_ip) || '-'}</td>
                      <td className="col-center">
                        <Badge tone={off ? 'neutral' : 'success'} dot>
                          {scalarize(vm.power_state) || '-'}
                        </Badge>
                      </td>
                      <td className="col-actions">
                        <span className="row-actions" style={{ opacity: 1 }}>
                          <IconAction
                            icon="box"
                            title={off ? `${mode === 'backup' ? 'Back up' : 'Migrate'} to AWS` : 'Power off the VM first'}
                            onClick={() => openTarget(vm, 'AWS')}
                          />
                          <IconAction
                            icon="monitor"
                            title={off ? `${mode === 'backup' ? 'Back up' : 'Migrate'} to Azure` : 'Power off the VM first'}
                            onClick={() => openTarget(vm, 'Azure')}
                          />
                          {mode === 'backup' && (
                            <IconAction icon="history" title="Backup History" onClick={() => openHistory(vm)} />
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {target && (
        <FormModal
          title={`${mode === 'backup' ? 'Back up' : 'Migrate'} to ${target.type}`}
          subtitle={scalarize(target.vm.vm_name ?? target.vm.name)}
          onClose={() => setTarget(null)}
        >
          {target.accounts.length === 0 ? (
            <div className="record-form">
              <div className="form-grid">
                <div className="form-banner">
                  This organization has no {target.type} account to use as a target.
                </div>
              </div>
              <div className="form-actions">
                <Button variant="default" onClick={() => setTarget(null)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <RecordForm
              fields={accountFields}
              method="Add"
              submitting={busy}
              onSubmit={submitTransfer}
              onCancel={() => setTarget(null)}
            />
          )}
        </FormModal>
      )}

      {history && (
        <FormModal
          title="Backup History"
          subtitle={scalarize(history.vm.vm_name ?? history.vm.name)}
          onClose={() => setHistory(null)}
        >
          <div className="record-form">
            {history.rows.length === 0 ? (
              <div className="form-grid">
                <div className="form-banner">No records found</div>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Backup</th>
                      <th>Target</th>
                      <th>Status</th>
                      <th className="col-num">Size (GB)</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.rows.map((r, i) => (
                      <tr key={String(r.backup_id ?? i)}>
                        <td className="cell-mono">{scalarize(r.backup_id) || '-'}</td>
                        <td>{scalarize(r.target) || '-'}</td>
                        <td>
                          <Badge tone={/success/i.test(scalarize(r.status)) ? 'success' : 'danger'} dot>
                            {scalarize(r.status) || '-'}
                          </Badge>
                        </td>
                        <td className="col-num cell-mono">{scalarize(r.size_gb) || '-'}</td>
                        <td className="cell-mono">{formatDate(r.created_at) || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="form-actions">
              <Button variant="default" onClick={() => setHistory(null)}>
                Close
              </Button>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
