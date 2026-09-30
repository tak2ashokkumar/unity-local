import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError, buildUrl } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { formatDate, scalarize } from '../utils/format';
import { Badge, Button, Card, CardHead, EmptyState, LoadingBlock } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';

/*
 * Organization detail - ports OrganizationDetailController (controllers/generic.js:3009)
 * and templates/organization_detail.html. The port showed a flat field dump, losing the
 * three tabs the page exists for.
 *
 *   GET  org/{id}/                 the organization, whose `users` array feeds the Users tab
 *   GET  org/{id}/assets/          servers / VMs / firewalls / switches / load balancers,
 *                                  cabinets / cages / PDUs, opportunities and invoices
 *   POST org/{id}/generate_auth_key/
 *
 * The assets endpoint returns HTTP 500 on the SF deployment, so the Assets and Colo tabs
 * render their empty state there; against the mock they populate.
 */

type TabKey = 'summary' | 'users' | 'assets' | 'colo' | 'opportunities';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'users', label: 'Users' },
  { key: 'assets', label: 'Assets' },
  { key: 'colo', label: 'Colo' },
  { key: 'opportunities', label: 'Opportunities' },
];

const list = (v: unknown): ApiRecord[] => (Array.isArray(v) ? (v as ApiRecord[]) : []);
const obj = (v: unknown): ApiRecord | null =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as ApiRecord) : null;

const money = (v: unknown): string => {
  const n = Number(v);
  return Number.isFinite(n) ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-';
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="kv-row">
      <div className="kv-label">{label}</div>
      <div className="kv-value">{children}</div>
    </div>
  );
}

