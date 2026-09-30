import { useLocation } from 'react-router-dom';
import { findTrail } from '../config/menu';
import { humanize } from '../config/resources';
import { Card } from '../components/ui/primitives';
import { Icon } from '../components/ui/Icon';

// A polished "module in progress" surface for routes that are specialized tools
// or dashboards not yet ported to React (kept intentional, never broken-looking).
export function PlaceholderPage({ title, note }: { title?: string; note?: string }) {
  const location = useLocation();
  const trail = findTrail(location.pathname);
  const heading = title || trail?.labels[trail.labels.length - 1] || humanize(location.pathname.split('/').filter(Boolean).slice(-1)[0] || 'Module');

  return (
    <div className="content-fade">
      <Card className="card-pad" style={{ display: 'grid', placeItems: 'center', padding: '72px 24px', textAlign: 'center' }}>
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 76,
            height: 76,
            borderRadius: 'var(--radius-xl)',
            background: 'var(--brand-tint)',
            color: 'var(--brand)',
            marginBottom: 20,
          }}
        >
          <Icon name={trail?.leaf?.icon || 'layout-grid'} size={34} strokeWidth={1.7} />
        </div>
        <h2 style={{ fontSize: 'var(--fs-xl)', marginBottom: 10 }}>{heading}</h2>
        <p style={{ maxWidth: 460, color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', lineHeight: 1.6 }}>
          {note ||
            `This is a specialized ${heading} workspace. Its interactive tooling is being migrated to the modern React admin. The data-driven management views across the platform are already fully available in this UI.`}
        </p>
        <div style={{ marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--fs-xs)', color: 'var(--text-faint)' }}>
          <Icon name="git-branch" size={14} />
          Migration in progress
        </div>
      </Card>
    </div>
  );
}
