export interface StorageOntapClusterSummary {
    luns: StorageOntapClusterSummaryLuns;
    nodes: StorageOntapClusterSummaryNodes;
    aggregates: StorageOntapClusterSummaryAggregates;
    volumes: StorageOntapClusterSummaryVolumes;
    svms: StorageOntapClusterSummarySvms;
}
export interface StorageOntapClusterSummaryLuns {
    count: number;
    online: number;
}
export interface StorageOntapClusterSummaryNodes {
    count: number;
    up?: number;
    degraded?: number;
}
export interface StorageOntapClusterSummaryAggregates {
    count: number;
    online: number;
}
export interface StorageOntapClusterSummaryVolumes {
    count: number;
    online: number;
}
export interface StorageOntapClusterSummarySvms {
    count: number;
    running: number;
}


export interface StorageOntapCluster {
    name: string;
    uuid: string;
    version: string;
    subsystems: StorageOntapClusterSubsystem[];
    aggregates: StorageOntapClusterAggregateStats;
    state: string;
    location: string;
    serial_number: string;
    ip_address: string;
    node_count: number;
    disk: StorageOntapClusterDisk;
    shelve_count: number;
    snapmirror_count: string;
    clusterpeer_count: string;
    custom_attribute_data?: { [key: string]: string };
}
export interface StorageOntapClusterSubsystem {
    subsystem: string;
    health: string;
}
export interface StorageOntapClusterAggregateStats {
    available: string;
    available_percent: number;
    used: string;
    size: string;
    used_percent: number;
}
export interface StorageOntapClusterDisk {
    count: StorageOntapClusterDiskCounts;
    size_in_percentage: StorageOntapClusterDiskSizePercentages;
    size: StorageOntapClusterDiskSizes;
}
export interface StorageOntapClusterDiskCounts {
    Aggregate: number;
    Unassigned: number;
    Spare: number;
    Shared: number;
    Broken: number;
}
export interface StorageOntapClusterDiskSizes {
    Aggregate: string;
    Unassigned: string;
    Spare: string;
}
export interface StorageOntapClusterDiskSizePercentages {
    Aggregate: number;
    Unassigned: number;
    Spare: number;
}

export interface StorageOntapClusterTopUsedAggragates {
    name: string;
    used_percent: number;
}
export interface StorageOntapClusterTopUsedVolumes {
    name: string;
    used_percent: number;
}
export interface StorageOntapClusterTopUsedLUNs {
    name: string;
    used_percent: number;
}

export interface StorageOntapClusterNode {
    name: string;
    uuid: string;
    state: string;
    serial_number: string;
    ha_partner: string;
    os: string;
    management_ip: string;
    ethernet_ports: number;
    fc_ports: number;
}

export interface StorageOntapClusterNodeDetails {
    name: string;
    uuid: string;
    state: string;
    serial_number: string;
    ha_partner: string;
    auto_giveback: string;
    os: string;
    management_ip: string;
    ha_enabled: boolean; // doubt on type
    management_name: string;
    location: string;
    uptime: number;
    ethernet_ports: number;
    fc_ports: number;
    service_processor: StorageOntapClusterNodeDetailsServiceProcessor;
    metrocluster: StorageOntapClusterNodeDetailsMetrocluster;
    model: string;
    storage: StorageOntapEntityDetailsStorage;
    custom_attribute_data?: { [key: string]: string };
}
export interface StorageOntapClusterNodeDetailsMetrocluster {
    name: string;// doubt
    type: string;
}
export interface StorageOntapClusterNodeDetailsServiceProcessor {
    state: string;
    ipv4_interface: StorageOntapClusterNodeDetailsServiceProcessorIpAddress;
    firmware_version: string;
}
export interface StorageOntapClusterNodeDetailsServiceProcessorIpAddress {
    address: string;
}
export interface StorageOntapEntityDetailsStorage {
    available: string;
    used_percent: number;
    used: string;
    available_percent: number;
    size: string;
}

export interface StorageOntapNodeCPUData {
    total_records: number;
    records: StorageOntapNodeCPURecordData[];
}
export interface StorageOntapNodeCPURecordData {
    timestamp: string;
    processor_utilization: number;
    _links: StorageOntapNodeCPURecordLinkData;
}
export interface StorageOntapNodeCPURecordLinkData {
    self: StorageOntapNodeCPURecordLinkHREFData;
}
export interface StorageOntapNodeCPURecordLinkHREFData {
    href: string;
}

export interface StorageOntapTopN {
    luns: StorageOntapTopNDetails[];
    aggregates: StorageOntapTopNDetails[];
    volumes: StorageOntapTopNDetails[];
}
export interface StorageOntapTopNDetails {
    name: string;
    uuid: string;
    used_percent: number;
}

export interface StorageOntapClusterAggragate {
    name: string;
    uuid: string;
    state: string;
    node_name: string;
    node_uuid: string;
    raid_type: string;
    type: string;
    logical_used: string;
    used: string;
    capacity: string;
    available: string;
    used_percent: number;
    available_percent: number;
    data_reduction: string;
}

