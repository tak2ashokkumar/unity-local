import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChartData, ChartTooltipItem } from 'chart.js';
import { Observable } from 'rxjs';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ChartConfigService, DEFAULT_BAR_THICKNESS, UnityChartData } from 'src/app/shared/chart-config.service';
import { BandWidthPipe } from 'src/app/shared/pipes';
import { UnitedConnectNetworkBill, UnitedConnectNetworkBillMappedPorts } from './unityconnect-network-billing.type';

@Injectable()
export class UnityconnectNetworkBillingService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private chartConfig: ChartConfigService,
    private bandwidth: BandWidthPipe,
    private utilSvc: AppUtilityService) { }

  getBillingDetails(): Observable<UnitedConnectNetworkBill[]> {
    return this.http.get<UnitedConnectNetworkBill[]>('/customer/zabbix/billing/?page_size=0');
  }

  convertToViewData(bills: UnitedConnectNetworkBill[]): UnitedConnectNetworkBillViewData[] {
    let viewData: UnitedConnectNetworkBillViewData[] = [];
    bills.map(b => {
      let a: UnitedConnectNetworkBillViewData = new UnitedConnectNetworkBillViewData();
      a.billId = b.uuid;
      a.billName = b.bill_name;
      a.billType = b.bill_type;
      a.cost = b.cost_per_mb;
      a.description = b.description;

      a.allowedValue = b.details?.allowed_95th ? b.details.allowed_95th : 0;
      a.allowed = b.allowed;
      a.allowedUnit = a.allowed.split(" ").getLast();

      a.usedValue = b.details?.used_average ? b.details.used_average : 0;
      a.used = this.bandwidth.transform(a.usedValue);
      a.usedUnit = a.used.split(" ").getLast();
      a.usedPercentage = b.details?.used_percentage_95th ? Number(b.details.used_percentage_95th.toFixed(2)) : 0;

      a.unusedValue = (a.usedPercentage > 100) ? 0 : a.allowedValue - a.usedValue;
      a.unused = this.bandwidth.transform(a.unusedValue);
      a.unusedUnit = a.unused.split(" ").getLast();
      a.unusedPercentage = (Number(a.usedPercentage.toFixed(2)) > 100) ? 0 : 100 - Number(a.usedPercentage.toFixed(2));

      a.overusageValue = b.details?.overusage_95th ? b.details.overusage_95th : 0;
      a.overusage = this.bandwidth.transform(a.overusageValue);
      a.overusageUnit = a.overusage.split(" ").getLast();
      a.overUsedPercentage = (Number(a.usedPercentage.toFixed(2)) > 100) ? Math.abs(100 - Number(a.usedPercentage.toFixed(2))) : 0;

      // a.rate95th = b.details?.user_95th ? b.details.user_95th : 0;
      a.user95th = this.bandwidth.transform(b.details?.user_95th ? b.details.user_95th : 0);
      a.inbound95th = b.details?.inbound_95th ? Number((b.details.inbound_95th / 1024).toFixed(2)) : 0;
      a.outbound95th = b.details?.outbound_95th ? Number((b.details.outbound_95th / 1024).toFixed(2)) : 0;

      // a.average = b.details?.average ? b.details.average : 0;
      a.usedAverage = this.bandwidth.transform(b.details?.used_average ? b.details.used_average : 0);
      a.inboundAverage = b.details?.inbound_average ? Number((b.details.inbound_average / 1024).toFixed(2)) : 0;
      a.outboundAverage = b.details?.outbound_average ? Number((b.details.outbound_average / 1024).toFixed(2)) : 0;

      a.billingPeriod = `${b.details?.start_date ? this.utilSvc.toUnityOneDateFormat(b.details.start_date, 'MMM DD, y') : "NA"} to ${b?.details?.end_date ? this.utilSvc.toUnityOneDateFormat(b.details.end_date, 'MMM DD, y') : "NA"}`;
      a.billLastCalculated = b.details?.last_calculated ? this.utilSvc.toUnityOneDateFormat(b.details?.last_calculated) : "NA";
      a.estimatedBillingFee = b.details?.fee ? b.details.fee : 0;

      a.mappedPorts = b.mapped_ports;
      a.chartData = this.convertToChartData(b);
      viewData.push(a);
    })
    return viewData;
  }

  convertToChartData(billData: UnitedConnectNetworkBill) {
    let view: UnityChartData = new UnityChartData();
    view.type = 'bar';
    view.legend = false;
    view.lables = ['Inbound', 'Outbound'];
    view.colors = [{ backgroundColor: '#378adb' }, { backgroundColor: '#6a707e' }];

    let data: number[] = [];
    data.push(this.chartConfig.formatValue(billData.details.inbound_95th));
    data.push(this.chartConfig.formatValue(billData.details.outbound_95th));
    view.datasets.push({ data: data, maxBarThickness: DEFAULT_BAR_THICKNESS, categoryPercentage: 0.8, barPercentage: 0.8 });

    data = [];
    data.push(this.chartConfig.formatValue(billData.details.inbound_average));
    data.push(this.chartConfig.formatValue(billData.details.outbound_average));
    view.datasets.push({ data: data, maxBarThickness: DEFAULT_BAR_THICKNESS, categoryPercentage: 0.8, barPercentage: 0.8 });

    view.options = this.chartConfig.getDefaultVerticalBarChartOptions();
    view.options.tooltips = {
      displayColors: false,
      callbacks: {
        label: (item: ChartTooltipItem, data: ChartData) => {
          return `${item.yLabel} Kbps`;
        },
        title: (item: ChartTooltipItem[], data: ChartData) => {
          return data.datasets[item[0].datasetIndex].label;
        },
      }
    }
    view.options.scales.yAxes[0].scaleLabel = {
      display: true,
      labelString: "Kbps",
    };;

    let maxValue = 0;
    view.datasets.map(d => {
      const data = <number[]>d.data;
      const val = Math.max(...data);
      if (maxValue < val) {
        maxValue = val;
      }
    })
    view.options.scales.yAxes[0].ticks.suggestedMax = maxValue * (110 / 100);
    return view;
  }

  getMappedPorts(): Observable<UnitedConnectNetworkBillMappedPorts[]> {
    return this.http.get<UnitedConnectNetworkBillMappedPorts[]>('/customer/zabbix/fast/mapped_ports/?page_size=0');
  }

  buildBillForm(view: UnitedConnectNetworkBillViewData): FormGroup {
    let mappedPorts: string[] = [];
    if (view && view.mappedPorts) {
      view.mappedPorts.map(p => {
        mappedPorts.push(p.uuid);
      });
    }
    return this.builder.group({
      'bill_name': [view ? view.billName : '', [Validators.required, NoWhitespaceValidator]],
      'mapped_ports': [mappedPorts.length ? mappedPorts : [], [Validators.required]],
      'bill_type': [{ value: UNITY_NETWORK_CONNECTION_BILL_CHOICES[0].key, disabled: true }, [Validators.required]],
      'allowed_threshold': [view ? view.allowed.split(" ")[0] : '', [Validators.required, NoWhitespaceValidator]],
      'threshold_unit': [view ? view.allowed.split(" ")[1] : UNITY_NETWORK_CONNECTION_BILL_UNITS[0], [Validators.required, NoWhitespaceValidator]],
      'cost_per_mb': [view ? view.cost : '', [Validators.required, NoWhitespaceValidator]],
      'description': [view ? view.description : '']
    })
  }

  resetBillFormErrors(): any {
    return {
      'bill_name': '',
      'mapped_ports': '',
      'bill_type': '',
      'allowed_threshold': '',
      'threshold_unit': '',
      'cost_per_mb': '',
    }
  }

  billFormValidataionMessages = {
    'bill_name': {
      'required': 'Bill name is required'
    },
    'mapped_ports': {
      'required': 'Port selection is required'
    },
    'bill_type': {
      'required': 'Billing type is required'
    },
    'allowed_threshold': {
      'required': 'Usage is required'
    },
    'threshold_unit': {
      'required': 'Usage unit is required'
    },
    'cost_per_mb': {
      'required': 'Cost is required'
    }
  };

  addBill(formData: any) {
    return this.http.post('/customer/zabbix/billing/', formData);
  }

  updateBill(viewId: string, formData: any) {
    return this.http.put(`/customer/zabbix/billing/${viewId}/`, formData);
  }

  deleteBill(viewId: string) {
    return this.http.delete(`/customer/zabbix/billing/${viewId}/`);
  }

  getBill(viewId: string) {
    return this.http.get(`/customer/zabbix/billing/${viewId}/`);
  }
}

