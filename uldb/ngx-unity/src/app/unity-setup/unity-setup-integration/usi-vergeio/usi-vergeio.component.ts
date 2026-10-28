import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { CONFIRM_MODAL_CONFIG } from 'src/app/shared/shared.const';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UsiVergeioService, VergeIOAccountViewData, VergeIODiscoveryViewData } from './usi-vergeio.service';

@Component({
  selector: 'usi-vergeio',
  templateUrl: './usi-vergeio.component.html',
  styleUrls: ['./usi-vergeio.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UsiVergeioService]
})
export class UsiVergeioComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();

  currentCriteria: SearchCriteria;
  count: number;
  viewData: VergeIOAccountViewData[] = [];
  selectedView: VergeIOAccountViewData;

  discoveryView: VergeIOAccountViewData;
  discoveryHistoryData: VergeIODiscoveryViewData[] = [];
  discoveryHistoryCount: number;
  discoveryCriteria: SearchCriteria;
  discoveryRunning: boolean = false;

  @ViewChild('confirm') confirm: TemplateRef<void>;
  deleteModalRef: BsModalRef;
  @ViewChild('discoveryHistory') discoveryHistory: TemplateRef<void>;
  discoveryHistoryRef: BsModalRef;

  constructor(private svc: UsiVergeioService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService,
    private modalSvc: BsModalService,
    private cdr: ChangeDetectorRef) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.discoveryCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.getAccounts();
  }

  ngOnDestroy(): void {
    this.deleteModalRef?.hide();
    this.discoveryHistoryRef?.hide();
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAccounts();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getAccounts();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getAccounts();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getAccounts();
  }

  getAccounts() {
    this.viewData = [];
    this.spinnerSvc.start('main');
    this.svc.getAccounts(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe(res => {
        this.count = res.count;
        this.viewData = this.svc.convertToViewData(res.results);
      }, (err: HttpErrorResponse) => {
        this.notificationSvc.error(new Notification('Failed to get VergeIO accounts.'));
      });
  }

  addAccount() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  editAccount(view: VergeIOAccountViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
  }

  viewDetails(view: VergeIOAccountViewData) {
    this.router.navigate([view.uuid, 'detail'], { relativeTo: this.route });
  }

  syncNow(view: VergeIOAccountViewData) {
    if (view.syncInProgress) {
      return;
    }
    view.syncInProgress = true;
    this.cdr.markForCheck();
    this.svc.syncNow(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: CeleryTask) => {
      view.syncInProgress = false;
      this.notificationSvc.success(new Notification('Sync started for VergeIO account.'));
      this.getAccounts();
    }, (err: HttpErrorResponse) => {
      view.syncInProgress = false;
      this.cdr.markForCheck();
      this.notificationSvc.error(new Notification('Failed to start sync. Please try again.'));
    });
  }

  testConnection(view: VergeIOAccountViewData) {
    if (view.testInProgress) {
      return;
    }
    view.testInProgress = true;
    this.cdr.markForCheck();
    this.svc.checkConnection(view.uuid).pipe(takeUntil(this.ngUnsubscribe), finalize(() => {
      view.testInProgress = false;
      this.cdr.markForCheck();
    })).subscribe(res => {
      if (res && res.connected) {
        this.notificationSvc.success(new Notification(`Connection to ${view.name} successful.`));
      } else {
        this.notificationSvc.error(new Notification(`Connection to ${view.name} failed. Please verify the account details.`));
      }
    }, (err: HttpErrorResponse) => {
      this.notificationSvc.error(new Notification(err?.error?.detail ? err.error.detail : `Connection to ${view.name} failed. Please try again.`));
    });
  }

  toggleEnabled(view: VergeIOAccountViewData) {
    if (view.statusInProgress) {
      return;
    }
    const newValue = !view.enabled;
    view.statusInProgress = true;
    // Deliberately no markForCheck here: leave the switch in its clicked position
    // until the response, then re-sync (revert on failure) in finalize.
    this.svc.toggleEnabled(view.uuid, newValue).pipe(takeUntil(this.ngUnsubscribe), finalize(() => {
      view.statusInProgress = false;
      this.cdr.markForCheck();
    })).subscribe(() => {
      view.enabled = newValue;
      view.enabledIcon = newValue ? 'fa-check-circle text-success' : 'fa-check-circle text-muted';
      this.notificationSvc.success(new Notification(`VergeIO account ${newValue ? 'enabled' : 'disabled'}.`));
    }, (err: HttpErrorResponse) => {
      this.notificationSvc.error(new Notification('Failed to update account status. Please try again.'));
    });
  }

  openDiscoveryHistory(view: VergeIOAccountViewData) {
    this.discoveryView = view;
    this.discoveryCriteria.pageNo = 1;
    this.getDiscoveryHistory(true);
  }

  getDiscoveryHistory(openModal?: boolean) {
    this.spinnerSvc.start('main');
    this.svc.getDiscoveryHistory(this.discoveryView.uuid, this.discoveryCriteria).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe(res => {
        this.discoveryHistoryCount = res.count;
        this.discoveryHistoryData = this.svc.convertToDiscoveryViewData(res.results);
        if (openModal) {
          this.discoveryHistoryRef = this.modalSvc.show(this.discoveryHistory, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true });
        }
      }, (err: HttpErrorResponse) => {
        this.notificationSvc.error(new Notification('Failed to get discovery history. Please try again.'));
      });
  }

  discoveryPageChange(pageNo: number) {
    this.discoveryCriteria.pageNo = pageNo;
    this.getDiscoveryHistory();
  }

  discoveryPageSizeChange(pageSize: number) {
    this.discoveryCriteria.pageSize = pageSize;
    this.discoveryCriteria.pageNo = 1;
    this.getDiscoveryHistory();
  }

  runDiscovery() {
    if (this.discoveryRunning) {
      return;
    }
    this.discoveryRunning = true;
    this.cdr.markForCheck();
    this.svc.runDiscovery(this.discoveryView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.discoveryRunning = false;
      this.notificationSvc.success(new Notification('Discovery started for VergeIO account.'));
      this.getDiscoveryHistory();
    }, (err: HttpErrorResponse) => {
      this.discoveryRunning = false;
      this.cdr.markForCheck();
      this.notificationSvc.error(new Notification('Failed to start discovery. Please try again.'));
    });
  }

  deleteAccount(view: VergeIOAccountViewData) {
    this.selectedView = view;
    this.deleteModalRef = this.modalSvc.show(this.confirm, CONFIRM_MODAL_CONFIG);
  }

  confirmDelete() {
    this.deleteModalRef?.hide();
    this.svc.deleteAccount(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData(this.currentCriteria.pageNo);
      this.notificationSvc.success(new Notification('Account deleted successfully.'));
    }, (err: HttpErrorResponse) => {
      this.notificationSvc.error(new Notification(err?.error?.detail ? err.error.detail : 'Failed to delete account. Please try again.'));
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  trackByUuid(index: number, view: VergeIOAccountViewData): string {
    return view.uuid;
  }

  private stopSpinnerAndMarkForCheck() {
    this.spinnerSvc.stop('main');
    this.cdr.markForCheck();
  }
}
