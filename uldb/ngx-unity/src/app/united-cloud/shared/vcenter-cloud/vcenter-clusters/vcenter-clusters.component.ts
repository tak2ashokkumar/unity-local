import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { VcenterClusterAlertSummaryViewData, VcenterClusterResourcesViewData, VcenterClustersService, VcenterClusterViewData } from './vcenter-clusters.service';
import { VcenterClusterSummary, VirtualDcItem } from './vcenter-clusters.type';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'vcenter-clusters',
  templateUrl: './vcenter-clusters.component.html',
  styleUrls: ['./vcenter-clusters.component.scss'],
  providers: [VcenterClustersService]
})
export class VcenterClustersComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  currentCriteria: SearchCriteria;

  // clusterSummary = new VcenterClusterSummaryViewData();
  clusterResources = new VcenterClusterResourcesViewData();
  vdcList: VirtualDcItem[];
  clusterAlertSummary = new VcenterClusterAlertSummaryViewData();
  clusterViewData: VcenterClusterViewData[] = [];
  count: number = 0;
  constructor(private svc: VcenterClustersService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storageService: StorageService,) {
    this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.currentCriteria = { params: [{ vdc: null }], sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getVdcList();
    this.getClusterResourceData();
    this.getClusterAlertData();
    this.getClusterSummary();
    this.getClusterList();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onVdcChange(event: string) {
    this.currentCriteria.pageNo = 1;
    this.getClusterList();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getClusterList();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getClusterList();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getClusterList();
  }

  refreshData() {
    this.spinner.start('main');
    this.getVdcList();
    this.getClusterResourceData();
    this.getClusterAlertData();
    this.getClusterSummary();
    this.getClusterList();
  }

  getVdcList() {
    this.vdcList = []
    this.svc.getVdcList(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.vdcList = res;
    })
  }
  getClusterResourceData() {
    this.svc.getClusterResourceData(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.clusterResources = this.svc.convertToClusterResourcesViewData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch cluster resources data. Please try again.'));
    });
  }

  getClusterAlertData() {
    this.svc.getClusterAlertData(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.clusterAlertSummary = this.svc.convertToClusterAlertsViewData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch cluster alert details. Please try again.'));
    });
  }

  clusterSummary: VcenterClusterSummary;
  getClusterSummary() {
    this.svc.getClusterSummary(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.clusterSummary = res;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch cluster summary. Please try again.'));
    });
  }

  getClusterList() {
    this.svc.getClusterList(this.currentCriteria, this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.clusterViewData = this.svc.convertToClusterViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    });
  }

  getProgressClass(value: number): string {
    return value < 65 ? 'bg-success' : value >= 65 && value < 85 ? 'bg-warning' : 'bg-danger';
  }

  goToDetails(view: VcenterClusterViewData) {
    // this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.CLUSTER }, StorageType.SESSIONSTORAGE)
    this.storageService.put('cluster', { name: view.name, deviceType: DeviceMapping.CLUSTER, configured: true }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.clusterId, 'hypervisors'], { relativeTo: this.route });
  }

}
