import { Icon } from './Icon';

interface PaginationProps {
  page: number;          // 1-based
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
}

// Build a compact page-number window with ellipses.
function pageWindow(current: number, last: number): (number | '...')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const out: (number | '...')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(last - 1, current + 1);
  if (start > 2) out.push('...');
  for (let p = start; p <= end; p++) out.push(p);
  if (end < last - 1) out.push('...');
  out.push(last);
  return out;
}

export function Pagination({ page, pageSize, total, onPage, onPageSize }: PaginationProps) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const win = pageWindow(page, last);

  return (
    <div className="pagination">
      <div className="pg-info">
        Showing <strong>{from}</strong>-<strong>{to}</strong> of <strong>{total}</strong>
      </div>
      <div className="pg-controls">
        <select
          className="pg-size"
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
          aria-label="Rows per page"
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
        <button className="pg-btn" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <Icon name="chevron-left" size={16} />
        </button>
        {win.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="pg-btn" style={{ cursor: 'default' }}>
              ...
            </span>
          ) : (
            <button key={p} className={`pg-btn${p === page ? ' active' : ''}`} onClick={() => onPage(p)}>
              {p}
            </button>
          )
        )}
        <button className="pg-btn" disabled={page >= last} onClick={() => onPage(page + 1)} aria-label="Next page">
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </div>
  );
}
