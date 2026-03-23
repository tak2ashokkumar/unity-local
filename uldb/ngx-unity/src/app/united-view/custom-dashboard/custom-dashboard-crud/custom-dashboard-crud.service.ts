import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChartDataSets } from 'chart.js';
import { Observable } from 'rxjs';
import { DEVICES_LIST_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ChartConfigService, UnityChartData } from 'src/app/shared/chart-config.service';
import { GraphViewData, MetricesMappingViewData, MetricViewData, NetworkTrafficViewData } from '../custom-dashboard.service';
import { GraphDataType } from '../custom-dashboard.type';
import { CustomDashboardDevices, CustomDashboardWidget, WidgetCloudList, WidgetTab } from './custom-dashboard-crud.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';

@Injectable()
export class CustomDashboardCrudService {

  constructor(private builder: FormBuilder,
    private chartConfigService: ChartConfigService,
    private http: HttpClient,
    private utilService: AppUtilityService,
    private tableService: TableApiServiceService) { }

  getWidgetDetails(widgetId: string): Observable<CustomDashboardWidget> {
    return this.http.get<CustomDashboardWidget>(`/customer/custom_widget/widget/${widgetId}/`);
  }

  getClouds(): Observable<WidgetCloudList> {
    return this.http.get<WidgetCloudList>(`/customer/custom_widget/widget/get_cloud_details/`);
  }

  getDevicesByDeviceType(deviceType: string, metricesMapping?: boolean, criteria?: SearchCriteria): Observable<CustomDashboardDevices[] | PaginatedResult<CustomDashboardDevices>> {
    const deviceMapping = this.utilService.getDeviceMappingByDeviceType(deviceType);
    if (deviceMapping) {
      if (metricesMapping) {
        return this.tableService.getData<PaginatedResult<CustomDashboardDevices>>(DEVICES_LIST_BY_DEVICE_TYPE(deviceMapping), criteria);
      } else {
        return this.http.get<CustomDashboardDevices[]>(DEVICES_LIST_BY_DEVICE_TYPE(deviceMapping), { params: new HttpParams().set('page_size', 0) });
      }
    }
  }

  getGroupByData(groupBy: string, tab: string, filterCloud?: string[]): Observable<string[]> {
    let params: HttpParams = new HttpParams();
    params = params.set('widget_name', tab);
    params = params.set('group_by_selector', groupBy);
    // params = params.set('filter_cloud', filterCloud);
    if (filterCloud) {
      filterCloud.forEach(cloud => {
        params = params.append('filter_cloud', cloud);
      });
    }

    return this.http.get<string[]>('/customer/custom_widget/widget/group_by_selector/', { params: params });
  }

  getMetricesByDevice(deviceType: string, deviceId: string, criteria: SearchCriteria): Observable<PaginatedResult<any>> {
    criteria.params[0].device_type = deviceType;
    criteria.params[0].device_uuid = deviceId;
    return this.tableService.getData<PaginatedResult<any>>(`rest/zabbix/device_items/`, criteria);
  }

