import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChartDataSets } from 'chart.js';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DEVICES_FAST_BY_DEVICE_TYPE, GET_ALERTS_SUMMARY, GET_DC_CLOUD_COST_SUMMARY, GET_INFRASTRUCTURE_ALERT_TREND_SUMMARY, GET_INFRASTRUCTURE_DC_TWELVE_MONTHS, GET_INFRASTRUCTURE_PC_TWELVE_MONTHS, GET_INFRASTRUCTURE_PRIVATE_CLOUD_SUMMARY, GET_INFRASTRUCTURE_PUBLIC_CLOUD_SUMMARY, GET_INFRASTRUCTURE_SUMMARY, GET_INFRASTRUCTURE_TOTAL_DEVICES_SUMMARY } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ChartConfigService, UnityChartData } from 'src/app/shared/chart-config.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { InfrastructureAlertTrend, InfrastructureAlertsDataType, InfrastructureDcChartType, InfrastructureDcCloudCost, InfrastructureDcSummary, InfrastructureDevicesSummary, InfrastructurePcChartType, InfrastructurePcSummary, InfrastructurePrivateCloudDataType, InfrastructurePublicCloudSummary, InfrastructureSummary, InfrastructureWidgetDeviceManufacturerType, InfrastructureWidgetDeviceModelType, InfrastructureWidgetDeviceModelsType, InfrastructureWidgetDeviceStatusType, InfrastructureWidgetDeviceType, InfrastructureWidgetOptionsType, Top10UtilizationDataType } from './infrastructure.type';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { AppLevelService } from 'src/app/app-level.service';
import { switchMap, take } from 'rxjs/operators';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Injectable()
export class InfrastructureService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private chartConfigService: ChartConfigService,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,
    private appService: AppLevelService,) { }

  getDatacenters(): Observable<DatacenterFast[]> {
    return this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ), { params: new HttpParams().set('page_size', 0) })
  }

  getInfrastructureSummary(criteria: SearchCriteria): Observable<InfrastructureSummary> {
    return this.tableService.getData<InfrastructureSummary>(GET_INFRASTRUCTURE_SUMMARY(), criteria)
  }

  convertToInfrastructureSummaryViewData(data: InfrastructureSummary): InfrastructureSummaryViewData {
    let view: InfrastructureSummaryViewData = new InfrastructureSummaryViewData();
    view.datacenterTotal = data.datacenter.total;
    view.datacenterAlerts = data.datacenter.alerts;
    view.cabinetTotal = data.cabinet.total;
    view.cabinetAvailable = data.cabinet.available;
    view.cabinetEmission = data.cabinet.emission;
    view.alertsTotal = data.alerts.total;
    view.alertsCritical = data.alerts.critical;
    view.alertsWarning = data.alerts.warning;
    view.alertsInformation = data.alerts.information;
    view.resourceTotal = data.total_resources.total;
    view.resourceUp = data.total_resources.up;
    view.resourceDown = data.total_resources.down;
    view.resourceUnknown = data.total_resources.unknown;
    return view
  }

  getTotalDevicesSummary(criteria: SearchCriteria): Observable<InfrastructureDevicesSummary> {
    return this.tableService.getData<InfrastructureDevicesSummary>(GET_INFRASTRUCTURE_TOTAL_DEVICES_SUMMARY(), criteria);
  }

  convertToInfrastructureDevicesSummaryViewData(data: InfrastructureDevicesSummary): InfrastructureDevicesSummaryViewData {
    let view: InfrastructureDevicesSummaryViewData = new InfrastructureDevicesSummaryViewData();
    view.total = data.total;
    view.up = data.up;
    view.down = data.down;
    view.unknown = data.unknown;
    view.networkTotal = data.network.total;
    view.networkUp = data.network.up;
    view.networkDown = data.network.down;
    view.networkUnknown = data.network.unknown;
    view.computeTotal = data.compute.total;
    view.computeUp = data.compute.up;
    view.computeDown = data.compute.down;
    view.computeUnknown = data.compute.unknown;
    view.storageTotal = data.storage.total;
    view.storageUp = data.storage.up;
    view.storageDown = data.storage.down;
    view.storageUnknown = data.storage.unknown;
    view.databaseTotal = data.database.total;
    view.databaseUp = data.database.up;
    view.databaseDown = data.database.down;
    view.databaseUnknown = data.database.unknown;
    view.iotTotal = data.iot.total;
    view.iotUp = data.iot.up;
    view.iotDown = data.iot.down;
    view.iotUnknown = data.iot.unknown;
    view.otherTotal = data.other.total;
    view.otherUp = data.other.up;
    view.otherDown = data.other.down;
    view.otherUnknown = data.other.unknown;
    return view;
  }

  getPrivateCloudSummary(criteria: SearchCriteria): Observable<InfrastructurePrivateCloudDataType> {
    return this.tableService.getData<InfrastructurePrivateCloudDataType>(GET_INFRASTRUCTURE_PRIVATE_CLOUD_SUMMARY(), criteria);
  }

  convertToPrivateCloudViewData(data: InfrastructurePrivateCloudDataType): InfrastructurePrivateCloudViewData {
    let viewData: InfrastructurePrivateCloudViewData = new InfrastructurePrivateCloudViewData();
    viewData.totalPrivateCloudCount = data.total;
    data.private_clouds.map(d => {
      let view: PrivateCloudTableData = new PrivateCloudTableData();
      view.privateCloudImgUrl = this.utilSvc.getCloudLogo(d.name);
      view.privateCloudName = d.name;
      view.resources = d.resources;
      view.subscriptions = d.subscriptions;
      viewData.privateCloudTableData.push(view);
    })
    return viewData;
  }

  getPublicCloudSummary(criteria: SearchCriteria): Observable<InfrastructurePublicCloudSummary> {
    return this.tableService.getData<InfrastructurePublicCloudSummary>(GET_INFRASTRUCTURE_PUBLIC_CLOUD_SUMMARY(), criteria);
  }

  convertToPublicCloudSummaryViewData(data: InfrastructurePublicCloudSummary): InfrastructurePublicCloudSummaryViewData {
    let view: InfrastructurePublicCloudSummaryViewData = new InfrastructurePublicCloudSummaryViewData();
    view.total = data.total;
    data.public_clouds.forEach(c => {
      let a: InfrastructurePublicCloudViewData = new InfrastructurePublicCloudViewData();
      a.imageUrl = this.utilSvc.getCloudLogo(c.name);
      a.name = c.name;
      a.cost = Math.floor(c.cost);
      a.subscriptions = c.subscriptions;
      a.resources = c.resources;
      view.clouds.push(a);
    });
    return view;
  }

  getInfrastructureStatusByGroupData(dataType: string): Observable<InfrastructureWidgetDeviceStatusType | InfrastructureWidgetDeviceManufacturerType | InfrastructureWidgetDeviceModelType | InfrastructureWidgetDeviceType> {
    // let params: HttpParams = this.tableService.getWithParam(criteria);
    // params = params.append('data_type', dataType);
    // return this.http.get<InfrastructureWidgetDeviceStatusType | InfrastructureWidgetDeviceManufacturerType | InfrastructureWidgetDeviceModelType | InfrastructureWidgetDeviceType>(GET_INFRASTRUCTURE_DEVICE_GROUP_SUMMARY(), { params: params });
    const params: HttpParams = new HttpParams().set('data_type', dataType);
    return this.http.get<InfrastructureWidgetDeviceStatusType | InfrastructureWidgetDeviceManufacturerType | InfrastructureWidgetDeviceModelType | InfrastructureWidgetDeviceType>(`/customer/infrastructure/`, { params: params });
  }

  syncInfrastructureStatusByGroupData(criteria: SearchCriteria): Observable<TaskStatus> {
    const params = this.tableService.getWithParam(criteria);
    return this.http.get<CeleryTask>(`/customer/infrastructure/sync_data/`, { params: params })
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 100).pipe(take(1))), take(1));
  }

  buildInfrastructureWidgetForm(): FormGroup {
    return this.builder.group({
      'dataType': ['device_status']
    })
  }

  setStatusByChildren(subNodes: InfrastructureStatusByGroupData[]) {
    if (!subNodes.length) {
      return 'amber';
    }
    switch (true) {
      case subNodes.every(node => node.status == 'up'): return 'up';
      case subNodes.every(node => node.status == 'down'): return 'down';
      case subNodes.every(node => node.status == 'unknown'): return 'unknown';
      default: return 'amber';
    }
  }

  convertToInfrastructureWidgetDeviceStatusViewData(data: InfrastructureWidgetDeviceStatusType, viewData: InfrastructureStatusByGroupViewData) {
    Object.keys(data).forEach((ds) => {
      let deviceStatus = new InfrastructureStatusByGroupData();
      deviceStatus.name = ds;
      deviceStatus.total = data[ds].total;
      deviceStatus.nodeType = 'Device Status';
      data[ds].devices.forEach((d) => {
        let device = new InfrastructureStatusByGroupData();
        device.name = d.name;
        device.nodeType = 'Device';
        device.type = d.device_type;
        device.subType = d.device_sub_type;
        device.status = d.status;
        device.uuid = d.uuid;
        device.monitoring = d.monitoring;
        deviceStatus.nodes.push(device);
      })
      deviceStatus.status = ds;
      viewData.deviceStatusViewData.push(deviceStatus);
    })
    viewData.displayViewData = viewData.deviceStatusViewData;
  }

  convertToInfrastructureWidgetDeviceManufacturerViewData(data: InfrastructureWidgetDeviceManufacturerType, viewData: InfrastructureStatusByGroupViewData) {
    let manufacturerData = <InfrastructureWidgetDeviceModelsType[]>Object.values(data);
    manufacturerData.map(mfd => {
      let mfr = new InfrastructureStatusByGroupData();
      mfr.name = mfd.manufacturer_name;
      mfr.nodeType = 'Manufacturer';
      if (mfd.models && Object.keys(mfd.models).length) {
        Object.keys(mfd.models).forEach(modelName => {
          let mdl = new InfrastructureStatusByGroupData();
          mdl.name = modelName;
          mdl.nodeType = 'Model';
          mfd.models[modelName].map(device => {
            let c = new InfrastructureStatusByGroupData();
            c.name = device.name;
            c.nodeType = 'Device';
            c.type = device.device_type;
            c.subType = device.device_sub_type;
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
    viewData.displayViewData = viewData.manufacturerViewData;
  }

  convertToInfrastructureWidgetDeviceModelViewData(data: InfrastructureWidgetDeviceModelType, viewData: InfrastructureStatusByGroupViewData) {
    Object.keys(data).forEach((mdl) => {
      let deviceModel = new InfrastructureStatusByGroupData();
      deviceModel.name = mdl;
      deviceModel.nodeType = 'Model';
      data[mdl].forEach((d) => {
        let device = new InfrastructureStatusByGroupData();
        device.name = d.name;
        device.nodeType = 'Device';
        device.type = d.device_type;
        device.subType = d.device_sub_type;
        device.status = d.status;
        device.uuid = d.uuid;
        device.monitoring = d.monitoring;
        deviceModel.nodes.push(device);
      })
      deviceModel.status = this.setStatusByChildren(deviceModel.nodes);
      viewData.modelViewData.push(deviceModel);
    })
    viewData.displayViewData = viewData.modelViewData;
  }

  convertToInfrastructureWidgetDeviceTypeViewData(data: InfrastructureWidgetDeviceType, viewData: InfrastructureStatusByGroupViewData) {
    Object.keys(data).forEach((dt) => {
      let deviceType = new InfrastructureStatusByGroupData();
      deviceType.name = this.utilSvc.getDeviceMappingByDeviceType(dt);
      deviceType.nodeType = 'Device Type';
      data[dt].devices.forEach((d) => {
        let device = new InfrastructureStatusByGroupData();
        device.name = d.name;
        device.nodeType = 'Device';
        device.type = d.device_type;
        device.subType = d.device_sub_type;
        device.status = d.status;
        device.uuid = d.uuid;
        device.monitoring = d.monitoring;
        deviceType.nodes.push(device);
      })
      deviceType.status = this.setStatusByChildren(deviceType.nodes);
      viewData.deviceTypeViewData.push(deviceType);
    })
    viewData.displayViewData = viewData.deviceTypeViewData;
  }

  getAlertsSummary(criteria: SearchCriteria): Observable<Array<InfrastructureAlertsDataType>> {
    return this.tableService.getData<Array<InfrastructureAlertsDataType>>(GET_ALERTS_SUMMARY(), criteria);
  }

  convertToInfrastructureAlertsViewData(data: InfrastructureAlertsDataType[]): InfrastructureAlertsViewData[] {
    let viewData: InfrastructureAlertsViewData[] = [];
    data.map(d => {
      let view: InfrastructureAlertsViewData = new InfrastructureAlertsViewData();
      view.id = d.id;
      view.uuid = d.uuid;
      view.deviceName = d.device_name;
      view.description = d.description;
      view.severity = d.severity;
      switch (d.severity) {
        case 'Critical':
          view.severityClass = 'fas fa-exclamation-circle text-danger fa-lg';
          break;
        case 'Warning':
          view.severityClass = 'fas fa-exclamation-circle text-warning fa-lg';
          break
        case 'Information':
          view.severityClass = 'fas fa-info-circle text-primary fa-lg';
          break;
      }
      view.source = d.source;
      view.acknowledged = d.is_acknowledged ? 'Yes' : 'No';
      view.duration = d.alert_duration;
      viewData.push(view);
    });
    return viewData;
  }

  getDcCloudCost(criteria: SearchCriteria): Observable<InfrastructureDcCloudCost> {
    return this.tableService.getData<InfrastructureDcCloudCost>(GET_DC_CLOUD_COST_SUMMARY(), criteria);
  }

  convertToDcCloudCostViewData(data: InfrastructureDcCloudCost): InfrastructureDcCloudCostViewData {
    let view: InfrastructureDcCloudCostViewData = new InfrastructureDcCloudCostViewData();
    view.costTotal = data.total.total;
    view.datacenterTotal = data.dc_cost.total;
    view.cloudTotal = data.pc_cost.total;
    return view;
  }

  getDcChartData(criteria: SearchCriteria): Observable<InfrastructureDcSummary> {
    return this.tableService.getData<InfrastructureDcSummary>(GET_INFRASTRUCTURE_DC_TWELVE_MONTHS(), criteria);
  }

  convertToDcViewData(data: InfrastructureDcSummary): InfrastructureDcSummaryViewData {
    let view: InfrastructureDcSummaryViewData = new InfrastructureDcSummaryViewData();
    view.total = data.total;
    view.chartData = this.convertToDCChartData(data.dc_data);
    return view;
  }

  getLast12Months(): any[] {
    var months = [];
    for (var i = 1; i <= 12; i++) {
      let month = moment().subtract(i, "month").startOf("month").format('MMM YYYY');
      months.push(month);
    }
    return months.reverse();
  }

  convertToDCChartData(dcChartData: InfrastructureDcChartType[]): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'line';
    view.legend = true;
    view.lables = this.getLast12Months();
    let datalables: string[] = dcChartData.map(d => d.name);
    datalables.forEach(dl => {
      let ds: ChartDataSets = {};
      ds.label = dl;
      ds.lineTension = 0.3;
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
    view.options.legend.labels = { boxWidth: 10, padding: 10, usePointStyle: true };
    return view;
  }

  getPcChartData(criteria: SearchCriteria): Observable<InfrastructurePcSummary> {
    return this.tableService.getData<InfrastructurePcSummary>(GET_INFRASTRUCTURE_PC_TWELVE_MONTHS(), criteria);
  }

  convertToPcViewData(data: InfrastructurePcSummary): InfrastructureDcSummaryViewData {
    let view: InfrastructureDcSummaryViewData = new InfrastructureDcSummaryViewData();
    view.total = data.total;
    view.chartData = this.convertToPcChartData(data.cloud_data);
    return view;
  }

  convertToPcChartData(pcChartData: InfrastructurePcChartType[]): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'line';
    view.legend = true;
    view.lables = this.getLast12Months();
    let datalables: string[] = pcChartData.map(d => d.name);
    datalables.forEach(dl => {
      let ds: ChartDataSets = {};
      ds.label = dl;
      ds.lineTension = 0.3;
      ds.data = [];
      let pcData = pcChartData.find(d => d.name == dl);
      if (pcData) {
        for (let k = pcData.last_12_months.length; k < 12; k++) {
          ds.data.push(0);
        }
        pcData.last_12_months.forEach(md => {
          ds.data.push(md.amount ? md.amount : 0);
        })
      }
      view.linedata.push(ds);
    })
    view.options = this.chartConfigService.getDefaultLineChartOptions();
    view.options.legend.labels = { boxWidth: 10, padding: 10, usePointStyle: true };
    return view;
  }

  getAlertTrendSummary(criteria: SearchCriteria): Observable<InfrastructureAlertTrend> {
    return this.tableService.getData<InfrastructureAlertTrend>(GET_INFRASTRUCTURE_ALERT_TREND_SUMMARY(), criteria);
  }

  convertToAlertTrendPolarChartData(data: any): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'polarArea';
    view.legend = true;
    view.datasets.push(data.summary.raw_events, data.summary.alerts, data.summary.conditions);
    view.lables.push(`Raw Events: ${data.summary.raw_events}`, `Alerts: ${data.summary.alerts}`, `Conditions: ${data.summary.conditions}`);
    view.options = this.chartConfigService.getDefaultPieChartOptions();
    view.options.legend.position = 'bottom';
    view.options.legend.labels = { boxWidth: 20, padding: 10, usePointStyle: true };
    return view;
  }

  getFormattedChartData(data: InfrastructureAlertTrend) {
    return [
      {
        Critical: data.raw_events.critical,
        Warning: data.raw_events.warning,
        Information: data.raw_events.information,
        Dedupe: 0,
        Suppressed: 0,
        Correlated: 0,
      },
      {
        Critical: 0,
        Warning: 0,
        Information: 0,
        Dedupe: data.noise_deduction.dedupe,
        Suppressed: data.noise_deduction.suppressed,
        Correlated: data.noise_deduction.correlated,
      }
    ];
  }

  convertToAlertTrendBarChartData(data: InfrastructureAlertTrend): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'bar';
    view.legend = true;
    view.lables.push('Raw Events', 'Noise Reduction');
    const stackedBarData = this.getFormattedChartData(data);
    let datalables: string[] = ['Critical', 'Warning', 'Information', 'Dedupe', 'Suppressed', 'Correlated'];
    datalables.map(dl => {
      let ds: ChartDataSets = {};
      ds.label = dl;
      ds.data = [];
      ds.maxBarThickness = 75;
      stackedBarData.map(bd => {
        ds.data.push(bd[dl]);
      })
      view.bardata.push(ds);
    });

    view.options = this.chartConfigService.getDefaultHorizantalStackedBarChartOptions();
    view.options.legend.labels = { boxWidth: 20, padding: 10, usePointStyle: true };
    view.options.scales.yAxes[0].ticks.precision = 0;
    view.options.plugins.datalabels.display = false;
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

  convertToAlertTrendWidgetData(data: InfrastructureAlertTrend): InfrastructureAlertTrendWidgetViewData {
    let view: InfrastructureAlertTrendWidgetViewData = new InfrastructureAlertTrendWidgetViewData();
    view.total = data.raw_events.total;
    view.critical = data.raw_events.critical;
    view.warning = data.raw_events.warning;
    view.information = data.raw_events.information
    view.dedupe = data.noise_deduction.dedupe;
    view.suppressed = data.noise_deduction.suppressed;
    view.correlated = data.noise_deduction.correlated
    view.autoHealed = data.first_response.auto_healed;
    view.ticketCreated = data.first_response.ticket_created;
    view.autoClosed = data.first_response.auto_closed;
    return view;
  }

  buildAlertTrendFilterForm(): FormGroup {
    return this.builder.group({
      'duration': [''],
      'datacenters': [[]],
      'clouds': [[]],
      'deviceTypes': [[]]
    });
  }

  getCpuAndRamUtilizationSummary(criteria: SearchCriteria): Observable<TaskStatus> {
    // return this.tableService.getData<InfrastructureCpuAndRamUtilizationDataType>(GET_UTILIZATION_SUMMARY(), criteria);
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<CeleryTask>(`customer/infra_cpu_memory_usage/`, { params: params })
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 100).pipe(take(1))), take(1));
  }

  convertToCpuUtilizationViewData(data: Top10UtilizationDataType[]): InfrastructureCpuAndRamUtilizationViewData[] {
    let viewData: InfrastructureCpuAndRamUtilizationViewData[] = [];
    data.map(u => {
      let view: InfrastructureCpuAndRamUtilizationViewData = new InfrastructureCpuAndRamUtilizationViewData();
      view.host.name = u.host.host_name;
      view.lastValue = u.lastvalue;
      view.host.type = u.host.host_type;
      view.host.subType = u.host.host_sub_type;
      view.host.uuid = u.host.host_uuid;
      view.name = u.name;
      view.monitoring = u.host.host_monitoring.configured;
      viewData.push(view);
    })
    return viewData;
  }

  convertToRamUtilizationViewData(data: Top10UtilizationDataType[]): InfrastructureCpuAndRamUtilizationViewData[] {
    let viewData: InfrastructureCpuAndRamUtilizationViewData[] = [];
    data.map(u => {
      let view: InfrastructureCpuAndRamUtilizationViewData = new InfrastructureCpuAndRamUtilizationViewData();
      view.host.name = u.host.host_name;
      view.lastValue = u.lastvalue;
      view.host.type = u.host.host_type;
      view.host.subType = u.host.host_sub_type;
      view.host.uuid = u.host.host_uuid;
      view.name = u.name;
      view.monitoring = u.host.host_monitoring.configured;
      viewData.push(view);
    })
    return viewData;
  }
}

export class InfrastructureSummaryViewData {
  constructor() { }
  datacenterTotal: number;
  datacenterAlerts: number;
  cabinetTotal: number;
  cabinetAvailable: number;
  cabinetEmission: number;
  alertsTotal: number;
  alertsCritical: number;
  alertsWarning: number;
  alertsInformation: number;
  resourceTotal: number;
  resourceUp: number;
  resourceDown: number;
  resourceUnknown: number;
}

export class InfrastructureDevicesSummaryViewData {
  constructor() { }
  total: number;
  up: number;
  down: number;
  unknown: number;
  networkTotal: number;
  networkUp: number;
  networkDown: number;
  networkUnknown: number;
  computeTotal: number;
  computeUp: number;
  computeDown: number;
  computeUnknown: number;
  storageTotal: number;
  storageUp: number;
  storageDown: number;
  storageUnknown: number;
  databaseTotal: number;
  databaseUp: number;
  databaseDown: number;
  databaseUnknown: number;
  iotTotal: number;
  iotUp: number;
  iotDown: number;
  iotUnknown: number;
  otherTotal: number;
  otherUp: number;
  otherDown: number;
  otherUnknown: number;
}

export class InfrastructurePrivateCloudViewData {
  constructor() { }
  totalPrivateCloudCount: number;
  privateCloudTableData: PrivateCloudTableData[] = [];
}

export class PrivateCloudTableData {
  constructor() { }
  privateCloudName: string;
  privateCloudImgUrl: string;
  resources: number;
  subscriptions: number;
}

export class InfrastructurePublicCloudSummaryViewData {
  constructor() { }
  total: number;
  clouds: InfrastructurePublicCloudViewData[] = [];
}

export class InfrastructurePublicCloudViewData {
  constructor() { }
  name: string;
  imageUrl: string;
  subscriptions: number;
  resources: number;
  cost: number;
}

export class InfrastructureStatusByGroupViewData {
  constructor() { }
  loader: string = 'InfrastructureSummaryStatusByGroupLoader';
  deviceStatusViewData: InfrastructureStatusByGroupData[] = [];
  manufacturerViewData: InfrastructureStatusByGroupData[] = [];
  modelViewData: InfrastructureStatusByGroupData[] = [];
  deviceTypeViewData: InfrastructureStatusByGroupData[] = [];
  displayViewData: InfrastructureStatusByGroupData[] = [];
}

export class InfrastructureStatusByGroupData {
  constructor() { }
  uuid?: string;
  name: string;
  nodeType: string;
  status: string;
  selected: boolean = false;
  type?: string;
  subType: string;
  monitoring: DeviceMonitoringType;
  total?: number = 0;
  nodes?: InfrastructureStatusByGroupData[] = [];
}

export class InfrastructureAlertsViewData {
  constructor() { }
  id: number;
  uuid: string;
  deviceName: string;
  severity: string;
  description: string;
  source: string;
  acknowledged: string;
  duration: string;
  severityClass: string;
}

export class InfrastructureDcCloudCostViewData {
  constructor() { }
  costTotal: number;
  datacenterTotal: number;
  cloudTotal: number;
}

export class InfrastructureDcSummaryViewData {
  total: number;
  chartData: UnityChartData;
}

export class InfrastructureAlertTrendWidgetViewData {
  total: number;
  critical: number;
  warning: number;
  information: number
  dedupe: number;
  suppressed: number;
  correlated: number
  autoHealed: number;
  ticketCreated: number;
  autoClosed: number;
}

export class InfrastructureCpuAndRamUtilizationViewData {
  constructor() { }
  itemid: string;
  lastValue: number;
  hostId: string;
  key: string;
  name: string;
  host: InfrastructureHostViewData = new InfrastructureHostViewData();
  monitoring: boolean;
}

export class InfrastructureHostViewData {
  constructor() { }
  name: string;
  uuid: string;
  type: string;
  subType: string;
}

export const AlertTrendPolarChartColors: string[] = [
  'rgb(12 187 112)', 'rgb(204 0 0)', 'rgb(217 217 217)'
];

export const AlertTrendBarChartLabels: string[] = [
  'Critical', 'Warning', 'Information', 'Dedupe', 'Supressed', 'Correlated'
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

// export const publicClouds = ['AWS', 'Azure', 'GCP', 'Oracle'];
export const publicClouds = [
  {
    name: "AWS"
  },
  {
    name: "Azure"
  },
  {
    name: "GCP"
  },
  {
    name: "Oracle"
  },
];

export const InfrastructureWidgetOptions: Array<InfrastructureWidgetOptionsType> = [
  {
    label: 'Device Status',
    value: 'device_status'
  },
  {
    label: 'Manufacturer',
    value: 'manufacturer'
  },
  {
    label: 'Model',
    value: 'model'
  },
  {
    label: 'Device Type',
    value: 'device_type'
  }
]

export enum InfrastructureWidgetOption {
  DEVICESTATUS = 'device_status',
  MANUFACTURER = 'manufacturer',
  MODEL = 'model',
  DEVICETYPE = 'device_type'
}

export enum InfrastructureDeviceSubType {
  VMWARE_VM = 'vmware_vm',
  ESXI_VM = 'esxi_vm',
  HYPERV_VM = 'hyperv_vm',
  CUSTOM_VM = 'custom_vm'
}

export enum InfrastructureDeviceType {
  SWITCH = 'switch',
  FIREWALL = 'firewall',
  LOAD_BALANCER = 'load_balancer',
  HYPERVISOR = 'hypervisor',
  BAREMETAL = 'baremetal',
  MAC_DEVICE = 'mac_device',
  STORAGE = 'storage',
  VM = 'vm',
  SENSOR = 'sensor',
  SMART_PDU = 'smart_pdu',
  RFID_READER = 'rfid_reader'
}