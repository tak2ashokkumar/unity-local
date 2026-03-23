import { UnityScheduleType } from "src/app/shared/SharedEntityTypes/schedule.type";
import { UnityResourceType } from "src/app/shared/SharedEntityTypes/unity-utils.type";

export interface ManageEngineInstanceType {
    id: number;
    name: string;
    uuid: string;
    instance_url: string;
    username: string;
    is_default: boolean;
    is_itsm: boolean;
    is_cmdb: boolean;
    is_inbound: boolean;
    is_outbound: boolean;
    is_workflow: boolean;
    allow_delete: boolean;
    client_code: string;
    client_id: string;
    client_secret: string;
    user: number;
    org: number;
    config_resources: ManageEngineInstanceConfigResources;
    url_type: string;
    collector: CollectorType;
    collector_proxy: boolean;
    schedule_meta: UnityScheduleType;
}

export interface ManageEngineInstanceConfigResources {
    resource_types: ManageEngineInstanceConfigResourceType[];
    existing_data_sync: boolean;
}

export interface ManageEngineInstanceConfigResourceType {
    unity_device: string;
    cloud_resource_name: string;
    resource_type: string;
    attribute_mapping: ManageEngineInstanceConfigResourceTypeAttributeMapping[];
}

export interface ManageEngineInstanceConfigResourceTypeAttributeMapping {
    unity_attr: string;
    manage_attr: string;
    default: ManageEngineInstanceConfigResourceAttributeMappingDefaultType;
    inbound: boolean;
}

export interface ManageEngineInstanceConfigResourceAttributeMappingDefaultType {
    name: string;
    value: ManageEngineInstanceAttributeMappingDefaultValueType | string;
}

export interface ManageEngineInstanceAttributeMappingDefaultValueType {
    id: string;
}

export interface ManageEngineResourceType {
    parent_id: string;
    cmdb_id: string;
    id: string;
    value: string;
    name: string;

    // client side added for feasibility
    attrs?: UnityResourceType[];
}

export interface ManageEngineAttributeType {
    field_key: string;
    default_values: ManageEngineAttributeDefalutValuesType[];
    name: string;
}

export interface ManageEngineAttributeDefalutValuesType {
    name: string;
    value: ManageEngineAttributeValueType | string;
}

export interface ManageEngineAttributeValueType {
    id: string;
}

export interface ManageEngineInstanceHistoryType {
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

export interface ManageEngineInstanceUnityOneDeviceType {
    label:string;
    value:string;
    inbound?: ManageEngineInstanceUnityOneDeviceInboundType[]
    outbound?: ManageEngineInstanceUnityOneDeviceOutboundType[]
}

export interface ManageEngineInstanceUnityOneDeviceInboundType {
    label: string;
    value: string;
}

export interface ManageEngineInstanceUnityOneDeviceOutboundType extends ManageEngineInstanceUnityOneDeviceInboundType { }