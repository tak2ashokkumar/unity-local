export interface serverHealthType {
    name: string;
    warning: number;
    critical: number;
    ok: number
}

export interface serverInfoType {
    id: number;
    uuid: string;
    name: string;
    odata_id: string;
    status: string;
    state: string;
    device_id: number;
    manufacturer: string;
    model: string;
    bios_version: string | null;
    asset_tag: string | null;
    part_number: string;
    sku: string;
    serial_number: string;
    system_type: string;
    power_state: string;
    content_type: number;
}

export interface FansWidgetApiResponse {
    count: number;
    results: FansWidgetType[];
}

export interface FansWidgetType {
    name: string;
    reading: number;
    status: string;
    state: string;
    lower_threshold_warning: number;
    lower_threshold_critical: number;
    upper_threshold_warning: number;
    upper_threshold_critical: number;
}

export interface PowerStatsWidgetApiResponse {
    count: number;
    results: PowerStatsWidgetType[];
}

export interface PowerStatsWidgetType {
    name: string;
    firmware_version: string;
    status: string;
    state: string;
    part_number: string;
    power_supply_type: string;
    serial_number: string;
    output_wattage: number | String;
    input_wattage: number | String;
    line_input_voltage: number;
    line_input_voltage_type: string;
    last_power_output_watts: number;
}

export interface CPUWidgetApiResponse {
    count: number;
    results: CPUWidgetType[];
}

export interface CPUWidgetType {
    name: string;
    total_core: number;
    max_speed: number;
}

export interface MemoryWidgetApiResponse {
    count: number;
    results: MemoryWidgetType[];
}

export interface MemoryWidgetType {
    name: string;
    speed: string;
}

export interface TemperatureWidgetApiResponse {
    count: number;
    results: TemperatureWidgetType[];
}
export interface TemperatureWidgetType {
    name: string;
    reading_celsius: number;
    upper_threshold_critical: number;
    lower_threshold_warning: number;
    lower_threshold_critical: number;
    upper_threshold_warning: number;
    state: string;
    status: string;
}

export interface PhysicalDiskWidgetApiResponse {
    count: number;
    results: PhysicalDiskWidgetType[];
}
export interface PhysicalDiskWidgetType {
    name: string;
    status: string;
    state: string;
    disk_type: string;
    media_type: string;
    model: string;
    manufacturer: string;
    size: string;
    serial_number: string;
}

export interface VirtualDiskType {
    name: string;
    status: string;
    state: string;
    disk_type: string;
    media_type: string;
    model: string;
    manufacturer: string;
    size: string;
    serial_number: string;
}

export interface ChassisWidgetType {
    name: string;
    status: string;
    state: string;
    manufacturer: string;
    model: string;
    chassis_type: string;
    part_number: number | String;
    sku: string;
    serial_number: string;
}

export interface VoltageWidgetType {
    name: string;
    reading_volts: number | String;
    upper_threshold_critical: number | String;
    lower_threshold_warning: number | String;
    lower_threshold_critical: number | String;
    upper_threshold_warning: number | String;
    state: string;
    status: string;
}

export interface ProcessorsWidgetType {
    name: string;
    status: string;
    state: string;
    total_core: number | String;
    total_threads: number | String;
    processor_type: string;
    manufacturer: string;
    model: string;
    max_speed: number | String;
}

export interface ManagersWidgetType {
    name: string;
    firmware_version: string;
    status: string;
    state: string;
    manufacturer: string;
    model: string;
    manager_type: string;
}

export interface EnclosuresWidgetType {
    name: string;
    status: string;
    state: string;
    manufacturer: string;
    model: string;
    asset_tag: string
    chassis_type: string;
    part_number: string;
    sku: string;
    serial_number: string;
}

export interface StorageControllerWidgetType {
    name: string;
    status: string;
    state: string;
    manufacturer: string;
    model: string;
    speed: string
    firmware_version: string;
    serial_number: string;
}
export interface BatteriesWidgetType {
    name: string;
    status: string;
    state: string;
}