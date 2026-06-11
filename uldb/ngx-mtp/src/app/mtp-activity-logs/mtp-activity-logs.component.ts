import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AppSpinnerService } from '../shared/app-spinner/app-spinner.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from '../shared/table-functionality/search-criteria';
import { DOWNLOAD_URL, MtpActivityLogsService, mtpDashboardActivityLogViewData } from './mtp-activity-logs.service';
import { takeUntil } from 'rxjs/operators';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import * as moment from 'moment';


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
  selector: 'mtp-activity-logs',
  templateUrl: './mtp-activity-logs.component.html',
  styleUrls: ['./mtp-activity-logs.component.scss'],
  providers: [MtpActivityLogsService,
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }
  ],
})
export class MtpActivityLogsComponent implements OnInit {
  currentCriteria: SearchCriteria;
  count: number;
  log: mtpDashboardActivityLogViewData;
  viewDataActivity: mtpDashboardActivityLogViewData[] = [];
  private ngUnsubscribe = new Subject();

  @ViewChild('loginfo') loginfo: ElementRef;
  modalRef: BsModalRef;


  public logDateRange: Array<string> = [moment().subtract(14, 'd').set({ hour: 0o0, minute: 0o0, second: 0o1 }).format('YYYY-MM-DDTHH:mm:ss'), moment().set({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DDTHH:mm:ss')];
  end_date: string = moment(this.logDateRange[1]).format('YYYY-MM-DDTHH:mm:ss');
  start_date: string = moment(this.logDateRange[0]).format('YYYY-MM-DDTHH:mm:ss');
  downloadUrl: string = DOWNLOAD_URL(this.end_date, this.start_date);
  maxDate: string = moment().format('YYYY-MM-DDTHH:mm:ss');

  constructor(private spinnerService: AppSpinnerService,
    private mtpActivityLogsService: MtpActivityLogsService,
    private modalService: BsModalService,
    private router: Router,
    private route: ActivatedRoute) { 
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getActivityLogData();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getActivityLogData();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getActivityLogData();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getActivityLogData();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getActivityLogData();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getActivityLogData();
  }

  setDates() {
    this.start_date = moment(this.logDateRange[0]).set({ hour: 0o0, minute: 0o0, second: 0o1 }).format('YYYY-MM-DDTHH:mm:ss');
    this.end_date = moment(this.logDateRange[1]).set({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DDTHH:mm:ss');
    this.downloadUrl = DOWNLOAD_URL(this.end_date, this.start_date);
    this.currentCriteria.pageNo = 1;
    console.log('Going to activity log Data from set Dates!!');
    this.getActivityLogData();
  }

  getActivityLogData() {
    console.log(this.start_date+ "   " + this.end_date);
    this.currentCriteria.params = [{ 'start_date': this.start_date, 'end_date': this.end_date }];
    console.log(this.currentCriteria);
    this.mtpActivityLogsService.getActivityLogData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      console.log('Inside activity log function!!');
      this.count = data.count;
      this.viewDataActivity = this.mtpActivityLogsService.convertActivityLogToViewData(data.results);
      console.log(this.viewDataActivity);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  showInfo(view: mtpDashboardActivityLogViewData) {
    this.log = view;
    this.modalRef = this.modalService.show(this.loginfo, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}