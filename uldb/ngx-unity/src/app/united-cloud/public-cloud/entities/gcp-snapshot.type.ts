interface GCPSnapshot {
    id: number;
    uuid: string;
    snapshot_id: string;
    name: string;
    status: string;
    storage_bytes: number;
    source_vm_disk: string;
    disk_size_gb: number;
    storage_location: string;
    creation_timestamp: string;
    account: number;
}