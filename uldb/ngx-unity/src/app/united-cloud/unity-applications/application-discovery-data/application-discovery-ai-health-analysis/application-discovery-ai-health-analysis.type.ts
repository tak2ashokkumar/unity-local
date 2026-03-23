export interface AIHealthReportResponse {
  summary: AIHealthSummaryBlock;
  ai_health_summary: AIHealthOverview;
  service_health_breakdown: ServiceHealthBreakdown;
  impacted_services: ImpactedService[];
  impacted_infrastructure: ImpactedService[];
}


export interface AIHealthSummaryBlock {
  application: string;
  environment: string;
  time_window: string;
  last_ai_analysis: string;
}

export interface AIHealthOverview {
  overall_health: string;
  confidence: string;
  summary: string;
  ai_health_summary_percentage: string;
}

export interface ServiceHealthBreakdown {
  performance_health: HealthStatusDetail;
  error_health: HealthStatusDetail;
  availability: HealthStatusDetail;
  resource_utilization: HealthStatusDetail;
}

export interface HealthStatusDetail {
  status: string;
  description: string;
}

export interface ImpactedService {
  service_name: string;
  status: string;
}
