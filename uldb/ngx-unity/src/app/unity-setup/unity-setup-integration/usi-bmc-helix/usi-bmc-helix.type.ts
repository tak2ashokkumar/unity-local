import { UnityScheduleType } from "src/app/shared/SharedEntityTypes/schedule.type";
import { EntityFastType, LabelValueType, UnityResourceType } from "src/app/shared/SharedEntityTypes/unity-utils.type";

export interface BMCHelixInstance {
    id: number;
    schedule_meta: UnityScheduleType;
    name: string;
    collector: EntityFastType;
    uuid: string;
    instance_url: string;
    cmdb_url: string;
    itsm_url: string;
    workflow_url: string;
    is_itsm: boolean;
    is_cmdb: boolean;
    allow_cmdb_delete: boolean;
    is_workflow: boolean;
    is_default: boolean;
    username: string;
    collector_proxy: boolean;
    is_inbound: boolean;
    is_outbound: boolean;
    user: number;
    customer: number;
    cmdb_resources: number;
    config_resources: BMCHelixInstanceConfigResources;
    url_type: string;
}

export interface BMCHelixInstanceConfigResources {
    resource_types: BMCHelixInstanceConfigResourceType[];
    existing_data_sync: boolean;
    dataset: string;
}

export interface BMCHelixInstanceConfigResourceType {
    unity_device: string;
    cloud_resource_name: string;
    resource_type: BMCHelixResourceType;
    attribute_mapping: BMCHelixInstanceAttributeMapping[];
    relationship_types: BMCHelixInstanceRelationshipType[];
    relationship_mapping: boolean;
}

export interface BMCHelixInstanceRelationshipType {
    unity_child_device: string;
    resource_type: BMCHelixResourceType;
    relationship_type: BMCHelixRelationshipType;
    relationship_name: string;
    attribute_mapping: BMCHelixInstanceAttributeMapping[];
}

export interface BMCHelixInstanceAttributeMapping {
    'default': string;
    bmc_attr: string;
    unity_attr: string;
    inbound: boolean;
}

export interface BMCHelixDataset {
    name: string;
    last_modified_date: string;
    dataset_security_permissions: any[];
    accessibility: string;
    dataset_type: string;
    id: string;
}

export interface BMCHelixResourceType {
    namespace: string;
    name: string;

    // client side added for feasibility
    attrs?: UnityResourceType[];
}

export interface BMCHelixRelationshipType {
    namespace: string;
    name: string;
}

export interface BMCHelixResourceAttributes {
    datatype: string;
    default_items: string[];
    name: string;
    mode: string;
}

export interface BMCHelixAccountHistoryType {
    status: string;
    device_type: string;
    cmdb_account: string;
    ci_data: any;
    execution_time: string;
    completion_time: string;
}

export interface CollectorType {
    name: string;
    uuid: string;
}

export interface BMCHelixInstanceUnityOneDeviceType {
    label: string;
    value: string;
    inbound?: LabelValueType[];
    outbound?: LabelValueType[];
    children?: BMCHelixInstanceUnityOneDeviceType[];
}

export interface UnityOneModalFieldsByDeviceType {
    inbound: LabelValueType[];
    outbound: LabelValueType[];
}

export interface BMCHelixRelationshipType {
    namespace: string;
    name: string;

    // client side added for feasibility
    attrs?: UnityResourceType[];
}