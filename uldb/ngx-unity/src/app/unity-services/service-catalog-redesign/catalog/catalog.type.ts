export interface SidebarNavItem {
    label: string;
    icon: string;
    href: string;
    active: boolean;
}

export interface CategoryOption {
    key: string;
    label: string;
}

export interface CatalogItem {
    uuid: string;
    name: string;
    description: string;
    logo: string | null;
    logo_url?: string | null;
    catalog_type: string;      // e.g. "Task"
    cloud_type: string;        // e.g. "Azure"
    category: string;          // e.g. "Compute"
    price: string;
    frequency?: string;        // e.g. "Monthly" | "Daily" | "Hourly"
    visibility: string;        // e.g. "All Tenants"
    currency: string;
    sla?: SlaInfo | [];        // [] when no SLA configured, object otherwise
    created_at: string;
    updated_at: string;
    edited_by: number | null;
    created_by: number;
    orders_count: number;
    drafts_count: number;
    building_block: unknown | null;
    overview: number;
    configuration: number;
    pricing: number;
    sla_policy: number;
    requirement: number;
    platform: string;
    datacenter: string | null;
    datacenter_name: string;
    management_type: 'Managed' | 'Unmanaged';
}

export interface SlaInfo {
    provisioning_time?: string;
    uptime_sla?: string;
    response_time?: string;
    support_level?: string;
}

export interface FilterCategory {
    id: string;
    label: string;
    count: number;
}

export interface CatalogFilterOption {
    value: string;
    label: string;
}

export interface CatalogFilterChoices {
    [key: string]: CatalogFilterOption[];
    datacenter: CatalogFilterOption[];
    management_type: CatalogFilterOption[];
    category: CatalogFilterOption[];
    platform: CatalogFilterOption[];
}

export interface ModalTab {
    key: string;
    label: string;
}

export interface ExploreTab {
    key: string;
    icon: string;
    label: string;
}

// ---- Raw API response shapes ----
export interface ConfigFieldValidator {
    type: string;
    value: string;
}

export interface ConfigField {
    key: string;
    type: string;
    label: string;
    placeholder: string;
    help_text: string;
    unit: string;
    default: string;
    min: number | null;
    max: number | null;
    step: number | null;
    options: any[];
    validators: ConfigFieldValidator[];
    required: boolean;
    disabled: boolean;
}

export interface CostComponentApi {
    label: string;
    unit: string;
    rate: string;
    rate_frequency: string;
    mapping_type: string;
    source: 'Config' | 'Static' | 'Fixed';
    config_key?: string;
    count?: number | null;
    base_quantity: number;
    price: number;
    key: string;
    subtitle?: string;
    sentence?: string;
}

export interface PolicyApi {
    policy: string;
    description: string;
    type: 'Mandatory' | 'Recommended' | string;
}

export interface RequirementsApi {
    functional: string[];
    technical: string[];
    access_permissions: string[];
    included: string[];
    not_included: string[];
}

export interface SlaApi {
    provisioning_time: string;
    uptime_sla: string;
    response_time: string;
    support_level: string;
}

export interface InputMappingApi {
    param_name: string;
    mapping_type: string;
    value: string;
}

export interface CatalogDetail {
    uuid: string;
    name: string;
    description: string;
    category: string;
    platform: string;
    datacenter: string | null;
    management_type: 'Managed' | 'Unmanaged';
    service: string;
    use_cases: string[];
    key_features: string[];
    configuration: ConfigurationField[];
    billing_model: string;
    price: string;
    frequency: string;
    currency: string;
    pricing_basis: string;
    cost_mapping: CostComponentApi[];
    policies: PolicyApi[];
    requirements: RequirementsApi;
    is_available: boolean;
    allow_quantity: boolean;
    min_quantity: number;
    max_quantity: number;
    automation_type: string;
    sla: SlaApi;
    task: string | null;
    workflow: string | null;
    input_mapping: InputMappingApi[];
    require_approval: boolean;
    created_at: string;
    updated_at: string;
}

// ---- View-data shapes consumed by the modal template ----
export interface OverviewViewData {
    description: string;
    useCases: string[];
    features: string[];
    quickInfo: { label: string; value: string }[];
}

export interface CostComponentRow {
    name: string;
    unit: string;
    rate: string;
    formula?: string;
    frequency?: string;
}

export interface PricingViewData {
    billingModel: string;
    frequency: string;
    currency: string;
    basis: string;
    estimatedCost: string;
    costComponents: CostComponentRow[];
}

export interface SlaStat {
    icon: string;
    value: string;
    label: string;
}

export interface SlaPolicyRow {
    name: string;
    desc: string;
    type: string;
}

export interface SlaViewData {
    stats: SlaStat[];
    policies: SlaPolicyRow[];
}

export interface RequirementsViewData {
    functional: string[];
    technical: string[];
    access: string[];
    included: string[];
    notIncluded: string[];
}

export interface ConfigurationViewData {
    fields: ConfigurationField[];
}

export interface AddToCartPayload {
    catalog: string;
    quantity: number;
    configuration: { [key: string]: any };
    effective_price: number;
}

export type ConfigFieldType =
    | 'text' | 'password' | 'number' | 'textarea'
    | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'range';

export interface ConfigOption {
    value: string;
    label: string;
}

export interface ConfigValidator {
    type: 'regex' | 'min_length' | 'max_length' | 'min' | 'max' | '';
    value: string;
}

export interface ConfigurationField {
    key: string;
    type: ConfigFieldType;
    label: string;
    placeholder?: string;
    help_text?: string;
    unit?: string;
    default?: string | number | boolean | null;
    min?: number | null;
    max?: number | null;
    step?: number | null;
    options?: ConfigOption[];
    validators?: ConfigValidator[];
    required: boolean;
    disabled: boolean;
}

// ---- Cart API response shapes ----
export interface CartItemCatalogRef {
    category: string;
    platform: string;
    uuid: string;
    name: string;
}

export interface CartItemApi {
    uuid: string;
    catalog_item: CartItemCatalogRef;
    quantity: number;
    rate: string;
    amount: number;
    configuration: any;
}

export interface CartResponse {
    total_items: number;
    subtotal: number;
    tax: number;
    grand_total: number;
    currency: string;
    items: CartItemApi[];
}

// ---- View-data shape consumed by the cart widget template ----
export interface CartLineViewData {
    uuid: string;
    catalogUuid: string;
    name: string;
    category: string;
    platform: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

export interface CartViewData {
    totalItems: number;
    subtotal: number;
    tax: number;
    grandTotal: number;
    currency: string;
    lines: CartLineViewData[];
}
