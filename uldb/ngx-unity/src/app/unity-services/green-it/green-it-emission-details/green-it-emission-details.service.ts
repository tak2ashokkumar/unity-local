import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChartDataSets, ChartOptions } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Color, Label } from 'ng2-charts';
import { Observable, forkJoin, of } from 'rxjs';
import { AWS_CO2_ACCOUNT_INFO, AWS_CO2_BY_ACCOUNT, AWS_CO2_BY_ACCOUNT_ID, AWS_CO2_BY_GEOGRAPHIES, AWS_CO2_BY_MONTH, AWS_CO2_BY_QUARTER, AWS_CO2_BY_SERVICE, AWS_CO2_BY_SUMMARY, AWS_CO2_BY_YEAR, CO2_EMISSION_BY_CABINET, CO2_EMISSION_BY_DC, CO2_EMISSION_BY_DC_BY_QUARTER, CO2_EMISSION_BY_DEVICE_TYPE, GCP_CO2_BY_MONTH, GCP_CO2_BY_PRODUCT, GCP_CO2_BY_PROJECT, GCP_CO2_BY_QUARTERLY, GCP_CO2_BY_REGION, GCP_CO2_BY_SUMMARY, GCP_CO2_BY_YEAR, GET_CABINET_WIDGET_DATA, GET_REPORTING_CLOUD_NAMES_BY_CLOUD_TYPE } from 'src/app/shared/api-endpoint.const';
import { GreenITService } from '../green-it.service';
import { GreenITDCWidget } from '../green-it.type';
import { Co2EmissionByCabinet, Co2EmissionByDC, Co2EmissionByDCByQuarter, Co2EmissionByDeviceType, Co2EmissionByPublicCloudAccount, Co2EmissionByProduct, Co2EmissionByQuarter, Co2EmissionData, Co2EmissionByMonth, Co2EmissionByRegion, Co2EmissionByProject, Co2EmissionByYear, GcpCo2EmissionSummaryType, AwsCo2EmissionSummary, AwsCo2EmissionByService, AwsCo2EmissionByGeography, AwsCo2EmissionByAccount, AwsCo2EmissionByAccountId, AwsCo2EMissionByQuarter, AwsCo2EmissionByMonth, AwsCo2EmissionByYear, AwsCo2EmissionAccountInfo } from './green-it-emission-details.type';

@Injectable()
export class GreenItEmissionDetailsService {

  constructor(private http: HttpClient,
    private greenItService: GreenITService,
    private builder: FormBuilder,) { }

  getDropdownData() {
    let dcs = this.http.get<GreenITDCWidget[]>(GET_CABINET_WIDGET_DATA());
    let dtypes = of(deviceTypes);
    let gcpAccounts = this.http.get<Co2EmissionByPublicCloudAccount[]>(GET_REPORTING_CLOUD_NAMES_BY_CLOUD_TYPE(), { params: new HttpParams().set('cloud', 'GCP') });
    let awsAccounts = this.http.get<AwsCo2EmissionAccountInfo[]>(AWS_CO2_ACCOUNT_INFO());
    return forkJoin(dcs, dtypes, gcpAccounts, awsAccounts);
  }

  buildForm(selectedOption: string): FormGroup {
    return this.builder.group({
      'emission_by': [selectedOption, [Validators.required]],
    })
  }

  getCo2EmissionByDC(filters?: any): Observable<Co2EmissionByDC> {
    if (filters) {
      return this.http.post<Co2EmissionByDC>(CO2_EMISSION_BY_DC(), filters);
    } else {
      return this.http.get<Co2EmissionByDC>(CO2_EMISSION_BY_DC());
    }
  }

  convertToCo2EmissionByDCChartData(emissionData: Co2EmissionByDC): ChartView {
    let totalCo2Emitted = 0;
    let bcd: ChartData = new ChartData();
    bcd.type = 'bar';
    let bd: number[] = [];
    let bc: string[] = [];
    Object.entries(emissionData).map(d => {
      bcd.lables.push(<string>d.getFirst());
      bd.push(this.greenItService.getFormattedNumber((<Co2EmissionData>d.getLast()).co2_emitted));
      totalCo2Emitted += (<Co2EmissionData>d.getLast()).co2_emitted;
      bc.push(DEFAULT_CHART_COLOR);
    });
    bcd.bardata.push({ data: [...bd], maxBarThickness: DEFAULT_BAR_THICKNESS });
    bcd.colors.push({ backgroundColor: bc });
    bcd.options = this.greenItService.getDefaultVerticalBarChartOptions();
    bcd.options.title = { display: true, text: 'Emission by datacenter per annum (TCO2e)', fontSize: 15 };
    bcd.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...bd) * (110 / 100);

    let pcd: ChartData = new ChartData();
    pcd.type = 'pie';
    pcd.options = this.greenItService.getDefaultPieChartOptions();
    pcd.options.title = { display: true, text: 'Emission by datacenter per annum (%)', fontSize: 15 };
    let pc: string[] = [];
    Object.entries(emissionData).map((d, index) => {
      pcd.lables.push(<string>d.getFirst());
      if (totalCo2Emitted) {
        pcd.piedata.push(this.greenItService.getChartPercentage((<Co2EmissionData>d.getLast()).co2_emitted, totalCo2Emitted));
      } else {
        pcd.piedata.push(0);
      }
      pc.push(VARIANTS_OF_BLUE[index]);
    })
    pcd.legend = true;
    pcd.colors.push({ backgroundColor: pc });

