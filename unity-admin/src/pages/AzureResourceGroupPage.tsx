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
 * Azure resource-group drill-down - absent from the port entirely, so an Azure account
 * was a single row with nothing behind it.
 *
 *   GET    v3/azure/{account}/resource_group/                    the groups
 *   POST   v3/azure/resource_group/                              add one
 *   DELETE v3/azure/{account}/resource_group/{id}                remove one
 *   GET    v3/azure/{account}/resource_group/{name}/resources/   inventory in a group
 *   GET    v3/azure/{account}/resource_group/{name}/virtual_machines/
 *
 * Reads accept either the rows directly or a { celery_task: { task_id } } envelope, the
 * same as the AWS region page.
 */

const asRows = (v: unknown): ApiRecord[] => {
  if (Array.isArray(v)) return v as ApiRecord[];
  if (v && typeof v === 'object') {
    const o = v as ApiRecord;
    for (const k of ['results', 'data', 'result']) if (Array.isArray(o[k])) return o[k] as ApiRecord[];
  }
  return [];
};

const NEW_GROUP_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Resource Group Name', cell: 'text', required: true },
  { name: 'location', label: 'Location', cell: 'text', required: true, placeholder: 'e.g. eastus' },
];

export function AzureResourceGroupPage() {
  const { accountId = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [groups, setGroups] = useState<ApiRecord[]>([]);
  const [selected, setSelected] = useState<ApiRecord | null>(null);
  const [resources, setResources] = useState<ApiRecord[]>([]);
  const [vms, setVms] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [childLoading, setChildLoading] = useState(false);
  const [childError, setChildError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiRecord | null>(null);
  const [busy, setBusy] = useState(false);

  const base = `v3/azure/${accountId}/resource_group`;

  const read = useCallback(async (suffix: string): Promise<unknown> => {
    const res = await api.get<unknown>(suffix);
    const env = res && typeof res === 'object' ? (res as ApiRecord) : null;
    const celery = env ? (env.celery_task as ApiRecord | undefined) : undefined;
    const taskId = celery?.task_id ?? env?.task_id;
    return taskId ? awaitTask(String(taskId)) : res;
  }, []);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setGroups(asRows(await read(base)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the resource groups.');
    } finally {
      setLoading(false);
    }
  }, [base, read]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const openGroup = async (g: ApiRecord) => {
    setSelected(g);
    setResources([]);
    setVms([]);
    setChildError(null);
    setChildLoading(true);
    const name = scalarize(g.name);
    try {
      const [r, v] = await Promise.all([
        read(`${base}/${name}/resources`),
        read(`${base}/${name}/virtual_machines`),
      ]);
      setResources(asRows(r));
      setVms(asRows(v));
    } catch (err) {
      setChildError(err instanceof Error ? err.message : 'Could not load group details.');
    } finally {
      setChildLoading(false);
    }
  };

  const addGroup = async (values: ApiRecord) => {
    setBusy(true);
    try {
      // Legacy POSTs to the account-less path with the account in the body.
      await api.rawPost(buildUrl('v3/azure/resource_group'), { ...values, account: accountId });
      toast.success('Resource group created.', 'Azure');
      setAddOpen(false);
      loadGroups();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create the resource group.');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await api.remove(base, String(deleteTarget.id ?? deleteTarget.name));
      toast.success('Resource group removed.', 'Azure');
      if (selected && selected.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      loadGroups();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove the resource group.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="content-fade">
      <div style={{ marginBottom: 14 }}>
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => navigate('/azure-dashboard')}>
          Back to Azure Accounts
        </Button>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <CardHead
          title="Resource Groups"
          icon="boxes"
          action={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Badge tone="neutral">account {accountId}</Badge>
              <Badge tone="brand">{groups.length}</Badge>
              <Button variant="primary" size="sm" icon="plus" onClick={() => setAddOpen(true)}>
                Add
              </Button>
            </div>
          }
        />
        {loading ? (
          <LoadingBlock label="Loading resource groups..." />
        ) : error ? (
          <EmptyState
            icon="alert-triangle"
            title="Could not load"
            message={error}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={loadGroups}>
                Retry
              </Button>
            }
          />
        ) : groups.length === 0 ? (
          <EmptyState icon="boxes" title="No resource groups" message="This subscription has no resource groups." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Provisioning State</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g, i) => (
                  <tr
                    key={String(g.id ?? i)}
                    className={selected && selected.id === g.id ? 'row-selected' : ''}
                    style={{ cursor: 'pointer' }}
                    onClick={() => openGroup(g)}
                  >
                    <td>{scalarize(g.name) || '-'}</td>
                    <td>{scalarize(g.location) || '-'}</td>
                    <td>{scalarize(g.provisioning_state) || '-'}</td>
                    <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                      <span className="row-actions" style={{ opacity: 1 }}>
                        <IconAction icon="trash-2" title="Delete" danger onClick={() => setDeleteTarget(g)} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && (
        <div className="detail-grid">
          <div className="detail-col">
            <Card>
              <CardHead
                title={`Resources in ${scalarize(selected.name)}`}
                icon="layers"
                action={<Badge tone="brand">{resources.length}</Badge>}
              />
              {childLoading ? (
                <LoadingBlock label="Loading resources..." />
              ) : childError ? (
                <EmptyState
                  icon="alert-triangle"
                  title="Failed to load resources"
                  message={childError}
                  action={
                    <Button variant="default" size="sm" icon="refresh-cw" onClick={() => openGroup(selected)}>
                      Retry
                    </Button>
                  }
                />
              ) : resources.length === 0 ? (
                <EmptyState icon="layers" title="No resources" message="This group is empty." />
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>SKU</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map((r, i) => (
                        <tr key={String(r.id ?? i)}>
                          <td>{scalarize(r.name) || '-'}</td>
                          <td className="cell-mono">{scalarize(r.type) || '-'}</td>
                          <td>{scalarize(r.location) || '-'}</td>
                          <td>{scalarize(r.sku) || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          <div className="detail-col">
            <Card>
              <CardHead
                title={`Virtual Machines in ${scalarize(selected.name)}`}
                icon="server"
                action={<Badge tone="brand">{vms.length}</Badge>}
              />
              {childLoading ? (
                <LoadingBlock label="Loading virtual machines..." />
              ) : childError ? (
                <EmptyState
                  icon="alert-triangle"
                  title="Failed to load virtual machines"
                  message={childError}
                  action={
                    <Button variant="default" size="sm" icon="refresh-cw" onClick={() => openGroup(selected)}>
                      Retry
                    </Button>
                  }
                />
              ) : vms.length === 0 ? (
                <EmptyState icon="server" title="No virtual machines" message="This group has no VMs." />
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Size</th>
                        <th>OS</th>
                        <th>Power State</th>
                        <th>Private IP</th>
                        <th>Public IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vms.map((v, i) => (
                        <tr key={String(v.id ?? i)}>
                          <td>{scalarize(v.name) || '-'}</td>
                          <td>{scalarize(v.vm_size) || '-'}</td>
                          <td>{scalarize(v.os_type) || '-'}</td>
                          <td>
                            <Badge tone={/running/i.test(scalarize(v.power_state)) ? 'success' : 'neutral'} dot>
                              {scalarize(v.power_state) || '-'}
                            </Badge>
                          </td>
                          <td className="cell-mono">{scalarize(v.private_ip) || '-'}</td>
                          <td className="cell-mono">{scalarize(v.public_ip) || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {addOpen && (
        <FormModal title="Add Resource Group" subtitle={`Azure account ${accountId}`} onClose={() => setAddOpen(false)}>
          <RecordForm
            fields={NEW_GROUP_FIELDS}
            method="Add"
            submitting={busy}
            onSubmit={addGroup}
            onCancel={() => setAddOpen(false)}
          />
        </FormModal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete resource group?"
          message={
            <>
              Delete <strong>{scalarize(deleteTarget.name)}</strong> from this subscription? Everything inside it goes
              with it.
            </>
          }
          loading={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
