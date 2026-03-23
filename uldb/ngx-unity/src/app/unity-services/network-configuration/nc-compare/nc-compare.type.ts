export interface NCMDeviceVersionType {
    uuid: string;
    device_name: string;
    device_type: string;
    config_device_type: string;
    config_file: string;
    is_startup_config: boolean;
    is_golden_config: boolean;
    is_ncm_enabled: boolean;
    datacenter: string;
    mangement_ip: string;
    manufacturer: string;
    model: string;
    status: string;
    created_at: string;
    updated_at: string;

    // added for UI purpose
    displayName: string;
    versionData: string[];
}

export interface NCMConfigurationType {
    is_valid: boolean;
    data: string;
}