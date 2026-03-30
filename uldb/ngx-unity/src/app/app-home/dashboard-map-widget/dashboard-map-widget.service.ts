import { Injectable } from '@angular/core';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { SYNC_DATACENTER_STATUS, LOCATION_STATUS } from 'src/app/shared/api-endpoint.const';
import { WorldMapWidgetDatacenterLocation, WorldMapWidgetDatacenter, WorldMapWidgetDCStatus, MapWidgetStatus } from './map-widget.type';

@Injectable()
export class DashboardMapWidgetService {
  TILE_SIZE = 256;

  constructor(private http: HttpClient,
    private appService: AppLevelService) { }

  syncDatacenterSatus(): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(SYNC_DATACENTER_STATUS())
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 6, 100).pipe(take(1))), take(1));
  }

  getDatacenterSatus(): Observable<any[]> {
    return this.http.get<WorldMapWidgetDatacenterLocation[]>(LOCATION_STATUS());
  }

  convertToViewdata(dcLocations: WorldMapWidgetDatacenterLocation[]): WorldMapWidgetViewdata[] {
    let viewData: WorldMapWidgetViewdata[] = [];
    dcLocations.map(loc => {
      let data = new WorldMapWidgetViewdata();
      data.lat = loc.lat;
      data.long = loc.long;
      data.location = loc.location;
      data.locationStatus = loc.loc_status;
      data.datacenters = loc.datacenters;
      viewData.push(data);
    });
    return viewData;
  }

  private getStatusDot = (status: MapWidgetStatus): string => {
    const bg: Record<MapWidgetStatus, string> = {
      [MapWidgetStatus.UP]:           '#1aad52',
      [MapWidgetStatus.PARTIALLY_UP]: '#f59e0b',
      [MapWidgetStatus.DOWN]:         '#ef4444',
      [MapWidgetStatus.NA]:           '#9ca3af',
    };
    const color = bg[status] ?? bg[MapWidgetStatus.NA];
    return `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:4px;background:${color};"></span>`;
  }

  private getCategories = (data: WorldMapWidgetDCStatus[]): string => {
    if (!data) return `<div style="color:#9ca3af;font-size:11px;margin-top:2px;"><i class="fa fa-spinner fa-spin"></i> Loading…</div>`;
    return data.map(s =>
      `<div style="display:flex;align-items:flex-start;gap:5px;margin-top:3px;">${this.getStatusDot(s.status)}<span style="font-size:11px;color:#6b7280;line-height:1.4;">${s.category}</span></div>`
    ).join('');
  }

  private getDatacenters(dcs: WorldMapWidgetDatacenter[]): string {
    return dcs.map((dc, i) =>
      `<div style="${i > 0 ? 'margin-top:8px;padding-top:8px;border-top:1px solid #f0f0f0;' : ''}">`
      + `<a href="/main#/unitycloud/datacenter/${dc.uuid}" style="font-size:12px;font-weight:600;color:#1a73e8;text-decoration:none;display:block;margin-bottom:3px;line-height:1.3;">${dc.name}</a>`
      + this.getCategories(dc.status)
      + `</div>`
    ).join('');
  }

  createInfoWindowContent(data: WorldMapWidgetViewdata): string {
    const locPin = `<svg width="11" height="13" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" fill="#5f6368"/><circle cx="6" cy="5" r="2" fill="#fff"/></svg>`;
    return `<div id="${data.lat}_${data.long}" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;width:240px;background:#fff;color:#1f2937;line-height:1;"><div style="padding:8px 12px 7px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:5px;">${locPin}<span style="font-size:11px;font-weight:500;color:#5f6368;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${data.location}</span></div><div style="padding:8px 12px 10px;">${this.getDatacenters(data.datacenters)}</div></div>`;
  }
}
export class WorldMapWidgetViewdata {
  constructor() { }
  lat: number;
  long: number;
  location: string;
  datacenters: WorldMapWidgetDatacenter[];
  locationStatus: string;
}

export class WorldMapWidgetDCMap{
  [key: string]: string[];
}