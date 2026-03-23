import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChartDataSets } from 'chart.js';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { DATACENTER_GET_SUMMARY, DATACENTER_WIDGETS_GET_SUMMARY } from 'src/app/shared/api-endpoint.const';
import { ChartConfigService, UnityChartData } from 'src/app/shared/chart-config.service';
import { CostSummaryInfo, DCCostAnalysisChartType, WidgetSummaryInfo } from './dc-cost-analysis-summary.type';

@Injectable()
export class DcCostAnalysisSummaryService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private chartConfigService: ChartConfigService,) { }

  getWidgetSummary(apiDate: string): Observable<WidgetSummaryInfo> {
    return this.http.get<WidgetSummaryInfo>(DATACENTER_WIDGETS_GET_SUMMARY(apiDate));
  }

  convertToWidgetViewData(widgetData: WidgetSummaryInfo): WidgetSummaryInfoViewData {
    let wd: WidgetSummaryInfoViewData = new WidgetSummaryInfoViewData();
    wd.totalCabinets = widgetData.total_cabinets;
    wd.billedDatacenters = widgetData.billed_datacenters;
    wd.billedCabinets = widgetData.billed_cabinets;
    wd.cabinetCost = widgetData.cabinet_cost;
    wd.totalDatacenters = widgetData.total_datacenters;
    wd.dcCost = widgetData.dc_cost;
    wd.pduCost = widgetData.pdu_cost;
    wd.totalPdus = widgetData.total_pdus;
    wd.billedPdus = widgetData.billed_pdus;
    return wd;
  }

  getDatacenterSummary(apiDate: string): Observable<PaginatedResult<CostSummaryInfo>> {
    return this.http.get<PaginatedResult<CostSummaryInfo>>(DATACENTER_GET_SUMMARY(apiDate));
  }

  convertToDCCostViewData(summaryData: CostSummaryInfo[]): CostSummaryInfoViewData[] {
    let tableData: CostSummaryInfoViewData[] = [];
    summaryData.map((sd, index) => {
      let a: CostSummaryInfoViewData = new CostSummaryInfoViewData();

      // Mapping datacenter
      a.id = sd.datacenter.id;
      a.uuid = sd.datacenter.uuid;
      a.name = sd.datacenter.name;
      a.location = sd.datacenter.location;
      a.totalCabinetsCount = sd.total_cabinets_count;
      a.totalPdusCount = sd.total_pdus_count;
      a.billDate = sd.bill_date;
      a.billAmount = sd.bill_amount;
      a.costPlanner = sd.cost_planner;

      if (index == 0) {
        a.isOpen = true;
      }

      const pduBillDetails = sd.bill_details.filter(bd => bd.device_type === 'pdu');
      const cabinetBillDetails = sd.bill_details.filter(bd => bd.device_type === 'cabinet');

      a.pduBillDetails = pduBillDetails.map(bd => {
        let bdView: BillDetailsItemViewData = new BillDetailsItemViewData();
        bdView.id = bd.id;
        bdView.cost = bd.cost;
        bdView.deviceType = bd.device_type;

        bdView.deviceObject = new DeviceObjectInfoViewData();
        bdView.deviceObject.id = bd.device_object.id;
        bdView.deviceObject.uuid = bd.device_object.uuid;
        bdView.deviceObject.name = bd.device_object.name;
        bdView.deviceObject.contractStartDate = bd.device_object.contract_start_date;
        bdView.deviceObject.contractEndDate = bd.device_object.contract_end_date;
        bdView.deviceObject.renewal = bd.device_object.renewal;
        bdView.deviceObject.annualEscalation = bd.device_object.annual_escalation;
        bdView.deviceObject.model = bd.device_object.model;
        bdView.deviceObject.powerCircuit = bd.device_object.power_circuit;
        bdView.deviceObject.cabinet = bd.device_object.cabinet;

        return bdView;
      });

      a.cabinetBillDetails = cabinetBillDetails.map(bd => {
        let bdView: BillDetailsItemViewData = new BillDetailsItemViewData();
        bdView.id = bd.id;
        bdView.cost = bd.cost;
        bdView.deviceType = bd.device_type;

        bdView.deviceObject = new DeviceObjectInfoViewData();
        bdView.deviceObject.id = bd.device_object.id;
        bdView.deviceObject.uuid = bd.device_object.uuid;
        bdView.deviceObject.name = bd.device_object.name;
        bdView.deviceObject.contractStartDate = bd.device_object.contract_start_date;
        bdView.deviceObject.contractEndDate = bd.device_object.contract_end_date;
        bdView.deviceObject.renewal = bd.device_object.renewal;
        bdView.deviceObject.annualEscalation = bd.device_object.annual_escalation;
        bdView.deviceObject.model = bd.device_object.model;
        bdView.deviceObject.powerCircuit = bd.device_object.power_circuit;
        bdView.deviceObject.cabinet = bd.device_object.cabinet;

        return bdView;
      });

      a.billedCabinetsCount = a.cabinetBillDetails.length;
      a.billedPdusCount = a.pduBillDetails.length;

      a.cabinetCost = 0;
      for (const i of a.cabinetBillDetails) {
        a.cabinetCost += i.cost;
      }

      a.pduCost = 0;
      for (const i of a.pduBillDetails) {
        a.pduCost += i.cost;
      }

      tableData.push(a);
    })
    return tableData;
  }

  getDCChartData(dcCostData: CostSummaryInfoViewData[]): Observable<DCCostAnalysisChartType[]> {
    let params: HttpParams = new HttpParams();
    dcCostData.forEach(dc => {
      params = params.append('datacenter_ids', dc.id);
    })
    return this.http.get<DCCostAnalysisChartType[]>(`/customer/colo_cost_summery/graph_summery/`, { params: params });
  }

  convertToDCChartViewData(dcCostData: CostSummaryInfoViewData[], dcChartData: DCCostAnalysisChartType[]) {
    let view: DCCostAnalysisChartViewdata = new DCCostAnalysisChartViewdata();
    let totalCost = 0;
    dcChartData.forEach(dc => {
      dc.last_12_months.forEach(mc => {
        totalCost += mc.amount;
      })
    })
    view.cost = `$${totalCost.toFixed(2)}`;
    view.form = this.getDCChartForm(dcCostData);
    view.chartData = this.convertToDCChartData(dcChartData);
    return view;
  }

  getDCChartForm(dcCostData: CostSummaryInfoViewData[]): FormGroup {
    let dcs: number[] = [];
    dcCostData.forEach(dc => dcs.push(dc.id));
    let form = this.builder.group({
      'datacenters': [dcs, [Validators.required]]
    });
    return form;
  }

  getLast12Months(): any[] {
    var months = [];
    for (var i = 1; i <= 12; i++) {
      let month = moment().subtract(i, "month").startOf("month").format('MMM YYYY');
      months.push(month);
    }
    return months.reverse();
  }

  convertToDCChartData(dcChartData: DCCostAnalysisChartType[]): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'line';
    view.legend = true;
    view.lables = this.getLast12Months();
    let datalables: string[] = dcChartData.map(d => d.name);
    datalables.forEach(dl => {
      let ds: ChartDataSets = {};
      ds.label = dl;
      ds.data = [];
      let dcData = dcChartData.find(d => d.name == dl);
      if (dcData) {
        for (let k = dcData.last_12_months.length; k < 12; k++) {
          ds.data.push(0);
        }
        dcData.last_12_months.forEach(md => {
          ds.data.push(md.amount ? md.amount : 0);
        })
      }
      view.linedata.push(ds);
    })
    view.options = this.chartConfigService.getDefaultLineChartOptions();
    return view;
  }
}

