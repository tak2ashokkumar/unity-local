import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, normalizeList } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { scalarize, formatDate } from '../utils/format';
import { Card, CardHead, Button, LoadingBlock, EmptyState, Badge, IconAction } from '../components/ui/primitives';
import { ConfirmDialog, FormModal } from '../components/ui/Overlay';
import { useToast } from '../components/ui/Toast';

/* The device-category -> proxy-type catalog is hard-coded in the legacy controller
   (tools.js:267 $scope.proxy_types); no endpoint serves it. The device list for a
   category comes from rest/fast/<category>/?search=... */
const DEVICE_CATEGORIES: { value: string; label: string }[] = [
  { value: 'firewall', label: 'Firewall' },
  { value: 'switch', label: 'Switch' },
  { value: 'load_balancer', label: 'Load Balancer' },
  { value: 'server', label: 'Hypervisor (ESXi)' },
  { value: 'private_cloud', label: 'Private Cloud' },
];

const PROXY_TYPES: Record<string, { name: string; type: string }[]> = {
  firewall: [
    { name: 'Cisco Firewall', type: 'CiscoFirewallReverseProxy' },
    { name: 'Juniper Firewall', type: 'JuniperFirewallProxy' },
  ],
  switch: [
    { name: 'Cisco Switch', type: 'CiscoSwitchProxy' },
    { name: 'Juniper Switch', type: 'JuniperSwitchProxy' },
  ],
  load_balancer: [
    { name: 'F5 Load Balancer', type: 'F5LoadBalancerReverseProxy' },
    { name: 'Citrix Netscaler', type: 'CitrixNetScalerProxy' },
  ],
  server: [{ name: 'Esxi Hypervisor', type: 'VmwareEsxiProxy' }],
  private_cloud: [
    { name: 'Vmware Cloud', type: 'VmwareVcenterProxy' },
    { name: 'OpenStack Cloud', type: 'OpenStackProxy' },
  ],
};

/* Ports add_proxy_modal.html + tools.js:253 add_proxy(): POST /func/create_proxy/ with
   the whole new_proxy object. */
