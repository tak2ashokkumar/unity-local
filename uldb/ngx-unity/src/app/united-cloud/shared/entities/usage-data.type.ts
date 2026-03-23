export interface UsageData {
    allocated_vcpu: number;
    configured_vcpu: number;
    available_vcpu: number;
    vcpu_utilization: UsageDataValueUnitType;
    vcpu_runtime_usage: number;

    allocated_ram: UsageDataValueUnitType;
    configured_ram: UsageDataValueUnitType;
    available_ram: UsageDataValueUnitType;
    ram_utilization: UsageDataValueUnitType;
    ram_runtime_usage: number;

    allocated_storage_disk: UsageDataValueUnitType;
    configured_storage_disk: UsageDataValueUnitType;
    available_storage_disk: UsageDataValueUnitType;
    disk_utilization: UsageDataValueUnitType;

    alert_count: number;
}

export interface UsageDataValueUnitType {
    value: number;
    unit: string;
}

export interface UsageStatsPercent {
    vcpuPercent: number;
    ramPercent: number;
    storageDiskPercent: number;
}