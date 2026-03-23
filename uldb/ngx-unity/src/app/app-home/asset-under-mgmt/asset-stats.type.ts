interface CountStats {
    load_balancer: LoadBalancerCount;
    mac_device: MacMiniCount;
    pod: PODCount;
    firewall: FirewallCount;
    PDU: PDUCount;
    VM: VMCount;
    server: ServerCount;
    switch: SwitchCount;
    bm_server: BmServerCount;
    cabinet: CabinetCount;
    hypervisor: HypervisorCount;
    database: DatabaseCount;
}
interface LoadBalancerCount {
    deviceCountStats: DeviceCountStats;
}
interface MacMiniCount {
    deviceCountStats: DeviceCountStats;
}
interface PODCount {
    deviceCountStats: DeviceCountStats;
}
interface FirewallCount {
    deviceCountStats: DeviceCountStats;
}
interface PDUCount {
    deviceCountStats: DeviceCountStats;
}
interface VMCount {
    deviceCountStats: DeviceCountStats;
}
interface ServerCount {
    deviceCountStats: DeviceCountStats;
}
interface SwitchCount {
    deviceCountStats: DeviceCountStats;
}
interface BmServerCount {
    deviceCountStats: DeviceCountStats;
}
interface CabinetCount {
    deviceCountStats: DeviceCountStats;
}
interface HypervisorCount {
    deviceCountStats: DeviceCountStats;
}
interface DatabaseCount {
    deviceCountStats: DeviceCountStats;
}
interface DeviceCountStats {
    count: number;
}

interface Stats extends DeviceCountStats {
    unknown?: number;
    name: string;
    active_count: number;
    inactive_count: number;
}