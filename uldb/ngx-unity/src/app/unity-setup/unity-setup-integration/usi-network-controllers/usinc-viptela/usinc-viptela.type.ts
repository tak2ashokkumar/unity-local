import { DeviceProxy } from "src/app/shared/SharedEntityTypes/device-common-utils.type";
import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";
import { UnityScheduleType } from "src/app/shared/SharedEntityTypes/schedule.type";

export interface ViptelaAccountType {
    uuid: string;
    name: string;
    account_url: string;
    port: string;
    collector: string;
    username: string;
    password: string;
    schedule_meta: UnityScheduleType;
    status: string;
    proxy: DeviceProxy;
    tags: string[];
    monitoring: DeviceMonitoringType;
}