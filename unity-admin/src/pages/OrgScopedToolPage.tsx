import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../data/apiClient';
import { awaitTask } from '../data/task';
import { ApiRecord } from '../data/types';
import { FieldDef } from '../config/fieldTypes';
import { deriveColumns, scalarize } from '../utils/format';
import { Card, CardHead, Button, LoadingBlock, EmptyState, Badge } from '../components/ui/primitives';
import { DataTable } from '../components/ui/DataTable';
import { Icon } from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';
import { ConfirmDialog, FormModal } from '../components/ui/Overlay';
import { RecordForm } from '../components/forms/RecordForm';

/*
 * The legacy /services/* tool pages share one flow: choose an Organization, optionally
 * narrow to one of its private Clouds, then press the fetch button to list the matching
 * VMs / instances. Terraform is org-scoped; VM Migration, VM Backup and DB Instance are
 * cloud-scoped (org -> cloud -> results).
 */
export interface OrgScopedToolProps {
  title: string;
  description: string;
  icon: string;
  actionLabel: string;          // e.g. "Get Clouds" / "Get Terrform VMs"
  resultUri: string;            // endpoint queried once the scope is chosen
  scope: 'org' | 'cloud';       // 'cloud' adds the second selector
  resultParam?: string;         // query param name (defaults to org_id / cloud_id)
  emptyLabel: string;           // e.g. "Virtual Machines"
  columns?: FieldDef[];

  /* Endpoint that refreshes the backing table from the hypervisor BEFORE the list is
     read. DB Instance needs it: legacy calls
     vmware/db_instance/populate_database_instance_list first, polls the celery task it
     returns, and only then reads vmware/db_instance/. Skipping it meant the page could
     only ever show stale rows. */
  populateUri?: string;
  /* Cloud platform types this tool supports. Legacy refused anything but VMware here
     with an explicit message rather than silently returning nothing. */
  platformTypes?: string[];

  /* Optional Add action: a RecordForm over `addFields` POSTed to `addUri`, with the
     chosen scope merged in under `addScopeKey`. */
  addUri?: string;
  addFields?: FieldDef[];
  addScopeKey?: string;
  addTitle?: string;

  /* Per-row CRUD against `rowUri`. Terraform needs it: the legacy page could create,
     edit, delete and re-password each provisioned VM, none of which survived the
     port. Omit to keep the table read-only. */
  rowUri?: string;
  rowIdField?: string;
  editFields?: FieldDef[];
  /* A second, narrower form on the same resource - legacy's "Modify Password". */
  secondaryLabel?: string;
  secondaryIcon?: string;
  secondaryFields?: FieldDef[];
  /* A per-row link, e.g. Terraform's web console. {field} is filled from the row. */
  rowLinkLabel?: string;
  rowLinkIcon?: string;
  rowLinkTo?: string;
}

