// Mock routes for the Custom Dashboard API (/customer/persona/analytics-dashboards/).
//
// The generic catch-all in server.js only echoes POST bodies and reads details from the
// list file, so a dashboard created in the UI would never be found again and panel
// operations would not return the full dashboard the contract promises. These routes keep
// an in-memory copy seeded from customer/persona/analytics-dashboards.json:
// - every write bumps `version` and returns the full dashboard object, like the server
// - the JSON file is never modified; restarting the mock resets the data
// - metadata/* routes read the catalog seeds in customer/persona/analytics-dashboards/metadata/
//   and generate chart / table values

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const publicCloudResources = require("./publicCloudResources");

const BASE_URL = "/customer/persona/analytics-dashboards";
const UUID_PARAM = ":uuid([0-9a-fA-F-]{36})";
const SEED_FILE = path.join(__dirname, "..", "customer", "persona", "analytics-dashboards.json");
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

let dashboards = null;

function generateUUID() {
  const b = crypto.randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = b.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getDashboards() {
  if (!dashboards) {
    dashboards = fs.existsSync(SEED_FILE) ? JSON.parse(fs.readFileSync(SEED_FILE, "utf8")) : [];
  }
  return dashboards;
}

function findDashboard(uuid) {
  return getDashboards().find(d => d.uuid === uuid) || null;
}

function getPanels(dashboard) {
  if (!dashboard.definition || typeof dashboard.definition !== "object") {
    dashboard.definition = {};
  }
  if (!Array.isArray(dashboard.definition.panels)) {
    dashboard.definition.panels = [];
  }
  return dashboard.definition.panels;
}

function touch(dashboard) {
  dashboard.version = (dashboard.version || 0) + 1;
  dashboard.updated_at = new Date().toISOString();
}

function buildPageUrl(req, page, pageSize) {
  const url = new URL(`${req.protocol}://${req.get("host")}${req.path}`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(pageSize));
  return url.toString();
}

// Fields the client may set through create / PATCH. Server-owned fields (uuid, status,
// version, timestamps) are never taken from the request body.
const EDITABLE_FIELDS = [
  "name",
  "description",
  "categories",
  "roles",
  "specific_users",
  "refresh",
  "refresh_interval_in_sec",
  "timeframe",
  "definition"
];

function pickEditable(body) {
  const picked = {};
  EDITABLE_FIELDS.forEach(field => {
    if (body && Object.prototype.hasOwnProperty.call(body, field)) {
      picked[field] = body[field];
    }
  });
  return picked;
}

// ---------- metadata (Data Scope, chart / table data, filter options) ----------
// Catalog seeds live in customer/persona/analytics-dashboards/metadata/*.json. Chart and
// table values are generated (deterministic per metric) so every selection has data.

const METADATA_DIR = path.join(__dirname, "..", "customer", "persona", "analytics-dashboards", "metadata");
const TIMEFRAME_SECONDS = {
  last_1_hour: 3600,
  last_24_hours: 86400,
  last_7_days: 604800,
  last_30_days: 2592000
};

function readMetadata(name) {
  return JSON.parse(fs.readFileSync(path.join(METADATA_DIR, name), "utf8"));
}

function parseJsonParam(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function paginateList(req, list) {
  const rawPageSize = Number(req.query.page_size);
  const rawPage = Number(req.query.page);
  const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.min(rawPageSize, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const start = (page - 1) * pageSize;
  return {
    count: list.length,
    next: start + pageSize < list.length ? buildPageUrl(req, page + 1, pageSize) : null,
    previous: page > 1 ? buildPageUrl(req, page - 1, pageSize) : null,
    results: list.slice(start, start + pageSize)
  };
}

function matchesSearch(name, search) {
  return !search || String(name).toLowerCase().includes(String(search).trim().toLowerCase());
}

// Items for one device: templates of its device_type, item_id derived from the device position.
function itemsForDevice(device) {
  if (!device || device.status !== "monitored") {
    return [];
  }
  const devices = readMetadata("devices.json");
  const templates = readMetadata("items.json")[device.device_type] || [];
  const deviceIndex = devices.findIndex(d => d.device_id === device.device_id);
  return templates.map((t, i) => ({
    device_type: device.device_type,
    device_id: device.device_id,
    item_id: (deviceIndex + 1) * 1000 + i + 1,
    name: t.name,
    key: t.key,
    unit: t.unit,
    value_type: t.value_type,
    flags: 0,
    template_item_id: 0,
    inherited: false,
    origin: "direct",
    enabled: true,
    supported: true,
    // A template can mark an item as not chartable (e.g. a text item).
    selectable: t.selectable !== false,
    aggregations: t.aggregations,
    aggregation_basis: "stored_numeric_samples",
    query_execution_available: true,
    rate_conversion: "not_supported",
    last_value: null,
    last_clock: 0,
    data_available: true,
    data_availability: "confirmed_value",
    freshness: "not_evaluated",
    monitoring: { instance_id: "i1-uuid", host_id: 40 + deviceIndex }
  }));
}

// Public Cloud metrics (device_type "<provider>:<resource type id>") come from the Public
// Cloud resource mocks; every other metric from the metadata seeds.
function findItem(metric) {
  if (String(metric.device_type || "").includes(":")) {
    return publicCloudResources.findItem(metric);
  }
  const device = readMetadata("devices.json").find(d => d.device_id === metric.device_id);
  return itemsForDevice(device).find(i => Number(i.item_id) === Number(metric.item_id)) || null;
}

function hashCode(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getTimeline(req) {
  const timeframe = TIMEFRAME_SECONDS[req.query.timeframe] ? req.query.timeframe : "last_24_hours";
  const rawPoints = Number(req.query.points);
  const points = Number.isFinite(rawPoints) ? Math.min(Math.max(rawPoints, 10), 360) : 120;
  const bucketSeconds = Math.floor(TIMEFRAME_SECONDS[timeframe] / points);
  const end = Math.floor(Date.now() / 1000 / bucketSeconds) * bucketSeconds;
  const clocks = [];
  for (let i = points - 1; i >= 0; i--) {
    clocks.push(end - i * bucketSeconds);
  }
  return { timeframe, points, bucketSeconds, clocks };
}

function generateValues(metric, unit, count) {
  const seed = hashCode(`${metric.device_id}:${metric.item_id}:${metric.aggregation}`);
  const isPercent = unit === "%";
  const base = isPercent ? 20 + (seed % 50) : 100 + (seed % 900);
  const amplitude = isPercent ? 15 : base * 0.4;
  const values = [];
  for (let i = 0; i < count; i++) {
    let v = base + amplitude * Math.sin(i / 7 + (seed % 10)) + ((seed + i * 13) % 7) - 3;
    if (isPercent) {
      v = Math.min(100, Math.max(0, v));
    }
    values.push(Math.round(Math.max(0, v) * 10) / 10);
  }
  return values;
}

function aggregate(values, aggregation) {
  if (!values.length) {
    return null;
  }
  switch (aggregation) {
    case "min": return Math.min(...values);
    case "max": return Math.max(...values);
    case "latest": return values[values.length - 1];
    default: return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  }
}

function appliedFilters(req, timeframe) {
  const filters = parseJsonParam(req.query.filters, {}) || {};
  return { applied: filters, removed: 0, timeframe };
}

module.exports = (app) => {

  app.get(`${BASE_URL}/metadata/scopes`, (req, res) => {
    if (!req.query.kind) {
      return res.status(400).json({ kind: ["This field is required."] });
    }
    const list = readMetadata("scopes.json").filter(s =>
      s.kind === req.query.kind &&
      matchesSearch(s.name, req.query.search) &&
      (!req.query.provider || (s.provider && s.provider.id === req.query.provider))
    );
    res.json({ ...paginateList(req, list), unsupported_integrations: ["public_cloud"] });
  });

  app.get(`${BASE_URL}/metadata/device-types`, (req, res) => {
    if (!req.query.kind || !req.query.scope_id) {
      return res.status(400).json({ detail: "kind and scope_id are required." });
    }
    const byKind = readMetadata("device-types.json")[req.query.kind];
    res.json(byKind || { results: [], unsupported_integrations: ["public_cloud"], other_categories_available: false });
  });

  app.get(`${BASE_URL}/metadata/devices`, (req, res) => {
    const devices = readMetadata("devices.json");
    if (req.query.sources) {
      const sources = parseJsonParam(req.query.sources, []);
      if (!Array.isArray(sources) || !sources.length || sources.length > 2) {
        return res.status(400).json({ sources: ["Provide 1 to 2 sources."] });
      }
      // `selected` is true for the device_ids a source carries; selection=selected|unselected filters on it.
      const selection = req.query.selection || "all";
      const list = devices
        .map(d => {
          const source = sources.find(s => s.kind === d.scope.kind && s.device_type === d.device_type && (s.scope_ids || []).includes(d.scope.id));
          return source ? { ...d, selected: (source.device_ids || []).includes(d.device_id) } : null;
        })
        .filter(d => d && (selection === "all" || (selection === "selected") === d.selected))
        .sort((a, b) => a.device_type.localeCompare(b.device_type) || a.name.localeCompare(b.name));
      return res.json({ ...paginateList(req, list), ordering: ["device_type", "name", "uuid"], selection });
    }
    const status = req.query.status || "all";
    const list = devices.filter(d =>
      d.device_type === req.query.device_type &&
      d.scope.kind === req.query.kind &&
      d.scope.id === req.query.scope_id &&
      (status === "all" || d.status === status) &&
      matchesSearch(d.name, req.query.search)
    );
    res.json(paginateList(req, list));
  });

  app.get(`${BASE_URL}/metadata/items`, (req, res) => {
    const devices = readMetadata("devices.json");
    let targets;
    if (req.query.devices) {
      targets = parseJsonParam(req.query.devices, []);
      if (!Array.isArray(targets) || !targets.length || targets.length > 20) {
        return res.status(400).json({ devices: ["Provide 1 to 20 devices."] });
      }
    } else {
      targets = [{ device_type: req.query.device_type, device_id: req.query.device_id }];
    }
    const list = targets
      .map(t => devices.find(d => d.device_id === t.device_id && d.device_type === t.device_type))
      .reduce((items, device) => items.concat(itemsForDevice(device)), [])
      .filter(i => matchesSearch(i.name, req.query.search));
    res.json(paginateList(req, list));
  });

  app.get(`${BASE_URL}/metadata/chart-data`, (req, res) => {
    const metrics = parseJsonParam(req.query.metrics, []);
    if (!Array.isArray(metrics) || !metrics.length || metrics.length > 20) {
      return res.status(400).json({ metrics: ["Provide 1 to 20 metrics."] });
    }
    const chartType = req.query.chart_type;
    if (!["line", "area", "bar", "pie", "treemap", "single"].includes(chartType)) {
      return res.status(400).json({ chart_type: ["Use line, area, bar, pie, treemap or single."] });
    }
    const timeline = getTimeline(req);
    const body = {
      chart_type: chartType,
      variant: req.query.variant || null,
      timeframe: timeline.timeframe,
      points: timeline.points,
      bucket_seconds: timeline.bucketSeconds,
      filters: appliedFilters(req, timeline.timeframe)
    };
    const described = metrics.map(m => ({ metric: m, item: findItem(m) || { name: `Item ${m.item_id}`, key: "", unit: "" } }));
    if (["pie", "treemap", "single"].includes(chartType)) {
      body.data = described.map(({ metric, item }) => ({
        item_id: metric.item_id,
        name: item.name,
        unit: item.unit,
        aggregation: metric.aggregation,
        device_type: metric.device_type,
        device_id: metric.device_id,
        value: aggregate(generateValues(metric, item.unit, timeline.points), metric.aggregation)
      }));
    } else {
      body.series = described.map(({ metric, item }) => {
        const values = generateValues(metric, item.unit, timeline.points);
        return {
          item_id: metric.item_id,
          name: item.name,
          key: item.key,
          unit: item.unit,
          aggregation: metric.aggregation,
          device_type: metric.device_type,
          device_id: metric.device_id,
          data: timeline.clocks.map((clock, i) => ({ clock, value: values[i] }))
        };
      });
    }
    res.json(body);
  });

  app.get(`${BASE_URL}/metadata/table-data`, (req, res) => {
    const columns = parseJsonParam(req.query.columns, []);
    if (!Array.isArray(columns) || !columns.length || columns.length > 20) {
      return res.status(400).json({ columns: ["Provide 1 to 20 columns."] });
    }
    const timeline = getTimeline(req);
    const described = columns.map(c => {
      const item = findItem(c.metric) || { name: `Item ${c.metric.item_id}`, key: "", unit: "" };
      return {
        column: {
          id: c.id,
          header: c.header,
          sortable: !!c.sortable,
          hidden: !!c.hidden,
          item_name: item.name,
          item_key: item.key,
          unit: item.unit,
          aggregation: c.metric.aggregation,
          device_type: c.metric.device_type,
          device_id: c.metric.device_id,
          numeric: true
        },
        values: generateValues(c.metric, item.unit, timeline.points)
      };
    });
    let rows = timeline.clocks.map((clock, i) => [clock, ...described.map(d => d.values[i])]);
    const sortIndex = req.query.sort && req.query.sort !== "clock" ? 1 + described.findIndex(d => d.column.id === req.query.sort) : 0;
    const direction = req.query.order === "asc" ? 1 : -1;
    rows = rows.sort((a, b) => ((a[sortIndex] || 0) - (b[sortIndex] || 0)) * direction);
    res.json({
      timeframe: timeline.timeframe,
      points: timeline.points,
      bucket_seconds: timeline.bucketSeconds,
      columns: described.map(d => d.column),
      rows,
      filters: appliedFilters(req, timeline.timeframe)
    });
  });

  app.get(`${BASE_URL}/metadata/filter-options`, (req, res) => {
    const all = readMetadata("filter-options.json");
    if (!req.query.key) {
      return res.json(all);
    }
    const group = all.results.find(g => g.key === req.query.key);
    if (!group) {
      return res.status(400).json({ key: ["Unknown filter key."] });
    }
    res.json(group);
  });

  // Review: the real response also enriches metrics/devices; the mock returns the basics.
  app.get(`${BASE_URL}/${UUID_PARAM}/review`, (req, res) => {
    const dashboard = findDashboard(req.params.uuid);
    if (!dashboard) {
      return res.status(404).json({ detail: "Not found." });
    }
    const panels = getPanels(dashboard);
    res.json({
      dashboard: { uuid: dashboard.uuid, name: dashboard.name, status: dashboard.status, version: dashboard.version },
      panels: clone(panels),
      global_filters: clone((dashboard.definition && dashboard.definition.global_filters) || []),
      ready: panels.length > 0,
      errors: panels.length ? [] : [{ field: "definition.panels", panel_id: null, widget_id: null, message: "Add at least one panel before publishing." }],
      publishing: { available: true, reason: null },
      superset: { dashboard_id: null, embed_uuid: null, sync_status: "pending", sync_error_code: "" }
    });
  });

  app.get(BASE_URL, (req, res) => {
    const search = String(req.query.search || "").trim().toLowerCase();
    const list = getDashboards().filter(d => !search || String(d.name).toLowerCase().includes(search));

    const rawPageSize = Number(req.query.page_size);
    const rawPage = Number(req.query.page);
    const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.min(rawPageSize, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const start = (page - 1) * pageSize;

    res.json({
      count: list.length,
      next: start + pageSize < list.length ? buildPageUrl(req, page + 1, pageSize) : null,
      previous: page > 1 ? buildPageUrl(req, page - 1, pageSize) : null,
      results: clone(list.slice(start, start + pageSize))
    });
  });

  app.post(BASE_URL, (req, res) => {
    const now = new Date().toISOString();
    const dashboard = {
      uuid: generateUUID(),
      name: "",
      description: "",
      categories: [],
      roles: [],
      specific_users: [],
      refresh: false,
      refresh_interval_in_sec: null,
      timeframe: "last_24_hours",
      ...pickEditable(req.body),
      status: "draft",
      version: 1,
      created_at: now,
      updated_at: now,
      definition: {}
    };
    getDashboards().unshift(dashboard);
    res.status(201).json(clone(dashboard));
  });

  app.get(`${BASE_URL}/${UUID_PARAM}`, (req, res) => {
    const dashboard = findDashboard(req.params.uuid);
    if (!dashboard) {
      return res.status(404).json({ detail: "Not found." });
    }
    res.json(clone(dashboard));
  });

  const updateDashboard = (req, res) => {
    const dashboard = findDashboard(req.params.uuid);
    if (!dashboard) {
      return res.status(404).json({ detail: "Not found." });
    }
    Object.assign(dashboard, pickEditable(req.body));
    // ASSUMPTION (not in the contract yet): the UI moves a published dashboard back to
    // draft with PATCH { status: "draft" }. Publishing only happens through publish/.
    if (req.body && req.body.status === "draft") {
      dashboard.status = "draft";
    }
    touch(dashboard);
    res.json(clone(dashboard));
  };
  app.patch(`${BASE_URL}/${UUID_PARAM}`, updateDashboard);
  app.put(`${BASE_URL}/${UUID_PARAM}`, updateDashboard);

  app.delete(`${BASE_URL}/${UUID_PARAM}`, (req, res) => {
    const list = getDashboards();
    const index = list.findIndex(d => d.uuid === req.params.uuid);
    if (index === -1) {
      return res.status(404).json({ detail: "Not found." });
    }
    list.splice(index, 1);
    res.status(204).send();
  });

  // Contract: 200 with the full dashboard (status published, version + 1), or 400 with
  // { errors: [{ field, panel_id, widget_id, message }] }. Mock rule: a dashboard without
  // panels is not ready, so the 400 path can be exercised locally.
  app.post(`${BASE_URL}/${UUID_PARAM}/publish`, (req, res) => {
    const dashboard = findDashboard(req.params.uuid);
    if (!dashboard) {
      return res.status(404).json({ detail: "Not found." });
    }
    if (!getPanels(dashboard).length) {
      return res.status(400).json({
        errors: [{ field: "definition.panels", panel_id: null, widget_id: null, message: "Add at least one panel before publishing." }]
      });
    }
    dashboard.status = "published";
    touch(dashboard);
    res.json(clone(dashboard));
  });

  app.get(`${BASE_URL}/${UUID_PARAM}/panels`, (req, res) => {
    const dashboard = findDashboard(req.params.uuid);
    if (!dashboard) {
      return res.status(404).json({ detail: "Not found." });
    }
    res.json({ version: dashboard.version, panels: clone(getPanels(dashboard)) });
  });

  // One endpoint for every panel change; `operation` decides what happens.
  app.post(`${BASE_URL}/${UUID_PARAM}/panels`, (req, res) => {
    const dashboard = findDashboard(req.params.uuid);
    if (!dashboard) {
      return res.status(404).json({ detail: "Not found." });
    }
    const body = req.body || {};
    const configuration = body.configuration || {};
    const panels = getPanels(dashboard);
    const index = panels.findIndex(p => p.id === body.panel_id);

    switch (body.operation) {
      case "add":
        panels.push({ ...configuration, id: `panel-${generateUUID().slice(0, 8)}` });
        break;
      case "edit":
        if (index === -1) {
          return res.status(400).json({ panel_id: ["Panel not found."] });
        }
        panels[index] = { ...panels[index], ...configuration, id: panels[index].id };
        break;
      case "duplicate":
        if (index === -1) {
          return res.status(400).json({ panel_id: ["Panel not found."] });
        }
        panels.splice(index + 1, 0, { ...clone(panels[index]), id: `panel-${generateUUID().slice(0, 8)}` });
        break;
      case "reorder": {
        const order = Array.isArray(configuration.panel_ids) ? configuration.panel_ids : [];
        panels.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
        break;
      }
      case "delete":
        if (index === -1) {
          return res.status(400).json({ panel_id: ["Panel not found."] });
        }
        panels.splice(index, 1);
        break;
      default:
        return res.status(400).json({ operation: ["Unknown operation."] });
    }

    touch(dashboard);
    res.status(body.operation === "add" ? 201 : 200).json(clone(dashboard));
  });

};
