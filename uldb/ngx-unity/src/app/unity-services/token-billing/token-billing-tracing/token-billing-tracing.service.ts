import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LangfuseDashboardResponse, RequestBreakdown, TokenBillingParams } from '../token-billing-dashboard/token-billing-dashboard.types';

@Injectable()
export class TokenBillingTracingService {

  constructor(private http: HttpClient) { }

  getTracingData(params: TokenBillingParams): Observable<RequestBreakdown[]> {
    let httpParams = new HttpParams().set('org_id', String(params.orgId));
    if (params.userId != null) httpParams = httpParams.set('user_id', String(params.userId));
    if (params.fromDate)       httpParams = httpParams.set('from_date', params.fromDate);
    if (params.toDate)         httpParams = httpParams.set('to_date', params.toDate);
    return this.http
      .get<any>('mcp/billing/analytics-dashboard/', { params: httpParams })
      .pipe(map(res => {
        const data: LangfuseDashboardResponse = res?.analytics || res || {};
        return (data.request_breakdown || []).map(r => ({ ...r, isExpanded: false }));
      }));
  }

  formatCost(val: number | null | undefined): string {
    return val != null ? val.toFixed(6) : '0.000000';
  }
}
