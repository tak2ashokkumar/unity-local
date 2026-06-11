export interface mtpAutoRemediationType {
    id: number;
    uuid: string;
    organization_name: string;
    auto_remediation_enabled: boolean;
    auto_ticketing_enabled: boolean;
    object_id: number;
    ticketing_instance: MtpOrganizationSettingsTicketInstance;
    auto_ticketing_severity: string[];
    auto_ticketing_delay: number;
    organization: number;
    content_type: string;
}

export interface MtpOrganizationSettingsTicketInstance {
    'default': boolean;
    type: string;
    name: string;
    uuid: string;
}

export interface TenantsInfoType {
    name: string;
    uuid: string;
}