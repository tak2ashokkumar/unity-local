export type AdvancedDiscoveryConnectivityRequestStepId = 'collectorDetails' | 'downloadFile' | 'runCommand';

export interface AdvancedDiscoveryConnectivityRequestStep {
  id: AdvancedDiscoveryConnectivityRequestStepId;
  label: string;
  icon: string;
}

export interface AdvancedDiscoveryConnectivityRequestCreatePayload {
  ip_address: string;
  cert_host_name: string;
  cert_ttl: number;
}

export interface AdvancedDiscoveryConnectivityRequestCreateResponse {
  uuid?: string;
  id?: string;
  data?: {
    uuid?: string;
    id?: string;
  };
}

export interface AdvancedDiscoveryConnectivityRequest {
    id: number;
    name: string;
    ip_address: string;
    poller_id: null;
    status: string;
    test_result: null;
    snmp_community: string;
    pkey: null;
    uuid: string;
    poller_name: string;
    ssh_username: null;
    ssh_port: number;
    web_username: null;
    web_password: null;
    deployment_status: number;
    pyro_port: number;
    rdp_access_name: string;
    created_at: string;
    updated_at: string;
    enable_vcenter: boolean;
    is_docker: boolean;
    is_ztc: boolean;
    cert_host_name: string;
    cert_ttl: number;
    cert_expiry: string;
    cert_status: string;
    customer: number;
    message: string;
}

export interface AdvancedDiscoveryConnectivityRequestCommand {
  command: string;
}
