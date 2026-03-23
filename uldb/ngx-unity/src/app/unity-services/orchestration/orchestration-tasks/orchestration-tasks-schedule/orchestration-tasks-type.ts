import { UnityScheduleType } from "src/app/shared/SharedEntityTypes/schedule.type";

export interface scheduleType{
    schedule_meta: UnityScheduleType;
}

export interface cloudType {
    username: string;
    password: string;
    credentials: string[];
    cloud: CloudNameType;
}

export interface CloudNameType {
    id: number;
    vms: number;
    cloud_type: string;
    uuid: string;
    account_name: string;
}
