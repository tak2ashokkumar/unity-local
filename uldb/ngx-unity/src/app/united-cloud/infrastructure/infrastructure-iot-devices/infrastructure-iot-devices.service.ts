import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { UNITY_FONT_FAMILY, UNITY_TEXT_DEFAULT_COLOR } from 'src/app/app-constants';
import { AppLevelService } from 'src/app/app-level.service';
import { DEVICES_FAST_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { StatusState, TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { CustomDateRangeType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UnityChartConfigService, UnityChartDetails, UnityChartTypes } from 'src/app/shared/unity-chart-config.service';
import { DurationDropdownType, IOTDevicesAirflowWidgetSummaryData, IOTDevicesAirflowWidgetTrendDataType, IOTDevicesCountByStatus, IOTDevicesHumidityWidgetSummaryData, IOTDevicesHumidityWidgetTrendDataType, IOTDevicesRecentEvents, IOTDevicesSummary, IOTDevicesSummaryModels, IOTDevicesSummaryStatusByGroup, IOTDevicesTemperatureWidgetSummaryData, IOTDevicesTemperatureWidgetTrendDataType, RecentModifiedRFIDTags, SmartPDU, Top5IOTDevicesByTemperature } from './infrastructure-iot-devices.type';
import { IotDeviceType } from 'src/app/shared/SharedEntityTypes/inventory/iot-device.type';
import * as echarts from 'echarts';

@Injectable()
export class InfrastructureIotDevicesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private chartConfigSvc: UnityChartConfigService,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder,
    private appService: AppLevelService,) { }

  getDatacenters(): Observable<DatacenterFast[]> {
    return this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ), { params: new HttpParams().set('page_size', 0) })
  }

  getIotDevicesByCabinet(cabinetId: number): Observable<IotDeviceType[]> {
    let params: HttpParams = new HttpParams().set('cabinet', cabinetId).set('device_type', 'sensor').set('page_size', 0);
    return this.http.get<IotDeviceType[]>(`/customer/iot_devices/`, { params: params });
  }

  getIotDevicesBySensorDeviceType(): Observable<IotDeviceType[]> {
    let params: HttpParams = new HttpParams().set('device_type', 'sensor').set('page_size', 0);
    return this.http.get<IotDeviceType[]>(`/customer/iot_devices/`, { params: params });
  }

  getSummaryData(criteria: SearchCriteria): Observable<IOTDevicesSummary> {
    // return of(SUMMARY_DATA);
    let params: HttpParams = this.tableService.getWithParam(criteria);
    return this.http.get<IOTDevicesSummary>(`/customer/iot_devices_summary/`, { params: params });
  }

  convertToSummaryViewData(data: IOTDevicesSummary): IOTDevicesSummaryViewData {
    let viewData: IOTDevicesSummaryViewData = new IOTDevicesSummaryViewData();
    viewData.totalDevices = data.total_devices;
    if (data.avg_temperature) {
      viewData.avgTemperature = new IOTDevicesSummaryDetailsViewData();
      viewData.avgTemperature.current = data.avg_temperature.current;
      viewData.avgTemperature.lastOneHr = `${data.avg_temperature.last_1_hr}%`;
      if (data.avg_temperature.last_1_hr) {
        viewData.avgTemperature.lastOneHrIconClass = data.avg_temperature.last_1_hr > 0 ? 'fa-caret-up' : 'fa-caret-down';
        viewData.avgTemperature.lastOneHrTextClass = data.avg_temperature.last_1_hr > 0 ? 'text-danger' : 'text-success';
      } else {
        viewData.avgTemperature.lastOneHrIconClass = 'fa-caret-up';
        viewData.avgTemperature.lastOneHrTextClass = 'text-success';
      }
    }
    if (data.avg_humidity) {
      viewData.avgHumidity = new IOTDevicesSummaryDetailsViewData();
      viewData.avgHumidity.current = data.avg_humidity.current;
      viewData.avgHumidity.lastOneHr = `${data.avg_humidity.last_1_hr}%`;
      if (data.avg_humidity.last_1_hr) {
        viewData.avgHumidity.lastOneHrIconClass = data.avg_humidity.last_1_hr > 0 ? 'fa-caret-up' : 'fa-caret-down';
        viewData.avgHumidity.lastOneHrTextClass = data.avg_humidity.last_1_hr > 0 ? 'text-danger' : 'text-success';
      } else {
        viewData.avgHumidity.lastOneHrIconClass = 'fa-caret-up';
        viewData.avgHumidity.lastOneHrTextClass = 'text-success';
      }
    }
    if (data.avg_airflow) {
      viewData.avgAirflow = new IOTDevicesSummaryDetailsViewData();
      viewData.avgAirflow.current = data.avg_airflow.current;
      viewData.avgAirflow.lastOneHr = `${data.avg_airflow.last_1_hr}%`;
      if (data.avg_airflow.last_1_hr) {
        viewData.avgAirflow.lastOneHrIconClass = data.avg_airflow.last_1_hr > 0 ? 'fa-caret-up' : 'fa-caret-down';
        viewData.avgAirflow.lastOneHrTextClass = data.avg_airflow.last_1_hr > 0 ? 'text-danger' : 'text-success';
      } else {
        viewData.avgAirflow.lastOneHrIconClass = 'fa-caret-up';
        viewData.avgAirflow.lastOneHrTextClass = 'text-success';
      }
    }
    if (data.avg_power) {
      viewData.avgPower = new IOTDevicesSummaryDetailsViewData();
      viewData.avgPower.current = data.avg_power.current;
      viewData.avgPower.lastOneHr = `${data.avg_power.last_1_hr}%`;
      if (data.avg_power.last_1_hr) {
        viewData.avgPower.lastOneHrIconClass = data.avg_power.last_1_hr > 0 ? 'fa-caret-up' : 'fa-caret-down';
        viewData.avgPower.lastOneHrTextClass = data.avg_power.last_1_hr > 0 ? 'text-danger' : 'text-success';
      } else {
        viewData.avgPower.lastOneHrIconClass = 'fa-caret-up';
        viewData.avgPower.lastOneHrTextClass = 'text-success';
      }
    }
    return viewData;
  }

  getStatusByGroupData(criteria: SearchCriteria): Observable<TaskStatus> {
    // return of(IOT_DEVICES_GROUP);
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<CeleryTask>(`/customer/iot_devices_group/`, { params: params })
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 100).pipe(take(1))), take(1));
  }

  setStatusByChildren(subNodes: IOTDevicesStatusByGroupData[]) {
    switch (true) {
      case subNodes.every(node => node.status == 'up'): return 'up';
      case subNodes.every(node => node.status == 'down'): return 'down';
      case subNodes.every(node => node.status == 'unknown'): return 'unknown';
      case subNodes.every(node => node.status == 'up'): return 'unknown';
      default: return 'amber';
    }
  }

  convertToStatusByGroupViewData(data: IOTDevicesSummaryStatusByGroup, viewData: IOTDevicesStatusByGroupViewData) {
    let manufacturerData = <IOTDevicesSummaryModels[]>Object.values(data);
    manufacturerData.map(mfd => {
      let mfr = new IOTDevicesStatusByGroupData();
      mfr.name = mfd.manufacturer_name;
      mfr.nodeType = 'Manufacturer';
      if (mfd.models && Object.keys(mfd.models).length) {
        Object.keys(mfd.models).forEach(modelName => {
          let mdl = new IOTDevicesStatusByGroupData();
          mdl.name = modelName;
          mdl.nodeType = 'Model';
          mfd.models[modelName].map(device => {
            let c = new IOTDevicesStatusByGroupData();
            c.name = device.name;
            c.nodeType = 'Device';
            c.type = device.device_type;
            c.status = device.status;
            c.uuid = device.uuid;
            c.monitoring = device.monitoring;
            mdl.nodes.push(c);
          });
          mdl.status = this.setStatusByChildren(mdl.nodes);
          mfr.nodes.push(mdl);
        })
      }
      mfr.status = this.setStatusByChildren(mfr.nodes);
      viewData.manufacturerViewData.push(mfr);
    })
    viewData.manufacturerViewData.forEach(mfvd => {
      viewData.modelViewData = viewData.modelViewData.concat(mfvd.nodes);
    })
    viewData.modelViewData.forEach(mvd => {
      viewData.deviceViewData = viewData.deviceViewData.concat(mvd.nodes);
    })
    viewData.displayViewData = viewData.manufacturerViewData;
  }

  getSmartPDUs(criteria: SearchCriteria): Observable<PaginatedResult<SmartPDU>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    params = params.append('page_size', '4');
    // return of(SMART_PDUS);
    return this.http.get<PaginatedResult<SmartPDU>>(`/customer/smart_pdus/`, { params: params });
  }

  convertToSmartPDUViewData(data: SmartPDU[]): SmartPDUViewData[] {
    if (!data) return [];
    let viewData: SmartPDUViewData[] = [];
    data.map(d => {
      let a = new SmartPDUViewData();
      a.uuid = d.uuid;
      a.name = d.name;
      a.current = d.current;
      a.voltage = d.voltage;
      a.power = d.power;
      a.outletStatus = d.outlet_status;
      a.status = d.status;
      a.monitoring = d.monitoring;
      viewData.push(a);
    })
    return viewData;
  }

  getTemperatureWidgetSummaryData(criteria: SearchCriteria, temperatureSummary: IOTDevicesTemperatureWidgetViewData): Observable<IOTDevicesTemperatureWidgetSummaryData> {
    const from = temperatureSummary?.dateRangeformData?.from;
    const to = temperatureSummary?.dateRangeformData?.to;
    let params: HttpParams = this.tableService.getWithParam(criteria);
    const format = new DateRange().format;
    params = params.set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<IOTDevicesTemperatureWidgetSummaryData>(`/customer/sensors_temperature_summary/`, { params: params });
  }

  getTemperatureWidgetTop5SensorsData(criteria: SearchCriteria, temperatureWidgetViewData: IOTDevicesTemperatureWidgetViewData): Observable<Top5IOTDevicesByTemperature[]> {
    const from = temperatureWidgetViewData?.dateRangeformData?.from;
    const to = temperatureWidgetViewData?.dateRangeformData?.to;
    let params: HttpParams = this.tableService.getWithParam(criteria);
    const format = new DateRange().format;
    params = params.set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<Top5IOTDevicesByTemperature[]>(`customer/top_sensors_temperature/`, { params: params });
  }

  getTemperatureWidgetTrendData(criteria: SearchCriteria, temperatureWidgetViewData: IOTDevicesTemperatureWidgetViewData): Observable<IOTDevicesTemperatureWidgetTrendDataType[]> {
    const from = temperatureWidgetViewData?.dateRangeformData?.from;
    const to = temperatureWidgetViewData?.dateRangeformData?.to;
    const cabinetId = temperatureWidgetViewData?.trendChartDeviceSelectionForm?.get('cabinet')?.value;
    const deviceId = temperatureWidgetViewData?.trendChartDeviceSelectionForm?.get('device')?.value;
    let params: HttpParams = this.tableService.getWithParam(criteria);
    const format = new DateRange().format;
    params = params.set('from', moment(from).format(format)).set('to', moment(to).format(format)).set('cabinet', cabinetId).set('sensor', deviceId);
    return this.http.get<IOTDevicesTemperatureWidgetTrendDataType[]>(`customer/sensors_temperature_trend/`, { params: params });
  }

  getTemperatureTrendChart(data: any, durationDropdownData: DurationDropdownType) {
    let diff = this.utilSvc.getTimeDifference(durationDropdownData.to, durationDropdownData.from);
    let isLastTwentyFourHours: boolean = false;
    if (diff?.asSeconds <= 86400) {
      isLastTwentyFourHours = true;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    view.options.tooltip = {
      trigger: 'axis',
      formatter: function (params: any) {
        const item = params[0];
        const time = echarts.time.format(item.axisValue, isLastTwentyFourHours ? '{HH}:{mm}' : '{MMM} {dd}, {yyyy} {HH}:{mm}', false);
        return `${time}<br/>Temperature: ${item.data[1]}°C`;
      }
    }
    view.options.grid = {
      left: "3%",
      right: "4%",
      top: "5%",
      bottom: "10%",
      containLabel: true
    }
    view.options.legend = {
      show: false // hide real legend
    }
    view.options.graphic = [
      {
        type: 'group',
        left: 'center',
        bottom: 0,
        children: [
          {
            type: 'rect',
            shape: { width: 10, height: 10 },
            style: { fill: '#2ecc71' },
            left: 0
          },
          {
            type: 'text',
            style: { text: 'Normal (<40°C)', fill: '#000', font: '12px sans-serif' },
            left: 15
          },
          {
            type: 'rect',
            shape: { width: 10, height: 10 },
            style: { fill: '#f1c40f' },
            left: 150
          },
          {
            type: 'text',
            style: { text: 'Moderate (40°C - 60°C)', fill: '#000', font: '12px sans-serif' },
            left: 165
          },
          {
            type: 'rect',
            shape: { width: 10, height: 10 },
            style: { fill: '#e74c3c' },
            left: 360
          },
          {
            type: 'text',
            style: { text: 'Critical (>60°C)', fill: '#000', font: '12px sans-serif' },
            left: 375
          }
        ]
      }
    ]
    view.options.xAxis = {
      type: 'time',
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 10,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR(),
        rotate: 45,
        formatter: (value: number) => {
          return echarts.time.format(value, isLastTwentyFourHours ? '{HH}:{mm}' : '{MMM} {dd}, {yyyy} {HH}:{mm}', false);
        }
      },
    }
    view.options.yAxis = {
      type: "value",
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dotted', // Dashed or dotted
          color: '#ccc'
        }
      },
      axisLabel: {
        formatter: '{value}°C',
      },
      name: 'Temperature (°C)',
    }
    view.options.visualMap = {
      type: 'piecewise',
      show: false,
      dimension: 1,
      pieces: [
        { lte: 35, color: '#2ecc71' },
        { gt: 40, lte: 60, color: '#f1c40f' },
        { gt: 60, color: '#e74c3c' }
      ]
    }
    view.options.series = [
      {
        name: 'Temperature',
        type: 'line',
        smooth: true,
        symbol: data[0]?.data?.length < 2 ? 'circle' : 'none',
        lineStyle: {
          width: 3
        },
        data: data[0]?.data?.map(d => [d.recorded_at, d.value]),
      }
    ]
    return view;
  }

  getTop5DevicesByTemperatureChartData(data: Top5IOTDevicesByTemperature[]) {
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.BAR;
    view.options = this.chartConfigSvc.getDefaultHorizantalBarChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.BAR);
    view.options.title = {
      text: 'Top 5 Sensors',
      left: 'center',
      top: '0%',
      textStyle: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 16,
        fontWeight: 400,
        color: '#000000'
      }
    };
    view.options.grid = {
      top: '15%',
      bottom: '15%',
    };
    view.options.xAxis = {
      type: "value",
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dotted', // Dashed or dotted
          color: '#ccc'
        }
      },
      axisLabel: {
        formatter: '{value}°C',
      },
    }
    view.options.yAxis = {
      type: 'category',
      data: data.map(d => d.name),
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        width: 50,
        overflow: 'truncate',
        formatter: (value: string) => {
          return value;
        }
      },
      tooltip: {
        show: true,
      },
    }
    view.options.series = [
      {
        name: 'Temperature',
        type: 'bar',
        barWidth: 20,
        data: data.map(d => d.temperature),
        label: {
          show: true,
          position: 'right',
          color: '#000000', // optional: customize label text color
          fontWeight: 400,
        }
      }
    ];
    view.options.tooltip = {
      ...view.options.tooltip,
      formatter: function (params: any) {
        return `${params[0].name}<br/>Temperature: <strong>${params[0].value}°C</strong>`;
      }
    }
    return view;
  }

  getHumidityWidgetSummaryData(criteria: SearchCriteria, humidityWidgetViewData: IOTDevicesHumidityWidgetViewData): Observable<IOTDevicesHumidityWidgetSummaryData> {
    const from = humidityWidgetViewData?.dateRangeformData?.from;
    const to = humidityWidgetViewData?.dateRangeformData?.to;
    let params: HttpParams = this.tableService.getWithParam(criteria);
    const format = new DateRange().format;
    params = params.set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<IOTDevicesHumidityWidgetSummaryData>(`/customer/sensors_humidity_summary/`, { params: params });
  }

  getHumidityWidgetTrendData(criteria: SearchCriteria, humidityWidgetViewData: IOTDevicesHumidityWidgetViewData): Observable<IOTDevicesHumidityWidgetTrendDataType[]> {
    const from = humidityWidgetViewData?.dateRangeformData?.from;
    const to = humidityWidgetViewData?.dateRangeformData?.to;
    const deviceId = humidityWidgetViewData?.trendChartDeviceSelectionForm?.get('device')?.value;
    let params: HttpParams = this.tableService.getWithParam(criteria);
    const format = new DateRange().format;
    params = params.set('from', moment(from).format(format)).set('to', moment(to).format(format)).set('sensor', deviceId);
    return this.http.get<IOTDevicesHumidityWidgetTrendDataType[]>(`customer/sensors_humidity_trend/`, { params: params });
  }

  getHumidityTrendChart(data: IOTDevicesHumidityWidgetTrendDataType[], durationDropdownData: DurationDropdownType) {
    let diff = this.utilSvc.getTimeDifference(durationDropdownData.to, durationDropdownData.from);
    let isLastTwentyFourHours: boolean = false;
    if (diff?.asSeconds <= 86400) {
      isLastTwentyFourHours = true;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    view.options.tooltip = {
      trigger: 'axis',
      formatter: function (params: any) {
        const item = params[0];
        const time = echarts.time.format(item.axisValue, isLastTwentyFourHours ? '{HH}:{mm}' : '{MMM} {dd}, {yyyy} {HH}:{mm}', false);
        return `${time}<br/>Humidity: ${item.data[1]}%`;
      }
    }
    view.options.grid = {
      left: "3%",
      right: "4%",
      top: "5%",
      bottom: "10%",
      containLabel: true
    }
    view.options.legend = {
      show: false // hide real legend
    }
    view.options.graphic = [
      {
        type: 'group',
        left: 'center',
        bottom: 0,
        children: [
          {
            type: 'rect',
            shape: { width: 10, height: 10 },
            style: { fill: '#2ecc71' },
            left: 0
          },
          {
            type: 'text',
            style: { text: 'Normal (<30%)', fill: '#000', font: '12px sans-serif' },
            left: 15
          },
          {
            type: 'rect',
            shape: { width: 10, height: 10 },
            style: { fill: '#f1c40f' },
            left: 150
          },
          {
            type: 'text',
            style: { text: 'Moderate (31% - 40%)', fill: '#000', font: '12px sans-serif' },
            left: 165
          },
          {
            type: 'rect',
            shape: { width: 10, height: 10 },
            style: { fill: '#e74c3c' },
            left: 360
          },
          {
            type: 'text',
            style: { text: 'Critical (>41%)', fill: '#000', font: '12px sans-serif' },
            left: 375
          }
        ]
      }
    ]
    view.options.xAxis = {
      type: 'time',
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 10,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR(),
        rotate: 45,
        formatter: (value: number) => {
          return echarts.time.format(value, isLastTwentyFourHours ? '{HH}:{mm}' : '{MMM} {dd}, {yyyy} {HH}:{mm}', false);
        }
      },
    }
    view.options.yAxis = {
      type: "value",
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dotted', // Dashed or dotted
          color: '#ccc'
        }
      },
      axisLabel: {
        formatter: '{value}%',
      },
      name: 'Humidity (%)',
    }
    view.options.visualMap = {
      type: 'piecewise',
      show: false,
      dimension: 1,
      pieces: [
        { lte: 30, color: '#2ecc71' },
        { gt: 31, lte: 40, color: '#f1c40f' },
        { gt: 41, color: '#e74c3c' }
      ]
    }
    view.options.series = [
      {
        name: 'Humidity',
        type: 'line',
        smooth: true,
        symbol: data[0]?.data?.length < 2 ? 'circle' : 'none',
        lineStyle: {
          width: 3
        },
        data: data[0]?.data?.map(d => [d.recorded_at, d.value])
      }
    ]
    return view;
  }

  getAirflowWidgetSummaryData(criteria: SearchCriteria, airflowWidgetViewData: IOTDevicesAirflowWidgetViewData): Observable<IOTDevicesAirflowWidgetSummaryData> {
    const from = airflowWidgetViewData?.dateRangeformData?.from;
    const to = airflowWidgetViewData?.dateRangeformData?.to;
    let params: HttpParams = this.tableService.getWithParam(criteria);
    const format = new DateRange().format;
    params = params.set('from', moment(from).format(format)).set('to', moment(to).format(format));
    return this.http.get<IOTDevicesAirflowWidgetSummaryData>(`/customer/sensors_airflow_summary/`, { params: params });
  }

  getAirflowWidgetTrendData(criteria: SearchCriteria, airflowWidgetViewData: IOTDevicesAirflowWidgetViewData): Observable<IOTDevicesAirflowWidgetTrendDataType[]> {
    const from = airflowWidgetViewData?.dateRangeformData?.from;
    const to = airflowWidgetViewData?.dateRangeformData?.to;
    const deviceId = airflowWidgetViewData?.trendChartDeviceSelectionForm?.get('device')?.value;
    let params: HttpParams = this.tableService.getWithParam(criteria);
    const format = new DateRange().format;
    params = params.set('from', moment(from).format(format)).set('to', moment(to).format(format)).set('sensor', deviceId);
    return this.http.get<IOTDevicesAirflowWidgetTrendDataType[]>(`customer/sensors_airflow_trend/`, { params: params });
  }

  getAirflowTrendChart(data: IOTDevicesAirflowWidgetTrendDataType[], durationDropdownData: DurationDropdownType) {
    let diff = this.utilSvc.getTimeDifference(durationDropdownData.to, durationDropdownData.from);
    let isLastTwentyFourHours: boolean = false;
    if (diff?.asSeconds <= 86400) {
      isLastTwentyFourHours = true;
    }
    let view: UnityChartDetails = new UnityChartDetails();
    view.type = UnityChartTypes.LINE;
    view.options = this.chartConfigSvc.getDefaultLineChartOptions();
    view.extensions = this.chartConfigSvc.getChartExtensions(UnityChartTypes.LINE);

    view.options.tooltip = {
      trigger: 'axis',
      formatter: function (params: any) {
        const item = params[0];
        const time = echarts.time.format(item.axisValue, '{MMM} {dd}, {yyyy} {HH}:{mm}', false);
        return `${time}<br/>Airflow: ${item.data[1]} CFM`;
      }
    }
    view.options.grid = {
      left: "3%",
      right: "4%",
      top: "5%",
      bottom: "10%",
      containLabel: true
    }
    view.options.legend = {
      show: false // hide real legend
    }
    view.options.graphic = [
      {
        type: 'group',
        left: 'center',
        bottom: 0,
        children: [
          {
            type: 'rect',
            shape: { width: 10, height: 10 },
            style: { fill: '#2ecc71' },
            left: 0
          },
          {
            type: 'text',
            style: { text: 'Normal (<500 CFM)', fill: '#000', font: '12px sans-serif' },
            left: 15
          },
          {
            type: 'rect',
            shape: { width: 10, height: 10 },
            style: { fill: '#f1c40f' },
            left: 150
          },
          {
            type: 'text',
            style: { text: 'Moderate (501 CFM - 600 CFM)', fill: '#000', font: '12px sans-serif' },
            left: 165
          },
          {
            type: 'rect',
            shape: { width: 10, height: 10 },
            style: { fill: '#e74c3c' },
            left: 360
          },
          {
            type: 'text',
            style: { text: 'Critical (>601 CFM)', fill: '#000', font: '12px sans-serif' },
            left: 375
          }
        ]
      }
    ]
    view.options.xAxis = {
      type: 'time',
      axisLabel: {
        fontFamily: UNITY_FONT_FAMILY(),
        fontSize: 10,
        fontWeight: 500,
        color: UNITY_TEXT_DEFAULT_COLOR(),
        rotate: 45,
        formatter: (value: number) => {
          return echarts.time.format(value, isLastTwentyFourHours ? '{HH}:{mm}' : '{MMM} {dd}, {yyyy} {HH}:{mm}', false);
        }
      },
    }
    view.options.yAxis = {
      type: "value",
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dotted', // Dashed or dotted
          color: '#ccc'
        }
      },
      axisLabel: {
        formatter: '{value} CFM',
      },
      name: 'Airflow (CFM)',
    }
    view.options.visualMap = {
      type: 'piecewise',
      show: false,
      dimension: 1,
      pieces: [
        { lte: 500, color: '#2ecc71' },
        { gt: 501, lte: 600, color: '#f1c40f' },
        { gt: 601, color: '#e74c3c' }
      ]
    }
    view.options.series = [
      {
        name: 'Airflow',
        type: 'line',
        smooth: true,
        symbol: data[0]?.data?.length < 2 ? 'circle' : 'none',
        lineStyle: {
          width: 3
        },
        data: data[0]?.data?.map(d => [d.recorded_at, d.value])
      }
    ]
    return view;
  }

  getRecentModifiedRFIDTags(criteria: SearchCriteria): Observable<PaginatedResult<RecentModifiedRFIDTags>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    params = params.set('page_size', '5');
    // return of(RECENT_MODIFIED_RFID_TAGS);
    return this.http.get<PaginatedResult<RecentModifiedRFIDTags>>(`/customer/rfid_readers/`, { params: params });
  }

  convertToRecentModifiedRFIDTagsViewData(data: RecentModifiedRFIDTags[]): RecentModifiedRFIDTagsViewData[] {
    if (!data) return [];
    let viewData: RecentModifiedRFIDTagsViewData[] = [];
    data.map(d => {
      let a = new RecentModifiedRFIDTagsViewData();
      a.uuid = d.uuid;
      a.deviceName = d.name;
      a.rfidTag = d.tag_id;
      a.lastSeenLocation = d.location;
      a.lastSeenTime = d.last_seen ? this.utilSvc.toUnityOneDateFormat(d.last_seen) : 'N/A';
      viewData.push(a);
    })
    return viewData;
  }

  getRecentEvents(criteria: SearchCriteria): Observable<PaginatedResult<IOTDevicesRecentEvents>> {
    let params: HttpParams = this.tableService.getWithParam(criteria);
    params = params.set('page_size', '5');
    // return of(RECENT_EVENTS);
    return this.http.get<PaginatedResult<IOTDevicesRecentEvents>>(`/customer/iot_devices_recent_events/`, { params: params });
  }

  convertToRecentEventsViewData(data: IOTDevicesRecentEvents[]): IOTDevicesRecentEventsViewData[] {
    if (!data) return [];
    let viewData: IOTDevicesRecentEventsViewData[] = [];
    data.map(d => {
      let a = new IOTDevicesRecentEventsViewData();
      a.uuid = d.uuid;
      a.deviceName = d.device_name;
      a.deviceType = d.device_type;
      a.datacenter = d.datacenter;
      a.cabinet = d.cabinet;
      a.eventTime = d.event_datetime ? this.utilSvc.toUnityOneDateFormat(d.event_datetime) : 'N/A';
      a.description = d.description;
      a.severity = d.severity;
      a.status = d.status;
      viewData.push(a);
    })
    return viewData;
  }
}

