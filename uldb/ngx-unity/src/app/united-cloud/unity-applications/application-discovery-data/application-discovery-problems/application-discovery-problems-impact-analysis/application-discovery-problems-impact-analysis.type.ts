export interface ImpactAnalysisModel {
  summary: ImpactSummaryModel;
  ai_blast_radius_summary: AIBlastRadiusSummaryModel;
  business_service_impact: BusinessServiceImpactModel;
}

export interface ImpactSummaryModel {
  affected_frontend: number;
  affected_services: number;
  affected_infrastructure: number;
  affected_users: number;
  affected_sessions: number;
  events: number;
}

export interface AIBlastRadiusSummaryModel {
  impact_summary: string;
  blast_radius_severity: string;
}

export interface BusinessServiceImpactModel {
  affected_business_services: string[];
  business_impact: string[];
}

