import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApplicationDiscoveryFailuresService, ApplicationFailureAnalysisViewData, ApplicationFailureEventsViewData, ApplicationFailureLogsViewData } from './application-discovery-failures.service';
import { interval, Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

/**
 * Change format according to need
 */
export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'DD MMM, YYYY hh:mm A',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@Component({
  selector: 'application-discovery-failures',
  templateUrl: './application-discovery-failures.component.html',
  styleUrls: ['./application-discovery-failures.component.scss'],
  providers: [ApplicationDiscoveryFailuresService,
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
  ]
})
export class ApplicationDiscoveryFailuresComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private appId: string;
  eventsCriteria: SearchCriteria;
  logsCriteria: SearchCriteria;
  poll: boolean = false;

  analysisViewData = new ApplicationFailureAnalysisViewData();

  eventsCount: number = 0;
  eventsViewData: ApplicationFailureEventsViewData[] = [];

  logsCount: number = 0;
  logsViewData: ApplicationFailureLogsViewData[] = [];

  constructor(private svc: ApplicationDiscoveryFailuresService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private refreshSvc: DataRefreshBtnService,
    private terminalSvc: FloatingTerminalService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.appId = params.get('appId');
      this.eventsCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'app_id': this.appId }] };
      this.logsCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'app_id': this.appId }] };
    });

    this.refreshSvc.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });

    this.terminalSvc.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.refreshData());
  }

  ngOnInit(): void {
    this.getEvents();
    this.getLogs();
  }

  ngOnDestroy(): void {
    this.spinner.stop(this.analysisViewData.loader);
    this.spinner.stop('failureEventsLoader');
    this.spinner.stop('failureLogsLoader');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.analysisViewData.formData.period = 'last_30_days';
    this.getAnalysisData();
    this.eventsCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'app_id': this.appId }] };
    this.getEvents();
    this.logsCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'app_id': this.appId }] };
    this.getLogs();
  }

  onAnalysisFilterChange(formData: any) {
    this.analysisViewData.formData = formData;
    this.getAnalysisData();
  }

  getAnalysisData() {
    this.spinner.start(this.analysisViewData.loader);
    this.analysisViewData.chartData = null;
    this.svc.getAnalysisData(this.appId, this.analysisViewData.formData.period).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.analysisViewData.chartData = this.svc.convertToAnalysisChartData(data[0].intervals);
      this.spinner.stop(this.analysisViewData.loader);
    }, err => {
      this.spinner.stop(this.analysisViewData.loader);
    });
  }

  onEventsSearched(event: string) {
    this.eventsCriteria.searchValue = event;
    this.eventsCriteria.pageNo = 1;
    this.getEvents();
  }

  eventsPageChange(pageNo: number) {
    this.eventsCriteria.pageNo = pageNo;
    this.getEvents();
  }

  eventsPageSizeChange(pageSize: number) {
    this.eventsCriteria.pageSize = pageSize;
    this.eventsCriteria.pageNo = 1;
    this.getEvents();
  }

  getEvents() {
    this.spinner.start('failureEventsLoader');
    this.svc.getEvents(this.eventsCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<any>) => {
      this.eventsCount = data.count;
      this.eventsViewData = this.svc.convertToEventsViewData(data.results);
      this.spinner.stop('failureEventsLoader');
    }, err => {
      this.eventsViewData = [];
      this.spinner.stop('failureEventsLoader');
    });
  }

  onLogsSearched(event: string) {
    this.logsCriteria.searchValue = event;
    this.logsCriteria.pageNo = 1;
    this.getLogs();
  }

  logsPageChange(pageNo: number) {
    this.logsCriteria.pageNo = pageNo;
    this.getLogs();
  }

  logsPageSizeChange(pageSize: number) {
    this.logsCriteria.pageSize = pageSize;
    this.logsCriteria.pageNo = 1;
    this.getLogs();
  }

  getLogs() {
    this.spinner.start('failureLogsLoader');
    this.svc.getLogs(this.logsCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<any>) => {
      this.logsCount = data.count;
      this.logsViewData = this.svc.convertToLogsViewData(data.results);
      this.spinner.stop('failureLogsLoader');
    }, err => {
      this.logsViewData = [];
      this.spinner.stop('failureLogsLoader');
    });
  }

}