  buildForm(data: CustomDashboardWidget): FormGroup {
    if (data) {
      let form = this.builder.group({
        'name': [data.name, [Validators.required, NoWhitespaceValidator]],
        'group_by': [data.group_by, [Validators.required]],
        'widget_type': [data.widget_type],
        'status': [data.status],
      });
      if (data.widget_type == 'cloud') {
        form.addControl('cloud', new FormControl(data.cloud));
        form.addControl('platform_type', new FormControl(data.platform_type, [Validators.required]));
      }
      if (data.group_by_filter) {
        form.addControl('group_by_filter', new FormControl(data.group_by_filter, [Validators.required]));
      }
      return form;
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'group_by': ['', [Validators.required]],
        'widget_type': [''],
        'group_by_filter': [[], [Validators.required]],
        'status': [true],
      });
    }
  }

  resetFormErrors() {
    return {
      'name': '',
      'group_by': '',
      'platform_type': '',
      'group_by_filter': ''
    }
  }

  validationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'group_by': {
      'required': 'Group by type is required'
    },
    'platform_type': {
      'required': 'Cloud selection is requried'
    },
    'group_by_filter': {
      'required': 'Filter selection is requried'
    }
  }

  buildMetricsForm(data: CustomDashboardWidget): FormGroup {
    if (data) {
      let form = this.builder.group({
        'name': [data.name, [Validators.required, NoWhitespaceValidator]],
        'filter_by': [data.filter_by, [Validators.required]],
        'graph_type': [data.graph_type, [Validators.required]],
        'period': [data.period, [Validators.required]],
        'widget_type': [data.widget_type],
        'status': [data.status],
      });
      if (form.get('filter_by')?.value == 'top') {
        form.addControl('top_count', new FormControl(data.top_count, [Validators.required, Validators.min(1), Validators.max(10)]));
      } else if (form.get('filter_by')?.value == 'custom') {
        form.addControl('device_type', new FormControl(data.device_type, [Validators.required]));
        form.addControl('devices', new FormControl(data.devices, [Validators.required]));
      }
      if (form.get('period')?.value == 'last') {
        form.addControl('period_hour', new FormControl(data.period_hour, [Validators.required, Validators.min(0), Validators.max(23)]));
        form.addControl('period_min', new FormControl(data.period_min, [Validators.required, Validators.min(0), Validators.max(59)]));
      }
      //form.get('graph_type').value.includes('network') if graph_type is multiselect
      if (form.get('graph_type')?.value == 'network') {
        form.addControl('metrics_network_data', new FormControl(data.metrics_network_data, [Validators.required]));
        form.addControl('network_group_by', new FormControl(data.network_group_by, [Validators.required]));
        if (form.get('network_group_by')?.value == 'devices') {
          form.addControl('view_by', new FormControl(data.view_by, [Validators.required]));
        }
      }
      return form;
    } else {
      return this.builder.group({
        'name': ['', [Validators.required]],
        'filter_by': ['', [Validators.required]],
        'graph_type': ['', [Validators.required]],
        'period': ['', [Validators.required]],
        'widget_type': [''],
        'status': [true],
      });
    }
  }

  resetMetricsFormErrors() {
    return {
      'name': '',
      'filter_by': '',
      'top_count': '',
      'graph_type': '',
      'period': '',
      'period_hour': '',
      'period_min': '',
      'metrics_network_data': '',
      'network_group_by': '',
      'view_by': '',
      'device_type': '',
      'devices': '',
      'group_by_filter': ''

    }
  }

  metricsValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'filter_by': {
      'required': 'Filter is required'
    },
    'top_count': {
      'required': 'Required',
      'min': 'Enter > 0',
      'max': 'Enter < 10'
    },
    'graph_type': {
      'required': 'Graph type is required'
    },
    'period': {
      'required': 'Period is required'
    },
    'period_hour': {
      'required': 'Required',
      'min': 'Invalid',
      'max': 'Invalid'
    },
    'period_min': {
      'required': 'Required',
      'min': 'Invalid',
      'max': 'Invalid'
    },
    'metrics_network_data': {
      'required': 'Metric is required'
    },
    'network_group_by': {
      'required': 'Group by is required'
    },
    'view_by': {
      'required': 'View by is required'
    },
    'device_type': {
      'required': 'Device type is required'
    },
    'devices': {
      'required': 'Device is required'
    },
    'group_by_filter': {
      'required': 'Filter selection is requried'
    }

  }

  addUnitToValue(count: any, unit: string, pos: string) {
    switch (pos) {
      case 'left': return `${unit} ${count}`;
      case 'right': return `${count} ${unit}`;
      default: return count.toFixed(0);
    }
  }

  buildMetricesMappingform(): FormGroup {
    return this.builder.group({
      'device_type': [''],
      'device_key': [''],
      'metrices_key': [''],
      'selected_metrices_key': ['']
    });
  }

  convertHostAvailabilityGraphData(data: GraphDataType[], chartType: string = 'doughnut'): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = chartType;
    view.legend = false;
    let total: number = 0, totalUp: number = 0, totalDown: number = 0, totalUnknown: number = 0;
    data.forEach(d => {
      totalUp += d.Up;
      totalDown += d.Down;
      totalUnknown += d.Unknown;
      total += d.count;
    });
    let dataset: ChartDataSets = {};
    dataset.data = [];
    let colors = [];
    view.lables = ['Up', 'Down', 'Unkown'];
    view.lables.map((label) => {
      let d = (label == 'Up') ? totalUp : (label == 'Down') ? totalDown : totalUnknown;
      let c = (label == 'Up') ? '#0CBB70' : (label == 'Down') ? '#CC0000' : '#8F9BA6';
      dataset.data.push(d);
      colors.push(c);
    });
    view.datasets.push(dataset);
    view.colors.push({ backgroundColor: colors });
    view.options = this.chartConfigService.getDefaultPieChartOptions();
    view.options.responsive = true;
    view.options.maintainAspectRatio = false;
    view.options.tooltips.enabled = false;
    view.options.plugins.datalabels.display = false;
    if (chartType == 'doughnut') {
      view.options.cutoutPercentage = 60;
      let centerTextArr: Array<{ text: string, fontSize: string }> = [];
      centerTextArr.push({ text: 'Total', fontSize: `15px` });
      centerTextArr.push({ text: total.toFixed(0), fontSize: `15px` });
      view.customPlugin = this.chartConfigService.textAtCenterOfPieChartPlugin(centerTextArr);
    }
    return view;
  }

  convertHostAvailabilityStatusGraphData(data: GraphDataType[], chartType: string = 'doughnut'): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = chartType;
    view.legend = true;
    let dataset: ChartDataSets = {};
    dataset.data = [];
    let colors = [];
    let total = 0;
    data.map((d) => {
      let c = (d.name == 'Up') ? '#0CBB70' : (d.name == 'Down') ? '#CC0000' : '#8F9BA6';
      view.lables.push(`${d.name} : ${d.count}`);
      dataset.data.push(d.count);
      colors.push(c);
      total += d.count;
    });
    view.datasets.push(dataset);
    view.colors.push({ backgroundColor: colors });
    view.options = this.chartConfigService.getDefaultPieChartOptions();
    view.options.legend.position = 'right';
    view.options.legend.labels = { boxWidth: 8, padding: 3, usePointStyle: true };
    view.options.responsive = true;
    view.options.maintainAspectRatio = false;
    view.options.plugins.datalabels.display = false;
    view.options.tooltips.enabled = false;
    if (chartType == 'doughnut') {
      view.options.cutoutPercentage = 60;
      let centerTextArr: Array<{ text: string, fontSize: string }> = [];
      centerTextArr.push({ text: 'Total', fontSize: `15px` });
      centerTextArr.push({ text: total.toFixed(0), fontSize: `15px` });
      view.customPlugin = this.chartConfigService.textAtCenterOfPieChartPlugin(centerTextArr);
    }
    return view;
  }

  //added the below if we need stacked chart for status
  // convertHostAvailabilityStackedBarChartData(data: GraphDataType[]): UnityChartData {
  //   let view: UnityChartData = new UnityChartData();
  //   view.type = 'horizontalBar';
  //   view.legend = false;
  //   data.map(d =>{view.lables.push(`${d.name} : ${d.count}`);})
  //   let datalables: string[] = ['Up', 'Down', 'Unknown'];
  //   datalables.map(dl => {
  //     let ds: ChartDataSets = {};
  //     ds.label = dl;
  //     ds.data = [];
  //     data.map(bd => {
  //       ds.data.push(bd[dl]);
  //     })
  //     ds.backgroundColor = (dl == 'Up') ? '#0CBB70' : (dl == 'Down') ? '#CC0000' : '#8F9BA6';
  //     ds.hoverBackgroundColor = (dl == 'Up') ? '#0CBB70' : (dl == 'Down') ? '#CC0000' : '#8F9BA6';
  //     ds.maxBarThickness = 25;
  //     view.datasets.push(ds);
  //   });
  //   view.options = this.chartConfigService.getDefaultHorizantalStackedBarChartOptions();
  //   view.options.scales.xAxes[0].ticks.precision = 0;
  //   view.options.scales.xAxes[0].ticks.stepSize = 1;
  //   view.options.plugins.datalabels.display = false;
  //   view.options.tooltips.enabled = false;
  //   // view.options.tooltips.callbacks = {
  //   //   label: (item: ChartTooltipItem, data: ChartData) => {
  //   //     return `${data.datasets[item.datasetIndex].label} : ${item.value}`;
  //   //   },
  //   // }
  //   return view;
  // }

  // convertHostAvailabilityBarChartData(data: GraphDataType[], unitOption?: UnitConfig): UnityChartData {
  //   let view: UnityChartData = new UnityChartData();
  //   view.type = 'horizontalBar';
  //   view.legend = false;
  //   let ds: ChartDataSets = {};
  //   ds.data = [];
  //   ds.label = ''
  //   let bc: string[] = [];
  //   data.forEach(d => {
  //     let name = this.convertString(d.name);
  //     view.lables.push(`${name} : ${d.count}`);
  //     ds.data.push(d.count);
  //     bc.push(BarChartDefaultColor);
  //   });
  //   view.colors.push({ backgroundColor: bc });
  //   view.datasets.push(ds);
  //   view.options = this.chartConfigService.getDefaultHorizantalBarChartOptions();
  //   view.options.scales.xAxes[0].ticks.precision = 0;
  //   view.options.scales.xAxes[0].ticks.stepSize = 1;
  //   view.options.plugins.datalabels.display = false;
  //   view.options.tooltips.enabled = false;
  //   // view.options.tooltips.callbacks = {
  //   //   label: (item: ChartTooltipItem, data: ChartData) => {
  //   //     return `${data.datasets[item.datasetIndex].label} : ${item.value}`;
  //   //   },
  //   // }
  //   return view;
  // }

  convertToResponsiveDonutChartData(data: GraphDataType[], unitOption?: UnitConfig, chartType: string = 'doughnut', isSeverity?: boolean, isInfraCloud?: boolean): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = chartType;
    view.legend = true;
    let ds: ChartDataSets = {};
    ds.data = [];
    let total: number = 0;
    let colors = [];
    data.forEach(d => {
      let name = this.convertString(d.name);
      let count: string = this.addUnitToValue(d.count, unitOption?.unit, unitOption?.position);
      if (isInfraCloud) {
        view.lables.push(`${name}(${d.accounts}) : ${count}`);
      } else {
        view.lables.push(`${name} : ${count}`);
      }
      ds.data.push(d.count);
      total += d.count;
      if (isSeverity) {
        switch (name) {
          case 'Critical': colors.push('#cc0000'); break;
          case 'Information': colors.push('#378ad8'); break;
          case 'Warning': colors.push('#ff8800'); break;
        }
      }
    });
    let totalStr = this.addUnitToValue(total, unitOption?.unit, unitOption?.position);
    view.datasets.push(ds);
    if (!isSeverity) {
      colors = this.getColor(view.lables.length);
    }
    view.colors.push({ backgroundColor: colors });
    view.options = this.chartConfigService.getDefaultPieChartOptions();
    view.options.legend.position = 'right';
    view.options.legend.labels = { boxWidth: 8, padding: 3, usePointStyle: true };
    view.options.plugins.datalabels.display = false;
    view.options.tooltips.enabled = false;
    view.options.responsive = true;
    view.options.maintainAspectRatio = false;
    if (chartType == 'doughnut') {
      view.options.cutoutPercentage = 60;
      let centerTextArr: Array<{ text: string, fontSize: string }> = [];
      centerTextArr.push({ text: 'Total', fontSize: `15px` });
      centerTextArr.push({ text: totalStr, fontSize: `15px` });
      view.customPlugin = this.chartConfigService.textAtCenterOfPieChartPlugin(centerTextArr);
    }
    return view;
  }

  convertToLineChartData(metricsData: any[], isPreview?: boolean, metrics?: string): any {
    if (!metricsData.length) {
      return [];
    } else {
      let view: UnityChartData = new UnityChartData();
      view.type = 'line';
      view.legend = false;
      if (isPreview) {
        view.lables = metricsData.getFirst().data.map(d => d.clock);
      } else {
        view.lables = this.trimData(this.getLabels(metricsData));
      }
      let datalables: string[] = metricsData.map(d => d.name);
      let colors = [...chartDefaultColors];
      datalables.forEach(dl => {
        let color = colors.pop();
        let ds: ChartDataSets = {};
        ds.pointRadius = 2;
        ds.pointStyle = 'circle';
        ds.pointBackgroundColor = color;
        ds.pointBorderColor = color;
        ds.label = dl;
        ds.fill = false;
        ds.borderWidth = 1;
        ds.borderColor = color;
        ds.backgroundColor = color;
        ds.data = [];
        let hostData = metricsData.find(d => d.name == dl);
        if (hostData && hostData.data) {
          this.trimData(hostData.data).forEach(hd => {
            // hostData.data.forEach(hd => {
            if (hd.value && hd.value > 0) {
              ds.data.push(hd.value ? hd.value : 0);
            } else {
              ds.data.push(0);
            }
          })
        }
        view.linedata.push(ds);
      })
      view.options = this.chartConfigService.getDefaultLineChartOptions();
      view.options.legend.labels = { boxWidth: 6, padding: 10, usePointStyle: true, fontSize: 12 };
      view.options.legend.position = 'bottom';
      view.options.responsive = true;
      view.options.maintainAspectRatio = false;
      if (metrics == 'speed' || metrics == 'receive' || metrics == 'transmit') {
        view.options.scales.yAxes[0]['scaleLabel'] = {
          display: true,
          labelString: 'Mbps',
          fontSize: 12
        };
      } else if (!metrics || metrics == 'bandwidth') {
        view.options.scales.yAxes[0].ticks.suggestedMax = 100;
        view.options.scales.yAxes[0].ticks.stepSize = 20;
        view.options.scales.yAxes[0].ticks.callback = function (value) {
          return value + '%';
        };
      }
      return view;
    }
  }

  getLabels(data: any[]) {
    let labelArray: any[] = [];
    let date: any = ''
    let labels: any[] = [];
    data.forEach(m => {
      labelArray = [];
      if (m.data && m.data.length) {
        labelArray = m.data.map(d => d.clock);
        labels.push(...labelArray);
      }
    });
    labels = labels.map(label => Number(label)).sort((a, b) => a - b);
    for (let index = 0; index < labels.length; index++) {
      date = new Date(labels[index] * 1000);
      labels[index] = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    labels = Array.from(new Set(labels));
    return labels;
  }

  trimData(data: any[]) {
    const max = 15;
    if (data.length <= max) {
      return data;
    }
    let trimmedData = [];
    const interval = (data.length - 2) / (max - 2);
    trimmedData.push(data[0]);
    for (let i = 1; i < max - 1; i++) {
      const index = Math.round(i * interval);
      trimmedData.push(data[index]);
    }
    trimmedData.push(data[data.length - 1]);
    return trimmedData;
  }

  convertToBarChartData(data: GraphDataType[], unitOption?: UnitConfig): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'horizontalBar';
    let ds: ChartDataSets = {};
    ds.data = [];
    if (unitOption?.unit) {
      view.legend = unitOption.unit ? true : false;
      ds.label = unitOption.unit ? `(${unitOption.unit})` : '';
    }
    ds.maxBarThickness = 50;
    let bc: string[] = [];
    data.forEach(d => {
      let name = this.convertString(d.name);
      view.lables.push(name);
      ds.data.push(d.count);
      bc.push(BarChartDefaultColor);
    });
    view.colors.push({ backgroundColor: bc });
    view.datasets.push(ds);
    view.options = this.chartConfigService.getDefaultHorizantalBarChartOptions();
    view.options.legend.position = 'bottom';
    view.options.legend.labels = { boxWidth: 5, padding: 3, usePointStyle: true };
    view.options.scales.xAxes[0].ticks.precision = 0;
    view.options.scales.xAxes[0].ticks.stepSize = 1;
    view.options.scales.xAxes[0].ticks.minRotation = 0;
    view.options.scales.xAxes[0].ticks.maxRotation = 0;
    view.options.plugins.datalabels.display = false;
    view.options.maintainAspectRatio = false;
    let maxValue = 0;
    view.datasets.map(d => {
      const data = <number[]>d.data;
      const val = Math.max(...data);
      if (maxValue < val) {
        maxValue = val;
      }
    })
    view.options.scales.xAxes[0].ticks.suggestedMax = maxValue * (110 / 100);
    view.options.animation = {
      onProgress: function () {
        var chartInstance = this.chart, ctx = chartInstance.ctx, xaxisScale = chartInstance.scales['x-axis-0'];
        this.data.datasets.forEach(function (dataset, i) {
          var meta = chartInstance.controller.getDatasetMeta(i);
          meta.data.forEach(function (bar, index) {
            ctx.fillText('', bar._model.x, bar._model.y);
          });
        });
      }
    }
    return view;
  }

  convertToTableData(data: GraphDataType[]): GraphViewData[] {
    let viewData: GraphViewData[] = [];
    data.forEach(d => {
      let view: GraphViewData = new GraphViewData();
      view.name = d.name;
      view.disk = d.disk ? d.disk : '';
      view.count = d.count;
      view.hostName = d.host_name ? d.host_name : '';
      viewData.push(view);
    });
    return viewData;
  }

  convertToTrafficHostTableData(data: any[], groupBy?: string, isBandwidth?: boolean): NetworkTrafficViewData[] {
    let viewData: NetworkTrafficViewData[] = [];
    if (data && data.length) {
      if (groupBy && groupBy == 'interfaces') {
        data.forEach(d => {
          let view: NetworkTrafficViewData = new NetworkTrafficViewData();
          view.host = d.host;
          view.interfaceName = d.interface_name;
          view.value = d.value;
          viewData.push(view);
        });
      } else if (groupBy && groupBy == 'devices') {
        data.forEach(d => {
          let view: NetworkTrafficViewData = new NetworkTrafficViewData();
          view.name = d.name;
          if (isBandwidth) {
            view.value = Math.round(Number(d.value));
          } else {
            view.value = d.value;
          }
          viewData.push(view);
        });
      }
    }
    return viewData;
  }

  convertString(str: string) {
    return str.length > 12 ? str.substring(0, 12).concat('...') : str;
  }

  convertToMetricesMappingData(data: any[], isSummary?: boolean): MetricesMappingViewData[] {
    let viewData: MetricesMappingViewData[] = [];
    data.forEach(device => {
      let view: MetricesMappingViewData = new MetricesMappingViewData();
      view.name = isSummary ? device.device_name : device.name;
      if (device.status) {
        view.status = this.utilService.getDeviceStatus(device.status);
      } else {
        view.status = 'Not Configured';
      }
      if (device.items.length) {
        device.items.forEach(item => {
          let metric: MetricViewData = new MetricViewData();
          metric.name = isSummary ? item.name : item.item_name;
          metric.value = item.latest_value;
          metric.unit = item.unit;
          view.metrics.push(metric);
        });
      }
      viewData.push(view);
    });

    return viewData;
  }

  getColor(len: number) {
    let arr = [];
    let cIdx = 0
    for (let i = 0; i < len; i++) {
      cIdx = cIdx < chartDefaultColors.length ? cIdx : 0;
      arr.push(chartDefaultColors[cIdx]);
      cIdx++;
    }
    return arr;
  }

  createWidget(data: any) {
    return this.http.post(`/customer/custom_widget/widget/`, data);
  }

  updateWidget(data: any, widgetId: string) {
    return this.http.patch(`/customer/custom_widget/widget/${widgetId}/`, data);
  }
}

