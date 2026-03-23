interface CabinetDevice {
    firewalls: FirewallItem[];
    switches: SwitchItem[];
    load_balancers: LoadBalancerItem[];
    servers: ServersItem[];
    storage_devices: StorageItem[];
    custom_devices: CustomdeviceItem[];
    [key: string]: any;
}