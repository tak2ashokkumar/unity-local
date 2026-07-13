/*
 * import-har.js
 *
 * Import prod network responses (captured as a HAR file) into the local mock tree.
 *
 * The mock server (server.js) maps a request URL path directly onto a JSON file on
 * disk. This script replays that same mapping over the entries in a HAR export and
 * writes each captured response body into the file the server would read for that URL.
 *
 * Usage:
 *   node tools/mock-api/import-har.js "C:\path\to\page.har"            (dry run - prints plan only)
 *   node tools/mock-api/import-har.js "C:\path\to\page.har" --write    (actually writes files)
 *   node tools/mock-api/import-har.js "C:\path\to\page.har" --exclude=aiops-dashboard/alerts/
 *       (skip any request whose URL path contains one of the comma-separated substrings)
 *
 * Only GET + 200 + JSON responses under a mock-proxied path are imported. Everything
 * else (assets, other hosts, POST/PATCH/etc., non-JSON, non-200) is skipped and, where
 * relevant, reported with a reason.
 */

const fs = require("fs");
const path = require("path");

// Mock data root. This file lives in tools/mock-api, and the server resolves mock
// files relative to that same directory, so __dirname is the correct base.
const BASE_DIR = __dirname;

// URL path prefixes the proxy forwards to the mock server (tools/proxy/server.js).
// Kept in sync with that list by hand.
const MOCK_PREFIXES = [
  "/customer",
  "/rest",
  "/orchestration",
  "/chatbot",
  "/task",
  "/apm",
  "/func",
  "/mcp",
  "/ssr"
];

// Query params that select a per-variant mock file (server.js buildQuerySpecificFilePath).
const queryIdentityParamNames = new Set([
  "metric",
  "key",
  "type",
  "app_id",
  "graph_type",
  "device_category"
]);

// Query params that never affect the mock file name (server.js).
const ignoredQueryParamNames = new Set([
  "from",
  "to",
  "page",
  "page_size",
  "search"
]);

// ---------- mapping helpers (mirrors tools/mock-api/server.js) ----------

// Strip leading/trailing/duplicate slashes, matching the server's normalization.
function normalizePath(urlPath) {
  return urlPath
    .replace(/^\/+/g, "")
    .replace(/\/+$/, "")
    .replace(/\/+/g, "/");
}

// server.js sanitizeFilePart
function sanitizeFilePart(value) {
  return String(value)
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "") || "empty";
}

// server.js buildQuerySpecificFilePath. Returns the variant file path or null.
function buildQuerySpecificFilePath(normalizedUrlPath, query) {
  const queryEntries = Object.entries(query || {})
    .filter(([key]) => queryIdentityParamNames.has(key) && !ignoredQueryParamNames.has(key))
    .flatMap(([key, value]) => {
      const values = Array.isArray(value) ? value : [value];
      return values.map(item => [key, item]);
    })
    .filter(([, value]) => value !== undefined && value !== null && value !== "");

  if (!queryEntries.length) {
    return null;
  }

  queryEntries.sort(([leftKey, leftValue], [rightKey, rightValue]) => {
    const left = `${leftKey}:${leftValue}`;
    const right = `${rightKey}:${rightValue}`;
    return left.localeCompare(right);
  });

  const querySuffix = queryEntries
    .map(([key, value]) => `${sanitizeFilePart(key)}-${sanitizeFilePart(value)}`)
    .join(".");

  return path.join(BASE_DIR, `${normalizedUrlPath}.${querySuffix}.json`);
}

// Build an Express-style query object (repeated keys become arrays) from URLSearchParams.
function buildQueryObject(searchParams) {
  const obj = {};
  for (const [key, value] of searchParams.entries()) {
    if (obj[key] === undefined) {
      obj[key] = value;
    } else if (Array.isArray(obj[key])) {
      obj[key].push(value);
    } else {
      obj[key] = [obj[key], value];
    }
  }
  return obj;
}

