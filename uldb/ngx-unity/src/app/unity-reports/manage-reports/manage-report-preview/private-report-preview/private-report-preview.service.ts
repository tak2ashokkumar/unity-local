
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SingleDataSet } from 'ng2-charts';
import { GET_REPORTS_BY_CLOUD_NAMES, PRIVATE_CLOUD_WIDGET_DATA, PRIVATE_CLOUD_CONTAINERS_PODS, GET_REPORT_BY_ID } from 'src/app/shared/api-endpoint.const';
import { UsageData } from 'src/app/united-cloud/shared/entities/usage-data.type';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { map, catchError } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { KubernetesPodType } from 'src/app/shared/SharedEntityTypes/kubernetes-pod.type';
import { ManageReportCloudInventoryType, ManageReportDataType, ManageReportPrivateCloudInventoryVMType } from './private-report-preview.type';

@Injectable()
export class PrivateReportPreviewService {

  constructor(private http: HttpClient,
  ) { }

  getReportById(uuid: string) {
    return this.http.get<ManageReportDataType>(GET_REPORT_BY_ID(uuid));
  }

  convertToViewdata(reportData: ManageReportCloudInventoryType[]) {
    let reportViewdata: ManageReportCloudInventoryReportViewData[] = [];
    reportData.forEach(report => {
      let viewData = new ManageReportCloudInventoryReportViewData();
      viewData.cloudId = report.cloud_uuid;
      viewData.name = report.name;
      viewData.cloud = report.cloud;
      viewData.cloudType = report.cloud_type ? 'private' : '';
      viewData.pvtCloudsummary = this.getSummaryComponentViewData(report.cloud_data);
      let list = <ManageReportPrivateCloudInventoryVMType[]>report.vm;
      list.forEach(vm => {
        let data = new ManageReportPrivateCloudInventoryReportViewData();
        data.name = vm.name;
        data.ip = vm.ip_address;
        data.cloudName = vm.cloud_name;
        data.type = vm.type;
        data.cpuCount = vm.cpu_count;
        data.memory = vm.memory != 'N/A' ? `${(Number.parseInt(vm.memory) / 1024).toFixed(2).replace(/[.,]00$/, '')} GB` : vm.memory;
        data.storage = vm.storage != 'N/A' ? `${vm.storage} GB` : vm.storage;
        switch (viewData.cloud) {
          case 'vmware': data.status = vm.last_known_state == 'poweredOff' ? 'Down' : 'Up';
            break;
          case 'esxi': data.status = vm.last_known_state == 'poweredOff' ? 'Down' : 'Up';
            break;
          case 'openstack': data.status = vm.last_known_state == 'SHUTOFF' ? 'Down' : 'Up'
            break;
          case 'vcloud': data.status = vm.last_known_state == 'POWERED_OFF' ? 'Down' : 'Up'
            break;
          case 'proxmox':
            data.status = vm.last_known_state == 'stopped' ? 'Down' : 'Up';
            data.vmIdExists = true;
            data.vmId = vm.vm_id;
            data.type = vm.is_template ? 'Template' : 'Virtual Machine';
            break;
          case 'g3_kvm':
            data.status = vm.last_known_state == 'stopped' ? 'Down' : 'Up';
            data.vmIdExists = true;
            data.vmId = vm.vm_id;
            data.type = vm.is_template ? 'Template' : 'Virtual Machine';
            break;
          case 'custom':
            data.status = vm.last_known_state == 'stopped' ? 'Down' : 'Up';
            // data.vmIdExists = true;
            // data.vmId = vm.vm_id;
            data.type = vm.is_template ? 'Template' : 'Virtual Machine';
            break;
        }
        viewData.pvtCloudVMlist.push(data);
      });
      reportViewdata.push(viewData);
    });
    return reportViewdata;
  }

  private getSummaryComponentViewData(privateCloud: PrivateCloud): ManageReportPrivateCloudInventoryReportSummaryViewData {
    let data: ManageReportPrivateCloudInventoryReportSummaryViewData = new ManageReportPrivateCloudInventoryReportSummaryViewData();
    data.hypervisorCount = privateCloud?.hypervisors ? privateCloud.hypervisors.length : 0;
    data.bmsCount = privateCloud?.bm_server ? privateCloud.bm_server.length : 0;
    data.vmsCount = privateCloud?.vms_count;
    data.otherCount = privateCloud?.customdevice ? privateCloud.customdevice.length : 0;
    data.containerCount = 0;
    data.storageCount = privateCloud?.storage_device ? privateCloud.storage_device.length : 0;
    data.switchCount = privateCloud?.switch ? privateCloud.switch.length : 0;
    data.lbCount = privateCloud?.load_balancer ? privateCloud.load_balancer.length : 0;
    data.firewallsCount = privateCloud?.firewall ? privateCloud.firewall.length : 0;
    return data;
  }