export class IOTDevicesSummaryViewData {
  constructor() { }
  totalDevices: IOTDevicesCountByStatus;
  avgTemperature: IOTDevicesSummaryDetailsViewData;
  avgHumidity: IOTDevicesSummaryDetailsViewData;
  avgAirflow: IOTDevicesSummaryDetailsViewData;
  avgPower: IOTDevicesSummaryDetailsViewData;
}
export class IOTDevicesSummaryDetailsViewData {
  current: number = 0;
  lastOneHr: string;
  lastOneHrIconClass: string;
  lastOneHrTextClass: string;
}

export class IOTDevicesStatusByGroupViewData {
  viewTypes: string[] = ['Manufacturer', 'Model', 'Device'];
  selectedViewType: string = 'Manufacturer';
  loader: string = 'IOTDevicesStatusByGroupLoader';
  deviceViewData: IOTDevicesStatusByGroupData[] = [];
  modelViewData: IOTDevicesStatusByGroupData[] = [];
  manufacturerViewData: IOTDevicesStatusByGroupData[] = [];
  displayViewData: IOTDevicesStatusByGroupData[] = [];
}
export class IOTDevicesStatusByGroupData {
  uuid?: string;
  name: string;
  nodeType: string;
  status: string;
  selected: boolean = false;
  type: string;
  subType?: string;
  monitoring: DeviceMonitoringType;
  total?: number = 0;
  nodes?: IOTDevicesStatusByGroupData[] = [];
}

