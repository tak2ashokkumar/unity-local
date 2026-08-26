import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { Subject } from 'rxjs';
import { GET_AIOPS_CONDITIONS_SUMMARY } from 'src/app/shared/api-endpoint.const';
import { CUSTOM_DATE_FILTER_DATE_FORMAT, CustomDateFilterPeriod, getCustomDateFilterRange } from 'src/app/shared/custom-date-filter/custom-date-filter.type';
import { AIMLConditionsSummary } from './aiml-conditions/aiml-conditions.type';

@Injectable()
export class AimlEventMgmtService {
  private readonly dateFormat = CUSTOM_DATE_FILTER_DATE_FORMAT;
  private readonly dateRangeParamsSource = new Subject<AIMLEventMgmtDateRangeParams>();
  private dateRangeParams: AIMLEventMgmtDateRangeParams = this.getDateRangeParamsByPeriod(CustomDateFilterPeriod.THIRTY_DAYS);
  readonly dateRangeParams$ = this.dateRangeParamsSource.asObservable();

  constructor(private http: HttpClient) { }

  getConditionsSummary(dateRangeParams?: AIMLEventMgmtDateRangeParams) {
    const params = this.appendDateRangeParams(new HttpParams(), dateRangeParams);
    return this.http.get<AIMLConditionsSummary>(GET_AIOPS_CONDITIONS_SUMMARY(), { params: params });
  }

  setDateRangeParams(dateRangeParams: AIMLEventMgmtDateRangeParams): void {
    this.dateRangeParams = {
      startDate: dateRangeParams?.startDate || null,
      endDate: dateRangeParams?.endDate || null
    };
    this.dateRangeParamsSource.next(this.getDateRangeParams());
  }

  getDateRangeParams(): AIMLEventMgmtDateRangeParams {
    return Object.assign({}, this.dateRangeParams);
  }

  appendDateRangeParams(params?: HttpParams | null, dateRangeParams?: AIMLEventMgmtDateRangeParams): HttpParams {
    let requestParams = params || new HttpParams();
    const selectedDateRangeParams = dateRangeParams || this.dateRangeParams;
    const startDate = selectedDateRangeParams?.startDate;
    const endDate = selectedDateRangeParams?.endDate;
    if (this.isValidDateParam(startDate) && this.isValidDateParam(endDate)) {
      requestParams = requestParams.set('start_date', startDate);
      requestParams = requestParams.set('end_date', endDate);
    }
    return requestParams;
  }

  hasValidDateRangeParams(dateRangeParams?: AIMLEventMgmtDateRangeParams | null): dateRangeParams is AIMLEventMgmtValidDateRangeParams {
    return this.isValidDateParam(dateRangeParams?.startDate) && this.isValidDateParam(dateRangeParams?.endDate);
  }

  convertToViewData(data: AIMLConditionsSummary): AIMLEventMgmtViewData {
    let a: AIMLEventMgmtViewData = new AIMLEventMgmtViewData();
    a.events = data.total.event_count;
    a.alerts = data.total.alert_count;
    a.conditions = data.total.condition_count;
    a.noiseReductionPercentage = data.total.noise_reduction;
    a.correlationPercentage = data.total.correlation_reduction;
    a.eventReductionPercentage = data.total.event_count ? Math.round(((data.total.event_count - data.total.condition_count) / data.total.event_count) * 100) : 0;
    return a;
  }

  private isValidDateParam(value?: string | null): value is string {
    return typeof value === 'string' && moment(value, this.dateFormat, true).isValid();
  }

  private getDateRangeParamsByPeriod(period: CustomDateFilterPeriod): AIMLEventMgmtDateRangeParams {
    const dateRange = getCustomDateFilterRange(period);
    return {
      startDate: dateRange?.from || null,
      endDate: dateRange?.to || null
    };
  }
}

export class AIMLEventMgmtViewData {
  constructor() { }
  events: number = 0;
  alerts: number = 0;
  conditions: number = 0;
  noiseReductionPercentage: number = 0;
  correlationPercentage: number = 0;
  eventReductionPercentage: number = 0;
}

export interface AIMLEventMgmtDateRangeParams {
  startDate?: string | null;
  endDate?: string | null;
}

export interface AIMLEventMgmtValidDateRangeParams {
  startDate: string;
  endDate: string;
}
