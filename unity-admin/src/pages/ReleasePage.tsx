import { ReactNode } from 'react';
import { useProfile } from '../data/useProfile';
import { formatDate, scalarize } from '../utils/format';
import { Card, Badge, Spinner } from '../components/ui/primitives';
import { Icon } from '../components/ui/Icon';
import { GenericListPage } from './GenericListPage';

/*
 * About / Release Notes.
 *
 * The running platform version used to sit in a "Platform" card on the Account
 * page, which is not where anyone looks for it. It belongs here, next to the
 * release history: a horizontal summary strip for the CURRENT release, with the
 * full release table underneath (the existing generic list for the `release`
 * resource, unchanged).
 *
 * Both values come from GET /rest/user/profile/ (release_version, release_date),
 * which is already loaded and cached for the header, so this adds no request.
 */
function Fact({ icon, label, value }: { icon: string; label: string; value: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: '1 1 200px' }}>
      <span
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 38,
          height: 38,
          borderRadius: 'var(--radius-md)',
          background: 'var(--brand-tint)',
          color: 'var(--brand)',
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={18} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--fs-2xs)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)', marginTop: 2 }}>
          {value || <span className="u-faint">-</span>}
        </div>
      </div>
    </div>
  );
}

export function ReleasePage() {
  const { profile, loading } = useProfile();
  const version = scalarize(profile?.release_version);
  const released = formatDate(profile?.release_date);

  return (
    <div className="content-fade">
      <Card className="card-pad" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '0 0 auto' }}>
            <span
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, var(--green-400), var(--green-600))',
                color: '#fff',
                boxShadow: 'var(--shadow-brand)',
                flexShrink: 0,
              }}
            >
              <Icon name="sticky-note" size={24} />
            </span>
            <div>
              <div style={{ fontSize: 'var(--fs-2xs)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Current release
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: 'var(--fs-2xl)', fontWeight: 600, color: 'var(--text-strong)', lineHeight: 1.1 }}>
                  {loading ? <Spinner /> : version || 'Unknown'}
                </span>
                {!loading && version && <Badge tone="success" dot>Running</Badge>}
              </div>
            </div>
          </div>

          <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--divider)', flexShrink: 0 }} />

          <Fact icon="calendar" label="Release date" value={loading ? '' : released} />
          <Fact icon="building" label="Platform" value="Unity Admin" />
          <Fact icon="user" label="Signed in as" value={loading ? '' : scalarize(profile?.user_id)} />
        </div>
      </Card>

      {/* Existing release-notes table, untouched. */}
      <GenericListPage resourceKey="release" />
    </div>
  );
}
