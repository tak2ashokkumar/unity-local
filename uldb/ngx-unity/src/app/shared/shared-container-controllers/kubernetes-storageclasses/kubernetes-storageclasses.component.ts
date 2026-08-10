import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { KubernetesStorageclassesService, KubernetesStorageclassesViewdata } from './kubernetes-storageclasses.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { KubernetesMonitoringService } from 'src/app/shared/shared-container-controllers/kubernetes-monitoring.service';

@Component({
  selector: 'kubernetes-storageclasses',
  templateUrl: './kubernetes-storageclasses.component.html',
  styleUrls: ['./kubernetes-storageclasses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [KubernetesStorageclassesService]
})
export class KubernetesStorageclassesComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();

  count: number = 0;
  viewData: KubernetesStorageclassesViewdata[] = [];
  controllerId: string;
  currentCriteria: SearchCriteria;
  showMonitoring: boolean;

  constructor(private route: ActivatedRoute,
    private svc: KubernetesStorageclassesService,
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
      this.getStorageclasses();
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
    this.getStorageclasses();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getStorageclasses();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getStorageclasses();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getStorageclasses();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    if (this.controllerId) {
      this.syncStorageclasses();
    } else {
      this.getStorageclasses();
    }
  }

  trackByUuid(index: number, item: KubernetesStorageclassesViewdata): string {
    return item.uuid;
  }

  goToStats(view: KubernetesStorageclassesViewdata) {
    this.k8sMon.goToStats(this.router, this.route, DeviceMapping.KUBERNETES_STORAGECLASS, view.uuid, view.name, view.monitoring);
  }

  private getStorageclasses() {
    this.spinnerSvc.start('main');
    this.svc.getStorageclasses(this.controllerId, this.currentCriteria).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe(data => {
        this.count = data.count;
        this.viewData = this.svc.convertToViewdata(data.results);
      }, err => {
        this.notificationSvc.error(new Notification('Error while fetching Storage Classes.'));
      });
  }

  private syncStorageclasses() {
    this.refreshSvc.start();
    this.spinnerSvc.start('main');
    this.svc.syncStorageclasses(this.controllerId).pipe(
      takeUntil(this.ngUnsubscribe),
      switchMap(() => this.svc.getStorageclasses(this.controllerId, this.currentCriteria)),
      finalize(() => { this.refreshSvc.stop(); this.stopSpinnerAndMarkForCheck(); }))
      .subscribe(data => {
        this.count = data.count;
        this.viewData = this.svc.convertToViewdata(data.results);
      }, err => {
        this.notificationSvc.error(new Notification('Error while syncing Storage Classes.'));
      });
  }

  private stopSpinnerAndMarkForCheck() {
    this.spinnerSvc.stop('main');
    this.cdr.markForCheck();
  }
}
