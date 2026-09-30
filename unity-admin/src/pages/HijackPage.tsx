import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../data/apiClient';
import { ApiRecord } from '../data/types';
import { scalarize } from '../utils/format';
import { Card, CardHead, Button, Badge } from '../components/ui/primitives';
import { ConfirmDialog } from '../components/ui/Overlay';
import { Icon } from '../components/ui/Icon';

// Impersonate User (legacy /hijack): pick a user, then start a hijack session as them.
export function HijackPage() {
  const [users, setUsers] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ApiRecord | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [working, setWorking] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items } = await api.list<ApiRecord>('user', { impersonation: 'true', page_size: 1000 });
      setUsers(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load users for impersonation.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return users
      .filter((u) => `${scalarize(u.email)} ${scalarize(u.first_name)} ${scalarize(u.last_name)} ${scalarize(u.full_name)}`.toLowerCase().includes(q))
      .slice(0, 12);
  }, [users, query]);

  /*
   * Impersonation has to be a REAL form POST, not a fetch.
   *
   * django-hijack answers with a redirect into the impersonated portal and swaps
   * the session cookie; only a full-page navigation puts the browser inside that
   * new session. The previous implementation used api.rawPost, which (a) left the
   * admin sitting on this page still signed in as themselves, and (b) always
   * reported failure, because rawPost routes through request() which throws on a
   * 200 whose body is not JSON - and hijack answers with HTML.
   *
   * This mirrors templates/hijack.html: a POST to /hijack/<id>/ carrying
   * csrfmiddlewaretoken. Django accepts the token from the form body or the
   * X-CSRFToken header, and the local proxy injects the latter for writes, so
   * this works both in production and behind tools/proxy.
   */
  const impersonate = () => {
    if (!selected) return;
    setWorking(true);

    const csrf = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/hijack/${selected.id}/`;
    if (csrf) {
      const token = document.createElement('input');
      token.type = 'hidden';
      token.name = 'csrfmiddlewaretoken';
      token.value = decodeURIComponent(csrf[1]);
      form.appendChild(token);
    }
    document.body.appendChild(form);
    form.submit();
  };

  const label = selected ? scalarize(selected.full_name || selected.email) : '';

  return (
    <div className="content-fade">
      <Card>
        <CardHead title="Impersonate User" icon="eye-off" />
        <div style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 16 }}>
            Sign in to the customer portal as another user to reproduce an issue they are reporting. The session is
            recorded against your admin account.
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--danger-soft)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, maxWidth: 520 }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: '#a5322c' }}>{error}</span>
              <Button variant="default" size="sm" icon="refresh-cw" onClick={loadUsers}>
                Retry
              </Button>
            </div>
          )}

          <div className="field" style={{ maxWidth: 520 }}>
            <label>Search for a user</label>
            <div className="typeahead">
              <input
                type="text"
                placeholder={loading ? 'Loading users...' : 'Type a name or email...'}
                value={query}
                disabled={loading}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(null);
                }}
              />
              {matches.length > 0 && !selected && (
                <div className="typeahead-menu">
                  {matches.map((u) => (
                    <div
                      key={String(u.id)}
                      className="ta-opt"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelected(u);
                        setQuery(scalarize(u.email));
                      }}
                    >
                      {scalarize(u.full_name || `${scalarize(u.first_name)} ${scalarize(u.last_name)}`)}
                      <span className="u-faint"> - {scalarize(u.email)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selected && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginTop: 18,
                padding: '14px 16px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                maxWidth: 520,
              }}
            >
              <span style={{ color: 'var(--brand)', display: 'inline-flex' }}>
                <Icon name="user" size={20} />
              </span>
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-strong)' }}>{label}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{scalarize(selected.email)}</div>
              </div>
              {selected.org ? <Badge tone="neutral">{scalarize((selected.org as ApiRecord).name)}</Badge> : null}
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <Button variant="primary" icon="eye-off" disabled={!selected} onClick={() => setConfirming(true)}>
              Impersonate
            </Button>
          </div>
        </div>
      </Card>

      {confirming && selected && (
        <ConfirmDialog
          title="Start impersonation session?"
          message={
            <>
              You will be signed in to the customer portal as <strong>{label}</strong>. Everything you do will happen as
              that user.
            </>
          }
          confirmLabel="Impersonate"
          danger={false}
          loading={working}
          onConfirm={impersonate}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}
