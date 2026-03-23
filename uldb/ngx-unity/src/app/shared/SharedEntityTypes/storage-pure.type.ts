export interface PureStorageGraphData {
    provisioned: string;
    used: string;
    capacity: string;
    total_capacity: string;
    system: string;
    free: string;
    snapshots: string;
    volumes: string;
    used_perc: number;
    data_reduction: string;
    shared: string;
    used_total: string;
    available_perc: number;
    empty: string;
    total_reduction: string;
}


export interface PureStorageArray {
    id: number;
    array_components: PureStorageArrayComponents;
    uuid: string;
    name: string;
    space: PureStorageSpaceAttr;
    graph_data: PureStorageGraphData;
    created_at: string;
    updated_at: string;
    purity_version: null;
    status: null;
    storage: number;
}
export interface PureStorageArrayComponents {
    volume_groups: number;
    hosts: number;
    host_groups: number;
    volumes: number;
    volume_snapshots: number;
    pods: number;
    protection_groups: number;
    protection_group_snapshots: number;
}

export interface PureStorageArrayHost {
    id: number;
    host_group: string;
    volumes: string[];
    protection_groups: any[];
    uuid: string;
    name: string;
    space: PureStorageSpaceAttr;
    graph_data: PureStorageGraphDataAttr;
    created_at: string;
    updated_at: string;
    array: number;
}

export interface PureStorageArrayHostGroup {
    id: number;
    hosts: string[];
    uuid: string;
    name: string;
    space: PureStorageSpaceAttr;
    graph_data: PureStorageGraphDataAttr;
    created_at: string;
    updated_at: string;
    array: number;
}

export interface PureStorageArrayVolume {
    id: number;
    connected_hosts: string[];
    connected_host_groups: string[];
    uuid: string;
    name: string;
    space: PureStorageSpaceAttr;
    graph_data: PureStorageGraphDataAttr;
    created_at: string;
    updated_at: string;
    serial_number: string;
    source: string;
    size: string;
    snapshot: boolean;
    array: number;
}

export interface PureStorageArrayVolumeSnapshot {
    id: number;
    volume: string;
    uuid: string;
    name: string;
    space: PureStorageSpaceAttr;
    graph_data: null;
    created_at: string;
    updated_at: string;
    serial_number: string;
    snapshot_time: string;
}

export interface PureStorageArrayVolumeGroup {
    id: number;
    uuid: string;
    name: string;
    space: PureStorageSpaceAttr;
    graph_data: PureStorageGraphDataAttr;
    created_at: string;
    updated_at: string;
    array: number;
    volumes: string[];
}

export interface PureStorageArrayProtectionGroup {
    id: number;
    volumes: string[];
    hosts: any[];
    host_groups: any[];
    pg_group_snapshots: PureStorageArrayProtectionGroupSnapshotsItem[];
    uuid: string;
    name: string;
    space: PureStorageSpaceAttr;
    graph_data: PureStorageGraphDataAttr;
    created_at: string;
    updated_at: string;
    snapshot_schedule: PureStorageArrayProtectionGroupSnapshotSchedule;
    replication_schedule: PureStorageArrayProtectionGroupReplicationSchedule;
    array: number;
}
export interface PureStorageArrayProtectionGroupSnapshotsItem {
    name: string;
    snapshot_time: string;
}
export interface PureStorageArrayProtectionGroupSnapshotSchedule {
    frequency_hours: number;
    enabled: boolean;
    more_days: number;
    snap_at: null;
    snapshots_per_day: number;
    all_snapshots: number;
}
export interface PureStorageArrayProtectionGroupReplicationSchedule {
    frequency_hours: number;
    enabled: boolean;
    more_days: number;
    replicate_at: null;
    snapshots_per_day: number;
    all_snapshots: number;
}

export interface PureStorageArrayProtectionGroupSnapshot {
    id: number;
    protection_group: string;
    uuid: string;
    name: string;
    space: PureStorageSpaceAttr;
    graph_data: PureStorageGraphDataAttr;
    created_at: string;
    updated_at: string;
    snapshot_time: string;
}

export interface PureStorageArrayPOD {
    id: number;
    uuid: string;
    arrays: PureStorageArrayComponentArrayItem[];
    name: string;
    space: PureStorageSpaceAttr;
    graph_data: PureStorageGraphDataAttr;
    created_at: string;
    updated_at: string;
    source: string;
}
export interface PureStorageArrayComponentArrayItem {
    name: string;
    status: string;
    mediator_status: string;
    pre_elected: boolean;

    //added for UI Purpose
    statusClass: string;
}

export interface PureStorageSpaceAttr {
    system?: string;
    snapshots?: string;
    data_reduction?: string;
    volumes?: string;
    shared?: string;
    total?: string;
    size: string;
    name?: string;
}

export interface PureStorageGraphDataAttr {
    free_perc: number;
    occupied_perc: number;
    components: PureStorageGraphDataComponents;
}
export interface PureStorageGraphDataComponents {
    snapshots_perc: number;
    system_perc: number;
    volumes_perc: number;
    shared_perc: number;
}