    let view: ChartView = new ChartView();
    view.bar = bcd;
    view.pie = pcd;
    return view;
  }

  getCo2EmissionByCabinet(filters?: any): Observable<Co2EmissionByCabinet> {
    if (filters) {
      return this.http.post<Co2EmissionByCabinet>(CO2_EMISSION_BY_CABINET(), filters);
    } else {
      return this.http.get<Co2EmissionByCabinet>(CO2_EMISSION_BY_CABINET());
    }
  }

  convertToCo2EmissionByCabinetChartData(emissionData: Co2EmissionByCabinet): ChartView {
    let totalCo2Emitted = 0;
    let bcd: ChartData = new ChartData();
    bcd.type = 'bar';
    let bd: number[] = [];
    let bc: string[] = [];
    Object.entries(emissionData).map(d => {
      bcd.lables.push(<string>d.getFirst());
      bd.push(this.greenItService.getFormattedNumber((<Co2EmissionData>d.getLast()).co2_emitted));
      totalCo2Emitted += (<Co2EmissionData>d.getLast()).co2_emitted;
      bc.push(DEFAULT_CHART_COLOR);
    });
    bcd.bardata.push({ data: [...bd], maxBarThickness: DEFAULT_BAR_THICKNESS });
    bcd.colors.push({ backgroundColor: bc });
    bcd.options = this.greenItService.getDefaultVerticalBarChartOptions();
    bcd.options.title = { display: true, text: 'Emission by cabinet per annum (TCO2e)', fontSize: 15 };
    bcd.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...bd) * (110 / 100);

    let pcd: ChartData = new ChartData();
    pcd.type = 'pie';
    pcd.options = this.greenItService.getDefaultPieChartOptions();
    pcd.options.title = { display: true, text: 'Emission by cabinet per annum (%)', fontSize: 15 };
    let pc: string[] = [];
    Object.entries(emissionData).map((d, index) => {
      pcd.lables.push(<string>d.getFirst());
      if (totalCo2Emitted) {
        pcd.piedata.push(this.greenItService.getChartPercentage((<Co2EmissionData>d.getLast()).co2_emitted, totalCo2Emitted));
      } else {
        pcd.piedata.push(0);
      }
      pc.push(VARIANTS_OF_BLUE[index]);
    })
    pcd.legend = true;
    pcd.colors.push({ backgroundColor: pc });

    let view: ChartView = new ChartView();
    view.bar = bcd;
    view.pie = pcd;
    return view;
  }

  getCo2EmissionByDeviceType(filters?: any): Observable<Co2EmissionByDeviceType> {
    if (filters) {
      return this.http.post<Co2EmissionByDeviceType>(CO2_EMISSION_BY_DEVICE_TYPE(), filters);
    } else {
      return this.http.get<Co2EmissionByDeviceType>(CO2_EMISSION_BY_DEVICE_TYPE());
    }
  }

  convertToCo2EmissionByDeviceTypeChartData(emissionData: Co2EmissionByDeviceType): ChartView {
    let totalCo2Emitted = 0;
    let bcd: ChartData = new ChartData();
    bcd.type = 'horizontalBar';
    bcd.options = this.greenItService.getDefaultHorizantalBarChartOptions();
    bcd.options.title = { display: true, text: 'Device Type Emission (TCO2e)', fontSize: 15 };
    let bd: number[] = [];
    let bc: string[] = [];
    Object.entries(emissionData).map(d => {
      bcd.lables.push(this.greenItService.getDeviceTypeDisplayNames(<string>d.getFirst()));
      bd.push(this.greenItService.getFormattedNumber((<Co2EmissionData>d.getLast()).co2_emitted));
      totalCo2Emitted += (<Co2EmissionData>d.getLast()).co2_emitted;
      bc.push(DEFAULT_CHART_COLOR);
    });
    bcd.bardata.push({ data: [...bd], maxBarThickness: 40 });
    bcd.colors.push({ backgroundColor: bc });

    let pcd: ChartData = new ChartData();
    pcd.type = 'pie';
    pcd.options = this.greenItService.getDefaultPieChartOptions();
    pcd.options.title = { display: true, text: 'Device Type Emission (%)', fontSize: 15 };
    let pc: string[] = [];
    Object.entries(emissionData).map((d, index) => {
      pcd.lables.push(this.greenItService.getDeviceTypeDisplayNames(<string>d.getFirst()));
      if (totalCo2Emitted) {
        pcd.piedata.push(this.greenItService.getChartPercentage((<Co2EmissionData>d.getLast()).co2_emitted, totalCo2Emitted));
      } else {
        pcd.piedata.push(0);
      }
      pc.push(VARIANTS_OF_BLUE[index]);
    })
    pcd.legend = true;
    pcd.colors.push({ backgroundColor: pc });

    let view: ChartView = new ChartView();
    view.bar = bcd;
    view.pie = pcd;
    return view;
  }

  getCo2EmissionByDCByQuarter(filters?: any): Observable<Co2EmissionByDCByQuarter> {
    if (filters) {
      return this.http.post<Co2EmissionByDCByQuarter>(CO2_EMISSION_BY_DC_BY_QUARTER(), filters);
    } else {
      return this.http.get<Co2EmissionByDCByQuarter>(CO2_EMISSION_BY_DC_BY_QUARTER());
    }
  }

  getCo2EmissionByDCByQuarterChartData(dataByQuarter: Co2EmissionByQuarter, bardata: ChartDataSets[]): ChartDataSets[] {
    if (bardata.length) {
      bardata.map(bd => {
        if (Object.keys(dataByQuarter).filter(dq => dq == bd.label).length) {
          bd.data = <number[]>bd.data;
          bd.data.push(this.greenItService.getFormattedNumber(dataByQuarter[bd.label]));
        } else {
          let d: ChartDataSets;
          Object.entries(dataByQuarter).map(dq => {
            d = { data: [this.greenItService.getFormattedNumber(<number>dq.getLast())], label: <string>dq.getFirst(), maxBarThickness: DEFAULT_BAR_THICKNESS };
            bardata.push(d);
          });
        }
      })
    } else {
      let d: ChartDataSets;
      Object.entries(dataByQuarter).map(dq => {
        d = { data: [this.greenItService.getFormattedNumber(<number>dq.getLast())], label: <string>dq.getFirst(), maxBarThickness: DEFAULT_BAR_THICKNESS };
        bardata.push(d);
      });
    }
    return bardata;
  }

  convertToCo2EmissionByDCByQuarterChartData(emissionData: Co2EmissionByDCByQuarter) {
    let view: ChartData = new ChartData();
    view.type = 'bar';
    view.legend = true;
    Object.entries(emissionData).map(d => {
      view.lables.push(<string>d.getFirst());
      view.bardata = this.getCo2EmissionByDCByQuarterChartData(<Co2EmissionByQuarter>d.getLast(), view.bardata);
    });
    view.bardata.map((bd, index) => {
      view.colors.push({ backgroundColor: VARIANTS_OF_BLUE[index] });
    });
    view.options = this.greenItService.getDefaultVerticalBarChartOptions();
    view.options.title = { display: true, text: 'Emission By Quarter (TCO2e)', fontSize: 15 };
    let maxValue = 0;
    view.bardata.map(d => {
      const data = <number[]>d.data;
      const val = Math.max(...data);
      if (maxValue < val) {
        maxValue = val;
      }
    })
    view.options.scales.yAxes[0].ticks.suggestedMax = maxValue * (110 / 100);
    return view;
  }

  getCo2EmissionSummary(filters: EmissionDetailsFilterData): Observable<GcpCo2EmissionSummaryType> {
    let params: HttpParams = new HttpParams();
    filters.cloud_accounts.map(acId => params = params.append('uuid', acId));
    return this.http.get<GcpCo2EmissionSummaryType>(GCP_CO2_BY_SUMMARY(), { params: params });
  }

  convertToco2EmissionGcpSummary(data: any): GcpCo2Summary {
    let view: GcpCo2Summary = new GcpCo2Summary();
    view.totalCarbonFootprintSum = data.total_carbon_footprint_sum;
    view.serviceNames = data.service_names;
    view.projectNames = data.project_names;
    return view;
  }

  convertToHighestCo2EmissionProduct(emissionData: Co2EmissionByProduct): GcpHighestCo2Product {
    let view: GcpHighestCo2Product = new GcpHighestCo2Product();
    let keys = Object.keys(emissionData);
    if (keys.length == 0) {
      return view; 
    }
    const highestKey = Object.keys(emissionData).reduce((a, b) => emissionData[a] > emissionData[b] ? a : b);
    view.highestCo2Product = highestKey;
    return view;
  }

  getCo2EmissionByProduct(filters: EmissionDetailsFilterData): Observable<Co2EmissionByProduct> {
    let params: HttpParams = new HttpParams();
    filters.cloud_accounts.map(acId => params = params.append('uuid', acId));
    return this.http.get<Co2EmissionByProduct>(GCP_CO2_BY_PRODUCT(), { params: params });
  }

  convertTOCo2EmissionByProductListData(emissionData: Co2EmissionByProduct): Co2EmissionByProductListData[] {
    let viewData: Co2EmissionByProductListData[] = [];
    Object.keys(emissionData).map(key => {
      let lv: Co2EmissionByProductListData = new Co2EmissionByProductListData();
      lv.product = key;
      lv.emissionValue = Number(emissionData[key].toFixed(4));
      viewData.push(lv);
    });
    return viewData;
  }

  convertToCo2EmissionByProductChartData(emissionData: Co2EmissionByProduct): ChartData {
    let view: ChartData = new ChartData();
    view.legend = false;
    view.type = 'horizontalBar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).forEach(d => {
      let [key, value] = d;
      view.lables.push(key);
      data.push(Number(value.toFixed(4)));
      colors.push(DEFAULT_CHART_COLOR);
    });
    view.bardata.push({ data: data, maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultHorizantalBarChartOptions();
    return view;
  }

  getCo2EmissionByProject(filters: EmissionDetailsFilterData): Observable<Co2EmissionByProject> {
    let params: HttpParams = new HttpParams();
    filters.cloud_accounts.map(acId => params = params.append('uuid', acId));
    return this.http.get<Co2EmissionByProject>(GCP_CO2_BY_PROJECT(), { params: params });
  }

  convertTOCo2EmissionByProjectListData(emissionData: Co2EmissionByProject): Co2EmissionByProjectListData[] {
    let viewData: Co2EmissionByProjectListData[] = [];
    Object.keys(emissionData).map(key => {
      let lv: Co2EmissionByProjectListData = new Co2EmissionByProjectListData();
      lv.project = key;
      lv.emissionValue = Number(emissionData[key].toFixed(4));
      viewData.push(lv);
    });
    return viewData;
  }

  convertToCo2EmissionByProjectChartData(emissionData: Co2EmissionByProject): ChartData {
    let view: ChartData = new ChartData();
    view.type = 'bar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).forEach(d => {
      let [key, value] = d;
      view.lables.push(key);
      data.push(Number(value.toFixed(4)));
      colors.push(DEFAULT_CHART_COLOR);
    });
    view.bardata.push({ data: data, maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultVerticalBarChartOptions();
    view.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...data) * (110 / 100);
    return view;
  }

  getCo2EmissionByRegion(filters: EmissionDetailsFilterData): Observable<Co2EmissionByRegion> {
    let params: HttpParams = new HttpParams();
    filters.cloud_accounts.map(acId => params = params.append('uuid', acId));
    return this.http.get<Co2EmissionByRegion>(GCP_CO2_BY_REGION(), { params: params });
  }

  convertTOCo2EmissionByRegionListData(emissionData: Co2EmissionByRegion): Co2EmissionByRegionListData[] {
    let viewData: Co2EmissionByRegionListData[] = [];
    Object.keys(emissionData).map(key => {
      let lv: Co2EmissionByRegionListData = new Co2EmissionByRegionListData();
      lv.region = key;
      lv.emissionValue = Number(emissionData[key].toFixed(4));
      viewData.push(lv);
    });
    return viewData;
  }

  convertToCo2EmissionByRegionChartData(emissionData: Co2EmissionByRegion): ChartData {
    let view: ChartData = new ChartData();
    view.type = 'bar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).forEach(d => {
      let [key, value] = d;
      view.lables.push(key);
      data.push(Number(value.toFixed(4)));
      colors.push(DEFAULT_CHART_COLOR);
    });
    view.bardata.push({ data: data, maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultVerticalBarChartOptions();
    view.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...data) * (110 / 100);
    return view;
  }

  getCo2EmissionByQuarter(filters: EmissionDetailsFilterData): Observable<Co2EmissionByQuarter> {
    let params: HttpParams = new HttpParams();
    filters.cloud_accounts.map(acId => params = params.append('uuid', acId));
    return this.http.get<Co2EmissionByQuarter>(GCP_CO2_BY_QUARTERLY(), { params: params });
  }

  convertTOCo2EmissionByQuarterListData(emissionData: Co2EmissionByQuarter): Co2EmissionByQuarterListData[] {
    let viewData: Co2EmissionByQuarterListData[] = [];
    Object.keys(emissionData).map(key => {
      let lv: Co2EmissionByQuarterListData = new Co2EmissionByQuarterListData();
      lv.quarter = key;
      lv.emissionValue = Number(emissionData[key].toFixed(4));
      viewData.push(lv);
    });
    return viewData;
  }

  convertToCo2EmissionByQuarterChartData(emissionData: Co2EmissionByQuarter): ChartData {
    let view: ChartData = new ChartData();
    view.type = 'bar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).forEach(d => {
      let [key, value] = d;
      view.lables.push(key);
      data.push(Number(value.toFixed(4)));
      colors.push(DEFAULT_CHART_COLOR);
    });
    view.bardata.push({ data: data, maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultVerticalBarChartOptions();
    view.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...data) * (110 / 100);
    return view;
  }

  getCo2EmissionByMonth(filters: EmissionDetailsFilterData): Observable<Co2EmissionByMonth> {
    let params: HttpParams = new HttpParams();
    filters.cloud_accounts.map(acId => params = params.append('uuid', acId));
    return this.http.get<Co2EmissionByMonth>(GCP_CO2_BY_MONTH(), { params: params });
  }

  convertTOCo2EmissionByMonthListData(emissionData: Co2EmissionByMonth): Co2EmissionByMonthListData[] {
    let viewData: Co2EmissionByMonthListData[] = [];
    Object.keys(emissionData).map(key => {
      let lv: Co2EmissionByMonthListData = new Co2EmissionByMonthListData();
      lv.month = key;
      lv.emissionValue = Number(emissionData[key].toFixed(4));
      viewData.push(lv);
    });
    return viewData;
  }

  convertToCo2EmissionByMonthChartData(emissionData: Co2EmissionByMonth): ChartData {
    let view: ChartData = new ChartData();
    view.type = 'bar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).forEach(d => {
      let [key, value] = d;
      view.lables.push(key);
      data.push(Number(value.toFixed(4)));
      colors.push(DEFAULT_CHART_COLOR);
    });
    view.bardata.push({ data: data, maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultVerticalBarChartOptions();
    view.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...data) * (110 / 100);
    return view;
  }

  getCo2EmissionByYear(filters: EmissionDetailsFilterData): Observable<Co2EmissionByYear> {
    let params: HttpParams = new HttpParams();
    filters.cloud_accounts.map(acId => params = params.append('uuid', acId));
    return this.http.get<Co2EmissionByYear>(GCP_CO2_BY_YEAR(), { params: params });
  }

  convertTOCo2EmissionByYearListData(emissionData: Co2EmissionByYear): Co2EmissionByYearListData[] {
    let viewData: Co2EmissionByYearListData[] = [];
    Object.keys(emissionData).map(key => {
      let lv: Co2EmissionByYearListData = new Co2EmissionByYearListData();
      lv.year = key;
      lv.emissionValue = Number(emissionData[key].toFixed(4));
      viewData.push(lv);
    });
    return viewData;
  }

  convertToco2EmissionByYearChartData(emissionData: Co2EmissionByYear): ChartData {
    let view: ChartData = new ChartData();
    view.type = 'bar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).forEach(d => {
      let [key, value] = d;
      view.lables.push(key);
      data.push(Number(value.toFixed(4)));
      colors.push(DEFAULT_CHART_COLOR);
    });
    view.bardata.push({ data: data, maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultVerticalBarChartOptions();
    view.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...data) * (110 / 100);
    return view;
  }

  getAwsCo2EmissionSummary(filters: EmissionDetailsFilterData): Observable<AwsCo2EmissionSummary>{
    let params: HttpParams = new HttpParams();
    filters.cloud_accounts.map(name => params = params.append('account', name));
    return this.http.get<AwsCo2EmissionSummary>(AWS_CO2_BY_SUMMARY(), { params: params });
  }
  
  convertToAwsCo2EmissionBySummary(data: AwsCo2EmissionSummary):AwsCo2Summary{
    let view: AwsCo2Summary = new AwsCo2Summary();
    view.totalEmission = data.total_emissions;
    view.totalAccountCount = data.account_count;
    return view;
  }

  convertToAwsHighestCo2EmissionService(emissionData: AwsCo2EmissionByService): AwsHighestCo2Service {
    let view: AwsHighestCo2Service = new AwsHighestCo2Service();
    let keys = Object.keys(emissionData);
    if (keys.length == 0) {
      return view;
    }
    const highestKey = Object.keys(emissionData).reduce((a, b) => emissionData[a] > emissionData[b] ? a : b);
    view.awsHighestCo2Service = highestKey;
    return view;
  }

  getAwsCo2EmissionByService(filters: EmissionDetailsFilterData): Observable<AwsCo2EmissionByService> {
    let params: HttpParams = new HttpParams();
    filters.cloud_accounts.map(name => params = params.append('account', name));
    return this.http.get<AwsCo2EmissionByService>(AWS_CO2_BY_SERVICE(), { params: params });
  }

  convertTOAwsCo2EmissionByServiceListData(emissionData: AwsCo2EmissionByService): AwsCo2EmissionByServiceListData[] {
    let viewData: AwsCo2EmissionByServiceListData[] = [];
    Object.keys(emissionData).map(key => {
      let lv: AwsCo2EmissionByServiceListData = new AwsCo2EmissionByServiceListData();
      lv.service = key;
      lv.emissionValue = Number(emissionData[key].toFixed(4));
      viewData.push(lv);
    });
    return viewData;
  }

  convertToAwsCo2EmissionByServiceChartData(emissionData: AwsCo2EmissionByService): ChartData {
    let view: ChartData = new ChartData();
    view.legend = false;
    view.type = 'horizontalBar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).forEach(d => {
      let [key, value] = d;
      view.lables.push(key);
      data.push(Number(value.toFixed(4)));
      colors.push(DEFAULT_CHART_COLOR);
    });
    view.bardata.push({ data: data, maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultHorizantalBarChartOptions();
    return view;
  }

  convertToAwsHighestCo2EmissionGeography(emissionData: AwsCo2EmissionByGeography): AwsHighestCo2Geography {
    let view: AwsHighestCo2Geography = new AwsHighestCo2Geography();
    let keys = Object.keys(emissionData);
    if (keys.length == 0) {
      return view;
    }
    const highestKey = Object.keys(emissionData).reduce((a, b) => emissionData[a] > emissionData[b] ? a : b);
    view.awsHighestCo2Geography = highestKey;
    return view;
  }

  getAwsCo2EmissionByGeography(filters: EmissionDetailsFilterData):  Observable<AwsCo2EmissionByGeography> {
    let params: HttpParams = new HttpParams();
    filters.cloud_accounts.map(name => params = params.append('account', name));
    return this.http.get<AwsCo2EmissionByService>(AWS_CO2_BY_GEOGRAPHIES(), { params: params });
  }
  
  convertToAwsCo2EmissionByGeographyListData(emissionData: AwsCo2EmissionByGeography): AwsCo2EmissionByGeographyListData[] {
    let viewData: AwsCo2EmissionByGeographyListData[] = [];
    Object.keys(emissionData).map(key => {
      let lv: AwsCo2EmissionByGeographyListData = new AwsCo2EmissionByGeographyListData();
      lv.geography = key;
      lv.emissionValue = Number(emissionData[key].toFixed(4));
      viewData.push(lv);
    });
    return viewData;
  }

  convertToAwsco2EmissionByGeographyChartData(emissionData: AwsCo2EmissionByGeography): ChartData {
    let view: ChartData = new ChartData();
    view.type = 'bar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).forEach(d => {
      let [key, value] = d;
      view.lables.push(key);
      data.push(Number(value.toFixed(4)));
      colors.push(DEFAULT_CHART_COLOR);
    });
    view.bardata.push({ data: data, maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultVerticalBarChartOptions();
    view.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...data) * (110 / 100);
    return view;
  }

  getAwsCo2EmissionByAccount(filters: EmissionDetailsFilterData): Observable<AwsCo2EmissionByAccount> {
    let params: HttpParams = new HttpParams();
    filters.cloud_accounts.map(name => params = params.append('account', name));
    return this.http.get<AwsCo2EmissionByAccount>(AWS_CO2_BY_ACCOUNT(), { params: params });
  }

  convertToAwsCo2EmissionByAccountListData(emissionData: AwsCo2EmissionByAccount): AwsCo2EmissionByAccountListData[] {
    let viewData: AwsCo2EmissionByAccountListData[] = [];
    Object.keys(emissionData).map(key => {
      let lv: AwsCo2EmissionByAccountListData = new AwsCo2EmissionByAccountListData();
      lv.account = key;
      lv.emissionValue = Number(emissionData[key].toFixed(4));
      viewData.push(lv);
    });
    return viewData;
  }

  convertToAwsco2EmissionByAccountChartData(emissionData: AwsCo2EmissionByAccount): ChartData {
    let view: ChartData = new ChartData();
    view.type = 'bar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).forEach(d => {
      let [key, value] = d;
      view.lables.push(key);
      data.push(Number(value.toFixed(4)));
      colors.push(DEFAULT_CHART_COLOR);
    });
    view.bardata.push({ data: data, maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultVerticalBarChartOptions();
    view.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...data) * (110 / 100);
    return view;
  }

  getAwsCo2EmissionByAccountId(filters: EmissionDetailsFilterData): Observable<AwsCo2EmissionByAccountId> {
    let params: HttpParams = new HttpParams();
    filters.cloud_accounts.map(name => params = params.append('account', name));
    return this.http.get<AwsCo2EmissionByAccountId>(AWS_CO2_BY_ACCOUNT_ID(), { params: params });
  }

  convertToAwsCo2EmissionByAccountIdListData(emissionData: AwsCo2EmissionByAccountId): AwsCo2EmissionByAccountIdListData[] {
    let viewData: AwsCo2EmissionByAccountIdListData[] = [];
    Object.keys(emissionData).map(key => {
      let lv: AwsCo2EmissionByAccountIdListData = new AwsCo2EmissionByAccountIdListData();
      lv.accountId = key;
      lv.emissionValue = Number(emissionData[key].toFixed(4));
      viewData.push(lv);
    });
    return viewData;
  }

  convertToAwsco2EmissionByAccountIdChartData(emissionData: AwsCo2EmissionByAccountId): ChartData {
    let view: ChartData = new ChartData();
    view.type = 'bar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).forEach(d => {
      let [key, value] = d;
      view.lables.push(key);
      data.push(Number(value.toFixed(4)));
      colors.push(DEFAULT_CHART_COLOR);
    });
    view.bardata.push({ data: data, maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultVerticalBarChartOptions();
    view.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...data) * (110 / 100);
    return view;
  }

  getAwsCo2EmissionByQuarter(filters: EmissionDetailsFilterData): Observable<AwsCo2EMissionByQuarter> {
    let params: HttpParams = new HttpParams();
    filters.cloud_accounts.map(name => params = params.append('account', name));
    return this.http.get<AwsCo2EMissionByQuarter>(AWS_CO2_BY_QUARTER(), { params: params });
  }

  convertToAwsCo2EmissionByQuarterListData(emissionData: AwsCo2EMissionByQuarter): AwsCo2EmissionByQuarterListData[] {
    let viewData: AwsCo2EmissionByQuarterListData[] = [];
    Object.keys(emissionData).map(key => {
      let lv: AwsCo2EmissionByQuarterListData = new AwsCo2EmissionByQuarterListData();
      lv.quarter = key;
      lv.emissionValue = Number(emissionData[key].toFixed(4));
      viewData.push(lv);
    });
    return viewData;
  }

  convertToAwsco2EmissionByQuarterChartData(emissionData: AwsCo2EMissionByQuarter): ChartData {
    let view: ChartData = new ChartData();
    view.type = 'bar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).forEach(d => {
      let [key, value] = d;
      view.lables.push(key);
      data.push(Number(value.toFixed(4)));
      colors.push(DEFAULT_CHART_COLOR);
    });
    view.bardata.push({ data: data, maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultVerticalBarChartOptions();
    view.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...data) * (110 / 100);
    return view;
  }

  getAwsCo2EmissionByMonth(filters: EmissionDetailsFilterData): Observable<AwsCo2EmissionByMonth> {
    let params: HttpParams = new HttpParams();
    filters.cloud_accounts.map(name => params = params.append('account', name));
    return this.http.get<AwsCo2EmissionByMonth>(AWS_CO2_BY_MONTH(), { params: params });
  }

  convertToAwsCo2EmissionByMonthListData(emissionData: AwsCo2EmissionByMonth): AwsCo2EmissionBySMonthListData[] {
    let viewData: AwsCo2EmissionBySMonthListData[] = [];
    Object.keys(emissionData).map(key => {
      let lv: AwsCo2EmissionBySMonthListData = new AwsCo2EmissionBySMonthListData();
      lv.month = key;
      lv.emissionValue = Number(emissionData[key].toFixed(4));
      viewData.push(lv);
    });
    return viewData;
  }

  convertToAwsco2EmissionByMonthChartData(emissionData: AwsCo2EmissionByMonth): ChartData {
    let view: ChartData = new ChartData();
    view.type = 'bar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).forEach(d => {
      let [key, value] = d;
      view.lables.push(key);
      data.push(Number(value.toFixed(4)));
      colors.push(DEFAULT_CHART_COLOR);
    });
    view.bardata.push({ data: data, maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultVerticalBarChartOptions();
    view.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...data) * (110 / 100);
    return view;
  }

  getAwsCo2EmissionByYear(filters: EmissionDetailsFilterData): Observable<AwsCo2EmissionByYear> {
    let params: HttpParams = new HttpParams();
    filters.cloud_accounts.map(name => params = params.append('account', name));
    return this.http.get<AwsCo2EmissionByYear>(AWS_CO2_BY_YEAR(), { params: params });
  }

  convertToAwsCo2EmissionByYearListData(emissionData: AwsCo2EmissionByYear): AwsCo2EmissionByYearListData[] {
    let viewData: AwsCo2EmissionByYearListData[] = [];
    Object.keys(emissionData).map(key => {
      let lv: AwsCo2EmissionByYearListData = new AwsCo2EmissionByYearListData();
      lv.year = key;
      lv.emissionValue = Number(emissionData[key].toFixed(4));
      viewData.push(lv);
    });
    return viewData;
  }

  convertToAwsco2EmissionByYearChartData(emissionData: AwsCo2EmissionByYear): ChartData {
    let view: ChartData = new ChartData();
    view.type = 'bar';
    let data: number[] = [];
    let colors: string[] = [];
    Object.entries(emissionData).forEach(d => {
      let [key, value] = d;
      view.lables.push(key);
      data.push(Number(value.toFixed(4)));
      colors.push(DEFAULT_CHART_COLOR);
    });
    view.bardata.push({ data: data, maxBarThickness: DEFAULT_BAR_THICKNESS });
    view.colors.push({ backgroundColor: colors });
    view.options = this.greenItService.getDefaultVerticalBarChartOptions();
    view.options.scales.yAxes[0].ticks.suggestedMax = Math.max(...data) * (110 / 100);
    return view;
  }

}

