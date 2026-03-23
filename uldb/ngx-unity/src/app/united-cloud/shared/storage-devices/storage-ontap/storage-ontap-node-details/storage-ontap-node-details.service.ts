import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChartData, ChartDataSets, ChartTooltipItem } from 'chart.js';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ChartConfigService, UnityChartData } from 'src/app/shared/chart-config.service';
import { StorageOntapClusterNodeDetails, StorageOntapEntityDetailsStorage, StorageOntapNodeCPUData, StorageOntapTopN, StorageOntapTopNDetails } from '../storage-ontap.type';

@Injectable()
export class StorageOntapNodeDetailsService {

  constructor(private http: HttpClient,
    private chartConfigService: ChartConfigService,
    private utilSvc: AppUtilityService) { }

  getDetails(clusterId: string, nodeId: string): Observable<StorageOntapClusterNodeDetails> {
    return this.http.get<StorageOntapClusterNodeDetails>(`customer/netapp_cluster/${clusterId}/node/${nodeId}/`);
  }

  convertToViewData(d: StorageOntapClusterNodeDetails): StorageOntapClusterNodeDetailsViewData {
    let a: StorageOntapClusterNodeDetailsViewData = new StorageOntapClusterNodeDetailsViewData();
    a.id = d.uuid;
    a.name = d.name;
    a.vendorSerialNumber = d.serial_number;
    a.os = d.os;
    a.metroCluster = d.metrocluster && d.metrocluster.type ? d.metrocluster : null;
    a.managementInterfaces = d.management_ip.split(',');
    a.managementName = d.management_name;
    a.managementIP = d.management_ip;
    a.state = d.state;
    a.stateIcon = a.state == 'up' ? `fa-circle text-success` : a.state == 'down' ? `fa-circle text-danger` : `fa-circle text-warning`;
    if (d.service_processor) {
      a.serviceProcessor = new StorageOntapClusterNodeDetailsServiceProcessorViewData();
      a.serviceProcessor.firmware = d.service_processor.firmware_version ? d.service_processor.firmware_version : 'NA';
      a.serviceProcessor.state = d.service_processor.state ? d.service_processor.state : 'NA';
      a.serviceProcessor.ip_address = d.service_processor.ipv4_interface ? d.service_processor.ipv4_interface.address : 'NA'
    } else {
      a.serviceProcessor.firmware = 'NA';
      a.serviceProcessor.state = 'NA';
      a.serviceProcessor.ip_address = 'NA';
    }
    a.location = d.location;
    a.uptime = d.uptime;
    a.partners = d.ha_partner;
    a.haEnabled = d.ha_enabled;
    a.model = d.model;
    a.storage = d.storage;
    a.autoGiveBack = d.auto_giveback;
    a.storageChartData = this.convertToStorageChartData(d);
    return a;
  }

  convertToStorageChartData(cluster: StorageOntapClusterNodeDetails) {
    if (cluster.storage && (cluster.storage.used_percent || cluster.storage.available_percent)) {
      let view: UnityChartData = new UnityChartData();
      view.type = 'doughnut';
      view.legend = false;
      view.lables = ['Used', 'Free'];
      view.piedata = [cluster.storage.used_percent, cluster.storage.available_percent];
      let colors = ['#4dbd74', '#73818f'];
      view.colors.push({ backgroundColor: colors });
      view.options = this.chartConfigService.getDefaultPieChartOptions();
      view.options.rotation = 1.0 * Math.PI;
      view.options.circumference = Math.PI;
      view.options.cutoutPercentage = 65;
      view.options.plugins.datalabels.display = false;
      view.options.tooltips.callbacks = {
        label: (item: ChartTooltipItem, data: ChartData) => {
          return `${data.labels[item.index]} : ${data.datasets[0].data[item.index]}%`;
        },
      }
      return view;
    }
    return;
  }

