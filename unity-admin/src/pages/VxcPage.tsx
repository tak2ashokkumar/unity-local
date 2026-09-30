import { useCallback, useEffect, useState } from 'react';
import { api } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { scalarize } from '../utils/format';
import { Card, CardHead, Button, Badge } from '../components/ui/primitives';
import { ConfirmDialog } from '../components/ui/Overlay';
import { Icon } from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';

/*
 * Buy VXC (legacy /manage_unitedconnect/vxc): three tabs that each provision a virtual
 * cross connect against a UnityConnect port. This PURCHASES capacity, so the Buy action
 * is gated behind an explicit confirmation.
 */
type TabKey = 'private' | 'aws' | 'azure';

interface FieldSpec {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select';
  optionsFrom?: 'ports' | 'orgs';
  required?: boolean;
}

const COMMON: FieldSpec[] = [
  { name: 'product_name', label: 'Product Name', type: 'text', required: true },
  { name: 'parent_port', label: 'Parent Port', type: 'select', optionsFrom: 'ports', required: true },
  { name: 'source_vlan', label: 'Source VLAN', type: 'number', required: true },
  { name: 'customer', label: 'Customer', type: 'select', optionsFrom: 'orgs', required: true },
];

const TABS: { key: TabKey; label: string; fields: FieldSpec[] }[] = [
  {
    key: 'private',
    label: 'Private VXC',
    fields: [
      ...COMMON,
      { name: 'target_vlan', label: 'Target VLAN', type: 'number', required: true },
      { name: 'speed_limit', label: 'Speed Limit (Mbps)', type: 'number', required: true },
      { name: 'target_port', label: 'Target Port', type: 'select', optionsFrom: 'ports', required: true },
    ],
  },
  {
    key: 'aws',
    label: 'VXC to AWS',
    fields: [
      ...COMMON,
      { name: 'speed_limit', label: 'Speed Limit (Mbps)', type: 'number', required: true },
      { name: 'service_key', label: 'AWS Service Key', type: 'text', required: true },
    ],
  },
  {
    key: 'azure',
    label: 'VXC to Azure',
    fields: [
      ...COMMON,
      { name: 'speed_limit', label: 'Speed Limit (Mbps)', type: 'number', required: true },
      { name: 'service_key', label: 'Azure Service Key', type: 'text', required: true },
    ],
  },
];

export function VxcPage() {
  const toast = useToast();
  const [tab, setTab] = useState<TabKey>('private');
  const [ports, setPorts] = useState<ApiRecord[]>([]);
  const [orgs, setOrgs] = useState<ApiRecord[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [buying, setBuying] = useState(false);

  const loadLookups = useCallback(async () => {
    setLookupError(null);
    try {
      const [portsRes, orgsRes] = await Promise.all([
        api.list<ApiRecord>('unitedconnect'),
        api.list<ApiRecord>('fast/org', { page_size: 500 }),
      ]);
      setPorts(portsRes.items);
      setOrgs(orgsRes.items);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not load ports or organizations.';
      setLookupError(msg);
      toast.error(msg);
    }
  }, [toast]);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  const active = TABS.find((t) => t.key === tab)!;
  const set = (n: string, v: string) => setValues((p) => ({ ...p, [n]: v }));

  const switchTab = (k: TabKey) => {
    setTab(k);
    setValues({});
    setErrors({});
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    active.fields.forEach((f) => {
      if (f.required && !String(values[f.name] || '').trim()) errs[f.name] = `${f.label} is required`;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buy = async () => {
    setBuying(true);
    try {
      await api.create('vxc', { ...values, vxc_type: tab });
      toast.success(`${active.label} provisioning request submitted.`, 'Ordered');
      setValues({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not submit the VXC order.');
    } finally {
      setBuying(false);
      setConfirming(false);
    }
  };

  const optionsFor = (f: FieldSpec) => (f.optionsFrom === 'ports' ? ports : orgs);

  return (
    <div className="content-fade">
      <div className="page-tabs">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={`tab-btn${t.key === tab ? ' active' : ''}`} onClick={() => switchTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      <Card>
        <CardHead
          title={active.label}
          icon="arrow-left-right"
          action={<Badge tone="warning" dot>Provisions billable capacity</Badge>}
        />
        {lookupError && (
          <div style={{ margin: '16px 20px 0', padding: '12px 16px', background: 'var(--danger-soft)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 'var(--fs-xs)', color: '#a5322c' }}>{lookupError}</span>
            <Button variant="default" size="sm" icon="refresh-cw" onClick={loadLookups}>
              Retry
            </Button>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (validate()) setConfirming(true);
          }}
          style={{ padding: '18px 20px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {active.fields.map((f) => (
              <div className="field" key={f.name}>
                <label>
                  {f.label}
                  {f.required && <span className="req">*</span>}
                </label>
                {f.type === 'select' ? (
                  <select
                    className={errors[f.name] ? 'invalid' : ''}
                    value={values[f.name] || ''}
                    onChange={(e) => set(f.name, e.target.value)}
                  >
                    <option value="">-- Select {f.label.toLowerCase()} --</option>
                    {optionsFor(f).map((o) => (
                      <option key={String(o.id ?? o.uuid)} value={String(o.id ?? o.uuid)}>
                        {scalarize(o.name)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type === 'number' ? 'number' : 'text'}
                    className={errors[f.name] ? 'invalid' : ''}
                    value={values[f.name] || ''}
                    onChange={(e) => set(f.name, e.target.value)}
                  />
                )}
                {errors[f.name] && <div className="field-err">{errors[f.name]}</div>}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button type="submit" variant="primary" icon="shopping-cart">
              Buy
            </Button>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-xs)', color: 'var(--text-faint)' }}>
              <Icon name="alert-triangle" size={14} />
              You will be asked to confirm before anything is ordered.
            </span>
          </div>
        </form>
      </Card>

      {confirming && (
        <ConfirmDialog
          title={`Order ${active.label}?`}
          message={
            <>
              This provisions a billable virtual cross connect
              {values.product_name ? (
                <>
                  {' '}named <strong>{values.product_name}</strong>
                </>
              ) : null}
              {values.speed_limit ? <> at <strong>{values.speed_limit} Mbps</strong></> : null}. This action costs money.
            </>
          }
          confirmLabel="Place order"
          danger={false}
          loading={buying}
          onConfirm={buy}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}
