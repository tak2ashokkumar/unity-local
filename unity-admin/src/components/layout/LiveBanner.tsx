import { useBackendEnv } from '../../data/useBackendEnv';
import { Icon } from '../ui/Icon';

// Full-width warning shown whenever the panel is bound to a real deployment
// instead of the local mock. Deliberately loud: in live mode the Delete and Save
// actions in this UI change production records.
export function LiveBanner() {
  const env = useBackendEnv();
  if (!env || !env.live) return null;

  const host = env.apiTarget.replace(/^https?:\/\//, '');
  return (
    <div className="live-banner" role="alert">
      <span className="lb-ic">
        <Icon name="alert-triangle" size={16} strokeWidth={2.3} />
      </span>
      <span className="lb-text">
        <strong>LIVE PRODUCTION DATA</strong>
        <span className="lb-sep">&middot;</span>
        connected to <span className="mono">{host}</span>
        <span className="lb-sep">&middot;</span>
        edits and deletes on this screen change real records
      </span>
      {!env.authenticated && <span className="lb-pill">no session cookie set</span>}
    </div>
  );
}