export class SmartPDUViewData {
  uuid: string;
  name: string;
  type: string = 'smart_pdu';
  current: number;
  voltage: number;
  power: number;
  outletStatus: string;
  status: string;
  monitoring: DeviceMonitoringType;
}

export class IOTDevicesTemperatureWidgetViewData {
  loader: string = 'TemperatureWidgetLoader';
  dropdownOptions: CustomDateRangeType[] = [
    { label: 'Last 1 Hr', value: 'last_1_hour' },
    { label: 'Last 24 Hrs', value: 'last_24_hours' },
    { label: 'Last 7 Days', value: 'last_7_days' },
    { label: 'Last 30 Days', value: 'last_30_days' },
    { label: 'Last 60 Days', value: 'last_60_days' },
    { label: 'Last 90 Days', value: 'last_90_days' },
  ];;
  defaultSelected: string = 'last_24_hours';
  dateRangeformData: DurationDropdownType;
  summary?: IOTDevicesTemperatureWidgetSummaryData;
  trendChartData?: UnityChartDetails;
  trendChartDataLoader: string = 'TemperatureWidgetTrendChartDataLoader';
  trendChartDeviceSelectionForm: FormGroup = new FormBuilder().group({
    cabinet: new FormControl(null),
    device: new FormControl(null),
  });
  devicesList: IotDeviceType[] = [];
  top5DevicesChartData?: UnityChartDetails;
  isSummaryApiCallCompleted: boolean = false;
  isTrendApiCallCompleted: boolean = false;
  isTop5SensorApiCallCompleted: boolean = false;
}

