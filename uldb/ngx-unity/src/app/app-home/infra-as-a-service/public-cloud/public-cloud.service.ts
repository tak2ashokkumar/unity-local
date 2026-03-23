import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { GET_AWS_CLOUD_DATA, GET_AWS_SUMMARY, GET_AZURE_CLOUD_DATA, GET_AZURE_SUMMARY, GET_GCP_CLOUD_DATA, GET_GCP_CLOUD_LIST, GET_GCP_SUMMARY, GET_OCI_ACOUNTS, GET_OCI_CLOUD_DATA, POLL_AWS_AZURE_CLOUD_UPDATE, POLL_GCP_CLOUD_UPDATE, POLL_OCI_CLOUD_UPDATE } from 'src/app/shared/api-endpoint.const';
import { environment } from 'src/environments/environment';
import { DashboardGCPCloud, DashboardGCPCloudDataItem } from './gcp.type';
import { DashboardOCICloud, OCIWidget } from './oci.type';
import { DashboardPublicCloudWidget } from './public-cloud-widget/public-cloud-widget.type';

@Injectable()
export class PublicCloudService {

  constructor(private http: HttpClient,
    private appService: AppLevelService) { }

  getAWSSummary(): Observable<DashboardPublicCloudWidget> {
    return this.http.get<DashboardPublicCloudWidget>(GET_AWS_SUMMARY());
  }

  getAzureSummary(): Observable<DashboardPublicCloudWidget> {
    return this.http.get<DashboardPublicCloudWidget>(GET_AZURE_SUMMARY());
  }

  getOracleSummary(): Observable<DashboardPublicCloudWidget> {
    return this.http.get<DashboardPublicCloudWidget>(`/customer/integration/oci/accounts/summary/`);
  }
  
  getGCPSummary(): Observable<DashboardPublicCloudWidget> {
    return this.http.get<DashboardPublicCloudWidget>(GET_GCP_SUMMARY());
  }

  getCloudImageURL(cloudType: string) {
    let url = `${environment.assetsUrl}external-brand/logos/`;
    switch (cloudType) {
      case 'AWS': return `${url}amazon-web-services.svg`;
      case 'Azure': return `${url}Microsoft_Azure_Logo 1.svg`;
      case 'GCP': return `${url}Google_Cloud_Platform-Logo 1.svg`;
      case 'Oracle': return `${url}Oracle-cloud 1.svg`;
      default: return `${url}amazon-web-services.svg`;
    }
  }

  convertToWidgetViewData(data: DashboardPublicCloudWidget, cloudType: string): DashboardPublicCloudWidgetViewData {
    let a: DashboardPublicCloudWidgetViewData = new DashboardPublicCloudWidgetViewData();
    a.cloudType = cloudType;
    a.imageURL = this.getCloudImageURL(cloudType);
    a.subscriptions = data.account_count;
    a.services = data.service_count;
    a.resources = data.resource_count;
    a.cost = data.cost;
    if (data.vm_details) {
      a.vms = data.vm_details.vm_count;
      a.activeVMs = data.vm_details.vm_up;
      a.inactiveVMs = data.vm_details.vm_down;
    }
    if (data.alert_count) {
      a.alerts = data.alert_count.event_count;
      a.criticalAlerts = data.alert_count.critical;
      a.warningAlerts = data.alert_count.warning;
      a.informationAlerts = data.alert_count.information;
    }
    return a;
  }

  //Below blocks needs to be removed after confirmation - Start
  getGCPClouds(): Observable<PaginatedResult<DashboardGCPCloud>> {
    return this.http.get<PaginatedResult<DashboardGCPCloud>>(GET_GCP_CLOUD_LIST());
  }

  convertToGCPViewData(clouds: DashboardGCPCloud[]): GCPViewData[] {
    let viewData: GCPViewData[] = [];
    clouds.map((cloud: DashboardGCPCloud) => {
      let a: GCPViewData = new GCPViewData();
      a.id = cloud.id;
      a.uuid = cloud.uuid;
      a.accountName = cloud.name;
      a.platformType = 'GCP';
      a.loaderName = `DashboardGCPWidget${cloud.id}`;
      a.drillDownLink = '/unitycloud/publiccloud/gcp';
      viewData.push(a);
    });
    return viewData;
  }

