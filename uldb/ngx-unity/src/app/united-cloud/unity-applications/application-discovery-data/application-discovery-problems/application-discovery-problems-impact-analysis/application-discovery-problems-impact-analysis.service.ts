import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ImpactAnalysisModel } from './application-discovery-problems-impact-analysis.type';

@Injectable()
export class ApplicationDiscoveryProblemsImpactAnalysisService {

  constructor(private http: HttpClient) { }

  getAiImpactAnalysisData(appData: AppDataType, conditionId: string) {
    const payload = {
      app_id: appData?.appId?.toString(),
      customer_id: appData?.customerId?.toString(),
      session_id: this.generateSessionId(),
      condition_uuid: conditionId,
      message: "give me a impact report of all services of astronomy shop, try to create a blast radius to show how the topological neighbours are affected"
    };
    return this.http.post<any>('/aiapm/impact', payload);
  }

  convertToAiImpactAnalysisViewData(data: ImpactAnalysisModel): ImpactAnalysisViewData {

    const viewData = new ImpactAnalysisViewData();

    /* ================= SUMMARY ================= */
    const summary = new ImpactSummaryViewData();
    summary.affectedFrontend = data.summary.affected_frontend ?? null;
    summary.affectedServices = data.summary.affected_services ?? null;
    summary.affectedInfrastructure = data.summary.affected_infrastructure ?? null;
    summary.affectedUsers = data.summary.affected_users ?? null;
    summary.affectedSessions = data.summary.affected_sessions ?? null;
    summary.events = data.summary.events ?? null;
    viewData.summary = summary;
    /* ================= BLAST RADIUS ================= */
    const blastRadius = new AiBlastRadiusSummaryViewData();
    blastRadius.impactSummary = data.ai_blast_radius_summary?.impact_summary ?? 'N/A';
    blastRadius.blastRadiusSeverity = data.ai_blast_radius_summary?.blast_radius_severity ?? 'N/A';
    viewData.aiBlastRadiusSummary = blastRadius;
    /* ================= BUSINESS IMPACT ================= */
    const businessImpact = new BusinessServiceImpactViewData();
    businessImpact.affectedBusinessServices = data.business_service_impact?.affected_business_services ?? [];
    businessImpact.businessImpact = data.business_service_impact?.business_impact ?? [];
    viewData.businessServiceImpact = businessImpact;

    return viewData;
  }




  generateSessionId(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

}

export class ImpactAnalysisViewData {
  constructor() { };
  summary: ImpactSummaryViewData;
  aiBlastRadiusSummary: AiBlastRadiusSummaryViewData;
  businessServiceImpact: BusinessServiceImpactViewData;
}


export class ImpactSummaryViewData {
  constructor() { };
  affectedFrontend: number;
  affectedServices: number;
  affectedInfrastructure: number;
  affectedUsers: number;
  affectedSessions: number;
  events: number;
}


export class AiBlastRadiusSummaryViewData {
  constructor() { };
  impactSummary: string;
  blastRadiusSeverity: string;
}


export class BusinessServiceImpactViewData {
  constructor() { };
  affectedBusinessServices: string[];
  businessImpact: string[];
}

export interface AppDataType {
  appId: number;
  customerId: number;
}