export class IOTDevicesHumidityWidgetViewData {
  loader: string = 'HumiditySummaryLoader';
  dropdownOptions: CustomDateRangeType[] = [
    { label: 'Last 1 Hr', value: 'last_1_hour' },
    { label: 'Last 24 Hrs', value: 'last_24_hours' },
    { label: 'Last 7 Days', value: 'last_7_days' },
    { label: 'Last 30 Days', value: 'last_30_days' },
    { label: 'Last 60 Days', value: 'last_60_days' },
    { label: 'Last 90 Days', value: 'last_90_days' },
  ];;
  defaultSelected: string = 'last_24_hours';
  dateRangeformData: DurationDropdownType;
  summary: IOTDevicesHumidityWidgetSummaryData;
  trendChartData: UnityChartDetails;
  trendChartDataLoader: string = 'HumidityWidgetTrendChartDataLoader';
  trendChartDeviceSelectionForm: FormGroup = new FormGroup({
    cabinet: new FormControl(null),
    device: new FormControl(null),
  });
  devicesList: IotDeviceType[] = [];
  isSummaryApiCallCompleted: boolean = false;
  isTrendApiCallCompleted: boolean = false;
}

export class IOTDevicesAirflowWidgetViewData {
  loader: string = 'AirflowWidgetLoader';
  dropdownOptions: CustomDateRangeType[] = [
    { label: 'Last 1 Hr', value: 'last_1_hour' },
    { label: 'Last 24 Hrs', value: 'last_24_hours' },
    { label: 'Last 7 Days', value: 'last_7_days' },
    { label: 'Last 30 Days', value: 'last_30_days' },
    { label: 'Last 60 Days', value: 'last_60_days' },
    { label: 'Last 90 Days', value: 'last_90_days' },
  ];;
  defaultSelected: string = 'last_24_hours';
  dateRangeformData: DurationDropdownType;
  summary: IOTDevicesAirflowWidgetSummaryData;
  trendChartData: UnityChartDetails;
  trendChartDataLoader: string = 'AirflowWidgetTrendChartDataLoader';
  trendChartDeviceSelectionForm: FormGroup = new FormGroup({
    cabinet: new FormControl(null),
    device: new FormControl(null),
  });
  devicesList: IotDeviceType[] = [];
  isSummaryApiCallCompleted: boolean = false;
  isTrendApiCallCompleted: boolean = false;
}

