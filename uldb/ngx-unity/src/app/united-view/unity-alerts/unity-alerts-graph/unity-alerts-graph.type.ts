export interface AlertsBySeverityChart {
    Information: number;
    Critical: number;
    total_count: number;
    Warning: number;
}

export interface AlertsBySeverityTrend {
    [key: string]: AlertsInfoData;
}

export interface TopDevicesByAlertsChart {
    device_name: string;
    device_count: number;
    Information?: number;
    Warning?: number;
    Critical?: number;
}

export interface TopDevicesByAlertsTrend {
    [key: string]: TopDevicesByAlertsTrendData;
}

export interface AlertsByDCChart {
    [key: string]: AlertsInfoData;
}

export interface AlertsTrendByDC {
    [key: string]: AlertsByDCChart
}

export interface AlertsInfoData {
    Critical: number;
    Information: number;
    Warning: number;
    device_count: number;
}

export interface TopDevicesByAlertsTrendData {
    device_count: number;
    device_name: string;
}