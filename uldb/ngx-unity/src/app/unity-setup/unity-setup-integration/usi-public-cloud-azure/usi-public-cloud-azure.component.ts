import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AzureAccountScheduleHistoryViewData, AzureAccountViewData, UsiPublicCloudAzureService } from './usi-public-cloud-azure.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Subject } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { FormGroup } from '@angular/forms';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Component({
  selector: 'usi-public-cloud-azure',
  templateUrl: './usi-public-cloud-azure.component.html',
  styleUrls: ['./usi-public-cloud-azure.component.scss'],
  providers: [UsiPublicCloudAzureService]
})
export class UsiPublicCloudAzureComponent implements OnInit, OnDestroy {
  public tabItems: TabData[] = [{
    name: 'Azure',
    url: '/setup/integration/azure/instances'
  }];

  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number;
  viewData: AzureAccountViewData[] = [];
  selectedView: AzureAccountViewData;

  @ViewChild('confirm') confirm: ElementRef;
  @ViewChild('updateCredentialsRef') updateCredentialsRef: ElementRef;
  updateCredentialsForm: FormGroup;
  updateCredentialsFormErrors: any;
  updateCredentialsFormValidationMessages: any;
  modalRef: BsModalRef;

  @ViewChild('scheduleHistoryRef') scheduleHistoryRef: ElementRef;
  scheduleHistory: AzureAccountScheduleHistoryViewData[] = [];
  scheduleHistoryCount: number;
  scheduleHistoryCurrentCriteria: SearchCriteria;
  scheduleHistoryView: AzureAccountViewData;

  constructor(private svc: UsiPublicCloudAzureService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private storageService: StorageService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.scheduleHistoryCurrentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE
    };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getInstances();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getInstances();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getInstances();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  onSearchedScheduleHistory(event: string) {
    this.scheduleHistoryCurrentCriteria.searchValue = event;
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

  getInstances() {
    this.svc.getInstances(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
    })
  }

  loadResources(view: AzureAccountViewData) {
    this.router.navigate([view.uuid, 'resources'], { relativeTo: this.route });
  }

  add() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  edit(view: AzureAccountViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
  }

  syncNow(view: AzureAccountViewData) {
    if (view.syncInProgress) {
      return;
    }
    view.syncInProgress = true;
    this.svc.syncNow(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      view.syncInProgress = false;
      // this.getAccountDetails();
    }, (err: HttpErrorResponse) => {
      view.syncInProgress = false;
    })
  }

  updateCredentials(view: AzureAccountViewData) {
    this.selectedView = view;
    this.updateCredentialsForm = this.svc.buildUpdateCredentialsForm();
    this.updateCredentialsFormErrors = this.svc.resetUpdateCredentialsFormErrors();
    this.updateCredentialsFormValidationMessages = this.svc.updateCredentialsFormValidationMessages;
    this.modalRef = this.modalService.show(this.updateCredentialsRef, Object.assign({}, { class: '', keyword: false }));
  }

  confirmUpdateCredentials() {
    if (this.updateCredentialsForm.invalid) {
      this.updateCredentialsFormErrors = this.utilService.validateForm(this.updateCredentialsForm, this.updateCredentialsFormValidationMessages, this.updateCredentialsFormErrors);
      this.updateCredentialsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.updateCredentialsFormErrors = this.utilService.validateForm(this.updateCredentialsForm, this.updateCredentialsFormValidationMessages, this.updateCredentialsFormErrors); });
    } else {
      this.spinner.start('main');
      this.svc.updateCredentials(this.selectedView.uuid, this.updateCredentialsForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.modalRef.hide();
        this.notification.success(new Notification('Updated Credentials Successfully'));
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.modalRef.hide();
        this.notification.error(new Notification(err.error));
      });
    }
  }

  deleteInstance(view: AzureAccountViewData) {
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.modalRef.hide();
    this.svc.deleteInstance(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.refreshData(this.currentCriteria.pageNo);
      this.notification.success(new Notification('Instance deleted successfully.'));
    }, err => {
      this.notification.error(new Notification('Failed to delete Instance!! Please try again.'));
    });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  getScheduleHistory(view?: AzureAccountViewData) {
    this.spinner.start('main');
    if (view) {
      this.scheduleHistoryView = view;
    }
    this.svc.getScheduleHistory(this.scheduleHistoryCurrentCriteria, this.scheduleHistoryView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.scheduleHistoryCount = res.count; 
      this.scheduleHistory = this.svc.convertToHistoryViewData(res.results);
      this.spinner.stop('main');
      if(view) {
        this.modalRef = this.modalService.show(this.scheduleHistoryRef, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true });
      }
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while getting history. Please try again!!'));
    });
  }

}