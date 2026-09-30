import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { scalarize } from '../utils/format';
import { Badge, Button, Card, CardHead, EmptyState, LoadingBlock } from '../components/ui/primitives';

/*
 * IPv4 assignment block drill-down - ports PublicIPv4AssignmentDetailController /
 * PrivateIPv4AssignmentDetailController (controllers/ipv4.js:400) and
 * templates/ipam/ipv4assignment_detail.html. The port had no route to an individual
 * block, so the addresses inside one were unreachable.
 *
 *   GET public_ipv4_assignments/?prefix=<block>   -> { results: [ { addresses: [...] } ] }
 *   GET private_ipv4_assignments/?prefix=<block>
 *
 * The block is looked up BY QUERY, not by id, for the same reason legacy did: a prefix
 * contains a slash ("10.0.0.0/24") and cannot be a path segment.
 *
 * NOTE: both collections are empty on the SF backend (count 0), so this renders its
 * empty state there; the shape follows the legacy contract.
 */

const isPrivate = (scope: string) => scope === 'private';

export function Ipv4BlockPage({ scope = 'public' }: { scope?: 'public' | 'private' }) {
  const { prefix = '' } = useParams();
  const navigate = useNavigate();
  const uri = isPrivate(scope) ? 'private_ipv4_assignments' : 'public_ipv4_assignments';
  const listRoute = isPrivate(scope) ? '/ipv4_private/assignments' : '/ipv4_public/assignments';

  const [block, setBlock] = useState<ApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items } = await api.list<ApiRecord>(uri, { prefix: decodeURIComponent(prefix) });
      setBlock(items[0] || null);
      if (!items.length) setError('No block matches this prefix.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this block.');
    } finally {
      setLoading(false);
    }
  }, [uri, prefix]);

  useEffect(() => {
    load();
  }, [load]);

  const addresses = Array.isArray(block?.addresses) ? (block!.addresses as ApiRecord[]) : [];
  // Legacy ordered by address_int so the block reads in numeric order, not string order.
  const ordered = [...addresses].sort((a, b) => Number(a.address_int ?? 0) - Number(b.address_int ?? 0));

  return (
    <div className="content-fade">
      <div style={{ marginBottom: 14 }}>
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => navigate(listRoute)}>
          Back to {isPrivate(scope) ? 'Private' : 'Public'} IPv4
        </Button>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <CardHead title={decodeURIComponent(prefix)} icon="network" />
        {loading ? (
          <LoadingBlock label="Loading block..." />
        ) : !block ? (
          <EmptyState
            icon={error && error !== 'No block matches this prefix.' ? 'alert-triangle' : 'network'}
            title={error || 'Block not found'}
            message={error ? 'Failed to fetch the IPv4 assignment block.' : 'This block could not be loaded.'}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={load}>
                Retry
              </Button>
            }
          />
        ) : (
          <div>
            <div className="kv-row">
              <div className="kv-label">Prefix</div>
              <div className="kv-value mono">
                {scalarize(block.prefix)}/{scalarize(block.prefixlen)}
              </div>
            </div>
            <div className="kv-row">
              <div className="kv-label">Block Name</div>
              <div className="kv-value">{scalarize(block.name) || '-'}</div>
            </div>
            <div className="kv-row">
              <div className="kv-label">Description</div>
              <div className="kv-value">{scalarize(block.description) || '-'}</div>
            </div>
            <div className="kv-row">
              <div className="kv-label">Customer</div>
              <div className="kv-value">
                {(block.customer as ApiRecord)?.id ? (
                  <Link className="cell-link" to={`/org/${String((block.customer as ApiRecord).id)}`}>
                    {scalarize((block.customer as ApiRecord).name)}
                  </Link>
                ) : (
                  '-'
                )}
              </div>
            </div>
            <div className="kv-row">
              <div className="kv-label">Num Hosts</div>
              <div className="kv-value">{scalarize(block.num_hosts_int) || '-'}</div>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <CardHead title="Addresses" icon="list" action={<Badge tone="brand">{ordered.length}</Badge>} />
        {loading ? (
          <LoadingBlock label="Loading addresses..." />
        ) : ordered.length === 0 ? (
          <EmptyState icon="list" title="No addresses" message="This block has no individual addresses recorded." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Device</th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((a, i) => (
                  <tr key={String(a.id ?? a.address ?? i)}>
                    <td className="cell-mono">{scalarize(a.address ?? a.ip_address) || '-'}</td>
                    <td>{scalarize((a.device as ApiRecord)?.name ?? a.device) || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
