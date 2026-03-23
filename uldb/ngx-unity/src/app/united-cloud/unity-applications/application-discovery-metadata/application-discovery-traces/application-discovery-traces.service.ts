import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { TraceRecord } from './application-discovery-traces.type';

@Injectable()
export class ApplicationDiscoveryTracesService {
  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private user: UserInfoService) { }

  getApplicationTraces(criteria: SearchCriteria, deviceId: string): Observable<PaginatedResult<TraceRecord>> {
    return this.tableService.getData<PaginatedResult<TraceRecord>>(`/apm/monitoring/traces/?uuid=${deviceId}`, criteria);
  }

  convertToViewData(data: TraceRecord[]): TraceRecordViewData[] {
    let viewData: TraceRecordViewData[] = [];
    data.map(s => {
      let a: TraceRecordViewData = new TraceRecordViewData();
      a.traceId = s.trace_id;
      a.spanId = s.span_id;
      a.serviceName = s.service_name;
      a.startTime = s.start_time ? this.utilSvc.toUnityOneDateFormat(s.start_time) : 'NA';
      a.endTime = s.end_time ? this.utilSvc.toUnityOneDateFormat(s.end_time) : 'NA';
      a.httpMethod = s.http_method;
      a.httpUrl = s.http_url;
      a.hostname = s.hostname;
      a.sdkLanguage = s.sdk_language;
      a.hostPort = s.host_port;
      a.userAgent = s.user_agent;
      a.status = this.utilSvc.getDeviceStatus(s.status.toString());
      a.statusCode = s.status_code;
      viewData.push(a);
    });
    return viewData;
  }
}

export class TraceRecordViewData {
  constructor() { };
  traceId: string;
  spanId: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  hostname: string;
  httpUrl: string;
  httpMethod: string;
  sdkLanguage: string;
  hostPort: string;
  userAgent: string;
  statusCode: string;
  status: string;
  statusIcon: string;
}