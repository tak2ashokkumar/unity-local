import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { privateCloudTypeList, scheduleTypeList, statusList, UsioVeeamService, VeeamAccountSummaryViewData, VeeamAccountViewData } from './usio-veeam.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';

@Component({
  selector: 'usio-veeam',
  templateUrl: './usio-veeam.component.html',
  styleUrls: ['./usio-veeam.component.scss'],
  providers: [UsioVeeamService]
})
export class UsioVeeamComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  veeamAccountsSummary: VeeamAccountSummaryViewData = new VeeamAccountSummaryViewData();
  count: number;
  viewData: VeeamAccountViewData[] = [];
  selectedView: VeeamAccountViewData;

  @ViewChild('deleteConfirm') deleteConfirm: ElementRef;
  deleteModalRef: BsModalRef;

  privateCloudTypeList: LabelValueType[] = privateCloudTypeList;
  scheduleTypesList: LabelValueType[] = scheduleTypeList;
  statusList: LabelValueType[] = statusList;

  privateCloudTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  privateCloudTypeTexts: IMultiSelectTexts = {
    defaultTitle: 'Private Cloud Type',
  };

  scheduleSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  scheduleTexts: IMultiSelectTexts = {
    defaultTitle: 'Schedule',
  };

  StatusSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  statusTypeTexts: IMultiSelectTexts = {
    defaultTitle: 'Status',
  };

  constructor(private svc: UsioVeeamService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalSvc: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { 'platform_type': [], 'schedule': [], 'status': [] } };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getVeeamAccountsSummary();
    this.getVeeamAccounts();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getVeeamAccounts();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getVeeamAccounts();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getVeeamAccounts();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getVeeamAccounts();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getVeeamAccounts();
  }

  getVeeamAccountsSummary() {
    this.svc.getVeeamAccountsSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.veeamAccountsSummary = this.svc.convertToVeeamAccountsSummary(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Veeam accounts summary. Please try again.'));
    });
  }

  getVeeamAccounts() {
    this.svc.getVeeamAccounts(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Veeam Accounts. Please try again.'));
    });
  }

  goToBackups(view: VeeamAccountViewData) {
    this.selectedView = view;
    this.router.navigate([this.selectedView.veeamId, 'backups'], { relativeTo: this.route });
  }

  syncNow(view: VeeamAccountViewData) {
    if (view.syncInProgress) {
      return;
    }
    view.syncInProgress = true;
    this.svc.syncNow(view.veeamId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      view.syncInProgress = false;
      this.getVeeamAccounts();
    }, (err: HttpErrorResponse) => {
      view.syncInProgress = false;
    })
  }

  webAccessNewTab(view: VeeamAccountViewData) {
    if (!view.proxyUrl) {
      return;
    }
    // this.appService.updateActivityLog(view.deviceType, view.vmId);
    window.open(view.proxyUrl);
  }

  goToaddVeeam() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goToEditVeeam(view: VeeamAccountViewData) {
    this.selectedView = view;
    this.router.navigate([this.selectedView.veeamId, 'edit'], { relativeTo: this.route });
  }

  deleteVeeam(view: VeeamAccountViewData) {
    this.selectedView = view;
    this.deleteModalRef = this.modalSvc.show(this.deleteConfirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.svc.deleteVeeam(this.selectedView.veeamId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deleteModalRef.hide();
      this.getVeeamAccounts();
    }, (err: HttpErrorResponse) => {
      this.deleteModalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to delete veeam account. Please try again."));
    })
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
