const express = require("express");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

/* =====================================================================
 *  DATA SOURCE  -  which backend every app talks to
 * ---------------------------------------------------------------------
 *  Pick an environment with API_ENV (default "mock"):
 *
 *      API_ENV=mock    local mock API on :3001      (tools/mock-api JSON files)
 *      API_ENV=sf      https://unity.unitedlayer.com      (was "prod"; still accepted)
 *      API_ENV=ams     http://unity-ams.unitedlayer.com
 *      API_ENV=play    https://play.unityone.ai
 *      API_ENV=alpha   https://alpha.unityone.ai
 *
 *  Use the dev.sh aliases rather than setting this by hand - see dev.sh, where the
 *  commands are grouped by environment.
 *
 *  The choice covers ALL THREE front ends, because they all get their data through
 *  this one file:
 *      admin panel (legacy + ngx-admin) : http://localhost:8091/admin
 *      ngx-unity                        : http://localhost:8091
 *      ngx-mtp                          : http://localhost:8061
 *
 *  Auth on any live environment: the API accepts ONLY Django SessionAuthentication -
 *  there is no API token. Put that environment's browser session in
 *      tools/proxy/.cookie-<env>       e.g. .cookie-sf, .cookie-play
 *  (.cookie-prod / .prod-cookie are still honoured for sf). Every environment is a
 *  separate login, so each needs its own file. Gitignored and re-read per request, so
 *  refreshing an expired session needs no restart.
 *  Copy from DevTools > Application > Cookies: "sessionid=...; csrftoken=..."
 *
 *  In any live environment the apps READ AND WRITE the real system.
 * ===================================================================== */
const API_ENVIRONMENTS = {
  mock:  { label: "Local Mock", url: "http://localhost:3001",            live: false },
  sf:    { label: "SF",         url: "https://unity.unitedlayer.com",    live: true  },
  ams:   { label: "AMS",        url: "http://unity-ams.unitedlayer.com", live: true  },
  play:  { label: "Play",       url: "https://play.unityone.ai",         live: true  },
  alpha: { label: "Alpha",      url: "https://alpha.unityone.ai",        live: true  },
};

// Older name for the SF environment, still accepted so nothing breaks.
const ENV_ALIASES = { prod: "sf" };

/* ---------------------------------------------------------------------
 *  WHICH ENVIRONMENT IS ACTIVE?
 *  There is no stored "current environment" - it is chosen per run by the
 *  dev.sh alias you start (each one sets API_ENV). So:
 *      mock-unity  -> mock        sf-admin   -> sf
 *      play-mtp    -> play        alpha-unity-> alpha
 *  DEFAULT_API_ENV below is only used when nothing sets API_ENV, i.e. a bare
 *  `node server.js`. Change it if you want a different bare-run default.
 *  To see what a RUNNING proxy is on:  GET http://localhost:8091/__admin_env
 * --------------------------------------------------------------------- */
const DEFAULT_API_ENV = "mock";

function resolveEnv() {
  let name = (process.env.API_ENV || "").toLowerCase().trim();
  // Back-compat: USE_PROD_API=true is a shortcut for the SF environment.
  if (!name) {
    name = String(process.env.USE_PROD_API || "false").toLowerCase() === "true" ? "sf" : DEFAULT_API_ENV;
  }
  if (ENV_ALIASES[name]) name = ENV_ALIASES[name];
  if (!API_ENVIRONMENTS[name]) {
    console.error(`
  Unknown API_ENV "${name}". Valid: ${Object.keys(API_ENVIRONMENTS).join(", ")}. Falling back to mock.
`);
    name = "mock";
  }
  return name;
}

const API_ENV = resolveEnv();
const ACTIVE_ENV = API_ENVIRONMENTS[API_ENV];
const API_TARGET = process.env.API_URL || ACTIVE_ENV.url;   // API_URL overrides for a one-off host
const IS_LIVE = ACTIVE_ENV.live;
const MOCK_API_URL = API_ENVIRONMENTS.mock.url;

/* API path prefixes that follow the environment above. */
const API_PREFIXES = [
  "/customer", "/rest", "/orchestration", "/chatbot", "/task",
  "/apm", "/func", "/mcp", "/ssr", "/tools", "/hijack",
  // Django's two-factor pages (account/two_factor). Both front ends reach the
  // 2FA wizard by loading this path from their own origin, so it has to be
  // proxied like any other backend path rather than falling through to an app.
  "/account",
  // The Salesforce bridge is mounted OUTSIDE /rest: the Import Opportunities page
  // reads GET /salesforce/opportunities/ and marks one imported with
  // PUT /salesforce/link_opportunity/ (controllers/billing.js:135). Without this
  // prefix those two calls fell through to the Angular app and returned HTML.
  "/salesforce",
  // The VM web console's SSH stream. It is a WebSocket, so it also needs the
  // upgrade handler wired below the listen() call - a prefix alone is not enough.
  "/webterminal"
];

