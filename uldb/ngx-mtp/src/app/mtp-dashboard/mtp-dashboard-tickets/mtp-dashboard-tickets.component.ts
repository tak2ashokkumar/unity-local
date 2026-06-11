import { Component, OnDestroy, OnInit } from '@angular/core';
import { MTPTicketViewData, MtpDashboardTicketsService } from './mtp-dashboard-tickets.service';
import { Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MTPTicket, MTPTicketInstance } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';
import { UnityChartData } from 'src/app/shared/chart-config.service';
import * as moment from 'moment';
import { FormGroup } from '@angular/forms';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { DateRange, UnityTimeDuration } from 'src/app/shared/app-utility/app-utility.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { UserInfoService } from 'src/app/shared/user-info.service';

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
  selector: 'mtp-dashboard-tickets',
  templateUrl: './mtp-dashboard-tickets.component.html',
  styleUrls: ['./mtp-dashboard-tickets.component.scss'],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
    MtpDashboardTicketsService
  ],
})
export class MtpDashboardTicketsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  downloadUrl: string;
  filterForm: FormGroup;
  now: any;
  durationRange = UnityTimeDuration;
  dateRange: DateRange;

  viewData: MTPTicketViewData[] = [];
  ticketByStatusChartData: UnityChartData;
  ticketByPriorityChartData: UnityChartData;
  ticketByTenantChartData: UnityChartData;
  ticketByresponseTimeChartData: UnityChartData;
  constructor(private svc: MtpDashboardTicketsService,
    private router: Router,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private user: UserInfoService) {
    this.now = moment();
  }

  ngOnInit(): void {
    if (this.user.crmInstanceId) {
      this.buildForm();
      setTimeout(() => {
        this.getTickets(this.user.crmInstanceId);
        this.getChartData(this.user.crmInstanceId);
      })
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('dashboard-tickets');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('dashboard-tickets');
    this.now = moment();
    if (this.user.crmInstanceId) {
      this.buildForm();
      setTimeout(() => {
        this.getTickets(this.user.crmInstanceId);
        this.getChartData(this.user.crmInstanceId);
      })
    }
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
    this.svc.getTickets(instanceId, this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('dashboard-tickets');
    }, err => {
      this.viewData = [];
      this.spinner.stop('dashboard-tickets');
    });
  }

  getChartData(instanceId: string) {
    this.spinner.start('dashboard-state-chart');
    this.spinner.start('dashboard-priority-chart');
    this.spinner.start('dashboard-response-sla-chart');
    this.spinner.start('dashboard-resolution-sla-chart');
    this.svc.getChartData(instanceId, this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ticketByStatusChartData = this.svc.convertToTicketsByStatusChartData(res.by_status_reason);
      this.ticketByPriorityChartData = this.svc.convertToTicketsByPriorityChartData(res.by_priority);
      this.ticketByTenantChartData = this.svc.convertToTicketsByTenantData(res.by_tenants);
      this.ticketByresponseTimeChartData = this.svc.convertToOpenTicketsByResponseTimeChartData(res.open_tickets_count_by_response_time);
      this.spinner.stop('dashboard-state-chart');
      this.spinner.stop('dashboard-priority-chart');
      this.spinner.stop('dashboard-response-sla-chart');
      this.spinner.stop('dashboard-resolution-sla-chart');
    }, err => {
      this.ticketByStatusChartData = null;
      this.ticketByPriorityChartData = null;
      this.ticketByTenantChartData = null;
      this.ticketByresponseTimeChartData = null;
      this.spinner.stop('dashboard-state-chart');
      this.spinner.stop('dashboard-priority-chart');
      this.spinner.stop('dashboard-response-sla-chart');
      this.spinner.stop('dashboard-resolution-sla-chart');
    });
  }

  conntacts: any[] = [];
  getContacts(view: MTPTicketViewData) {
    this.svc.getContacts(this.user.crmInstanceId, view.customerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.conntacts = res.value;
      this.spinner.stop('main');
    }, err => {
      this.conntacts = null;
      this.spinner.stop('main');
    });
  }

  onSubmit() {
    this.getChartData(this.user.crmInstanceId);
    this.getTickets(this.user.crmInstanceId);
  }

  downloadReport() {
    if (!this.viewData.length) {
      return;
    }
    this.spinner.start('dashboard-tickets');
    this.svc.downloadReport(this.user.crmInstanceId, this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      console.log('data : ', res);
      let ele = document.getElementById('file-downloader');
      ele.setAttribute('href', `customer/mtp_dynamics_crm/instances/${this.user.crmInstanceId}/tickets/get_report/?file_name=${res.data}`);
      ele.click();
      this.spinner.stop('dashboard-tickets');
      this.notification.success(new Notification('Report downloaded successfully.'));
    }, err => {
      this.spinner.stop('dashboard-tickets');
      this.notification.error(new Notification('Failed to download report. Try again later.'));
    });
  }

  goToTickets() {
    this.router.navigate(['ticketmgmt']);
  }

  goToDetails(view: MTPTicketViewData) {
    this.router.navigate(['ticketmgmt', 'ticket', view.ticketId]);
  }

  assignTicket() {

  }

}
