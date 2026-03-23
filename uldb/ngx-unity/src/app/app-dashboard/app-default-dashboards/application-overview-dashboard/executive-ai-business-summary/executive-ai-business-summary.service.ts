import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable()
export class ExecutiveAiBusinessSummaryService {

  constructor(private http: HttpClient) { }

  getExectiveAIBusinessSummary(appId: string, customerId: string): Observable<ExtendtedAIBusinessSummaryType> {
    const payload = {
      app_id: appId,
      customer_id: customerId,
      message: 'Get me a Exective Summary of the app',
      session_id: this.generateSessionId(),
    }
    return this.http.post<ExtendtedAIBusinessSummaryType>(`/aiapm/executive`, payload);
  }

  generateSessionId(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  convertToExecutiveAIBusinessSummaryViewData(data: ExtendtedAIBusinessSummaryResponseType): ExecutiveAIBusinnesSummaryViewData {
    let viewData: ExecutiveAIBusinnesSummaryViewData = new ExecutiveAIBusinnesSummaryViewData();

    let topKeyInsights: TopKeyInsightsViewData[] = [];
    data.top_key_insights.forEach(insight => {
      let topKeyInsight: TopKeyInsightsViewData = new TopKeyInsightsViewData();
      topKeyInsight.title = insight.title;
      topKeyInsight.summary = insight.summary;
      topKeyInsights.push(topKeyInsight);
    })
    viewData.topKeyInsights = topKeyInsights;

    let extendedInsights: ExtendedInsightsViewData[] = [];
    data.extended_insights.forEach(insight => {
      let extendedInsight: ExtendedInsightsViewData = new ExtendedInsightsViewData();
      extendedInsight.title = insight.title;
      extendedInsight.status = insight.status;
      extendedInsight.statusClass = this.getStatusClass(insight.status);
      extendedInsight.aiSummary = insight.ai_summary;
      extendedInsight.executiveWatchpoint = insight.executive_watchpoint;
      extendedInsights.push(extendedInsight);
    })
    viewData.extendedInsights = extendedInsights;

    return viewData;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'information':
        return 'text-primary badge-information';
      case 'warning':
        return 'text-warning badge-warning';
      case 'critical':
        return 'text-danger badge-critical';
      default:
        return '';
    }
  }

}

export class ExecutiveAIBusinnesSummaryViewData {
  constructor() { }
  topKeyInsights: TopKeyInsightsViewData[] = [];
  extendedInsights: ExtendedInsightsViewData[] = [];
}

export class TopKeyInsightsViewData {
  constructor() { }
  title: string;
  summary: string;
}

export class ExtendedInsightsViewData {
  constructor() { }
  title: string;
  status: string;
  statusClass: string;
  aiSummary: string;
  executiveWatchpoint: string;
}

export interface AppDataType {
  appId: number;
  customerId: number;
}

export interface ExtendtedAIBusinessSummaryType {
  session_id: string;
  response: ExtendtedAIBusinessSummaryResponseType;
}

export interface ExtendtedAIBusinessSummaryResponseType {
  top_key_insights: TopKeyInsightsType[];
  extended_insights: ExtendedInsightsType[];
}

export interface TopKeyInsightsType {
  title: string;
  summary: string;
}

export interface ExtendedInsightsType {
  title: string;
  status: string;
  ai_summary: string;
  executive_watchpoint: string;
}