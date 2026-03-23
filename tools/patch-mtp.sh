#!/bin/bash

TOOLS_DIR="$(cd "$(dirname "$0")" && pwd)"
export ROOT_DIR="$TOOLS_DIR/.."

echo "Patching ngx-mtp..."

"$TOOLS_DIR/node/node.exe" - <<'NODEEOF'

const fs   = require('fs');
const path = require('path');

const rootDir = process.env.ROOT_DIR;

// ── static-server.js ─────────────────────────────────────────────────────────

const ssPath = path.join(rootDir, 'uldb/ngx-mtp/static-server.js');
let ss = fs.readFileSync(ssPath, 'utf8');

if (ss.includes("argv['proxy-config']")) {
    console.log('[static-server.js] already patched, skipping.');
} else {
    // 1. Inject proxy config loader after logEnabled line
    ss = ss.replace(
        `const logEnabled = argv.log || false;`,
        `const logEnabled = argv.log || false;

// Load proxy rules from proxy.conf.json if provided
const proxyConfPath = argv['proxy-config'];
const proxyRules = proxyConfPath
    ? JSON.parse(fs.readFileSync(path.resolve(__dirname, proxyConfPath), 'utf8'))
    : {};`
    );

    // 2. Inject proxy handler right after finalhandler line in request handler
    const proxyHandler = `
    /**
     * Proxy — forward matching paths to target (from proxy.conf.json)
     */
    const matchedProxy = Object.keys(proxyRules).find(prefix => req.url.startsWith(prefix));
    if (matchedProxy) {
        const target = new URL(proxyRules[matchedProxy].target);
        const options = {
            hostname: target.hostname,
            port: target.port,
            path: req.url,
            method: req.method,
            headers: req.headers,
        };
        const proxy = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });
        proxy.on('error', (err) => {
            console.error(\`Proxy error for \${req.url}:\`, err.message);
            res.writeHead(502);
            res.end('Proxy error: ' + err.message);
        });
        req.pipe(proxy, { end: true });
        return;
    }
`;

    ss = ss.replace(
        `    const done = finalhandler(req, res);\n\n    const acceptEncoding`,
        `    const done = finalhandler(req, res);\n${proxyHandler}\n    const acceptEncoding`
    );

    fs.writeFileSync(ssPath, ss, 'utf8');
    console.log('[static-server.js] patched successfully.');
}

// ── package.json ─────────────────────────────────────────────────────────────

const pkgPath = path.join(rootDir, 'uldb/ngx-mtp/package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const PROXY_ARG = '--proxy-config=../../tools/proxy/proxy.conf.json';

if (pkg.scripts['static-server'].includes(PROXY_ARG)) {
    console.log('[package.json] already patched, skipping.');
} else {
    pkg.scripts['static-server'] += ' ' + PROXY_ARG;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log('[package.json] patched successfully.');
}

NODEEOF

echo "Done."
