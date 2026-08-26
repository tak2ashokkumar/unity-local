export type ConfigFieldType =
    | 'text'
    | 'password'
    | 'number'
    | 'textarea'
    | 'select'
    | 'multiselect'
    | 'checkbox'
    | 'radio'
    | 'range';

export const CONFIG_FIELD_TYPES: ConfigFieldType[] = [
    'text', 'password', 'number', 'textarea',
    'select', 'multiselect', 'checkbox', 'radio', 'range'
];

// Field types that show a Placeholder input
export const PLACEHOLDER_TYPES: ConfigFieldType[] = ['text', 'password', 'number', 'textarea'];
// Field types that show the Options repeater
export const OPTION_TYPES: ConfigFieldType[] = ['select', 'multiselect', 'radio'];
// Field types that show Min / Max / Step
export const RANGE_TYPES: ConfigFieldType[] = ['range', 'number'];

export type ValidatorType = 'regex' | 'min_length' | 'max_length' | 'min' | 'max';
export const VALIDATOR_TYPES: ValidatorType[] = ['regex', 'min_length', 'max_length', 'min', 'max'];

export interface ConfigOption {
    value: string;
    label: string;
}

export interface ConfigValidator {
    type: ValidatorType | '';
    value: string;
}

export interface ConfigurationField {
    key: string;
    type: ConfigFieldType;
    label: string;
    placeholder?: string;
    help_text?: string;
    default?: string | number | boolean;
    unit?: string;
    options?: ConfigOption[];
    min?: number;
    max?: number;
    step?: number;
    validators?: ConfigValidator[];
    required: boolean;
    disabled: boolean;
}

export type PolicyType = 'Mandatory' | 'Recommended' | 'Optional';
export const POLICY_TYPES: PolicyType[] = ['Mandatory', 'Recommended', 'Optional'];

export interface Policy {
    policy: string;
    description: string;
    type: PolicyType | '';
}

export interface SlaBlock {
    provisioning_time: string;
    uptime_sla: string;
    support_level: string;
    response_time: string;
}

export const SUPPORT_LEVELS = ['8x5', '12x5', '24x5', '24x7'];

export interface RequirementsBlock {
    functional: string[];
    technical: string[];
    access_permissions: string[];
    included: string[];
    not_included: string[];
}

export type MappingType = 'catalog_field' | 'static';

export interface InputMapping {
    param_name: string;
    mapping_type: 'catalog_field' | 'static';
    value: any;
    param_type?: string; // raw type string from the source API, drives value editor
}

export type AutomationType = 'Task' | 'Workflow' | '';
export type ManagementType = 'Managed' | 'Unmanaged' | '';
export type BillingModel = 'Free' | 'Flat Rate' | 'Pay As You Go' | 'Tiered' | 'Subscription' | '';
export type Frequency = 'One Time' | 'Hourly' | 'Daily' | 'Monthly' | 'Yearly' | '';
export type PricingBasis = 'Per Instance' | 'Per Order' | 'Per User' | 'Per Unit';

// Payload sent to / received from the API
export interface CatalogItemPayload {
    uuid?: string;
    name: string;
    description: string;
    category: string;
    logo?: File | string | null;
    platform: string;
    service: string;
    datacenter: string | null;
    management_type: ManagementType;
    use_cases: string[];
    key_features: string[];
    configuration: ConfigurationField[];
    billing_model: BillingModel;
    price: number | string | null;
    frequency: Frequency;
    currency: string;
    // UI-only for now; CatalogItem does not expose this field in its API.
    pricing_basis?: PricingBasis;
    cost_mapping: CostComponent[];
    sla: SlaBlock;
    policies: Policy[];
    requirements: RequirementsBlock;
    is_available: boolean;
    allow_quantity: boolean;
    min_quantity: number | null;
    max_quantity: number | null;
    automation_type: AutomationType;
    task: string | null;
    // Legacy detail responses used `workflow`; current responses use
    // `workflow_version` and expose the parent separately for edit patching.
    workflow?: string | null;
    // Read-only parent workflow UUID returned for edit-mode dropdown patching.
    // workflow?: string | null;
    input_mapping: InputMapping[];
    require_approval: boolean;
    workflow_version?: string | null;
    finops_block: string;
}

// Dropdown option shapes returned by the orchestration list endpoints
export interface TaskDropdownItem {
    uuid: string;
    name: string;
}

export interface WorkflowDropdownItem {
    uuid: string;
    w_name: string;
}

