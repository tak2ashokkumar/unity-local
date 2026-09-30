import { useDeferredValue, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResource } from '../config/resources';
import { FieldDef, ResourceConfig, RowAction } from '../config/fieldTypes';
import { ApiRecord } from '../data/types';
import { api, ApiError, buildUrl } from '../data/apiClient';
import { useList } from '../data/useResource';
import { deriveColumns, scalarize } from '../utils/format';
import { Card } from '../components/ui/primitives';
import { Button, EmptyState, LoadingBlock } from '../components/ui/primitives';
import { DataTable, SortState } from '../components/ui/DataTable';
import { Pagination } from '../components/ui/Pagination';
import { FormModal } from '../components/ui/Overlay';
import { ConfirmDialog } from '../components/ui/Overlay';
import { RecordForm } from '../components/forms/RecordForm';
import { ChangeEntityPasswordModal } from '../components/forms/ChangeEntityPasswordModal';
import { ManageTermsModal } from '../components/forms/ManageTermsModal';
import { ProxyConsoleModal } from '../components/ui/ProxyConsoleModal';
import { Icon } from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';

/* One collator for the whole app. Built once instead of implicitly per comparison,
   which is what localeCompare(a, b, undefined, {numeric: true}) does. */
const COLLATOR = new Intl.Collator(undefined, { numeric: true, sensitivity: 'variant' });

function rowId(row: ApiRecord, idField: string): string {
  return String(row[idField] ?? row.id ?? row.uuid ?? '');
}

function searchableKeys(columns: FieldDef[]): string[] {
  return columns
    .filter((c) => ['text', 'mono', 'link', 'fk', 'choice', 'badge'].includes(c.cell || 'text'))
    .map((c) => c.name);
}

