export interface ResourcePlanDataType {
    id: number;
    uuid: string;
    customer: number;
    resource_name: string;
    cloud_type: string;
    cpu_size: number;
    cpu_customization: boolean;
    memory_size: number;
    memory_unit: string;
    memory_customization: boolean;
    storage_size: number;
    storage_unit: string;
    storage_customization: boolean;
    allow_multiple_disk: boolean;
    cost_type: string;
    cost_plans_list: CostPlansListItem[];
    unit_vice_cost: number;
    price_unit: string;
    is_active: boolean;
    lock_plan: boolean;
    created_date: string;
    modified_date: string;
    created_user: string;
    modified_user: string;
    plan_mapping_uuid: string;
    disk_type: string;
    regions: any[];
    is_master: boolean;
    assigned_clouds_list: AssignedCloudsListItem[];
    datacenters: any[];
}

interface AssignedCloudsListItem {
    private_cloud: string;
    resource_mapping_uuid: string;
    account_name: string;
}

// For Crud
export interface UscpResourceModelDataType {
    resource_name: string;
    cloud_types: CloudTypesItem[];
    cloud_type: string;
    regions: string[];
    datacenters: string[];
    cpu_size: number;
    cpu_customization: boolean;
    memory_size: number;
    memory_unit: string;
    memory_customization: boolean;
    storage_size: string;
    storage_unit: string;
    storage_customization: boolean;
    disk_type: string;
    allow_multiple_disk: boolean;
    cost_type: string;
    price_unit: string;
    is_active: boolean;
    lock_plan: boolean;
    customer: string;
    cost_plans_list: CostPlansListType[];
}
export interface CloudTypesItem {
    cloud: string;
}
export interface CostPlansListType {
    cost_plan: string;
}


export interface PrivateCloudListType {
    id: number;
    platform_type: string;
    display_platform: string;
}

export interface ReourceHistoryItem {
    id: number;
    uuid: string;
    customer: number;
    resource_name: string;
    cloud_type: string;
    cpu_size: number;
    cpu_customization: boolean;
    memory_size: number;
    memory_unit: string;
    memory_customization: boolean;
    storage_size: number;
    storage_unit: string;
    cost_type: string;
    storage_customization: boolean;
    allow_multiple_disk: boolean;
    cost_plans_list: CostPlansListItem[];
    price_unit: string;
    is_active: boolean;
    lock_plan: boolean;
    created_date: string;
    modified_date: string;
    created_user: string;
    modified_user: string;
    unit_vice_cost: number;
    plan_mapping_uuid: string;
    disk_type: string;
    region: string;
    is_master: boolean;
}

interface CostPlansListItem {
    plan_name: string;
    cost_plan: string;
}

export interface DatacentersByRegionTypeItem {
    datacenters: string[];
    region: string;
}