/**
 * Filter selection related class
 */
export class EmissionDetailsFilterData {
  type: string = 'datacenter';
  data_center?: string[] = [];
  cabinets?: string[] = [];
  device_types?: string[] = [];
  cloud_type?: string;
  cloud_accounts?: string[] = [];
  constructor() { }
}

export class GcpCo2Summary {
  constructor() { }
  totalCarbonFootprintSum: number = 0;
  serviceNames: number = 0;
  projectNames: number = 0;
}

export class GcpHighestCo2Product {
  highestCo2Product: string = 'N/A';
}

export class ChartData {
  type: string;
  lables: Label[] = [];
  options: ChartOptions;
  bardata: ChartDataSets[] = [];
  piedata: number[] = [];
  colors: Color[] = [];
  legend: boolean = false;
  plugins: any = [pluginDataLabels];
  constructor() { }
}

export class ChartView {
  bar: ChartData;
  pie: ChartData;
  constructor() { }
}

export class Co2EmissionByProductViewData {
  constructor() { }
  loader: string = 'Co2EmissionByProductLoader';
  viewType: string = 'chart';
  chartData: ChartData;
  listData: Co2EmissionByProductListData[] = [];
}

export class Co2EmissionByProductListData {
  constructor() { }
  product: string;
  emissionValue: number;
}

