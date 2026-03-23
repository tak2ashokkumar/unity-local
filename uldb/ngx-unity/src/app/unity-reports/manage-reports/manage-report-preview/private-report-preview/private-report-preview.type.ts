export interface ManageReportCloudInventoryType {
    cloud_type: 'Public' | 'Private';
    name: string;
    cloud_uuid: string;
    cloud: 'vmware' | 'openstack' | 'vcloud' | 'proxmox' | 'g3_kvm';
    vm: ManageReportPrivateCloudInventoryVMType[];
    cloud_data: PrivateCloud;
}

export interface ManageReportCloudInventoryVMType {
    name: string;
    last_known_state: string;
    type: string;
    cpu_count: number;
    storage: string;
    cloud_name: string;
    memory: string;
    ip_address: string;
}

export interface ManageReportPrivateCloudInventoryVMType extends ManageReportCloudInventoryVMType {
    is_template?: boolean;
    vm_id?: string;
}

export interface ManageReportPrivateCloudData {
    cloudType: string[];
    cloud: string[];
    cloudName: ManageReportPrivateCloudCloudNameData[];
    report_url: string;
}

export interface ManageReportPrivateCloudCloudNameData {
    name: string;
    uuid: string;
    platform_type: string;
}

export interface ManageReportDataType {
    uuid: string;
    name: string;
    frequency: string;
    feature: string;
    scheduled_time: string;
    report_meta: ManageReportCloudDataType;
    attachment: boolean;
    enable: boolean;
    default: boolean;
    created_by: number;
    created_at: string;
    updated_at: string;
    scheduled_day: string;
    recipient_emails: string[];
    additional_emails: string[];
    user: string;
}

export interface ManageReportCloudDataType {
    cloudName: ManageReportCloudDataType[];
}

export interface ManageReportCloudDataType {
    platform_type: string;
    name: string;
    uuid: string;
}