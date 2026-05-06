export type UnifiedAiopsTone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

export interface UnifiedAiopsFilterOption {
  value: string;
  label: string;
}

export interface UnifiedAiopsCloudFilterOption extends UnifiedAiopsFilterOption {
  category: 'private' | 'public';
}

export interface UnifiedAiopsDashboardFilterCriteria {
  datacenters: string[];
  clouds: string[];
}

export interface UnifiedAiopsMetric {
  label: string;
  value: string;
  tone?: UnifiedAiopsTone;
  up?: string;
  down?: string;
  unknown?: string;
}

export interface UnifiedAiopsStackItem {
  name: string;
  values: number[];
}

export interface UnifiedAiopsAlertSource {
  name: string;
  count: number;
  logoPath: string;
  logoWidth: number;
  logoHeight: number;
  color: string;
}

export interface UnifiedAiopsHeatmapGroup {
  name: string;
  color: string;
  labelX: number;
  labelY: number;
  children: UnifiedAiopsHeatmapItem[];
}

export interface UnifiedAiopsHeatmapItem {
  name: string;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  usage?: string;
}

export interface UnifiedAiopsLegendMetric {
  icon: string;
  value: string;
  tone: UnifiedAiopsTone;
}

export interface UnifiedAiopsBusinessService {
  serviceName: string;
  status: UnifiedAiopsTone;
  uptime: string;
  degraded: string;
  alerts: string;
  alertTone: UnifiedAiopsTone;
}

export interface UnifiedAiopsCoverageCard {
  title: string;
  rows: UnifiedAiopsCoverageRow[];
  totalResources?: string;
}

export interface UnifiedAiopsCoverageRow {
  label: string;
  value: string;
}

export interface UnifiedAiopsTableRow {
  name: string;
  throughput?: string;
  availability?: string;
  responseTime?: string;
  count?: string;
  eolDate?: string;
  queries?: string;
  status?: UnifiedAiopsTone;
}

export interface UnifiedAiopsAlertRow {
  id: string;
  deviceName: string;
  severity: 'critical' | 'high';
  description: string;
  source: string;
  acknowledged: string;
  duration: string;
}

export interface UnifiedAiopsTicketRow {
  ticketId: string;
  shortDescription: string;
  state: string;
  priority: string;
  createdOn: string;
  updatedOn: string;
  resolution: string;
}

export interface UnifiedAiopsRemediationMetric {
  label: string;
  value: string;
  tone?: UnifiedAiopsTone;
}