export class Co2EmissionByProjectViewData {
  constructor() { }
  loader: string = 'Co2EmissionByProjectLoader';
  viewType: string = 'chart';
  chartData: ChartData;
  listData: Co2EmissionByProjectListData[] = [];
}

export class Co2EmissionByProjectListData {
  constructor() { }
  project: string;
  emissionValue: number;
}

export class Co2EmissionByRegionViewData {
  constructor() { }
  loader: string = 'Co2EmissionByRegionLoader';
  viewType: string = 'chart';
  chartData: ChartData;
  listData: Co2EmissionByRegionListData[] = [];
}

export class Co2EmissionByRegionListData {
  constructor() { }
  region: string;
  emissionValue: number;
}

export class Co2EmissionByQuarterViewData {
  constructor() { }
  loader: string = 'Co2EmissionByQuarterLoader';
  viewType: string = 'chart';
  chartData: ChartData;
  listData: Co2EmissionByQuarterListData[] = [];
}

export class Co2EmissionByQuarterListData {
  constructor() { }
  quarter: string;
  emissionValue: number;
}

export class Co2EmissionByMonthViewData {
  constructor() { }
  loader: string = 'Co2EmissionByMonthLoader';
  viewType: string = 'chart';
  chartData: ChartData;
  listData: Co2EmissionByMonthListData[] = [];
}