export interface StorageOntapClusterAggragateDetails {
    name: string;
    uuid: string;
    state: string;
    node_name: string;
    node_uuid: string;
    raid_type: string;
    type: string;
    logical_used: string;
    used: string;
    capacity: string;
    available: string;
    used_percent: number;
    available_percent: number;
    data_reduction: string;
    checksum_style: string;
    plex_count: number;
    plex_details: StorageOntapClusterAggragateDetailsPlex[];
    storage: StorageOntapEntityDetailsStorage;
    hybrid: string;
}
export interface StorageOntapClusterAggragateDetailsPlex {
    name: string;
}

export interface StorageOntapClusterSVM {
    name: string;
    uuid: string;
    state: string;
    language: string;
    configured_protocols: string;
}

export interface StorageOntapClusterSVMDetails {
    name: string;
    uuid: string;
    state: string;
    language: string;
    configured_protocols: string;
    subtype: string;
    dns: StorageOntapClusterSVMDetailsDNS;
    fc_interfaces: any[];
    nis_enabled: string;
    nis_servers: any[];
    s3_name: string;
    s3_enabled: string;
    nfs_enabled: string;
    cifs_enabled: string;
    iscsi_enabled: string;
    fcp_enabled: string;
    nvme_enabled: string;
    aggregates: StorageOntapClusterSVMDetailsAggregates[];
    ldap_enabled: string;
    snapmirror_is_protected: string;
    ipspace_name: string;
    snapmirror_protected_volumes_count: string;
    anti_ransomware_default_volume_state: string;
    number_of_volumes_in_recovery_queue: string;
    max_volumes: string;
    ip_interfaces: StorageOntapClusterSVMDetailsIpInterfaces[];
}
export interface StorageOntapClusterSVMDetailsDNS {
    domains: string[];
    servers: string[];
}
export interface StorageOntapClusterSVMDetailsAggregates {
    name: string;
    uuid: string;
}
export interface StorageOntapClusterSVMDetailsIpInterfaces {
    services: string[];
    ip_address: string;
    name: string;
}

export interface StorageOntapClusterVolume {
    name: string;
    uuid: string;
    state: string;
    svm_name: string;
    svm_uuid: string;
    aggregate_name: string;
    aggregate_uuid: string;
    iops: number;
    latency: number;
    throughput: number;
    type: string;
    is_svm_root: boolean;
    security_style: string;
    snapshot_reserve: string;
    autogrow: string;
    guarantee: boolean;
    capacity: string;
    available: string;
    used: string;
    available_percent: number;
    used_percent: number;
    node_name: string;
    node_uuid: string;
}

export interface StorageOntapClusterVolumeDetails {
    name: string;
    uuid: string;
    state: string;
    svm_name: string;
    svm_uuid: string;
    aggregate_name: string;
    aggregate_uuid: string;
    iops: number;
    latency: number;
    throughput: number;
    type: string;
    is_svm_root: boolean;
    security_style: string;
    snapshot_reserve: string;
    autogrow: string;
    guarantee: string;
    capacity: string;
    available: string;
    used: string;
    available_percent: number;
    used_percent: number;
    node_name: string;
    node_uuid: string;
    language: string;
    tiering_policy: string;
    snapshot_policy_name: string;
    snapmirror_is_protected: string;
    encryption_enabled: string;
    files: StorageOntapClusterVolumeFileDetails;
    nas_unix_permissions: string;
    nas_path: string;
    export_policy_name: string;
    anti_ransomware_state: string;
    snapshot_locking_enabled: string;
    anti_ransomware_suspect_files_count: null;
    storage: StorageOntapEntityDetailsStorage;
}
export interface StorageOntapClusterVolumeFileDetails {
    used: number;
    maximum: number;
}

export interface StorageOntapClusterLUN {
    name: string;
    uuid: string;
    state: string;
    svm_name: string;
    svm_uuid: string;
    volume_name: string;
    volume_uuid: string;
    iops: number;
    latency: number;
    throughput: number;
    capacity: string;
    available: string;
    used: number;
    available_percent: number;
    used_percent: number;
    node_name: string;
    node_uuid: string;
    mapped_nodes: string;
}

export interface StorageOntapClusterLUNDetails {
    name: string;
    uuid: string;
    state: string;
    svm_name: string;
    svm_uuid: string;
    volume_name: string;
    volume_uuid: string;
    capacity: string;
    available: string;
    used: number;
    available_percent: number;
    used_percent: number;
    space_guarantee: string;
    space_reserved: string;
    storage: StorageOntapEntityDetailsStorage;
}

export interface OntapMonitoringItem {
    item_id: number;
    name: string;
    key: string;
    value_type: string;
}

export interface OntapMonitoringItemGraph {
    [key: string]: string;
}

export interface OntapMonitoringStatisticsGraphItem {
    item_id: number;
    name: string;
}
