export interface OracleAccountResource {
    name: string;
    location: string;
    resource_type: string;
    tags: { [key: string]: string };
    resource_group: string;
    account_name: string;
    subscription: string;
    uuid: string;
    account: number;
    region: string;
    icon_path: string;
}

export interface OciAccountScheduleHistory {
    duration: string;
    status: string;
    started_at: string;
    completed_at: string;
    executed_by: string;
}