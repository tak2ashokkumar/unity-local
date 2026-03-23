export interface CostCalculatorAWSStorageRate {
    region: string;
    rate: string;
    storage_type: string;
}

export interface CostCalculatorAWSInstanceItem {
    id: number;
    uuid: string;
    instance_type: string;
    region: string;
    ram: string;
    cpu: number;
    storage_inbuilt: number;
    rate: string;
    unit: string;
    description: string;
    os: string;
    nw_performance: string;
    purchase_option: string;
    created_at: string;
    updated_at: string;
}