import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { KubernetesServicesService, KubernetesServicesViewdata } from './kubernetes-services.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { KubernetesMonitoringService } from 'src/app/shared/shared-container-controllers/kubernetes-monitoring.service';

@Component({
  selector: 'kubernetes-services',
  templateUrl: './kubernetes-services.component.html',
  styleUrls: ['./kubernetes-services.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [KubernetesServicesService]
})
export class KubernetesServicesComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();

  count: number = 0;
  viewData: KubernetesServicesViewdata[] = [];
  controllerId: string;
  currentCriteria: SearchCriteria;
  showMonitoring: boolean;

  constructor(private route: ActivatedRoute,
    private svc: KubernetesServicesService,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService,
    private refreshSvc: DataRefreshBtnService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private k8sMon: KubernetesMonitoringService) { }

  ngOnInit() {
    this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.controllerId = params.get('controllerId');
      this.showMonitoring = !!(this.route.parent && this.route.parent.snapshot && this.route.parent.snapshot.data && this.route.parent.snapshot.data.monitoringEnabled);
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}] };
      this.getServices();
    });
  }

  ngOnDestroy() {
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getServices();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getServices();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getServices();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getServices();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    if (this.controllerId) {
      this.syncServices();
    } else {
      this.getServices();
    }
  }

  trackByUuid(index: number, item: KubernetesServicesViewdata): string {
    return item.uuid;
  }

  goToStats(view: KubernetesServicesViewdata) {
    this.k8sMon.goToStats(this.router, this.route, DeviceMapping.KUBERNETES_SERVICE, view.uuid, view.name, view.monitoring);
  }

  private getServices() {
    this.spinnerSvc.start('main');
    this.svc.getServices(this.controllerId, this.currentCriteria).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe(data => {
        this.count = data.count;
        this.viewData = this.svc.convertToViewdata(data.results);
      }, err => {
        this.notificationSvc.error(new Notification('Error while fetching Services.'));
      });
  }

  private syncServices() {
    this.refreshSvc.start();
    this.spinnerSvc.start('main');
    this.svc.syncServices(this.controllerId).pipe(
      takeUntil(this.ngUnsubscribe),
      switchMap(() => this.svc.getServices(this.controllerId, this.currentCriteria)),
      finalize(() => { this.refreshSvc.stop(); this.stopSpinnerAndMarkForCheck(); }))
      .subscribe(data => {
        this.count = data.count;
        this.viewData = this.svc.convertToViewdata(data.results);
      }, err => {
        this.notificationSvc.error(new Notification('Error while syncing Services.'));
      });
  }

  private stopSpinnerAndMarkForCheck() {
    this.spinnerSvc.stop('main');
    this.cdr.markForCheck();
  }
}
