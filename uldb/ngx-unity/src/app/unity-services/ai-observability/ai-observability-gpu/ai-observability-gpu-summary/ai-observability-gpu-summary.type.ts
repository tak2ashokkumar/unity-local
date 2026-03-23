export interface GpuListType {
    service_type: string;
    uuid: string;
    name: string;
}

export interface DurationDropdownType {
    period: string;
    from: string;
    to: string;
}

export interface GpuSummaryType {
    avg_gpu_utilization: ValueAndUnitType;
    avg_gpu_temperature: ValueAndUnitType;
    avg_gpu_power_draw: ValueAndUnitType;
    avg_gpu_memory_used: ValueAndUnitType;
}

export interface ValueAndUnitType {
    value: number;
    unit: string;
}

export interface AvgUtilizationPerType {
    gpu_utilization: ValueAndUnitType;
    gpu_dec_utilization: ValueAndUnitType;
    gpu_enc_utilization: ValueAndUnitType;
    timestamp: string;
}

export interface AvgTemperatureType {
    timestamp: string;
    gpu_temperature: ValueAndUnitType;
}

export interface AvgMemoryType {
    gpu_memory_available: ValueAndUnitType;
    timestamp: string;
    gpu_memory_free: ValueAndUnitType;
    gpu_memory_total: ValueAndUnitType;
    gpu_memory_used: ValueAndUnitType;
}

export interface AvgPowerType {
    timestamp: string;
    gpu_power_draw: ValueAndUnitType;
    gpu_power_limit: ValueAndUnitType;
}

export interface AvgFanSpeedType {
    gpu_fan_speed: ValueAndUnitType;
    timestamp: string;
}