import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageOntapClusterAggragateDetails, StorageOntapEntityDetailsStorage, StorageOntapTopN, StorageOntapTopNDetails } from '../storage-ontap.type';
import { ChartConfigService, UnityChartData } from 'src/app/shared/chart-config.service';
import { ChartData, ChartDataSets, ChartTooltipItem } from 'chart.js';

@Injectable()
export class StorageOntapAggregateDetailsService {

  constructor(private http: HttpClient,
    private chartConfigService: ChartConfigService) { }

  getDetails(clusterId: string, aggregateId: string): Observable<StorageOntapClusterAggragateDetails> {
    return this.http.get<StorageOntapClusterAggragateDetails>(`customer/netapp_cluster/${clusterId}/aggregate/${aggregateId}/`);
  }

  convertToViewdata(d: StorageOntapClusterAggragateDetails): StorageOntapClusterAggragateDetailsViewData {
    let a = new StorageOntapClusterAggragateDetailsViewData();
    a.id = d.uuid;
    a.name = d.name;
    a.nodeId = d.node_uuid;
    a.nodeName = d.node_name;
    a.type = d.type;
    a.totalSpace = d.capacity;
    a.usedSpace = d.used;
    a.availableSpace = d.available;
    a.usedPercentage = d.used_percent;
    a.availablePercentage = d.available_percent;
    a.logicalSpaceUsed = d.logical_used;
    a.raidType = d.raid_type;
    a.state = d.state;
    a.stateIcon = d.state == 'online' ? `fa-circle text-success` : `fa-circle text-danger`;
    a.dataReduction = d.data_reduction;
    a.checksumStyle = d.checksum_style;
    a.plexCount = d.plex_count;
    a.plexDetails = d.plex_details.map(pd => pd.name);
    a.storage = d.storage;
    a.isHybrid = d.hybrid;
    a.storageChartData = this.convertToStorageChartData(d);
    return a;
  }

  convertToStorageChartData(cluster: StorageOntapClusterAggragateDetails) {
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

  getTopEntities(clusterId: string, aggregateId: string): Observable<StorageOntapTopN> {
    return this.http.get<StorageOntapTopN>(`customer/netapp_cluster/${clusterId}/aggregate/${aggregateId}/top_n/`)
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

export class StorageOntapClusterAggragateDetailsViewData {
  id: string;
  name: string;
  nodeId: string;
  nodeName: string;
  type: string;
  totalSpace: string;
  usedSpace: string;
  availableSpace: string;
  usedPercentage: number = 0;
  availablePercentage: number = 0;
  logicalSpaceUsed: string;
  raidType: string;
  state: string;
  stateIcon: string;
  dataReduction: string;
  checksumStyle: string;
  plexCount: number;
  plexDetails: string[];
  storage: StorageOntapEntityDetailsStorage;
  storageChartData: UnityChartData;
  isHybrid: string;
}