interface WidgetTitle {
    datacenterName?: string;
    privateCloudName?: string;
}

interface ProgressDetails {
    available?: number;
    allocated?: number;
    configured?: number;
}

interface Progress {
    vcpu?: ProgressDetails;
    ram?: ProgressDetails;
    storage?: ProgressDetails;
}

interface Alerts {
    failed?: number,
    total?: number
}

interface UtillizationStatus {
    used?: number;
    unUsed?: number;
}

interface Utillization {
    ram?: UtillizationStatus;
    vcpu?: UtillizationStatus;
}

export interface IaasData {
    widgetTitle?: WidgetTitle;
    progress?: Progress;
    vmCount?: number;
    alerts?: Alerts;
    utillization: Utillization
}