function isMockPath(pathname) {
  return MOCK_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

// ---------- HAR entry handling ----------

// Decode a HAR response body into a JS value, or throw if it is not usable JSON.
function decodeBody(content) {
  if (!content || typeof content.text !== "string" || content.text === "") {
    throw new Error("no response body in HAR (re-export with content)");
  }
  const raw = content.encoding === "base64"
    ? Buffer.from(content.text, "base64").toString("utf8")
    : content.text;
  return JSON.parse(raw);
}

// Decide what to actually write for a captured body, handling the pagination-wrapper
// nuance: existing paginated mock files store a raw array and the server wraps it.
function resolveWritePayload(body, targetFile, queryObj) {
  const isWrapper = body
    && typeof body === "object"
    && !Array.isArray(body)
    && Array.isArray(body.results)
    && ("count" in body || "next" in body || "previous" in body);

  if (!isWrapper) {
    return { payload: body, note: null };
  }

  if (fs.existsSync(targetFile)) {
    let existing = null;
    try {
      existing = JSON.parse(fs.readFileSync(targetFile, "utf8"));
    } catch (err) {
      existing = null;
    }
    if (Array.isArray(existing)) {
      return { payload: body.results, note: "paginated: stored results[] to match existing array file" };
    }
    return { payload: body, note: "paginated: stored wrapper to match existing object file" };
  }

  const hasPageParams = ("page" in queryObj) || ("page_size" in queryObj);
  if (hasPageParams) {
    return { payload: body.results, note: "paginated: new file, stored results[] (request used pagination)" };
  }
  return { payload: body, note: "paginated: new file, stored wrapper (request had no page params)" };
}

// ---------- main ----------

function main() {
  const argv = process.argv.slice(2);
  const write = argv.includes("--write");
  const harArg = argv.find(arg => !arg.startsWith("--"));
  const excludeArg = argv.find(arg => arg.startsWith("--exclude="));
  const excludes = excludeArg
    ? excludeArg.slice("--exclude=".length).split(",").map(part => part.trim()).filter(Boolean)
    : [];

  if (!harArg) {
    console.error("Usage: node tools/mock-api/import-har.js <file.har> [--write] [--exclude=<substr>[,<substr>...]]");
    process.exit(1);
  }

  const harPath = path.resolve(harArg);
  if (!fs.existsSync(harPath)) {
    console.error(`HAR file not found: ${harPath}`);
    process.exit(1);
  }

  let har;
  try {
    har = JSON.parse(fs.readFileSync(harPath, "utf8"));
  } catch (err) {
    console.error(`Could not parse HAR as JSON: ${err.message}`);
    process.exit(1);
  }

  const entries = har && har.log && Array.isArray(har.log.entries) ? har.log.entries : null;
  if (!entries) {
    console.error("HAR has no log.entries array - is this a valid HAR export?");
    process.exit(1);
  }

  console.log(`\n${write ? "WRITE" : "DRY RUN"} - importing from ${harPath}`);
  console.log(`Mock root: ${BASE_DIR}`);
  if (excludes.length) {
    console.log(`Excluding paths containing: ${excludes.join(", ")}`);
  }
  console.log("");

  // targetFile -> action, last successful GET/200/JSON wins for a given file.
  const actions = new Map();
  const skips = [];
  let nonApiCount = 0;
  let overwrittenInRun = 0;

  for (const entry of entries) {
    const request = entry && entry.request;
    const response = entry && entry.response;
    if (!request || !response || typeof request.url !== "string") {
      continue;
    }

    let url;
    try {
      url = new URL(request.url);
    } catch (err) {
      try {
        url = new URL(request.url, "http://localhost");
      } catch (err2) {
        continue;
      }
    }

    const pathname = url.pathname;

    // Not an API call we mock (static asset, other host path, analytics, ...). Counted, not listed.
    if (!isMockPath(pathname)) {
      nonApiCount++;
      continue;
    }

    const method = (request.method || "GET").toUpperCase();
    const label = `${method} ${pathname}${url.search}`;

    // Caller-requested exclusions (e.g. --exclude=aiops-dashboard/alerts/).
    if (excludes.some(ex => pathname.includes(ex))) {
      skips.push({ label, reason: "excluded by --exclude" });
      continue;
    }

    // /task/:id/ is served by a live route in server.js, not a file - importing is pointless.
    if (pathname.startsWith("/task/")) {
      skips.push({ label, reason: "task polling endpoint (served by live route, not a file)" });
      continue;
    }

    if (method !== "GET") {
      skips.push({ label, reason: `${method} not file-backed (server echoes/merges these)` });
      continue;
    }

    if (response.status !== 200) {
      skips.push({ label, reason: `status ${response.status}` });
      continue;
    }

    const mime = (response.content && response.content.mimeType) || "";
    if (!/json/i.test(mime)) {
      skips.push({ label, reason: `non-JSON content (${mime || "unknown"})` });
      continue;
    }

    let body;
    try {
      body = decodeBody(response.content);
    } catch (err) {
      skips.push({ label, reason: err.message });
      continue;
    }

    const normalized = normalizePath(pathname);
    const queryObj = buildQueryObject(url.searchParams);
    const variant = buildQuerySpecificFilePath(normalized, queryObj);
    const targetFile = variant || path.join(BASE_DIR, normalized + ".json");

    const resolved = resolveWritePayload(body, targetFile, queryObj);

    if (actions.has(targetFile)) {
      overwrittenInRun++;
    }
    actions.set(targetFile, {
      label,
      targetFile,
      payload: resolved.payload,
      note: resolved.note
    });
  }

  // Print the plan.
  let created = 0;
  let updated = 0;
  const planned = [...actions.values()].sort((a, b) => a.targetFile.localeCompare(b.targetFile));

  for (const action of planned) {
    const exists = fs.existsSync(action.targetFile);
    const kind = exists ? "UPDATE" : "NEW";
    if (exists) {
      updated++;
    } else {
      created++;
    }
    const rel = path.relative(process.cwd(), action.targetFile);
    console.log(`[${kind}] ${action.label}`);
    console.log(`         -> ${rel}`);
    if (action.note) {
      console.log(`         (${action.note})`);
    }
  }

  if (skips.length) {
    console.log(`\nSkipped ${skips.length} mock-path request(s):`);
    for (const skip of skips) {
      console.log(`  - ${skip.label}  [${skip.reason}]`);
    }
  }

  // Actually write, if asked.
  if (write) {
    for (const action of planned) {
      fs.mkdirSync(path.dirname(action.targetFile), { recursive: true });
      fs.writeFileSync(action.targetFile, JSON.stringify(action.payload, null, 2));
    }
  }

  // Summary.
  console.log("");
  console.log("Summary");
  console.log(`  matched endpoints : ${planned.length}  (new: ${created}, update: ${updated})`);
  console.log(`  skipped mock paths: ${skips.length}`);
  console.log(`  non-API requests  : ${nonApiCount}`);
  if (overwrittenInRun) {
    console.log(`  duplicate targets : ${overwrittenInRun} (last 200 response kept)`);
  }
  if (write) {
    console.log(`\nWrote ${planned.length} file(s). Reload the local page at localhost:8091 to verify.`);
  } else {
    console.log(`\nDry run only - nothing written. Re-run with --write to apply.`);
  }
}

main();
