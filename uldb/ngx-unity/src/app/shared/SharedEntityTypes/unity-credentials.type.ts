import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

export interface UnityCredentials {
    id: number;
    customer: UnityCredentialCustomer;
    uuid: string;
    name: string;
    description: string;
    type: string;
    community: string;
    security_name: string;
    security_level: string;
    authentication_protocol: string;
    authentication_passphrase: string;
    privacy_protocol: string;
    privacy_passphrase: string;
    host: string;
    ip_address: string;
    username: string;
    password: string;
    sudo_password: string;
    key: string;
    created_at: string;
    updated_at: string;
    edited_by: string;
    created_by: string;
    devices: UnityCredentialDevices[];
}
export interface UnityCredentialCustomer {
    url: string;
    id: number;
    name: string;
    storage: string;
    uuid: string;
}
export interface UnityCredentialDevices {
    id: number;
    uuid: string;
    name: string;
    monitoring: DeviceMonitoringType;
    device_type: string;

    //added for UI purpose
    selected: boolean;
}

export interface UnityCredentialsFast {
    id: number;
    uuid: string;
    name: string;
    database_type: string;
    connection_type: string;

    //added for UI purpose
    nameWithType?: string;
    isDisabled: boolean;
}