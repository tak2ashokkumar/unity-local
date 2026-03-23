export interface WizardStepType {
    icon: string;
    stepName: string;
    url: string;
    active: boolean;
}

export interface DeviceDiscoverySummary {
    mac: number;
    network: number;
    power: number;
    firewall: number;
    hypervisor: number;
    storage: number;
    loadbalancer: number;
    server: number;
}