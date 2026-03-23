import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private loadPromise?: Promise<void>;
  private loaded = false;
  private disabled = false;

  mapHidden = false;
  private available = false;

  constructor(private zone: NgZone) {
    this.listenToNetwork();
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

  private listenToNetwork() {
    window.addEventListener('online', () => {
      if (!this.loaded && !this.disabled) {
        console.info('[MapService] Back online – retrying map load');
        this.loadPromise = undefined;
        this.loadMap();
      }
    });
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
    console.log('in load map');
    if (this.loadPromise) return this.loadPromise;
    if (this.disabled) return Promise.resolve();
    if ((window as any).google?.maps?.importLibrary) {
      this.loaded = true;
      return Promise.resolve();
    }

    if (!navigator.onLine) {
      console.warn('[MapService] Offline – map deferred');
      this.disable();
      return Promise.resolve();
    }

    this.loadPromise = new Promise((resolve) => {
      const script = document.createElement('script');

      script.src =
        `https://maps.googleapis.com/maps/api/js` +
        `?key=${environment.gmk}` +
        `&v=weekly` +
        `&loading=async` +
        `&libraries=marker,places` +
        `&map_ids=${environment.gmId}`;

      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.zone.run(() => {
          this.loaded = true;
          resolve();
        });
      };

      script.onerror = () => {
        // console.error('[MapService] Google Maps load failed');
        this.disable();
        resolve(); // never reject
      };

      document.head.appendChild(script);
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