export interface OrgZabbixAlertConfig {
    id: number;
    uuid: string;
    is_enabled: boolean;
    users: OrgZabbixAlertConfigUser[];
}
export interface OrgZabbixAlertConfigUser {
    first_name: string;
    last_name: string;
    id: number;
    email: string;
}

export interface UnityOrganizationSettings {
    id: number;
    uuid: string;
    auto_remediation_enabled: boolean;
    auto_ticketing_enabled: boolean;
    attach_rca_to_ticket: boolean;
    object_id: number;
    ticketing_instance: UnityOrganizationSettingsTicketInstance;
    auto_ticketing_severity: string[];
    auto_ticketing_delay: number;
    organization: number;
    content_type: string;
    ticket_subject_format: string;
}

export interface UnityOrganizationSettingsTicketInstance {
    'default': boolean;
    type: string;
    name: string;
    uuid: string;
}

export interface SupportedLLMResponse {
  supported_llms: LLMConfig[];
}

export interface LLMConfig {
  id: number;
  provider: string;
  model_name: string;
  description: string;
  endpoint_url: string;
  is_user_owned: boolean;
  is_active_for_session: boolean;
}