export function GenericListPage({ resourceKey }: { resourceKey: string }) {
  const config: ResourceConfig = getResource(resourceKey);
  const idField = config.idField || 'id';
  const toast = useToast();
  const navigate = useNavigate();

  // Tabbed lists (legacy master_list_tab): each tab has its own endpoint/columns.
  const tabs = config.tabs;
  const [tabIndex, setTabIndex] = useState(0);
  const activeTab = tabs && tabs.length ? tabs[Math.min(tabIndex, tabs.length - 1)] : undefined;
  const activeUri = activeTab ? activeTab.uri : config.uri;
  const titleSingular = (activeTab && activeTab.titleSingular) || config.titleSingular;

  const { items, loading, error, reload, setItems } = useList<ApiRecord>(activeUri, [activeUri]);

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortState | undefined>(
    config.defaultSort ? { key: config.defaultSort, dir: 'asc' } : undefined
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modal / dialog state
  const [formMode, setFormMode] = useState<'Add' | 'Edit' | null>(null);
  const [editing, setEditing] = useState<ApiRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [nonFieldError, setNonFieldError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [rowPosting, setRowPosting] = useState(false);
  // Extra per-row action currently open (e.g. rotate this record's credential).
  const [rowAction, setRowAction] = useState<{ action: RowAction; row: ApiRecord } | null>(null);

  const sample = items[0];
  const configFields = (activeTab && activeTab.fields) || config.fields;
  const activeRowActions = (activeTab && activeTab.rowActions) || config.rowActions;
  const columns: FieldDef[] = useMemo(
    () => configFields || deriveColumns(sample),
    [configFields, sample]
  );

  const canCreate = config.canCreate !== false && (!!configFields || !!sample);
  const canEdit = config.canEdit !== false && columns.length > 0;
  const canDelete = config.canDelete !== false;

  const keys = useMemo(() => config.searchKeys || searchableKeys(columns), [config.searchKeys, columns]);

  /* ---- Client-side search + sort + paginate ----
   *
   * Collections here are whole (1600+ users, 900 switches), so this is the hot path.
   * Two things keep it off the typing thread:
   *
   * 1. The query is DEFERRED. React keeps rendering the previous result while the
   *    input updates immediately, so a keystroke never waits on a full re-filter and
   *    re-sort of the collection.
   * 2. The collator is HOISTED. `localeCompare(a, b, undefined, { numeric: true })`
   *    builds a fresh Intl.Collator per comparison and is off V8's cached fast path;
   *    one reused Intl.Collator does the same comparison far more cheaply, and this
   *    runs O(n log n) times per sort.
   */
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((row) => keys.some((k) => scalarize(row[k]).toLowerCase().includes(q)));
  }, [items, deferredQuery, keys]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const { key, dir } = sort;
    const factor = dir === 'asc' ? 1 : -1;
    const compare = COLLATOR.compare;
    return [...filtered].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return compare(scalarize(av), scalarize(bv)) * factor;
    });
  }, [filtered, sort]);

  const total = sorted.length;
  const pageRows = useMemo(() => sorted.slice((page - 1) * pageSize, page * pageSize), [sorted, page, pageSize]);

  const onSort = (key: string) => {
    setSort((prev) => (prev?.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
    setPage(1);
  };
  const onSearch = (v: string) => {
    setQuery(v);
    setPage(1);
  };

  // ---- CRUD ----
  const openAdd = () => {
    setEditing(null);
    setServerErrors({});
    setNonFieldError(null);
    setFormMode('Add');
  };
  const openEdit = (row: ApiRecord) => {
    setEditing(row);
    setServerErrors({});
    setNonFieldError(null);
    setFormMode('Edit');
  };
  const closeForm = () => {
    setFormMode(null);
    setEditing(null);
    setSubmitting(false);
  };

  const applyServerError = (err: unknown) => {
    if (err instanceof ApiError && err.body && typeof err.body === 'object') {
      const body = err.body as Record<string, unknown>;
      const fieldErrs: Record<string, string> = {};
      let nonField: string | null = null;
      Object.entries(body).forEach(([k, v]) => {
        const msg = Array.isArray(v) ? String(v[0]) : String(v);
        if (k === 'non_field_errors' || k === 'detail') nonField = msg;
        else fieldErrs[k] = msg;
      });
      setServerErrors(fieldErrs);
      setNonFieldError(nonField);
    } else {
      setNonFieldError('Something went wrong. Please try again.');
    }
  };

  /* A resource carrying an input='file' field is saved the way the legacy panel
     saved it (ng-file-upload): multipart on Add, and on Edit a PATCH of just the
     form's own fields - multipart when a new file was picked, plain JSON when it
     was not. PATCH matters here: a PUT of the merged record would try to re-send
     the existing file field as a string and the server would reject it. */
  const hasFileField = (config.fields || []).some((f) => f.input === 'file');

  const handleSubmit = async (values: ApiRecord) => {
    setSubmitting(true);
    setServerErrors({});
    setNonFieldError(null);
    try {
      const pickedFile = Object.values(values).some((v) => v instanceof File);
      if (formMode === 'Add') {
        const res = hasFileField
          ? await api.saveMultipart<ApiRecord>(activeUri, null, values, 'POST')
          : await api.create<ApiRecord>(activeUri, values);
        const newRow = { ...values, ...res };
        setItems((prev) => [newRow, ...prev]);
        toast.success(`${titleSingular} created`, 'Added');
      } else if (formMode === 'Edit' && editing) {
        const id = rowId(editing, idField);
        let res: ApiRecord;
        if (hasFileField) {
          // An unpicked file input is null - drop that key so the server keeps the
          // file it already has instead of being asked to null it out.
          const patch: ApiRecord = { ...values };
          (config.fields || [])
            .filter((f) => f.input === 'file')
            .forEach((f) => {
              if (!(patch[f.name] instanceof File)) delete patch[f.name];
            });
          res = pickedFile
            ? await api.saveMultipart<ApiRecord>(activeUri, id, patch, 'PATCH')
            : await api.patch<ApiRecord>(activeUri, id, patch);
        } else {
          // Legacy PUTs the whole record, so merge the edits onto the original -
          // fields the form does not render (ids, relations it cannot map) must be
          // preserved rather than dropped from the payload.
          res = await api.update<ApiRecord>(activeUri, id, { ...editing, ...values });
        }
        const updated = { ...editing, ...values, ...res };
        setItems((prev) => prev.map((r) => (rowId(r, idField) === id ? updated : r)));
        toast.success(`${titleSingular} updated`, 'Saved');
      }
      closeForm();
    } catch (err) {
      applyServerError(err);
      setSubmitting(false);
    }
  };

  /* POST to a sub-path of the row's own url. The url the API hands back is absolute
     (the backend host), so only its path is kept and the request goes through the
     local proxy, as everywhere else in this app. */
  const runRowPost = async () => {
    if (!rowAction || !rowAction.action.uri) return;
    setRowPosting(true);
    try {
      const raw = String(rowAction.row.url || '');
      const base = raw ? new URL(raw, window.location.origin).pathname : `${buildUrl(activeUri)}/${rowId(rowAction.row, idField)}/`;
      await api.rawPost(`${base}${rowAction.action.uri}`);
      toast.success(`${rowAction.action.label} completed.`, 'Done');
      setRowAction(null);
      reload();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `${rowAction.action.label} failed.`);
    } finally {
      setRowPosting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const id = rowId(deleteTarget, idField);
    try {
      await api.remove(activeUri, id);
      setItems((prev) => prev.filter((r) => rowId(r, idField) !== id));
      toast.success(`${titleSingular} deleted`, 'Removed');
    } catch {
      toast.error(`Could not delete this ${titleSingular.toLowerCase()}.`);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const deleteName = deleteTarget ? scalarize(deleteTarget.name ?? deleteTarget[idField]) : '';

  const switchTab = (i: number) => {
    setTabIndex(i);
    setQuery('');
    setPage(1);
  };

  return (
    <div className="content-fade">
      {/* Outside the Card so the strip can run flush to the header and sidebar,
          matching how ngx-unity renders its level-1 tabs outside .container-fluid. */}
      {tabs && tabs.length > 1 && (
        <div className="page-tabs">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              type="button"
              className={`tab-btn${i === tabIndex ? ' active' : ''}`}
              onClick={() => switchTab(i)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      <Card>
        <div className="toolbar">
          <div className="search-box">
            <span className="ic">
              <Icon name="search" size={16} />
            </span>
            <input
              type="text"
              placeholder={`Search ${config.title.toLowerCase()}...`}
              value={query}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <span className="toolbar-count">
            {total} {total === 1 ? 'record' : 'records'}
            {query && ` (filtered from ${items.length})`}
          </span>
          <div className="toolbar-spacer" />
          <Button variant="default" icon="refresh-cw" onClick={reload} title="Reload">
            Refresh
          </Button>
          {canCreate && (
            <Button variant="primary" icon="plus" onClick={openAdd}>
              Add {titleSingular}
            </Button>
          )}
        </div>

        {loading ? (
          <LoadingBlock label={`Loading ${config.title.toLowerCase()}...`} />
        ) : error ? (
          <EmptyState
            icon="alert-triangle"
            title="Couldn't load data"
            message={error}
            action={
              <Button variant="default" icon="refresh-cw" onClick={reload}>
                Retry
              </Button>
            }
          />
        ) : total === 0 ? (
          <EmptyState
            icon={query ? 'search-x' : 'inbox'}
            title={query ? 'No matches' : `No ${config.title.toLowerCase()} yet`}
            message={
              query
                ? 'Try a different search term.'
                : canCreate
                ? `Get started by adding your first ${titleSingular.toLowerCase()}.`
                : 'There are no records to display for this view.'
            }
            action={
              !query && canCreate ? (
                <Button variant="primary" icon="plus" onClick={openAdd}>
                  Add {config.titleSingular}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={pageRows}
              idField={idField}
              // Only single-segment keys can match the ":resourceKey/:id" detail route.
              detailPrefix={config.key.includes('/') ? undefined : `/${config.key}/`}
              sort={sort}
              onSort={onSort}
              onEdit={canEdit ? openEdit : undefined}
              onDelete={canDelete ? (row) => setDeleteTarget(row) : undefined}
              rowActions={activeRowActions}
              onRowAction={
                activeRowActions?.length
                  ? (action, row) => {
                      /* A link action has no dialog - it just goes, filling {field}
                         placeholders from the row. */
                      if (action.kind === 'row-link' && action.to) {
                        navigate(
                          action.to.replace(/\{(\w+)\}/g, (_m, k) => encodeURIComponent(String(row[k] ?? '')))
                        );
                        return;
                      }
                      setRowAction({ action, row });
                    }
                  : undefined
              }
            />
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPage={setPage}
              onPageSize={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          </>
        )}
      </Card>

      {formMode && (
        <FormModal
          title={`${formMode === 'Add' ? 'Add' : 'Edit'} ${titleSingular}`}
          subtitle={formMode === 'Edit' && editing ? scalarize(editing.name ?? editing[idField]) : config.description}
          onClose={closeForm}
        >
          <RecordForm
            fields={columns}
            method={formMode}
            initial={editing || undefined}
            submitting={submitting}
            serverErrors={serverErrors}
            nonFieldError={nonFieldError}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </FormModal>
      )}

      {rowAction && rowAction.action.kind === 'view-content' && (
        <FormModal
          title={`${rowAction.action.label}: ${scalarize(rowAction.row.name) || ''}`}
          onClose={() => setRowAction(null)}
        >
          <div className="record-form">
            <div className="form-grid">
              <div className="field field-full">
                <label>Content</label>
                <textarea
                  className="code-view"
                  rows={20}
                  readOnly
                  value={String(rowAction.row[rowAction.action.contentField || 'content'] ?? '')}
                />
              </div>
            </div>
            <div className="form-actions">
              <Button variant="default" onClick={() => setRowAction(null)}>
                Close
              </Button>
            </div>
          </div>
        </FormModal>
      )}

      {rowAction && rowAction.action.kind === 'row-post' && (
        <ConfirmDialog
          title={`${rowAction.action.label}?`}
          message={
            rowAction.action.confirm ||
            `Run ${rowAction.action.label.toLowerCase()} on this record? This changes data on the server.`
          }
          loading={rowPosting}
          onConfirm={runRowPost}
          onCancel={() => setRowAction(null)}
        />
      )}

      {rowAction && rowAction.action.kind === 'open-proxy' && (
        <ProxyConsoleModal
          row={rowAction.row}
          urlField={rowAction.action.contentField || 'proxy_fqdn'}
          label={rowAction.action.label}
          onClose={() => setRowAction(null)}
        />
      )}

      {rowAction && rowAction.action.kind === 'manage-terms' && (
        <ManageTermsModal
          row={rowAction.row}
          rowIndex={items.findIndex((r) => rowId(r, idField) === rowId(rowAction.row, idField))}
          onClose={() => setRowAction(null)}
        />
      )}

      {rowAction && rowAction.action.kind === 'change-password' && (
        <ChangeEntityPasswordModal
          action={rowAction.action}
          row={rowAction.row}
          idField={idField}
          onClose={() => setRowAction(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={`Delete ${titleSingular}?`}
          message={
            <>
              Are you sure you want to delete <strong>{deleteName || 'this record'}</strong>? This action cannot be undone.
            </>
          }
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