export function OrgScopedToolPage({
  title,
  description,
  icon,
  actionLabel,
  resultUri,
  scope,
  resultParam,
  emptyLabel,
  columns,
  populateUri,
  platformTypes,
  addUri,
  addFields,
  addScopeKey = 'cloud',
  addTitle,
  rowUri,
  rowIdField = 'id',
  editFields,
  secondaryLabel,
  secondaryIcon = 'key',
  secondaryFields,
  rowLinkLabel,
  rowLinkIcon = 'terminal',
  rowLinkTo,
}: OrgScopedToolProps) {
  const toast = useToast();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<ApiRecord[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [orgId, setOrgId] = useState('');

  const [clouds, setClouds] = useState<ApiRecord[]>([]);
  const [cloudsLoading, setCloudsLoading] = useState(false);
  const [cloudId, setCloudId] = useState('');

  const [rows, setRows] = useState<ApiRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editRow, setEditRow] = useState<{ row: ApiRecord; mode: 'edit' | 'secondary' } | null>(null);
  const [deleteRow, setDeleteRow] = useState<ApiRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .list<ApiRecord>('fast/org', { page_size: 500 })
      .then(({ items }) => active && setOrgs(items))
      .catch(() => active && setOrgs([]))
      .finally(() => active && setOrgsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // When the org changes on a cloud-scoped page, reload that org's clouds.
  useEffect(() => {
    setCloudId('');
    setRows(null);
    if (scope !== 'cloud' || !orgId) {
      setClouds([]);
      return;
    }
    let active = true;
    setCloudsLoading(true);
    api
      .list<ApiRecord>('fast/private_cloud', { org_id: orgId })
      .then(({ items }) => active && setClouds(items))
      .catch(() => active && setClouds([]))
      .finally(() => active && setCloudsLoading(false));
    return () => {
      active = false;
    };
  }, [orgId, scope]);

  const canFetch = scope === 'cloud' ? !!cloudId : !!orgId;

  const selectedCloud = clouds.find((c) => String(c.uuid ?? c.id) === cloudId);

  const fetchResults = async () => {
    if (!canFetch) return;
    const param = resultParam || (scope === 'cloud' ? 'cloud_id' : 'org_id');
    const value = scope === 'cloud' ? cloudId : orgId;

    // Legacy named the unsupported platform in the message; keep that.
    if (platformTypes && selectedCloud) {
      const platform = scalarize(selectedCloud.platform_type);
      if (!platformTypes.includes(platform)) {
        setRows([]);
        setUnsupported(`This feature is not available for ${platform || 'this'} Cloud`);
        return;
      }
    }
    setUnsupported(null);
    setError(null);
    setLoading(true);
    setRows(null);
    try {
      if (populateUri) {
        const res = await api.get<ApiRecord>(populateUri, { [param]: value });
        if (res && res.task_id) await awaitTask(String(res.task_id));
      }
      const { items } = await api.list<ApiRecord>(resultUri, { [param]: value });
      setRows(items);
      if (!items.length) toast.info(`No ${emptyLabel.toLowerCase()} found for this selection.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Could not load ${emptyLabel.toLowerCase()}.`;
      setError(msg);
      setRows([]);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const submitAdd = async (values: ApiRecord) => {
    if (!addUri) return;
    setSaving(true);
    try {
      await api.create(addUri, { ...values, [addScopeKey]: scope === 'cloud' ? cloudId : orgId });
      toast.success(`${addTitle || 'Record'} deployment is initializing.`, 'Submitted');
      setAddOpen(false);
      fetchResults();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create the record.');
    } finally {
      setSaving(false);
    }
  };

  const saveRow = async (values: ApiRecord) => {
    if (!rowUri || !editRow) return;
    setSaving(true);
    try {
      const id = String(editRow.row[rowIdField]);
      await api.update(rowUri, id, { ...editRow.row, ...values });
      toast.success(editRow.mode === 'secondary' ? `${secondaryLabel} done.` : 'Saved.', 'Updated');
      setEditRow(null);
      fetchResults();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save this record.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteRow = async () => {
    if (!rowUri || !deleteRow) return;
    setDeleting(true);
    try {
      await api.remove(rowUri, String(deleteRow[rowIdField]));
      toast.success('Deleted Successfully', 'Removed');
      setDeleteRow(null);
      fetchResults();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete this record.');
    } finally {
      setDeleting(false);
    }
  };

  const cols = useMemo(() => columns || deriveColumns(rows && rows[0] ? rows[0] : undefined), [columns, rows]);
  const scopeName =
    scope === 'cloud'
      ? scalarize(selectedCloud?.name)
      : scalarize(orgs.find((o) => String(o.id) === orgId)?.name);

  return (
    <div className="content-fade">
      <Card style={{ marginBottom: 18 }}>
        <CardHead title={title} icon={icon} />
        <div style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 16 }}>{description}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
            <div className="field" style={{ flex: '1 1 260px', maxWidth: 380, marginBottom: 0 }}>
              <label>Organization</label>
              <select value={orgId} onChange={(e) => setOrgId(e.target.value)} disabled={orgsLoading}>
                <option value="">{orgsLoading ? 'Loading organizations...' : 'Select an organization'}</option>
                {orgs.map((o) => (
                  <option key={String(o.id)} value={String(o.id)}>
                    {scalarize(o.name)}
                  </option>
                ))}
              </select>
            </div>

            {scope === 'cloud' && (
              <div className="field" style={{ flex: '1 1 260px', maxWidth: 380, marginBottom: 0 }}>
                <label>Cloud</label>
                <select value={cloudId} onChange={(e) => setCloudId(e.target.value)} disabled={!orgId || cloudsLoading}>
                  <option value="">
                    {!orgId ? 'Select an organization first' : cloudsLoading ? 'Loading clouds...' : 'Select a cloud'}
                  </option>
                  {clouds.map((c) => (
                    <option key={String(c.uuid ?? c.id)} value={String(c.uuid ?? c.id)}>
                      {scalarize(c.name)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button variant="primary" icon="search" onClick={fetchResults} disabled={!canFetch} loading={loading}>
              {actionLabel}
            </Button>
          </div>
          {unsupported && (
            <div className="form-banner" style={{ marginTop: 14 }}>
              {unsupported}
            </div>
          )}
        </div>
      </Card>

      {rows !== null && (
        <Card>
          <CardHead
            title={emptyLabel}
            icon={icon}
            action={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Badge tone="brand">
                  {rows.length} for {scopeName || 'selection'}
                </Badge>
                {addUri && addFields && (
                  <Button variant="primary" size="sm" icon="plus" disabled={!canFetch} onClick={() => setAddOpen(true)}>
                    Add
                  </Button>
                )}
              </div>
            }
          />
          {loading ? (
            <LoadingBlock />
          ) : error ? (
            <EmptyState
              icon="alert-triangle"
              title={`Failed to load ${emptyLabel.toLowerCase()}`}
              message={error}
              action={
                <Button variant="default" size="sm" icon="refresh-cw" onClick={fetchResults}>
                  Retry
                </Button>
              }
            />
          ) : rows.length === 0 ? (
            <EmptyState icon="inbox" title={`No ${emptyLabel.toLowerCase()}`} message="Nothing was returned for this selection." />
          ) : (
            <DataTable
              columns={cols}
              rows={rows}
              idField={rowIdField}
              showActions={Boolean(rowUri)}
              onEdit={rowUri && editFields ? (row) => setEditRow({ row, mode: 'edit' }) : undefined}
              onDelete={rowUri ? (row) => setDeleteRow(row) : undefined}
              rowActions={[
                ...(rowLinkTo ? [{ kind: 'row-link' as const, label: rowLinkLabel || 'Open', icon: rowLinkIcon }] : []),
                ...(rowUri && secondaryFields
                  ? [{ kind: 'row-post' as const, label: secondaryLabel || 'Modify', icon: secondaryIcon }]
                  : []),
              ]}
              onRowAction={(a, row) => {
                if (a.kind === 'row-link' && rowLinkTo) {
                  navigate(rowLinkTo.replace(/\{(\w+)\}/g, (_m, k) => encodeURIComponent(String(row[k] ?? ''))));
                  return;
                }
                setEditRow({ row, mode: 'secondary' });
              }}
            />
          )}
        </Card>
      )}

      {editRow && (
        <FormModal
          title={editRow.mode === 'secondary' ? secondaryLabel || 'Modify' : `Edit ${addTitle || emptyLabel}`}
          subtitle={scalarize(editRow.row.vm_name ?? editRow.row.name ?? editRow.row.hostname)}
          onClose={() => setEditRow(null)}
        >
          <RecordForm
            fields={(editRow.mode === 'secondary' ? secondaryFields : editFields) || []}
            method="Edit"
            initial={editRow.row}
            submitting={saving}
            onSubmit={saveRow}
            onCancel={() => setEditRow(null)}
          />
        </FormModal>
      )}

      {deleteRow && (
        <ConfirmDialog
          title="Delete record?"
          message={
            <>
              Delete <strong>{scalarize(deleteRow.vm_name ?? deleteRow.name ?? deleteRow.hostname)}</strong>? This
              cannot be undone.
            </>
          }
          loading={deleting}
          onConfirm={confirmDeleteRow}
          onCancel={() => setDeleteRow(null)}
        />
      )}

      {addOpen && addUri && addFields && (
        <FormModal
          title={`Create ${addTitle || emptyLabel}`}
          subtitle={scopeName}
          onClose={() => setAddOpen(false)}
        >
          <RecordForm
            fields={addFields}
            method="Add"
            submitting={saving}
            onSubmit={submitAdd}
            onCancel={() => setAddOpen(false)}
          />
        </FormModal>
      )}

      {rows === null && !loading && (
        <Card>
          <div className="empty-state">
            <div className="empty-ic">
              <Icon name={icon} size={26} />
            </div>
            <h4>{scope === 'cloud' ? 'Select an organization and cloud' : 'Select an organization'}</h4>
            <p>
              Choose {scope === 'cloud' ? 'an organization and one of its clouds' : 'an organization'} above, then press
              "{actionLabel}" to load its {emptyLabel.toLowerCase()}.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
