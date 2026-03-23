import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { CloudInventoryType, PrivateCloudInventoryVMType, PublicCloudInventoryVMType, CloudNamesType } from './cloud-inventory-report.type';
import { SingleDataSet } from 'ng2-charts';
import { GET_REPORTING_CLOUD_NAMES_BY_CLOUD_TYPE, GET_REPORTS_BY_CLOUD_NAMES, PRIVATE_CLOUD_WIDGET_DATA, PRIVATE_CLOUD_CONTAINERS_PODS, GET_AWS_CLOUD_DATA, GET_AZURE_CLOUD_DATA, GET_GCP_CLOUD_DATA, DOWNLOAD_CLOUD_INVENTORY_REPORT, EMAIL_CLOUD_INVENTORY_REPORT } from 'src/app/shared/api-endpoint.const';
import { Observable, of } from 'rxjs';
import { UsageData } from 'src/app/united-cloud/shared/entities/usage-data.type';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { map, catchError } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { KubernetesPodType } from 'src/app/shared/SharedEntityTypes/kubernetes-pod.type';
import { DashboardGCPCloudDataItem } from 'src/app/app-home/infra-as-a-service/public-cloud/gcp.type';
import { Router } from '@angular/router';

@Injectable()
export class CloudInventoryReportService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private router: Router) { }

  convertToViewdata(reportData: CloudInventoryType[]) {
    let reportViewdata: CloudInventoryReportViewData[] = [];
    reportData.forEach(report => {
      let viewData = new CloudInventoryReportViewData();
      viewData.cloudId = report.cloud_uuid;
      viewData.name = report.name;
      viewData.cloud = report.cloud;
      if (report.cloud_type == 'Private') {
        viewData.cloudType = 'private';
        viewData.pvtCloudsummary = this.getSummaryComponentViewData(report.cloud_data);
        let list = <PrivateCloudInventoryVMType[]>report.vm;
        list.forEach(vm => {
          let data = new PrivateCloudInventoryReportViewData();
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
      } else {
        viewData.cloudType = 'public';
        let list = <PublicCloudInventoryVMType[]>report.vm;
        list.forEach(vm => {
          let data = new PublicCloudInventoryReportViewData();
          data.name = vm.name;
          data.ip = vm.ip_address;
          switch (viewData.cloud) {
            case 'AWS':
              data.status = vm.last_known_state === 'running' ? 'Up' : vm.last_known_state === 'stopped' ? 'Down' : vm.last_known_state;
              data.memory = vm.memory != 'N/A' ? `${vm.memory} GB` : vm.memory;
              data.storage = vm.storage;
              break;
            case 'AZURE':
              if (vm.last_known_state === 'VM starting') {
                data.status = 'Starting'
              } else if (vm.last_known_state === 'VM running') {
                data.status = 'Up';
              } else if (vm.last_known_state === 'VM deallocating') {
                data.status = 'Stopping';
              } else {
                data.status = 'Down';
              }
              data.memory = vm.memory != 'N/A' ? `${(Number.parseInt(vm.memory) / 1024)} GB` : vm.memory;
              data.storage = vm.storage;
              break;
            case 'GCP':
              data.status = vm.last_known_state === 'RUNNING' ? 'Up' : 'Down';
              data.memory = vm.memory != 'N/A' ? `${(Number.parseInt(vm.memory) / 1024)} GB` : vm.memory;
              data.storage = vm.storage;
              break;
          }
          data.region = vm.region;
          data.type = vm.type;
          data.cpuCount = vm.cpu_count;

          viewData.publicCloudVMlist.push(data);
        });
      }
      reportViewdata.push(viewData);
    });
    return reportViewdata;
  }

  private getSummaryComponentViewData(privateCloud: PrivateCloud): PrivateCloudInventoryReportSummaryViewData {
    let data: PrivateCloudInventoryReportSummaryViewData = new PrivateCloudInventoryReportSummaryViewData();
    data.hypervisorCount = privateCloud.hypervisors ? privateCloud.hypervisors.length : 0;
    data.bmsCount = privateCloud.bm_server ? privateCloud.bm_server.length : 0;
    data.vmsCount = privateCloud.vms_count;
    data.otherCount = privateCloud.customdevice ? privateCloud.customdevice.length : 0;
    data.containerCount = 0;
    data.storageCount = privateCloud.storage_device ? privateCloud.storage_device.length : 0;
    data.switchCount = privateCloud.switch ? privateCloud.switch.length : 0;
    data.lbCount = privateCloud.load_balancer ? privateCloud.load_balancer.length : 0;
    data.firewallsCount = privateCloud.firewall ? privateCloud.firewall.length : 0;
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

  createFilterForm() {
    return this.builder.group({
      'cloudType': ['', [Validators.required]],
      'cloud': [[], [Validators.required]],
      'cloudName': [[], [Validators.required]],
      'report_url': [this.router.url]
    });
  }

  resetFilterFormErrors() {
    return {
      'cloudType': '',
      'cloud': '',
      'cloudName': ''
    };
  }

  filterValidationMessages = {
    'cloudType': {
      'required': 'Cloud type is required'
    },
    'cloud': {
      'required': 'Select atleast one cloud'
    },
    'cloudName': {
      'required': 'Select atleast one cloud name'
    }
  }

  getCloudNames(clouds: string[]) {
    let params: HttpParams = new HttpParams();
    clouds.forEach(cloud => {
      params = params.append('cloud', cloud);
    });
    return this.http.get<CloudNamesType[]>(GET_REPORTING_CLOUD_NAMES_BY_CLOUD_TYPE(), { params: params });
  }

  generateReport(accounts: CloudNamesType[]) {
    let data: string[] = [];
    accounts.forEach(account => data.push(account.uuid));
    return this.http.post<CloudInventoryType[]>(GET_REPORTS_BY_CLOUD_NAMES(), { 'account': data });
  }

  downloadReport(accounts: string[]) {
    return this.http.post<{ data: string }>(DOWNLOAD_CLOUD_INVENTORY_REPORT(), { file_type: 'csv', accounts: accounts, name: 'cloud_inventory_report' });
  }

  sendEmail(accounts: string[]) {
    return this.http.post(EMAIL_CLOUD_INVENTORY_REPORT(), { file_type: 'csv', accounts: accounts, name: 'cloud_inventory_report' });
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

  getAWSCloudData(cloudId: string): Observable<Map<string, AWSWidget>> {
    return this.http.get<AWSWidget>(GET_AWS_CLOUD_DATA(Number.parseInt(cloudId)), { headers: Handle404Header })
      .pipe(
        map((res: AWSWidget) => {
          return new Map<string, AWSWidget>().set(cloudId, res);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, AWSWidget>().set(cloudId, null));
        })
      );
  }

  convertToAWSWidgetViewData(cloud: AWSWidget): AWSInventoryReportSummaryViewData {
    let viewData: AWSInventoryReportSummaryViewData = new AWSInventoryReportSummaryViewData();
    viewData.S3Buckets = cloud.s3_bucket;
    viewData.ElasticIPs = cloud.elastic_ips;
    viewData.RDSInstances = cloud.RDS_instance;
    viewData.LoadBalancers = cloud.load_balancer;
    viewData.ec2Instances = cloud.ec2_instance;
    viewData.ec2ActiveInstances = cloud.ec2_active_instance;
    viewData.ec2InactiveInstances = cloud.ec2_inactive_instance;
    viewData.ec2ChartData = this.getAWSDonutData(cloud);
    return viewData;
  }

  getAWSDonutData(widgetData: AWSWidget) {
    let viewData: number[] = [];
    if (widgetData.ec2_instance) {
      viewData.push(widgetData.ec2_active_instance);
      viewData.push(widgetData.ec2_inactive_instance);
    } else {
      viewData.push(0);
      viewData.push(0);
    }
    return viewData;
  }

  getAzureCloudData(cloudId: string): Observable<Map<string, AzureWidget>> {
    return this.http.get<AzureWidget>(GET_AZURE_CLOUD_DATA(Number.parseInt(cloudId)), { headers: Handle404Header })
      .pipe(
        map((res: AzureWidget) => {
          return new Map<string, AzureWidget>().set(cloudId, res);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, AzureWidget>().set(cloudId, null));
        })
      );
  }

  convertToAzureWidgetViewData(cloud: AzureWidget): AzureInventoryReportSummaryViewData {
    let viewData: AzureInventoryReportSummaryViewData = new AzureInventoryReportSummaryViewData();
    viewData.StarageAccounts = cloud.storage_account;
    viewData.Nics = cloud.nic;
    viewData.PublicIps = cloud.public_ips;
    viewData.LoadBalancers = cloud.load_balancer;
    viewData.VMInstances = cloud.vm_instance;
    viewData.VMActiveInstances = cloud.vm_active_instance;
    viewData.VMInActiveInstances = cloud.vm_inactive_instance;
    viewData.azureChartData = this.getAzureDonutData(cloud);
    return viewData;
  }

  getAzureDonutData(widgetData: AzureWidget) {
    let viewData: number[] = [];
    if (widgetData.vm_instance) {
      viewData.push(widgetData.vm_active_instance);
      viewData.push(widgetData.vm_inactive_instance);
    } else {
      viewData.push(0);
      viewData.push(0);
    }
    return viewData;
  }

  getGCPCloudData(cloudId: string): Observable<Map<string, DashboardGCPCloudDataItem>> {
    return this.http.get<DashboardGCPCloudDataItem>(GET_GCP_CLOUD_DATA(Number.parseInt(cloudId)), { headers: Handle404Header })
      .pipe(
        map((res: DashboardGCPCloudDataItem) => {
          return new Map<string, DashboardGCPCloudDataItem>().set(cloudId, res);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, DashboardGCPCloudDataItem>().set(cloudId, null));
        })
      );
  }

  convertToGCPWidgetViewData(cloud: DashboardGCPCloudDataItem): GCPInventoryReportSummaryViewData {
    let viewData: GCPInventoryReportSummaryViewData = new GCPInventoryReportSummaryViewData();
    viewData.vmInstances = cloud.instances_count;
    viewData.vmActiveInstances = cloud.instances_up_count;
    viewData.vmInActiveInstances = cloud.instances_down_count;
    viewData.bucketsCount = cloud.buckets_count;
    viewData.sizeInGB = cloud.size_in_gb;
    viewData.healthCheckCount = cloud.health_check_count;
    viewData.gcpChartData = this.getGCPDonutData(cloud);
    return viewData;
  }

  getGCPDonutData(widgetData: DashboardGCPCloudDataItem) {
    let viewData: number[] = [];
    if (widgetData.instances_count) {
      viewData.push(widgetData.instances_up_count);
      viewData.push(widgetData.instances_down_count);
    } else {
      viewData.push(0);
      viewData.push(0);
    }
    return viewData;
  }
}

