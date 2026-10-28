import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { interval, Subject } from 'rxjs';
import { finalize, switchMap, take, takeUntil, takeWhile } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { VergeIOAccount } from '../usi-vergeio.type';
import { UsiVergeioDetailService, VergeIOSummaryTile, VergeIOVmViewData } from './usi-vergeio-detail.service';
import { VergeIOComponentSummary } from './usi-vergeio-detail.type';

// Operation statuses that are still in flight - keep polling while one of these.
const VERGEIO_PENDING_STATUSES: string[] = ['submitted', 'pending', 'in_progress', 'running', 'initiated', 'queued'];
// Maximum number of operation polls before giving up (3s interval).
const VERGEIO_MAX_OPERATION_POLLS = 20;

@Component({
  selector: 'usi-vergeio-detail',
  templateUrl: './usi-vergeio-detail.component.html',
  styleUrls: ['./usi-vergeio-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UsiVergeioDetailService]
})
export class UsiVergeioDetailComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();
  instanceId: string;

  account: VergeIOAccount;
  summary: VergeIOComponentSummary;
  summaryTiles: VergeIOSummaryTile[] = [];

  // VM power operations are OUT OF SCOPE per DCIM-1411 - kept in code but hidden
  // in the template. Flip this to re-enable the power action buttons.
  powerActionsEnabled: boolean = false;

  currentCriteria: SearchCriteria;
  vmCount: number;
  vmViewData: VergeIOVmViewData[] = [];
  selectedVm: VergeIOVmViewData;

  @ViewChild('monitoring') monitoring: TemplateRef<void>;
  monitoringRef: BsModalRef;

  constructor(private svc: UsiVergeioDetailService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService,
    private modalSvc: BsModalService,
    private cdr: ChangeDetectorRef) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.instanceId = params.get('instanceId');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.getAccount();
    this.getSummary();
    this.getVms();
  }

  ngOnDestroy(): void {
    this.monitoringRef?.hide();
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  openMonitoring(vm: VergeIOVmViewData) {
    this.selectedVm = vm;
    this.monitoringRef = this.modalSvc.show(this.monitoring, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true });
  }

  getAccount() {
    this.svc.getAccount(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.account = res;
      this.cdr.markForCheck();
    }, () => { });
  }

  getSummary() {
    this.spinnerSvc.start('vergeioSummaryLoader');
    this.summaryTiles = [];
    this.svc.getComponentSummary(this.instanceId).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('vergeioSummaryLoader')))
      .subscribe(res => {
        this.summary = res;
        this.summaryTiles = this.svc.convertToSummaryTiles(res);
      }, (err: HttpErrorResponse) => {
        this.notificationSvc.error(new Notification('Failed to load VergeIO summary.'));
      });
  }

  getVms() {
    this.vmViewData = [];
    this.spinnerSvc.start('main');
    this.svc.getVms(this.instanceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopLoader('main')))
      .subscribe(res => {
        this.vmCount = res.count;
        this.vmViewData = this.svc.convertToVmViewData(res.results);
      }, (err: HttpErrorResponse) => {
        this.notificationSvc.error(new Notification('Failed to load VergeIO virtual machines.'));
      });
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getVms();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getVms();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getVms();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getSummary();
    this.getVms();
  }

  powerAction(vm: VergeIOVmViewData, action: string) {
    if (vm.actionInProgress) {
      return;
    }
    vm.actionInProgress = true;
    this.cdr.markForCheck();
    this.svc.powerAction(vm.uuid, action).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res && res.operation_uuid) {
        this.pollOperation(res.operation_uuid, vm);
      } else {
        vm.actionInProgress = false;
        this.getVms();
      }
    }, (err: HttpErrorResponse) => {
      vm.actionInProgress = false;
      this.cdr.markForCheck();
      this.notificationSvc.error(new Notification('Failed to perform power action. Please try again.'));
    });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  trackByUuid(index: number, vm: VergeIOVmViewData): string {
    return vm.uuid;
  }

  private pollOperation(operationId: string, vm: VergeIOVmViewData) {
    interval(3000).pipe(
      switchMap(() => this.svc.getOperation(operationId)),
      takeWhile(op => this.isPending(op.status), true),
      take(VERGEIO_MAX_OPERATION_POLLS),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(op => {
      if (!this.isPending(op.status)) {
        vm.actionInProgress = false;
        this.getVms();
      }
    }, () => {
      vm.actionInProgress = false;
      this.cdr.markForCheck();
    });
  }

  private isPending(status: string): boolean {
    return VERGEIO_PENDING_STATUSES.includes((status || '').toLowerCase());
  }

  private stopLoader(loader: string) {
    this.spinnerSvc.stop(loader);
    this.cdr.markForCheck();
  }
}
