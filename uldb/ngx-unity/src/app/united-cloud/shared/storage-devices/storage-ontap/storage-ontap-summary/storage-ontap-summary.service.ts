import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChartData, ChartDataSets, ChartTooltipItem } from 'chart.js';
import { Observable } from 'rxjs';
import { ChartConfigService, UnityChartData } from 'src/app/shared/chart-config.service';
import { StorageOntapCluster, StorageOntapClusterDiskSizePercentages, StorageOntapClusterSubsystem, StorageOntapClusterSummary, StorageOntapClusterTopUsedAggragates, StorageOntapClusterTopUsedLUNs, StorageOntapClusterTopUsedVolumes } from '../storage-ontap.type';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Injectable()
export class StorageOntapSummaryService {

  constructor(private http: HttpClient,
    private chartConfigService: ChartConfigService,
    private builder: FormBuilder) { }

  getClusterDetails(clusterId: string): Observable<StorageOntapCluster> {
    return this.http.get<StorageOntapCluster>(`customer/netapp_cluster/${clusterId}/cluster/`);
  }

  convertToClusterDetailsViewData(cluster: StorageOntapCluster): ClusterDetailsViewData {
    let view = new ClusterDetailsViewData();
    view.id = cluster.uuid;
    view.name = cluster.name ? cluster.name : 'NA';
    view.version = cluster.version ? cluster.version : 'NA';
    view.state = cluster.state;
    view.stateIcon = cluster.state ? cluster.state == 'ok' ? `fa-circle text-success` : `fa-circle text-danger` : '';
    view.nodeCount = cluster.node_count ? cluster.node_count : 0;
    view.ipAddress = cluster.ip_address ? cluster.ip_address : 'NA';
    view.location = cluster.location ? cluster.location : 'NA';
    view.clusterPeerCount = Number(cluster.clusterpeer_count);
    view.snapMirrorCount = Number(cluster.snapmirror_count);

    cluster.subsystems.map(ss => {
      let vs = new ClusterSubsystemDetailsViewData();
      vs.name = ss.subsystem;
      vs.state = ss.health;
      vs.stateIcon = ss.health == 'ok' ? `fa-circle text-success` : `fa-circle text-danger`;;
      view.subsystems.push(vs);
    })

    if (cluster.aggregates) {
      view.totalSize = cluster.aggregates.size;
      view.usedSize = cluster.aggregates.used;
      view.userPercentage = cluster.aggregates.used_percent;
      view.availableSize = cluster.aggregates.available;
      view.availablePercentage = cluster.aggregates.available_percent;
    }

    if (cluster.disk) {
      if (cluster.disk.count) {
        view.aggragateDisks = cluster.disk.count.Aggregate ? cluster.disk.count.Aggregate : 0;
        view.unAssignedDisks = cluster.disk.count.Unassigned ? cluster.disk.count.Unassigned : 0;
        view.spareDisks = cluster.disk.count.Spare ? cluster.disk.count.Spare : 0;
        view.sharedDisks = cluster.disk.count.Shared ? cluster.disk.count.Shared : 0;
        view.brokenDisks = cluster.disk.count.Broken ? cluster.disk.count.Broken : 0;
        view.totalDisks = view.aggragateDisks + view.unAssignedDisks + view.spareDisks + view.sharedDisks + view.brokenDisks;
      }
      if (cluster.disk.size) {
        view.aggregateDiskSize = cluster.disk.size.Aggregate;
        view.unAssignedDiskSize = cluster.disk.size.Unassigned;
        view.spareDiskSize = cluster.disk.size.Spare;
      }
      if (cluster.disk.size_in_percentage) {
        view.aggregateDiskSizeInPercentage = cluster.disk.size_in_percentage.Aggregate;
        view.unAssignedDiskSizeInPercentage = cluster.disk.size_in_percentage.Unassigned;
        view.spareDiskSizeInPercentage = cluster.disk.size_in_percentage.Spare;
      }
    }
    view.shelves = Number(cluster.shelve_count);
    view.storageChartData = this.convertToClusterStorageChartData(cluster);
    return view;
  }

