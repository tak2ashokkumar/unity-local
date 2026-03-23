import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SingleDataSet } from 'ng2-charts';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { GET_AWS_CLOUD_DATA, GET_AZURE_CLOUD_DATA, GET_GCP_CLOUD_DATA, GET_REPORTS_BY_CLOUD_NAMES, GET_REPORT_BY_ID } from 'src/app/shared/api-endpoint.const';
import { DashboardGCPCloudDataItem } from 'src/app/app-home/infra-as-a-service/public-cloud/gcp.type';
import { ManageReportCloudInventoryType, ManageReportDataType, ManageReportPublicCloudInventoryVMType } from './public-report-preview.type';

@Injectable()
export class PublicReportPreviewService {

  constructor(private http: HttpClient,) { }
  
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
      viewData.cloudType = report.cloud_type ? 'public': ''; 
      let list = <ManageReportPublicCloudInventoryVMType[]>report.vm;
      list.forEach(vm => {
        let data = new ManageReportPublicCloudInventoryReportViewData();
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
      reportViewdata.push(viewData);
    });
    return reportViewdata;
  }

  generateReport(accounts: ManageReportCloudNamesType[]) {
    let data: string[] = [];
    accounts.forEach(account => data.push(account.uuid));
    return this.http.post<ManageReportCloudInventoryType[]>(GET_REPORTS_BY_CLOUD_NAMES(), { 'account': data });
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

  convertToAWSWidgetViewData(cloud: AWSWidget): ManageReportAWSInventoryReportSummaryViewData {
    let viewData: ManageReportAWSInventoryReportSummaryViewData = new ManageReportAWSInventoryReportSummaryViewData();
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

  convertToAzureWidgetViewData(cloud: AzureWidget): ManageReportAzureInventoryReportSummaryViewData {
    let viewData: ManageReportAzureInventoryReportSummaryViewData = new ManageReportAzureInventoryReportSummaryViewData();
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

  convertToGCPWidgetViewData(cloud: DashboardGCPCloudDataItem): ManageReportGCPInventoryReportSummaryViewData {
    let viewData: ManageReportGCPInventoryReportSummaryViewData = new ManageReportGCPInventoryReportSummaryViewData();
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

export class ManageReportCloudInventoryReportViewData {
  constructor() {
    this.publicCloudVMlist = [];
  }
  cloudType: string;
  name: string;
  cloudId: string;
  cloud: 'AWS' | 'GCP' | 'AZURE';
  publicCloudVMlist: ManageReportPublicCloudInventoryReportViewData[] = [];
  awsSummary: ManageReportAWSInventoryReportSummaryViewData;
  azureSummary: ManageReportAzureInventoryReportSummaryViewData;
  gcpSummary: ManageReportGCPInventoryReportSummaryViewData;
}

export class ManageReportPublicCloudInventoryReportViewData {
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

export class ManageReportAWSInventoryReportSummaryViewData {
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

export class ManageReportAzureInventoryReportSummaryViewData {
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

export class ManageReportGCPInventoryReportSummaryViewData {
  bucketsCount: number = 0;
  sizeInGB: number = 0;
  healthCheckCount: number = 0;
  vmInstances: number = 0;
  vmActiveInstances: number = 0;
  vmInActiveInstances: number = 0;
  gcpChartData: SingleDataSet = [1, 2];
  constructor() { }
}

export class ManageReportCloudNamesType {
  constructor() { }
  name: string;
  uuid: string;
  platform_type: string;
}