  // convertToPCWidgetViewData(cloud: PCFastData, widgetData: UsageData): CloudWidgetViewData {
  //   let a: CloudWidgetViewData = new CloudWidgetViewData();
  //   if (widgetData.allocated_vcpu) {
  //     a.vCPURuntimeUsage = Number(widgetData.vcpu_runtime_usage.toFixed(2));
  //     a.RAMRuntimeUsage = Number(widgetData.ram_runtime_usage.toFixed(2));
  //     a.diskSpaceUtilization = widgetData.disk_utilization;
  //   }
  //   return a;
  // }

  generateReport(accounts: ManageReportCloudNamesType[]) {
    let data: string[] = [];
    accounts.forEach(account => data.push(account.uuid));
    console.log(data, 'data');
    return this.http.post<ManageReportCloudInventoryType[]>(GET_REPORTS_BY_CLOUD_NAMES(), { 'account': data });
  }

  getCloudAllocations(pcId: string): Observable<Map<string, UsageData>> {
    return this.http.get<UsageData>(PRIVATE_CLOUD_WIDGET_DATA(pcId), { headers: Handle404Header })
      .pipe(
        map((res: UsageData) => {
          return new Map<string, UsageData>().set(pcId, res);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, UsageData>().set(pcId, null));
        })
      );
  }

  getContainerPods(pcId: string): Observable<Map<string, number>> {
    return this.http.get<PaginatedResult<KubernetesPodType>>(PRIVATE_CLOUD_CONTAINERS_PODS(pcId), { headers: Handle404Header })
      .pipe(
        map((res: PaginatedResult<KubernetesPodType>) => {
          return new Map<string, number>().set(pcId, res.count);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, number>().set(pcId, null));
        })
      );
  }
}

export class ManageReportCloudInventoryReportViewData {
  constructor() {
    this.pvtCloudVMlist = [];
  }
  cloudType: string;
  name: string;
  cloudId: string;
  cloud: 'vmware' | 'openstack' | 'vcloud' | 'proxmox' | 'g3_kvm' | 'esxi' | 'custom';
  pvtCloudVMlist: ManageReportPrivateCloudInventoryReportViewData[] = [];
  pvtCloudsummary: ManageReportPrivateCloudInventoryReportSummaryViewData;
}

export class ManageReportPrivateCloudInventoryReportViewData {
  constructor() { }
  name: string;
  status: string;
  ip: string;
  type: string;
  cloudName: string;
  cpuCount: number;
  memory: string;
  storage: string;

  vmIdExists: boolean = false;
  vmId?: string;
}

export class ManageReportPrivateCloudInventoryReportSummaryViewData {
  constructor() { }
  hypervisorCount: number;
  vmsCount: number;
  bmsCount: number;
  otherCount: number;
  firewallsCount: number;
  switchCount: number;
  lbCount: number;
  containerCount: number;
  storageCount: number;

  vCPUConfigured: number = 0;
  vCPURuntimeUsage: number = 0;
  get vCPUChartData(): SingleDataSet {
    return [this.vCPURuntimeUsage, Number((100 - this.vCPURuntimeUsage).toFixed(2))];
  }

  RAMConfiguredValue: number = 0;
  RAMConfiguredUnit: string;
  RAMRuntimeUsage: number = 0;
  get ramChartData(): SingleDataSet {
    return [this.RAMRuntimeUsage, Number((100 - this.RAMRuntimeUsage).toFixed(2))];
  }

  diskSpaceAllocatedValue: number = 0;
  diskSpaceAllocatedUnit: string;
  diskSpaceUtilization: number = 0;
  get storageChartData(): SingleDataSet {
    return [this.diskSpaceUtilization, Number((100 - this.diskSpaceUtilization).toFixed(2))];
  }
}

export class ManageReportCloudNamesType {
  constructor() { }
  name: string;
  uuid: string;
  platform_type: string;
}