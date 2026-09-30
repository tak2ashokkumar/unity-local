import { useState } from 'react';
import { ApiRecord } from '../../data/types';
import { scalarize } from '../../utils/format';
import { Button } from './primitives';
import { FormModal } from './Overlay';

/*
 * "Load in iframe" - the management-console launcher the five proxy pages carried
 * (controllers/tools.js: TenableController:318, VcenterProxyController:360,
 * EsxiProxyController:402, OpenstackProxyController2:442, F5LoadBalancerProxyController2).
 * Each set iframe.src to the row's proxy_fqdn so the device's own web UI opened inside
 * the panel. The port dropped it, leaving no way to reach a proxied device's console.
 *
 * The iframe is kept because that is what the legacy panel did, but device UIs commonly
 * send X-Frame-Options: DENY, in which case the frame stays blank - so the same URL is
 * always offered as a plain link too.
 */
export function ProxyConsoleModal({
  row,
  urlField,
  label,
  onClose,
}: {
  row: ApiRecord;
  urlField: string;
  label: string;
  onClose: () => void;
}) {
  const [frameKey, setFrameKey] = useState(0);
  const raw = scalarize(row[urlField]);
  // Stored values are bare hostnames as often as full URLs.
  const url = raw && !/^https?:\/\//i.test(raw) ? `https://${raw}` : raw;
  const title = scalarize(row.name ?? row.proxy_url) || label;

  return (
    <FormModal title={label} subtitle={title} onClose={onClose}>
      {!url ? (
        <div className="record-form">
          <div className="form-grid">
            <div className="form-banner">This record has no proxy address to open.</div>
          </div>
          <div className="form-actions">
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="proxy-console">
            <iframe key={frameKey} src={url} title={title} />
          </div>
          <div className="form-actions" style={{ justifyContent: 'space-between' }}>
            <a className="cell-link mono" href={url} target="_blank" rel="noreferrer">
              {url}
            </a>
            <span style={{ display: 'flex', gap: 8 }}>
              <Button variant="default" icon="refresh-cw" onClick={() => setFrameKey((k) => k + 1)}>
                Reload
              </Button>
              <Button variant="default" icon="external-link" onClick={() => window.open(url, '_blank', 'noopener')}>
                Open in new tab
              </Button>
              <Button variant="primary" onClick={onClose}>
                Close
              </Button>
            </span>
          </div>
        </>
      )}
    </FormModal>
  );
}