export const subTabs: WidgetTab[] = [
  { icon: 'fas fa-satellite-dish', name: 'Host Availability', value: 'host_availability' },
  { icon: 'fas fa-cloud', name: 'Cloud', value: 'cloud' },
  { icon: 'fas fa-network-wired', name: 'Infra Summary', value: 'infra_summary' },
  { icon: 'fas fa-money-check-alt', name: 'Cloud Cost', value: 'cloud_cost' },
  { icon: 'fas fa-bell', name: 'Alerts', value: 'alerts' },
  { icon: 'fas fa-leaf', name: 'Sustainability', value: 'sustainability' },
  { icon: 'fas fa-chart-bar', name: 'Monitoring', value: 'metrices' },
  { icon: 'fas fa-hdd', name: 'Device By OS', value: 'device_by_os' }
];

export const publicClouds = [
  { name: 'AWS' },
  { name: 'Azure' },
  { name: 'GCP' },
  { name: 'Oracle' },
];

export const groupByList = [
  {
    name: 'host_availability',
    list: [
      { 'name': 'Device Type', 'value': 'device_type' },
      { 'name': 'Datacenter', 'value': 'datacenter' },
      { 'name': 'Cloud', 'value': 'cloud_type' },
      { 'name': 'Status', 'value': 'status' },
      { 'name': 'Tags', 'value': 'tags' }
    ]
  },
  {
    name: 'cloud',
    list: [
      { 'name': 'Locations', 'value': 'locations' },
      { 'name': 'Tags', 'value': 'tags' }
    ],
    pc_list: [
      { 'name': 'Cloud', 'value': 'cloud_type' },
      { 'name': 'Regions', 'value': 'regions' },
      { 'name': 'Resource Types', 'value': 'resource_types' },
      { 'name': 'Tags', 'value': 'tags' }
    ],
  },
  {
    name: 'infra_summary',
    list: [
      { 'name': 'Device Type', 'value': 'device_type' },
      { 'name': 'Datacenter', 'value': 'datacenter' },
      { 'name': 'Cloud', 'value': 'cloud_type' },
      { 'name': 'Tags', 'value': 'tags' }
    ]
  },
  {
    name: 'cloud_cost',
    list: [
      { 'name': 'Cloud', 'value': 'cloud_type' },
      { 'name': 'Account Name', 'value': 'account_name' },
      { 'name': 'Regions', 'value': 'regions' },
      { 'name': 'Service', 'value': 'service' },
      // { 'name': 'Resource Types', 'value': 'resource_types' }
    ]
  },
  {
    name: 'alerts',
    list: [
      { 'name': 'Alert Source', 'value': 'alert_source' },
      { 'name': 'Severity', 'value': 'severity' },
      { 'name': 'Device Type', 'value': 'device_type' },
      { 'name': 'Datacenter', 'value': 'datacenter' },
      { 'name': 'Cloud', 'value': 'cloud_type' },
      { 'name': 'Status', 'value': 'status' }
    ]
  },
  {
    name: 'sustainability',
    list: [
      { 'name': 'Device Type', 'value': 'device_type' },
      { 'name': 'Datacenter', 'value': 'datacenter' },
      // { 'name': 'Status', 'value': 'status' },
      { 'name': 'Cloud', 'value': 'cloud_type' },
      { 'name': 'Tags', 'value': 'tags' }
    ]
  },
  {
    name: 'metrices',
    list: [
      { 'name': 'Top 10 CPU Hosts', 'value': 'top_10_cpu_hosts' },
      { 'name': 'Top 10 Memory Hosts', 'value': 'top_10_memory_hosts' },
      { 'name': 'Top 10 Storage Hosts', 'value': 'top_10_storage_hosts' },
      { 'name': 'Top 10 Network Traffic Hosts', 'value': 'top_10_network_traffic_hosts' }
    ]
  },
  {
    name: 'device_by_os',
    list: [
      { 'name': 'OS Type', 'value': 'os_type' },
      { 'name': 'OS Version', 'value': 'os_version' }
    ]
  },
];