export class RecentModifiedRFIDTagsViewData {
  uuid: string;
  deviceName: string;
  rfidTag: string;
  lastSeenLocation: string;
  lastSeenTime: string;
}

export class IOTDevicesRecentEventsViewData {
  uuid: string;
  deviceName: string;
  deviceType: string;
  cabinet: string;
  datacenter: string;
  eventTime: string;
  description: string;
  severity: string;
  status: string;
}

export class DateRange {
  from: string;
  to: string;
  format?: string = "YYYY-MM-DD HH:mm:ss";
}

export enum IotDevicesTypes {
  SENSOR = 'sensor',
  SMART_PDU = 'smart_pdu',
  RFID_READER = 'rfid_reader'
}

export const SUMMARY_DATA: IOTDevicesSummary = {
  "total_devices": {
    "total": 1,
    "up": 0,
    "down": 0,
    "unknown": 1
  },
  "avg_temperature": {
    "current": 12,
    "last_1_hr": 1
  },
  "avg_humidity": {
    "current": 0,
    "last_1_hr": 0
  },
  "avg_airflow": {
    "current": 0,
    "last_1_hr": 0
  },
  "avg_power": {
    "current": 12,
    "last_1_hr": 1
  }
}

export const IOT_DEVICES_GROUP = {
  "state": StatusState.SUCCESS,
  "result": {
    "data": {
      "RARITAN COMPUTER, INC.": {
        "models": {
          "PX3-5145R": [
            {
              "status": "unknown",
              "monitoring": {
                "configured": false,
                "observium": false,
                "enabled": false,
                "zabbix": true
              },
              "uuid": "d93e9a72-8a6f-43d4-864b-c58d13a17cdb",
              "device_type": "smart_pdu",
              "device_sub_type": "smart_pdu",
              "name": "Raritan PX3 Series"
            }
          ],
          "DX2-T1H1": [
            {
              "status": "unknown",
              "monitoring": {
                "configured": false,
                "observium": false,
                "enabled": false,
                "zabbix": true
              },
              "uuid": "68a5250d-8354-47c9-9de3-b35f0b7dbc5f",
              "device_type": "sensor",
              "device_sub_type": "sensor",
              "name": "Sensor 1 - Raritan"
            }
          ]
        },
        "manufacturer_name": "RARITAN COMPUTER, INC."
      },
    },
    "message": '',
  }
}

