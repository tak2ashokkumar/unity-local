export interface DatacenterCostPlannerDataType {
    uuid: string;
    id: number;
    name: string;
    description: string;
    datacenter: DatacenterListDatatype[];
    annual_escalation: number;
    contract_start_date: string;
    contract_end_date: string;
    cabinet: CostPlannerEntityDataType[];
    bandwidth: CostPlannerEntityDataType[];
    ipv4: CostPlannerEntityDataType[];
    power: CostPlannerPowerEntityDataType[];
    is_delete: boolean;
}

export interface CostPlannerEntityDataType {
    id: number;
    entity_type: string;
    unit_cost: number;
}

export interface CostPlannerPowerEntityDataType extends CostPlannerEntityDataType {
    pdu_redundant_flag: boolean;
    pdu_redundant_cost: number;
}

export interface DatacenterListDatatype {
    id: number;
    uuid: string;
    name: string;
}