  getOCIClouds(): Observable<PaginatedResult<DashboardOCICloud>> {
    return this.http.get<PaginatedResult<DashboardOCICloud>>(GET_OCI_ACOUNTS());
  }

  convertToOCIViewData(clouds: DashboardOCICloud[]): OCIViewData[] {
    let viewData: OCIViewData[] = [];
    clouds.map((cloud: DashboardOCICloud) => {
      let a: OCIViewData = new OCIViewData();
      a.id = cloud.id;
      a.uuid = cloud.uuid;
      a.accountName = cloud.name;
      a.platformType = 'GCP';
      a.loaderName = `DashboardOCIWidget${cloud.id}`;
      a.drillDownLink = '/unitycloud/publiccloud/oracle/dashboard';
      viewData.push(a);
    });
    return viewData;
  }

  getGCPCloudData(cloud: GCPViewData): Observable<DashboardGCPCloudDataItem> {
    return this.http.get<DashboardGCPCloudDataItem>(GET_GCP_CLOUD_DATA(cloud.id));
  }

  convertToGCPWidgetViewData(cloud: DashboardGCPCloudDataItem): GCPWidgetViewData {
    let viewData: GCPWidgetViewData = new GCPWidgetViewData();
    viewData.vmInstances = cloud.instances_count;
    viewData.vmActiveInstances = cloud.instances_up_count;
    viewData.vmInActiveInstances = cloud.instances_down_count;
    viewData.bucketsCount = cloud.buckets_count;
    viewData.sizeInGB = cloud.size_in_gb;
    viewData.healthCheckCount = cloud.health_check_count;
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

  getOCICloudData(cloud: OCIViewData): Observable<OCIWidget> {
    return this.http.get<OCIWidget>(GET_OCI_CLOUD_DATA(cloud.id));
  }

  convertToOCIWidgetViewData(cloud: OCIWidget): OCIWidgetViewData {
    let viewData: OCIWidgetViewData = new OCIWidgetViewData();
    viewData.vmInstances = cloud.instances_count;
    viewData.vmActiveInstances = cloud.instances_up_count;
    viewData.vmInActiveInstances = cloud.instances_down_count;
    viewData.bucketsCount = cloud.buckets_count;
    viewData.httpMonitorCount = cloud.http_monitor_count;
    viewData.databaseCount = cloud.database_count;
    return viewData;
  }

  getOCIDonutData(widgetData: OCIWidget) {
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
  //End

  pollForCloudsUpdate(): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(POLL_AWS_AZURE_CLOUD_UPDATE())
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
  }

  pollForGcpWidegtDataUpdate(): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(POLL_GCP_CLOUD_UPDATE())
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
  }

  pollForOCIWidgetDataUpdate(): Observable<TaskStatus> {
    return this.http.get<CeleryTask>(POLL_OCI_CLOUD_UPDATE())
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
  }
}

export class GCPViewData {
  id: number;
  uuid: string;
  accountName: string;
  platformType: string;
  loaderName?: string;
  drillDownLink: string;
  constructor() { }
}

export class OCIViewData {
  id: number;
  uuid: string;
  accountName: string;
  platformType: string;
  loaderName?: string;
  drillDownLink: string;
  constructor() { }
}

export class GCPWidgetViewData {
  bucketsCount: number = 0;
  sizeInGB: number = 0;
  healthCheckCount: number = 0;
  vmInstances: number = 0;
  vmActiveInstances: number = 0;
  vmInActiveInstances: number = 0;
  constructor() { }
}

export class OCIWidgetViewData {
  bucketsCount: number = 0;
  databaseCount: number = 0;
  httpMonitorCount: number = 0;
  vmInstances: number = 0;
  vmActiveInstances: number = 0;
  vmInActiveInstances: number = 0;
  constructor() { }
}

export class DashboardPublicCloudWidgetViewData {
  constructor() { }
  cloudType: string;
  imageURL: string;

  subscriptions: number = 0;
  services: number = 0;
  resources: number = 0;
  cost: number = 0;

  vms: number = 0;
  activeVMs: number = 0;
  inactiveVMs: number = 0;

  alerts: number = 0;
  criticalAlerts: number = 0;
  warningAlerts: number = 0;
  informationAlerts: number = 0;
}