//Widget sample data
export const deviceTypeData = [
  { name: 'Hypervisor', count: 10 },
  { name: 'Switch', count: 120 },
  { name: 'Firewall', count: 50 },
  { name: 'Storage', count: 84 },
  { name: 'Vms', count: 11 },
  { name: 'PDU', count: 110 },
  { name: 'Customs', count: 65 }
];

export const hostAvailabilityDeviceTypeData = [
  { "Down": 0, "count": 0, "Unknown": 0, "Up": 0, "name": "pod" },
  { "Down": 97, "count": 179, "Unknown": 4, "Up": 78, "name": "VM" },
  { "Down": 0, "count": 9, "Unknown": 0, "Up": 9, "name": "cabinet" },
  { "Down": 0, "count": 16, "Unknown": 9, "Up": 7, "name": "firewall" },
  { "Down": 4, "count": 43, "Unknown": 25, "Up": 14, "name": "switch" },
  { "Down": 1, "count": 8, "Unknown": 5, "Up": 2, "name": "load_balancer" },
  { "Down": 2, "count": 15, "Unknown": 5, "Up": 8, "name": "storage_device" },
  { "Down": 5, "count": 10, "Unknown": 4, "Up": 1, "name": "mac_device" },
  { "Down": 3, "count": 9, "Unknown": 0, "Up": 6, "name": "bm_server" },
  { "Down": 0, "count": 5, "Unknown": 4, "Up": 1, "name": "PDU" },
  { "Down": 0, "count": 29, "Unknown": 29, "Up": 0, "name": "URL" }
];

