/*
 * Load a legacy browser-global script or stylesheet on demand.
 *
 * A few capabilities in this panel are provided by libraries that predate modules and
 * are already vendored under the Django /static/ tree (xterm 2.x for the SSH console,
 * VMware's WebMKS SDK for the graphical one). They are UMD/global scripts, not ES
 * modules, so they cannot be `import`ed - and they should not be in the main bundle
 * anyway: xterm alone is 149KB for a screen most sessions never open.
 *
 * Each URL is fetched at most once per page load; concurrent callers share the same
 * promise. A failed load is NOT cached, so a retry can succeed after a blip.
 *
 * NOTE ON /static/: this is the shared uldb/static tree. unity-admin's own
 * static-server.js maps /static/<x> -> ../static/<x>, and Django serves the same tree
 * in production, so these resolve without the legacy AngularJS server running. The
 * caller still surfaces a clear message if a load fails.
 */
const pending = new Map<string, Promise<void>>();

function once(key: string, run: () => Promise<void>): Promise<void> {
  const existing = pending.get(key);
  if (existing) return existing;
  const p = run().catch((err) => {
    // Let a later attempt retry rather than pinning the failure forever.
    pending.delete(key);
    throw err;
  });
  pending.set(key, p);
  return p;
}

export function loadScript(src: string): Promise<void> {
  return once(`script:${src}`, () => {
    // Something else may already have injected it (or the page may ship it).
    if (document.querySelector(`script[data-ext="${src}"]`)) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src;
      el.async = false; // order matters: an addon must evaluate after its host library
      el.dataset.ext = src;
      el.onload = () => resolve();
      el.onerror = () => reject(new Error(`Could not load ${src}`));
      document.head.appendChild(el);
    });
  });
}

export function loadStylesheet(href: string): Promise<void> {
  return once(`css:${href}`, () => {
    if (document.querySelector(`link[data-ext="${href}"]`)) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const el = document.createElement('link');
      el.rel = 'stylesheet';
      el.href = href;
      el.dataset.ext = href;
      el.onload = () => resolve();
      el.onerror = () => reject(new Error(`Could not load ${href}`));
      document.head.appendChild(el);
    });
  });
}

/* Load in sequence. `loadScript` sets async=false, but ordering across SEPARATE
   injections still has to be awaited - fit.js reads window.Terminal at evaluation
   time and silently no-ops if xterm has not defined it yet. */
export async function loadScriptsInOrder(srcs: string[]): Promise<void> {
  for (const src of srcs) {
    await loadScript(src);
  }
}
