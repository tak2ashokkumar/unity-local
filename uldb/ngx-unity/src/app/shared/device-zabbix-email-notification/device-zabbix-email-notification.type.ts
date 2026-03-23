export interface DeviceZabbixAlertNotification {
    id: number;
    uuid: string;
    org_config: DeviceZabbixAlertNotificationOrg;
    is_enabled: boolean;
    users: DeviceZabbixAlertNotificationUser[];
}

export interface DeviceZabbixAlertNotificationOrg {
    id: number;
    uuid: string;
    is_enabled: boolean;
    users: any[];
}

export interface DeviceZabbixAlertNotificationUser {
    first_name: string;
    last_name: string;
    id: number;
    email: string;
}