export class Co2EmissionByMonthListData {
  constructor() { }
  month: string;
  emissionValue: number;
}

export class Co2EmissionByYearViewData {
  constructor() { }
  loader: string = 'Co2EmissionByYearLoader';
  viewType: string = 'chart';
  chartData: ChartData;
  listData: Co2EmissionByYearListData[] = [];
}

export class Co2EmissionByYearListData {
  constructor() { }
  year: string;
  emissionValue: number;
}

export class AwsCo2Summary {
  totalEmission: number = 0;
  totalAccountCount: number = 0;
}

export class AwsHighestCo2Service {
  awsHighestCo2Service: string = 'N/A';
}

export class AwsHighestCo2Geography {
  awsHighestCo2Geography: string = 'N/A';
}

export class AwsCo2EmissionByServiceViewData {
  constructor() { }
  loader: string = 'awsCo2EmissionByServiceLoader';
  viewType: string = 'chart';
  chartData: ChartData;
  listData: AwsCo2EmissionByServiceListData[] = [];
}

export class AwsCo2EmissionByServiceListData {
  constructor() { }
  service: string;
  emissionValue: number;
}

export class AwsCo2EmissionByGeographyViewData {
  constructor() { }
  loader: string = 'awsCo2EmissionByGeographyLoader';
  viewType: string = 'chart';
  chartData: ChartData;
  listData: AwsCo2EmissionByGeographyListData[] = [];
}

