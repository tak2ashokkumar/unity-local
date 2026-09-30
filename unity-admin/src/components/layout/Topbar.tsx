import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { findTrail } from '../../config/menu';
import { humanize } from '../../config/resources';
import { Icon } from '../ui/Icon';
import { useProfile, profileName, profileEmail, profileOrg, initialsOf } from '../../data/useProfile';

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();
  const displayName = profileName(profile);
  const displayEmail = profileEmail(profile);
  const displayOrg = profileOrg(profile);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  /*
   * Ends the Django session, mirroring the legacy user menu
   * (controllers/generic.js:2951): POST logout/ then send the browser to '/'.
   * A full navigation is the point - the session cookie is what authenticates
   * this panel, so a background fetch would leave the user looking at a signed-in
   * shell whose every request now 401s. Navigating even when the POST fails is
   * deliberate: the server may have cleared the session anyway.
   */
  const logout = () => {
    fetch('/logout/', { method: 'POST', credentials: 'include' })
      .catch(() => undefined)
      .then(() => {
        window.location.href = '/';
      });
  };

  const trail = findTrail(location.pathname);
  let section = trail?.section;
  let title = trail?.labels[trail.labels.length - 1];
  if (!title) {
    // Detail / unmapped route: derive from the path segments.
    const segs = location.pathname.split('/').filter(Boolean);
    title = segs.length ? humanize(segs[0]) : 'Dashboard';
    if (segs.length > 1) section = humanize(segs[0]);
  }

  return (
    <header className="app-topbar">
      <button className="topbar-hamburger" onClick={onToggleSidebar} aria-label="Toggle navigation">
        <Icon name="menu" size={20} />
      </button>

      <div className="topbar-title">
        <div className="tt-crumb">
          <span>{section || 'Unity'}</span>
          {title && (
            <>
              <span className="sep">
                <Icon name="chevron-right" size={12} />
              </span>
              <span>{title}</span>
            </>
          )}
        </div>
        <h2>{title || 'Dashboard'}</h2>
      </div>

      <div className="topbar-spacer" />

      <div className="topbar-actions">
        <button className="topbar-icon-btn" title="Notifications" aria-label="Notifications">
          <Icon name="bell" size={19} />
          <span className="dot-badge" />
        </button>

        <div ref={userRef} style={{ position: 'relative' }}>
          <button className="topbar-user" onClick={() => setMenuOpen((o) => !o)}>
            <span className="avatar">{initialsOf(displayName)}</span>
            <span className="u-meta">
              <span className="u-name">{displayName}</span>
              <span className="u-role">{displayOrg}</span>
            </span>
            <Icon name="chevron-down" size={15} />
          </button>
          {menuOpen && (
            <div className="user-menu">
              <div className="um-head">
                <div className="umh-name">{displayName}</div>
                <div className="umh-mail">{displayEmail}</div>
              </div>
              <button className="um-item" onClick={() => navigate('/account')}>
                <Icon name="user" size={16} /> Account
              </button>
              <button className="um-item" onClick={() => navigate('/release')}>
                <Icon name="info" size={16} /> About
              </button>
              <button className="um-item danger" onClick={logout}>
                <Icon name="log-out" size={16} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
