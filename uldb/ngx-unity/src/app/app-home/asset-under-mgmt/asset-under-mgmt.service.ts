import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { GET_ASSET_COUNTS, GET_ASSET_STATS, GET_DATACENTER_FAST, GET_DATACENTER_LIST, SYNC_ASSET_STATS } from 'src/app/shared/api-endpoint.const';
import { switchMap, map, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { FormBuilder } from '@angular/forms';

@Injectable()
export class AssetUnderMgmtService {
  public statsChange$: ReplaySubject<any> = new ReplaySubject(1);

  constructor(private http: HttpClient,
    private appService: AppLevelService,
    private builder: FormBuilder) { }

  getAssetCounts(datacenters: string[]): Observable<CountStats> {
    let params: HttpParams = new HttpParams();
    if (datacenters && datacenters.length) {
      datacenters.map(dc => {
        params = params.append('dc_uuid', dc);
      })
    }
    return this.http.get<CountStats>(GET_ASSET_COUNTS(), { params: params });
  }

  getAssetStats(datacenters: string[]): Observable<Stats[]> {
    let params: HttpParams = new HttpParams();
    if (datacenters && datacenters.length) {
      datacenters.map(dc => {
        params = params.append('dc_uuid', dc);
      })
    }
    return this.http.get<Stats[]>(GET_ASSET_STATS(), { params: params });
  }

  getDatacenterList(): Observable<DatacenterFast[]> {
    return this.http.get<DatacenterFast[]>(GET_DATACENTER_FAST(), { params: new HttpParams().set('page_size', 0) })
  }

  buildform(uuidList:string[]) {
    return this.builder.group({
      'datacenters': [uuidList]
    })
  }

  getDisplayName(assetName: string, count: number) {
    switch (assetName) {
      case 'PDU': return (count != 1) ? 'PDUs' : 'PDU';
      case 'switch': return (count != 1) ? 'Switches' : 'Switch';
      case 'firewall': return (count != 1) ? 'Firewalls' : 'Firewall';
      case 'load_balancer': return (count != 1) ? 'Load Balancers' : 'Load Balancer';
      case 'server': return count != 1 ? 'Servers' : 'Server';
      case 'bm_server': return (count != 1) ? 'Bare Metals' : 'Bare Metal';
      case 'VM': return (count != 1) ? 'VMs' : 'VM';
      case 'mac_device': return (count != 1) ? 'Mac Minis' : 'Mac Mini';
      case 'storage_device': return (count != 1) ? 'Storage Devices' : 'Storage Device';
      case 'pod': return (count != 1) ? 'Pods' : 'Pod';
      case 'cabinet': return (count != 1) ? 'Cabinets' : 'Cabinet';
      case 'hypervisor': return (count != 1) ? 'Hypervisors' : 'Hypervisor';
      case 'database': return (count != 1) ? 'Databases' : 'Database';
    }
  }

  getDrillDownLink(assetName: string) {
    let path = '/unitycloud/devices/';
    switch (assetName) {
      case 'PDU': return ``;
      case 'switch': return `${path}switches`;
      case 'firewall': return `${path}firewalls`;
      case 'load_balancer': return `${path}loadbalancers`;
      case 'server': return `${path}hypervisors`;
      case 'bm_server': return `${path}bmservers`;
      case 'VM': return `${path}vms/allvms`;
      case 'mac_device': return `${path}macdevices`;
      case 'storage_device': return `${path}storagedevices`;
      case 'pod': return `${path}pods`;
      case 'cabinet': return ``;
      case 'hypervisor': return `${path}hypervisors`;
      case 'database': return `${path}databases`;
    }
  }

  convertToViewData(stats: CountStats): AssetStatsViewData {
    let assetnames = Object.keys(stats);
    let viewData: AssetStatsViewData = new AssetStatsViewData();
    viewData.totalCount = 0;
    viewData.drillDownLink = this.getDrillDownLink('switch');
    assetnames.map(assetname => {
      viewData.totalCount += stats[assetname].count;
      let a: ViewStats = new ViewStats();
      a.count = stats[assetname].count;
      a.displayName = this.getDisplayName(assetname, stats[assetname].count)
      a.drillDownLink = this.getDrillDownLink(assetname);
      viewData[assetname] = a;
    });
    return viewData;
  }

  changeViewData(assetStats: AssetStatsViewData, deviceStats: Stats[]): AssetStatsViewData {
    deviceStats.map((stat: Stats) => {
      const deviceName = stat.name;
      let a: ViewStats = new ViewStats();
      a.count = stat.count;
      a.activeCount = stat.active_count ? stat.active_count : 0;
      a.inactiveCount = stat.inactive_count ? stat.inactive_count : 0;
      a.unknown = stat.unknown ? stat.unknown : 0;
      Object.assign(assetStats[deviceName], a);
    });
    return assetStats;
  }

  getPercent(value: number, total: number) {
    return Math.round(((value / total) * 100));
  }

  syncAssetStats(datacenters: string[]): Observable<Stats[]> {
    let params: HttpParams = new HttpParams();
    if (datacenters && datacenters.length) {
      datacenters.map(dc => {
        params = params.append('dc_uuid', dc);
      })
    }
    return this.http.get<CeleryTask>(SYNC_ASSET_STATS(),{ params: params })
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 100)
        .pipe(map(res => <Stats[]>res.result.data), take(1))),
        take(1));
  }

  calculateGraphPercentage(barData: ViewStats): PercentData {
    return {
      loader: 0,
      active: (barData.count === 0) ? 0 : this.getPercent(barData.activeCount, barData.count),
      inActive: (barData.count === 0) ? 0 : this.getPercent(barData.inactiveCount, barData.count),
      unknown: (barData.count === 0) ? 100 : this.getPercent(barData.unknown, barData.count),
    };
  }

}

export class ViewStats {
  displayName?: string;
  count: number;
  unknown?: number;
  activeCount?: number;
  inactiveCount?: number;
  drillDownLink: string;
  constructor() { }
}

export class AssetStatsViewData {
  totalCount?: number;
  drillDownLink: string;
  server: ViewStats;
  pod: ViewStats;
  VM: ViewStats;
  firewall: ViewStats;
  switch: ViewStats;
  load_balancer: ViewStats;
  cabinet: ViewStats;
  bm_server: ViewStats;
  PDU: ViewStats;
  storage_device: ViewStats;
  mac_device: ViewStats;
  hypervisor: ViewStats;
  database: ViewStats;
  constructor() { }
}

export class PercentData {
  loader: 0 | 100 = 100;
  active: number;
  inActive: number;
  unknown: number;
  constructor() { }
}