const isApiPath = (url) =>
  API_PREFIXES.some((p) => url === p || url.startsWith(p + "/") || url.startsWith(p + "?"));

/* ---- Session for the active live environment (never logged, never committed) ----
 * Each environment is a separate login, so each has its own cookie file. */
const COOKIE_FILES = [
  path.resolve(__dirname, ".cookie-" + API_ENV),
  // Names used before the SF rename, still honoured.
  ...(API_ENV === "sf" ? [path.resolve(__dirname, ".cookie-prod"), path.resolve(__dirname, ".prod-cookie")] : []),
];
let cookieCache = { key: "", mtime: 0, value: "" };

// A cookie file may contain "#" comment lines, blank lines, and the cookie split over
// several lines - so the file can carry its own instructions without those notes
// ending up in the Cookie header.
function parseCookieFile(text) {
  const value = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .join("; ")
    .replace(/;\s*;/g, ";")
    .replace(/^;\s*|;\s*$/g, "")
    .trim();
  // A file still holding the PASTE_... placeholders is not a real session; treat it as
  // unconfigured so /__admin_env reports the truth instead of a misleading "authenticated".
  return /PASTE_[A-Z_]*_HERE/.test(value) ? "" : value;
}

function prodCookie() {
  if (process.env.ADMIN_COOKIE) return process.env.ADMIN_COOKIE.trim();
  for (const file of COOKIE_FILES) {
    try {
      const st = fs.statSync(file);
      if (cookieCache.key !== file || cookieCache.mtime !== st.mtimeMs) {
        cookieCache = { key: file, mtime: st.mtimeMs, value: parseCookieFile(fs.readFileSync(file, "utf8")) };
      }
      return cookieCache.value;
    } catch (e) { /* try next candidate */ }
  }
  return "";
}

/* ---- Helpers for the live proxy's response handling (see prodProxy below) ---- */

/* Sends our own JSON answer. Never reuse the upstream headers here - the body is
 * different, so its content-length and content-encoding no longer apply. */
function sendJson(req, res, status, payload) {
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": body.length,
    "Cache-Control": "no-store"
  });
  // A HEAD reply carries the headers only.
  if ((req.method || "GET").toUpperCase() === "HEAD") return res.end();
  res.end(body);
}

/* Reads a whole response into text. Only used for small HTML error pages, so the
 * buffering is bounded in practice. nginx may compress them, hence the decode. */
function readBody(stream, headers, cb) {
  const chunks = [];
  stream.on("data", (chunk) => chunks.push(chunk));
  stream.on("error", () => cb(""));
  stream.on("end", () => {
    let buf = Buffer.concat(chunks);
    const encoding = String(headers["content-encoding"] || "").toLowerCase();
    try {
      if (encoding === "gzip") buf = zlib.gunzipSync(buf);
      else if (encoding === "deflate") buf = zlib.inflateSync(buf);
      else if (encoding === "br" && zlib.brotliDecompressSync) buf = zlib.brotliDecompressSync(buf);
    } catch (e) { /* not decodable - fall back to the raw bytes */ }
    cb(buf.toString("utf8"));
  });
}

/* How much of an HTML error page to quote back in the JSON envelope. */
const MAX_ERROR_BODY = 2000;

/* Listen ports (override only when running a second instance side by side). */
const PROXY_PORT = Number(process.env.PROXY_PORT || 8091);
const MTP_PROXY_PORT = Number(process.env.MTP_PROXY_PORT || 8061);

/* MOCK API PROXY */
const mockProxy = createProxyMiddleware({
  target: MOCK_API_URL,
  changeOrigin: true,
  // The VM console's SSH stream is a WebSocket (see the upgrade handler below).
  ws: true
});

/* LIVE API PROXY (used whenever the active environment is not mock).
 * Adds what a real browser session sends: the session cookie, Origin/Referer,
 * and the X-CSRFToken header that DRF's SessionAuthentication requires on writes.
 * http-proxy-middleware v3 uses the `on: {}` handler form. */
