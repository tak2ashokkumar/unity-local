import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { KubernetesControlplaneComponentsService, KubernetesControlplaneComponentsViewdata } from './kubernetes-controlplane-components.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { KubernetesMonitoringService } from 'src/app/shared/shared-container-controllers/kubernetes-monitoring.service';

@Component({
  selector: 'kubernetes-controlplane-components',
  templateUrl: './kubernetes-controlplane-components.component.html',
  styleUrls: ['./kubernetes-controlplane-components.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [KubernetesControlplaneComponentsService]
})
export class KubernetesControlplaneComponentsComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();

  count: number = 0;
  viewData: KubernetesControlplaneComponentsViewdata[] = [];
  controllerId: string;
  currentCriteria: SearchCriteria;
  showMonitoring: boolean;

  constructor(private route: ActivatedRoute,
    private svc: KubernetesControlplaneComponentsService,
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
      this.getControlplaneComponents();
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
    this.getControlplaneComponents();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getControlplaneComponents();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getControlplaneComponents();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getControlplaneComponents();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    if (this.controllerId) {
      this.syncControlplaneComponents();
    } else {
      this.getControlplaneComponents();
    }
  }

  trackByUuid(index: number, item: KubernetesControlplaneComponentsViewdata): string {
    return item.uuid;
  }

  goToStats(view: KubernetesControlplaneComponentsViewdata) {
    this.k8sMon.goToStats(this.router, this.route, DeviceMapping.KUBERNETES_CONTROLPLANE, view.uuid, view.component, view.monitoring);
  }

  private getControlplaneComponents() {
    this.spinnerSvc.start('main');
    this.svc.getControlplaneComponents(this.controllerId, this.currentCriteria).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe(data => {
        this.count = data.count;
        this.viewData = this.svc.convertToViewdata(data.results);
      }, err => {
        this.notificationSvc.error(new Notification('Error while fetching ControlPlane Components.'));
      });
  }

  private syncControlplaneComponents() {
    this.refreshSvc.start();
    this.spinnerSvc.start('main');
    this.svc.syncControlplaneComponents(this.controllerId).pipe(
      takeUntil(this.ngUnsubscribe),
      switchMap(() => this.svc.getControlplaneComponents(this.controllerId, this.currentCriteria)),
      finalize(() => { this.refreshSvc.stop(); this.stopSpinnerAndMarkForCheck(); }))
      .subscribe(data => {
        this.count = data.count;
        this.viewData = this.svc.convertToViewdata(data.results);
      }, err => {
        this.notificationSvc.error(new Notification('Error while syncing ControlPlane Components.'));
      });
  }

  private stopSpinnerAndMarkForCheck() {
    this.spinnerSvc.stop('main');
    this.cdr.markForCheck();
  }
}
