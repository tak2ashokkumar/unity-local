import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { KubernetesMonitoringService } from 'src/app/shared/shared-container-controllers/kubernetes-monitoring.service';
import { KubernetesStatefulsetsService, KubernetesStatefulsetsViewdata } from './kubernetes-statefulsets.service';

@Component({
  selector: 'kubernetes-statefulsets',
  templateUrl: './kubernetes-statefulsets.component.html',
  styleUrls: ['./kubernetes-statefulsets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [KubernetesStatefulsetsService]
})
export class KubernetesStatefulsetsComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();

  count: number = 0;
  viewData: KubernetesStatefulsetsViewdata[] = [];
  controllerId: string;
  showMonitoring: boolean;
  currentCriteria: SearchCriteria;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private svc: KubernetesStatefulsetsService,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService,
    private refreshSvc: DataRefreshBtnService,
    private k8sMon: KubernetesMonitoringService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.controllerId = params.get('controllerId');
      this.showMonitoring = !!(this.route.parent && this.route.parent.snapshot && this.route.parent.snapshot.data && this.route.parent.snapshot.data.monitoringEnabled);
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}] };
      this.getStatefulsets();
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
    this.getStatefulsets();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getStatefulsets();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getStatefulsets();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getStatefulsets();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    if (this.controllerId) {
      this.syncStatefulsets();
    } else {
      this.getStatefulsets();
    }
  }

  trackByUuid(index: number, item: KubernetesStatefulsetsViewdata): string {
    return item.uuid;
  }

  goToStats(view: KubernetesStatefulsetsViewdata) {
    this.k8sMon.goToStats(this.router, this.route, DeviceMapping.KUBERNETES_STATEFULSET, view.uuid, view.name, view.monitoring);
  }

  private getStatefulsets() {
    this.spinnerSvc.start('main');
    this.svc.getStatefulsets(this.controllerId, this.currentCriteria).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe(data => {
        this.count = data.count;
        this.viewData = this.svc.convertToViewdata(data.results);
      }, err => {
        this.notificationSvc.error(new Notification('Error while fetching StatefulSets.'));
      });
  }

  private syncStatefulsets() {
    this.refreshSvc.start();
    this.spinnerSvc.start('main');
    this.svc.syncStatefulsets(this.controllerId).pipe(
      takeUntil(this.ngUnsubscribe),
      switchMap(() => this.svc.getStatefulsets(this.controllerId, this.currentCriteria)),
      finalize(() => { this.refreshSvc.stop(); this.stopSpinnerAndMarkForCheck(); }))
      .subscribe(data => {
        this.count = data.count;
        this.viewData = this.svc.convertToViewdata(data.results);
      }, err => {
        this.notificationSvc.error(new Notification('Error while syncing StatefulSets.'));
      });
  }

  private stopSpinnerAndMarkForCheck() {
    this.spinnerSvc.stop('main');
    this.cdr.markForCheck();
  }
}
