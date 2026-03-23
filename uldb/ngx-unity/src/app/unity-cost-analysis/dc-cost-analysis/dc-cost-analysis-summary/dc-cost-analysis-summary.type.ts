
export interface CostSummaryInfo {
    datacenter: DatacenterInfo;
    total_cabinets_count: number;
    total_pdus_count: number;
    bill_date: string;
    bill_amount: number;
    cost_planner: number;
    bill_details: BillDetailsItem[];
}

export interface DatacenterInfo {
    id: number;
    uuid: string;
    name: string;
    location: string;
}

export interface BillDetailsItem {
    id: number;
    cost: number;
    device_type: string;
    device_object: DeviceObjectInfo;
}

export interface DeviceObjectInfo {
    id: number;
    uuid: string;
    name: string;
    contract_start_date: string;
    contract_end_date: string;
    renewal: string;
    annual_escalation: string;
    model?: string;
    power_circuit?: string;
    cabinet?: string;
}

export interface WidgetSummaryInfo {
    total_cabinets: number;
    billed_datacenters: number;
    billed_cabinets: number;
    cabinet_cost: number;
    total_datacenters: number;
    dc_cost: number;
    pdu_cost: number;
    total_pdus: number;
    billed_pdus: number;
}

export interface DCCostAnalysisChartType {
    id: number;
    last_12_months: DCCostAnalysisChartLast12MonthsType[];
    name: string;
}
export interface DCCostAnalysisChartLast12MonthsType {
    amount: number;
    month: string;
}
