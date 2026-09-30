import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../data/apiClient';
import { ApiRecord } from '../../data/types';
import { Icon } from '../ui/Icon';

interface MultiSelectProps {
  value: ApiRecord[];
  /* null while a dependency is unset - the control renders disabled rather than
     fetching a URL built from an undefined id. */
  lookupUri: string | null;
  displayProp: string;
  idProp: string;
  placeholder?: string;
  resultKey?: string;
  onChange: (items: ApiRecord[]) => void;
}

// M2M multi-select: loads options once and lets the user toggle chips.
export function MultiSelect({ value, lookupUri, displayProp, idProp, placeholder, resultKey, onChange }: MultiSelectProps) {
  const [options, setOptions] = useState<ApiRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    if (!lookupUri) {
      setOptions([]);
      setLoaded(false);
      return;
    }
    setLoaded(false);
    api
      .options<ApiRecord>(lookupUri, resultKey, { page_size: 500 })
      .then((items) => active && setOptions(items))
      .catch(() => active && setOptions([]))
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, [lookupUri, resultKey]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const selectedIds = new Set(value.map((v) => String(v[idProp] ?? v.id)));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 60);
    return options.filter((o) => String(o[displayProp] ?? o.name ?? '').toLowerCase().includes(q)).slice(0, 60);
  }, [options, query, displayProp]);

  const toggle = (opt: ApiRecord) => {
    const id = String(opt[idProp] ?? opt.id);
    if (selectedIds.has(id)) {
      onChange(value.filter((v) => String(v[idProp] ?? v.id) !== id));
    } else {
      onChange([...value, opt]);
    }
  };

  return (
    <div className="typeahead" ref={boxRef}>
      <div
        onClick={() => lookupUri && setOpen((o) => !o)}
        style={{
          minHeight: 38,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          padding: '5px 8px',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-elevated)',
          cursor: 'pointer',
        }}
      >
        {value.length === 0 && <span className="u-faint" style={{ fontSize: 'var(--fs-sm)' }}>{placeholder || 'Select...'}</span>}
        {value.map((v) => (
          <span className="chip removable" key={String(v[idProp] ?? v.id)}>
            {String(v[displayProp] ?? v.name)}
            <span
              className="chip-x"
              onClick={(e) => {
                e.stopPropagation();
                toggle(v);
              }}
            >
              <Icon name="x" size={12} />
            </span>
          </span>
        ))}
        <span style={{ marginLeft: 'auto', color: 'var(--text-faint)' }}>
          <Icon name="chevron-down" size={15} />
        </span>
      </div>
      {open && (
        <div className="typeahead-menu">
          <input
            type="text"
            autoFocus
            placeholder="Filter..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              marginBottom: 4,
              padding: '6px 8px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xs)',
              fontSize: 'var(--fs-sm)',
            }}
          />
          {!loaded && <div className="ta-empty">Loading...</div>}
          {loaded && filtered.length === 0 && <div className="ta-empty">No options</div>}
          {filtered.map((opt, i) => {
            const id = String(opt[idProp] ?? opt.id);
            const checked = selectedIds.has(id);
            return (
              <div key={id + i} className={`ta-opt${checked ? ' active' : ''}`} onMouseDown={(e) => { e.preventDefault(); toggle(opt); }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Icon name={checked ? 'check-square' : 'square'} size={15} />
                  {String(opt[displayProp] ?? opt.name ?? id)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
