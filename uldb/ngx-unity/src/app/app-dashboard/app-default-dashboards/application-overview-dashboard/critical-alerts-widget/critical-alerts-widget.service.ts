import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class CriticalAlertsWidgetService {

  constructor(private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getAlertsData(criteria: SearchCriteria, appId: number): Observable<PaginatedResult<AlertData>> {
    return this.tableService.getData<PaginatedResult<AlertData>>(`apm/business_summary/top_business_events/?app_id=${appId}`, criteria);
  }

  convertToCriticalAlertsData(data: AlertData[]): AlertViewData[] {
    let viewData: AlertViewData[] = [];
    data.map(s => {
      let a: AlertViewData = new AlertViewData();
      a.id = s.id;
      a.deviceName = s.device_name;
      a.description = s.description;
      a.source = s.source;
      a.isAck = s.is_ack ? 'Yes' : 'No';
      if (s.status == 1) {
        a.icon = 'fa fa-check-circle text-success';
        a.tooltipMessage = 'Up';
      }
      else if (s.status == -1 || !s.status) {
        a.icon = 'fa fa-exclamation-circle text-warning';
        a.tooltipMessage = 'Unknown';
      } else {
        a.icon = 'fa fa-exclamation-triangle text-danger';
        a.tooltipMessage = 'Down';
      }
      // a.status = s.status;

      viewData.push(a);
    });
    return viewData;
  }
}

interface AlertData {
  event_type: string;
  affected_component: string | null;
  is_ack: boolean;
  device_type: string;
  ack_by: string | null;
  source_account_name: string;
  recovered_datetime: string | null;
  supressRule: any[]; // Array of rules, type can be refined if needed
  id: number;
  event_datetime: string;
  category: string;
  ack_time: string | null;
  uuid: string;
  source: number;
  event_id: string;
  affected_component_type: string | null;
  executed_at: string | null;
  environment: string | null;
  application: number;
  ack_comment: string | null;
  device_id: number;
  anomaly: boolean;
  status: number;
  description: string;
  event_metric: any | null;
  trigger_id: string | null;
  operational_data: any | null;
  supress: boolean;
  content_type: number;
  ip_address: string;
  severity: number;
  customer: number;
  affected_component_name: string | null;
  device_name: string;
  category_meta: any | null;
  custom_data: any | null;
  application_name: string;
}


export class AlertViewData {
  constructor() { };
  eventType: string;
  affectedComponent: string | null;
  isAck: string;
  deviceType: string;
  ackBy: string | null;
  sourceAccountName: string;
  recoveredDatetime: string | null;
  supressRule: any[]; // Array of rules, you can replace `any` with a more specific type if needed
  id: number;
  eventDatetime: string;
  category: string;
  ackTime: string | null;
  uuid: string;
  source: number;
  eventId: string;
  affectedComponentType: string | null;
  executedAt: string | null;
  environment: string | null;
  application: number;
  ackComment: string | null;
  deviceId: number;
  anomaly: boolean;
  status: number;
  description: string;
  eventMetric: any | null; // Replace with a more specific type if needed
  triggerId: string | null;
  operationalData: any | null; // Replace with a more specific type if needed
  supress: boolean;
  contentType: number;
  ipAddress: string;
  severity: number;
  customer: number;
  affectedComponentName: string | null;
  deviceName: string;
  categoryMeta: any | null; // Replace with a more specific type if needed
  customData: any | null; // Replace with a more specific type if needed
  applicationName: string;
  icon: string;
  tooltipMessage: string;
}

