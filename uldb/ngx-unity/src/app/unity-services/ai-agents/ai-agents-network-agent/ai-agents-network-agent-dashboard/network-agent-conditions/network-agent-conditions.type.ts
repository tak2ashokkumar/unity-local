export interface NetworkAgentConditionsSummaryType {
  firewall: number;
  load_balancer: number;
  switch: number;
  total: NetworkAgentCondtionSummaryTotalType;
}

export interface NetworkAgentCondtionSummaryTotalType {
  condition_count: number;
  information: number;
  critical: number;
  event_count: number;
  correlation_reduction: number;
  noise_reduction: number;
  warning: number;
  alert_count: number;
}

export interface NetworkAgentConditions {
  id: number;
  uuid: string;
  rule_name: string;
  alert_count: number;
  condition_datetime: string;
  first_alert_datetime: string;
  last_alert_datetime: string;
  condition_source: string;
  condition_source_account: string;
  condition_duration: string;
  condition_status: string;
  condition_severity: string;
  correlators: string[];
  correlation_window: string;
  hosts: string[];
  recovered_datetime: string;
  is_acknowledged: boolean;
  acknowledged_by: string;
  acknowledged_time: string;
  acknowledged_comment: string;
  root_cause_alert: number;
}

export interface NetworkAgentConditionDetails {
  id: number;
  uuid: string;
  rule_name: string;
  alert_count: number;
  event_count: number;
  condition_datetime: string;
  first_alert_datetime: string;
  last_alert_datetime: string;
  condition_source: string[];
  condition_duration: string;
  condition_status: string;
  condition_severity: string;
  correlator: string;
  correlation_window: string;
  hosts: string[];
  recovered_datetime: null;
  is_acknowledged: boolean;
  acknowledged_by: string;
  acknowledged_time: string;
  acknowledged_comment: string;
  // alerts: AIMLConditionAlerts[];
  timeline: NetworkAgentConditionDeviceEventTimeline;
  ticketing_system_type: string;
  account_id: string;
  project_id: string;
  ticket_id: string;
  ticket_type: string;
  ticket_uuid: string;
  conversation_detail: {
    conversation_id: string,
    title: string,
  }
}
export interface NetworkAgentConditionDeviceEventTimeline {
  [key: string]: NetworkAgentConditionDeviceEventTimelineObject;
}
export interface NetworkAgentConditionDeviceEventTimelineObject {
  device: NetworkAgentConditionDeviceEventTimelineObjectDeviceData;
  alerts: NetworkAgentConditionDeviceEventTimelineObjectEventData[];
}
export interface NetworkAgentConditionDeviceEventTimelineObjectDeviceData {
  type: string;
  name: string;
}
export interface NetworkAgentConditionDeviceEventTimelineObjectEventData {
  uuid: string;
  alert_datetime: string;
  severity: string;
  recovered_datetime: string;
  status: string;
}

export interface NetworkAgentConditionAlerts {
  id: number;
  uuid: string;
  event_count: number;
  first_event_datetime: string;
  last_event_datetime: string;
  alert_datetime: string;
  device_name: string;
  device_type: string;
  management_ip: string;
  description: string;
  severity: string;
  status: string;
  is_acknowledged: boolean;
  acknowledged_by: string;
  acknowledged_time: string;
  acknowledged_comment: string;
  source: string;
  source_account_name: string;
  recovered_time: string;
  event_timeline: NetworkAgentConditionAlertEventTimeline[];
  event_metric: string;
}

export interface NetworkAgentConditionAlertEventTimeline {
  uuid: string;
  event_datetime: string;
  severity: string;
  status: string;
}


export interface NetworkAgentConditionActivityDetail {
  id: number;
  description: string;
  created_datetime: string;  // ISO 8601 string format
  event: number;
  alert: number;
  condition: number;
  action: number;
  action_display: string;
}

export interface NetworkAgentAnalysisData {
  query_metadata: QueryMetadata;
  response: Response;
  success: boolean;
}
export interface QueryMetadata {
  is_successful: boolean;
  org_id: number;
  failure_reason: string;
  tokens: number;
  user: number;
  response_time_ms: number;
  query_length: number;
}
export interface Response {
  status: string;
  result_accuracy_percentage: string;
  rca_report: RcaReport;
}
export interface RcaReport {
  remediation_recommendations: string[];
  root_cause_analysis: RootCauseAnalysis;
  timeline_of_events: TimelineOfEventsItem[];
  contributing_factors: string[];
  incident_summary: IncidentSummary;
}
export interface RootCauseAnalysis {
  root_cause: string;
  evidence: string[];
}
export interface TimelineOfEventsItem {
  event: string;
  time: string;
}
export interface IncidentSummary {
  status: string;
  last_alert: string;
  severity: string;
  first_alert: string;
  event_count: number;
  title: string;
  alert_count: number;
  device: string[];
  is_acknowledged: boolean;
  source: string;
  source_account: string;
  duration: string;
  'interface': string[];
  description: string;
}


export interface NetworkAgentConditionAlertEventDetail {
  id: number;
  uuid: string;
  device_name: string;
  device_type: string;
  management_ip: null;
  description: string;
  event_datetime: string;
  severity: string;
  status: string;
  is_acknowledged: boolean;
  source: string;
  recovered_time: string;
  duration: string;
  category: string;
  datacenter: string;
  private_cloud: string;
  cabinet: string;
  tags: string[];
}

export interface NetworkAgentConditionAlertDetail {
  id: number;
  uuid: string;
  event_count: number;
  first_event_datetime: string;
  last_event_datetime: string;
  alert_datetime: string;
  device_name: string;
  device_type: string;
  management_ip: null;
  description: string;
  severity: string;
  status: string;
  is_acknowledged: boolean;
  source: string;
  recovered_time: string;
  event_timeline: NetworkAgentConditionAlertEventTimeline[];
  category: string;
  datacenter: string;
  private_cloud: string;
  cabinet: string;
  tags: string[];
}