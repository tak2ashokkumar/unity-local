import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, UrlSegment } from '@angular/router';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { VcenterClusterItemsService } from './vcenter-cluster-items.service';
import { VcenterClusterAlertSummaryViewData, VcenterClusterResourcesViewData } from '../vcenter-clusters.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { TabData } from 'src/app/shared/tabdata';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceTabData } from '../../../device-tab/device-tab.component';

@Component({
  selector: 'vcenter-cluster-items',
  templateUrl: './vcenter-cluster-items.component.html',
  styleUrls: ['./vcenter-cluster-items.component.scss'],
  providers: [VcenterClusterItemsService]
})
export class VcenterClusterItemsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  clusterId: string;
  currentCriteria: SearchCriteria;
  currentRouteUrl: string = '';
  device: DeviceTabData = { name: '', deviceType: null };
  tabData: TabData[] = tabData;

  clusterResources = new VcenterClusterResourcesViewData();
  clusterAlertSummary = new VcenterClusterAlertSummaryViewData();
  constructor(private svc: VcenterClusterItemsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storageService: StorageService,) {
    this.route.parent.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });
    this.route.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });
    this.route.paramMap.forEach(param => {
      this.clusterId = param.get('clusterId');
    });
  }

  ngOnInit(): void {
    this.loadTabs();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.storageService.removeByKey('cluster', StorageType.SESSIONSTORAGE);
  }

  loadTabs() {
    this.device = <DeviceTabData>this.storageService.getByKey('cluster', StorageType.SESSIONSTORAGE);
    this.route.paramMap.subscribe((params: ParamMap) => this.device.uuid = params.get('clusterId'));
    // this.tabData.forEach(tab => {
    //   if (!tab.alwaysEnable && !this.device.configured) {
    //     tab.enabled = false;
    //   } else {
    //   }
    //   tab.enabled = true;
    // });
    this.getClusterResourceData();
    this.getClusterAlertData();
  }

  getClusterResourceData() {
    this.svc.getClusterResourceData(this.clusterId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.clusterResources = this.svc.convertToClusterResourcesViewData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch cluster resources data. Please try again.'));
    });
  }

  getClusterAlertData() {
    this.svc.getClusterAlertData(this.clusterId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.clusterAlertSummary = this.svc.convertToClusterAlertsViewData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch cluster alert details. Please try again.'));
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  goTo(url: string) {
    this.router.navigate([url], { relativeTo: this.route });
  }

  isActive(tab: TabData) {
    if (this.router.url.match(this.currentRouteUrl.concat(tab.url))) {
      return 'text-success';
    }
    return '';
  }

}

const tabData: TabData[] = [
  {
    name: 'Hosts',
    url: 'hypervisors',
  },
  {
    name: 'Virtual Machines',
    url: 'vms',
  },
  {
    name: 'Datastores',
    url: 'datastores',
  },
  {
    name: 'Networks',
    url: 'networks'
  }
]
