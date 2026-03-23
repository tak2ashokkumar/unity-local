import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoundedTabDataType } from 'src/app/shared/unity-rounded-tab/unity-rounded-tab.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ManageReportSummaryCountDataType } from '../manage-reports/manage-reports.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { ManageReportViewData, ManageReportsNewTempService } from './manage-reports-new-temp.service';

@Component({
  selector: 'manage-reports-new-temp',
  templateUrl: './manage-reports-new-temp.component.html',
  styleUrls: ['./manage-reports-new-temp.component.scss'],
  providers: [ManageReportsNewTempService]
})
export class ManageReportsNewTempComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  tabItems: RoundedTabDataType[] = [
    { name: 'Manage Report', url: '/reports/manage/new-reports' },
    { name: 'Manage Schedule', url: '/reports/manage/schedules' }
  ];
  feature: string;
  manageReportSummaryData: ManageReportSummaryCountDataType;
  viewData: ManageReportViewData[] = [];
  @ViewChild('confirm') confirm: ElementRef;
  @ViewChild('multiconfirm') multiconfirm: ElementRef;

  modalRef: BsModalRef;
  currentCriteria: SearchCriteria;
  reportId: string;
  selectedReportIds: string[] = [];
  selectedAll: boolean = false;
  isSelected: boolean = false;
  constructor(private renderer: Renderer2,
    private router: Router,
    private route: ActivatedRoute,
    private reportSvc: ManageReportsNewTempService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private storageService: StorageService
  ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.ZERO, params: [{ report_type: 'all' }] };
  }

  ngOnInit(): void {
    if (this.storageService.getByKey('feature', StorageType.SESSIONSTORAGE)) {
      this.selectFeautre(this.storageService.getByKey('feature', StorageType.SESSIONSTORAGE));
    } else {
      this.selectFeautre('Cloud Inventory');
    }
    this.getManageReportsCount();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getReports();
  }

  getManageReportsCount() {
    this.spinner.start('main');
    this.reportSvc.getManageReportsCount().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.manageReportSummaryData = res.reports;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching report summary!! Please try again.'));
    });
  }

  selectFeautre(feature: string) {
    this.feature = feature;
    this.storageService.put('feature', this.feature, StorageType.SESSIONSTORAGE);
    this.getReports();
    this.selectedReportIds = [];
    this.selectedAll = false;
    this.isSelected = false;
  }

  getReports() {
    this.spinner.start('main');
    this.reportSvc.getReports(this.feature, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.reportSvc.convertToViewData(res);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching report!! Please try again.'));
    });
  }

  goToCreate() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goToPreview(view: ManageReportViewData) {
    this.router.navigate(['new-reports', this.feature, view.uuid, 'preview'], { relativeTo: this.route.parent });
  }

  goToSchedule() {
    this.router.navigate(['schedules', this.feature, 'create'], { relativeTo: this.route.parent });
  }

  goToEdit(view: ManageReportViewData) {
    this.router.navigate([view.uuid, 'update'], { relativeTo: this.route });
  }

  toggle(view: ManageReportViewData) {
    this.spinner.start('main');
    this.reportSvc.toggle(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.getReports();
      this.getManageReportsCount();
      this.notification.success(new Notification(`Report ${view.toggleTootipMsg}d successfully`));
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification(`Could not ${view.toggleTootipMsg} Report!! Please try again`));
    });
  }

  downloadFile(view: ManageReportViewData) {
    this.spinner.start('main');
    this.reportSvc.download(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      let ele = document.getElementById('file-downloader');
      ele.setAttribute('href', `customer/reports/get_report/?file_name=${res.data}`);
      ele.click();
      this.spinner.stop('main');
      this.notification.success(new Notification('Report downloaded successfully.'));
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to download report. Try again later.'));
    });
  }

  deleteReport(view: ManageReportViewData) {
    this.reportId = view.uuid;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.modalRef.hide();
    this.reportSvc.delete(this.reportId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getReports();
      this.getManageReportsCount();
      this.notification.success(new Notification('Report Deleted successfully'));
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Report could not be Deleted'));
      this.spinner.stop('main');
    });
  }

  selectAll() {
    if (!this.viewData.length) {
      this.selectedAll = false;
      return;
    }
    this.selectedAll = !this.selectedAll;
    if (this.selectedAll) {
      this.viewData.forEach(view => {
        view.isSelected = true;
        this.selectedReportIds.push(view.uuid);
      });
    } else {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedReportIds = [];
    }
  }

  select(view: ManageReportViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedReportIds.splice(this.selectedReportIds.indexOf(view.uuid), 1);
    } else {
      this.selectedReportIds.push(view.uuid);
    }
    this.selectedAll = this.selectedReportIds.length == this.viewData.length;
  }

  multipleDelete() {
    this.modalRef = this.modalService.show(this.multiconfirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmMultipleDelete() {
    this.spinner.start('main');
    this.modalRef.hide();
    this.reportSvc.multipleReportDelete(this.selectedReportIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getReports();
      this.getManageReportsCount();
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedReportIds = [];
      this.selectedAll = false;
      this.notification.success(new Notification('Report Deleted successfully'));
      this.spinner.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedReportIds = [];
      this.selectedAll = false;
      this.notification.error(new Notification('Report could not be Deleted'));
      this.spinner.stop('main');
    });
  }
}