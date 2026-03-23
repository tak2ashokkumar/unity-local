export interface StorageOntapClusterDisk {
    name: string;
    uuid: string;
    state: string;
    serial_number: string;
    node_name: string;
    sector_count: string;
    pool: string;
    home_node_name: string;
    rpm: string;
    type: string;
    model: string;
    firmware_version: string;
    vendor: string;
    usable_size: string;
    aggregate_name: string;
    error_type: string;
}