export class CloudInventoryReportViewData {
  constructor() {
    this.pvtCloudVMlist = [];
    this.publicCloudVMlist = [];
  }
  cloudType: 'public' | 'private';
  name: string;
  cloudId: string;
  cloud: 'vmware' | 'openstack' | 'vcloud' | 'proxmox' | 'g3_kvm'| 'esxi'| 'custom' | 'AWS' | 'GCP' | 'AZURE';
  pvtCloudVMlist: PrivateCloudInventoryReportViewData[] = [];
  pvtCloudsummary: PrivateCloudInventoryReportSummaryViewData;
  publicCloudVMlist: PublicCloudInventoryReportViewData[] = [];
  awsSummary: AWSInventoryReportSummaryViewData;
  azureSummary: AzureInventoryReportSummaryViewData;
  gcpSummary: GCPInventoryReportSummaryViewData;
}

export class PrivateCloudInventoryReportViewData {
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

export class PublicCloudInventoryReportViewData {
  constructor() { }
  name: string;
  status: string;
  ip: string;
  type: string;
  cloudName: string;
  cpuCount: number;
  memory: string;
  storage: string;
  region: string;
}

export class PrivateCloudInventoryReportSummaryViewData {
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
  RAMConfiguredUnit:string;
  RAMRuntimeUsage: number = 0;
  get ramChartData(): SingleDataSet {
    return [this.RAMRuntimeUsage, Number((100 - this.RAMRuntimeUsage).toFixed(2))];
  } 

