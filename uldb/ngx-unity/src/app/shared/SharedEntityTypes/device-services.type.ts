export interface DeviceServices {
    name: string;
    description: string;
    status: string;
    service_type: string;
    created_at: string;
    updated_at: string;
}

export interface DeviceServicesSummaryType {
    unknown: number;
    running: number;
    stopped: number;
    total_services: number;
}