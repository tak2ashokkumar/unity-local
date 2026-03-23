export interface DataCenterCabinet {
    url: string;
    id: number;
    uuid: string;
    name: string;
    type: string;
    available_size: string;
    customers: DataCenterCustomersItem[];
    cabinet_type: DataCenterCabinetType;
    cage: any;
    model: string;
    colocloud_set: DataCenterColocloudSetItem[];
    size: number;
    capacity: number;
    contract_start_date: string;
    contract_end_date: string;
    cost: string;
    renewal: string;
    annual_escalation: string;
    co2_emission_value: number;
    tags: string[];
}
export interface DataCenterCustomersItem {
    url: string;
    id: number;
    name: string;
    storage: string;
    uuid: string;
}
export interface DataCenterCabinetType {
    url: string;
    id: number;
    cabinet_type: string;
}
export interface DataCenterColocloudSetItem {
    url: string;
    id: number;
    uuid: string;
    created_at: string;
    updated_at: string;
    name: string;
    location: any;
    lat: string;
    long: string;
    status: DataCenterColocloudStatusItem[];
    customer: string;
    cabinets: string[];
}

export interface DataCenterColocloudStatusItem {
    status: string;
    category: string;
}
