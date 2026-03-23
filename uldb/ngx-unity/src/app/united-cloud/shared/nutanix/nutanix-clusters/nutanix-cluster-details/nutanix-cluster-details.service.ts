import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChartDataSets } from 'chart.js';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { NutanixClusterControllerStatsType, NutanixClusterDetailsType } from 'src/app/shared/SharedEntityTypes/nutanix.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ChartConfigService, UnityChartData } from 'src/app/shared/chart-config.service';


@Injectable()
export class NutanixClusterDetailsService {
  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private chartConfigService: ChartConfigService,
    private utilSvc: AppUtilityService,) { }

  getClusterDetails(pcId: string, clusterId: string): Observable<NutanixClusterDetailsType> {
    return this.http.get<NutanixClusterDetailsType>(`/customer/nutanix/${pcId}/clusters/${clusterId}/`);
  }

  getClusterGraphs(pcId: string, clusterId: string): Observable<NutanixClusterControllerStatsType> {
    return this.http.get<NutanixClusterControllerStatsType>(`/customer/nutanix/${pcId}/clusters/${clusterId}/graphs/`);
  }

  getForm(type: string): FormGroup {
    let form = this.builder.group({
      'type': [type, [Validators.required]]
    });
    return form;
  }

  convertToVMSummaryChartData(details: NutanixClusterDetailsType) {
    let view: UnityChartData = new UnityChartData();
    view.type = 'doughnut';
    view.legend = true;

    Object.keys(details?.vm_summary).map(key => {
      view.lables.push(`${this.utilSvc.toUpperCase(key)} : ${details?.vm_summary[key]}`);
      view.piedata.push(details?.vm_summary[key]);
    })
    view.options = this.chartConfigService.getDefaultPieChartOptions();
    view.options.legend.position = 'bottom';
    view.options.legend.labels = { boxWidth: 20, padding: 10, usePointStyle: true };
    view.options.cutoutPercentage = 60;
    let centerTextArr: Array<{ text: string, fontSize: string }> = [];
    centerTextArr.push({ text: details.total_vms.toString(), fontSize: `30px` });
    centerTextArr.push({ text: 'VM(s)', fontSize: `15px` });
    view.customPlugin = this.chartConfigService.textAtCenterOfPieChartPlugin(centerTextArr);
    return view;
  }

  getControllerStatsChartLabels(numberOfhours: number, intervalInMins: number): any[] {
    var data = [];
    const intervalStartTime = moment().subtract(numberOfhours, "h");
    const intervalEndTime = moment();
    let currentInterval = moment(intervalStartTime).add(intervalInMins, 'minutes');
    while (currentInterval <= intervalEndTime) {
      data.push(currentInterval.format('hh:mm a'));
      currentInterval = moment(currentInterval).add(intervalInMins, 'minutes');
    }
    return data;
  }

  convertToControllerStatsChartData(datalabel: string, data: number[],): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'line';
    view.legend = false;
    view.lables = this.getControllerStatsChartLabels(6, 15);
    let ds: ChartDataSets = {};
    ds.label = datalabel;
    ds.data = data;
    switch (datalabel) {
      case 'IOPS':
        ds.backgroundColor = '#DAF6F5';
        ds.borderColor = '#47D1CB';
        break;
      case 'IO B/W':
        ds.backgroundColor = '#DAE5FF';
        ds.borderColor = '#477BFF';
        break;
      default:
        ds.backgroundColor = '#E2DAFF';
        ds.borderColor = '#6F47FF';
        break;
    }
    view.linedata.push(ds);
    view.options = this.chartConfigService.getDefaultLineChartOptions();
    return view;
  }

  convertToComponentSummaryChartData(details: NutanixClusterDetailsType): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'doughnut';
    view.legend = true;
    Object.keys(details?.health_summary).map(key => {
      view.lables.push(this.utilSvc.toUpperCase(key));
      view.piedata.push(details?.health_summary[key]?.total);
    })
    view.options = this.chartConfigService.getDefaultPieChartOptions();
    view.options.legend.position = 'bottom';
    view.options.legend.labels = { boxWidth: 20, padding: 10, usePointStyle: true };
    view.options.cutoutPercentage = 60;
    return view;
  }

  convertToClusterUsageChartData(label: string, details: NutanixClusterDetailsType): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'doughnut';
    if (label == 'CPU') {
      view.lables.push('Used');
      view.lables.push('Free');
      view.piedata.push(Number(details.cpu_usage.split(' ')[0]));
      view.piedata.push(100 - Number(details.cpu_usage.split(' ')[0]));
    } else {
      view.lables.push('Used');
      view.lables.push('Free');
      view.piedata.push(Number(details.memory_usage.split(' ')[0]));
      view.piedata.push(100 - Number(details.memory_usage.split(' ')[0]));
    }
    view.options = this.chartConfigService.getDefaultPieChartOptions();
    view.options.cutoutPercentage = 60;
    let centerTextArr: Array<{ text: string, fontSize: string }> = [];
    centerTextArr.push({ text: details.cpu_usage, fontSize: `20px` });
    centerTextArr.push({ text: `of ${details.cpu_capacity}`, fontSize: `10px` });
    view.customPlugin = this.chartConfigService.textAtCenterOfPieChartPlugin(centerTextArr);
    console.log('view : ', view);
    return view;
  }
}

export class NutanixClusterVMSummaryViewData {
  constructor() { }
  chartData: UnityChartData;
  loader: string = 'vmSummaryLoader';
}

export class NutanixClusterComponentSummaryViewData {
  constructor() { }
  chartData: UnityChartData;
  loader: string = 'componentSummaryLoader';
}

export class NutanixClusterControllerStatsViewData {
  constructor() { }
  data: NutanixClusterControllerStatsType;
  chartData: UnityChartData;
  form: FormGroup;
  options: string[] = ['IOPS', 'IO B/W', 'Latency'];
  loader: string = 'controllerIOPSLoader';
}

export class NutanixClusterUsageViewData {
  constructor() { }
  chartData: UnityChartData;
  form: FormGroup;
  options: string[] = ['CPU Usage', 'Memory Usage'];
  loader: string = 'clusterUsageLoader';
}
