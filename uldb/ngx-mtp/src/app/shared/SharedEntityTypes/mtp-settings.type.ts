export interface AutoTicketingSettings {
    id: number;
    ticketing_instance: MTPSettingsTicketInstance;
    organization_name: string;
    organization_uuid: string;
    uuid: string;
    auto_ticketing_enabled: boolean;
    auto_remediation_enabled: boolean;
    object_id: number;
    auto_ticketing_severity: string;
    auto_ticketing_delay: number;
    organization: number;
    content_type: string;
}

export interface MTPSettingsTicketInstance {
    'default': boolean;
    type: string;
    uuid: string;
    name: string;
}

export interface AlertNotificationSettings {
    id: number;
    users: any[];
    tenants: AlertNotificationTenants[];
    mtp_groups: AlertNotificationMtpGroups[];
    uuid: string;
    group_name: string;
    is_enabled: boolean;
    alert_type: string[];
    mode: string[];
    customer: number;
}
export interface AlertNotificationTenants {
    id: number;
    name: string;
    uuid: string;
}
export interface AlertNotificationMtpGroups {
    id: number;
    name: string;
    uuid: string;
}