export interface WorkflowVersion {
    version: number;
    uuid: string;
}

export interface WorkflowDetail {
    uuid: string;
    name: string;
    version_uuid: string;
    versions: WorkflowVersion[];
}

// GET /api/service_catalog/v1/catalogs/choices/
// Every key is a flat string array used to populate a dropdown.
export interface CatalogMeta {
    category: string[];
    platform: string[];
    management_type: string[];
    billing_model: string[];
    frequency: string[];
    pricing_basis: string[];
    automation_type: string[];
    finops_block?: string[];
}

export interface CatalogDatacenter {
    uuid: string;
    name: string;
}

// Section identifiers used to drive the accordion open/close state
export type CatalogAccordionSection =
    | 'descriptive'
    | 'configuration'
    | 'billing'
    | 'sla'
    | 'governance'
    | 'availability'
    | 'automation';

export const CATALOG_ACCORDION_SECTIONS: CatalogAccordionSection[] = [
    'descriptive', 'configuration', 'billing', 'sla', 'governance', 'availability', 'automation'
];

export const COST_COMPONENT_ALLOWED_KEYS = [
    'cpu', 'ram', 'storage', 'network', 'backup', 'os', 'operational', 'fixed', 'management'
];

export type CostComponentSourceType = 'Config' | 'Static' | 'Fixed';
export type CostComponentOperation = 'Multiply' | 'lookup';

// Raw shape returned by the cost-component API (one entry per allowed key)
export interface CostComponentBackend {
    key: string;        // 'cpu' | 'ram' | 'storage' | ...
    label: string;       // display name, e.g. 'CPU'
    subtitle?: string;    // e.g. '4 Vcpu' or 'Full (GB)'
    unit?: string;
    rate: number;
}

// Form-array shape (backend fields + user-picked source config)
export interface CostComponent {
    key: string;
    label: string;
    subtitle?: string;
    unit?: string;
    rate: number;
    rate_frequency: string;
    base_quantity?: number;
    source: CostComponentSourceType;
    config_key?: string;      // only for source_type = 'config'
    count?: number | null;    // for 'static' | 'fixed'
    mapping_type?: CostComponentOperation; // for 'config' | 'static'
    sentence?: string;
    price?: number | null;    // final amount calculated for this cost row
}

// export interface CostComponent {
//     component: string;
//     formula: string;
// }

export const FREQUENCY_OPTIONS = ['Hourly', 'Daily', 'Monthly'];

export const FREQUENCY_FACTOR: { [key: string]: number } = {
    'Monthly': 1,
    'Daily': 1 / 30,
    'Hourly': 1 / (30 * 24)
};

export interface FinopsBuildingBlock {
    id: number;
    uuid: string;
    building_block_code: string;
    description?: string;
    component: any; // same shape as your sample JSON's `component` key
    basic?: {
        license_model?: string;
        [key: string]: any;
    };
    [key: string]: any;
    finops_cost?: {
        billing_currency: 'USD' | 'EUR' | string;
    };
}

export const CURRENCY_SYMBOLS: { [key: string]: string } = {
    USD: '$',
    EUR: '€'
};

// Normalizes the many param_type spellings from Task vs Workflow APIs
// into a small set of UI control kinds.
export type ParamControlKind = 'text' | 'number' | 'boolean' | 'list' | 'dictionary' | 'secret'
    | 'cloud_account' | 'credential' | 'target';

const PARAM_TYPE_MAP: { [key: string]: ParamControlKind } = {
    'String': 'text',
    'Text': 'text',
    'Number': 'number',
    'Maths': 'number',
    'Boolean': 'boolean',
    'List': 'list',
    'Dictionary': 'dictionary',
    'Secret': 'secret',
    'Password': 'secret',
    'Cloud Account': 'cloud_account',
    'Credential': 'credential',
    'Target': 'target'
};

export function normalizeParamType(paramType: string): ParamControlKind {
    return PARAM_TYPE_MAP[paramType] || 'text';
}

export interface TaskParameterInput {
    default_value: any;
    param_name: string;
    param_type: string;
    filters?: any;
    template?: string;
    attribute?: string;
    template_name?: string;
    label?: string;
}

export interface TaskParametersResponse {
    inputs: TaskParameterInput[];
    [key: string]: any;
}

export interface WorkflowParameterInput {
    default_value: any;
    param_name: string;
    param_type: string;
}

export interface WorkflowParametersResponse {
    inputs: WorkflowParameterInput[];
}
