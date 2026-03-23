export interface TaskCatalog {
    uuid: string;
    name: string;
    description: string;
    logo: null | string;
    catalog_type: string;
    orders_count: number;
    drafts_count: number;
    related_object: string;
    task: string;
    workflow: string;
    price: string;
    auto_approval: boolean;
    edited_by: string;
    created_by: number;
    cloud_type: string;
    logo_url: string;
}

export interface catalogCloudList {
    logo: string;
    group_name: string;
    catalog_count: number;
}

export interface Cloud {
    count: number;
    cloud_image: null | string; // Assuming cloud_image can be null or a string
    cloud_name: string
}

export interface CatalogType {
    Task: number;
    Workflow: number;
}

export interface CatalogSummary {
    orders_in_progress: number;
    total_catalogs: number;
    catalog_type: CatalogType;
    cloud: Cloud[];
}

export interface Catalog {
    uuid:string;
    name: string;
    description: string;
    catalog_type: string;
    cloud_type: string;
    logo:string;
    category: string;
    workflow: string;
    task:string;
    inputs: InputsItem[];
    price: number;
    auto_approval: boolean;
}
export interface InputsItem {
    type?: string;
    inputs?: Inputs[];
    name_id?: string;
    uuid?: string;
    name?: string;
}

export interface Inputs {
    default_value?: string;
    param_name?: string;
    attribute?: string;
    param_type?: string;
    template?: string | null;
    template_name?: string;
}