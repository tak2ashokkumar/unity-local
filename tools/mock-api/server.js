const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;

const baseDir = path.join(__dirname);

app.use((req, res) => {

    let urlPath = req.path;

    // remove leading /
    urlPath = urlPath.replace(/^\/+/, "");

    // remove trailing /
    urlPath = urlPath.replace(/\/$/, "");

    // special mapping for uldbusers
    // if (urlPath === "customer/uldbusers") {
    //     urlPath = "customer/users/uldbusers";
    // }

    const filePath = path.join(baseDir, urlPath + ".json");

    if (fs.existsSync(filePath)) {

        const data = fs.readFileSync(filePath);
        res.json(JSON.parse(data));

    } else {
        res.status(404).json({
            error: "Mock API not found",
            request: req.path,
            expectedFile: filePath
        });
    }

});

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
}).on("error", err => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} already in use`);
  }
});