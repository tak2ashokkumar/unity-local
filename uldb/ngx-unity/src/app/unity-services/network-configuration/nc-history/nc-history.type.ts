export interface NCMHistoryType {
    uuid: string;
    backup_name: string;
    device_uuid: string;
    executed_by: string;
    device_name: string;
    device_type: string;
    config_device_type: string;
    config_file: string;
    is_startup_config: boolean;
    is_golden_config: boolean;
    is_ncm_enabled: boolean;
    collector: NCMHistoryCollectorType;
    datacenter: string;
    mangement_ip: string;
    manufacturer: string;
    model: string;
    status: string;
    created_at: string;
    updated_at: string;
    is_encrypted:boolean;
}

export interface NCMHistoryCollectorType {
    ip_address: string;
    uuid: string;
    name: string;
}

export interface NCMHistroyConfigType {
    is_valid: true;
    data: string;
}

export interface NCMHistoryDeleteType {
    detail: string;
}