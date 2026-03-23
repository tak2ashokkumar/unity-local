
export interface NetworkConfigurationDeviceType {
    uuid: string;
    name: string;
    device_type: string;
    management_ip: string;
    ncm_credentials: string;
    enable_or_encrypted_password: string;
    config_device_type: string;
    is_ncm_enabled: boolean;
    is_in_progress: boolean;
}

export interface ValidateCredentialsFormDataType {
    devices: DevicesType[];
    credentials: string;
    enable_or_encrypted_password: string;
    config_device_type: string;
}

export interface DevicesType {
    uuid: string;
    device_type: string;
}

export interface NCMConfigureDeviceFormDataType extends ValidateCredentialsFormDataType { }