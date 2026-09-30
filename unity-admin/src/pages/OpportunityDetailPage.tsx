import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { formatDate, scalarize } from '../utils/format';
import { FieldDef } from '../config/fieldTypes';
import { Badge, Button, Card, CardHead, EmptyState, LoadingBlock } from '../components/ui/primitives';
import { FormModal } from '../components/ui/Overlay';
import { RecordForm } from '../components/forms/RecordForm';
import { useToast } from '../components/ui/Toast';

/*
 * Salesforce opportunity detail with its invoices - the billing screen the port left out
 * entirely (templates/organization_detail.html:218 + controllers/billing.js:300).
 *
 *   GET  v3.1/billing/salesforce_opportunity/{id}/
 *   GET  v3.1/billing/invoice/                 filtered to this opportunity client-side,
 *                                              exactly as getOpptyInvoices() did
 *   POST v3.1/billing/invoice/  { opportunity, billing_month, billing_year }
 *
 * EXPORT: the legacy Export Invoice built a PDF in the browser with jsPDF. This project
 * carries no PDF library, so Export opens a print view of the same invoice instead -
 * the browser's own "Save as PDF" produces the document without adding a dependency.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => String(thisYear - 3 + i));

const money = (v: unknown): string => {
  const n = Number(v);
  return Number.isFinite(n) ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-';
};

const obj = (v: unknown): ApiRecord | null =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as ApiRecord) : null;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="kv-row">
      <div className="kv-label">{label}</div>
      <div className="kv-value">{children}</div>
    </div>
  );
}

export function OpportunityDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [oppty, setOppty] = useState<ApiRecord | null>(null);
  const [invoices, setInvoices] = useState<ApiRecord[]>([]);
  const [selected, setSelected] = useState<ApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genOpen, setGenOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rec = await api.detail<ApiRecord>('v3.1/billing/salesforce_opportunity', id);
      setOppty(rec);
      const all = await api.list<ApiRecord>('v3.1/billing/invoice').catch(() => ({ items: [] as ApiRecord[], count: 0 }));
      // Legacy matched on invoice.opportunity.id === oppty.id.
      setInvoices(all.items.filter((inv) => String(obj(inv.opportunity)?.id ?? inv.opportunity) === String(rec.id)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load this opportunity.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const generate = async (values: ApiRecord) => {
    if (!oppty) return;
    setBusy(true);
    try {
      await api.create('v3.1/billing/invoice', {
        opportunity: oppty,
        billing_month: values.billing_month,
        billing_year: values.billing_year,
      });
      toast.success('added invoice!', 'Generated');
      setGenOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not generate the invoice.');
    } finally {
      setBusy(false);
    }
  };

  /* Print view: same content the legacy PDF carried (header, totals, line items). */
  const exportInvoice = () => {
    if (!selected) return;
    const items = Array.isArray(selected.invoice_line_items) ? (selected.invoice_line_items as ApiRecord[]) : [];
    const esc = (s: unknown) =>
      String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
    const win = window.open('', '_blank', 'noopener,width=900,height=1000');
    if (!win) {
      toast.error('The browser blocked the print window.');
      return;
    }
    win.document.write(`<!doctype html><html><head><title>Invoice ${esc(selected.billing_month)} ${esc(
      selected.billing_year
    )}</title><style>
      body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#15202b;margin:40px;}
      h1{font-size:22px;margin:0 0 4px;} .sub{color:#61707e;margin:0 0 24px;}
      table{border-collapse:collapse;width:100%;font-size:13px;}
      th{text-align:left;border-bottom:2px solid #15202b;padding:8px 6px;}
      td{border-bottom:1px solid #dbe2e9;padding:8px 6px;}
      .num{text-align:right;} .tot{margin-top:20px;font-size:18px;font-weight:600;}
    </style></head><body>
      <h1>${esc(scalarize(oppty?.name))}</h1>
      <p class="sub">${esc(selected.billing_month)} ${esc(selected.billing_year)} &middot; ${esc(
      scalarize(oppty?.account_name)
    )}</p>
      <table><thead><tr><th>Product</th><th class="num">Unit Price</th><th class="num">Quantity</th><th class="num">Total</th></tr></thead><tbody>
      ${items
        .map(
          (p) =>
            `<tr><td>${esc(p.product ?? p.Product ?? '')}</td><td class="num">${esc(
              money(p.UnitPrice)
            )}</td><td class="num">${esc(p.Quantity ?? '')}</td><td class="num">${esc(money(p.TotalPrice))}</td></tr>`
        )
        .join('')}
      </tbody></table>
      <p class="tot">Total Amount: ${esc(money(selected.amount_billed))}</p>
    </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const genFields: FieldDef[] = [
    { name: 'billing_month', label: 'Billing Month', cell: 'text', input: 'choices', required: true, choices: MONTHS },
    { name: 'billing_year', label: 'Billing Year', cell: 'text', input: 'choices', required: true, choices: YEARS },
  ];

  if (loading) {
    return (
      <div className="content-fade">
        <Card>
          <LoadingBlock label="Loading opportunity..." />
        </Card>
      </div>
    );
  }

  if (error || !oppty) {
    return (
      <div className="content-fade">
        <Card>
          <EmptyState
            icon="alert-triangle"
            title="Opportunity not found"
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

  const customer = obj(oppty.customer);
  const lineItems = selected && Array.isArray(selected.invoice_line_items) ? (selected.invoice_line_items as ApiRecord[]) : [];

  return (
    <div className="content-fade">
      <div style={{ marginBottom: 14 }}>
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => navigate('/sf_opportunity')}>
          Back to Opportunities
        </Button>
      </div>

      <div className="detail-grid">
        <div className="detail-col">
          <Card>
            <CardHead
              title={scalarize(oppty.name) || 'Opportunity'}
              icon="copy"
              action={<Badge tone="info">{scalarize(oppty.stage_name) || 'Stage'}</Badge>}
            />
            <div>
              <Row label="Name">{scalarize(oppty.name) || '-'}</Row>
              <Row label="SFDC Account">{scalarize(oppty.account_name) || '-'}</Row>
              <Row label="Customer">
                {customer?.id ? (
                  <Link className="cell-link" to={`/org/${String(customer.id)}`}>
                    {scalarize(customer.name)}
                  </Link>
                ) : (
                  '-'
                )}
              </Row>
              <Row label="Owner">{scalarize(oppty.owner_name) || '-'}</Row>
              <Row label="Email">{scalarize(oppty.email) || '-'}</Row>
              <Row label="MRC">{money(oppty.mrc)}</Row>
              <Row label="NRC">{money(oppty.nrc)}</Row>
              <Row label="Committed Delivery">{formatDate(oppty.committed_delivery_date) || '-'}</Row>
              <Row label="Salesforce ID">
                <span className="mono">{scalarize(oppty.sfid) || '-'}</span>
              </Row>
            </div>
          </Card>
        </div>

        <div className="detail-col">
          <Card>
            <CardHead
              title="Invoices"
              icon="receipt"
              action={
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Badge tone="brand">{invoices.length}</Badge>
                  <Button variant="primary" size="sm" icon="plus" onClick={() => setGenOpen(true)}>
                    Generate Invoice
                  </Button>
                </div>
              }
            />
            {invoices.length === 0 ? (
              <EmptyState icon="receipt" title="No invoices" message="No invoice has been generated for this opportunity." />
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Billing Month</th>
                      <th>Billing Year</th>
                      <th className="col-num">Amount Billed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv, i) => (
                      <tr
                        key={String(inv.id ?? i)}
                        className={selected && selected.id === inv.id ? 'row-selected' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelected(inv)}
                      >
                        <td>{scalarize(inv.billing_month) || '-'}</td>
                        <td>{scalarize(inv.billing_year) || '-'}</td>
                        <td className="col-num cell-mono">{money(inv.amount_billed)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {selected && (
        <Card style={{ marginTop: 18 }}>
          <CardHead
            title={`${scalarize(selected.billing_month)} ${scalarize(selected.billing_year)} Details`}
            icon="receipt"
            action={
              <Button variant="default" size="sm" icon="download" onClick={exportInvoice}>
                Export Invoice
              </Button>
            }
          />
          <div style={{ padding: '14px 20px 4px' }}>
            <div style={{ fontSize: 'var(--fs-lg, 20px)', fontWeight: 600 }}>
              Total Amount: {money(selected.amount_billed)}
            </div>
          </div>
          {lineItems.length === 0 ? (
            <EmptyState icon="list" title="No line items" message="This invoice has no line items." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="col-num">Unit Price</th>
                    <th className="col-num">Quantity</th>
                    <th className="col-num">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((p, i) => (
                    <tr key={i}>
                      <td>{scalarize(p.product ?? p.Product) || '-'}</td>
                      <td className="col-num cell-mono">{money(p.UnitPrice)}</td>
                      <td className="col-num cell-mono">{scalarize(p.Quantity) || '-'}</td>
                      <td className="col-num cell-mono">{money(p.TotalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="card-foot" style={{ gap: 18, fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
            <span>Created: {formatDate(selected.created_at) || '-'}</span>
            <span>Updated: {formatDate(selected.updated_at) || '-'}</span>
          </div>
        </Card>
      )}

      {genOpen && (
        <FormModal title="Generate Invoice" subtitle={scalarize(oppty.name)} onClose={() => setGenOpen(false)}>
          <RecordForm
            fields={genFields}
            method="Add"
            submitting={busy}
            onSubmit={generate}
            onCancel={() => setGenOpen(false)}
          />
        </FormModal>
      )}
    </div>
  );
}
