export interface DeviceDiscoveryAgentConfigurationType {
    id: number;
    name: string;
    ip_address: string;
    poller_id: number;
    status: string;
    uuid: string;
    poller_name: string;
    ssh_username: string;
    ssh_password: string;
    ssh_port: number;
    snmp_community: string;
    deployment_status: number;
    created_at: string;
    updated_at: string;
    customer: number;
    test_result: ConnectionTestResult;
    cert_ttl?: number | string;
    cert_valid?: string | boolean;
    cert_status?: string;
    cert_expiry?: string;
}

export interface ConnectionTestResult {
    date: string;
    ping: ConnectionResult;
    ssh: ConnectionResult;
    host_name: string;
}
interface ConnectionResult {
    msg: string;
    result: boolean;
}
