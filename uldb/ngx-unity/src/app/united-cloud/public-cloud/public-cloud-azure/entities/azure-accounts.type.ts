import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

export interface AzureAccountsType {
    id: number;
    user: number;
    user_email: string;
    name: string;
    user_name: string;
    subscription_id: string;
    uuid: string;
    monitoring: DeviceMonitoringType;
    service_count: number;
    resource_count: number;
    is_managed: boolean;
    alert_count: AzureAlertsCountDataType;
    current_month_cost: Current;
    cost_analysis: boolean;
}

export interface AzureAlertsCountDataType {
    information: number;
    critical: number;
    warning: number;
    event_count: number;
}

export interface Current {
    amount: number;
    unit: string;
    month: string;
}

export interface AzureVirtalNetwork {
    name: string;
    id: string;
    provisioning_state: string;
    tags: null;
    location: string;
    subnets: number;
    virtual_network_peerings: null;
    address_prefixes: string;
  }
  
  export interface AzureVirtalNetworkSubnet {
    name: string;
    id: string;
    provisioning_state: string;
    etag: string;
    route_table: null;
    network_security_group: null;
    address_prefix: string;
  }

  export class AzureAccountsViewData {
    constructor() { }
    accountName: string;
    uuid: string;
    accountId: number;
    password: string;
    subscriptionId: string;
    userName: string;
    userEmail: string;
    secret_key: string;
    secret_key_confirm: string;
    statsTooltipMessage: string;
    monitoring: DeviceMonitoringType;
  }