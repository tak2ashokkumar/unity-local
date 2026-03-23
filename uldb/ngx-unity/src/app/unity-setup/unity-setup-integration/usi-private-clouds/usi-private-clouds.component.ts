import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UsiPrivateCloudsService, VMwareVCenterAccountViewData, VMwareVCenterScheduleHistoryViewData } from './usi-private-clouds.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Component({
  selector: 'usi-private-clouds',
  templateUrl: './usi-private-clouds.component.html',
  styleUrls: ['./usi-private-clouds.component.scss'],
  providers: [UsiPrivateCloudsService]
})
export class UsiPrivateCloudsComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  currentCriteria: SearchCriteria;
  count: number;
  viewData: VMwareVCenterAccountViewData[] = [];
  selectedView: VMwareVCenterAccountViewData;
  isSubmit: boolean = true;
  scheduleHistoryData: VMwareVCenterScheduleHistoryViewData[] = [];

  payloadForm: FormGroup;
  payloadFormErrors: any;
  payloadValidationMessages: any;

  @ViewChild('confirm') confirm: ElementRef;
  deleteModalRef: BsModalRef;
  @ViewChild('payload') payload: ElementRef;
  payloadModalRef: BsModalRef;
  @ViewChild('scheduleHistory') scheduleHistory: ElementRef;
  scheduleHistoryRef: BsModalRef;
  cloudNameForEndpoint: string;
  cloudNameForDisplay: string;
  scheduleHistoryCount: number;
  scheduleHistoryCurrentCriteria: SearchCriteria;
  scheduleHistoryView: VMwareVCenterAccountViewData;

  constructor(private service: UsiPrivateCloudsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.scheduleHistoryCurrentCriteria = {
      sortColumn: '', sortDirection: '', searchQuery: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE
    };
  }

  ngOnInit(): void {
    this.getCloudName();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getCloudName();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getCloudName();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getCloudName();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getCloudName();
  }

  getCloudName() {
    let currentUrl = this.router.url;
    if (currentUrl.includes('vmware-vcenter')) {
      this.cloudNameForEndpoint = 'vcenter';
      this.cloudNameForDisplay = 'VMware Vcenter';
    } else if (currentUrl.includes('unity-vcenter')) {
      this.cloudNameForEndpoint = 'unity-vcenter';
      this.cloudNameForDisplay = 'United Private Cloud Vcenter';
    }
    this.getAccounts();
  }

  onSearchedScheduleHistory(event: string) {
    this.scheduleHistoryCurrentCriteria.searchQuery = event;
    this.scheduleHistoryCurrentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }

  pageChangeScheduleHistory(pageNo: number) {
    this.scheduleHistoryCurrentCriteria.pageNo = pageNo;
    this.getScheduleHistory();
  }

  pageSizeChangeScheduleHistory(pageSize: number) {
    this.scheduleHistoryCurrentCriteria.pageSize = pageSize;
    this.scheduleHistoryCurrentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }

  getAccounts() {
    this.viewData = [];
    this.spinner.start('main');
    this.service.getAccounts(this.currentCriteria, this.cloudNameForEndpoint).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.service.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(`Failed to get ${this.cloudNameForDisplay} accounts.`));
    })
  }

  addAccount() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  editAccount(view: VMwareVCenterAccountViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
  }

  deleteAccount(view: VMwareVCenterAccountViewData) {
    this.selectedView = view;
    this.deleteModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.deleteModalRef.hide();
    this.service.deleteAccount(this.selectedView.uuid, this.cloudNameForEndpoint).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.refreshData(this.currentCriteria.pageNo);
      this.notification.success(new Notification('Account deleted successfully.'));
    }, (err: HttpErrorResponse) => {
      if (this.cloudNameForDisplay == 'VMware Vcenter' || this.cloudNameForDisplay == 'United Private Cloud Vcenter') {
        this.notification.error(new Notification(err.error.detail));
      } else {
        this.notification.error(new Notification('Failed to delete Account. Please try again.'));
      }
    });
  }

  copyKey(value: string, view: VMwareVCenterAccountViewData) {
    if (!view.ingestEvent) {
      return;
    }
    try {
      navigator.clipboard.writeText(value)
        .then(() => {
          this.notification.success(new Notification('Key copied to clipboard.'));
        })
    } catch (err) {
      this.notification.error(new Notification('Failed to copy key. Please try again later.'));
    }
  }

  testPayload(view: VMwareVCenterAccountViewData) {
    if (!view.ingestEvent) {
      return;
    }
    this.selectedView = view;
    this.isSubmit = true;
    this.buildPayloadForm();
    this.payloadModalRef = this.modalService.show(this.payload, Object.assign({}, { class: 'modal-md', keyboard: true, ignoreBackdropClick: true }));
  }

  buildPayloadForm() {
    this.payloadForm = this.service.buildPayloadForm();
    this.payloadFormErrors = this.service.resetPaylodFormErrors();
    this.payloadValidationMessages = this.service.payloadValidationMessages;
  }

  submitPayload() {
    this.isSubmit = false;
    let obj = Object.assign({}, this.payloadForm.getRawValue());
    this.service.getPayloadResponse(obj.payload, this.selectedView.uuid, this.cloudNameForEndpoint)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.payloadForm.get('response').setValue(JSON.stringify(res, null, 2));
      }, (err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get response. Please try again.'));
      });
  }

  syncNow(view: VMwareVCenterAccountViewData) {
    if (view.syncInProgress) {
      return;
    }
    view.syncInProgress = true;
    this.service.syncNow(view.uuid, this.cloudNameForEndpoint).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      view.syncInProgress = false;
      this.getAccounts();
    }, (err: HttpErrorResponse) => {
      view.syncInProgress = false;
    })
  }

  getScheduleHistory(view?: VMwareVCenterAccountViewData) {
    this.spinner.start('main');
    if (view) {
      this.scheduleHistoryView = view;
    }
    this.service.getScheduleHistory(this.scheduleHistoryCurrentCriteria, this.scheduleHistoryView.uuid, this.cloudNameForEndpoint).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.scheduleHistoryCount = res.count;
      this.scheduleHistoryData = this.service.convertToHistoryViewData(res.results);
      this.spinner.stop('main');
      if (view) {
        this.scheduleHistoryRef = this.modalService.show(this.scheduleHistory, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true });
      }
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while getting history. Please try again!!'));
    });
  }

  loadResources(view: VMwareVCenterAccountViewData) {
    this.router.navigate([view.uuid, 'resources'], { relativeTo: this.route });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
