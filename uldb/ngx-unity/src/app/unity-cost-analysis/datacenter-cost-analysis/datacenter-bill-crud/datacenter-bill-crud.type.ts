export interface DCBillPDUPowerCircuit {
    url: string;
    id: number;
    name: string;
    full_name: string;
    assettag: string;
    datacenter: string;
    customer: string;
    panel: string;
    circuit: string;
    ampstype: string;
    outlettype: string
    voltagetype: string;
    salesforce_id: string;
}


export interface DCBillData {
    id: number;
    datacenter: DCBillDatacenter;
    power_circuit: DCBillPowerCircuit;
    uuid: string;
    cabinet_rental_model: string;
    cabinet_unit_cost: number;
    power_circuit_cost: number;
    redundant_power: boolean;
    contract_date: string;
    created_at: string;
    updated_at: string;
    created_by: number;
}

export interface DCBillDatacenter {
    url: string;
    id: number;
    uuid: string;
    display_name: string;
    created_at: string;
    updated_at: string;
    name: string;
    location: string;
    lat: string;
    long: string;
    status: DCBillDatacenterStatus[];
    customer: string;
    cabinets: string[];
}

export interface DCBillDatacenterStatus {
    status: string;
    category: string;
}
export interface DCBillPowerCircuit {
    url: string;
    id: number;
    name: string;
}