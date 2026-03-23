import { UnityScheduleType } from "src/app/shared/SharedEntityTypes/schedule.type";

export interface OracleAccount {
    uuid: string;
    fingerprint: string;
    name: string;
    user_ocid: string;
    tenancy_ocid: string;
    region: string;
    user: string;
    discover_services: string;
    services: string[];
    onboard_device: boolean;
    dependency_map: boolean;
    is_managed: boolean;
    discover_dependency: boolean;
    schedule_meta: UnityScheduleType;
    ingest_event: string;
    discover_resources: boolean;
    cost_analysis: boolean;
}