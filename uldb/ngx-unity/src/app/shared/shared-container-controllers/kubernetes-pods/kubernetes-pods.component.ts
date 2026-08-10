import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { KubernetesPodsService, KubernetesPodsViewdata } from './kubernetes-pods.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { Subject, interval } from 'rxjs';
import { takeUntil, takeWhile, switchMap, tap, finalize } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { HttpErrorResponse } from '@angular/common/http';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { environment } from 'src/environments/environment';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { KubernetesMonitoringService } from 'src/app/shared/shared-container-controllers/kubernetes-monitoring.service';

@Component({
  selector: 'kubernetes-pods',
  templateUrl: './kubernetes-pods.component.html',
  styleUrls: ['./kubernetes-pods.component.scss'],
  providers: [KubernetesPodsService]
})
export class KubernetesPodsComponent implements OnInit, OnDestroy {
  count: number = 0;
  viewData: KubernetesPodsViewdata[] = [];
  controllerId: string;
  selectedPodId: string;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  poll: boolean = false;
  showMonitoring: boolean;

  @ViewChild('confirm') confirm: ElementRef;
  deleteModalRef: BsModalRef;

  constructor(private route: ActivatedRoute,
    private notification: AppNotificationService,
    private router: Router,
    private modalService: BsModalService,
    private spinnerService: AppSpinnerService,
    private podsService: KubernetesPodsService,
    private refreshBtnService: DataRefreshBtnService,
    private termService: FloatingTerminalService,
    private k8sMon: KubernetesMonitoringService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.controllerId = params.get('controllerId');
      this.showMonitoring = !!(this.route.parent && this.route.parent.snapshot && this.route.parent.snapshot.data && this.route.parent.snapshot.data.monitoringEnabled);
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}] };
    });

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(this.controllerId ? environment.pollingInterval * 6 : environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getPods());
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getPods();
  }

  ngOnDestroy() {
    this.deleteModalRef?.hide();
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getPods();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getPods();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getPods();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getPods();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    if (this.controllerId) {
      this.syncPod();
    } else {
      this.spinnerService.start('main');
      this.getPods();
    }
  }

  syncPod() {
    this.refreshBtnService.start();
    this.spinnerService.start('main');
    this.podsService.syncPods(this.controllerId).pipe(
      takeUntil(this.ngUnsubscribe),
      switchMap(() => this.podsService.getPods(this.controllerId, this.currentCriteria)),
      finalize(() => { this.refreshBtnService.stop(); this.spinnerService.stop('main'); }))
      .subscribe(data => {
        this.count = data.count;
        this.viewData = this.podsService.convertToViewdata(data.results);
      }, (err: Error) => {
        this.notification.error(new Notification('Error while syncing Pods.'));
      });
  }

  getPods() {
    this.podsService.getPods(this.controllerId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.podsService.convertToViewdata(data.results);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Error while fetching Pods.'));
    });
  }

  goToContainers(view: KubernetesPodsViewdata) {
    this.router.navigate([view.podId, 'containers'], { relativeTo: this.route });
  }

  goToStats(view: KubernetesPodsViewdata) {
    this.k8sMon.goToStats(this.router, this.route, DeviceMapping.KUBERNETES_POD, view.podId, view.name, view.monitoring);
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  deletePod(view: KubernetesPodsViewdata) {
    this.selectedPodId = view.podId;
    this.deleteModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinnerService.start('main');
    this.podsService.deletePod(this.selectedPodId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deleteModalRef.hide();
      this.getPods();
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Pod deleted Successfully'));
    }, (err: HttpErrorResponse) => {
      this.deleteModalRef.hide();
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Pod delete Failed. Please try again later!!'));
    });
  }
}
