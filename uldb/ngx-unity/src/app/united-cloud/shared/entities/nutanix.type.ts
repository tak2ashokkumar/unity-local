export interface NutanixDataStore {
    name: string;
    summary: NutanixDataStoreSummary;
}
export interface NutanixDataStoreSummary {
    access: string;
    provisioned: NutanixDataStoreSummaryValueUnitType;
    type: string;
    capacity: NutanixDataStoreSummaryValueUnitType;
    freespace: NutanixDataStoreSummaryValueUnitType;
    provisioned_percentage: NutanixDataStoreSummaryValueUnitType;
    unity: boolean;
}

export interface NutanixDataStoreSummaryValueUnitType {
    value: number;
    unit: string;
}

export interface NutanixDeviceDataType {
    status: string;
    last_discovered: string;
    cpu_usage: string;
    name: string;
    device_uuid: string;
    free_storage_pct: string;
    os: string;
    total_storage: string;
    used_storage: string;
    device_type: string;
    first_discovered: string;
    ip_address: string;
    memory_usage: string;
}