function AddProxyModal({
  domain,
  onClose,
  onCreated,
}: {
  domain: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const toast = useToast();
  const [category, setCategory] = useState('');
  const [proxyType, setProxyType] = useState('');
  const [device, setDevice] = useState<ApiRecord | null>(null);
  const [deviceQuery, setDeviceQuery] = useState('');
  const [deviceOptions, setDeviceOptions] = useState<ApiRecord[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('');
  const [backendUrl, setBackendUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const searchSeq = useRef(0);

  // Debounced device typeahead, scoped to the selected category.
  useEffect(() => {
    if (!category || deviceQuery.trim().length < 2) {
      setDeviceOptions([]);
      return;
    }
    const seq = ++searchSeq.current;
    const t = window.setTimeout(() => {
      api
        .list<ApiRecord>('fast/' + category, { search: deviceQuery.trim() })
        .then((res) => {
          if (seq === searchSeq.current) setDeviceOptions(res.items.slice(0, 20));
        })
        .catch(() => {
          if (seq === searchSeq.current) setDeviceOptions([]);
        });
    }, 250);
    return () => window.clearTimeout(t);
  }, [category, deviceQuery]);

  const canSubmit = Boolean(category && proxyType && device && proxyUrl.trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    try {
      await api.rawPost('/func/create_proxy', {
        device_category: category,
        proxy_type: proxyType,
        device,
        proxy_url: proxyUrl.trim(),
        backend_url: backendUrl.trim(),
      });
      toast.success('Successfully added proxy!', 'Proxy created');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add the proxy.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal title="Add Reverse Proxy" subtitle="Build a reverse proxy for a managed device." onClose={onClose}>
      <form className="record-form" onSubmit={submit}>
        <div className="form-grid">
          <div className="field">
            <label>Device Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setProxyType('');
                setDevice(null);
                setDeviceQuery('');
              }}
            >
              <option value="">Select Device Category</option>
              {DEVICE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Proxy Type</label>
            <select value={proxyType} disabled={!category} onChange={(e) => setProxyType(e.target.value)}>
              <option value="">Select Proxy Type</option>
              {(PROXY_TYPES[category] || []).map((t) => (
                <option key={t.type} value={t.type}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field field-full typeahead">
            <label>Devices List</label>
            <input
              type="text"
              value={deviceQuery}
              disabled={!category}
              placeholder={category ? 'Type at least 2 characters...' : 'Pick a device category first'}
              onChange={(e) => {
                setDeviceQuery(e.target.value);
                setDevice(null);
                setShowOptions(true);
              }}
              onFocus={() => setShowOptions(true)}
              onBlur={() => window.setTimeout(() => setShowOptions(false), 150)}
            />
            {showOptions && deviceOptions.length > 0 && (
              <div className="typeahead-menu">
                {deviceOptions.map((d) => (
                  <button
                    type="button"
                    key={String(d.id)}
                    className="ta-opt"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setDevice({ id: d.id, name: d.name });
                      setDeviceQuery(scalarize(d.name));
                      setShowOptions(false);
                    }}
                  >
                    {scalarize(d.name)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="field">
            <label>Proxy Name for Subdomain</label>
            <input type="text" value={proxyUrl} onChange={(e) => setProxyUrl(e.target.value)} />
            {domain ? <div className="field-help">.{domain}</div> : null}
          </div>

          <div className="field">
            <label>Backend URL</label>
            <input type="text" value={backendUrl} onChange={(e) => setBackendUrl(e.target.value)} />
          </div>
        </div>

        <div className="form-actions">
          <Button variant="default" type="button" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" type="submit" disabled={!canSubmit || saving} loading={saving}>
            Add
          </Button>
        </div>
      </form>
    </FormModal>
  );
}

/*
 * Proxy Cookies (legacy /proxy-cookies-1). These endpoints live under /func/, NOT /rest/:
 *   GET  /func/get_proxies/        - the device proxy list
 *   GET  /func/get_proxy_server/   - the proxy server row(s)
 *   POST /func/regenerate_proxy/   - rebuild the ansible parts for one proxy
 *   POST /func/delete_proxy/       - DESTRUCTIVE, removes a proxy
 *   GET  /func/refresh_subdomains/ - re-check subdomains
 */
/* result.customers is [{ "<org_id>": "<org name>" }, ...] in the legacy payload. */
function customerLinks(row: ApiRecord): { id: string; name: string }[] {
  const raw = row.customers;
  if (!Array.isArray(raw)) return [];
  const out: { id: string; name: string }[] = [];
  raw.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    Object.entries(entry as Record<string, unknown>).forEach(([id, name]) => {
      out.push({ id, name: String(name) });
    });
  });
  return out;
}

export function ProxyCookiesPage() {
  const toast = useToast();
  const [servers, setServers] = useState<ApiRecord[]>([]);
  const [proxies, setProxies] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, s] = await Promise.all([
        api.rawGet<unknown>('/func/get_proxies'),
        api.rawGet<unknown>('/func/get_proxy_server'),
      ]);
      setProxies(normalizeList<ApiRecord>(p).items);
      setServers(normalizeList<ApiRecord>(s).items);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not load proxy data.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const rebuild = async (row: ApiRecord) => {
    const id = String(row.id ?? row.uuid ?? '');
    setBusyId(id);
    try {
      await api.rawPost('/func/regenerate_proxy', { id: row.id });
      toast.success(`Rebuild queued for ${scalarize(row.proxy_name || row.proxy_url || row.device)}.`, 'Rebuilding');
      load();
    } catch {
      toast.error('Could not queue the rebuild.');
    } finally {
      setBusyId(null);
    }
  };

  const correctSubdomains = async () => {
    try {
      await api.rawGet('/func/refresh_subdomains');
      toast.success('Subdomain check completed.', 'Subdomains');
    } catch {
      toast.error('Subdomain check failed.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.rawPost('/func/delete_proxy', { id: deleteTarget.id });
      setProxies((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success('Proxy deleted.', 'Removed');
    } catch {
      toast.error('Could not delete the proxy.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="content-fade">
      <Card style={{ marginBottom: 18 }}>
        <CardHead title="Instructions" icon="info" />
        <ol style={{ margin: 0, padding: '14px 20px 18px 38px', color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', lineHeight: 1.9 }}>
          <li>Click an Organization to generate its <strong>Auth Keys</strong>.</li>
          <li>Click <strong>Rebuild</strong> to regenerate the ansible parts.</li>
          <li>Click <strong>Capture</strong> to acquire the Auth Key yourself.</li>
        </ol>
      </Card>

      <Card style={{ marginBottom: 18 }}>
        <CardHead
          title="Proxy Server"
          icon="server"
          action={
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="default" size="sm" icon="check" onClick={correctSubdomains}>
                Correct Subdomains
              </Button>
              <Button variant="primary" size="sm" icon="plus" onClick={() => setAddOpen(true)}>
                Add Proxy
              </Button>
            </div>
          }
        />
        {loading ? (
          <LoadingBlock label="Loading proxy servers..." />
        ) : error ? (
          <EmptyState
            icon="alert-triangle"
            title="Failed to load proxy servers"
            message={error}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={load}>
                Retry
              </Button>
            }
          />
        ) : servers.length === 0 ? (
          <EmptyState icon="server" title="No proxy server" message="No proxy server is configured." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Domain</th>
                  <th>Conn. Type</th>
                  <th className="col-center">Pingable</th>
                </tr>
              </thead>
              <tbody>
                {servers.map((s, i) => (
                  <tr key={String(s.id ?? i)}>
                    <td className="cell-mono">{scalarize(s.ip_address) || '-'}</td>
                    <td>{scalarize(s.domain) || '-'}</td>
                    <td>{scalarize(s.conn_type || s.connection_type) || '-'}</td>
                    <td className="col-center">
                      {s.pingable ? <Badge tone="success" dot>Yes</Badge> : <Badge tone="danger" dot>No</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHead title="Proxies" icon="cable" action={<Badge tone="brand">{proxies.length}</Badge>} />
        {loading ? (
          <LoadingBlock label="Loading proxies..." />
        ) : error ? (
          <EmptyState
            icon="alert-triangle"
            title="Failed to load proxies"
            message={error}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={load}>
                Retry
              </Button>
            }
          />
        ) : proxies.length === 0 ? (
          <EmptyState icon="cable" title="No proxies" message="No device proxies have been built yet." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Proxy Type</th>
                  <th>Proxy Name</th>
                  <th>Cust</th>
                  <th>Rebuilt At</th>
                  <th className="col-actions">Rebuild</th>
                </tr>
              </thead>
              <tbody>
                {proxies.map((row, i) => {
                  const id = String(row.id ?? i);
                  return (
                    <tr key={id}>
                      <td>
                        {/* Legacy linked the device name at result.reverse_proxy_url. */}
                        {row.reverse_proxy_url ? (
                          <a
                            className="cell-link"
                            href={String(row.reverse_proxy_url)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {scalarize(row.device) || '-'}
                          </a>
                        ) : (
                          scalarize(row.device) || '-'
                        )}
                      </td>
                      <td>{scalarize(row.proxy_type) || '-'}</td>
                      <td className="cell-mono">{scalarize(row.proxy_name || row.name || row.proxy_url) || '-'}</td>
                      <td>
                        {/* `customers` is an array of {org_id: org_name} maps, each linking
                            to that organization - not a flat `customer` string. */}
                        {customerLinks(row).length === 0
                          ? '-'
                          : customerLinks(row).map((c) => (
                              <div key={c.id}>
                                <Link className="cell-link" to={'/org/' + c.id}>
                                  {c.name}
                                </Link>
                              </div>
                            ))}
                      </td>
                      <td className="cell-mono">{formatDate(row.rebuilt_at) || '-'}</td>
                      <td className="col-actions">
                        <span className="row-actions" style={{ opacity: 1 }}>
                          {busyId === id ? (
                            <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} />
                          ) : (
                            <IconAction icon="refresh-cw" title="Rebuild" onClick={() => rebuild(row)} />
                          )}
                          <IconAction icon="trash-2" title="Delete" danger onClick={() => setDeleteTarget(row)} />
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

      {addOpen && (
        <AddProxyModal
          domain={scalarize(servers[0]?.domain)}
          onClose={() => setAddOpen(false)}
          onCreated={load}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete proxy?"
          message={
            <>
              Delete the proxy <strong>{scalarize(deleteTarget.proxy_name || deleteTarget.proxy_url || deleteTarget.device)}</strong>?
              This cannot be undone.
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
