const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;

const baseDir = path.join(__dirname);
const celeryDir = path.join(__dirname, "celery");

if (fs.existsSync(celeryDir)) {
  fs.readdirSync(celeryDir).forEach(file => {
    if (file.endsWith(".js")) {
      require(path.join(celeryDir, file))(app);
    }
  });
}

app.use((req, res) => {

  let urlPath = req.path;
  // remove leading slash
  urlPath = urlPath.replace(/^\/+/, "");
  // remove trailing slash
  urlPath = urlPath.replace(/\/$/, "");
  // remove UUIDs (colo_cloud ids etc)
  urlPath = urlPath.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    ""
  );
  // remove double slashes if created
  urlPath = urlPath.replace(/\/+/g, "/");
  // remove trailing slash again
  urlPath = urlPath.replace(/\/$/, "");

  const filePath = path.join(baseDir, urlPath + ".json");

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    res.json(JSON.parse(data));
  } else {
    // res.status(404).json({
    //   error: "Mock API not found",
    //   request: req.path,
    //   expectedFile: filePath
    // });
    const dir = path.dirname(filePath);

    fs.mkdirSync(dir, { recursive: true });

    const template = {
        message: "Auto-generated mock file",
        endpoint: req.path,
        method: req.method,
        query: req.query,
        body: req.body || {},
        data: []
    };

    fs.writeFileSync(filePath, JSON.stringify(template, null, 2));

    console.log("\n⚠ Mock file created:");
    console.log(filePath);
    console.log("Edit this file to add mock data.\n");

    return res.json(template);
  }
});

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
}).on("error", err => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} already in use`);
  }
});