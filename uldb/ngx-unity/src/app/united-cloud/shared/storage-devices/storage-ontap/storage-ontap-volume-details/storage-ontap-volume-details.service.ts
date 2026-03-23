import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChartConfigService, UnityChartData } from 'src/app/shared/chart-config.service';
import { StorageOntapClusterVolumeDetails, StorageOntapEntityDetailsStorage, StorageOntapTopN, StorageOntapTopNDetails } from '../storage-ontap.type';
import { ChartData, ChartDataSets, ChartTooltipItem } from 'chart.js';

@Injectable()
export class StorageOntapVolumeDetailsService {

  constructor(private http: HttpClient,
    private chartConfigService: ChartConfigService) { }

  getDetails(clusterId: string, volumeId: string): Observable<StorageOntapClusterVolumeDetails> {
    return this.http.get<StorageOntapClusterVolumeDetails>(`customer/netapp_cluster/${clusterId}/volume/${volumeId}/`);
  }

  convertToViewdata(d: StorageOntapClusterVolumeDetails): StorageOntapClusterVolumeDetailsViewData {
    let a = new StorageOntapClusterVolumeDetailsViewData();
    a.id = d.uuid;
    a.name = d.name;
    a.aggregateName = d.aggregate_name;
    a.type = d.type;
    a.state = d.state;
    a.stateIcon = d.state ? d.state == 'online' ? `fa-circle text-success` : `fa-circle text-danger` : '';
    a.language = d.language;
    a.guaranteeType = d.guarantee;
    a.isSVMRoot = d.is_svm_root ? 'Yes' : 'No';
    a.svmName = d.svm_name;
    a.autogrow = d.autogrow;
    a.totalIOPS = d.iops;
    a.totalLatency = `${d.latency ? d.latency : 0}ms`;
    a.totalThroughput = `${d.throughput ? d.throughput : 0}ms`;
    a.tieringPolicy = d.tiering_policy;
    a.snapshotPolicyName = d.snapshot_policy_name;
    a.antiRansomewareState = d.anti_ransomware_state;
    a.antiRansomewareSuspectedFilesCount = d.anti_ransomware_suspect_files_count;
    a.unixPermissions = d.nas_unix_permissions;
    a.securityStyle = d.security_style;
    a.maxFiles = d.files ? d.files.maximum ? d.files.maximum : 0 : 0;
    a.usedFiles = d.files ? d.files.used ? d.files.used : 0 : 0;
    a.encryptionEnabled = d.encryption_enabled;
    a.junctionPath = d.nas_path;
    a.snapMirrorProtected = d.snapmirror_is_protected;
    a.snapshotLockingEnabled = d.snapshot_locking_enabled;
    a.exportPolicyName = d.export_policy_name;
    a.usedPercent = `${d.used_percent}%`;
    a.snapshotReservePercent = `${d.snapshot_reserve ? d.snapshot_reserve : 0} %`;
    a.storage = d.storage;
    a.storageChartData = this.convertToStorageChartData(d);
    return a;
  }

  convertToStorageChartData(cluster: StorageOntapClusterVolumeDetails) {
    if (cluster.storage) {
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

  getTopEntities(clusterId: string, volumeId: string): Observable<StorageOntapTopN> {
    return this.http.get<StorageOntapTopN>(`customer/netapp_cluster/${clusterId}/volume/${volumeId}/top_n/`)
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
}

export class StorageOntapClusterVolumeDetailsViewData {
  id: string;
  name: string;
  aggregateName: string;
  state: string;
  stateIcon: string;
  type: string;
  language: string;
  guaranteeType: string;
  isSVMRoot: string;
  svmName: string;
  totalIOPS: number;
  totalThroughput: string;
  totalLatency: string;
  tieringPolicy: string;
  snapshotPolicyName: string;
  autosizeMode: string;
  isProtected: string;
  encryptionEnabled: string;
  maxFiles: number;
  usedFiles: number;
  securityStyle: string;
  autogrow: string;
  unixPermissions: string;
  quotaState: string;
  antiRansomewareState: string;
  antiRansomewareSuspectedFilesCount: number;
  snapshotCount: number;
  snapMirrorProtected: string;
  snapshotLockingEnabled: string;
  junctionPath: string;
  exportPolicyName: string;
  usedPercent: string;
  snapshotReservePercent: string;
  storage: StorageOntapEntityDetailsStorage;
  storageChartData: UnityChartData;
}
