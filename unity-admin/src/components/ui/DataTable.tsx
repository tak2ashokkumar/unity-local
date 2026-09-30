import React from 'react';
import { Link } from 'react-router-dom';
import { ApiRecord } from '../../data/types';
import { FieldDef, RowAction } from '../../config/fieldTypes';
import { autoCellText, fkText, formatDate, isEmpty, scalarize } from '../../utils/format';
import { Badge, BadgeTone, IconAction } from './primitives';
import { Icon } from './Icon';

export interface SortState {
  key: string;
  dir: 'asc' | 'desc';
}

interface DataTableProps {
  columns: FieldDef[];
  rows: ApiRecord[];
  idField: string;
  sort?: SortState;
  onSort?: (key: string) => void;
  onEdit?: (row: ApiRecord) => void;
  onDelete?: (row: ApiRecord) => void;
  // Extra per-row actions declared by the resource, rendered before Edit/Delete.
  rowActions?: RowAction[];
  onRowAction?: (action: RowAction, row: ApiRecord) => void;
  showActions?: boolean;
  // Route prefix used by 'link' cells that declare no uriPrefix of their own,
  // e.g. "/organization/" so a name cell navigates to that record's detail page.
  detailPrefix?: string;
}

function toneFor(field: FieldDef, value: unknown): BadgeTone {
  return (field.badgeMap?.[String(value)] as BadgeTone) || 'neutral';
}

// Cells truncate with an ellipsis (see .data-table tbody td in ui.css), so the
// full value goes in a native tooltip. Only for cells that render as text -
// badges, booleans and chips are already short and self-describing.
const TOOLTIP_CELLS = new Set(['text', 'mono', 'link', 'fk', 'choice', 'datetime', 'number']);

function cellTooltip(field: FieldDef, row: ApiRecord): string | undefined {
  const cell = field.cell || 'text';
  if (!TOOLTIP_CELLS.has(cell)) return undefined;
  const value = row[field.name];
  if (isEmpty(value)) return undefined;
  if (cell === 'datetime') return formatDate(value) || undefined;
  if (cell === 'fk' || cell === 'link') return fkText(value, field.subfield) || undefined;
  const t = field.format ? field.format(value, row) : scalarize(value);
  return t || undefined;
}

function renderCell(field: FieldDef, row: ApiRecord, detailPrefix?: string): React.ReactNode {
  const value = row[field.name];
  const cell = field.cell || 'text';

  if (cell === 'boolean') {
    const truthy = value === true || value === 'true';
    return truthy ? (
      <span className="bool-yes">
        <Icon name="check-circle-2" size={17} />
      </span>
    ) : (
      <span className="bool-no">
        <Icon name="minus" size={16} />
      </span>
    );
  }

  /* A `format` function owns the whole cell, so it runs BEFORE the empty guard and
     before the cell-type switch. Columns that derive their text from elsewhere in the
     row - the Zabbix template item_key metrics live inside a nested object and have no
     top-level value at all - were otherwise short-circuited to "-" and could never
     render. All format functions are written null-safe for exactly this reason. */
  if (field.format) {
    const text = field.format(value, row);
    if (isEmpty(text)) return <span className="na">-</span>;
    return cell === 'mono' ? <span className="mono">{text}</span> : text;
  }

  if (isEmpty(value) && cell !== 'multiple') {
    return <span className="na">-</span>;
  }

  switch (cell) {
    case 'link': {
      const id = row[field.idField || 'id'];
      const text = fkText(value, field.subfield) || String(value);
      const prefix = field.uriPrefix || detailPrefix;
      if (prefix && id != null) {
        /* An id used as a path segment must be encoded - IPv4 prefixes contain a
           slash ("10.0.0.0/24") and would otherwise split into two segments and
           never match the route. */
        const seg = String(id);
        return (
          <Link className="cell-link" to={`${prefix}${seg.includes('/') ? encodeURIComponent(seg) : seg}`}>
            {text}
          </Link>
        );
      }
      return text;
    }
    case 'fk':
      return fkText(value, field.subfield) || <span className="na">-</span>;
    case 'badge':
      return (
        <Badge tone={toneFor(field, value)} dot>
          {String(value)}
        </Badge>
      );
    case 'multiple': {
      const arr = Array.isArray(value) ? value : [];
      if (!arr.length) return <span className="na">-</span>;
      const shown = arr.slice(0, 3);
      return (
        <span>
          {shown.map((item, i) => (
            <span className="chip" key={i}>
              {fkText(item, field.subfield)}
            </span>
          ))}
          {arr.length > 3 && <span className="chip">+{arr.length - 3}</span>}
        </span>
      );
    }
    case 'datetime':
      return formatDate(value);
    case 'mono':
      return <span className="mono">{String(value)}</span>;
    default:
      // `format` is fully handled by the early return above, so it is always
      // undefined here - checking it again would be dead code.
      return autoCellText(value);
  }
}

export function DataTable({
  columns,
  rows,
  idField,
  sort,
  onSort,
  onEdit,
  onDelete,
  rowActions,
  onRowAction,
  showActions = true,
  detailPrefix,
}: DataTableProps) {
  const visible = columns.filter((c) => !c.hideInList);
  const extraActions = onRowAction ? rowActions || [] : [];
  const hasActions = showActions && (onEdit || onDelete || extraActions.length > 0);

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {visible.map((col) => {
              const sortable = col.sortable !== false && onSort && col.cell !== 'multiple';
              const sorted = sort?.key === col.name;
              const alignCls = col.align === 'right' || col.cell === 'number' ? 'col-num' : col.align === 'center' ? 'col-center' : '';
              return (
                <th
                  key={col.name}
                  className={[alignCls, sortable ? 'sortable' : '', sorted ? 'sorted' : ''].filter(Boolean).join(' ')}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={sortable ? () => onSort!(col.name) : undefined}
                >
                  <span className="th-inner">
                    {col.label}
                    {sortable && (
                      <span className="sort-ic">
                        <Icon name={sorted ? (sort!.dir === 'asc' ? 'arrow-up' : 'arrow-down') : 'chevrons-up-down'} size={13} strokeWidth={2.2} />
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
            {hasActions && <th className="col-actions">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={String(row[idField] ?? row.id ?? row.uuid ?? idx)}>
              {visible.map((col) => {
                const alignCls = col.align === 'right' || col.cell === 'number' ? 'col-num' : col.align === 'center' ? 'col-center' : '';
                const monoCls = col.cell === 'mono' ? 'cell-mono' : '';
                return (
                  <td
                    key={col.name}
                    className={[alignCls, monoCls].filter(Boolean).join(' ')}
                    title={cellTooltip(col, row)}
                  >
                    {renderCell(col, row, detailPrefix)}
                  </td>
                );
              })}
              {hasActions && (
                <td className="col-actions">
                  <span className="row-actions">
                    {extraActions
                      // An action can require a row flag - Split only applies to a
                      // block the API reports as splittable.
                      .filter((a) => !a.enabledField || Boolean(row[a.enabledField]))
                      .map((a) => (
                        <IconAction
                          key={a.kind + (a.uri || a.label)}
                          icon={a.icon}
                          title={a.label}
                          onClick={() => onRowAction!(a, row)}
                        />
                      ))}
                    {onEdit && <IconAction icon="pencil" title="Edit" onClick={() => onEdit(row)} />}
                    {onDelete && <IconAction icon="trash-2" title="Delete" danger onClick={() => onDelete(row)} />}
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