export const hostAvailabilitydatacenterData = [
  { "Down": 2, "count": 18, "Unknown": 5, "Up": 11, "name": "DC-Tes" },
  { "Down": 0, "count": 30, "Unknown": 23, "Up": 7, "name": "aerys" },
  { "Down": 0, "count": 13, "Unknown": 10, "Up": 3, "name": "test-2024" },
  { "Down": 0, "count": 1, "Unknown": 0, "Up": 1, "name": "SF10ColoCloud" },
  { "Down": 0, "count": 2, "Unknown": 0, "Up": 2, "name": "Test_Cloud" },
  { "Down": 0, "count": 77, "Unknown": 73, "Up": 4, "name": "AerysLA1ColoCloud" },
  { "Down": 0, "count": 3, "Unknown": 2, "Up": 1, "name": "AutomationDatacentre270524145741" }
];

export const hostAvailabilitycloudData = [
  { "Down": 0, "count": 41, "Unknown": 41, "Up": 0, "name": "hyperv" },
  { "Down": 2, "count": 16, "Unknown": 4, "Up": 10, "name": "Custom" },
  { "Down": 0, "count": 11, "Unknown": 9, "Up": 2, "name": "vcenter-anas" },
  { "Down": 0, "count": 29, "Unknown": 28, "Up": 1, "name": "esxi" },
  { "Down": 0, "count": 25, "Unknown": 23, "Up": 2, "name": "vcenter-admin@vsphere" },
  { "Down": 0, "count": 4, "Unknown": 4, "Up": 0, "name": "vcloud" },
  { "Down": 0, "count": 5, "Unknown": 0, "Up": 5, "name": "nutanix-prod" },
  { "Down": 0, "count": 0, "Unknown": 0, "Up": 0, "name": "Azure" },
  { "Down": 11, "count": 50, "Unknown": 0, "Up": 39, "name": "GCP" },
  { "Down": 5, "count": 10, "Unknown": 0, "Up": 5, "name": "OCI" },
  { "Down": 0, "count": 0, "Unknown": 0, "Up": 0, "name": "AWS" }
];

