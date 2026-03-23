export interface TotalCostWidget {
    current_period: TotalCostWidgetData;
    frequency: string;
    previous_period: TotalCostWidgetData;
    percentage_change: number;
}
export interface TotalCostWidgetData {
    total_cost: number;
    start: string;
    end: string;
}

export interface DeviceCountWidget {
    current_period: DeviceCountWidgetData;
    frequency: string;
    previous_period: DeviceCountWidgetData;
    percentage_change: number;
}
export interface DeviceCountWidgetData {
    device_count: number;
    start: string;
    end: string;
}

export interface IdleVMSWidget {
    idle_vm_count_change: string;
    data: IdleVMSData[];
    previous_idle_vm_count: number;
    idle_vm_count: number;
}
export interface IdleVMSData {
    building_block: string;
    total_cost: number;
    cpu_usage: number;
    memory_usage: number;
    device_name: string;
}

export interface CostByDeviceTypeWidget {
    frequency: string;
    device_type_costs: CostByDeviceTypeWidgetData[];
}
export interface CostByDeviceTypeWidgetData {
    storage_cost: number;
    fixed_cost: number;
    potential_saving: number;
    backup_cost: number;
    device_type: string;
    label: string;
    compute_cost: number;
    os_cost: number;
    savings_percent: number;
    total_cost: number;
    operational_cost: number;
    network_cost: number;    
}

export interface CostByCostCenterWidget {
    total_cost: number;
    potential_saving: number;
    license_cost_center: string;
    budget_amount: number;
}

export interface CostByVMWidget {
    allocated: number;
    over_used: number;
    device_name: string;
}

export interface CostByBusinessUnitWidget {
    total_cost: number;
    business_unit: string;
    potential_saving: number;
    idle_vm_cost: number;
    budget_amount: number;
}

export interface CostByApplicationWidget {
    total_cost: number;
    application: string;
    allocated_percentage: number;
    over_used_percentage: number;
}

export interface CostByOSWidget {
    total_cost: number;
    os: string;
    cost_percentage: number;
}

export interface OperationalCostByService {
    application: string;
    operational_cost_percent: number;
    operational_cost: number;
}

export interface FixedCostByService {
    application: string;
    fixed_cost_percent: number;
    fixed_cost: number;
}

// export interface OperationalCostByService {
//     [key: string]: CostByServiceData;
// }
// export interface FixedCostByService {
//     [key: string]: CostByServiceData;
// }
export interface CostByServiceData {
    percentage: number;
    cost: number;
}

export interface BudgetAnomalyWidget {
    total_cost: number;
    over_budget_percent: number;
    over_budget: number;
    device_name: string;
}

// export interface BudgetAnomaly {
//     [key: string]: BudgetAnomalyData;
// }
// export interface BudgetAnomalyData {
//     allocated: number;
//     over_used: number;
// }


export interface CostUtilizationByMetrics {
    metrics: CostUtilizationMetrics;
    frequency: string;
}
export interface CostUtilizationMetrics {
    storage: CostUtilizationDataByMetric;
    cpu: CostUtilizationDataByMetric;
    memory: CostUtilizationDataByMetric;
}
export interface CostUtilizationDataByMetric {
    peak_utilization: number;
    total_cost: number;
    average_cost: number; // has to add from server side
    data_points: CostUtilizationDataPoints[];
}
export interface CostUtilizationDataPoints {
    date: string;
    avg_utilization: number;
}















export interface MetricAndRateValue {
    [key: string]: string;
}
export interface MetricDistribution {
    [key: string]: string;
}
export interface MetricRateFrequency {
    [key: string]: string;
}

export interface CostAlerts {
    threshold_value: string;
    alert_id: string;
    actual_value: string;
    severity: string;
    alert_triggered_on: string;
    scope: string;
    threshold_type: string;
    alert_name: string;
}

export interface BudgetDetailsByDevice {
    budget_utilization: BudgetUtilizationByDevice;
    application_service: string;
    management_ip: string;
    budget_period: string;
    allocation_type: string;
    host_deployment: string;
    budget_amount: string;
    device_name: string;
}
export interface BudgetUtilizationByDevice {
    used: string;
    free: string;
}

export interface CostAnomalyType {
    device_name: string;
    building_block: string;
    management_ip: string;
    frequency: string;
    budget_amount: string;
    total_cost: string;
    over_budget: string;
    over_budget_percent: number;
    status: string;
}