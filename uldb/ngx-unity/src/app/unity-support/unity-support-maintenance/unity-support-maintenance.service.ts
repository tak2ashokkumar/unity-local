import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { DELETE_MAINTENANCE_INSTANCE, GET_MAINTENANCE_INSTANCE } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UnitySupportMaintenanceService {

  constructor(private tableService: TableApiServiceService,
    private http: HttpClient) { }

  getInstances(criteria: SearchCriteria): Observable<PaginatedResult<MaintenanceInstance>> {
    return this.tableService.getData<PaginatedResult<MaintenanceInstance>>(GET_MAINTENANCE_INSTANCE(), criteria);
  }

  delete(userId: string) {
    return this.http.delete(DELETE_MAINTENANCE_INSTANCE(userId));
  }

  saveSettings(uuid: string, status: string) {
    return this.http.put(`/customer/mtp/mschedules/update_status/?maintenance=${uuid}`, { status: status });
  }

  convertToViewData(data: MaintenanceInstance[]): MaintenanceInstanceViewData[] {
    let viewData: MaintenanceInstanceViewData[] = [];
    data.map(a => {
      let ud: MaintenanceInstanceViewData = new MaintenanceInstanceViewData();
      ud.uuid = a.uuid;
      ud.name = a.name;
      ud.tenantName = a.tenant_name;
      ud.scheduleStart = a.schedule_start;
      ud.scheduleEnd = a.schedule_end;
      ud.description = a.description;
      ud.createdByName = a.created_by_name;
      ud.maintenanceStatus = a.maintenance_status;
      viewData.push(ud);
    });
    return viewData;
  }
}


export interface MaintenanceInstance {
  id: number;
  uuid: string;
  tenant: number;
  tenant_name: string;
  name: string;
  url: string;
  description: string;
  infrastructure_type: string;
  infrastructure: any[];
  status: null;
  has_alerts: boolean;
  has_notification: boolean;
  has_auto_ticketing: boolean;
  correlate_all_alerts: boolean;
  send_notification: boolean;
  send_before_window: boolean;
  send_after_window: boolean;
  user: null;
  user_group: null;
  additional_email: string[];
  timezone: null;
  schedule_type: string;
  start_date: string;
  schedule_start_time_hr: number;
  schedule_start_time_min: number;
  end_date: string;
  schedule_end_time_hr: number;
  schedule_end_time_min: number;
  ends_never: boolean;
  recurrence_pattern: null;
  daily_type: null;
  every_day_count: number;
  every_hr_count: number;
  weekday: null;
  monthly_type: null;
  custom_month_day: null;
  custom_month_occurs_every: null;
  occurs_every_month_day: null;
  occurs_every_month_weekday: null;
  colo_cloud: null;
  created_by: number;
  maintenance_status: boolean;
  created_at: string;
  created_by_name: string;
  schedule_start: string;
  schedule_end: string;
}

export class MaintenanceInstanceViewData {
  constructor() { }
  uuid: string;
  tenantName: string;
  name: string;
  scheduleStart: string;
  scheduleEnd: string;
  description: string;
  createdByName: string;
  maintenanceStatus: boolean;
}

