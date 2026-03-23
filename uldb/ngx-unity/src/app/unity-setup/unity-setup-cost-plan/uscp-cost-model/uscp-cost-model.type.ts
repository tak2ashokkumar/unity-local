export interface CostModelInstance {
    id: number;
    created_date: string;
    modified_date: string;
    created_user: string;
    modified_user: string;
    plan_mapping_uuid: string;
    uuid: string;
    plan_name: string;
    plan_description: string;
    plan_type: string;
    regions: string[];
    datacenters: string[];
    disk_type: string;
    price_unit: string;
    price_allocation: string;
    unit_cost_price: number;
    is_active: boolean;
    customer: string;
    is_master: boolean;
}

export interface CostModelHistoryItem {
    id: number;
    created_date: string;
    modified_date: string;
    created_user: string;
    modified_user: string;
    plan_mapping_uuid: string;
    uuid: string;
    plan_name: string;
    plan_description: string;
    plan_type: string;
    price_unit: string;
    price_allocation: string;
    unit_cost_price: number;
    disk_type: string;
    region: string;
    is_active: boolean;
    is_master: boolean;
    customer: number;
}

export interface DatacenterListItem {
    datacenters: string[];
    region: string;
}
