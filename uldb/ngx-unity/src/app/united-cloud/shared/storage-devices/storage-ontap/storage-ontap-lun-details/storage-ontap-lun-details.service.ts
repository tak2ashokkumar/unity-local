import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageOntapClusterLUNDetails, StorageOntapEntityDetailsStorage } from '../storage-ontap.type';
import { ChartConfigService, UnityChartData } from 'src/app/shared/chart-config.service';
import { ChartData, ChartTooltipItem } from 'chart.js';

@Injectable()
export class StorageOntapLunDetailsService {

  constructor(private http: HttpClient,
    private chartConfigService: ChartConfigService) { }

  getDetails(clusterId: string, lunId: string): Observable<StorageOntapClusterLUNDetails> {
    return this.http.get<StorageOntapClusterLUNDetails>(`customer/netapp_cluster/${clusterId}/lun/${lunId}/`);
  }

  convertToViewdata(d: StorageOntapClusterLUNDetails): StorageOntapClusterLUNDetailsViewData {
    let a = new StorageOntapClusterLUNDetailsViewData();
    a.id = d.uuid;
    a.name = d.name;
    a.state = d.state;
    a.stateIcon = d.state == 'online' ? `fa-circle text-success` : `fa-circle text-danger`;
    a.volumeName = d.volume_name;
    a.svmName = d.svm_name;
    a.capacity = d.capacity;
    a.available = d.available;
    a.used = `${d.used}`;
    a.availablePercent = `${d.available_percent}%`;
    a.usedPercent = `${d.used_percent}%`;
    a.spaceGuarantee = d.space_guarantee;
    a.spaceReserved = d.space_reserved;
    a.storage = d.storage;
    a.storageChartData = this.convertToStorageChartData(d);
    return a;
  }

  convertToStorageChartData(cluster: StorageOntapClusterLUNDetails) {
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
}

export class StorageOntapClusterLUNDetailsViewData {
  id: string;
  name: string;
  state: string;
  stateIcon: string;
  svmName: string;
  volumeName: string;
  capacity: string;
  available: string;
  used: string;
  availablePercent: string;
  usedPercent: string;
  spaceReserved: string;
  spaceGuarantee: string;
  storage: StorageOntapEntityDetailsStorage;
  storageChartData: UnityChartData;
}
