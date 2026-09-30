import { useCallback, useEffect, useState } from 'react';
import { api, buildUrl } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { scalarize } from '../utils/format';
import { Badge, Button, Card, CardHead, EmptyState, IconAction, LoadingBlock } from '../components/ui/primitives';
import { ConfirmDialog, FormModal } from '../components/ui/Overlay';
import { RecordForm } from '../components/forms/RecordForm';
import { FieldDef } from '../config/fieldTypes';
import { useToast } from '../components/ui/Toast';

/*
 * IPv6 Allocations - ports IPv6ConfigController + templates/ipam/ipv6alloc.html.
 *
 * An allocation is a prefix that owns a list of LOCATIONS, and the whole point of the
 * screen is managing that list. The port rendered allocations as a flat generic list,
 * so the locations, Add Location and Delete Location were all unreachable.
 *
 *   GET    ipv6_allocations/               each record carries `locations`
 *   POST   ipv6_allocations/{id}/create_location/  { name }
 *   DELETE ipv6_regions/{id}/              remove one location
 *   POST   ipv6_allocations/               add an allocation
 *   DELETE ipv6_allocations/{id}/          delete the block
 *
 * NOTE: this collection is empty on the SF backend (count 0), so the row rendering is
 * built to the legacy contract rather than confirmed against live data.
 */

interface Ipv6Location extends ApiRecord {
  name?: string;
  prefix?: string;
  prefixlen?: number | string;
}

interface Ipv6Allocation extends ApiRecord {
  name?: string;
  prefix?: string;
  prefixlen?: number | string;
  description?: string;
  locations?: Ipv6Location[];
}

const ALLOCATION_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Name', cell: 'text', required: true },
  { name: 'prefix', label: 'Prefix', cell: 'mono', required: true },
  { name: 'prefixlen', label: 'Prefix Len', cell: 'number', input: 'number', required: true },
  { name: 'description', label: 'Description', cell: 'text', required: true },
];

