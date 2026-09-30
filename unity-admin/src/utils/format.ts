import { ApiRecord } from '../data/types';
import { FieldDef } from '../config/fieldTypes';

// Read the display value for a field from a row, resolving inline FK objects and
// arrays to something renderable.
export function rawValue(row: ApiRecord, field: FieldDef): unknown {
  return row[field.name];
}

export function isEmpty(v: unknown): boolean {
  return v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
}

export function fkText(v: unknown, subfield = 'name'): string {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const obj = v as Record<string, unknown>;
    const val = obj[subfield] ?? obj.name ?? obj.title ?? obj.id;
    return val == null ? '' : String(val);
  }
  return v == null ? '' : String(v);
}

export function formatDate(v: unknown): string {
  if (!v) return '';
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Best-effort scalar for search / sort. FK objects collapse to their name.
export function scalarize(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object') {
    if (Array.isArray(v)) return v.map(scalarize).join(' ');
    return fkText(v);
  }
  return String(v);
}

// Turn any value into a plain, human-friendly cell string (used by auto-derived columns).
export function autoCellText(v: unknown): string {
  if (v == null || v === '') return '';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'object') {
    if (Array.isArray(v)) return v.map((x) => fkText(x)).filter(Boolean).join(', ');
    return fkText(v);
  }
  return String(v);
}

// Derive display columns from a data record when a resource has no explicit config.
// Prefers common identifying keys, skips urls/heavy nested blobs, caps the count.
const SKIP_KEYS = new Set(['url', 'logo', 'password']);
const PRIORITY = ['name', 'title', 'id', 'model', 'model_number', 'email', 'status', 'type', 'version'];

export function deriveColumns(sample: ApiRecord | undefined): FieldDef[] {
  if (!sample) return [];
  const keys = Object.keys(sample).filter((k) => !SKIP_KEYS.has(k));

  const scored = keys.sort((a, b) => {
    const pa = PRIORITY.indexOf(a);
    const pb = PRIORITY.indexOf(b);
    if (pa !== -1 || pb !== -1) return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
    return 0;
  });

  const cols: FieldDef[] = [];
  for (const key of scored) {
    if (cols.length >= 8) break;
    const val = sample[key];
    if (val && typeof val === 'object' && !Array.isArray(val) && !('name' in (val as object)) && !('id' in (val as object))) {
      continue; // skip opaque nested blobs (stats objects etc.)
    }
    let cell: FieldDef['cell'] = 'text';
    if (typeof val === 'boolean') cell = 'boolean';
    else if (typeof val === 'number') cell = 'number';
    else if (Array.isArray(val)) cell = 'multiple';
    else if (val && typeof val === 'object') cell = 'fk';
    else if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) cell = 'datetime';
    else if (key === 'id' || key === 'uuid' || /_id$/.test(key) || /ip/.test(key)) cell = 'mono';

    cols.push({
      name: key,
      label: humanizeKey(key),
      cell,
      sortable: cell !== 'multiple',
      align: cell === 'number' ? 'right' : 'left',
    });
  }
  return cols;
}

function humanizeKey(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bId\b/g, 'ID')
    .replace(/\bIp\b/g, 'IP')
    .replace(/\bUuid\b/g, 'UUID')
    .replace(/\bUrl\b/g, 'URL')
    .trim();
}
