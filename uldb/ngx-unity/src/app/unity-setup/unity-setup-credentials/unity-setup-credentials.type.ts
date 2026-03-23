import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

export interface UnitySetupCredentials {
    id: number;
    customer: UnitySetupCredentialCustomer;
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
    api_token: string;
    sudo_password: string;
    key: string;
    created_at: string;
    updated_at: string;
    updated_by: string;
    created_by: string;
    devices: UnitySetupCredentialDevices[];
    database_type?: string;
    port?: number;
}
export interface UnitySetupCredentialCustomer {
    url: string;
    id: number;
    name: string;
    storage: string;
    uuid: string;
}
export interface UnitySetupCredentialDevices {
    id: number;
    uuid: string;
    name: string;
    monitoring: DeviceMonitoringType;
    device_type: string;

    //added for UI purpose
    selected: boolean;
    deviceIcon: string;
}