export class AwsCo2EmissionByGeographyListData {
  constructor() { }
  geography: string;
  emissionValue: number;
}

export class AwsCo2EmissionByAccountViewData {
  constructor() { }
  loader: string = 'awsCo2EmissionByAccountLoader';
  viewType: string = 'chart';
  chartData: ChartData;
  listData: AwsCo2EmissionByAccountListData[] = [];
}

export class AwsCo2EmissionByAccountListData {
  constructor() { }
  account: string;
  emissionValue: number;
}

export class AwsCo2EmissionByAccountIdViewData {
  constructor() { }
  loader: string = 'awsCo2EmissionByAccountIdLoader';
  viewType: string = 'chart';
  chartData: ChartData;
  listData: AwsCo2EmissionByAccountIdListData[] = [];
}

export class AwsCo2EmissionByAccountIdListData {
  constructor() { }
  accountId: string;
  emissionValue: number;
}

export class AwsCo2EmissionByQuarterViewData {
  constructor() { }
  loader: string = 'awsCo2EmissionByQuarterLoader';
  viewType: string = 'chart';
  chartData: ChartData;
  listData: AwsCo2EmissionByQuarterListData[] = [];
}

export class AwsCo2EmissionByQuarterListData {
  constructor() { }
  quarter: string;
  emissionValue: number;
}

