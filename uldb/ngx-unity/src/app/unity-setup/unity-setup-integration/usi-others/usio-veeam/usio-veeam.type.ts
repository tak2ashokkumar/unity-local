import { DeviceProxy } from "src/app/shared/SharedEntityTypes/device-common-utils.type";
import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";
import { UnityScheduleType } from "src/app/shared/SharedEntityTypes/schedule.type";

export interface veeamAccountType {
    uuid: string;
    name: string;
    port: number;
    username: string;
    private_cloud: string;
    platform_type: string;
    proxy: DeviceProxy;
    monitoring: DeviceMonitoringType;
    status: string;
    host_name: string;
    created_at: string;
    updated_at: string;
    schedule_meta: UnityScheduleType;
    collector: CollectorType;
}

export interface VeeamAccountSummaryType {
    virtual_machines: VeeamAccountSummaryVMsType;
    status: VeeamAccountStatusType;
}

export interface VeeamAccountSummaryVMsType {
    total: number;
    backed_up: number;
}

export interface VeeamAccountStatusType {
    total: number;
    success: number;
    failed: number;
    warning: number;
    none: number;
}
