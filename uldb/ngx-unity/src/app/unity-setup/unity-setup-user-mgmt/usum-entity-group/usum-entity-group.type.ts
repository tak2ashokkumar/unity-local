export interface  EntityGroupDataType{
    id: number;
    uuid: string;
    name: string;
    description: string;
    module_models: ModuleModelsDataType[];
    entity_selection: string;
    is_active: boolean;
    is_default: boolean;
    created_at: string;
    updated_at: string;
    created_by: number;
    created_by_name: string;
    group_objects: GroupObjectsDataType[];
}
export interface ModuleModelsDataType {
    content_type_id: number;
    name: string;
    app_label: string;
    model: string;
}
export interface GroupObjectsDataType {
    id: number;
    uuid: string;
    name: string;
    entity: string;
    entity_id: number;
    //for UI Purpose
    selected: boolean;
    toBeRemoved: boolean;
}