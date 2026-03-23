import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { LogEntryData } from './application-discovery-logs.type';

@Injectable()
export class ApplicationDiscoveryLogsService {
  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private user: UserInfoService) { }

  getApplicationLogs(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<LogEntryData>> {
    return this.tableService.getData<PaginatedResult<LogEntryData>>(`/apm/monitoring/grouped_logs/?uuid=${deviceId}`, criteria);
  }

  convertToViewData(data: LogEntryData[]): LogViewData[] {
    let viewData: LogViewData[] = [];
    data.map(s => {
      let a: LogViewData = new LogViewData();
      a.id = s.id;
      a.tenantId = s.tenant_id;
      a.hostname = s.hostname;
      a.traceId = s.trace_id;
      a.application = s.application;
      a.serviceName = s.service_name;
      a.message = s.message;
      a.httpRoute = s.http_route;
      a.filePath = s.file_path;
      a.statusCode = s.status_code;
      a.status = s.status;
      a.timestamp = s.timestamp? this.utilSvc.toUnityOneDateFormat(s.timestamp) : 'NA';;
      a.createdAt = s.created_at ? this.utilSvc.toUnityOneDateFormat(s.created_at) : 'NA';
      a.updatedAt = s.updated_at ? this.utilSvc.toUnityOneDateFormat(s.updated_at) : 'NA';
      if(s.status == "INFO"){
        a.statusIcon = 'text-primary fas fa-info-circle'
      }else if (s.status == "WARNING"){
        a.statusIcon = 'text-warning fas fa-exclamation-circle'
      } else{
        a.statusIcon = 'text-danger fas fa-exclamation-triangle'
      }
      viewData.push(a);
    });
    return viewData;
  }
}

export class LogViewData {
  constructor() { };
  id: number;
  hostname: string;
  application: string;
  timestamp: string;
  httpRoute: string;
  serviceName: string;
  tenantId: string;
  message: string;
  severity: string;
  traceId: string;
  spanId: string;
  filePath: string;
  functionName: string;
  lineNumber: number;
  flags: any;
  createdAt: string;
  updatedAt: string;
  app: number;
  statusCode: string;
  statusIcon: string;
  status: string;
}