export class AwsCo2EmissionByMonthViewData {
  constructor() { }
  loader: string = 'awsCo2EmissionByMonthLoader';
  viewType: string = 'chart';
  chartData: ChartData;
  listData: AwsCo2EmissionBySMonthListData[] = [];
}

export class AwsCo2EmissionBySMonthListData {
  constructor() { }
  month: string;
  emissionValue: number;
}

export class AwsCo2EmissionByYearViewData {
  constructor() { }
  loader: string = 'awsCo2EmissionByYearLoader';
  viewType: string = 'chart';
  chartData: ChartData;
  listData: AwsCo2EmissionByYearListData[] = [];
}

export class AwsCo2EmissionByYearListData {
  constructor() { }
  year: string;
  emissionValue: number;
}

export const DEFAULT_CHART_COLOR: string = '#008AD7';
export const DEFAULT_BAR_THICKNESS: number = 40;


export const VARIANTS_OF_BLUE: string[] = [
  '#004589',
  '#008AD7',
  '#006EAC',
  '#1684C2',
  '#0080FF',
  '#00588A',
  '#5CB4E5',
  '#0092F2',
  '#00466E',
  '#89C4FF',
  '#4682B4'
];

export const deviceTypes: Array<{ name: string, displayName: string }> = [
  {
    name: "switch",
    displayName: "Switch"
  },
  {
    name: "firewall",
    displayName: "Firewall"
  },
  {
    name: "load_balancer",
    displayName: "Load Balancer"
  },
  {
    name: "storage",
    displayName: "Storage"
  },
  {
    name: "hypervisor",
    displayName: "Hypervisor"
  },
  {
    name: "baremetal",
    displayName: "BareMetal"
  },
  {
    name: "mac_device",
    displayName: "Mac Device"
  },
  {
    name: "custom",
    displayName: "Custom"
  }
];