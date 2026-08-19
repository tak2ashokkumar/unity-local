const express = require("express");
const fs = require("fs");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

/* =====================================================================
 *  DATA SOURCE  -  which backend every app talks to
 * ---------------------------------------------------------------------
 *  Pick an environment with API_ENV (default "mock"):
 *
 *      API_ENV=mock    local mock API on :3001      (tools/mock-api JSON files)
 *      API_ENV=prod    https://unity.unitedlayer.com
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
 *      tools/proxy/.cookie-<env>       e.g. .cookie-prod, .cookie-play
 *  (.prod-cookie is still honoured for prod). Every environment is a separate login,
 *  so each needs its own cookie file. They are gitignored and re-read per request, so
 *  refreshing an expired session needs no restart.
 *  Copy from DevTools > Application > Cookies: "sessionid=...; csrftoken=..."
 *
 *  In any live environment the apps READ AND WRITE the real system.
 * ===================================================================== */
const API_ENVIRONMENTS = {
  mock:  { label: "Local Mock",  url: "http://localhost:3001",            live: false },
  prod:  { label: "Production",  url: "https://unity.unitedlayer.com",    live: true  },
  ams:   { label: "AMS",         url: "http://unity-ams.unitedlayer.com", live: true  },
  play:  { label: "Play",        url: "https://play.unityone.ai",         live: true  },
  alpha: { label: "Alpha",       url: "https://alpha.unityone.ai",        live: true  },
};

function resolveEnv() {
  let name = (process.env.API_ENV || "").toLowerCase().trim();
  // Back-compat: USE_PROD_API=true is a shortcut for API_ENV=prod.
  if (!name) {
    name = String(process.env.USE_PROD_API || "false").toLowerCase() === "true" ? "prod" : "mock";
  }
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
  "/apm", "/func", "/mcp", "/ssr", "/tools", "/hijack"
];

const isApiPath = (url) =>
  API_PREFIXES.some((p) => url === p || url.startsWith(p + "/") || url.startsWith(p + "?"));

/* ---- Session for the active live environment (never logged, never committed) ----
 * Each environment is a separate login, so each has its own cookie file. */
const COOKIE_FILES = [
  path.resolve(__dirname, ".cookie-" + API_ENV),
  ...(API_ENV === "prod" ? [path.resolve(__dirname, ".prod-cookie")] : []),
];
let cookieCache = { key: "", mtime: 0, value: "" };

function prodCookie() {
  if (process.env.ADMIN_COOKIE) return process.env.ADMIN_COOKIE.trim();
  for (const file of COOKIE_FILES) {
    try {
      const st = fs.statSync(file);
      if (cookieCache.key !== file || cookieCache.mtime !== st.mtimeMs) {
        cookieCache = { key: file, mtime: st.mtimeMs, value: fs.readFileSync(file, "utf8").trim() };
      }
      return cookieCache.value;
    } catch (e) { /* try next candidate */ }
  }
  return "";
}

/* Listen ports (override only when running a second instance side by side). */
const PROXY_PORT = Number(process.env.PROXY_PORT || 8091);
const MTP_PROXY_PORT = Number(process.env.MTP_PROXY_PORT || 8061);

/* MOCK API PROXY */
const mockProxy = createProxyMiddleware({
  target: MOCK_API_URL,
  changeOrigin: true
});

/* LIVE API PROXY (used whenever the active environment is not mock).
 * Adds what a real browser session sends: the session cookie, Origin/Referer,
 * and the X-CSRFToken header that DRF's SessionAuthentication requires on writes.
 * http-proxy-middleware v3 uses the `on: {}` handler form. */
const prodProxy = createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  secure: true,
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
    proxyRes: (proxyRes, req, res) => {
      // An expired session makes Django redirect to the login page (or return the
      // login HTML). Convert that into a clear JSON 401 so the UI can say so
      // instead of choking on unparsable HTML.
      const loc = proxyRes.headers.location || "";
      const ctype = proxyRes.headers["content-type"] || "";
      const redirectToLogin =
        (proxyRes.statusCode === 301 || proxyRes.statusCode === 302) && /\/account\/login/.test(loc);
      if (redirectToLogin || ctype.indexOf("text/html") !== -1) {
        proxyRes.statusCode = 401;
        proxyRes.headers["content-type"] = "application/json; charset=utf-8";
        delete proxyRes.headers.location;
      }
    },
    error: (err, req, res) => {
      if (res && res.writeHead) {
        res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ detail: "Production API unreachable (" + err.code + ")." }));
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

app.listen(PROXY_PORT, () => {
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