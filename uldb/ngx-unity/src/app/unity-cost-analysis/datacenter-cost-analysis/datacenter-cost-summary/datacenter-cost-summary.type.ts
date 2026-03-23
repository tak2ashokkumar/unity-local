export interface CostAnalysisDCList {
    dc_uuid: string;
    name: string;
    location: string;
    lat: string;
    long: string;
    status: CostAnalysisDCStatus[];
    bill: CostAnalysisDCBill;
}
export interface CostAnalysisDCStatus {
    status: string;
    category: string;
}

export interface CostAnalysisDCBill {
    amount: number;
    uuid: string;
}


export interface CostAnalysisDCSummary {
    billed_cabinet_count: number;
    billed_pdu_count: number;
    pdu_monthly_cost: number;
    amount: number;
    cabinet_monthly_ru_cost: number;
    billied_dc_count: number;
}