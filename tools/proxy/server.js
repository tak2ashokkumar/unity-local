const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

/* ---------- TEST ROUTE for PROXY WORKING ---------- */
app.get("/test", (req, res) => {
  console.log("Proxy server reached");
  res.send("Proxy working");
});

/* MOCK API PROXY */
const mockProxy = createProxyMiddleware({
  target: "http://localhost:3001",
  changeOrigin: true,
  logLevel: "debug"
});

/* UNITY UI PROXY */
const unityProxy = createProxyMiddleware({
  target: "http://localhost:8090",
  changeOrigin: true
});

/* ROUTER */
app.use((req, res, next) => {
  let isMockRequest = req.url.startsWith("/customer") ||
    req.url.startsWith("/rest") ||
     req.url.startsWith("/orchestration") ||
    req.url.startsWith("/chatbot") ||
    req.url.startsWith("/mcp") ||
    req.url.startsWith("/task")

  if (isMockRequest) {
    console.log("→ MOCK:", req.url);
    return mockProxy(req, res, next);
  }

  console.log("→ UNITY:", req.url);
  return unityProxy(req, res, next);

});

app.listen(8091, () => {
  console.log("Proxy running at http://localhost:8091");
});