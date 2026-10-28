import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

/**
 * VergeIO integration types.
 * Fields follow the VergeIO contract plus the vCenter field names for the
 * ones the contract does not define (collector, port, verify_ssl).
 */
export interface VergeIOAccount {
    uuid: string;
    name: string;
    hostname: string;
    port: number;
    username: string;
    password: string;
    verify_ssl: boolean;
    collector: DeviceDiscoveryAgentConfigurationType;
    status: string;
    enabled: boolean;
    is_managed: boolean;
}

export interface VergeIOConnectionCheck {
    hostname: string;
    port: number;
    username: string;
    password?: string;
    verify_ssl: boolean;
    collector: DeviceDiscoveryAgentConfigurationType;
}

export interface VergeIODiscoveryHistory {
    uuid: string;
    status: string;
    summary: VergeIODiscoverySummary;
    error: string;
    completed_at: string;
}

export interface VergeIODiscoverySummary {
    vm: number;
    cluster: number;
    host: number;
    network: number;
    datastore: number;
}
