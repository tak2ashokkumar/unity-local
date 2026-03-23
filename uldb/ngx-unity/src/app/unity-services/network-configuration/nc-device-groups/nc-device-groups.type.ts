import { UnityNotificationType, UnityScheduleType } from "src/app/shared/SharedEntityTypes/schedule.type";

export interface NCMDeviceGroupType {
    uuid: string;
    name: string;
    description: string;
    devices: NCMDevicesType[];
    device_types: string[];
    firewalls: NCMDevicesType[];
    load_balancers: NCMDevicesType[];
    switches: NCMDevicesType[];
    created_at: string;
    updated_at: string;
    schedule_meta: UnityScheduleType;
    notification: UnityNotificationType;
}

export interface NCMDevicesType {
    is_ncm_enabled: boolean;
    name: string;
    ncm_credentials__uuid: string;
    config_device_type: string;
    enable_or_encrypted_password: string;
    device_type: string;
    uuid: string;
    management_ip: string;
    is_in_progress: boolean;
}

export interface NCMDeviceGroupScheduleHistoryType {
    duration: string;
    status: string;
    started_at: string;
    completed_at: string;
    executed_by: string;
}

export interface NCMDeviceGroupFormDataType {
    name: string;
    description: string;
    device_types: string[];
    devices: NCMDevicesType[];
}