import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageOntapClusterSVMDetails, StorageOntapClusterSVMDetailsIpInterfaces, StorageOntapTopN, StorageOntapTopNDetails } from '../storage-ontap.type';
import { ChartConfigService, UnityChartData } from 'src/app/shared/chart-config.service';
import { ChartData, ChartDataSets, ChartTooltipItem } from 'chart.js';

@Injectable()
export class StorageOntapSvmDetailsService {

  constructor(private http: HttpClient,
    private chartConfigService: ChartConfigService,) { }

  getDetails(clusterId: string, svmId: string): Observable<StorageOntapClusterSVMDetails> {
    return this.http.get<StorageOntapClusterSVMDetails>(`customer/netapp_cluster/${clusterId}/svm/${svmId}/`);
  }

  convertToViewData(d: StorageOntapClusterSVMDetails): StorageOntapClusterSVMDetailsViewData {
    let a = new StorageOntapClusterSVMDetailsViewData();
    a.id = d.uuid;
    a.name = d.name;
    a.language = d.language;
    a.state = d.state;
    a.stateIcon = d.state == 'running' ? `fa-circle text-success` : `fa-circle text-danger`;
    a.configuredProtocols = d.configured_protocols;
    a.subtype = d.subtype;
    a.ipInterfaces = d.ip_interfaces;
    a.dnsDomains = d.dns ? d.dns.domains : [];
    a.dnsServers = d.dns ? d.dns.servers : [];
    a.fcInterfaces = d.fc_interfaces;
    a.nisEnabled = d.nis_enabled;
    a.nisServers = d.nis_servers;
    a.numberOfNISServers = d.nis_servers.length;
    a.s3Enabled = d.s3_enabled;
    a.s3Name = d.s3_name;
    a.iscsiEnabled = d.iscsi_enabled;
    d.aggregates.forEach(ag => {
      a.aggregates.push(ag.name);
    })
    a.fcpEnabled = d.fcp_enabled;
    a.ldapEnabled = d.ldap_enabled;
    a.nvmeEnabled = d.nvme_enabled;
    // a.snapMirror
    a.ipSpace = d.ipspace_name;
    a.antiRansomewareDefaultVolumeState = d.anti_ransomware_default_volume_state;
    a.numberOfVolumesinRecoveryQueue = d.number_of_volumes_in_recovery_queue;
    a.maxVolumes = d.max_volumes;
    return a;
  }

  getTopEntities(clusterId: string, svmId: string): Observable<StorageOntapTopN> {
    return this.http.get<StorageOntapTopN>(`customer/netapp_cluster/${clusterId}/svm/${svmId}/top_n/`)
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

export class StorageOntapClusterSVMDetailsViewData {
  id: string;
  name: string;
  language: string;
  state: string;
  stateIcon: string;
  configuredProtocols: string;
  subtype: string;
  ipInterfaces: StorageOntapClusterSVMDetailsIpInterfaces[] = [];
  dnsDomains: string[] = [];
  dnsServers: string[] = [];
  nfs: string;
  cifs: string;
  fcInterfaces: string[];
  nisEnabled: string;
  nisServers: string[];
  numberOfNISServers: number;
  s3Enabled: string;
  s3Name: string;
  iscsiEnabled: string;
  aggregates: string[] = [];
  fcpEnabled: string;
  ldapEnabled: string;
  nvmeEnabled: string;
  snapMirrorProtected: string;
  snapMirrorProtectedVolumesCount: string;
  ipSpace: string;
  antiRansomewareDefaultVolumeState: string;
  numberOfVolumesinRecoveryQueue: string;
  maxVolumes: string;
}
