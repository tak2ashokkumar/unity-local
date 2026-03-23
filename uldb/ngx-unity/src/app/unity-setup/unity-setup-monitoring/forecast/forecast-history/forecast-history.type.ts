export interface HistoryData {
  id: number;
  uuid: string;
  device_name: string;
  device_type: string;
  ip_address: string;
  description: string;
  event_datetime: string;
  severity: string;
  status: string;
  is_acknowledged: boolean;
  source: string;
  source_account: string;
  recovered_time: string;
  duration: string;
  affected_component: string;
  affected_component_type: string;
  affected_component_name: string;
  environment: string;
  application_name: string;
  event_metric: string;
  acknowledged_by: string;
  acknowledged_time: string;
  acknowledged_comment: string;
  custom_data: string;
}

export interface DisableTriggerType {
  message: string;
  success: boolean;
}

export interface EventResolveType extends DisableTriggerType { }