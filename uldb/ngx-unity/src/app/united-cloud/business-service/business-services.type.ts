export interface BusinessUnits {
    business_unit_id: string;
    business_unit_name: string;
}
export interface BULicenceCostCenter {
    license_centre__name: string;
    license_centre_id: number;
}
export interface BUCostCenterApplications {
    app_name__name: string;
    app_name_id: number;
}

export interface BUCostCenterApplicationSummary {
    latency: string;
    throughput: string;
    down_count: number;
    up_count: number;
    availability: string;
    total_requests: string;
    response_time: string;
    app_memory: string;
}