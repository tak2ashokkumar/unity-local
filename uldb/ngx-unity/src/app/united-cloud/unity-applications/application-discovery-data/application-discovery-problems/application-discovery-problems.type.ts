export interface AIMLConditionsSummary {
  total: AIMLConditionsSummaryData;
  last_7_days: AIMLConditionsSummaryData;
}

export interface AIMLConditionsSummaryData {
  condition_count: number;
  alert_count: number;
  event_count: number;
  critical: number;
  warning: number;
  information: number;
  noise_reduction: number;
  correlation_reduction: number;
}

export interface AIMLConditions {
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

export interface AIMLConditionDetails {
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
  timeline: AIMLConditionDeviceEventTimeline;
  ticketing_system_type: string;
  account_id: string;
  project_id: string;
  ticket_id: string;
  ticket_type: string;
  ticket_uuid: string;
}

export interface AIMLConditionAlerts {
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
  event_timeline: AIMLConditionAlertEventTimeline[];
  event_metric: string;
}

export interface AIMLConditionAlertEventTimeline {
  uuid: string;
  event_datetime: string;
  severity: string;
  status: string;
}

export interface AIMLConditionDeviceEventTimeline {
  [key: string]: AIMLConditionDeviceEventTimelineObject;
}

export interface AIMLConditionDeviceEventTimelineObject {
  device: AIMLConditionDeviceEventTimelineObjectDeviceData;
  alerts: AIMLConditionDeviceEventTimelineObjectEventData[];
}

export interface AIMLConditionDeviceEventTimelineObjectDeviceData {
  type: string;
  name: string;
}

export interface AIMLConditionDeviceEventTimelineObjectEventData {
  uuid: string;
  alert_datetime: string;
  severity: string;
  recovered_datetime: string;
  status: string;
}

export interface AIMLConditionAlertDetail {
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
  event_timeline: AIMLConditionAlertEventTimeline[];
  category: string;
  datacenter: string;
  private_cloud: string;
  cabinet: string;
  tags: string[];
}

export interface AIMLConditionAlertEventDetail {
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

export interface AIMLConditionActivityDetail {
  id: number;
  description: string;
  created_datetime: string;  // ISO 8601 string format
  event: number;
  alert: number;
  condition: number;
  action: number;
  action_display: string;
}

export interface AIMLAnalysisData {
  query_metadata: Query_metadata;
  response: Response;
  success: boolean;
}
interface Query_metadata {
  is_successful: boolean;
  org_id: number;
  failure_reason: string;
  tokens: number;
  user: number;
  response_time_ms: number;
  query_length: number;
}
interface Response {
  status: string;
  result_accuracy_percentage: string;
  rca_report: Rca_report;
}
interface Rca_report {
  remediation_recommendations: string[];
  root_cause_analysis: Root_cause_analysis;
  timeline_of_events: TimelineOfEventsItem[];
  contributing_factors: string[];
  incident_summary: Incident_summary;
}
interface Root_cause_analysis {
  root_cause: string;
  evidence: string[];
}
interface TimelineOfEventsItem {
  event: string;
  time: string;
}
interface Incident_summary {
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

export interface AIRemediationType {
  session_id: string;
  response: AIRemediationResponseType;
}

export interface AIRemediationResponseType {
  condition_data: ConditionDataType;
  recommended_actions: RecommendedActionsType[];
  recommended_workflow_from_unityai: RecommendedWorkflowFromUnityaiType;
}

export interface ConditionDataType {
  title: string;
  description: string;
  severity: string;
  affected_devices: string[];
  affected_interfaces: string[];
  source_account: string;
}

export interface RecommendedActionsType {
  action: string;
  description: string;
  why_required: string;
}

export interface RecommendedWorkflowFromUnityaiType {
  workflow_uuid?: string;
  workflow_name?: string;
  workflow_description?: string;
  workflow_category?: string;
  workflow_trigger_type?: string;
  workflow_confidence_rate?: string;
  expected_outcomes?: ExpectedOutcomesType[];
  post_execution_monitoring?: string[];
}

export interface ExpectedOutcomesType {
  outcome: string;
  outcome_rate: string;
}