const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const { createTask, getTask } = require("./utils/taskManager");

function generateUUID() {
  const b = crypto.randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = b.toString('hex');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

const app = express();
const PORT = 3001;

app.use(express.json());

const baseDir = path.join(__dirname);
const celeryDir = path.join(__dirname, "celery");

function buildPageUrl(req, page, pageSize) {
  const protocol = req.protocol || "http";
  const host = req.get("host") || `localhost:${PORT}`;
  const url = new URL(`${protocol}://${host}${req.path}`);

  url.searchParams.set("page", String(page));
  if (pageSize !== undefined) {
    url.searchParams.set("page_size", String(pageSize));
  }
  return url.toString();
}

function paginateArray(req, data) {
  const query = req.query || {};
  const rawPageSize = Number(query.page_size);
  const rawPage = Number(query.page || 1);

  if (query.page_size === "0" || rawPageSize === 0) {
    return data;
  }

  const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const count = data.length;
  const start = (page - 1) * pageSize;
  const results = data.slice(start, start + pageSize);
  const next = start + pageSize < count ? buildPageUrl(req, page + 1, pageSize) : null;
  const previous = page > 1 ? buildPageUrl(req, page - 1, pageSize) : null;

  return {
    count,
    next,
    previous,
    results
  };
}

const queryIdentityParamNames = new Set([
  "metric",
  "key",
  "type",
  "app_id",
  "graph_type"
]);

const ignoredQueryParamNames = new Set([
  "from",
  "to",
  "page",
  "page_size",
  "search"
]);

function sanitizeFilePart(value) {
  return String(value)
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "") || "empty";
}

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

  return path.join(baseDir, `${normalizedUrlPath}.${querySuffix}.json`);
}

// ---------- Identity (id / uuid / *_id) resolution helpers ----------

// UUID matcher reused by detail lookups.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Read a mock file from disk, rewrite hard-coded hosts, and parse it.
function readMockFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const rewritten = raw.replace(/https:\/\/unity\.unitedlayer\.com/g, `http://localhost:${PORT}`);
  return JSON.parse(rewritten);
}

// Known query-param -> item-field name mismatches. Params not listed here fall
// back to the heuristic in candidateFieldsForParam(). Add an entry only when the
// query param name differs from the field name carried by the data.
const identityFieldMap = {
  app_id: ["parent_app", "app_id"]
};

// True when a query param identifies a record (and should filter list results).
function isIdentityParamName(name) {
  if (ignoredQueryParamNames.has(name)) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(identityFieldMap, name)) {
    return true;
  }
  return name === "id" || name === "uuid" || name.endsWith("_id");
}

// Item fields a given identity param may match against.
function candidateFieldsForParam(name) {
  if (identityFieldMap[name]) {
    return identityFieldMap[name];
  }
  const fields = [name];
  if (name.endsWith("_id")) {
    fields.push(name.slice(0, -3));
  }
  fields.push("id", "uuid");
  return fields;
}

function looseEquals(left, right) {
  return String(left) === String(right);
}

// Filter a results array by every identity query param. A param only filters when
// at least one item actually carries one of its candidate fields; otherwise it is
// ignored so lists that are not keyed by that id are returned untouched.
function filterByIdentityParams(results, query) {
  if (!Array.isArray(results) || !results.length) {
    return results;
  }

  let filtered = results;

  Object.keys(query || {}).forEach(name => {
    if (!isIdentityParamName(name)) {
      return;
    }

    const rawValue = query[name];
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    const fields = candidateFieldsForParam(name);

    const fieldPresent = filtered.some(item =>
      fields.some(field => item && Object.prototype.hasOwnProperty.call(item, field))
    );
    if (!fieldPresent) {
      return;
    }

    filtered = filtered.filter(item =>
      values.some(value =>
        fields.some(field =>
          item &&
          Object.prototype.hasOwnProperty.call(item, field) &&
          looseEquals(item[field], value)
        )
      )
    );
  });

  return filtered;
}

// Split "parent/path/<id-or-uuid>" into its parent path and trailing identifier.
function splitDetailPath(normalizedUrlPath) {
  const match = normalizedUrlPath.match(/^(.*)\/([^/]+)$/);
  if (!match) {
    return null;
  }
  const id = match[2];
  if (!/^[0-9]+$/.test(id) && !UUID_RE.test(id)) {
    return null;
  }
  return { parentUrlPath: match[1], id };
}

