import { Link, useParams, useNavigate } from 'react-router-dom';
import { getResource } from '../config/resources';
import { useDetail } from '../data/useResource';
import { deriveColumns, autoCellText, fkText, formatDate, isEmpty, scalarize } from '../utils/format';
import { FieldDef } from '../config/fieldTypes';
import { ApiRecord } from '../data/types';
import { Card, CardHead, Button, LoadingBlock, EmptyState, Badge, BadgeTone } from '../components/ui/primitives';
import { Icon } from '../components/ui/Icon';

function displayValue(field: FieldDef, row: ApiRecord) {
  const v = row[field.name];
  if (isEmpty(v) && field.cell !== 'boolean') return <span className="u-faint">-</span>;
  switch (field.cell) {
    case 'boolean':
      return v === true || v === 'true' ? (
        <Badge tone="success" dot>
          Yes
        </Badge>
      ) : (
        <Badge tone="neutral">No</Badge>
      );
    case 'badge':
      return (
        <Badge tone={(field.badgeMap?.[String(v)] as BadgeTone) || 'neutral'} dot>
          {String(v)}
        </Badge>
      );
    case 'fk':
      return fkText(v, field.subfield);
    case 'datetime':
      return formatDate(v);
    case 'multiple':
      return Array.isArray(v) && v.length
        ? v.map((x, i) => (
            <span className="chip" key={i}>
              {fkText(x, field.subfield)}
            </span>
          ))
        : '-';
    case 'mono':
      return <span className="mono">{String(v)}</span>;
    default:
      return autoCellText(v);
  }
}

/*
 * "Manage Status" (templates/snippets/detailtable.html:17).
 *
 * A device detail page carries an array per reverse-proxy flavour it can front. The
 * legacy row showed a "Manage <flavour>" button per configured proxy and a
 * "Configure <flavour>" button for each flavour with none. The port dropped the row
 * entirely, so a detail page gave no sign whether a device had a proxy at all.
 *
 * The legacy buttons deep-linked to per-proxy routes (#/cisco-switch/{uuid}); this app
 * models those proxies as TABS on the parent device list instead, so each button links
 * to the list that owns that flavour. The information - which proxies exist, and their
 * names - is preserved; only the link target differs, because no per-proxy route exists
 * here to link to.
 */
const PROXY_FLAVOURS: Array<{ key: string; label: string; to: string }> = [
  { key: 'cisco_firewall', label: 'Cisco', to: '/firewall' },
  { key: 'juniper_firewall', label: 'Juniper', to: '/firewall' },
  { key: 'cisco_switch', label: 'Cisco', to: '/switch' },
  { key: 'juniper_switch', label: 'Juniper', to: '/switch' },
  { key: 'f5lb_proxy', label: 'F5 LB', to: '/loadbalancer' },
  { key: 'netscaler_proxy', label: 'Netscaler', to: '/loadbalancer' },
];

function ManageStatusRow({ row }: { row: ApiRecord }) {
  const present = PROXY_FLAVOURS.filter((f) => Array.isArray(row[f.key]));
  if (present.length === 0) return null;
  return (
    <div className="kv-row">
      <div className="kv-label">Manage Status</div>
      <div className="kv-value" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {present.map((f) => {
          const items = row[f.key] as ApiRecord[];
          if (items.length === 0) {
            return (
              <Link key={f.key} className="btn btn-default btn-sm" to={f.to}>
                Configure {f.label}
              </Link>
            );
          }
          return items.map((p, i) => (
            <Link key={`${f.key}-${i}`} className="btn btn-primary btn-sm" to={f.to}>
              Manage {f.label}
              {items.length > 1 && scalarize(p.name) ? ` (${scalarize(p.name)})` : ''}
            </Link>
          ));
        })}
      </div>
    </div>
  );
}

export function GenericDetailPage() {
  const { resourceKey = '', id = '' } = useParams();
  const navigate = useNavigate();
  const config = getResource(resourceKey);
  const { data, loading, error, reload } = useDetail<ApiRecord>(config.uri, id);

  /* Tabbed resources (switch, firewall, loadbalancer) declare their curated columns
     inside tabs[0].fields and have no top-level `fields`, so the detail view was
     falling through to deriveColumns() - an 8-field guess off the payload. Prefer the
     first tab's field list before giving up on auto-derivation. */
  const fields: FieldDef[] =
    config.detailFields ||
    config.fields ||
    (config.tabs && config.tabs[0] && config.tabs[0].fields) ||
    deriveColumns(data || undefined);
  const heading = data ? String(data.name ?? data.full_name ?? data[config.idField || 'id'] ?? config.titleSingular) : config.titleSingular;

  return (
    <div className="content-fade">
      <div style={{ marginBottom: 14 }}>
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => navigate(-1)}>
          Back to {config.title}
        </Button>
      </div>

      {loading ? (
        <Card>
          <LoadingBlock />
        </Card>
      ) : error || !data ? (
        <Card>
          <EmptyState
            icon="alert-triangle"
            title="Record not found"
            message={error || 'This record could not be loaded.'}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={reload}>
                Retry
              </Button>
            }
          />
        </Card>
      ) : (
        <Card>
          <CardHead title={heading} icon={config.icon || 'list'} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 0 }}>
            {fields.map((f, i) => (
              <div
                key={f.name}
                style={{
                  padding: '13px 20px',
                  borderBottom: '1px solid var(--divider)',
                  borderRight: i % 2 === 0 ? '1px solid var(--divider)' : 'none',
                }}
              >
                <div style={{ fontSize: 'var(--fs-2xs)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)' }}>{displayValue(f, data)}</div>
              </div>
            ))}
          </div>
          <ManageStatusRow row={data} />
        </Card>
      )}
    </div>
  );
}
