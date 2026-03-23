import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

if (environment.production) {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const msg = String(args[0] ?? '');

    // if (msg.includes('google.maps.Marker is deprecated')) {
    //   return;
    // }

    if (msg.includes('Tracking Prevention blocked access to storage')) {
      return;
    }

    originalWarn.apply(console, args);
  };
}


