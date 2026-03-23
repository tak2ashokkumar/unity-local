export interface NetworksSummaryType {
    distributed_port_groups: number;
    networks: number;
    distributed_switches: number;
}

export interface NetworksType {
    id: number;
    created_at: string;
    updated_at: string;
    uuid: string;
    name: string;
    network_id: string;
    network_type: string;
    network_status: string;
    host_count: number;
    vm_count: number;
    cloud: number;
    datacenter: number;
    vcenter: number;
    cluster: number;
}

export interface DistributedSwitchesType {
    id: number;
    uuid: string;
    name: string;
    dvs_id: string;
    version: string;
    nioc_version: string;
    lacp_version: string;
    dvs_status: string;
    cloud: string;
    datacenter: string;
    vcenter: string;
}

export interface DistributedPortsGroupsType {
    id: number;
    uuid: string;
    name: string;
    dvs_port_group_id: string;
    vlan_id: string;
    port_binding: string;
    port_count: number;
    vm_count: number;
    port_group_status: string;
    distributed_switch: string;
    cloud: string;
    datacenter: string;
    vcenter: string;
}