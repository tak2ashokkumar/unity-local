import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { MtpTenantsMgmtDetailsActivityLogService, MtpTenantMgmtActivityLogViewData, DOWNLOAD_URL } from './mtp-tenants-mgmt-details-activity-log.service';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { Subject } from 'rxjs';
import moment from 'moment';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'DD MMM, YYYY',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@Component({
  selector: 'mtp-tenants-mgmt-details-activity-log',
  templateUrl: './mtp-tenants-mgmt-details-activity-log.component.html',
  styleUrls: ['./mtp-tenants-mgmt-details-activity-log.component.scss'],
  providers: [MtpTenantsMgmtDetailsActivityLogService
    , { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }
  ],
})
export class MtpTenantsMgmtDetailsActivityLogComponent implements OnInit, OnDestroy {
  @ViewChild('loginInfo') loginInfo: ElementRef;
  private ngUnsubscribe = new Subject();
  modalRef: BsModalRef;
  currentCriteria: SearchCriteria;
  count: number;
  viewData: MtpTenantMgmtActivityLogViewData[] = [];
  log: MtpTenantMgmtActivityLogViewData;
  tenantuuid: string;

  public logDateRange: Array<string> = [moment().subtract(14, 'd').set({ hour: 0o0, minute: 0o0, second: 0o1 }).format('YYYY-MM-DDTHH:mm:ss'), moment().set({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DDTHH:mm:ss')];
  end_date: string = moment(this.logDateRange[1]).format('YYYY-MM-DDTHH:mm:ss');
  start_date: string = moment(this.logDateRange[0]).format('YYYY-MM-DDTHH:mm:ss');
  downloadUrl: string;
  maxDate: string = moment().format('YYYY-MM-DDTHH:mm:ss');
  constructor(private modalService: BsModalService,
    private mtpTenantMgmtActivityLog: MtpTenantsMgmtDetailsActivityLogService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private spinnerService: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.tenantuuid = params.get('tenantId');
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.spinnerService.start('tenant_mtmt_activity_log_widget');
      this.getActivityLog();
    }, 10);
  }

  ngOnDestroy() {
    this.spinnerService.stop('tenant_mtmt_activity_log_widget');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  setDates() {
    this.start_date = moment(this.logDateRange[0]).set({ hour: 0o0, minute: 0o0, second: 0o1 }).format('YYYY-MM-DDTHH:mm:ss');
    this.end_date = moment(this.logDateRange[1]).set({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DDTHH:mm:ss');
    this.downloadUrl = DOWNLOAD_URL(this.tenantuuid, this.end_date, this.start_date);
    this.currentCriteria.pageNo = 1;
    this.getActivityLog();
  }

  onSearched(event: string) {
    this.spinnerService.start('tenant_mtmt_activity_log_widget');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getActivityLog();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('tenant_mtmt_activity_log_widget');
    this.currentCriteria.pageNo = pageNo;
    this.getActivityLog();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('tenant_mtmt_activity_log_widget');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getActivityLog();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('tenant_mtmt_activity_log_widget');
    this.currentCriteria.pageNo = pageNo;
    this.getActivityLog();
  }

  showLoginInfo(view: MtpTenantMgmtActivityLogViewData) {
    this.log = view;
    this.modalRef = this.modalService.show(this.loginInfo, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }))
  }

  getActivityLog() {
    this.currentCriteria.params = [{ 'start_date': this.start_date, 'end_date': this.end_date }];
    this.downloadUrl = DOWNLOAD_URL(this.tenantuuid, this.end_date, this.start_date);
    this.mtpTenantMgmtActivityLog.getActivityLog(this.tenantuuid, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.mtpTenantMgmtActivityLog.convertActivityLogToViewData(res.results);
      this.spinnerService.stop('tenant_mtmt_activity_log_widget');
    }, err => {
      this.notification.error(new Notification('Error while fetching Activity Log!! Please try again.'));
      this.spinnerService.stop('tenant_mtmt_activity_log_widget');
    });
  }

}
