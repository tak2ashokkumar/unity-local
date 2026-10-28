/**
 * VergeIO detail (main view) types - component summary + virtual machines.
 */
export interface VergeIOComponentSummary {
    vm: number;
    cluster: number;
    host: number;
    datastore: number;
    network: number;
    vm_details: VergeIOVmSummary;
}

export interface VergeIOVmSummary {
    vm_up: number;
    vm_down: number;
    vm_unknown: number;
    vm_count: number;
}

export interface VergeIOVM {
    uuid: string;
    name: string;
    resource_type: string;
    power_state: string;
    cluster_id: string;
    host_id: string;
    data: VergeIOVmData;
}

export interface VergeIOVmData {
    cpu_cores: number;
    ram: number;
}

export interface VergeIOVmAction {
    action: string;
}

export interface VergeIOOperation {
    uuid: string;
    resource_uuid: string;
    action: string;
    status: string;
    error: string;
}

export interface VergeIOVmActionResponse {
    status: string;
    operation_uuid: string;
    task_id: string;
}