  getCPUChartData(clusterId: string, nodeId: string) {
    return this.http.get<StorageOntapNodeCPUData>(`/customer/netapp_cluster/${clusterId}/node/${nodeId}/cpu/`);
  }

  convertToCPUChartData(cpuData: StorageOntapNodeCPUData) {
    if (cpuData.records && (cpuData.records.length)) {
      cpuData.records = cpuData.records.reverse();
      let view: UnityChartData = new UnityChartData();
      view.type = 'line';
      view.legend = false;
      cpuData.records.map(rc => {
        if (rc.timestamp) {
          view.lables.push(this.utilSvc.toUnityOneDateFormat(rc.timestamp));
        }
      })
      let ds: ChartDataSets = {};
      ds.label = 'processor_utilization';
      ds.data = [];
      ds.backgroundColor = '#E2DAFF';
      ds.borderColor = '#6F47FF';
      cpuData.records.forEach(rc => {
        ds.data.push(rc.processor_utilization);
      })
      view.linedata.push(ds);

      view.options = this.chartConfigService.getDefaultLineChartOptions();
      return view;
    }
    return;
  }

  getTopEntities(clusterId: string, nodeId: string): Observable<StorageOntapTopN> {
    return this.http.get<StorageOntapTopN>(`customer/netapp_cluster/${clusterId}/node/${nodeId}/top_n/`)
  }

  convertToTopNChartData(data: StorageOntapTopNDetails[]): UnityChartData {
    if (!data.length) {
      return;
    }
    let view: UnityChartData = new UnityChartData();
    view.type = 'horizontalBar';
    view.legend = true;
    view.lables = data.map(d => d.name);

    let ds: ChartDataSets = {};
    ds.label = 'Used';
    ds.data = [];
    data.forEach(d => {
      ds.data.push(d.used_percent);
    })
    ds.backgroundColor = '#4dbd74';
    ds.hoverBackgroundColor = '#4dbd74';
    ds.maxBarThickness = 15;
    view.bardata.push(ds);

    let ds1: ChartDataSets = {};
    ds1.label = 'Available';
    ds1.data = [];
    data.forEach(d => {
      ds1.data.push(100 - d.used_percent);
    })
    ds1.backgroundColor = '#73818f';
    ds1.hoverBackgroundColor = '#73818f';
    ds1.maxBarThickness = 15;
    view.bardata.push(ds1);

    view.options = this.chartConfigService.getDefaultHorizantalStackedBarChartOptions();
    view.options.legend.labels.usePointStyle = true;
    view.options.scales.xAxes[0].ticks.precision = 0;
    view.options.plugins.datalabels.display = false;
    view.options.tooltips.callbacks = {
      label: (item: ChartTooltipItem, data: ChartData) => {
        return `${data.datasets[item.datasetIndex].label} : ${item.value}%`;
      },
    }
    return view;
  }
  
  submitCustomAttributesForm(clusterId: string, nodeId: string, data: any) {
    return this.http.patch(`customer/netapp_cluster/${clusterId}/node/${nodeId}/`, data);
  }
}

export class StorageOntapClusterNodeDetailsViewData {
  constructor() { }
  id: string;
  name: string;
  vendorSerialNumber: string;
  os: string;
  metroCluster: StorageOntapClusterNodeDetailsMetroClusterViewData;
  managementInterfaces: string[];
  state: string;
  stateIcon: string;
  serviceProcessor: StorageOntapClusterNodeDetailsServiceProcessorViewData;
  location: string;
  uptime: number;
  partners: string;
  haState: string; //not available
  haEnabled: boolean;
  autoGiveBack: string; //not available
  model: string;
  storage: StorageOntapEntityDetailsStorage;
  storageChartData: UnityChartData;
  managementIP: string;
  managementName: string;
}

export class StorageOntapClusterNodeDetailsMetroClusterViewData {
  name: string;
  type: string;
}

export class StorageOntapClusterNodeDetailsServiceProcessorViewData {
  ip_address: string;
  state: string;
  firmware: string;
}
