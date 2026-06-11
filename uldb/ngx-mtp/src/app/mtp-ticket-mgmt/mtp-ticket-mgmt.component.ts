import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CRMTenant } from '../shared/SharedEntityTypes/tenants.type';
import { MTPTicketPriorityType, MTPTicketStatusType } from '../shared/SharedEntityTypes/ticket-mgmt.type';
import { AppNotificationService } from '../shared/app-notification/app-notification.service';
import { Notification } from '../shared/app-notification/notification.type';
import { AppSpinnerService } from '../shared/app-spinner/app-spinner.service';
import { DateRange, UnityTimeDuration } from '../shared/app-utility/app-utility.service';
import { UnityChartData } from '../shared/chart-config.service';
import { PAGE_SIZES, SearchCriteria } from '../shared/table-functionality/search-criteria';
import { MTPTicketViewData, MtpTicketMgmtService } from './mtp-ticket-mgmt.service';
import { UserInfoService } from '../shared/user-info.service';
import { cloneDeep as _clone } from 'lodash-es';

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
  selector: 'mtp-ticket-mgmt',
  templateUrl: './mtp-ticket-mgmt.component.html',
  styleUrls: ['./mtp-ticket-mgmt.component.scss'],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
    MtpTicketMgmtService
  ]
})
export class MtpTicketMgmtComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  downloadUrl: string;
  filterForm: FormGroup;
  now: any;
  durationRange = UnityTimeDuration;
  dateRange: DateRange;
  count: number;
  currentCriteria: SearchCriteria;
  tenants: CRMTenant[] = [];
  viewData: MTPTicketViewData[] = [];
  ticketByStatusChartData: UnityChartData;
  ticketByPriorityChartData: UnityChartData;
  ticketByTenantChartData: UnityChartData;
  ticketByresponseTimeChartData: UnityChartData;

  ticketStatusList: MTPTicketStatusType[] = [];
  ticketPriorityList: MTPTicketPriorityType[] = [];
  constructor(private svc: MtpTicketMgmtService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private user: UserInfoService) {
    this.now = moment();
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'search_key': '' }] };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    if (this.user.crmInstanceId) {
      this.buildForm();
      setTimeout(() => {
        this.getTickets(this.user.crmInstanceId);
        this.getChartData(this.user.crmInstanceId);
        this.getDropdownData();
      });
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getTickets(this.user.crmInstanceId);
  }

  onSearched(event: string) {
    this.currentCriteria.params[0].search_key = event;
    this.currentCriteria.pageNo = 1;
    this.getTickets(this.user.crmInstanceId);
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getTickets(this.user.crmInstanceId);
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getTickets(this.user.crmInstanceId);
  }

  refreshData() {
    this.spinner.start('main');
    this.now = moment();
    this.currentCriteria.pageNo = 1;
    if (this.user.crmInstanceId) {
      this.buildForm();
      setTimeout(() => {
        this.getTickets(this.user.crmInstanceId);
        this.getChartData(this.user.crmInstanceId);
        this.getDropdownData();
      })
    }
  }

  getDropdownData() {
    this.tenants = [];
    this.ticketStatusList = [];
    this.ticketPriorityList = [];
    this.svc.getDropdownData(this.user.crmInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ tenants, status, priorities }) => {
      if (tenants) {
        this.tenants = _clone(tenants);
      } else {
        this.tenants = [];
        this.notification.error(new Notification("Error while fetching tenant list"));
      }

      if (status) {
        this.ticketStatusList = _clone(status);
      } else {
        this.ticketStatusList = [];
        this.notification.error(new Notification("Error while fetching status list"));
      }

      if (priorities) {
        this.ticketPriorityList = _clone(priorities);
      } else {
        this.ticketPriorityList = [];
        this.notification.error(new Notification("Error while fetching priorities list"));
      }
    });
  }

  buildForm() {
    this.dateRange = this.svc.getDateRangeByPeriod(this.durationRange.LAST_WEEK);
    this.filterForm = this.svc.buildForm(this.dateRange);

    this.filterForm.get('period').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: UnityTimeDuration) => {
      this.dateRange = this.svc.getDateRangeByPeriod(val);
      if (this.dateRange) {
        this.filterForm.get('from').patchValue(new Date(this.dateRange.from));
        this.filterForm.get('from').disable({ emitEvent: false });
        this.filterForm.get('to').patchValue(new Date(this.dateRange.to));
        this.filterForm.get('to').disable({ emitEvent: false });
      } else {
        this.filterForm.get('from').enable({ emitEvent: false });
        this.filterForm.get('to').enable({ emitEvent: false });
      }
    });
  }

  getTickets(instanceId: string) {
    this.downloadUrl = `/customer/mtp_dynamics_crm/instances/${instanceId}/tickets/download_report/?page=1&page_size=0`;
    this.svc.getTickets(instanceId, this.currentCriteria, this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, err => {
      this.viewData = [];
      this.spinner.stop('main');
    });
  }

  getChartData(instanceId: string) {
    this.spinner.start('tcktmgmt-state-chart');
    this.spinner.start('tcktmgmt-priority-chart');
    this.spinner.start('tcktmgmt-response-sla-chart');
    this.spinner.start('tcktmgmt-resolution-sla-chart');
    this.svc.getChartData(instanceId, this.currentCriteria, this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ticketByStatusChartData = this.svc.convertToTicketsByStatusChartData(res.by_status_reason);
      this.ticketByPriorityChartData = this.svc.convertToTicketsByPriorityChartData(res.by_priority);
      this.ticketByTenantChartData = this.svc.convertToTicketsByTenantData(res.by_tenants);
      this.ticketByresponseTimeChartData = this.svc.convertToOpenTicketsByResponseTimeChartData(res.open_tickets_count_by_response_time);
      this.spinner.stop('tcktmgmt-state-chart');
      this.spinner.stop('tcktmgmt-priority-chart');
      this.spinner.stop('tcktmgmt-response-sla-chart');
      this.spinner.stop('tcktmgmt-resolution-sla-chart');
    }, err => {
      this.ticketByStatusChartData = null;
      this.ticketByPriorityChartData = null;
      this.ticketByTenantChartData = null;
      this.ticketByresponseTimeChartData = null;
      this.spinner.stop('tcktmgmt-state-chart');
      this.spinner.stop('tcktmgmt-priority-chart');
      this.spinner.stop('tcktmgmt-response-sla-chart');
      this.spinner.stop('tcktmgmt-resolution-sla-chart');
    });
  }

  filterTickets() {
    this.currentCriteria.pageNo = 1;
    this.now = moment();
    this.spinner.start('main');
    if (this.user.crmInstanceId) {
      setTimeout(() => {
        this.getTickets(this.user.crmInstanceId);
        this.getChartData(this.user.crmInstanceId);
      })
    }
  }

  downloadReport() {
    if (!this.viewData.length) {
      return;
    }
    this.spinner.start('main');
    this.svc.downloadReport(this.user.crmInstanceId, this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      let ele = document.getElementById('file-downloader');
      ele.setAttribute('href', `customer/mtp_dynamics_crm/instances/${this.user.crmInstanceId}/tickets/get_report/?file_name=${res.data}`);
      ele.click();
      this.spinner.stop('main');
      this.notification.success(new Notification('Report downloaded successfully.'));
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to download report. Try again later.'));
    });
  }

  syncAttributes() {
    this.spinner.start('main');
    this.svc.syncAttributes(this.user.crmInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Sync attributes successfully.'));
      this.getDropdownData();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Sync attributes. Try again later.'));
    })
  }

  goToDetails(view: MTPTicketViewData) {
    this.router.navigate(['ticket', view.ticketId], { relativeTo: this.route });
  }

  createTicket() {
    this.router.navigate(['ticket', 'create'], { relativeTo: this.route })
  }
}

