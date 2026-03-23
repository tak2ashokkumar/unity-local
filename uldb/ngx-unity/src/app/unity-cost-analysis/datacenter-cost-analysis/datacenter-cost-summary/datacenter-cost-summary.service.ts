import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GET_DC_COST_DATA, GET_DC_BILL_SUMMARY } from 'src/app/shared/api-endpoint.const';
import { CostAnalysisDCList, CostAnalysisDCSummary } from './datacenter-cost-summary.type';

@Injectable()
export class DatacenterCostSummaryService {

  constructor(private http: HttpClient) { }

  getDCBillSummary(): Observable<CostAnalysisDCSummary> {
    return this.http.get<CostAnalysisDCSummary>(GET_DC_BILL_SUMMARY());
  }

  convertToSummaryViewData(summaryData: CostAnalysisDCSummary): DatacenterBillSummaryViewData {
    let viewData: DatacenterBillSummaryViewData = new DatacenterBillSummaryViewData();
    viewData.datacenters = summaryData.billied_dc_count;
    viewData.numberOfCabinets = summaryData.billed_cabinet_count;
    viewData.currentMonthCabinetsCost = summaryData.cabinet_monthly_ru_cost;
    viewData.numberOfPdus = summaryData.billed_pdu_count;
    viewData.currentMonthPdusCost = summaryData.pdu_monthly_cost;
    viewData.currentMonthCost = summaryData.amount;
    return viewData;
  }

  getDCBillingInfo(): Observable<CostAnalysisDCList[]> {
    return this.http.get<CostAnalysisDCList[]>(GET_DC_COST_DATA());
  }

  convertToDcListViewData(dcData: CostAnalysisDCList[]): DCViewData[] {
    let viewData: DCViewData[] = [];
    dcData.map(dc => {
      let a: DCViewData = new DCViewData();
      a.dcId = dc.dc_uuid;
      a.dcName = dc.name;
      a.dcLocation = dc.location;
      a.billId = dc.bill ? dc.bill.uuid : null;
      a.billAmount = dc.bill ? `$${dc.bill.amount}` : 'Bill not added';
      a.editBtnEnabled = dc.bill ? true : false;
      a.editBtnTooltipMsg = dc.bill ? 'Edit Bill' : 'Bill not available';
      a.deleteBtnEnabled = dc.bill ? true : false;
      a.deleteBtnTooltipMsg = dc.bill ? 'Delete Bill' : 'Bill not available';
      a.infoBtnEnabled = dc.bill ? true : false;
      a.infoBtnTooltipMsg = dc.bill ? 'Show Bill Details' : 'Bill not available';
      viewData.push(a);
    })
    return viewData;
  }


}

export class DatacenterCostViewData {
  billSummary: DatacenterBillSummaryViewData;
  dcList: DCViewData[] = [];
}

export class DatacenterBillSummaryViewData {
  datacenters: number;
  numberOfCabinets: number;
  numberOfPdus: number;
  currentMonthCost: number;
  currentMonthCabinetsCost: number;
  currentMonthPdusCost: number;
}

export class DCViewData {
  dcName: string;
  dcLocation: string;
  dcId: string;
  billId: string;
  billAmount: string;
  editBtnEnabled: boolean;
  editBtnTooltipMsg: string;
  deleteBtnEnabled: boolean;
  deleteBtnTooltipMsg: string;
  infoBtnEnabled: boolean;
  infoBtnTooltipMsg: string;
}

