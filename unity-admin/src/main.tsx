import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

// IBM Plex Sans/Mono are bundled LOCALLY via @fontsource (the .woff2 files ship
// inside node_modules; Vite emits them into dist/assets and rewrites the CSS to
// local paths - so the built app serves its own fonts with NO runtime CDN call and
// works fully offline). Modern Vite natively resolves @fontsource packages.
import '@fontsource/ibm-plex-sans/300.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';

import './theme/tokens.css';
import './theme/global.css';

import App from './App';
import { ToastProvider } from './components/ui/Toast';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </HashRouter>
  </React.StrictMode>
);
