// Mock routes for the existing Public Cloud resource APIs that need real filtering
// (the generic catch-all in server.js ignores these query params):
//   GET /customer/managed/<provider>/resources/
//       resource_type=<id>, account_uuid=<uuid> (repeatable), region (repeatable), search, page, page_size
//   GET /customer/managed/<provider>/resources/<uuid>/monitoring/items/
// provider: aws | azure | gcp | oci
//
// Data (never modified here):
//   customer/managed/<provider>/resources.json                       resource rows
//   customer/managed/<provider>/accounts/resource_count_by_type.json resource types (id -> name / service)
//   customer/managed/<provider>/resources/monitoring/items.json      Zabbix item templates per resource_type
// Only monitored resources (monitoring.configured and not disabled) return items.
// findItem() is also used by the Custom Dashboard chart / table mock (analyticsDashboards.js).

const fs = require("fs");
const path = require("path");

const PROVIDERS = ["aws", "azure", "gcp", "oci"];
const PROVIDER_PARAM = ":provider(aws|azure|gcp|oci)";
const MANAGED_DIR = path.join(__dirname, "..", "customer", "managed");
const DEFAULT_PAGE_SIZE = 10;

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function toList(data) {
  return Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []);
}

function toArray(value) {
  if (value === undefined || value === null || value === "") {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function getResources(provider) {
  return toList(readJson(path.join(MANAGED_DIR, provider, "resources.json"), []));
}

function getResourceTypes(provider) {
  return toList(readJson(path.join(MANAGED_DIR, provider, "accounts", "resource_count_by_type.json"), []));
}

function getItemTemplates(provider) {
  return readJson(path.join(MANAGED_DIR, provider, "resources", "monitoring", "items.json"), {});
}

function isMonitored(resource) {
  return !!resource && !!resource.monitoring && resource.monitoring.configured && resource.monitoring.enabled !== false;
}

// resource_type=<id> -> rows of that type's name (and service, when both rows and type have one).
function matchesResourceType(resource, type) {
  if (!type) {
    return false;
  }
  if (resource.resource_type !== type.name) {
    return false;
  }
  return !resource.service || !type.service || resource.service === type.service;
}

function buildPageUrl(req, page, pageSize) {
  const url = new URL(`${req.protocol}://${req.get("host")}${req.path}`);
  Object.keys(req.query).filter(k => k !== "page").forEach(k => toArray(req.query[k]).forEach(v => url.searchParams.append(k, v)));
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(pageSize));
  return url.toString();
}

// Same rule as server.js: a plain array unless the client asks for a page.
function paginate(req, list) {
  if (req.query.page === undefined && req.query.page_size === undefined) {
    return list;
  }
  const rawPageSize = Number(req.query.page_size);
  if (rawPageSize === 0) {
    return list;
  }
  const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? rawPageSize : DEFAULT_PAGE_SIZE;
  const rawPage = Number(req.query.page || 1);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const start = (page - 1) * pageSize;
  return {
    count: list.length,
    next: start + pageSize < list.length ? buildPageUrl(req, page + 1, pageSize) : null,
    previous: page > 1 ? buildPageUrl(req, page - 1, pageSize) : null,
    results: list.slice(start, start + pageSize)
  };
}

// item_id is stable per provider, resource position and template position. `unit` stays
// internal (the real items API does not return it).
function itemsForResource(provider, resource) {
  if (!isMonitored(resource)) {
    return [];
  }
  const index = getResources(provider).findIndex(r => r.uuid === resource.uuid);
  const offset = (PROVIDERS.indexOf(provider) + 1) * 100000;
  const templates = getItemTemplates(provider)[resource.resource_type] || [];
  return templates.map((t, i) => ({
    item_id: offset + (index + 1) * 100 + i + 1,
    name: t.name,
    key: t.key,
    value_type: String(t.value_type),
    unit: t.unit || ""
  }));
}

// Custom Dashboard metric -> { name, key, unit } of its Public Cloud item, or null.
// Public Cloud metrics carry device_type "<provider>:<resource type id>".
function findItem(metric) {
  const provider = String(metric.device_type || "").split(":")[0];
  if (!PROVIDERS.includes(provider)) {
    return null;
  }
  const resource = getResources(provider).find(r => r.uuid === metric.device_id);
  const item = itemsForResource(provider, resource).find(i => Number(i.item_id) === Number(metric.item_id));
  return item ? { name: item.name, key: item.key, unit: item.unit } : null;
}

module.exports = (app) => {

  app.get(`/customer/managed/${PROVIDER_PARAM}/resources`, (req, res) => {
    const provider = req.params.provider;
    const typeIds = toArray(req.query.resource_type).map(String);
    const accounts = toArray(req.query.account_uuid);
    const regions = toArray(req.query.region);
    const search = String(req.query.search || "").trim().toLowerCase();
    const types = getResourceTypes(provider).filter(t => typeIds.includes(String(t.id)));
    const list = getResources(provider).filter(r =>
      (!typeIds.length || types.some(t => matchesResourceType(r, t))) &&
      (!accounts.length || accounts.includes(r.account_uuid)) &&
      (!regions.length || regions.includes(r.region)) &&
      (!search || String(r.name).toLowerCase().includes(search)));
    res.json(paginate(req, list));
  });

  app.get(`/customer/managed/${PROVIDER_PARAM}/resources/:uuid/monitoring/items`, (req, res) => {
    const provider = req.params.provider;
    const resource = getResources(provider).find(r => r.uuid === req.params.uuid);
    if (!resource) {
      return res.status(404).json({ detail: "Not found." });
    }
    res.json(itemsForResource(provider, resource).map(({ unit, ...item }) => item));
  });

};

module.exports.findItem = findItem;