export const hostAvailabilitystatusData = [
  { "count": 126, "name": "Up" },
  { "count": 112, "name": "Down" },
  { "count": 85, "name": "Unknown" }
];

export const hostAvailabilitytagData = [
  { "Down": 0, "count": 1, "Unknown": 0, "Up": 1, "name": "test-switches" },
  { "Down": 0, "count": 1, "Unknown": 0, "Up": 1, "name": "Testunity" },
  { "Down": 0, "count": 1, "Unknown": 0, "Up": 1, "name": "testcabinet" },
  { "Down": 0, "count": 1, "Unknown": 1, "Up": 0, "name": "tagalpha" },
  { "Down": 0, "count": 1, "Unknown": 1, "Up": 0, "name": "testswitchadvance" },
  { "Down": 1, "count": 2, "Unknown": 0, "Up": 1, "name": "unitytag" },
  { "Down": 0, "count": 1, "Unknown": 0, "Up": 1, "name": "TestTags" },
  { "Down": 1, "count": 1, "Unknown": 0, "Up": 0, "name": "development" },
];

export const datacenterData = [
  { name: 'Test_Cloud', count: 50 },
  { name: 'DC-Tes', count: 9 },
  { name: 'Test-2024', count: 70 },
  { name: 'SF10 ColoCloud', count: 33 }
];

export const cloudData = [
  { name: 'AWS', count: 2 },
  { name: 'Azure', count: 1 },
  { name: 'GCP', count: 0 },
  { name: 'Oracle', count: 1 }
];

export const InfraCloudData = [
  { name: 'AWS', count: 2, accounts: 2 },
  { name: 'Azure', count: 1, accounts: 3 },
  { name: 'GCP', count: 0, accounts: 0 },
  { name: 'Oracle', count: 1, accounts: 2 }
];

export const statusData = [
  { name: 'Up', count: 10 },
  { name: 'Down', count: 4 },
  { name: 'Unknown', count: 6 }
];

export const alertStatusData = [
  { name: 'Resolved', count: 30 },
  { name: 'Open', count: 4 },
];

