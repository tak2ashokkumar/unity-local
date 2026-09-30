import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MENU, NavItem, NavSection, findTrail } from '../../config/menu';
import { Icon } from '../ui/Icon';

// Group keys (label paths) that are ancestors of the active route, so the active
// sub-branch inside an open module auto-expands.
function ancestorGroupKeys(sections: NavSection[], path: string): string[] {
  const keys: string[] = [];
  for (const section of sections) {
    const walk = (items: NavItem[], parentKey: string, chain: string[]): boolean => {
      for (const it of items) {
        const key = parentKey ? `${parentKey}>${it.label}` : it.label;
        if (it.to === path) {
          chain.forEach((k) => keys.push(k));
          return true;
        }
        if (it.children && walk(it.children, key, [...chain, key])) return true;
      }
      return false;
    };
    if (walk(section.children, '', [])) break;
  }
  return keys;
}

// The main module (top-level section) that contains the active route.
function activeSectionLabel(path: string): string | null {
  const trail = findTrail(path);
  return trail ? trail.section : null;
}

function NavNode({
  item,
  parentKey,
  open,
  toggle,
}: {
  item: NavItem;
  parentKey: string;
  open: Set<string>;
  toggle: (key: string) => void;
}) {
  const key = parentKey ? `${parentKey}>${item.label}` : item.label;

  if (item.children && item.children.length) {
    const isOpen = open.has(key);
    return (
      <div className="nav-item">
        <button className={`nav-group-toggle${isOpen ? ' open' : ''}`} onClick={() => toggle(key)} type="button">
          {item.icon && (
            <span className="nl-icon">
              <Icon name={item.icon} size={16} />
            </span>
          )}
          <span className="nl-text">{item.label}</span>
          <span className="nl-caret">
            <Icon name="chevron-right" size={14} />
          </span>
        </button>
        {isOpen && (
          <div className="nav-children">
            {item.children.map((child) => (
              <NavNode key={child.label + (child.to || '')} item={child} parentKey={key} open={open} toggle={toggle} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="nav-item">
      <NavLink to={item.to || '#'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}${item.disabled ? ' nav-disabled' : ''}`} end>
        {item.icon && (
          <span className="nl-icon">
            <Icon name={item.icon} size={16} />
          </span>
        )}
        <span className="nl-text">{item.label}</span>
      </NavLink>
    </div>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  // Accordion: exactly one main module open at a time.
  const [openModule, setOpenModule] = useState<string | null>(() => activeSectionLabel(location.pathname) || MENU[0].label);
  // Independent expand state for nested sub-groups inside the open module.
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(ancestorGroupKeys(MENU, location.pathname)));

  // On navigation, open the module that owns the active route (and keep the active
  // sub-branch expanded). Detail routes (no menu leaf) leave the current module as-is.
  useEffect(() => {
    const sec = activeSectionLabel(location.pathname);
    if (sec) setOpenModule(sec);
    setOpenGroups((prev) => {
      const next = new Set(prev);
      ancestorGroupKeys(MENU, location.pathname).forEach((k) => next.add(k));
      return next;
    });
    onNavigate?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleModule = (label: string) => setOpenModule((cur) => (cur === label ? null : label));

  const toggleGroup = (key: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <img
          src="/static/img/logo2.png"
          alt="Unity"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
            const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
            if (fb) fb.style.display = 'flex';
          }}
        />
        <div className="brand-fallback" style={{ display: 'none' }}>
          <span className="brand-mark">
            <Icon name="hexagon" size={20} />
          </span>
          <span className="brand-text">
            <div className="bt-main">United Layer</div>
            <div className="bt-sub">Admin</div>
          </span>
        </div>
      </div>

      <nav className="sidebar-scroll">
        {MENU.map((section) => {
          const isOpen = openModule === section.label;
          return (
            <div className={`nav-module${isOpen ? ' open' : ''}`} key={section.label}>
              <button className="nav-module-header" onClick={() => toggleModule(section.label)} type="button">
                <span className="nm-icon">
                  <Icon name={section.icon} size={18} strokeWidth={2.1} />
                </span>
                <span className="nm-text">{section.label}</span>
                <span className="nm-caret">
                  <Icon name="chevron-down" size={16} />
                </span>
              </button>
              {isOpen && (
                <div className="nav-module-body">
                  {section.children.map((child) => (
                    <NavNode key={child.label + (child.to || '')} item={child} parentKey="" open={openGroups} toggle={toggleGroup} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
