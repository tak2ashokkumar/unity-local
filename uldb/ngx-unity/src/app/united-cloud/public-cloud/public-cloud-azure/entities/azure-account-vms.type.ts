import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

export interface AzureAccountVMSType {
    name: string;
    type: string;
    vm_type?: string;
    account_id?: number;
    account_name: string;
    resource_group: string;
    availability_set: string;
    provisioning_state: string;
    network_profile: AzureAccountVMSNetworkProfileItem[];
    plan: string;
    power_state: string;
    license_type: string;
    region: string;
    tags: any;
    public_ip?: string;
    id: number;
    management_ip: string;
    ip_type: string;
    os_name: string;
    os_type: string;
    monitoring: DeviceMonitoringType;
    account_uuid: string;
    uuid: string;
}
interface AzureAccountVMSNetworkProfileItem {
    id: string;
    primary: string;
}