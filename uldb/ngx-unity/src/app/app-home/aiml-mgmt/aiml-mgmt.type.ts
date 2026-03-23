export interface DashboardAIMLConditionsSummary {
    total: DashboardAIMLConditionsSummaryData;
}

export interface DashboardAIMLConditionsSummaryData {
    condition_count: number;
    alert_count: number;
    event_count: number;
    critical: number;
    warning: number;
    information: number;
    noise_reduction: number;
    correlation_reduction: number;
}


export interface DashboardAIMLSummaryAlertCountByDeviceType {
    device_type: string;
    alert_count: number;
}