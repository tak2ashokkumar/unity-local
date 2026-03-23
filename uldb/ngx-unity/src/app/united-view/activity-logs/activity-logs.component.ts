import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Subject, interval } from 'rxjs';
import { takeUntil, tap, switchMap, takeWhile } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { OWL_DATE_TIME_FORMATS, DateTimeAdapter, OWL_DATE_TIME_LOCALE, MomentDateTimeAdapter } from '@busacca/ng-pick-datetime';
import * as moment from 'moment';

import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';

import { ActivityLogViewData, ActivityLogsService, DOWNLOAD_URL } from './activity-logs.service';
import { ActivityLogs } from 'src/app/shared/SharedEntityTypes/activity-logs.type';

import { TabData } from 'src/app/shared/tabdata';
import { tabItems } from './tabs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { environment } from 'src/environments/environment';

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
  selector: 'activity-logs',
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.scss'],
  providers: [ActivityLogsService,
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }
  ],
})

export class ActivityLogsComponent implements OnInit, OnDestroy {
  public tabItems: TabData[] = tabItems;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  logs: ActivityLogViewData[] = [];
  count: number;
  log: ActivityLogViewData;
  modalRef: BsModalRef;
  @ViewChild('loginfo') loginfo: ElementRef;
  poll: boolean = false;

  public logDateRange: Array<string> = [moment().subtract(14, 'd').set({ hour: 0o0, minute: 0o0, second: 0o1 }).format('YYYY-MM-DDTHH:mm:ss'), moment().set({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DDTHH:mm:ss')];
  end_date: string = moment(this.logDateRange[1]).format('YYYY-MM-DDTHH:mm:ss');
  start_date: string = moment(this.logDateRange[0]).format('YYYY-MM-DDTHH:mm:ss');
  downloadUrl: string = DOWNLOAD_URL(this.end_date, this.start_date);
  maxDate: string = moment().format('YYYY-MM-DDTHH:mm:ss');

  constructor(
    private logService: ActivityLogsService,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private termService: FloatingTerminalService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    });
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getlogs());
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getlogs();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  setDates() {
    this.start_date = moment(this.logDateRange[0]).set({ hour: 0o0, minute: 0o0, second: 0o1 }).format('YYYY-MM-DDTHH:mm:ss');
    this.end_date = moment(this.logDateRange[1]).set({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DDTHH:mm:ss');
    this.downloadUrl = DOWNLOAD_URL(this.end_date, this.start_date);
    this.currentCriteria.pageNo = 1;
    this.getlogs();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getlogs();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getlogs();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getlogs();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getlogs();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getlogs();
  }

  getlogs() {
    this.currentCriteria.params = [{ 'start_date': this.start_date, 'end_date': this.end_date }];
    this.logService.getActivityLogs(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<ActivityLogs>) => {
      this.count = data.count;
      this.logs = this.logService.convertToViewData(data.results);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  showInfo(view: ActivityLogViewData) {
    this.log = view;
    this.modalRef = this.modalService.show(this.loginfo, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }
}
