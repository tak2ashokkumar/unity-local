export interface CostCalculatorAzureStorageRate {
    id: number;
    uuid: string;
    offer_id: string;
    meter_name: string;
    disk_size: number;
    region: string;
    meter_category: string;
    meter_sub_category: string;
    rate: string;
}

export interface CostCalculatorAzureInstanceItem {
    id: number;
    size: CostCalculatorAzureInstanceSizeData;
    uuid: string;
    offer_id: string;
    tier: string;
    meter_name: string;
    region: string;
    meter_category: string;
    meter_sub_category: string;
    rate: string;
}

export interface CostCalculatorAzureInstanceSizeData {
    id: number;
    name: string;
    uuid: string;
    ram_in_mb: number;
    cpu: number;
    os_disk_size_mb: number;
    resource_disk_size_mb: number;
    data_disk_count: number;
}