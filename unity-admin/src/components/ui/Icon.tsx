import { FALLBACK, ICONS } from './iconRegistry';

/*
 * Icons resolve through an EXPLICIT registry (./iconRegistry.ts), not the lucide
 * namespace.
 *
 * This file used to do `import * as Lucide from 'lucide-react'` and then look the
 * component up with a computed key. That combination is unshakeable by construction:
 * the bundler cannot prove which icons are reachable, so all 1216 shipped - roughly
 * 41% of the JS bundle to render the ~135 names this app can actually produce.
 *
 * Resolution is UNCHANGED (ALIASES then toPascal, so the key is always PascalCase);
 * only the lookup source moved. The registry is keyed by that same PascalCase name -
 * keying it by the kebab source name would make every lookup miss and silently render
 * the fallback dot on every icon in the app.
 */
type IconProps = {
  name?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
};

// Map our kebab menu/resource icon names to lucide PascalCase component names,
// steering a few uncertain ones to icons known to exist in older lucide releases.
const ALIASES: Record<string, string> = {
  'ethernet-port': 'Network',
  'server-cog': 'Server',
  'circuit-board': 'Cpu',
  'cloud-cog': 'Cloud',
  'square-stack': 'Layers',
  radar: 'Radio',
  'plug-zap': 'PlugZap',
  'layout-dashboard': 'LayoutDashboard',
  'scroll-text': 'ScrollText',
  'building-2': 'Building2',
  'arrow-left-right': 'ArrowLeftRight',
  'settings-2': 'Settings2',
  'file-code': 'FileCode',
  'life-buoy': 'LifeBuoy',
  'git-pull-request': 'GitPullRequest',
  'alert-triangle': 'AlertTriangle',
  'help-circle': 'HelpCircle',
  'message-square': 'MessageSquare',
  'credit-card': 'CreditCard',
  'file-text': 'FileText',
  'memory-stick': 'MemoryStick',
  'bar-chart-3': 'BarChart3',
  'line-chart': 'LineChart',
  'list-checks': 'ListChecks',
  'sticky-note': 'StickyNote',
  'eye-off': 'EyeOff',
};

function toPascal(name: string): string {
  return name
    .replace(/^fa-?/, '')
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

/* A missing name used to be invisible - it just rendered a dot. Now it says so once,
   in dev only, so a typo or a newly added icon surfaces instead of quietly greying
   out. Production keeps the silent fallback. */
const warned = new Set<string>();
function warnMissing(name: string, resolved: string): void {
  if (import.meta.env.PROD || warned.has(name)) return;
  warned.add(name);
  // eslint-disable-next-line no-console
  console.warn(
    `[Icon] "${name}" -> "${resolved}" is not in the icon registry, so it renders the ` +
      `fallback. Add it to src/components/ui/iconRegistry.ts (or re-run gen_icon_registry.py).`
  );
}

export function Icon({ name, size = 18, strokeWidth = 1.9, className, color }: IconProps) {
  const resolvedName = name ? ALIASES[name] || toPascal(name) : '';
  const Cmp = (resolvedName && ICONS[resolvedName]) || FALLBACK;
  if (name && resolvedName && !ICONS[resolvedName]) warnMissing(name, resolvedName);
  return <Cmp size={size} strokeWidth={strokeWidth} className={className} color={color} aria-hidden="true" />;
}

export default Icon;