export const SMART_PDUS = {
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "uuid": "d93e9a72-8a6f-43d4-864b-c58d13a17cdb",
      "name": "Raritan PX3 Series",
      "asset_tag": "Smart PDU Tag",
      "description": "PX3 PDU",
      "power": 0,
      "current": 0,
      "voltage": 0,
      "outlet_status": "up",
      "pdu_id": null,
      "pdu_object_oid": "1.3.6.1.4.1.13742.6",
      "uptime": null,
      "serial_number": "SB041650513",
      "firmware": "v4.0.41",
      "cabinet": null,
      "collector": {
        "uuid": "0769fa8e-dc60-4261-8975-c1aaba4193e6",
        "name": "10.128.7.96",
        "id": 321
      },
      "credentials": null,
      "credentials_type": null,
      "datacenter": {
        "url": "http://10.192.11.248:8000/rest/colo_cloud/1050/",
        "id": 1050,
        "uuid": "5e2f3413-669c-4bd0-90a6-753395fe0680",
        "display_name": "DC-a-aerys",
        "created_at": "2025-03-28T06:07:41.985053-07:00",
        "updated_at": "2025-03-28T06:07:41.985085-07:00",
        "name": "DC-a",
        "location": "1500 Pattison Avenue &, S Broad St, Philadelphia, PA 19145, USA",
        "lat": "39.9021375",
        "long": "-75.1838075",
        "status": [
          {
            "status": "NA",
            "category": "Datacenter"
          },
          {
            "status": "NA",
            "category": "Physical Devices"
          }
        ],
        "customer": "http://10.192.11.248:8000/rest/org/22/",
        "cabinets": [
          "http://10.192.11.248:8000/rest/cabinet/1385/",
          "http://10.192.11.248:8000/rest/cabinet/1441/"
        ]
      },
      "manufacturer": "RARITAN COMPUTER, INC.",
      "model": "PX3-5145R",
      "monitoring": {
        "configured": false,
        "observium": false,
        "enabled": false,
        "zabbix": true
      },
      "status": "-1",
      "tags": [
        "smart-pdu-tag-1"
      ],
      "created_at": "2025-06-27T04:39:18.284611-07:00",
      "updated_at": "2025-06-27T04:39:18.284637-07:00",
      "ip_address": "10.10.1.3",
      "snmp_community": null,
      "snmp_version": "v2c",
      "snmp_authlevel": null,
      "snmp_authname": null,
      "snmp_authpass": null,
      "snmp_authalgo": null,
      "snmp_cryptopass": null,
      "snmp_cryptoalgo": null
    }
  ]
}

