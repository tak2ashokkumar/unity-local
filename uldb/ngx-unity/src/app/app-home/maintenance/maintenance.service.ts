import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { HttpClient } from '@angular/common/http';
import { CalendarEvent } from 'angular-calendar';
import { EventColor, EventAction } from 'calendar-utils';
import { GET_MSCHEDULES } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class MaintenanceService {

  constructor(private http: HttpClient) { }

  getMaintenanceSchedules(): Observable<PaginatedResult<MaintenanceSchedule>> {
    return this.http.get<PaginatedResult<MaintenanceSchedule>>(GET_MSCHEDULES());
  }

  convertToViewData(schedules: MaintenanceSchedule[]): CalendarEvent<MSViewData>[] {
    let viewData: CalendarEvent<MSViewData>[] = [];
    schedules.map((schedule: MaintenanceSchedule) => {
      let a: MSViewData = new MSViewData();
      a.title = schedule.description;
      a.start = new Date(schedule.start_date);
      a.end = schedule.end_date ? new Date(schedule.end_date) : null;
      a.status = schedule.status;
      a.dataCenter = schedule.colo_cloud.name;
      viewData.push(a);
    })
    return viewData;
  }
}

export class MSViewData {
  id?: string | number;
  start: Date;
  end?: Date;
  title: string;
  color?: EventColor;
  actions?: EventAction[];
  allDay?: boolean;
  cssClass?: string;
  status?: string;
  dataCenter?: string;
  constructor() { }
}
