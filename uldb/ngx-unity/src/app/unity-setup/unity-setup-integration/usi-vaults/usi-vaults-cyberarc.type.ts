import { UnityScheduleType } from "src/app/shared/SharedEntityTypes/schedule.type";

export interface CyberarcItem {
    uuid: string;
    id: number;
    name: string;
    base_url: string;
    app_id: string;
    safe: string;
    object_name: string;
    username: string;
    address: string;
    'default': boolean;
    created_at: string;
    device_name: string;
    account_id: string;
    customer: number;
    schedule_meta: UnityScheduleType;
    collector: number;
    collector_name: string;
}