export const tagData = [
  { name: 'testtag', count: 30 },
  { name: 'tagalpha', count: 20 },
  { name: 'development', count: 12 },
  { name: 'unitytag', count: 20 }
];

export const locationData = [
  { name: 'EastBengaluru, Karnataka, India', count: 1 },
  { name: 'San Francisco, CA, USA', count: 4 },
  { name: 'US West', count: 6 },
  { name: 'Asia South', count: 2 },
];

export const regionData = [
  { name: 'US East', count: 14 },
  { name: 'South America - East', count: 20 },
  { name: 'US West', count: 10 },
  { name: 'Asia South', count: 5 },
  { name: 'Europe West', count: 8 }
];

export const resourceData = [
  { name: 'Alarm', count: 30 },
  { name: 'Alerts', count: 90 },
  { name: 'Cluster', count: 58 },
  { name: 'DB Snapshot', count: 60 },
  { name: 'Capacity Provider', count: 10 }
];

export const serviceData = [
  { name: 'Storage', count: 20 },
  { name: 'AmazonCloudWatch', count: 100 },
  { name: 'EC2 - Other', count: 87 },
  { name: 'Amazon Virtual Private Cloud', count: 105 },
];

export const alertSourceData = [
  { name: 'Unity', count: 81 },
  { name: 'Zabbix', count: 78 },
  { name: 'AWS', count: 99 },
  { name: 'Azure', count: 43 },
];

export const severityData = [
  { name: 'Critical', count: 81 },
  { name: 'Information', count: 99 },
  { name: 'Warning', count: 78 }
];

export const accountData = [
  { name: 'Test Account', count: 30 },
  { name: 'Alpha Acc', count: 70 },
  { name: 'Alpha Test', count: 55 },
  { name: 'Account', count: 70 }
];

export const CPUHostData = [
  { name: 'CPU Utilization', host_name: 'Test', count: 30 },
  { name: 'CPU Utilization', host_name: 'Dev test', count: 75 },
  { name: 'CPU Utilization', host_name: 'Alpha host', count: 95 },
  { name: 'CPU Utilization', host_name: 'Unity Test', count: 40 },
  { name: 'CPU Utilization', host_name: 'Dev1', count: 60 },
  { name: 'CPU Utilization', host_name: 'Alpha-test', count: 99 },
  { name: 'CPU Utilization', host_name: 'Unity host', count: 10 },
];

export const MemoryHostData = [
  { name: 'Memory Utilization', host_name: 'Test', count: 30 },
  { name: 'Memory Utilization', host_name: 'Dev test', count: 75 },
  { name: 'Memory Utilization', host_name: 'Alpha host', count: 95 },
  { name: 'Memory Utilization', host_name: 'Unity Test', count: 40 },
  { name: 'Memory Utilization', host_name: 'Dev1', count: 60 },
  { name: 'Memory Utilization', host_name: 'Alpha-test', count: 99 },
  { name: 'Memory Utilization', host_name: 'Unity host', count: 10 },
];

export const storageHostData = [
  { name: 'Test Host', "disk": "/:boot", count: 20 },
  { name: 'Host T1', "disk": "/:boot", count: 50 },
  { name: 'Alpha Test', "disk": "/:boot", count: 43 },
  { name: 'Dev Test', "disk": "/:boot", count: 60 },
  { name: 'Storage Host', "disk": "/:boot", count: 78 },
  { name: 'Alpha Test', "disk": "/:boot", count: 98 },
  { name: 'Dev Test', "disk": "/:boot", count: 21 },
];

export const networkTrafficHostData = [
  {
    "interface_name": "VMware VMXNET3 Ethernet Controller",
    "host": "testing-interface",
    "name": "test switch"
  },
  {
    "interface_name": "FastEthernet0/10",
    "host": "TestTOP 10 CPU",
    "name": "firewall 1"

  },
  {
    "interface_name": "test interface",
    "host": "Test top 10",
    "name": "alpha test"

  },
  {
    "interface_name": "alpha interface",
    "host": "testing-interface",
    "name": "load balancer"
  }
];

export const osTypeData = [
  { name: 'CentOS', count: 42 },
  { name: 'Cisco', count: 92 },
  { name: 'Debian 3', count: 54 },
  { name: 'ESXI', count: 82 }
];

export const osVersionData = [
  { name: 'CentOS', count: 4 },
  { name: 'Cisco', count: 1 },
  { name: 'Debian 3', count: 3 },
  { name: 'ESXI', count: 5 }
];

export const cpuGraphData = [
  {
    'name': 'test-cpu',
    'data': [
      {
        'clock': '10:01',
        'value': 80
      },
      {
        'clock': '10:02',
        'value': 20
      }, {
        'clock': '10:03',
        'value': 70
      }, {
        'clock': '10:04',
        'value': 90
      }, {
        'clock': '10:05',
        'value': 10
      },
    ]
  },
  {
    'name': 'alpha host',
    'data': [
      {
        'clock': '10:01',
        'value': 10
      },
      {
        'clock': '10:02',
        'value': 40
      }, {
        'clock': '10:03',
        'value': 20
      }, {
        'clock': '10:04',
        'value': 60
      }, {
        'clock': '10:05',
        'value': 30
      },
    ]
  },
  {
    'name': 'dev test',
    'data': [
      {
        'clock': '10:01',
        'value': 80
      },
      {
        'clock': '10:02',
        'value': 10
      }, {
        'clock': '10:03',
        'value': 30
      }, {
        'clock': '10:04',
        'value': 90
      }, {
        'clock': '10:05',
        'value': 40
      },
    ]
  },
  {
    'name': 'switch',
    'data': [
      {
        'clock': '10:01',
        'value': 77
      },
      {
        'clock': '10:02',
        'value': 49
      },
      {
        'clock': '10:03',
        'value': 44
      },
      {
        'clock': '10:04',
        'value': 61
      },
      {
        'clock': '10:05',
        'value': 63
      }
    ]
  },
  {
    'name': 'firewall',
    'data': [
      {
        'clock': '10:01',
        'value': 45
      },
      {
        'clock': '10:02',
        'value': 84
      },
      {
        'clock': '10:03',
        'value': 36
      },
      {
        'clock': '10:04',
        'value': 67
      },
      {
        'clock': '10:05',
        'value': 78
      }
    ]
  }
];

