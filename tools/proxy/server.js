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

/* ADMIN PORTAL PROXY (Angular 1.x) */
const adminProxy = createProxyMiddleware({
  target: "http://localhost:8095",
  changeOrigin: true
});

/* ROUTER */
app.use((req, res, next) => {
  let isMockRequest = req.url.startsWith("/customer") ||
    req.url.startsWith("/rest") ||
    req.url.startsWith("/orchestration") ||
    req.url.startsWith("/chatbot") ||
    req.url.startsWith("/task") ||
    req.url.startsWith("/apm") ||
    req.url.startsWith("/func") ||
    req.url.startsWith("/mcp") ||
    req.url.startsWith("/ssr")

  if (isMockRequest) {
    console.log("→ MOCK:", req.url);
    return mockProxy(req, res, next);
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

app.listen(8091, () => {
  console.log("Proxy running at http://localhost:8091");
});