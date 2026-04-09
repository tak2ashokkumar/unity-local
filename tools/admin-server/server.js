const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8095;

const STATIC_ROOT = path.resolve(__dirname, '../../uldb/static');
const APP_ROOT = path.join(STATIC_ROOT, 'rest/app');

// 1. Static file serving
app.use('/static', express.static(STATIC_ROOT));

// 2. Helper to find all JS files in rest/app
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      // Exclude 'client' directory to avoid duplicate directives and multiple definitions
      if (file !== 'client') {
        getFiles(name, fileList);
      }
    } else if (file.endsWith('.js') && !file.startsWith('.') && file !== 'clientApp.js') {
      // Convert to URL path
      const relativePath = path.relative(STATIC_ROOT, name).replace(/\\/g, '/');
      fileList.push('/static/' + relativePath);
    }
  });
  return fileList;
}

// 3. Endpoint to get script list for dynamic loading
app.get('/api/scripts', (req, res) => {
  try {
    const scripts = getFiles(APP_ROOT);
    res.json(scripts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Endpoint to get menu structure
app.get('/api/menu', (req, res) => {
    res.sendFile(path.join(__dirname, 'menu.json'));
});

// 4. Serve the launcher shell
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'launcher.html'));
});

// 5. Catch-all for SPA routing (admin app uses ngRoute/ui-router)
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'launcher.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Admin Portal Server (Angular 1.x) running at http://localhost:${PORT}/admin`);
  console.log(`Mapping /static to ${STATIC_ROOT}`);
});
