import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

export interface AzureAccountsType {
    id: number;
    user: number;
    user_email: string;
    account_name: string;
    user_name: string;
    subscription_id: string;
    uuid: string;
    monitoring: DeviceMonitoringType;
    client_id: string;
    client_secret: string;
    tenant_id: string;
}