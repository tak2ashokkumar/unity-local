export interface BusinessServiceType {
    id: number;
    name: string;
    metadata: Metadata;
}
interface Metadata {
    data: string;
}

export interface RBACGroupType {
    id: number;
    name: string;
    metadata: Metadata;
}
interface Metadata {
    data: string;
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

// export interface NgSelectDropdownType {
//     [key:string] : string[];
// }

export interface DropdownItem {
    name: string;
    disabled?: boolean;
}

export interface NgSelectDropdownType {
    [key: string]: DropdownItem[];
}