import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { formatDate, scalarize } from '../utils/format';
import { Badge, Button, Card, CardHead, EmptyState, LoadingBlock } from '../components/ui/primitives';
import { ConfirmDialog, FormModal } from '../components/ui/Overlay';
import { RecordForm } from '../components/forms/RecordForm';
import { FieldDef } from '../config/fieldTypes';
import { useToast } from '../components/ui/Toast';

/*
 * Import Opportunities - ports SalesforceOpportunityImportController
 * (controllers/billing.js:125). The port had reduced this to a read-only list of
 * ALREADY-imported opportunities, which is the opposite of what the page is for: it
 * exists to show what is in Salesforce but NOT yet in Unity, and to import it.
 *
 *   GET /salesforce/opportunities/                     raw Salesforce opportunities
 *   GET /rest/v3.1/billing/salesforce_opportunity/     what Unity already holds
 *   GET /rest/org/                                     to map salesforce_id -> org
 *   PUT /rest/org/{id}/                                link / unlink an account
 *   POST /rest/v3.1/billing/salesforce_opportunity/    import one
 *   PUT /salesforce/link_opportunity/  { id }          mark it linked in Salesforce
 *
 * Note /salesforce/ is mounted OUTSIDE /rest; the local proxy had to learn that prefix
 * before these two calls could reach the backend at all.
 *
 * Three states drive the row badges, exactly as the legacy controller computed them:
 *   linked   - the opportunity's AccountId maps to a Unity organization
 *   imported - Unity already has a record with this sfid
 *   synced   - imported and flagged in Salesforce agree with each other
 */

interface Selection {
  oppty: ApiRecord;
  linked: boolean;
  imported: boolean;
  synced: boolean;
  org: ApiRecord | null;
}

const asRows = (v: unknown): ApiRecord[] => {
  if (Array.isArray(v)) return v as ApiRecord[];
  if (v && typeof v === 'object' && Array.isArray((v as ApiRecord).results)) {
    return (v as ApiRecord).results as ApiRecord[];
  }
  return [];
};

const LINK_FIELDS: FieldDef[] = [
  {
    name: 'organization',
    label: 'Unity Organization',
    cell: 'fk',
    input: 'typeahead',
    required: true,
    lookupUri: 'fast/org',
    lookupIdProp: 'id',
    subfield: 'name',
  },
];

