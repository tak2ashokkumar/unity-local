import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CO2_EMITTED_BY_REGION, LOCATION_STATUS } from 'src/app/shared/api-endpoint.const';
import { WorldMapWidgetViewdata } from 'src/app/app-home/dashboard-map-widget/dashboard-map-widget.service';
import { WorldMapWidgetDatacenterLocation } from 'src/app/app-home/dashboard-map-widget/map-widget.type';

@Injectable()
export class SustainabilityMapService {

  constructor(private http: HttpClient) { }

  getCarbonEmmissionByRegion() {
    return this.http.get<CO2ByRegion>(CO2_EMITTED_BY_REGION());
    // return of({
    //   "North America": {
    //     "Lat": 46.41807682127991,
    //     "value": 0.1044,
    //     "Long": -103.27757721202734,
    //     "datacenters": [
    //       {
    //         "lat": 34.0522342,
    //         "datacenters": [
    //           {
    //             "co2_emmision": 0.1,
    //             "name": "UL-DC"
    //           },
    //           {
    //             "co2_emmision": 2,
    //             "name": "test DC"
    //           }
    //         ],
    //         "location": "LA, USA",
    //         "long": -118.2436849
    //       },
    //       {
    //         "lat": 37.7749295,
    //         "datacenters": [
    //           {
    //             "co2_emmision": 0.1,
    //             "name": "UL-Canada"
    //           }
    //         ],
    //         "location": "NY, USA",
    //         "long": -122.4194155
    //       }
    //     ]
    //   },
    //   "Asia": {
    //     "Lat": 3.869923726869109,
    //     "value": 0.1044,
    //     "Long": 104.49532923702185,
    //     "datacenters": [
    //       {
    //         "lat": 20.593684,
    //         "datacenters": [
    //           {
    //             "co2_emmision": 0.1,
    //             "name": "UL-DC"
    //           },
    //           {
    //             "co2_emmision": 2,
    //             "name": "test DC"
    //           }
    //         ],
    //         "location": "LA, USA",
    //         "long": 78.96288
    //       },
    //       {
    //         "lat": 13.865712025192353,
    //         "datacenters": [
    //           {
    //             "co2_emmision": 0.1,
    //             "name": "UL-Canada"
    //           }
    //         ],
    //         "location": "NY, USA",
    //         "long": 76.24862320445533
    //       }
    //     ]
    //   }
    // });
  }

  convertToViewdata(data: CO2ByRegion) {
    let arr: SustainabilityMapViewdata[] = [];
    let dataSum = 0;
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const element = <RegionCO2Values>data[key];
        dataSum += element.value;
        let view = new SustainabilityMapViewdata();
        view.region = key;
        view.location = new google.maps.LatLng(element.lat, element.long)
        view.co2 = element.value;
        view.datacenters = element.datacenters;
        arr.push(view);
      }
    }
    arr.forEach(view => view.percent = view.co2 * 100 / dataSum);
    return arr;
  }

  private getDatacenters(dcs: SustainabilityMapDatacenter[]) {
    let str = ``;
    dcs.map(dc => {
      str = `${str}<div style="font-weight:500; margin-top:5px;">${dc.name}</div>`;
    });
    return str;
  }

  createInfoWindowContent(data: DatacenterInRegion) {
    let contentString = `<div id="${data.lat}_${data.long}" class="all_iw_content font-xs" style="min-width: 120px; max-width: 200px;">` +
      `<div>` +
      `<div style="font-weight:500;">${data.location}</div><br>` +
      `${this.getDatacenters(data.centers)}` +
      `</div>` +
      `</div>`;
    return [contentString].join(`<br>`);
  }
}

export class SustainabilityMapViewdata {
  constructor() { }
  region: string;
  location: google.maps.LatLng;
  co2: number;
  percent: number;
  datacenters: DatacenterInRegion[];
}

export interface CO2ByRegion {
  [key: string]: RegionCO2Values;
}

export interface RegionCO2Values {
  lat: number;
  value: number;
  long: number;
  datacenters: DatacenterInRegion[];
}

export interface DatacenterInRegion {
  lat: number;
  centers: SustainabilityMapDatacenter[];
  location: string;
  long: number;
}

export interface SustainabilityMapDatacenter {
  co2_emmision: number;
  name: string;
}


export class SustainabilityMapDatacenterCluster {
  [key: string]: string[];
}

export interface UnitySustainabilityCO2Overlay extends google.maps.OverlayView {
  bound: google.maps.LatLng;
  hide(): void;
  show(): void;
  toggle(): void;
  toggleDOM(map: google.maps.Map): void;
}

/**
 * Factory function to create CO2 overlay instances lazily.
 * The class definition is inside this function to avoid evaluating
 * `google.maps.OverlayView` at module load time (before Maps API loads).
 */
export function createCO2Overlay(bound: google.maps.LatLng, percent: number): UnitySustainabilityCO2Overlay {
  const Overlay = class extends google.maps.OverlayView {
    bound: google.maps.LatLng;
    private percent: number;
    private div?: HTMLElement;
    private circleSize = 50;

    constructor() {
      super();
      this.bound = bound;
      this.percent = percent;
    }

    onAdd() {
      this.div = document.createElement('div');
      this.div.style.borderStyle = 'none';
      this.div.style.borderWidth = '0px';
      this.div.style.position = 'absolute';

      this.div.style.width = '1px';
      this.div.style.height = '1px';
      this.div.style.position = 'absolute';
      this.div.style['border-radius'] = '50%';
      this.div.style['background-color'] = getComputedStyle(document.documentElement).getPropertyValue(`--primary-400`);

      const panes = this.getPanes()!;
      panes.overlayMouseTarget.appendChild(this.div);
      google.maps.event.addDomListener(this.div, 'click', () => {
        google.maps.event.trigger(this, 'click');
      });
    }

    draw() {
      const overlayProjection = this.getProjection();
      const sw = overlayProjection.fromLatLngToDivPixel(this.bound)!;
      if (this.div) {
        let size = this.circleSize * (this.percent / 100);
        this.div.style.width = `${size}px`;
        this.div.style.height = `${size}px`;
        this.div.style.left = `${sw.x - (size / 2)}px`;
        this.div.style.top = `${sw.y - (size / 2)}px`;
      }
    }

    onRemove() {
      if (this.div) {
        (this.div.parentNode as HTMLElement).removeChild(this.div);
        delete this.div;
      }
    }

    hide() {
      if (this.div) {
        this.div.style.visibility = 'hidden';
      }
    }

    show() {
      if (this.div) {
        this.div.style.visibility = 'visible';
      }
    }

    toggle() {
      if (this.div) {
        if (this.div.style.visibility === 'hidden') {
          this.show();
        } else {
          this.hide();
        }
      }
    }

    toggleDOM(map: google.maps.Map) {
      if (this.getMap()) {
        this.setMap(null);
      } else {
        this.setMap(map);
      }
    }
  };
  return new Overlay();
}