import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../data/apiClient';
import { ApiRecord } from '../../data/types';
import { Icon } from '../ui/Icon';

interface TypeaheadProps {
  value: ApiRecord | null;
  /* null while a dependency is unset - see MultiSelect for the same contract. */
  lookupUri: string | null;
  accessor: string;
  placeholder?: string;
  invalid?: boolean;
  resultKey?: string;
  labelOf?: (option: ApiRecord) => string;
  onChange: (obj: ApiRecord | null) => void;
}

// Async single-select foreign-key picker. The mock ignores ?search, so we load
// the collection once and filter client-side by the display accessor.
export function Typeahead({ value, lookupUri, accessor, placeholder, invalid, resultKey, labelOf, onChange }: TypeaheadProps) {
  const [options, setOptions] = useState<ApiRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const optionLabel = (o: ApiRecord): string =>
    labelOf ? labelOf(o) : String(o[accessor] ?? o.name ?? '');
  const label = value ? optionLabel(value) : '';

  const loadOptions = async () => {
    if (loaded || !lookupUri) return;
    try {
      const items = await api.options<ApiRecord>(lookupUri, resultKey, { page_size: 500 });
      setOptions(items);
    } catch {
      setOptions([]);
    } finally {
      setLoaded(true);
    }
  };

  /* A dependent lookup changes URL when its parent changes, so the cached option
     list has to be dropped - otherwise the previous parent's options stay on
     screen and can be picked. */
  useEffect(() => {
    setOptions([]);
    setLoaded(false);
    setQuery('');
  }, [lookupUri, resultKey]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const src = options;
    if (!q) return src.slice(0, 50);
    return src.filter((o) => optionLabel(o).toLowerCase().includes(q)).slice(0, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, query, accessor, labelOf]);

  const openMenu = () => {
    if (!lookupUri) return;
    setOpen(true);
    setActive(0);
    loadOptions();
  };

  const pick = (opt: ApiRecord) => {
    onChange(opt);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="typeahead" ref={boxRef}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className={invalid ? 'invalid' : ''}
          placeholder={placeholder || 'Search...'}
          value={open ? query : label}
          onFocus={openMenu}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) openMenu();
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, filtered.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === 'Enter' && open && filtered[active]) {
              e.preventDefault();
              pick(filtered[active]);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
        />
        {value && !open && (
          <button
            type="button"
            className="icon-action"
            style={{ position: 'absolute', right: 4, top: 3 }}
            title="Clear"
            onClick={() => onChange(null)}
          >
            <Icon name="x" size={14} />
          </button>
        )}
      </div>
      {open && (
        <div className="typeahead-menu">
          {!loaded && <div className="ta-empty">Loading...</div>}
          {loaded && filtered.length === 0 && <div className="ta-empty">No matches</div>}
          {filtered.map((opt, i) => (
            <div
              key={String(opt.id ?? opt.uuid ?? i)}
              className={`ta-opt${i === active ? ' active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(opt);
              }}
            >
              {optionLabel(opt) || String(opt.id)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
