export interface WizardStepType {
    icon: string;
    stepName: string;
    url: string;
    active: boolean;
    disabled?: boolean;
}

// export interface AdvancedDeviceDiscoverySummary {
//     mac: number;
//     switch: number;
//     power: number;
//     firewall: number;
//     hypervisor: number;
//     storage: number;
//     loadbalancer: number;
//     server: number;
// }

export interface AdvancedDeviceDiscoverySummary {
    'switch': number;
    virtual_machine: number;
    firewall: number;
    hypervisor: number;
    pdu: number;
    storage: number;
    mac: number;
    loadbalancer: number;
    server: number;
}