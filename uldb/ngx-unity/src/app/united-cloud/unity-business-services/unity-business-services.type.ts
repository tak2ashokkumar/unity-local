export interface BusinessUnits {
    business_unit_id: string;
    business_unit_name: string;
}
export interface BULicenceCostCenter {
    license_centre__name: string;
    license_centre_id: number;
}
export interface BUCostCenterApplications {
    app_name__name: string;
    app_name_id: number;
}

export interface BUCostCenterApplicationSummary {
    latency: string;
    throughput: string;
    down_count: number;
    up_count: number;
    availability: string;
    total_requests: string;
    response_time: string;
    app_memory: string;
}

export interface BusinessServiceType {
    id: number;
    name: string;
    metadata: Metadata;
}

export interface RBACGroupType {
    id: number;
    name: string;
    metadata: Metadata;
}

export interface LicenseCostCenterType {
    id: number;
    name: string;
    metadata: Metadata;
}

interface Metadata {
    data: string;
}

export interface BusinessServiceData {
    id: number;
    business_name: string;
    license_cost_centers: LicenseCostCentersItem[];
    description: string;
    rbac_group: number;
    visibility: string;
    customer: number;
}

interface LicenseCostCentersItem {
    id: number;
    type_of_app: string;
    business_criticality: string;
    env: string;
    deployment_model: string;
    cloud_types: string;
    business_service: number;
    license_centre: number;
    app_name: number;
}

export interface BusinessServiceListItem {
    id: number;
    status: string;
    business_name: number;
    business: string;
    license_cost_centers: LicenseCostTCenterTableItem[];
    description: string;
    rbac_group: number;
    visibility: string;
    customer: number;
}

interface LicenseCostTCenterTableItem {
    id: number;
    app_name_id: number;
    app_name: string;
    license_centre_id: number;
    license_centre: string;
    type_of_app: string;
    business_criticality: string;
    env: string;
    deployment_model: string;
    cloud_types: string;
    business_service: number;
}

export interface DropdownItem {
    name: string;
    disabled?: boolean;
}

export interface NgSelectDropdownType {
    [key: string]: DropdownItem[];
}