/* One collection table. `to` makes the name a link when this app has a page for it. */
function Collection({
  title,
  icon,
  rows,
  nameKey = 'name',
  to,
  extra,
}: {
  title: string;
  icon: string;
  rows: ApiRecord[];
  nameKey?: string;
  to?: string;
  extra?: { label: string; get: (r: ApiRecord) => React.ReactNode }[];
}) {
  return (
    <Card style={{ marginBottom: 18 }}>
      <CardHead title={title} icon={icon} action={<Badge tone="brand">{rows.length}</Badge>} />
      {rows.length === 0 ? (
        <EmptyState icon={icon} title={`No ${title.toLowerCase()}`} message={`This organization has no ${title.toLowerCase()}.`} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                {(extra || []).map((e) => (
                  <th key={e.label}>{e.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={String(r.id ?? i)}>
                  <td>
                    {to && r.id != null ? (
                      <Link className="cell-link" to={`${to}${String(r.id)}`}>
                        {scalarize(r[nameKey]) || '-'}
                      </Link>
                    ) : (
                      scalarize(r[nameKey]) || '-'
                    )}
                  </td>
                  {(extra || []).map((e) => (
                    <td key={e.label}>{e.get(r) ?? '-'}</td>
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

export function OrganizationDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [org, setOrg] = useState<ApiRecord | null>(null);
  const [assets, setAssets] = useState<ApiRecord | null>(null);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>('summary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrg(await api.detail<ApiRecord>('org', id));
      // The assets call is separate and may fail on its own without blanking the page.
      api
        .get<ApiRecord>(`org/${id}/assets`)
        .then((a) => {
          setAssets(a);
          setAssetsError(null);
        })
        .catch((err) => {
          setAssets(null);
          setAssetsError(err instanceof ApiError ? err.message : 'The assets endpoint did not respond.');
        });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load this organization.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const generateAuthKey = async () => {
    setBusy(true);
    try {
      await api.rawPost(buildUrl(`org/${id}/generate_auth_key`));
      toast.success('Auth key generated.', 'Organization');
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not generate an auth key.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="content-fade">
        <Card>
          <LoadingBlock label="Loading organization..." />
        </Card>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="content-fade">
        <Card>
          <EmptyState
            icon="alert-triangle"
            title="Organization not found"
            message={error || 'Could not load it.'}
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

  const users = list(org.users);
  const a = assets || {};
  const assetsMissing = (
    <EmptyState
      icon="alert-triangle"
      title="Assets unavailable"
      message={assetsError || 'The assets endpoint returned nothing for this organization.'}
      action={
        <Button variant="default" size="sm" icon="refresh-cw" onClick={load}>
          Retry
        </Button>
      }
    />
  );

  return (
    <div className="content-fade">
      <div style={{ marginBottom: 14 }}>
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => navigate('/organization')}>
          Back to Organizations
        </Button>
      </div>

      <div className="page-tabs">
        {TABS.map((x) => (
          <button
            key={x.key}
            type="button"
            className={`tab-btn${x.key === tab ? ' active' : ''}`}
            onClick={() => setTab(x.key)}
          >
            {x.label}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <Card>
          <CardHead
            title={scalarize(org.name) || 'Organization'}
            icon="building"
            action={org.is_active ? <Badge tone="success" dot>Active</Badge> : <Badge tone="neutral">Inactive</Badge>}
          />
          <div>
            <Row label="Name">{scalarize(org.name) || '-'}</Row>
            <Row label="Type">{scalarize(org.organization_type) || '-'}</Row>
            <Row label="Email">{scalarize(org.email) || '-'}</Row>
            <Row label="Phone">{scalarize(org.phone) || '-'}</Row>
            <Row label="Address">
              {[org.address1, org.address2, org.city, org.state, org.postal_code, org.country]
                .map((x) => scalarize(x))
                .filter(Boolean)
                .join(', ') || '-'}
            </Row>
            <Row label="Domain">{scalarize(org.domain) || '-'}</Row>
            <Row label="ULID">
              <span className="mono">{scalarize(org.ulid) || '-'}</span>
            </Row>
            <Row label="Salesforce ID">
              <span className="mono">{scalarize(org.salesforce_id) || '-'}</span>
            </Row>
            <Row label="Customer Type">{scalarize(org.customer_type) || '-'}</Row>
            <Row label="Onboarding Status">{scalarize(org.onboarding_status) || '-'}</Row>
          </div>
          <div className="card-foot">
            <Button variant="primary" size="sm" icon="key" loading={busy} onClick={generateAuthKey}>
              Generate Auth Key
            </Button>
          </div>
        </Card>
      )}

      {tab === 'users' && (
        <Collection
          title="Users"
          icon="users"
          rows={users}
          nameKey="email"
          to="/user/"
          extra={[
            { label: 'First Name', get: (r) => scalarize(r.first_name) },
            { label: 'Last Name', get: (r) => scalarize(r.last_name) },
            { label: 'Last Login', get: (r) => formatDate(r.last_login) || '-' },
          ]}
        />
      )}

      {tab === 'assets' &&
        (!assets ? (
          <Card>{assetsMissing}</Card>
        ) : (
          <>
            <Collection title="Servers" icon="server" rows={list(a.servers)} to="/server/"
              extra={[{ label: 'Asset Tag', get: (r) => scalarize(r.asset_tag) }, { label: 'IP', get: (r) => scalarize(r.ip_address) }]} />
            <Collection title="Virtual Machines" icon="cloud" rows={list(a.virtual_machines)} to="/vm/"
              extra={[{ label: 'Management IP', get: (r) => scalarize(r.management_ip) }, { label: 'CPUs', get: (r) => scalarize(r.num_cpus) }]} />
            <Collection title="Firewalls" icon="shield" rows={list(a.firewalls)}
              extra={[{ label: 'Asset Tag', get: (r) => scalarize(r.asset_tag) }]} />
            <Collection title="Switches" icon="network" rows={list(a.switches)} to="/switch/"
              extra={[{ label: 'Asset Tag', get: (r) => scalarize(r.asset_tag) }]} />
            <Collection title="Load Balancers" icon="scale" rows={list(a.load_balancers)} />
          </>
        ))}

      {tab === 'colo' &&
        (!assets ? (
          <Card>{assetsMissing}</Card>
        ) : (
          <>
            <Collection title="Cabinets" icon="building-2" rows={list(a.cabinets)}
              extra={[{ label: 'Cage', get: (r) => scalarize(r.cage) }]} />
            <Collection title="Cages" icon="box" rows={list(a.cages)}
              extra={[{ label: 'Datacenter', get: (r) => scalarize(r.datacenter) }]} />
            <Collection title="PDUs" icon="plug" rows={list(a.pdus)} nameKey="hostname"
              extra={[{ label: 'Asset Tag', get: (r) => scalarize(r.asset_tag) }]} />
          </>
        ))}

      {tab === 'opportunities' &&
        (!assets ? (
          <Card>{assetsMissing}</Card>
        ) : (
          <>
            <Collection
              title="Opportunities"
              icon="copy"
              rows={list(a.opportunities)}
              to="/sf_opportunity/"
              extra={[
                { label: 'Stage', get: (r) => scalarize(r.stage_name) },
                { label: 'MRC', get: (r) => money(r.mrc) },
                { label: 'NRC', get: (r) => money(r.nrc) },
              ]}
            />
            <Collection
              title="Invoices"
              icon="receipt"
              rows={list(a.invoices)}
              nameKey="billing_month"
              extra={[
                { label: 'Year', get: (r) => scalarize(r.billing_year) },
                { label: 'Amount Billed', get: (r) => money(r.amount_billed) },
                { label: 'Opportunity', get: (r) => scalarize(obj(r.opportunity)?.name) },
              ]}
            />
          </>
        ))}
    </div>
  );
}
