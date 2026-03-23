export interface VcenterComponentSummary {
    cluster: VcenterComponentStatusSummary;
    'switch': VcenterComponentStatusSummary;
    firewalls: VcenterComponentStatusSummary;
    load_balancer: VcenterComponentStatusSummary;
    hypervisor: VcenterComponentStatusSummary;
    baremetal: VcenterComponentStatusSummary;
    mac: VcenterComponentStatusSummary;
    storage: VcenterComponentStatusSummary;
    database: VcenterComponentStatusSummary;
    virtual_machine: VcenterComponentStatusSummary;
    custom_device: VcenterComponentStatusSummary;
    datastore: VcenterComponentStatusSummary;
    network: VcenterComponentStatusSummary;
    distributed_switch: VcenterComponentStatusSummary;
    port_group: VcenterComponentStatusSummary;
}

export interface VcenterComponentStatusSummary {
    total: number;
    up: number;
    down: number;
    unknown: number;
}


export interface VcenterSummaryAlerts {
    summary: VcenterAlertsSummary;
    data: VcenterAlertsSummaryByDeviceType[];
}
export interface VcenterAlertsSummaryByDeviceType {
    device_type: string;
    total: number;
    critical: number;
    warning: number;
    information: number;
}
export interface VcenterAlertsSummary {
    total: number;
    critical: number;
    warning: number;
    information: number;
}