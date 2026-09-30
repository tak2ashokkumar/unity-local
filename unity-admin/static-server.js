/*
 * unity-admin static server (zero-dependency).
 *
 * Serves the built React admin panel (dist/) under the /admin base path and
 * transparently proxies the shared Python static assets from ../uldb/static (the same
 * uldb/static tree the legacy AngularJS panel uses). This mirrors ngx-unity's
 * static-server.js pattern but needs no npm packages so it runs on portable Node 14.
 *
 *   /rest/<x> (+ API paths) -> mock API on :3001   (so hitting :8096 directly works)
 *   /static/<x>       -> ../uldb/static/<x>     (shared images, fonts, css, favicon)
 *   /admin            -> dist/index.html        (SPA shell)
 *   /admin/assets/<x> -> dist/assets/<x>        (built JS/CSS chunks, base '/admin/')
 *   /admin/<route>    -> dist/index.html        (SPA fallback; app uses HashRouter)
 *
 * API paths are proxied BEFORE the SPA fallback. Without that, a request for
 * /rest/... fell through to the catch-all and returned index.html with status 200 -
 * the app then parsed HTML as data and silently rendered empty lists everywhere.
 * An API path is never allowed to fall back to HTML; if the mock is unreachable the
 * proxy returns a JSON 502 so the failure is visible instead of looking like "no data".
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

// Tiny zero-dependency `--key=value` / `--key value` parser so this server needs
// no npm packages (keeps it runnable under the portable Node 14 runtime).
function parseArgs(args) {
  const out = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith('--')) continue;
    const eq = arg.indexOf('=');
    if (eq !== -1) {
      out[arg.slice(2, eq)] = arg.slice(eq + 1);
    } else {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        out[key] = next;
        i += 1;
      } else {
        out[key] = true;
      }
    }
  }
  return out;
}

const argv = parseArgs(process.argv.slice(2));
const port = Number(argv.port) || 8096;
const host = argv.host || '0.0.0.0';
const distArg = argv.dist || 'dist';
const staticArg = argv.static || process.env.ADMIN_STATIC || '../uldb/static';

// Backend that serves the admin data endpoints. This server always talks to the
// LOCAL MOCK. Choosing between mock and live production is done in one place only -
// tools/proxy/server.js (USE_PROD_API) - so browse via http://localhost:8091/admin
// when you want production data.
const apiTarget = argv.api || process.env.ADMIN_API || 'http://localhost:8091';
const apiUrl = require('url').parse(apiTarget);

// Every path prefix that belongs to the API rather than to the static bundle.
// Mirrors the dev-server proxy table in vite.config.ts and the unity proxy rules.
const API_PREFIXES = [
  '/rest', '/customer', '/orchestration', '/task', '/mcp',
  '/func', '/tools', '/hijack', '/apm', '/chatbot', '/ssr',
  // Django two-factor wizard (account/two_factor) - see tools/proxy/server.js.
  '/account'
];

function isApiPath(urlPath) {
  return API_PREFIXES.some(p => urlPath === p || urlPath.startsWith(p + '/'));
}

function proxyApi(req, res) {
  const options = {
    hostname: apiUrl.hostname,
    port: apiUrl.port || 80,
    path: req.url,
    method: req.method,
    headers: Object.assign({}, req.headers, { host: apiUrl.host })
  };
  const upstream = http.request(options, (up) => {
    res.writeHead(up.statusCode, up.headers);
    up.pipe(res);
  });
  upstream.on('error', (err) => {
    // Never fall through to the SPA shell - answer with JSON so the UI shows an error.
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      detail: 'Admin API unreachable at ' + apiTarget + ' (' + err.code + '). Start the mock API on :3001.'
    }));
  });
  req.pipe(upstream);
}

const distRoot = path.resolve(__dirname, distArg);
const staticRoot = path.resolve(__dirname, staticArg);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=utf-8',
};

function contentType(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function safeJoin(root, urlPath) {
  // Prevent path traversal: resolve then ensure it stays under root.
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const resolved = path.normalize(path.join(root, decoded));
  // Guard with a trailing separator so a sibling dir whose name merely starts
  // with root (e.g. dist-x) can't slip past the traversal check.
  if (resolved !== root && !resolved.startsWith(root + path.sep)) return null;
  return resolved;
}

// Cache policy: asset filenames are content-hashed by Vite so they can be cached
// forever, but index.html must always be revalidated - otherwise the browser keeps
// serving a stale shell that points at a bundle from a previous build, and a rebuild
// appears to have "done nothing".
function cacheHeaderFor(filePath) {
  if (/[\\/]assets[\\/]/.test(filePath) && /\.[a-f0-9]{8}\./.test(filePath)) {
    return 'public, max-age=31536000, immutable';
  }
  return 'no-cache, must-revalidate';
}

function sendFile(res, filePath, status) {
  const stream = fs.createReadStream(filePath);
  stream.on('open', () => {
    res.writeHead(status || 200, {
      'Content-Type': contentType(filePath),
      'Cache-Control': cacheHeaderFor(filePath),
    });
    stream.pipe(res);
  });
  stream.on('error', () => {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });
}

function sendIndex(res) {
  const indexPath = path.join(distRoot, 'index.html');
  if (fs.existsSync(indexPath)) return sendFile(res, indexPath, 200);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('dist/index.html not found - run `npm run build` first.');
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  // 0a) Let the app discover which backend it is bound to, so it can warn the
  //     operator when the screen is showing real production records.
  if (urlPath === '/__admin_env') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify({ apiTarget: apiTarget, live: false, authenticated: true, note: 'local mock' }));
  }

  // 0b) API traffic goes to the backend, never to the SPA fallback.
  if (isApiPath(urlPath)) return proxyApi(req, res);

  // 1) Shared Python static assets (images/fonts/favicon/legacy css).
  if (urlPath.startsWith('/static/') || urlPath === '/static') {
    const rel = urlPath.replace(/^\/static/, '') || '/';
    const filePath = safeJoin(staticRoot, rel);
    if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return sendFile(res, filePath);
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Static asset not found');
  }

  // 2) The React app is mounted at /admin. Strip that prefix to hit dist/.
  let appPath = urlPath;
  if (appPath === '/admin') appPath = '/';
  else if (appPath.startsWith('/admin/')) appPath = appPath.slice('/admin'.length);

  if (appPath === '/' || appPath === '') return sendIndex(res);

  const filePath = safeJoin(distRoot, appPath);
  if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return sendFile(res, filePath);
  }

  // 3) SPA fallback - unknown paths render the shell (routing is client-side).
  return sendIndex(res);
});

server.listen(port, host, () => {
  console.log(`unity-admin static server running at http://localhost:${port}/admin`);
  console.log(`  dist   -> ${distRoot}`);
  console.log(`  static -> ${staticRoot}`);
  console.log(`  api    -> ${apiTarget}  (/rest, /customer, /func, /tools, /hijack, ...)`);
});
