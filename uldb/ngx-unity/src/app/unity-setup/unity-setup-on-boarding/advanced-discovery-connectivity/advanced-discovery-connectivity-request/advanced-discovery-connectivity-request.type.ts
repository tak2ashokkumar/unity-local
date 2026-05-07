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

export interface AdvancedDiscoveryConnectivityRequestCommand {
  command: string;
}
