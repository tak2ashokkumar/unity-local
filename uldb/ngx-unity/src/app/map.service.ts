/// <reference types="google.maps" />

import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private readonly scriptLoadTimeout = 10000;
  private loadPromise?: Promise<boolean>;
  private loaded = false;
  private googleUnavailable = false;
  private mapWidgetsEnabled = !environment.DISABLE_WORLD_MAP;
  private mapVisibilityChangedSource = new Subject<boolean>();

  mapHidden = environment.DISABLE_WORLD_MAP || !navigator.onLine;
  mapVisibilityChanged$ = this.mapVisibilityChangedSource.asObservable();

  constructor(private zone: NgZone) {
    this.syncMapHidden();

    window.addEventListener('offline', () => {
      this.zone.run(() => {
        this.googleUnavailable = true;
        this.syncMapHidden();
      });
    });

    window.addEventListener('online', () => {
      this.zone.run(() => {
        this.googleUnavailable = false;
        this.syncMapHidden();
      });
    });
  }

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
    return this.mapHidden ? 'Enable Maps' : 'Disable Maps';
  }

  showToggle(): boolean {
    return !environment.production;;
  }

  toggleWorldMap(): void {
    this.mapHidden ? this.enableMaps() : this.disableMaps();
  }

  enableMaps(): void {
    if (!navigator.onLine) {
      this.syncMapHidden();
      return;
    }
    this.mapWidgetsEnabled = true;
    this.googleUnavailable = false;
    this.syncMapHidden();
  }

  disableMaps(): void {
    this.mapWidgetsEnabled = false;
    this.syncMapHidden();
  }

  canEnableMaps(): boolean {
    return navigator.onLine && !this.googleUnavailable;
  }

  shouldShowMapWidgets(): boolean {
    return !this.mapHidden;
  }

  isAvailable(): boolean {
    return this.loaded && !this.googleUnavailable;
  }

  async importMapsLibrary(): Promise<google.maps.MapsLibrary | null> {
    if (!(await this.loadMap())) return null;
    try {
      return await google.maps.importLibrary('maps') as google.maps.MapsLibrary;
    } catch {
      this.forceUnavailable();
      return null;
    }
  }

  async importMarkerLibrary(): Promise<google.maps.MarkerLibrary | null> {
    if (!(await this.loadMap())) return null;
    try {
      return await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;
    } catch {
      this.forceUnavailable();
      return null;
    }
  }

  async importPlacesLibrary(): Promise<google.maps.PlacesLibrary | null> {
    if (!(await this.loadGoogleApi())) return null;
    try {
      return await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
    } catch {
      this.forceUnavailable();
      return null;
    }
  }

  loadMap(): Promise<boolean> {
    this.syncMapHidden();
    if (this.mapHidden) return Promise.resolve(false);
    return this.loadGoogleApi();
  }

  createMarkerContent(loc: any): HTMLElement {
    const img = document.createElement('img');
    img.src = this.icons[loc.locationStatus];
    img.style.width = '32px';
    img.style.height = '32px';
    return img;
  }

  private loadGoogleApi(): Promise<boolean> {
    if (this.loadPromise) return this.loadPromise;
    const existingImportLibrary = (window as any).google?.maps?.importLibrary;
    if (existingImportLibrary && !existingImportLibrary.__unityLoaderStub) {
      this.loaded = true;
      this.googleUnavailable = false;
      this.syncMapHidden();
      return Promise.resolve(true);
    }

    if (!navigator.onLine) {
      this.forceUnavailable();
      return Promise.resolve(false);
    }

    this.loadPromise = new Promise<boolean>((resolve) => {
      const win = window as any;
      win.google = win.google || {};
      const maps = (win.google.maps = win.google.maps || {});
      const libraries = new Set<string>(['marker', 'places']);

      let scriptLoadPromise: Promise<void>;
      const loadScript = (): Promise<void> => scriptLoadPromise || (scriptLoadPromise = new Promise<void>((resolveScript, rejectScript) => {
        const params = new URLSearchParams({
          key: environment.gmk,
          v: 'weekly',
          libraries: [...libraries].join(','),
          map_ids: environment.gmId,
          callback: 'google.maps.__ib__',
        });
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
        script.async = true;

        const timeoutId = window.setTimeout(() => {
          scriptLoadPromise = undefined;
          rejectScript(new Error('Maps load timed out'));
        }, this.scriptLoadTimeout);

        maps.__ib__ = () => {
          window.clearTimeout(timeoutId);
          resolveScript();
        };
        script.onerror = () => {
          window.clearTimeout(timeoutId);
          scriptLoadPromise = undefined;
          rejectScript(new Error('Maps load failed'));
        };

        document.head.appendChild(script);
      }));

      maps.importLibrary = (library: string, ...args: any[]) =>
        libraries.add(library) && loadScript().then(() => (maps.importLibrary as Function)(library, ...args));
      maps.importLibrary.__unityLoaderStub = true;

      loadScript()
        .then(() => this.zone.run(() => {
          this.loaded = true;
          this.googleUnavailable = false;
          this.syncMapHidden();
          resolve(true);
        }))
        .catch(() => this.zone.run(() => {
          this.loadPromise = undefined;
          this.forceUnavailable();
          resolve(false);
        }));
    });

    return this.loadPromise;
  }

  private forceUnavailable(): void {
    this.googleUnavailable = true;
    this.loaded = false;
    this.syncMapHidden();
  }

  private syncMapHidden(): void {
    const wasHidden = this.mapHidden;
    this.mapHidden = !this.mapWidgetsEnabled || !navigator.onLine || this.googleUnavailable;
    if (wasHidden !== this.mapHidden) {
      this.mapVisibilityChangedSource.next(!this.mapHidden);
    }
  }
}
