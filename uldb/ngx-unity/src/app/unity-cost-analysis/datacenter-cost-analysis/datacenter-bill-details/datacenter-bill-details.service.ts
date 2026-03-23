import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CABINETS_BY_DATACENTER_ID, DC_BILL_DETAILS, GET_DC_COST_DATA, PUDS_BY_DATACENTER_ID } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { PDU } from 'src/app/united-cloud/datacenter/entities/pdus.type';
import { DataCenterCabinet } from 'src/app/united-cloud/shared/entities/datacenter-cabinet.type';
import { CostAnalysisDCList } from '../datacenter-cost-analysis.type';
import { DatacenterBillDetails } from './datacenter-bill-details.type';

@Injectable()
export class DatacenterBillDetailsService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService) { }

  getDatacenters(): Observable<CostAnalysisDCList[]> {
    return this.http.get<CostAnalysisDCList[]>(GET_DC_COST_DATA());
  }

  getDCBillDetails(dcId: string): Observable<DatacenterBillDetails> {
    return this.http.get<DatacenterBillDetails>(DC_BILL_DETAILS(dcId));
  }

  convertToBillView(billdetails: DatacenterBillDetails): BillViewData {
    let viewData: BillViewData = new BillViewData();
    viewData.datacenterName = billdetails.name;

    viewData.numberOfCabinets = billdetails.cabinets_count;
    viewData.billedCabinetCount = billdetails.billed_cabinet_count;
    viewData.cabinetCost = billdetails.cabinet_monthly_ru_cost;

    viewData.numberOfPdus = billdetails.pdus_count;
    viewData.billedPduCount = billdetails.billed_pdu_count;
    viewData.pdusCost = billdetails.pdu_monthly_cost;

    viewData.currentMonthCost = billdetails.amount;
    return viewData;
  }

  getCabinets(dcId: string, criteria: SearchCriteria): Observable<DataCenterCabinet[]> {
    return this.tableService.getData<DataCenterCabinet[]>(CABINETS_BY_DATACENTER_ID(dcId), criteria);
  }

  convertToDCCabinetViewData(cabinets: DataCenterCabinet[]): DCCabinetsViewData[] {
    let viewData: DCCabinetsViewData[] = [];
    cabinets.map(c => {
      let a: DCCabinetsViewData = new DCCabinetsViewData();
      a.name = c.name;
      a.contractStartDate = c.contract_start_date ? this.utilSvc.toUnityOneDateFormat(c.contract_start_date) : 'N/A';
      a.contractEndDate = c.contract_end_date ? this.utilSvc.toUnityOneDateFormat(c.contract_end_date) : 'N/A';
      a.renewal = c.renewal ? c.renewal : 'N/A';
      a.annualEscalation = c.annual_escalation ? `${c.annual_escalation}%` : 'N/A';
      a.cost = `$${c.cost ? c.cost : 0}`;
      viewData.push(a);
    })
    return viewData;
  }

  getPdus(dcId: string, criteria: SearchCriteria): Observable<PDU[]> {
    return this.tableService.getData<PDU[]>(PUDS_BY_DATACENTER_ID(dcId), criteria);
  }

  convertToDCPDUViewData(pdus: PDU[]): DCPdusViewData[] {
    let viewData: DCPdusViewData[] = [];
    pdus.map(p => {
      let a: DCPdusViewData = new DCPdusViewData();
      a.name = p.name;
      a.model = p.model ? p.model : 'N/A';
      a.powerCircuit = p.power_circuit ? p.power_circuit : 'N/A';
      a.cabinet = p.cabinet ? p.cabinet.name : 'N/A';
      a.annualEscalation = p.annual_escalation ? `${p.annual_escalation}%` : 'N/A';
      a.cost = `$${p.cost ? p.cost : 0}`;
      viewData.push(a);
    })
    return viewData;
  }

}

export class DCBillViewData {
  billData: BillViewData;
  cabinets: DCCabinetsViewData[] = [];
  pdus: DCPdusViewData[] = [];
}

export class BillViewData {
  datacenterName: string;
  numberOfCabinets: number;
  billedCabinetCount: number;
  cabinetCost: number;
  numberOfPdus: number;
  billedPduCount: number;
  pdusCost: number;
  currentMonthCost: number;
  constructor() { }
}

export class DCCabinetsViewData {
  name: string;
  contractStartDate: string;
  contractEndDate: string;
  renewal: string;
  annualEscalation: string;
  cost: string;
  constructor() { }
}

export class DCPdusViewData {
  name: string;
  model: string;
  powerCircuit: string;
  cabinet: string;
  annualEscalation: string;
  cost: string;
  constructor() { }
}
