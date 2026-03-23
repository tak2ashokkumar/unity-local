export interface ResourceDetailsType {
    id: number;
    icon_path: string;
    name: string;
    resource_count: number;
}

export interface AwsAccountScheduleHistory {
    duration: string;
    status: string;
    started_at: string;
    completed_at: string;
    executed_by: string;
}
