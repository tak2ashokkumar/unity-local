import { DeviceMonitoringType } from "src/app/shared/SharedEntityTypes/devices-monitoring.type";

//Building block List response type
export interface BuildingBlockListType {
    id: number;
    ops_components: OpsComponentsDataType;
    fixed_components: FixedComponentsDataType;
    func_components: FuncComponentsDataType;
    business_unit: BusinessUnitDataType;
    finops_cost: FinopsCostDataType;
    uuid: string;
    description: string;
    building_block_code: string;
    subcategories: string[];
    license_cost_per_core_vm: string;
    purchase_cost_per_server: string;
    maintenance_cost_per_host: string;
    license_model: string;
    license_cost_center: string;
    environment: string;
    workload_type: string;
    host_deployment_type: string;
    virtualization_type: string;
    service: ServiceDataType;
    allocation_type: string;
    allocation_strategy: string;
    customer: number;
    device_types: string[];
    devices: DeviceDataType[];
}
interface OpsComponentsDataType {
    id: number;
    uuid: string;
    operational_usage_metric: string;
    operational_metric_unit: string;
    operational_rate_value: number;
    operational_rate_frequency: string;
}
interface FixedComponentsDataType {
    id: number;
    uuid: string;
    fixed_usage_metric: string;
    fixed_metric_unit: string;
    fixed_rate_value: number;
    fixed_rate_frequency: string;
}
interface FuncComponentsDataType {
    compute: Compute;
    os_config: null;
    network: Network;
    backup: Backup;
}
interface Compute {
    id: number;
    uuid: string;
    cpu_count: number;
    cpu_type: string;
    cpu_metric_type: string;
    cpu_metric_unit: string;
    cpu_rate_value: number;
    cpu_rate_frequency: string;
    ram_size: number;
    ram_metric_type: string;
    ram_metric_unit: string;
    ram_rate_value: number;
    ram_rate_frequency: string;
    storage_type: string;
    storage_count: number;
    storage_allocated_capacity: number;
    storage_rate_value: number;
    storage_rate_frequency: string;
}
interface Network {
    id: number;
    uuid: string;
    network_resource_type: string[];
    network_type: string;
    network_dns_metric_type: string;
    network_dns_metric_unit: string;
    network_dns_rate_value: number;
    network_dns_rate_frequency: string;
    network_port_metric_type: string;
    network_port_metric_unit: string;
    network_port_rate_value: number;
    network_port_rate_frequency: string;
}
interface Backup {
    id: number;
    uuid: string;
    backup_type: string;
    backup_metric_type: string;
    backup_metric_unit: string;
    backup_rate_value: number;
    backup_rate_frequency: string;
}
interface BusinessUnitDataType {
    id: number;
    uuid: string;
    name: string;
    description: null;
    tags: string;
    customer: number;
}
interface FinopsCostDataType {
    id: number;
    uuid: string;
    billing_currency: string;
    budget_amount: number;
    budget_period: string;
    customer: number;
}

interface ServiceDataType {
    id: number;
    name: string;
    uuid: string;
    hostname: any;
    latency: any;
    throughput: any;
    device_id: any;
    content_type: any;
}

export class BuildingBlockViewData {
    id: number;
    uuid: string;
    customer: number;
    //basic form data
    allocationStrategy: string;
    buildingBlockCode: string;
    hostDeploymentType: string;
    budgetPeriod: string;
    virtualizationType: string;
    tags: string;
    description: string;
    billingCurrency: string;
    purchaseCostPerServer: string;
    environment: string;
    applications: string;
    businessUnit: string;
    workloadType: string;
    allocationType: string;
    licenseModel: string;
    licenseCostPerCoreVm: string;
    maintenanceCostPerHost: string;
    licenseCostCenter: string;
    budgetAmount: string;
}

//For CRUD

export interface DeviceDataType {
  id: number;
  uuid: string;
  name: string;
  monitoring: DeviceMonitoringType;
  device_type: string;

  //for UI Purpose
  deviceIcon: string;
  selected: boolean;
  toBeRemoved: boolean;
}

export interface BuildingBlockDataType {
    id: number;
    uuid: string;
    basic: BasicDataType;
    customer: number;
    component: ComponentDataType;
}
export interface BasicDataType {
    allocation_strategy: string;
    building_block_code: string;
    host_deployment_type: string;
    budget_period: string;
    virtualization_type: string;
    tags: string;
    description: string;
    billing_currency: string;
    purchase_cost_per_server: string;
    environment: string;
    applications: string;
    business_unit: string;
    workload_type: string;
    allocation_type: string;
    license_model: string;
    license_cost_per_core: string;
    support_cost_per_host: string;
    license_cost_center: string;
    budget_amount: number;
}

export interface ComponentDataType {
    sub_categories: string[];
    cpu: CpuDataType;
    ram: RamDataType;
    storage: StorageDataType;
    network: NetworkDataType;
    backup: BackupDataType;
    os: OsDataType;
    operational: OperationalDataType;
    fixed: FixedDataType;
}
interface CpuDataType {
    cpu_count: number;
    cpu_type: string;
    cpu_metric_type: string;
    cpu_metric_unit: string;
    cpu_rate_value: number;
    cpu_rate_frequency: string;
}
interface RamDataType {
    ram_size: number;
    ram_metric_type: string;
    ram_metric_unit: string;
    ram_rate_value: number;
    ram_rate_frequency: string;
}
interface StorageDataType {
    storage_count: number;
    allocated_capacity: number;
    storage_type: string;
    storage_rate_value: number;
    storage_rate_frequency: string;
}
interface NetworkDataType {
    netork_resource_type: string[];
    network_type: string;
    netork_dns_metric_type: string;
    netork_dns_metric_unit: string;
    netork_dns_rate_value: number;
    netork_dns_rate_frequency: string;
    netork_port_metric_type: string;
    netork_port_metric_unit: string;
    netork_port_rate_value: number;
    netork_port_rate_frequency: string;
}
interface BackupDataType {
    backup_type: string;
    backup_metric_type: string;
    backup_metric_unit: string;
    backup_rate_value: number;
    backup_rate_frequency: string;
}
interface OsDataType {
    os_type: string;
    os_vendor: string;
    os_distribution: string;
    os_support_contract: string;
    os_metric_type: string;
    os_metric_unit: string;
    os_rate_value: number;
    os_rate_frequency: string;
}
interface OperationalDataType {
    operational_usage_metric: string;
    operational_metric_unit: string;
    operational_rate_value: number;
    operational_rate_frequency: string;
}
interface FixedDataType {
    fixed_usage_metric: string;
    fixed_metric_unit: string;
    fixed_rate_value: number;
    fixed_rate_frequency: string;
}

export interface stepType {
    label: string,
    icon: string,
    active: boolean,
    disabled: boolean,
    valid: boolean,
    form: string
}

export interface DropdownViewType {
    [key:string] : DropdownType
}

export interface DropdownType {
    id: number;
    uuid: string;
    dropdown_name: string;
    dropdown_values: string[];
    addition_allowed: boolean;
    created_at: string;
    customer: number;
    created_by: null;
}

export interface CurrenyType {
    name: string;
    disabled: boolean
}

//For CRUD - Basic Form
export interface CurrencyObjType {
  name: string,
  disabled: boolean
}

export interface NgSelectDropdownType {
    [key:string] : string[];
}

export class NgSelectDropdownData {
    [key:string] : string[];
}