export const SENSOR_TEMPERATURE_SUMMARY = {
  "summary": {
    "total": 1,
    "active": 0,
    "inactive": 1,
    "average_temperature": 12,
    "maximum_temperature": 12,
    "minimum_temperature": 12
  },
  "top_5_sensors": [
    {
      "device_type": "sensor",
      "uuid": "68a5250d-8354-47c9-9de3-b35f0b7dbc5f",
      "temperature": 12,
      "name": "Sensor 1 - Raritan"
    }
  ],
  "trend_data": []
}

export const SENSORS_HUMIDITY_SUMMARY = {
  "summary": {
    "total": 1,
    "active": 0,
    "inactive": 1,
    "average_humidity": 0,
    "maximum_humidity": 0,
    "minimum_humidity": 0
  },
  "trend_data": []
}

export const SENSOR_AIRFLOW_SUMMARY = {
  "summary": {
    "total": 1,
    "active": 0,
    "inactive": 1,
    "average_airflow": 0,
    "maximum_airflow": 0,
    "minimum_airflow": 0
  },
  "trend_data": []
}

export const RECENT_MODIFIED_RFID_TAGS = {
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 2,
      "uuid": "15a8edbe-a863-4f41-bb8b-a93a54ad8d7d",
      "name": "Zebra Technologies RFID - 2",
      "asset_tag": "RFID Reader Tag 2",
      "description": "Zebra RFID Reader - 2",
      "tag_id": null,
      "location": "Frankfurt",
      "last_seen": "2025-06-12T00:00:00-07:00",
      "rfid_object_oid": null,
      "cabinet": null,
      "collector": {
        "uuid": "0769fa8e-dc60-4261-8975-c1aaba4193e6",
        "name": "10.128.7.96",
        "id": 321
      },
      "credentials": null,
      "credentials_type": null,
      "datacenter": {
        "url": "http://10.192.11.248:8000/rest/colo_cloud/1050/",
        "id": 1050,
        "uuid": "5e2f3413-669c-4bd0-90a6-753395fe0680",
        "display_name": "DC-a-aerys",
        "created_at": "2025-03-28T06:07:41.985053-07:00",
        "updated_at": "2025-03-28T06:07:41.985085-07:00",
        "name": "DC-a",
        "location": "1500 Pattison Avenue &, S Broad St, Philadelphia, PA 19145, USA",
        "lat": "39.9021375",
        "long": "-75.1838075",
        "status": [
          {
            "status": "NA",
            "category": "Datacenter"
          },
          {
            "status": "NA",
            "category": "Physical Devices"
          }
        ],
        "customer": "http://10.192.11.248:8000/rest/org/22/",
        "cabinets": [
          "http://10.192.11.248:8000/rest/cabinet/1385/",
          "http://10.192.11.248:8000/rest/cabinet/1441/"
        ]
      },
      "manufacturer": "Zebra Technologies",
      "model": "RFD8500",
      "monitoring": {
        "configured": false,
        "observium": false,
        "enabled": false,
        "zabbix": true
      },
      "status": "-1",
      "tags": [
        "rfid-reader-tag-2"
      ],
      "created_at": "2025-06-30T03:53:39.249834-07:00",
      "updated_at": "2025-06-30T03:53:39.249875-07:00",
      "ip_address": null,
      "snmp_community": null,
      "snmp_version": "v2c",
      "snmp_authlevel": null,
      "snmp_authname": null,
      "snmp_authpass": null,
      "snmp_authalgo": null,
      "snmp_cryptopass": null,
      "snmp_cryptoalgo": null
    },
    {
      "id": 1,
      "uuid": "e5770fa4-45b6-4725-b4cc-24d1ee5f896e",
      "name": "Impinj R7 Series - 1",
      "asset_tag": "RFID Reader Tag 1",
      "description": "R7 RFID Reader - 1",
      "tag_id": null,
      "location": "California",
      "last_seen": "2025-06-10T00:00:00-07:00",
      "rfid_object_oid": null,
      "cabinet": null,
      "collector": {
        "uuid": "0769fa8e-dc60-4261-8975-c1aaba4193e6",
        "name": "10.128.7.96",
        "id": 321
      },
      "credentials": null,
      "credentials_type": null,
      "datacenter": {
        "url": "http://10.192.11.248:8000/rest/colo_cloud/1050/",
        "id": 1050,
        "uuid": "5e2f3413-669c-4bd0-90a6-753395fe0680",
        "display_name": "DC-a-aerys",
        "created_at": "2025-03-28T06:07:41.985053-07:00",
        "updated_at": "2025-03-28T06:07:41.985085-07:00",
        "name": "DC-a",
        "location": "1500 Pattison Avenue &, S Broad St, Philadelphia, PA 19145, USA",
        "lat": "39.9021375",
        "long": "-75.1838075",
        "status": [
          {
            "status": "NA",
            "category": "Datacenter"
          },
          {
            "status": "NA",
            "category": "Physical Devices"
          }
        ],
        "customer": "http://10.192.11.248:8000/rest/org/22/",
        "cabinets": [
          "http://10.192.11.248:8000/rest/cabinet/1385/",
          "http://10.192.11.248:8000/rest/cabinet/1441/"
        ]
      },
      "manufacturer": "Impinj",
      "model": "R720 RAIN",
      "monitoring": {
        "configured": false,
        "observium": false,
        "enabled": false,
        "zabbix": true
      },
      "status": "-1",
      "tags": [
        "rfid-reader-tag-1"
      ],
      "created_at": "2025-06-30T03:53:39.154549-07:00",
      "updated_at": "2025-06-30T03:53:39.154570-07:00",
      "ip_address": null,
      "snmp_community": null,
      "snmp_version": "v2c",
      "snmp_authlevel": null,
      "snmp_authname": null,
      "snmp_authpass": null,
      "snmp_authalgo": null,
      "snmp_cryptopass": null,
      "snmp_cryptoalgo": null
    }
  ]
}

