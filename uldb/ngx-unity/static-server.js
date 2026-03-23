const http = require('http');
const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');
const chokidar = require('chokidar');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const mime = require('mime-types');

const host = argv.host || '127.0.0.1';
const port = argv.port || 8080;
const cors = argv.cors || false;
const dist = argv.dist || false;
const logEnabled = argv.log || false;

function log(message, ...args) {
    if (logEnabled) {
        console.log(message, args.join(', '));
    }
}

/**
 * Angular dist root
 */
const distRoot = path.resolve(__dirname, dist);
const serveDist = serveStatic(distRoot);

/**
 * Python static root
 */
const staticRoot = path.resolve(__dirname, '../static');
const servePythonStatic = serveStatic(staticRoot);

const server = http.createServer((req, res) => {
    const done = finalhandler(req, res);

    if (cors) {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    /**
     * 1️⃣ Python static — NO gzip, NO tricks
     */
    if (req.url.startsWith('/static/')) {
        req.url = req.url.replace('/static', '');
        return servePythonStatic(req, res, done);
    }

    /**
     * 2️⃣ Angular dist — gzip only here
     */
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const isGzipSupported = acceptEncoding.includes('gzip');

    if (
        isGzipSupported &&
        (req.url.endsWith('.js') || req.url.endsWith('.css'))
    ) {
        const filePath = path.join(distRoot, req.url);
        const gzFilePath = filePath + '.gz';

        fs.stat(gzFilePath, (err, stat) => {
            if (!err && stat.isFile()) {
                res.setHeader('Content-Encoding', 'gzip');

                const contentType = mime.contentType(path.extname(filePath));
                if (contentType) {
                    res.setHeader('Content-Type', contentType);
                }

                fs.createReadStream(gzFilePath).pipe(res);
            } else {
                serveDist(req, res, done);
            }
        });
    } else {
        serveDist(req, res, done);
    }
});

const wss = new WebSocket.Server({ server, path: '/ws' });

server.listen(port, host, function () {
    console.log(`Listening to ${host}:${port}`);
});

if (cors) {
    server.on('request', function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
    });
}

wss.on('connection', function (ws) {
    log('Browser connected via WebSocket');
    const watcher = chokidar.watch(dist || ".");
    watcher.on('change', function (path) {
        console.log("File change detected:", path);
        if (ws.readyState === WebSocket.OPEN) { // Check WebSocket readiness
            ws.send('reload'); // Send a 'reload' message to the connected browser
            watcher.close();
        }
    });
    ws.on('close', function () {
        log('Browser disconnected');
        watcher.close();
    });
});


//////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////

// const http = require('http');
// const finalhandler = require('finalhandler');
// const serveStatic = require('serve-static');
// const chokidar = require('chokidar');
// const WebSocket = require('ws');
// const fs = require('fs');
// const path = require('path');
// const argv = require('minimist')(process.argv.slice(2));
// const mime = require('mime-types');

// const host = argv.host || '0.0.0.0';
// const port = argv.port || 8090;
// const cors = argv.cors || false;
// const dist = argv.dist || false;
// const logEnabled = argv.log || false;

// function log(message, ...args) {
//     if (logEnabled) {
//         console.log(message, args.join(', ));
//     }
// }

// const serve = serveStatic(dist ? path.resolve(dist) : ".");


// const server = http.createServer(function (req, res) {
//     const done = finalhandler(req, res);

//     const filePath = dist ? path.join(path.resolve(dist), req.url) : path.join(".", req.url);

//     const gzFilePath = filePath + '.gz';

//     fs.stat(gzFilePath, function (err, stat) {
//         if (err || !stat.isFile()) {
//             // Serve the regular file if the .gz file doesn't exist
//             serve(req, res, done);
//         } else {

//             // Serve the gzipped file
//             res.setHeader('Content-Encoding', 'gzip');
//             const contentType = mime.contentType(path.extname(filePath));
//             if (contentType) {
//                 res.setHeader('Content-Type', contentType);
//             }
//             res.setHeader('Cache-Control', 'public, max-age=31536000');
//             res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
//             log('serving ', gzFilePath)
//             const raw = fs.createReadStream(gzFilePath);
//             raw.pipe(res);
//         }
//     });
// });

// const wss = new WebSocket.Server({ server, path: '/ws' });

// server.listen(8090, host, function () {
//     console.log(`Listening to ${host}:${port}`);
// });

// if (cors) {
//     server.on('request', function (req, res) {
//         res.setHeader('Access-Control-Allow-Origin', '*');
//     });
// } else {
//     server.on('request', function (req, res) {
//         const currentHost = req.headers.host;
//         res.setHeader('Access-Control-Allow-Origin', currentHost);
//     });
// }

// wss.on('connection', function (ws) {
//     log('Browser connected via WebSocket');
//     const watcher = chokidar.watch(dist || ".");
//     watcher.on('change', function (path) {
//         console.log("File change detected:", path);
//         if (ws.readyState === WebSocket.OPEN) { // Check WebSocket readiness
//             ws.send('reload'); // Send a 'reload' message to the connected browser
//             watcher.close();
//         }
//     });
//     ws.on('close', function () {
//         log('Browser disconnected');
//         watcher.close();
//     });
// });