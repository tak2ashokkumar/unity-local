export interface DeviceDiscoveryCredentials {
    id: number;
    customer: DeviceDiscoveryCredentialsCustomer;
    uuid: string;
    name: string;
    description: string;
    type: string;
    community: string;
    created_by: string;
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
    updated_by: string;
}

export interface DeviceDiscoveryCredentialsCustomer {
    url: string;
    id: number;
    name: string;
    storage: string;
    uuid: string;
}

export interface DeviceDiscoveryCredentialAttributes {
    edited_by: string;
    description: string;
    org_id: number;
    edited_date: string;
    'orgs.id': number;
    'orgs.name': string;
    credentials: DeviceDiscoveryCredentialDeatils;
    type: string;
    id: number;
    name: string;
}
export interface DeviceDiscoveryCredentialDeatils {
    username?: string;
    password?: string;
    community?: string;
    security_name?: string;
    security_level?: string;
    authentication_protocol?: string;
    authentication_passphrase?: string;
    privacy_protocol?: string;
    privacy_passphrase?: string;
    key?: string;
}
export interface DeviceDiscoveryCredentialLinks {
    self: string;
}