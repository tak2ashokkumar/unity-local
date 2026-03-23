export interface Co2EmissionByPublicCloudAccount {
    uuid: string;
    name: string;
    platform_type: string;
    co2emission_enabled: boolean;
}

export interface Co2EmissionByDC {
    [key: string]: Co2EmissionData;
}

export interface Co2EmissionByCabinet {
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

export interface Co2EmissionByDCByQuarter {
    [key: string]: Co2EmissionByQuarter;
}

export interface Co2EmissionByQuarter {
    [key: string]: number;
}

export interface GcpCo2EmissionSummaryType {
    total_carbon_footprint_sum: number;
    service_names: number;
    project_names: number;
}

export interface Co2EmissionByProduct {
    [key: string]: number;
}

export interface Co2EmissionByProject {
    [key: string]: number;
}

export interface Co2EmissionByRegion {
    [key: string]: number;
}

export interface Co2EMissionByQuarter {
    [key: string]: number;
}

export interface Co2EmissionByMonth {
    [key: string]: number;
}

export interface Co2EmissionByYear {
    [key: string]: number;
}

export interface AwsCo2EmissionAccountInfo {
    name: string;
    account_id: string[];
}

export interface AwsCo2EmissionSummary {
    account_count: number;
    total_emissions: number;
}

export interface AwsCo2EmissionByService {
    [key: string]: number;
}

export interface AwsCo2EmissionByGeography {
    [key: string]: number;
}

export interface AwsCo2EmissionBySubscription {
    [key: string]: number;
}

export interface AwsCo2EmissionByAccountId {
    [key: string]: number;
}

export interface AwsCo2EmissionByAccount {
    [key: string]: number;
}

export interface AwsCo2EMissionByQuarter {
    [key: string]: number;
}

export interface AwsCo2EmissionByMonth {
    [key: string]: number;
}

export interface AwsCo2EmissionByYear {
    [key: string]: number;
}
