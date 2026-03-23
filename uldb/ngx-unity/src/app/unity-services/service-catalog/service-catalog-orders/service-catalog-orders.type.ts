export interface ServiceCatalogSummary {
    orders_in_progress: OrdersInProgress;
    category: OrdersByCategory;
    cloud: OrdersByCloud[];
}

export interface OrdersInProgress {
    success: number;
    failed: number;
    in_progress: number;
}

export interface OrdersByCategory {
    Provisioning: number;
    Operational: number;
}

export interface OrdersByCloud {
    count: number;
    cloud_name: string;
    cloud_image: string;
}

export interface ServiceCatalogOrder {
    uuid: string;
    order_id: string;
    catalog_name: string;
    order_type: string;
    created_at: string;
    ordered_by: string;
    price: string;
    order_status: string;
    catalog: string;
}

export interface NewOrdersType {
    uuid: string;
    order_id: string;
    cloud_type: string;
    account_id: string;
    catalog: string;
    catalog_name: string;
    order_status: string;
    price: string;
    vm_image: string;
    resource_plan: string;
    templates: TemplatesItem[];
    inputs: InputsItem[];
    is_approved: boolean;
    order_type: string;
    vm_image_name: string;
    cred_type: null;
    username: null;
    host_meta: HostMeta;
    password: null;
    host: any[];
    ip_address: any[];
    resource_plan_name: string;
    created_at: string;
    updated_at: string;
    edited_by: null;
    ordered_by: string;
    created_by: number;
    credentials: string;
}

export interface TemplatesItem {
    default_value: string;
    label: string;
    dependency_name: string;
    name: string;
    uuid: string;
}
export interface InputsItem {
    default_value: string;
    param_name: string;
    attribute: string;
    param_type: string;
    template: string;
    template_name: string;
}
export interface HostMeta {
    host_type: string;
    tag: string;
    datacenter: string;
    device_category: string;
    cloud: string;
    account_name: string;
    device_type: string;
}