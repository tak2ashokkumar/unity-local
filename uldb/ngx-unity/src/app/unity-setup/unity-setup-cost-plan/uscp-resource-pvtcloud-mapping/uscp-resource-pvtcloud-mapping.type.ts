import { PrivateClouds } from "src/app/shared/SharedEntityTypes/private-cloud.type";

export interface AssignedCloudsListType {
    id: number;
    uuid: string;
    customer: number;
    private_cloud: Private_cloud;
    resource: number;
    is_active: boolean;
    assigned_at: string;
    removed_at: null;
    created_date: string;
    modified_date: string;
    created_user: string;
    modified_user: string;
    // cpu_size: number;
    // memory_size: number;
    // memory_unit: string;
    // storage_size: number;
    // storage_unit: string;
    // number_of_disk: number;
    // is_master: boolean;
    // resource_mapping_uuid: string;
}

interface Private_cloud extends PrivateClouds{
    device_count: number;
    resources_list: ResourcesListItem[];
}

interface ResourcesListItem {
    id: number;
    uuid: string;
    resource_name: string;
    cloud_type: string;
    cost_type: string;
}