export function Ipv6AllocationsPage() {
  const toast = useToast();
  const [rows, setRows] = useState<Ipv6Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locationFor, setLocationFor] = useState<Ipv6Allocation | null>(null);
  const [deleteAlloc, setDeleteAlloc] = useState<Ipv6Allocation | null>(null);
  const [deleteLoc, setDeleteLoc] = useState<{ alloc: Ipv6Allocation; loc: Ipv6Location } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.list<Ipv6Allocation>('ipv6_allocations');
      setRows(res.items);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not load the IPv6 allocations.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = rows.find((r) => String(r.id) === selectedId) || null;
  const locations: Ipv6Location[] = Array.isArray(selected?.locations) ? selected!.locations! : [];

  const addAllocation = async (values: ApiRecord) => {
    setSaving(true);
    try {
      await api.create('ipv6_allocations', values);
      toast.success('Allocation added.', 'Created');
      setAddOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add the allocation.');
    } finally {
      setSaving(false);
    }
  };

  const addLocation = async (values: ApiRecord) => {
    if (!locationFor) return;
    setSaving(true);
    try {
      const created = await api.rawPost<Ipv6Location>(
        buildUrl(`ipv6_allocations/${String(locationFor.id)}/create_location`),
        { name: values.name }
      );
      // Legacy pushed the response straight onto the parent's array.
      setRows((prev) =>
        prev.map((r) =>
          r.id === locationFor.id ? { ...r, locations: [...(r.locations || []), created] } : r
        )
      );
      toast.success(`Added ${scalarize(values.name)}.`, 'Location created');
      setLocationFor(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create the location.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteLocation = async () => {
    if (!deleteLoc) return;
    setBusy(true);
    try {
      await api.remove('ipv6_regions', String(deleteLoc.loc.id));
      setRows((prev) =>
        prev.map((r) =>
          r.id === deleteLoc.alloc.id
            ? { ...r, locations: (r.locations || []).filter((l) => l.id !== deleteLoc.loc.id) }
            : r
        )
      );
      toast.success(
        `Deleted ${scalarize(deleteLoc.loc.name)} (${scalarize(deleteLoc.loc.prefixlen)})`,
        'Location removed'
      );
    } catch {
      toast.error('Could not delete this location.');
    } finally {
      setBusy(false);
      setDeleteLoc(null);
    }
  };

  const confirmDeleteAllocation = async () => {
    if (!deleteAlloc) return;
    setBusy(true);
    try {
      await api.remove('ipv6_allocations', String(deleteAlloc.id));
      setRows((prev) => prev.filter((r) => r.id !== deleteAlloc.id));
      if (selectedId === String(deleteAlloc.id)) setSelectedId(null);
      toast.success('Block deleted.', 'Removed');
    } catch {
      toast.error('Could not delete this block.');
    } finally {
      setBusy(false);
      setDeleteAlloc(null);
    }
  };

  return (
    <div className="content-fade">
      <Card style={{ marginBottom: 18 }}>
        <CardHead
          title="IPv6 Allocations"
          icon="network"
          action={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Badge tone="brand">{rows.length}</Badge>
              <Button variant="primary" size="sm" icon="plus" onClick={() => setAddOpen(true)}>
                Add ARIN Allocation
              </Button>
            </div>
          }
        />
        {loading ? (
          <LoadingBlock label="Loading allocations..." />
        ) : error ? (
          <EmptyState
            icon="alert-triangle"
            title="Failed to load allocations"
            message={error}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={load}>
                Retry
              </Button>
            }
          />
        ) : rows.length === 0 ? (
          <EmptyState icon="network" title="No allocations" message="No IPv6 allocation has been created yet." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Description</th>
                  <th className="col-center">Locations</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={String(row.id)}
                    className={String(row.id) === selectedId ? 'row-selected' : ''}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedId(String(row.id) === selectedId ? null : String(row.id))}
                  >
                    <td>{scalarize(row.name) || '-'}</td>
                    <td className="cell-mono">
                      {scalarize(row.prefix)}/{scalarize(row.prefixlen)}
                    </td>
                    <td>{scalarize(row.description) || '-'}</td>
                    <td className="col-center">{(row.locations || []).length}</td>
                    <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                      <span className="row-actions" style={{ opacity: 1 }}>
                        <IconAction icon="plus" title="Add Location" onClick={() => setLocationFor(row)} />
                        <IconAction icon="trash-2" title="Delete Block" danger onClick={() => setDeleteAlloc(row)} />
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
        <Card>
          <CardHead
            title={`Locations in ${scalarize(selected.name) || 'this allocation'}`}
            icon="map-pin"
            action={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Badge tone="brand">{locations.length}</Badge>
                <Button variant="primary" size="sm" icon="plus" onClick={() => setLocationFor(selected)}>
                  Add Location
                </Button>
              </div>
            }
          />
          {locations.length === 0 ? (
            <EmptyState icon="map-pin" title="No locations" message="This allocation has no locations yet." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Block Name</th>
                    <th>Prefix</th>
                    <th>Prefix Length</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((loc) => (
                    <tr key={String(loc.id)}>
                      <td>{scalarize(loc.name) || '-'}</td>
                      <td className="cell-mono">{scalarize(loc.prefix) || '-'}</td>
                      <td className="cell-mono">{scalarize(loc.prefixlen) || '-'}</td>
                      <td className="col-actions">
                        <span className="row-actions" style={{ opacity: 1 }}>
                          <IconAction
                            icon="trash-2"
                            title="Delete Location"
                            danger
                            onClick={() => setDeleteLoc({ alloc: selected, loc })}
                          />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {addOpen && (
        <FormModal title="Add ARIN Allocation" onClose={() => setAddOpen(false)}>
          <RecordForm
            fields={ALLOCATION_FIELDS}
            method="Add"
            submitting={saving}
            onSubmit={addAllocation}
            onCancel={() => setAddOpen(false)}
          />
        </FormModal>
      )}

      {locationFor && (
        <FormModal
          title="Create Location"
          subtitle={scalarize(locationFor.name)}
          onClose={() => setLocationFor(null)}
        >
          <RecordForm
            fields={[{ name: 'name', label: 'Location Name', cell: 'text', required: true }]}
            method="Add"
            submitting={saving}
            onSubmit={addLocation}
            onCancel={() => setLocationFor(null)}
          />
        </FormModal>
      )}

      {deleteAlloc && (
        <ConfirmDialog
          title="Delete block?"
          message={
            <>
              Delete <strong>{scalarize(deleteAlloc.name)}</strong> ({scalarize(deleteAlloc.prefix)}/
              {scalarize(deleteAlloc.prefixlen)}) and everything under it?
            </>
          }
          loading={busy}
          onConfirm={confirmDeleteAllocation}
          onCancel={() => setDeleteAlloc(null)}
        />
      )}

      {deleteLoc && (
        <ConfirmDialog
          title="Delete location?"
          message={
            <>
              Delete <strong>{scalarize(deleteLoc.loc.name)}</strong> ({scalarize(deleteLoc.loc.prefixlen)}) from this
              allocation?
            </>
          }
          loading={busy}
          onConfirm={confirmDeleteLocation}
          onCancel={() => setDeleteLoc(null)}
        />
      )}
    </div>
  );
}