  convertToClusterStorageChartData(cluster: StorageOntapCluster) {
    if (cluster.aggregates) {
      let view: UnityChartData = new UnityChartData();
      view.type = 'doughnut';
      view.legend = false;
      view.lables = ['Used', 'Free'];
      view.piedata = [cluster.aggregates.used_percent, cluster.aggregates.available_percent];
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

  convertToEventsChartData(): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'doughnut';
    view.legend = true;

    view.lables = ['Critical', 'Warning', 'Information'];
    view.piedata = [43, 56, 88];
    let colors = ['#cc0000', '#ff8800', '#378ad8'];
    view.colors.push({ backgroundColor: colors });

    view.options = this.chartConfigService.getDefaultPieChartOptions();
    return view;
  }

  getTopUsedAggragates(clusterId: string): Observable<StorageOntapClusterTopUsedAggragates[]> {
    return this.http.get<StorageOntapClusterTopUsedAggragates[]>(`customer/netapp_cluster/${clusterId}/aggregates/top_used/`);
  }

  convertToAggragateChartData(data: StorageOntapClusterTopUsedAggragates[]): UnityChartData {
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

  getTopUsedVolumes(clusterId: string): Observable<StorageOntapClusterTopUsedVolumes[]> {
    return this.http.get<StorageOntapClusterTopUsedVolumes[]>(`customer/netapp_cluster/${clusterId}/volumes/top_used/`);
  }

  convertToVolumesChartData(data: StorageOntapClusterTopUsedVolumes[]): UnityChartData {
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

  getTopUsedLUNs(clusterId: string): Observable<StorageOntapClusterTopUsedLUNs[]> {
    return this.http.get<StorageOntapClusterTopUsedLUNs[]>(`customer/netapp_cluster/${clusterId}/luns/top_used/`);
  }

  convertToLUNsChartData(data: StorageOntapClusterTopUsedLUNs[]): UnityChartData {
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

  submitCustomAttributesForm(clusterId: string, data: any) {
    return this.http.patch(`customer/netapp_cluster/${clusterId}/cluster/`, data);
  }
}

export class ClusterSummaryViewData {
  nodesCount: number = 0;
  nodesUp: number = 0;
  nodesDown: number = 0;

  aggregatesCount: number = 0;
  aggregatesUp: number = 0;
  aggregatesDown: number = 0;

  svmsCount: number = 0;
  svmsUp: number = 0;
  svmsDown: number = 0;

  volumesCount: number = 0;
  volumesUp: number = 0;
  volumesDown: number = 0;

  lunsCount: number = 0;
  lunsUp: number = 0;
  lunsDown: number = 0;
}

export class ClusterDetailsViewData {
  constructor() { }
  id: string;
  name: string;
  version: string;
  state: string;
  stateIcon: string;
  nodeCount: number;
  ipAddress: string;
  location: string;

  totalDisks: number = 0;
  aggragateDisks: number = 0;
  unAssignedDisks: number = 0;
  spareDisks: number = 0;
  sharedDisks: number = 0;
  brokenDisks: number = 0;
  shelves: number = 0;
  snapMirrorCount: number = 0;
  clusterPeerCount: number = 0;

  subsystems: ClusterSubsystemDetailsViewData[] = [];

  totalSize: string;
  usedSize: string;
  userPercentage: number = 0;
  availableSize: string;
  availablePercentage: number = 0;

  aggregateDiskSize: string;
  aggregateDiskSizeInPercentage: number = 0;
  unAssignedDiskSize: string;
  unAssignedDiskSizeInPercentage: number = 0;
  spareDiskSize: string;
  spareDiskSizeInPercentage: number = 0;

  storageChartData: UnityChartData;
}

export class ClusterSubsystemDetailsViewData {
  name: string;
  state: string;
  stateIcon: string;
}