const prodProxy = createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  // The VM console's SSH stream is a WebSocket (see the upgrade handler below).
  ws: true,
  secure: true,
  // We answer the client ourselves in proxyRes below, so the backend's real status
  // survives instead of being flattened. With this flag http-proxy stops copying the
  // status/headers and stops piping - both are done by hand in the pass-through
  // branch. Streaming still works there; only HTML error pages are buffered.
  selfHandleResponse: true,
  on: {
    proxyReq: (proxyReq, req) => {
      const cookie = prodCookie();
      if (cookie) proxyReq.setHeader("cookie", cookie);
      proxyReq.setHeader("origin", API_TARGET);
      proxyReq.setHeader("referer", API_TARGET + "/");
      const method = (req.method || "GET").toUpperCase();
      if (["POST", "PUT", "PATCH", "DELETE"].indexOf(method) !== -1) {
        const m = /csrftoken=([^;\s]+)/.exec(cookie || "");
        if (m) proxyReq.setHeader("x-csrftoken", m[1]);
      }
    },
    /* What the backend answered is what the browser sees. The DevTools Network tab
     * is the place these are read, so the status code and the body have to be the
     * real ones - a backend 500 reported as a 401 sends app-http-interceptor.ts
     * straight to the login page and hides the actual fault. Only a genuine session
     * expiry is translated, because there Django answers an XHR with a login page
     * the app cannot use. */
    proxyRes: (proxyRes, req, res) => {
      const status = proxyRes.statusCode;
      const loc = String(proxyRes.headers.location || "");
      const ctype = String(proxyRes.headers["content-type"] || "");
      const isHtml = ctype.indexOf("text/html") !== -1;
      // /account/* (the Django two-factor wizard) serves real HTML pages on
      // purpose, so the HTML rules below must not apply there - they would turn
      // the whole 2FA flow into an error. A genuine login redirect is still caught
      // for those paths by the redirectToLogin check just below.
      const isHtmlPage = /^\/account(\/|$|\?)/.test(req.url || "");

      // A) Session expired: Django either redirects to the login page or serves it
      // inline with a 200. Both mean the same thing, so say it once, in JSON.
      const redirectToLogin = (status === 301 || status === 302) && /\/account\/login/.test(loc);
      const loginPageInline = status >= 200 && status < 300 && isHtml && !isHtmlPage;
      if (redirectToLogin || loginPageInline) {
        // Drain rather than destroy - destroying would surface as a proxy error and
        // turn this into the 502 handler below.
        proxyRes.resume();
        return sendJson(req, res, 401, {
          detail: `Session expired for "${API_ENV}" - refresh tools/proxy/.cookie-${API_ENV}.`,
          status: 401,
          upstream_status: status,
          path: req.url
        });
      }

      // B) A Django error page. Keep the real status; swap only the unparsable HTML
      // body for JSON that still quotes what the page said.
      if (isHtml && status >= 400 && !isHtmlPage) {
        return readBody(proxyRes, proxyRes.headers, (text) => {
          sendJson(req, res, status, {
            detail: `${API_TARGET} returned ${status} (${ctype.split(";")[0]}).`,
            status: status,
            upstream: API_TARGET + req.url,
            body: text.slice(0, MAX_ERROR_BODY)
          });
        });
      }

      // C) Everything else goes back untouched - same status, same headers, same
      // bytes. DRF's own JSON errors land here, and so does the APPEND_SLASH
      // redirect for an endpoint declared without its trailing slash.
      res.writeHead(status, proxyRes.statusMessage, proxyRes.headers);
      proxyRes.pipe(res);
    },
    error: (err, req, res) => {
      // headersSent matters now that the pass-through branch pipes by hand: if the
      // upstream drops mid-body the reply has already started and cannot be redone.
      if (res && res.writeHead && !res.headersSent) {
        res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ detail: "Production API unreachable (" + err.code + ")." }));
      } else if (res && typeof res.end === "function") {
        res.end();
      }
    }
  }
});

/* The one place that decides where API traffic goes. */
const apiProxy = IS_LIVE ? prodProxy : mockProxy;

/* UNITY UI PROXY */
const unityProxy = createProxyMiddleware({
  target: "http://localhost:8090",
  changeOrigin: true
});

/* ADMIN PORTAL PROXY
 * ADMIN_UI selects which admin panel serves /admin:
 *   legacy (default) -> AngularJS admin-server on :8095 (unchanged behavior)
 *   react            -> new React ngx-admin static server on :8096
 * Both serve the shared /static tree, so only the active one needs to be running.
 */
const ADMIN_UI = (process.env.ADMIN_UI || "legacy").toLowerCase();
const ADMIN_TARGET = ADMIN_UI === "react"
  ? "http://localhost:8096"
  : "http://localhost:8095";

const adminProxy = createProxyMiddleware({
  target: ADMIN_TARGET,
  changeOrigin: true
});