// Find a single record inside its parent list file by trailing id or uuid.
function findParentListItem(normalizedUrlPath) {
  const detail = splitDetailPath(normalizedUrlPath);
  if (!detail || !detail.parentUrlPath) {
    return null;
  }

  const parentFilePath = path.join(baseDir, detail.parentUrlPath + ".json");
  if (!fs.existsSync(parentFilePath)) {
    return null;
  }

  const parsed = readMockFile(parentFilePath);
  const list = Array.isArray(parsed)
    ? parsed
    : (parsed && Array.isArray(parsed.results) ? parsed.results : null);
  if (!list) {
    return null;
  }

  return list.find(item =>
    item && (looseEquals(item.uuid, detail.id) || looseEquals(item.id, detail.id))
  ) || null;
}

if (fs.existsSync(celeryDir)) {
  fs.readdirSync(celeryDir).forEach(file => {
    if (file.endsWith(".js")) {
      require(path.join(celeryDir, file))(app);
    }
  });
}

app.get("/task/:id/", (req, res) => {
  res.json(getTask(req.params.id));
});

app.use((req, res) => {

  if (req.method === "DELETE") {
    return res.status(204).send();
  }

  if (req.method === "POST") {
    if (/\/execute\/?$|\/sync\/?$|\/migrate\/?$|\/run\/?$/i.test(req.path)) {
      return res.json({ task_id: createTask() });
    }
    const body = req.body && typeof req.body === "object" ? req.body : {};
    return res.status(201).json({ id: Date.now(), uuid: generateUUID(), ...body });
  }

  if (req.method === "PATCH" || req.method === "PUT") {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const patchPath = req.path
      .replace(/^\/+/g, "")
      .replace(/\/+$/, "")
      .replace(/\/+/g, "/");
    const patchFilePath = path.join(baseDir, patchPath + ".json");

    // Resolve by trailing id/uuid inside the parent list and merge onto that record.
    const targetItem = findParentListItem(patchPath);
    if (targetItem) {
      return res.json({ ...targetItem, ...body });
    }

    if (fs.existsSync(patchFilePath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(patchFilePath, "utf8"));
        return res.json({ ...(typeof existing === "object" && !Array.isArray(existing) ? existing : {}), ...body });
      } catch {
        return res.json(body);
      }
    }
    return res.json(body);
  }

  const normalizedUrlPath = req.path
    .replace(/^\/+/g, "")
    .replace(/\/+$/, "")
    .replace(/\/+/g, "/");

  const exactFilePath = path.join(baseDir, normalizedUrlPath + ".json");
  const querySpecificFilePath = buildQuerySpecificFilePath(normalizedUrlPath, req.query);

  const sendMockResponse = parsed => {
    if (Array.isArray(parsed)) {
      const filtered = filterByIdentityParams(parsed, req.query);
      return res.json(paginateArray(req, filtered));
    }
    if (parsed && Array.isArray(parsed.results)) {
      const filteredResults = filterByIdentityParams(parsed.results, req.query);
      if (filteredResults !== parsed.results) {
        return res.json({ ...parsed, count: filteredResults.length, results: filteredResults });
      }
    }
    return res.json(parsed);
  };

  if (querySpecificFilePath && fs.existsSync(querySpecificFilePath)) {
    return sendMockResponse(readMockFile(querySpecificFilePath));
  }

  if (fs.existsSync(exactFilePath)) {
    return sendMockResponse(readMockFile(exactFilePath));
  }

  const detail = splitDetailPath(normalizedUrlPath);
  if (detail) {
    const item = findParentListItem(normalizedUrlPath);
    if (item) {
      return res.json(item);
    }

    // Preserve prior behavior: auto-create a placeholder only for uuid detail lookups.
    if (UUID_RE.test(detail.id)) {
      const dir = path.dirname(exactFilePath);
      fs.mkdirSync(dir, { recursive: true });

      const placeholder = {
        id: null,
        uuid: detail.id
      };

      fs.writeFileSync(exactFilePath, JSON.stringify(placeholder, null, 2));
      console.log(`\nWARN Mock detail file created for ${req.path}:`);
      console.log(exactFilePath);
      console.log("Edit this file to add the object details.\n");
      return res.json(placeholder);
    }
  }

  const filePath = querySpecificFilePath || path.join(baseDir, normalizedUrlPath + ".json");
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });

  if (req.query && req.query.page_size === "0") {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return res.json([]);
  }

  const template = {
    count: 0,
    next: null,
    previous: null,
    results: []
  };

  fs.writeFileSync(filePath, JSON.stringify(template, null, 2));

  console.log("\n⚠ Mock file created:");
  console.log(filePath);
  console.log("Edit this file to add mock data.\n");

  return res.json(template);
});

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
}).on("error", err => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} already in use`);
  }
});