export class CostSummaryInfoViewData {
  constructor() { }
  // datacenter: DatacenterInfoViewData;
  id: number;
  uuid: string;
  name: string;
  location: string;
  totalCabinetsCount: number;
  billedCabinetsCount: number;
  totalPdusCount: number;
  billedPdusCount: number;
  billDate: string;
  billAmount: number;
  costPlanner: number;
  cabinetCost: number;
  pduCost: number;
  pduBillDetails: BillDetailsItemViewData[];
  cabinetBillDetails: BillDetailsItemViewData[];
  isOpen: boolean = false;
}

export class DatacenterInfoViewData {
  constructor() { }
  id: number;
  uuid: string;
  name: string;
  location: string;
}

export class BillDetailsItemViewData {
  constructor() { }
  id: number;
  cost: number;
  deviceType: string;
  deviceObject: DeviceObjectInfoViewData;
}

export class DeviceObjectInfoViewData {
  constructor() { }
  id: number;
  uuid: string;
  name: string;
  contractStartDate: string;
  contractEndDate: string;
  renewal: string;
  annualEscalation: string;
  model?: string;
  powerCircuit?: string;
  cabinet?: string;
}

export class WidgetSummaryInfoViewData {
  constructor() { }
  totalCabinets: number = 0;
  billedDatacenters: number = 0;
  billedCabinets: number = 0;
  cabinetCost: number = 0;
  totalDatacenters: number = 0;
  dcCost: number = 0;
  pduCost: number = 0;
  totalPdus: number = 0;
  billedPdus: number = 0;
}

export class DCCostAnalysisChartViewdata {
  constructor() { }
  loader: string = 'dcCostAnalysisChartLoader';
  cost: string;
  chartData: UnityChartData;
  form: FormGroup;
}

