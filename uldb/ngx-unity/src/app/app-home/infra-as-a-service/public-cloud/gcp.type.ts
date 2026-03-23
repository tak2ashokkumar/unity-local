import { UnityScheduleType } from "src/app/shared/SharedEntityTypes/schedule.type";

export interface DashboardGCPCloud {
    id: number;
    uuid: string;
    name: string;
    email: string;
    project_id: string;
    created_at: string;
    updated_at: string;
    user: number;
}

export interface DashboardGCPCloudDataItem {
    buckets_count: number;
    size_in_gb: number;
    health_check_count: number;
    instances_count: number;
    instances_up_count: number;
    instances_down_count: number;
}

export interface GcpAccountIntegrationType {
    name: string;
    email: string;
    project_id: string;
    schedule_meta: UnityScheduleType;
    discover_services: string;
    services: string[];
    is_managed: boolean;
    customer: string;
    service_account_info: string;
    id?: number;
    service_mesh?: boolean;
    onboard_device?: boolean;
    dependency_map?: boolean;
    uuid?: string;
    cloud_provider?: number;
    discover_dependency?: boolean;
    dataset?: any;
    billing_account: any;
    billing_enabled: boolean;
    co2emission_enabled: boolean;
    discover_resources: boolean;
    ingest_event: boolean;
    cost_analysis: boolean;
    sustainability?: boolean;
}

export interface GcpAccountScheduleHistory {
    duration: string;
    status: string;
    started_at: string;
    completed_at: string;
    executed_by: string;
}