export function SalesforceImportPage() {
  const toast = useToast();
  const [opptys, setOpptys] = useState<ApiRecord[]>([]);
  const [unity, setUnity] = useState<ApiRecord[]>([]);
  const [linkMap, setLinkMap] = useState<Record<string, ApiRecord>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [linkFor, setLinkFor] = useState<ApiRecord | null>(null);
  const [unlinkFor, setUnlinkFor] = useState<Selection | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sf, uni, orgs] = await Promise.all([
        api.rawGet<unknown>('/salesforce/opportunities').catch(() => {
          throw new Error('Error occurred while fetching Opportunities. Please contact Support');
        }),
        api.list<ApiRecord>('v3.1/billing/salesforce_opportunity').catch(() => ({ items: [] as ApiRecord[], count: 0 })),
        api.list<ApiRecord>('org').catch(() => ({ items: [] as ApiRecord[], count: 0 })),
      ]);
      setOpptys(asRows(sf));
      setUnity(uni.items);
      const map: Record<string, ApiRecord> = {};
      orgs.items.forEach((o) => {
        if (o.salesforce_id !== null && o.salesforce_id !== undefined && o.salesforce_id !== '') {
          map[String(o.salesforce_id)] = o;
        }
      });
      setLinkMap(map);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load opportunities.');
      setOpptys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows: Selection[] = useMemo(
    () =>
      opptys.map((o) => {
        const linked = Object.prototype.hasOwnProperty.call(linkMap, String(o.AccountId));
        const imported = unity.some((u) => String(u.sfid) === String(o.Id));
        const flagged = Boolean(o.Unity_Linked__c);
        return {
          oppty: o,
          linked,
          imported,
          org: linkMap[String(o.AccountId)] || null,
          // imported && flagged, or neither - anything else has drifted.
          synced: (imported && flagged) || (!imported && !flagged),
        };
      }),
    [opptys, unity, linkMap]
  );

  const linkAccount = async (values: ApiRecord) => {
    if (!linkFor) return;
    const org = values.organization as ApiRecord | null;
    if (!org?.id) return;
    setBusy(true);
    try {
      const full = await api.detail<ApiRecord>('org', String(org.id));
      const saved = { ...full, salesforce_id: linkFor.AccountId };
      await api.update('org', String(org.id), saved);
      /* Patch the one map entry this write changed rather than re-fetching the whole
         org collection - `rows` is a useMemo over linkMap and repaints on its own. */
      setLinkMap((prev) => ({ ...prev, [String(linkFor.AccountId)]: saved }));
      toast.success(`Linked ${scalarize(org.name)} to ${scalarize(linkFor.AccountId)}`, 'Linked');
      setLinkFor(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not link this account.');
    } finally {
      setBusy(false);
    }
  };

  const unlinkAccount = async () => {
    if (!unlinkFor?.org) return;
    setBusy(true);
    try {
      const full = await api.detail<ApiRecord>('org', String(unlinkFor.org.id));
      await api.update('org', String(unlinkFor.org.id), { ...full, salesforce_id: null });
      // Same reasoning as linkAccount: drop the one key, no refetch.
      setLinkMap((prev) => {
        const next = { ...prev };
        delete next[String(unlinkFor.oppty.AccountId)];
        return next;
      });
      toast.success(`Unlinked ${scalarize(unlinkFor.oppty.AccountId)}`, 'Unlinked');
      setUnlinkFor(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not unlink this account.');
    } finally {
      setBusy(false);
    }
  };

  /* Field mapping is the legacy import() verbatim - Salesforce names on the left. */
  const importOppty = async (sel: Selection) => {
    if (!sel.linked) {
      toast.error('Link Opportunity to Unity account before importing');
      return;
    }
    const o = sel.oppty;
    setBusy(true);
    try {
      const account = (o.Account as ApiRecord) || {};
      const owner = (o.Owner as ApiRecord) || {};
      const lineItems = (o.OpportunityLineItems as ApiRecord) || {};
      await api.create('v3.1/billing/salesforce_opportunity', {
        sfid: o.Id,
        customer: sel.org,
        account_name: account.Name,
        email: o.Email__c,
        name: o.Name,
        owner_name: owner.Name,
        stage_name: o.StageName,
        mrc: o.Monthly_Charges__c,
        nrc: o.NRR__c,
        committed_delivery_date: o.Committed_Delivery_Date__c,
        opportunity_line_items: lineItems.records,
      });
      // Legacy then flags it on the Salesforce side so the two stay in sync.
      await api.putRaw('/salesforce/link_opportunity', { id: o.Id }).catch(() => null);
      /* Only the imported-opportunity list changed. Re-read that one collection - the
         org map and the Salesforce list are both untouched by this write. */
      const refreshed = await api
        .list<ApiRecord>('v3.1/billing/salesforce_opportunity', undefined, { fresh: true })
        .catch(() => null);
      if (refreshed) setUnity(refreshed.items);
      toast.success('Opportunity imported', 'Imported');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import unsuccessful');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="content-fade">
      <Card>
        <CardHead
          title="Import Opportunities"
          icon="upload"
          action={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Badge tone="brand">{rows.length}</Badge>
              <Button variant="default" size="sm" icon="refresh-cw" onClick={load} disabled={loading}>
                Refresh
              </Button>
            </div>
          }
        />
        {loading ? (
          <LoadingBlock label="Fetching opportunities from Salesforce..." />
        ) : error ? (
          <EmptyState
            icon="alert-triangle"
            title="Could not fetch"
            message={error}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={load}>
                Retry
              </Button>
            }
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon="upload"
            title="No opportunities"
            message="Salesforce returned no opportunities to import."
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Account</th>
                  <th>Stage</th>
                  <th className="col-num">MRC</th>
                  <th className="col-num">NRC</th>
                  <th>Delivery</th>
                  <th className="col-center">Linked</th>
                  <th className="col-center">Imported</th>
                  <th className="col-center">In Sync</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((sel, i) => {
                  const o = sel.oppty;
                  const account = (o.Account as ApiRecord) || {};
                  return (
                    <tr key={String(o.Id ?? i)}>
                      <td>{scalarize(o.Name) || '-'}</td>
                      <td>{scalarize(account.Name) || '-'}</td>
                      <td>{scalarize(o.StageName) || '-'}</td>
                      <td className="col-num cell-mono">{scalarize(o.Monthly_Charges__c) || '-'}</td>
                      <td className="col-num cell-mono">{scalarize(o.NRR__c) || '-'}</td>
                      <td className="cell-mono">{formatDate(o.Committed_Delivery_Date__c) || '-'}</td>
                      <td className="col-center">
                        {sel.linked ? (
                          <Badge tone="success" dot>{scalarize(sel.org?.name) || 'Yes'}</Badge>
                        ) : (
                          <Badge tone="neutral">No</Badge>
                        )}
                      </td>
                      <td className="col-center">
                        {sel.imported ? <Badge tone="success" dot>Yes</Badge> : <Badge tone="neutral">No</Badge>}
                      </td>
                      <td className="col-center">
                        {sel.synced ? <Badge tone="success">Yes</Badge> : <Badge tone="warning" dot>Drifted</Badge>}
                      </td>
                      <td className="col-actions">
                        <span style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {sel.linked ? (
                            <Button variant="default" size="sm" onClick={() => setUnlinkFor(sel)}>
                              Unlink
                            </Button>
                          ) : (
                            <Button variant="default" size="sm" onClick={() => setLinkFor(o)}>
                              Link Account
                            </Button>
                          )}
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={sel.imported || busy}
                            onClick={() => importOppty(sel)}
                          >
                            {sel.imported ? 'Imported' : 'Import'}
                          </Button>
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

      {linkFor && (
        <FormModal
          title="Link Salesforce Account"
          subtitle={`Salesforce account ${scalarize(linkFor.AccountId)}`}
          onClose={() => setLinkFor(null)}
        >
          <RecordForm
            fields={LINK_FIELDS}
            method="Add"
            submitting={busy}
            onSubmit={linkAccount}
            onCancel={() => setLinkFor(null)}
          />
        </FormModal>
      )}

      {unlinkFor && (
        <ConfirmDialog
          title="Unlink account?"
          message={
            <>
              Unlink <strong>{scalarize(unlinkFor.org?.name)}</strong> from Salesforce account{' '}
              <strong>{scalarize(unlinkFor.oppty.AccountId)}</strong>? The organization's Salesforce ID is cleared.
            </>
          }
          loading={busy}
          onConfirm={unlinkAccount}
          onCancel={() => setUnlinkFor(null)}
        />
      )}
    </div>
  );
}
