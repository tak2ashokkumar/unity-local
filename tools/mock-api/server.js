const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;

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

if (fs.existsSync(celeryDir)) {
  fs.readdirSync(celeryDir).forEach(file => {
    if (file.endsWith(".js")) {
      require(path.join(celeryDir, file))(app);
    }
  });
}

app.use((req, res) => {

  const normalizedUrlPath = req.path
    .replace(/^\/+/g, "")
    .replace(/\/+$/, "")
    .replace(/\/+/g, "/");

  const exactFilePath = path.join(baseDir, normalizedUrlPath + ".json");
  const uuidMatch = normalizedUrlPath.match(/^(.*)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);

  const loadMockFile = filePath => {
    const raw = fs.readFileSync(filePath, "utf8");
    const rewritten = raw.replace(/https:\/\/unity\.unitedlayer\.com/g, `http://localhost:${PORT}`);
    return JSON.parse(rewritten);
  };

  const sendMockResponse = parsed => {
    if (Array.isArray(parsed)) {
      return res.json(paginateArray(req, parsed));
    }
    return res.json(parsed);
  };

  if (fs.existsSync(exactFilePath)) {
    return sendMockResponse(loadMockFile(exactFilePath));
  }

  if (uuidMatch) {
    const parentUrlPath = uuidMatch[1];
    const requestedUuid = uuidMatch[2];
    const parentFilePath = path.join(baseDir, parentUrlPath + ".json");

    if (fs.existsSync(parentFilePath)) {
      const parsed = loadMockFile(parentFilePath);
      const findItem = array => array.find(item => item && (item.uuid === requestedUuid || String(item.id) === requestedUuid));
      let item = null;

      if (Array.isArray(parsed)) {
        item = findItem(parsed);
      } else if (parsed && Array.isArray(parsed.results)) {
        item = findItem(parsed.results);
      }

      if (item) {
        return res.json(item);
      }
    }

    const dir = path.dirname(exactFilePath);
    fs.mkdirSync(dir, { recursive: true });

    const placeholder = {
      id: null,
      uuid: requestedUuid
    };

    fs.writeFileSync(exactFilePath, JSON.stringify(placeholder, null, 2));
    console.log(`\n⚠ Mock detail file created for ${req.path}:`);
    console.log(exactFilePath);
    console.log("Edit this file to add the object details.\n");
    return res.json(placeholder);
  }

  const filePath = path.join(baseDir, normalizedUrlPath + ".json");
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