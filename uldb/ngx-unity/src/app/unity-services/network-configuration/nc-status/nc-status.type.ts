export interface NCMSummaryType {
    total: number;
    backed_up: number;
    not_backed_up: number;
    last_24_hours: number;
}

export interface NCMDeviceType {
    uuid: string;
    name: string;
    collector: string;
    device_type: string;
    manufacturer: string;
    model: string;
    management_ip: string;
    datacenter_name: string;
    startup_config: string;
    running_config: string;
    golden_config: string;
    last_backup: string;
    status: string;
    is_ncm_enabled: boolean;
    has_startup_config: boolean;
    is_running_config_encrypted: boolean;
    config_device_type: string;
    config_file_type: string;
}

export interface NCMStartupConfigurationType {
    is_valid: true;
    data: string;
}

export interface NCMRunningConfigurationType extends NCMStartupConfigurationType { }

export interface NCMValidateCredentialsFormDataType {
    username: string;
    password: string;
    enable_or_encrypted_password: string;
    device_type: string;
    uuid: string;
}

export enum NetworkConfigurationDeviceType {
    SWITCH = 'switch',
    FIREWALL = 'firewall',
    LOAD_BALANCER = 'load_balancer',
}