  diskSpaceAllocatedValue: number = 0;
  diskSpaceAllocatedUnit:string;
  diskSpaceUtilization: number = 0;
  get storageChartData(): SingleDataSet {
    return [this.diskSpaceUtilization, Number((100 - this.diskSpaceUtilization).toFixed(2))];
  }
}

export class AWSInventoryReportSummaryViewData {
  constructor() { }
  LoadBalancers?: number = 0;
  RDSInstances?: number = 0;
  S3Buckets?: number = 0;
  ElasticIPs?: number = 0;
  ec2Instances?: number = 0;
  ec2ActiveInstances?: number = 0;
  ec2InactiveInstances?: number = 0;
  ec2ChartData: SingleDataSet = [1, 2];
}
export class AzureInventoryReportSummaryViewData {
  LoadBalancers?: number = 0;
  Nics?: number = 0;
  StarageAccounts?: number = 0;
  PublicIps?: number = 0;
  VMInstances?: number = 0;
  VMActiveInstances?: number = 0;
  VMInActiveInstances?: number = 0;
  azureChartData: SingleDataSet = [1, 2];
  constructor() { }
}
export class GCPInventoryReportSummaryViewData {
  bucketsCount: number = 0;
  sizeInGB: number = 0;
  healthCheckCount: number = 0;
  vmInstances: number = 0;
  vmActiveInstances: number = 0;
  vmInActiveInstances: number = 0;
  gcpChartData: SingleDataSet = [1, 2];
  constructor() { }
}
