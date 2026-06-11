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

  constructor(private zone: NgZone) {
    this.listenToNetwork();
  }

  loadMap(): Promise<void> {
    if (this.disabled) {
      return Promise.resolve();
    }

    if (this.loaded || (window as any).google?.maps) {
      this.loaded = true;
      return Promise.resolve();
    }

    if (!navigator.onLine) {
      console.warn('[MapService] Offline – map deferred');
      this.disable();
      return Promise.resolve();
    }

    if (!this.loadPromise) {
      this.loadPromise = new Promise((resolve) => {
        const script = document.createElement('script');

        script.src =
          `https://maps.googleapis.com/maps/api/js` +
          `?key=${environment.gmk}` +
          `&v=weekly` +
          `&loading=async` +
          `&map_ids=${environment.gmId}` +
          `&libraries=places`;

        script.async = true;
        script.defer = true;

        script.onload = () => {
          this.zone.run(() => {
            this.loaded = true;
            resolve();
          });
        };

        script.onerror = () => {
          console.error('[MapService] Google Maps load failed');
          this.disable();
          resolve(); // never reject
        };

        document.head.appendChild(script);
      });
    }

    return this.loadPromise;
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

  showToggle(): boolean {
    return this.disabled;
  }

  get action(): string {
    return this.mapHidden ? 'Enable Map' : 'Disable Map';
  }

  toggleWorldMap(): void {
    this.mapHidden = !this.mapHidden;
  }

  isAvailable(): boolean {
    return this.loaded && !this.disabled;
  }






  // mapHidden: boolean = false;
  // private isMapDisabled: boolean = false;

  // constructor(private httpClient: HttpClient) { }

  // loadMap() {
  //   return this.httpClient.jsonp(`https://maps.googleapis.com/maps/api/js?key=${environment.gmk}&v=weekly&map_ids=${environment.gmId}&libraries=places`,
  //     'callback').pipe(
  //       tap(() => {
  //         this.isMapDisabled = environment.DISABLE_WORLD_MAP;
  //         this.mapHidden = this.isMapDisabled;
  //       }),
  //       take(1)).toPromise();
  // }

  // showToggle() {
  //   return this.isMapDisabled;
  // }

  // get action() {
  //   if (this.mapHidden) {
  //     return 'Enable Map';
  //   }
  //   return 'Disable Map';
  // }

  // toggleWorldMap() {
  //   this.mapHidden = !this.mapHidden;
  // }
}
