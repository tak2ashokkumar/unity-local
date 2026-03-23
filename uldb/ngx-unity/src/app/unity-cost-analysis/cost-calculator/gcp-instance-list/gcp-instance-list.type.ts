export interface GCPCostCalculatorStorageRate {
    rate: number;
    description: string;
}

export interface GCPCostCalculatorResponseItem {
    cpu: number;
    ram: number;
}

export interface GCPMachineType {
    name: string;
    cpu: string;
    ram: string;
}

export interface GCPSeries {
    name: string;
    code: string;
    machine_types: GCPMachineType[];
}

export interface GCPInstanceType {
    name: string;
    code: string;
    series: GCPSeries[];
}