export const storageGraphData = [
  {
    'name': 'alpha host',
    'data': [
      {
        'clock': '10:01',
        'value': 10
      },
      {
        'clock': '10:02',
        'value': 20
      }, {
        'clock': '10:03',
        'value': 90
      }, {
        'clock': '10:04',
        'value': 60
      }, {
        'clock': '10:05',
        'value': 30
      },
    ]
  },
  {
    'name': 'dev test',
    'data': [
      {
        'clock': '10:01',
        'value': 80
      },
      {
        'clock': '10:02',
        'value': 10
      }, {
        'clock': '10:03',
        'value': 30
      }, {
        'clock': '10:04',
        'value': 90
      }, {
        'clock': '10:05',
        'value': 40
      },
    ]
  },
  {
    'name': 'test-cpu',
    'data': [
      {
        'clock': '10:01',
        'value': 70
      },
      {
        'clock': '10:02',
        'value': 10
      }, {
        'clock': '10:03',
        'value': 80
      }, {
        'clock': '10:04',
        'value': 90
      }, {
        'clock': '10:05',
        'value': 20
      },
    ]
  },
  {
    'name': 'switch',
    'data': [
      {
        'clock': '10:01',
        'value': 77
      },
      {
        'clock': '10:02',
        'value': 49
      },
      {
        'clock': '10:03',
        'value': 44
      },
      {
        'clock': '10:04',
        'value': 61
      },
      {
        'clock': '10:05',
        'value': 63
      }
    ]
  },
  {
    'name': 'firewall',
    'data': [
      {
        'clock': '10:01',
        'value': 45
      },
      {
        'clock': '10:02',
        'value': 84
      },
      {
        'clock': '10:03',
        'value': 36
      },
      {
        'clock': '10:04',
        'value': 67
      },
      {
        'clock': '10:05',
        'value': 78
      }
    ]
  }
];

export const metricesColumns = [
  ['Host', 'Name', 'CPU Utilization'],
  ['Host', 'Name', 'Memory Utilization'],
  ['Host', 'Disk', 'Storage Utilization'],
  ['Interface Name', 'Host']
];

const BarChartDefaultColor: string = '#378ad8';

export const chartDefaultColors: string[] = [
  '#0CBB70',
  '#6f42c1',
  '#4A90E2',
  '#FFCB47',
  '#FF477B',
  '#59DBFF',
  '#CB47FF',
  '#ff8800',
  '#0b69c2',
  '#074e8b',
  '#720000',
  '#ff4545',
  '#e56717',
  '#065a52',
];

export const periodTypes: Array<{ name: string, displayName: string }> = [
  {
    name: 'latest',
    displayName: 'Latest'
  },
  {
    name: 'last',
    displayName: 'Last'
  }
]

export const metricTypes: Array<{ name: string, displayName: string }> = [
  {
    name: 'receive',
    displayName: 'Receive'
  },
  {
    name: 'transmit',
    displayName: 'Transmit'
  },
  {
    name: 'bandwidth',
    displayName: 'Bandwidth'
  },
  {
    name: 'speed',
    displayName: 'Speed'
  },
  {
    name: 'inbound_error',
    displayName: 'Inbound Error'
  },
  {
    name: 'inbound_discard',
    displayName: 'Inbound Discard'
  },
  {
    name: 'outbound_error',
    displayName: 'Outbound Error'
  },
  {
    name: 'outbound_discard',
    displayName: 'Outbound Discard'
  }
]

export const filterTypes: Array<{ name: string, displayName: string }> = [
  {
    name: 'top',
    displayName: 'Top'
  },
  {
    name: 'custom',
    displayName: 'Custom'
  },
  {
    name: 'metric',
    displayName: 'Latest'
  }
]

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
  },
  {
    name: "open_stack",
    displayName: "Openstack"
  },
  {
    name: "virtual_machine",
    displayName: "Custom VM"
  },
  {
    name: "proxmox",
    displayName: "Proxmox"
  },
  {
    name: "nutanix",
    displayName: "Nutanix"
  },
  {
    name: "hyperv",
    displayName: "HyperV"
  },
  {
    name: "vmware",
    displayName: "VMware"
  }
];

export const graphTypes: Array<{ name: string, displayName: string }> = [
  {
    name: 'cpu',
    displayName: 'CPU'
  },
  {
    name: 'memory',
    displayName: 'Memory'
  },
  {
    name: 'storage',
    displayName: 'Storage'
  },
  {
    name: 'network',
    displayName: 'Network'
  }
]

export const groupByTypes: Array<{ name: string, displayName: string }> = [
  {
    name: 'devices',
    displayName: 'Devices'
  },
  {
    name: 'interfaces',
    displayName: 'Interfaces'
  }
]

export const viewByTypes: Array<{ name: string, displayName: string }> = [
  {
    name: 'aggregate',
    displayName: 'Aggregate'
  },
  {
    name: 'average',
    displayName: 'Average'
  }
]

interface UnitConfig {
  unit: string;
  position: string;
}