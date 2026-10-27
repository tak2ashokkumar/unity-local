import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LangfuseAgentsMetricsResponse } from '../token-billing-dashboard/token-billing-dashboard.types';

@Injectable()
export class TokenBillingAgentsService {

  constructor(private http: HttpClient) { }

  getAgentsMetrics(orgId: number | string, fromDate: string, toDate: string,
    agent?: string): Observable<LangfuseAgentsMetricsResponse> {
    let params = new HttpParams()
      .set('org_id', String(orgId))
      .set('from_date', fromDate)
      .set('to_date', toDate);
    if (agent) {
      params = params.set('agent', agent);
    }
    return this.http.get<LangfuseAgentsMetricsResponse>('mcp/langfuse/metrics/agents/', { params });
  }
}
