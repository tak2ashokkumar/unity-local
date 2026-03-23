import { Injectable } from '@angular/core';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { Observable, of } from 'rxjs';
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

  private getIcon = (status: MapWidgetStatus) => {
    switch (status) {
      case MapWidgetStatus.UP:
        return `<i class="fas fa-check" style="color: ${getComputedStyle(document.documentElement).getPropertyValue('--success')}; float: right;"></i>`;
      case MapWidgetStatus.PARTIALLY_UP:
        return `<i class="fas fa-exclamation-triangle" style="color: ${getComputedStyle(document.documentElement).getPropertyValue('--warning')}; float: right;"></i>`;
      case MapWidgetStatus.DOWN:
        return `<i class="fas fa-exclamation-triangle" style="color: ${getComputedStyle(document.documentElement).getPropertyValue('--danger')}; float: right;"></i>`;
      case MapWidgetStatus.NA:
        return `<i class="fas fa-exclamation-triangle" style="color: ${getComputedStyle(document.documentElement).getPropertyValue('--secondary')}; float: right;"></i>`;
    }
  }

  private getCategories = (data: WorldMapWidgetDCStatus[]) => {
    let str = ``;
    if (data) {
      data.map(status => {
        str = `${str}<span style="width:100%; display:inline-block">${status.category}` +
          `${this.getIcon(status.status)}</span>`;
      });
    } else {
      str = `${str}<span style="width:100%; display:inline-block"><i class="fa fa-spinner fa-spin"></i></span>`;
    }
    return str;
  }

  private getDatacenters(dcs: WorldMapWidgetDatacenter[]) {
    let str = ``;
    dcs.map(dc => {
      str = `${str}<a style="font-weight:500; margin-top:5px;" href="/main#/unitycloud/datacenter/${dc.uuid}">${dc.name}</a>` +
        `${this.getCategories(dc.status)}`;
    });
    return str;
  }

  createInfoWindowContent(data: WorldMapWidgetViewdata) {
    data.datacenters.length
    let contentString = `<div id="${data.lat}_${data.long}" class="all_iw_content font-xs" style="min-width: 120px; max-width: 200px;">` +
      `<div>` +
      `<div style="font-weight:500;">${data.location}</div><br>` +
      `${this.getDatacenters(data.datacenters)}` +
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
  datacenters: WorldMapWidgetDatacenter[];
  locationStatus: string;
}

export class WorldMapWidgetDCMap{
  [key: string]: string[];
}