export class UnitedConnectNetworkBillViewData {
  constructor() { }
  billId: string;
  billName: string;
  billType: string;
  cost: number;
  description: string;

  allowed: string;
  allowedUnit: string;
  allowedValue: number;

  used: string;
  usedValue: number;
  usedUnit: string;
  usedPercentage: number;

  unused: string;
  unusedValue: number;
  unusedUnit: string;
  unusedPercentage: number;

  overusage: string;
  overusageValue: number;
  overusageUnit: string;
  overUsedPercentage: number;

  // average: UnitedConnectNetworkBillDataAverage;
  inboundAverage: number;
  outboundAverage: number;
  usedAverage: number;
  // rate95th: UnitedConnectNetworkBillDataPercentile;
  inbound95th: number;
  outbound95th: number;
  allowed95th: number;
  user95th: number;
  overusage95th: number;
  usedPercentage95th: number;
  isOpen: boolean = false;

  billingPeriod: string;
  billLastCalculated: string;
  estimatedBillingFee: number;

  startDate: string;
  endDate: string;

  mappedPorts: UnitedConnectNetworkBillMappedPorts[];
  chartData: UnityChartData = new UnityChartData();
}


export const UNITY_NETWORK_CONNECTION_BILL_CHOICES: Array<{ name: string, key: string }> = [
  {
    'name': '95th Percentile',
    'key': '95th'
  },
  {
    'name': 'Transfer Quota',
    'key': 'quota'
  }
];

export const UNITY_NETWORK_CONNECTION_BILL_UNITS: string[] = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];