export const RECENT_EVENTS = {
  "count": 2,
  "next": "https://10.192.11.248/customer/iot_devices_recent_events/?page=2&page_size=5",
  "previous": null,
  "results": [
    {
      "id": 849848,
      "uuid": "fda687e5-97e8-4aac-ac95-6af512e144ab",
      "device_name": "senor123",
      "device_type": "sensor",
      "ip_address": "10.128.7.96",
      "description": "new-qwerty",
      "event_datetime": "2024-10-24T01:16:45-07:00",
      "severity": "Information",
      "status": "Open",
      "source": "Unity",
      "source_account": "Unity",
      "recovered_time": null,
      "cabinet": "RACK - 1",
      "datacenter": "DC-1"
    },
    {
      "id": 849828,
      "uuid": "cda83e57-f014-4bab-9e2c-cf86edd6df0a",
      "device_name": "sensor 7890",
      "device_type": "sensor",
      "ip_address": null,
      "description": "Percentage CPU",
      "event_datetime": "2024-10-23T18:57:07.503698-07:00",
      "severity": "Warning",
      "status": "Open",
      "source": "Azure",
      "source_account": "admin-unity@unitedlayer.com",
      "recovered_time": null,
      "cabinet": "RACK - 1",
      "datacenter": "DC-1"
    }
  ]
}
