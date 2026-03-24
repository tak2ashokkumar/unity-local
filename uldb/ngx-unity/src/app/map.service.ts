import { Injectable, NgZone } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private loadPromise?: Promise<void>;
  private loaded = false;
  private disabled = false;

  mapHidden = false;

  constructor(private zone: NgZone) { }

  get iconBase(): string {
    return `https://maps.google.com/mapfiles/ms/icons/`;
  }

  get icons(): { up: string, down: string, 'partially-up': string } {
    return {
      'up': `${this.iconBase}green-dot.png`,
      'down': `${this.iconBase}red-dot.png`,
      'partially-up': `${this.iconBase}orange-dot.png`
    };
  }

  get action(): string {
    return this.mapHidden ? 'Enable Map' : 'Disable Map';
  }

  showToggle(): boolean {
    return this.disabled;
  }

  toggleWorldMap(): void {
    this.mapHidden = !this.mapHidden;
  }

  isAvailable(): boolean {
    return this.loaded && !this.disabled;
  }

  private disable() {
    this.disabled = true;
    this.mapHidden = true;
  }

  async importMapsLibrary() {
    return await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
  }

  async importMarkerLibrary() {
    return await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
  }

  loadMap(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;
    if (this.disabled) return Promise.resolve();
    if ((window as any).google?.maps?.importLibrary) {
      this.loaded = true;
      return Promise.resolve();
    }

    if (!navigator.onLine) {
      this.disable();
      return Promise.resolve();
    }

    this.loadPromise = new Promise<void>((resolve) => {
      // Google Maps official bootstrap loader pattern:
      // Pre-set importLibrary as a stub so the SDK detects it and skips
      // the "loaded directly without loading=async" warning.
      // Uses callback=google.maps.__ib__ — the SDK replaces the stub with
      // the real importLibrary when it calls __ib__ after initialization.
      const win = window as any;
      win.google = win.google || {};
      const d = (win.google.maps = win.google.maps || {});
      const r = new Set<string>(['marker', 'places']);

      let h: Promise<void>;
      const u = (): Promise<void> => h || (h = new Promise<void>((f, n) => {
        const params = new URLSearchParams({
          key: environment.gmk,
          v: 'weekly',
          libraries: [...r].join(','),
          map_ids: environment.gmId,
          callback: 'google.maps.__ib__',
        });
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
        d.__ib__ = f;
        script.onerror = () => { h = undefined; n(new Error('Maps load failed')); };
        document.head.appendChild(script);
      }));

      d.importLibrary = (lib: string, ...args: any[]) =>
        r.add(lib) && u().then(() => (d.importLibrary as Function)(lib, ...args));

      u()
        .then(() => this.zone.run(() => { this.loaded = true; resolve(); }))
        .catch(() => { this.disable(); resolve(); });
    });

    return this.loadPromise;
  }

  createMarkerContent(loc: any): HTMLElement {
    const img = document.createElement('img');
    img.src = this.icons[loc.locationStatus];
    img.style.width = '32px';
    img.style.height = '32px';
    img.style.transform = 'translate(-50%, -50%)';
    return img;
  }
}