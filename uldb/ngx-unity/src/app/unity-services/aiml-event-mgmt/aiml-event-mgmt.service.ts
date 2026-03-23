import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GET_AIOPS_CONDITIONS_SUMMARY } from 'src/app/shared/api-endpoint.const';
import { AIMLConditionsSummary } from './aiml-conditions/aiml-conditions.type';

@Injectable()
export class AimlEventMgmtService {

  constructor(private http: HttpClient) { }

  getConditionsSummary() {
    return this.http.get<AIMLConditionsSummary>(GET_AIOPS_CONDITIONS_SUMMARY());
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
