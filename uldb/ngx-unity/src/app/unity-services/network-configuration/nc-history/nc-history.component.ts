import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NcHistoryService, NCMHistoryViewData } from './nc-history.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Component({
  selector: 'nc-history',
  templateUrl: './nc-history.component.html',
  styleUrls: ['./nc-history.component.scss'],
  providers: [NcHistoryService]
})
export class NcHistoryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceId: string;
  deviceType: string;
  currentCriteria: SearchCriteria;

  count: number;
  backupHistoryViewData: NCMHistoryViewData[] = [];
  selectedBackupId: string;
  selectedView: NCMHistoryViewData;

  @ViewChild('openConfigDetails') openConfigDetails: ElementRef;
  openConfigDetailsModalRef: BsModalRef;
  selectedConfigDetails: string;
  version: string;
  updatedAt: string;

  @ViewChild('restoreConfigRef') restoreConfigRef: ElementRef;
  restoreConfigModalRef: BsModalRef;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  modalRef: BsModalRef;

  constructor(private ncHistoryService: NcHistoryService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceId');
      this.deviceType = params.get('deviceType');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getHistory();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete()
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getHistory();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getHistory();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getHistory();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start("main");
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getHistory();
  }

  refreshData(pageNo: number) {
    this.spinner.start("main");
    this.currentCriteria.pageNo = pageNo;
    this.getHistory();
  }

  getHistory() {
    this.ncHistoryService.getHistory(this.currentCriteria, this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.backupHistoryViewData = this.ncHistoryService.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get History'));
    });
  }

  openConfig(view: NCMHistoryViewData) {
    if (!view.openConfigEnabled) {
      return;
    }
    this.spinner.start('main');
    this.updatedAt = view.updatedAt;
    this.getConfigDetails(view);
    this.openConfigDetailsModalRef = this.modalService.show(this.openConfigDetails, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  getConfigDetails(view: NCMHistoryViewData) {
    this.ncHistoryService.getConfigDetails(view.backupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedConfigDetails = res.data;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Configuration Details. Please try again'));
    });
  }

  restoreConfig(view: NCMHistoryViewData) {
    if (view.restoreConfigSyncInProgress) {
      return;
    }
    this.selectedBackupId = view.backupId;
    this.restoreConfigModalRef = this.modalService.show(this.restoreConfigRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmRestoreConfig() {
    let selectedIndex = this.backupHistoryViewData.findIndex(h => h.backupId == this.selectedBackupId);
    if (selectedIndex == -1) {
      return;
    }
    // this.spinner.start("main");
    this.restoreConfigModalRef.hide();
    this.backupHistoryViewData[selectedIndex].restoreConfigSyncInProgress = true;
    this.ncHistoryService.restoreConfig(this.selectedBackupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      this.backupHistoryViewData[selectedIndex].restoreConfigSyncInProgress = false;
      // this.restoreConfigModalRef.hide();
      // this.spinner.stop('main');
      this.notification.success(new Notification('Configuration Restored Successfully.'));
    }, (err: HttpErrorResponse) => {
      this.backupHistoryViewData[selectedIndex].restoreConfigSyncInProgress = false;
      // this.restoreConfigModalRef.hide();
      // this.spinner.stop('main');
      this.notification.error(new Notification('Failed to restore configuration.'));
    });
  }

  compareVersion(view: NCMHistoryViewData) {
    if (!view.compareVersionsEnabled) {
      return;
    }
    this.router.navigate([view.backupId, 'compare'], { relativeTo: this.route });
  }

  downloadConfig(view: NCMHistoryViewData) {
    this.spinner.start('main');
    this.ncHistoryService.downloadConfig(view.backupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      let ele = document.getElementById('file-downloader');
      ele.setAttribute('href', this.ncHistoryService.getConfigFile(view.backupId, res.data));
      ele.click();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to download config file. Try again later.'));
    });
  }

  deleteHistory(view: NCMHistoryViewData) {
    this.selectedBackupId = view.backupId;
    this.modalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.ncHistoryService.deleteHistory(this.selectedBackupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.modalRef.hide();
      this.notification.success(new Notification('History deleted successfully.'));
      this.getHistory();
    }, (err: HttpErrorResponse) => {
      this.modalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to delete History. Try again later."));
    })
  }

  goBack() {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }
}
