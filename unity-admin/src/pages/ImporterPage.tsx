import { useRef, useState, type JSX } from 'react';
import { api, ApiError } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { Card, CardHead, Button, Badge, Spinner } from '../components/ui/primitives';
import { ConfirmDialog } from '../components/ui/Overlay';
import { Icon } from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';

/*
 * Import Tool (legacy /import2 -> ImporterController, controllers/tools.js:7
 * + templates/import2.html). Two steps, and the port previously did neither.
 *
 *   1. POST /tools/upload_xlsx/   multipart/form-data, ONE part named `excel_file`.
 *      -> a JSON object keyed by sheet name. CUSTOMER_INFO[0].Name is the customer
 *         label the legacy page shows above the preview.
 *      Error body is { data: "<message>" }.
 *
 *   2. POST /tools/upload_json/   JSON body { data: <the whole object from step 1> }
 *      -> result keys plus an `Errors` key, which legacy splits out and renders in
 *         a separate red panel. Error body also carries `Errors`.
 *
 * The previous implementation posted { file_name, size } as JSON and discarded the
 * File entirely, so the backend never received a workbook - nothing could ever be
 * imported. Step 2 did not exist at all; its button was wired to step 1.
 *
 * Step 2 WRITES real records, so it is gated behind a confirm dialog naming the
 * target environment. Legacy had no such guard.
 */
export function ImporterPage() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ApiRecord | null>(null);
  const [customer, setCustomer] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [errors, setErrors] = useState<unknown>(null);
  const [result, setResult] = useState<unknown>(null);

  const reset = () => {
    setParsed(null);
    setCustomer('');
    setErrors(null);
    setResult(null);
  };

  // Legacy fires the upload the instant a file is chosen - no separate submit.
  const onPick = async (picked: File | undefined) => {
    if (!picked) return;
    setFile(picked);
    reset();
    setUploading(true);
    try {
      const data = await api.postFile<ApiRecord>('/tools/upload_xlsx', 'excel_file', picked);
      setParsed(data);
      // Null-guarded: legacy threw an unhandled TypeError when CUSTOMER_INFO was absent.
      const info = data && (data.CUSTOMER_INFO as ApiRecord[] | undefined);
      setCustomer(Array.isArray(info) && info[0] ? String(info[0].Name ?? '') : '');
      toast.success(`${picked.name} parsed. Review the preview, then import.`, 'Parsed');
    } catch (err) {
      const body = err instanceof ApiError ? err.body : null;
      // xlsx failures nest the message one level under `data`.
      const msg =
        body && typeof body === 'object' && 'data' in (body as ApiRecord)
          ? String((body as ApiRecord).data)
          : err instanceof Error
          ? err.message
          : 'Could not parse the workbook.';
      setErrors(msg);
      toast.error('Could not parse the workbook.');
    } finally {
      setUploading(false);
    }
  };

  const runImport = async () => {
    if (!parsed) return;
    setConfirming(false);
    setImporting(true);
    setErrors(null);
    setResult(null);
    try {
      const res = await api.rawPost<ApiRecord>('/tools/upload_json', { data: parsed });
      const { Errors, ...rest } = (res || {}) as ApiRecord;
      // Legacy showed the red panel unconditionally; only show it when non-empty.
      if (Errors !== undefined && Errors !== null && (!Array.isArray(Errors) || Errors.length)) {
        setErrors(Errors);
      }
      setResult(rest);
      toast.success('Import submitted.', 'Imported');
    } catch (err) {
      const body = err instanceof ApiError ? err.body : null;
      const errs = body && typeof body === 'object' ? (body as ApiRecord).Errors ?? body : String(err);
      setErrors(errs);
      toast.error('Import failed.');
    } finally {
      setImporting(false);
    }
  };

  const pre = (value: unknown, danger = false): JSX.Element => (
    <pre
      style={{
        margin: 0,
        padding: '12px 14px',
        background: danger ? 'var(--danger-soft)' : 'var(--bg-inset)',
        border: `1px solid ${danger ? 'var(--danger)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-xs)',
        color: danger ? '#a5322c' : 'var(--text)',
        maxHeight: 320,
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
      }}
    >
      {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
    </pre>
  );

  return (
    <div className="content-fade">
      <Card style={{ marginBottom: 18 }}>
        <CardHead
          title="Import Tool"
          icon="upload"
          action={<Badge tone="danger" dot>Import into Unity</Badge>}
        />
        <div style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 16 }}>
            Upload an XLSX workbook. It is parsed server-side first so you can review what was read, then imported in a
            second step.
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx"
            style={{ display: 'none' }}
            onChange={(e) => onPick(e.target.files?.[0])}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Button variant="primary" icon="upload" onClick={() => fileRef.current?.click()} loading={uploading}>
              Select File To Upload
            </Button>
            {file && (
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
                <span className="mono">{file.name}</span> ({Math.max(1, Math.round(file.size / 1024))} KB)
              </span>
            )}
            {uploading && <Spinner />}
          </div>
        </div>
      </Card>

      {parsed && (
        <Card style={{ marginBottom: 18 }}>
          <CardHead
            title="JSON representation"
            icon="file-code"
            action={customer ? <Badge tone="brand">{customer}</Badge> : undefined}
          />
          <div style={{ padding: '0 20px 16px' }}>{pre(parsed)}</div>
          <div className="form-actions">
            <Button
              variant="primary"
              icon="arrow-right"
              loading={importing}
              onClick={() => setConfirming(true)}
            >
              Update Unity
            </Button>
          </div>
        </Card>
      )}

      {/* `errors` and `result` are `unknown` (arbitrary JSON from the importer), and
          `unknown && <jsx/>` is itself `unknown` - not a valid ReactNode, which is what
          TS was rejecting. Comparing against null also fixes a real edge: a response of
          0 or "" is a RESULT and should render, where a truthiness test would hide it. */}
      {(errors != null || result != null) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          {errors ? (
            <Card>
              <CardHead title="Errors" icon="alert-triangle" />
              <div style={{ padding: '0 20px 18px' }}>{pre(errors, true)}</div>
            </Card>
          ) : null}
          {result ? (
            <Card>
              <CardHead title="Result" icon="check-circle-2" />
              <div style={{ padding: '0 20px 18px' }}>{pre(result)}</div>
            </Card>
          ) : null}
        </div>
      )}

      {!parsed && !uploading && !errors && (
        <Card className="card-pad" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-faint)' }}>
          <Icon name="file-spreadsheet" size={26} />
          <div style={{ marginTop: 10, fontSize: 'var(--fs-sm)' }}>No workbook loaded yet.</div>
        </Card>
      )}

      {confirming && (
        <ConfirmDialog
          title="Import into Unity?"
          message={
            <>
              This writes the parsed workbook{customer ? <> for <strong>{customer}</strong></> : null} into{' '}
              <strong>the configured backend</strong>. It cannot be undone from this screen.
            </>
          }
          confirmLabel="Import"
          danger
          loading={importing}
          onConfirm={runImport}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}
