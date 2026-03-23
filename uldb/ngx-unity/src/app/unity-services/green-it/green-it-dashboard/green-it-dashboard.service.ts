import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Color, Label } from 'ng2-charts';
import { Observable } from 'rxjs';
import { CO2_EMISSION_BY_DC, CO2_EMISSION_BY_GCP_YEAR, CO2_EMISSION_BY_DEVICE_TYPE, CO2_EMISSION_BY_PRIVATE_CLOUD, CO2_EMISSION_BY_QUARTER, CO2_EMISSION_BY_YEAR, TOP_10_CO2_EMITTED_TAG_GROUPS, CO2_DASHBOARD_SUMMARY } from 'src/app/shared/api-endpoint.const';
import { GreenITService } from '../green-it.service';
import { Co2EmissionByDC, Co2EmissionByDeviceType, Co2EmissionByPrivateCloud, Co2EmissionByQuarter, Co2EmissionByYear, Co2EmissionDashboardSummaryDatacenterPublicCloud, Co2EmissionData, EmissionByTop10TagGroups } from './green-it-dashboard.type';


@Injectable()
export class GreenItDashboardService {

  constructor(private http: HttpClient,
    private greenItService: GreenITService,) { }

  getTop10Co2EmittedTagGroups(): Observable<EmissionByTop10TagGroups[]> {
    return this.http.get<EmissionByTop10TagGroups[]>(TOP_10_CO2_EMITTED_TAG_GROUPS());
  }

  convertToTop10Co2EmittedTagGroupsChartData(devices: EmissionByTop10TagGroups[]): ChartData {
    let view: ChartData = new ChartData();
    view.type = 'bar';
    let data: number[] = [];
    let colors: string[] = [];
    devices.map(d => {
      view.lables.push(d.name);
      data.push(this.greenItService.getFormattedNumber(d.co2_emitted));
      colors.push(DEFAULT_CHART_COLOR);
    })
    view.datasets.push({ data: [...data], maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultVerticalBarChartOptions();
    view.options.title = { display: true, text: 'Emissions by top 10 Tag Groups (TCo2e)', fontSize: 15 };
    view.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...data) * (110 / 100);
    return view;
  }


  getCo2EmissionByDC(): Observable<Co2EmissionByDC> {
    return this.http.get<Co2EmissionByDC>(CO2_EMISSION_BY_DC());
  }

  convertToCo2EmissionByDCChartData(emissionData: Co2EmissionByDC) {
    let view: ChartData = new ChartData();
    view.type = 'bar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).map(d => {
      view.lables.push(<string>d.getFirst());
      data.push(this.greenItService.getFormattedNumber((<Co2EmissionData>d.getLast()).co2_emitted));
      colors.push(DEFAULT_CHART_COLOR);
    })
    view.datasets.push({ data: [...data], maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultVerticalBarChartOptions();
    view.options.title = { display: true, text: 'Emissions by Datacenter(TCO2e)', fontSize: 15 };
    view.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...data) * (110 / 100);
    return view;
  }

  getCo2EmissionByPrivateCloud(): Observable<Co2EmissionByPrivateCloud> {
    return this.http.get<Co2EmissionByPrivateCloud>(CO2_EMISSION_BY_PRIVATE_CLOUD());
  }

