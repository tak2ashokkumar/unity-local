import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { WorldMapWidgetTenantsLocation } from './map-widget.type';
import { MTP_DASHBOARD_TENANT_MAP_API } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class MtpDashboardMapService {
  TILE_SIZE = 256;

  constructor(private http: HttpClient,
    private appService: AppLevelService) { }

  getWidgetTenants(): Observable<any[]> {
    return this.http.get<WorldMapWidgetTenantsLocation[]>(MTP_DASHBOARD_TENANT_MAP_API());
  }

  convertToViewdata(dcLocations: WorldMapWidgetTenantsLocation[]): WorldMapWidgetViewdata[] {
    let viewData: WorldMapWidgetViewdata[] = [];
    dcLocations.map(loc => {
      let data = new WorldMapWidgetViewdata();
      data.lat = loc.lat;
      data.long = loc.long;
      data.location = loc.location;
      data.tenants = loc.organization_names;
      viewData.push(data);
    });
    return viewData;
  }

  private getTenants(tenants: string[]) {
    let str = ``;
    tenants.map(tenant => {
      str = `${str}<div class="font-xs-sm">${tenant}</div>`;
    });
    return str;
  }

  createInfoWindowContent(data: WorldMapWidgetViewdata) {
    data.tenants.length
    let contentString = `<div id="${data.lat}_${data.long}" class="all_iw_content font-xs" style="min-width: 120px; max-width: 200px;">` +
      `<div>` +
      `<div style="font-weight:500;">${data.location}</div><br>` +
      `${this.getTenants(data.tenants)}` +
      `</div>` +
      `</div>`;
    return [contentString].join(`<br>`);
  }
}

export class WorldMapWidgetViewdata {
  constructor() { }
  lat: number;
  long: number;
  location: string;
  tenants: string[];
  locationStatus: string;
}