interface CustomDevice {
    url: string;
    id: number;
    name: string;
    description: string;
    type: string;
    uptime_robot_id: string;
    customers: CustomersItem[];
    cabinet: any;
    uuid: string;
    created_at: string;
    updated_at: string;
    salesforce_id: any;
    status: string;
    asset_tag: any;
    serial_number: any;
    is_shared: boolean;
    management_ip: any;
    ip_address: any;
    snmp_community: string;
    position: number;
    size: number;
    observium_host: any;
}
interface CustomersItem {
    url: string;
    id: number;
    name: string;
    storage: string;
    uuid: string;
}
