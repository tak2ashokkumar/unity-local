export interface ConditionResponse {
  stage: string;
  stage_title: string;
  answer: string;
  status: 'success' | 'error';
  data: ConditionData;
  recommended_actions: string[];
}

export interface ConditionData {
  condition_summary: ConditionSummary;
  events_timeline: EventTimelineItem[];
  alerts_timeline: AlertTimelineItem[];
  preliminary_rca: PreliminaryRCA[];
  plan_of_action: string[];
  suggested_commands: SuggestedCommand[];
}

/* -------------------- Condition Summary -------------------- */

export interface ConditionSummary {
  condition_id: string;
  condition_name: string;
  severity: 'Critical' | 'Warning' | 'Information' | string;
  status: 'Resolved' | 'Active' | string;
  alert_count: number;
  event_count: number;
  condition_datetime: string;
  condition_duration: string;
  affected_devices: string[];
  business_impact: string;
  condition_analysis: string;
  condition_source: string;
  correlators: string;
  first_alert_datetime: string;
  last_alert_datetime: string;
}

/* -------------------- Timeline -------------------- */

export interface EventTimelineItem {
  timestamp: string;
  type: string;
  description: string;
  severity: 'Critical' | 'Warning' | 'Information' | string;
}

export interface AlertTimelineItem {
  timestamp: string;
  type: string;
  description: string;
  severity: 'Critical' | 'Warning' | 'Information' | string;
}

/* -------------------- RCA -------------------- */

export interface PreliminaryRCA {
  possible_cause: string;
  confidence: 'High' | 'Medium' | 'Low' | string;
  indicators: string[];
}

/* -------------------- Suggested Commands -------------------- */

export interface SuggestedCommand {
  command: string;
  use_case: string;
}

export interface PromptResult {
  id: number;
  version: number;
  uuid: string;
  app_name: string;
  environment: string;
  model_name: string;
  temperature: number;
  prompt: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  customer: number;
  prompt_name: string;
}