export interface EmissionByTop10TagGroups {
    co2_emitted: number;
    name: string;
}

export interface Co2EmissionByDC {
    [key: string]: Co2EmissionData;
}

export interface Co2EmissionByPrivateCloud {
    [key: string]: Co2EmissionData;
}

export interface Co2EmissionByDeviceType {
    [key: string]: Co2EmissionData;
}

export interface Co2EmissionData {
    co2_emitted: number;
    power_consumed: number;
    device_count: number;
}

export interface Co2EmissionDashboardSummaryDatacenterPublicCloud{
    num_service_names: number;
    num_project_names:number;
    total_co2_sum: number;
    number_of_accounts: number;
    aws_accounts: number;
}

export interface Co2EmissionByQuarter {
    [key: string]: number;
}

export interface Co2EmissionByYear {
    [key: string]: number;
}