/* Lets the admin UI show a warning banner when it is bound to production. */
app.get("/__admin_env", (req, res) => {
  res.set("Cache-Control", "no-store").json({
    env: API_ENV,
    label: ACTIVE_ENV.label,
    apiTarget: API_TARGET,
    live: IS_LIVE,
    authenticated: IS_LIVE ? !!prodCookie() : true,
    note: IS_LIVE
      ? (prodCookie() ? `${ACTIVE_ENV.label} session configured` : `no session configured for "${API_ENV}" - add tools/proxy/.cookie-${API_ENV}`)
      : "local mock"
  });
});

/* ROUTER */
app.use((req, res, next) => {
  if (isApiPath(req.url)) {
    console.log(`-> ${API_ENV.toUpperCase()}: ${req.url}`);
    return apiProxy(req, res, next);
  }

  // Admin Portal (Legacy) Routing - Intercept everything needed for the Admin UI
  const isAdminRequest = req.path.startsWith("/admin") ||
    req.path.startsWith("/api/scripts") ||
    req.path.startsWith("/api/menu") ||
    req.path === "/favicon.ico" ||
    (req.path.startsWith("/static/") && !req.path.startsWith("/static/assets/"));

  if (isAdminRequest) {
    console.log("→ ADMIN PORTAL:", req.url);
    return adminProxy(req, res, next);
  }

  console.log("→ UNITY:", req.url);
  return unityProxy(req, res, next);

});

const server = app.listen(PROXY_PORT, () => {
  console.log(`Proxy running at http://localhost:${PROXY_PORT}`);
  console.log(`Admin UI mode: ${ADMIN_UI.toUpperCase()} -> ${ADMIN_TARGET} (set ADMIN_UI=react to use ngx-admin)`);
  if (IS_LIVE) {
    console.log("");
    console.log("  **************************************************************");
    console.log(`  *  API SOURCE: ${ACTIVE_ENV.label.toUpperCase()}  ${API_TARGET}`);
    console.log("  *  Reads AND writes hit the real system.");
    console.log("  *  " + (prodCookie()
      ? `Session: configured (.cookie-${API_ENV}).`
      : `WARNING: no session - add tools/proxy/.cookie-${API_ENV} or every call 401s.`));
    console.log("  **************************************************************");
    console.log("");
  } else {
    console.log(`API source: MOCK -> ${MOCK_API_URL}   (envs: ${Object.keys(API_ENVIRONMENTS).join(", ")})`);
  }
});

/* WEBSOCKET UPGRADE -> the API environment.
 *
 * The VM web console streams its SSH session over ws://<this proxy>/webterminal/<vm>/,
 * which never reaches the express middleware chain - an upgrade is a separate event on
 * the HTTP server. Without this handler the console connects to the front end instead of
 * the backend and the socket dies immediately.
 *
 * http-proxy-middleware exposes its own upgrade handler; the same apiProxy instance
 * (and therefore the same target, cookie and headers) serves both. */
server.on("upgrade", (req, socket, head) => {
  if (!isApiPath(req.url || "")) {
    socket.destroy();
    return;
  }
  console.log(`-> ${API_ENV.toUpperCase()} [ws]: ${req.url}`);
  if (typeof apiProxy.upgrade === "function") {
    apiProxy.upgrade(req, socket, head);
  } else {
    socket.destroy();
  }
});

/* MTP DEDICATED PROXY — :8061 */
const mtpApp = express();

const mtpStaticProxy = createProxyMiddleware({
  target: "http://localhost:8060",
  changeOrigin: true
});

/* Same environment switch as the main proxy, so ngx-mtp follows API_ENV too. */
mtpApp.get("/__admin_env", (req, res) => {
  res.set("Cache-Control", "no-store").json({
    env: API_ENV,
    label: ACTIVE_ENV.label,
    apiTarget: API_TARGET,
    live: IS_LIVE,
    authenticated: IS_LIVE ? !!prodCookie() : true,
    note: IS_LIVE
      ? (prodCookie() ? `${ACTIVE_ENV.label} session configured` : `no session configured for "${API_ENV}" - add tools/proxy/.cookie-${API_ENV}`)
      : "local mock"
  });
});

mtpApp.use((req, res, next) => {
  if (isApiPath(req.url)) {
    console.log(`MTP -> ${API_ENV.toUpperCase()}: ${req.url}`);
    return apiProxy(req, res, next);
  }

  console.log("MTP → STATIC:", req.url);
  return mtpStaticProxy(req, res, next);
});

mtpApp.listen(MTP_PROXY_PORT, () => {
  console.log(`MTP proxy running at http://localhost:${MTP_PROXY_PORT}`);
  console.log(`  API source: ${ACTIVE_ENV.label} -> ${API_TARGET}`);
});