  convertToCo2EmissionByPCChartData(emissionData: Co2EmissionByDC) {
    let view: ChartData = new ChartData();
    view.type = 'bar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).map(d => {
      view.lables.push(<string>d.getFirst());
      data.push(this.greenItService.getFormattedNumber((<Co2EmissionData>d.getLast()).co2_emitted));
      colors.push(DEFAULT_CHART_COLOR);
    })
    view.datasets.push({ data: [...data], maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultVerticalBarChartOptions();
    view.options.title = { display: true, text: 'Emissions by Private Cloud(TCO2e)', fontSize: 15 };
    view.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...data) * (110 / 100);
    return view;
  }

  convertToSummaryViewData(emissionData: Co2EmissionByDC): greenItSummaryView {
    let view: greenItSummaryView = new greenItSummaryView();
    view.numberOfDatacenters = Object.keys(emissionData).length;
    let temp = 0;
    Object.entries(emissionData).map(dc => {
      let e = (<Co2EmissionData>dc.getLast());
      view.numberOfDevices += e.device_count;
      view.totalPowerUsage += e.power_consumed;
      view.totalCo2Emitted += e.co2_emitted;
      if (temp < e.co2_emitted) {
        temp = e.co2_emitted;
        view.manufacturerWithHighestCo2Emission = <string>dc.getFirst();
      }
    });
    view.totalPowerUsage = this.greenItService.getFormattedNumber(view.totalPowerUsage);
    view.totalCo2Emitted = this.greenItService.getFormattedNumber(view.totalCo2Emitted);
    return view;
  }

  getDatacenterPublicCloudCo2Summary(): Observable<Co2EmissionDashboardSummaryDatacenterPublicCloud> {
    return this.http.get<Co2EmissionDashboardSummaryDatacenterPublicCloud>(CO2_DASHBOARD_SUMMARY());
  }

  convertToDatacenterPublicCloudCo2EmissionDashboard(emssionData: Co2EmissionDashboardSummaryDatacenterPublicCloud): DatacenterPublicCloudCo2EmissionDashboardSummaryViewdata {
    let view: DatacenterPublicCloudCo2EmissionDashboardSummaryViewdata = new DatacenterPublicCloudCo2EmissionDashboardSummaryViewdata();
    view.totalCo2Sum = emssionData.total_co2_sum;
    view.numServiceNames = emssionData.num_service_names;
    view.numberOfGcpAccounts= emssionData.number_of_accounts;
    view.numberOfAwsAccounts= emssionData.aws_accounts;
    return view;
  }

  getCo2EmissionByDeviceType(): Observable<Co2EmissionByDeviceType> {
    return this.http.get<Co2EmissionByDeviceType>(CO2_EMISSION_BY_DEVICE_TYPE());
  }

  convertToCo2EmissionByDeviceTypeChartData(emissionData: Co2EmissionByDeviceType) {
    let view: ChartData = new ChartData();
    view.type = 'horizontalBar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).map(d => {
      view.lables.push(this.greenItService.getDeviceTypeDisplayNames(<string>d.getFirst()));
      data.push(this.greenItService.getFormattedNumber((<Co2EmissionData>d.getLast()).co2_emitted));
      colors.push(DEFAULT_CHART_COLOR);
    })
    view.datasets.push({ data: [...data], maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultHorizantalBarChartOptions();
    view.options.title = { display: true, text: 'Emission By Device Type (TCO2e)', fontSize: 15 };
    return view;
  }

  getCo2EmissionByQuarter(): Observable<Co2EmissionByQuarter> {
    return this.http.get<Co2EmissionByQuarter>(CO2_EMISSION_BY_QUARTER());
  }

  convertToCo2EmissionByQuarterChartData(emissionData: Co2EmissionByQuarter): ChartData {
    let view: ChartData = new ChartData();
    view.type = 'horizontalBar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).map(d => {
      view.lables.push(<string>d.getFirst());
      data.push(this.greenItService.getFormattedNumber(<number>d.getLast()));
      colors.push(DEFAULT_CHART_COLOR);
    })
    view.datasets.push({ data: [...data], maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultHorizantalBarChartOptions();
    view.options.title = { display: true, text: 'Emission By Quarter (TCO2e)', fontSize: 15 };
    return view;
  }

  getCo2EmissionByYear(): Observable<Co2EmissionByYear> {
    return this.http.get<Co2EmissionByYear>(CO2_EMISSION_BY_YEAR());
  }

  convertToCo2EmissionByYearChartData(emissionData: Co2EmissionByYear): ChartData {
    let view: ChartData = new ChartData();
    view.type = 'horizontalBar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).map(d => {
      view.lables.push(<string>d.getFirst());
      data.push(this.greenItService.getFormattedNumber(<number>d.getLast()));
      colors.push(DEFAULT_CHART_COLOR);
    })
    view.datasets.push({ data: [...data], maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultHorizantalBarChartOptions();
    view.options.title = { display: true, text: 'Emission by Year (TCO2e)', fontSize: 15 };
    return view;
  }
}

export class greenItSummaryView {
  numberOfDatacenters: number = 0;
  numberOfDevices: number = 0;
  totalPowerUsage: number = 0;
  totalCo2Emitted: number = 0;
  percentageIncreaseInCo2?: number = 0;
  deviceTypeWithHighestCo2Emission?: string = 'N/A';
  manufacturerWithHighestCo2Emission?: string = 'N/A';
  constructor() { }
}

export class DatacenterPublicCloudCo2EmissionDashboardSummaryViewdata {
  constructor() { }
  numServiceNames: number;
  numberOfAwsAccounts: number;
  numberOfGcpAccounts: number;
  totalCo2Sum: number;
}

export class ChartData {
  type: string;
  lables: Label[] = [];
  datasets: ChartDataSets[] = [];
  options: ChartOptions;
  colors: Color[] = [];
  legend: boolean = false;
  plugins: any = [pluginDataLabels];
  constructor() { }
}

export const DEFAULT_CHART_COLOR: string = '#008AD7';

export const DEFAULT_BAR_THICKNESS: number = 40;
