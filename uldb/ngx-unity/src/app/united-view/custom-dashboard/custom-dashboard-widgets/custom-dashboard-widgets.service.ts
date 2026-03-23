import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { WidgetViewData } from '../custom-dashboard.service';
import { WidgetDataType } from '../custom-dashboard.type';

@Injectable()
export class CustomDashboardWidgetsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,    
    private utilSvc: AppUtilityService) { }

  getWidgetsList(criteria: SearchCriteria): Observable<PaginatedResult<WidgetDataType>> {
    const params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<WidgetDataType>>(`customer/custom_widget/widget/`, { params: params });
  }

  convertToViewData(data: WidgetDataType[]): WidgetViewData[] {
    let viewData: WidgetViewData[] = [];
    data.map(d => {
      let a = new WidgetViewData();
      a.uuid = d.uuid;
      a.name = d.name;
      a.widgetType = this.getWidgetType(d.widget_type);
      a.groupBy = this.getWidgetGroupBy(d.group_by);
      a.createdBy = d.created_by ? d.created_by : 'NA';
      a.createdAt = d.created_at ? this.utilSvc.toUnityOneDateFormat(d.created_at) : 'NA';
      a.lastExecution = d.last_execution ? this.utilSvc.toUnityOneDateFormat(d.last_execution) : 'NA';
      a.status = d.status;
      viewData.push(a);
    })
    return viewData;
  }

  togglewidget(widgetId: string) {
    return this.http.get<Status>(`customer/custom_widget/widget/${widgetId}/toggle_feature/`);
  }

  deleteWidget(widgetId: string) {
    return this.http.delete(`customer/custom_widget/widget/${widgetId}/`);
  }

  
  getWidgetType(widgetType: string): string {
    switch (widgetType) {
      case 'host_availability': return 'Host Availability';
      case 'cloud': return 'Cloud';
      case 'infra_summary': return 'Infra Summary';
      case 'cloud_cost': return 'Cloud Cost';
      case 'alerts': return 'Alerts';
      case 'sustainability': return 'Sustainability';
      case 'metrices': return 'Metrices';
      case 'device_by_os': return 'Device By OS';
      default: return 'N/A';
    }
  }

  getWidgetGroupBy(groupBy: string): string {
    switch (groupBy) {
      case 'device_type': return 'Device Type';
      case 'datacenter': return 'Datacenter';
      case 'cloud_type': return 'Cloud';
      case 'status': return 'Status';
      case 'tags': return 'Tags';
      case 'locations': return 'Locations';      
      case 'regions': return 'Regions';
      case 'resource_types': return 'Resource Types';
      case 'account_name': return 'Account Name';
      case 'service': return 'Service';
      case 'alert_source': return 'Alert Source';
      case 'severity': return 'Severity';
      case 'top_10_cpu_hosts' : return 'Top 10 CPU Hosts';
      case 'top_10_memory_hosts': return 'Top 10 Memory Hosts';
      case 'top_10_storage_hosts': return 'Top 10 Storage Hosts';
      case 'top_10_network_traffic_hosts': return 'Top 10 Network Traffic Hosts';
      case 'os_type': return 'OS Type';
      case 'os_version': return 'OS Version';
      default: return 'N/A';
    }
  }
}

export interface Status {
  status: boolean;
}