import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

export interface DeviceMonitoringStatus {
    uuid: string;
    status: string;
    uptime: string;
    cloud_type?: string;
    device_uuid: string;
    failed_alerts: string;
    device_category: string;
    device_name: string;
    downtime: string;
    last_rebooted: string;
    memory?: string;
    cpu?: number | string;
    usage_percentage?: number | string;
    server_type?: string;
    monitoring: DeviceMonitoringType;
}

export interface DeviceMonitoringStatusViewData extends DeviceMonitoringStatus {
    uuid: string;
    deviceType: DeviceMapping;
    status: string;
    statusTooltipMessage: string;
    statusBackGround: string;
    statusIcon: string;
    uptime: string;
    cloud_type?: string;
    device_uuid: string;
    failed_alerts: string;
    device_category: string;
    device_name: string;
    last_rebooted: string;
    memory?: string;
    memoryBackGround: string;
    memoryTooltipMessage: string;
    memoryText: string;
    cpu?: number | string;
    cpuBackGround: string;
    cpuTooltipMessage: string;
    cpuText: string;

    usage_percentage?: number | string;
    usageBackGround: string;
    usageTooltipMessage: string;
    usageText: string;

    errorBackGround: string;
    errorTooltipMessage: string;
    errorText: string;

    widgetwidthClass: string;
    monitoring: DeviceMonitoringType;
}

export interface DeviceMonitoringAlerts {
    alert_id: number;
    description: string;
    severity: string;
    date_time: string;
    device_name: string;
    cloud_name: null;
}