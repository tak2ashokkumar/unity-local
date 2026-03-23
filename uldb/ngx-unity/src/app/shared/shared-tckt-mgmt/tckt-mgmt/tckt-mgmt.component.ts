import { Component, OnInit } from '@angular/core';
import { SharedTcktMgmtComponent } from '../shared-tckt-mgmt.component';
import { merge as _merge, cloneDeep as _clone } from 'lodash-es';
import { DateTimeAdapter, OWL_DATE_TIME_LOCALE, OWL_DATE_TIME_FORMATS, MomentDateTimeAdapter } from '@busacca/ng-pick-datetime';
import * as moment from 'moment';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { ChartOptions, ChartType } from 'chart.js';

import { takeUntil } from 'rxjs/operators';
import { TicketsCountByStatus, ClosedTicketsCountByResponseTime } from '../ticket-graph-data.type';
import { Color, Label, SingleDataSet } from 'ng2-charts';

export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'DD MMM, YYYY',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
}

@Component({
  selector: 'tckt-mgmt',
  templateUrl: './tckt-mgmt.component.html',
  styleUrls: ['./tckt-mgmt.component.scss'],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }
  ],
})
export class TcktMgmtComponent extends SharedTcktMgmtComponent implements OnInit {
  dateChanged: boolean = false;
  openTicket: OpenTicketsCount;
  ticketsByStatus: TicketsCountByStatus;
  solvedByResponse: ClosedTicketsCountByResponseTime;
  maxDate: string = moment().format('YYYY-MM-DDTHH:mm:ss');

  defaultChartType: ChartType = 'doughnut';
  defaultChartPlugins = [pluginDataLabels];
  private defaultChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: 1.0 * Math.PI,
    legend: {
      fullWidth: false,
      labels: {
        boxWidth: 10
      },
      display: false,
      position: 'bottom'
    },
    cutoutPercentage: 65,
    circumference: 2 * Math.PI,
    animation: {
      animateScale: true,
      animateRotate: true
    },
    plugins: {
      datalabels: {
        color: '#FFF',
        font: {
          size: 12,
        },
        display: (context) => {
          return context.dataset.data[context.dataIndex] ? true : false;
        }
      },
      outlabels: {
        display: false
      }
    }
  };

  openTicketsChartLabels: Label[] = ['Urgent', 'High', 'Normal', 'Low'];
  openTicketsChartColor: Color[] = [{ backgroundColor: ['#f86c6b', '#f8cb00', '#0cbb70', '#acb4bc'] }];
  openTicketsChartData: SingleDataSet;
  openTicketsChartOptions: ChartOptions;
  openTicketsChartLoading: boolean = false;

  ticketsByStatusChartLabels: Label[] = ['Open', 'Pending', 'Solved', 'Closed'];
  ticketsByStatusChartColor: Color[] = [{ backgroundColor: ['#f86c6b', '#f8cb00', '#0cbb70', '#acb4bc'] }];
  ticketsByStatusChartData: SingleDataSet;
  ticketsByStatusChartOptions: ChartOptions;
  ticketsByStatusChartLoading: boolean = false;

  solvedByResponseChartLabels: Label[] = ['1 Day', '1 Week', '1 Month', '>1 Month'];
  solvedByResponseChartColor: Color[] = [{ backgroundColor: ['#3F9435', '#0cbb70', '#f8cb00', '#f86c6b'] }];
  solvedByResponseChartData: SingleDataSet;
  solvedByResponseChartOptions: ChartOptions;
  solvedByResponseChartLoading: boolean = false;

  createButtonDisabled: boolean;
  createButtonTooltipMessage: string = '';

  ngOnInit() {
    this.checkUserInZendesk();
    this.buildFilterForm();
    this.updateParams();
    this.drawGraph();
    super.ngOnInit();
  }

  updateParams() {
    this.setDates();
    this.currentCriteria.params[0] = _merge(this.currentCriteria.params[0], this.filterForm.getRawValue());
    this.currentCriteria.params[0]['dateRange'] = '';
    this.currentCriteria.pageNo = 1;
  }

  filterTickets() {
    this.updateParams();
    this.getFilteredTickets();
    this.updateGraph();
  }

  formatToUTC(date: string) {
    return moment.tz(date, this.userInfo.userTimeZoneAbbr).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
  }

  setDates() {
    this.filterForm.get('start_date').setValue(this.formatToUTC(moment(this.filterForm.getRawValue()['dateRange'][0]).format('YYYY-MM-DD')));
    this.filterForm.get('end_date').setValue(this.formatToUTC(moment(this.filterForm.getRawValue()['dateRange'][1]).set({ hour: 23, minute: 59, second: 59, millisecond: 0 }).format('YYYY-MM-DD HH:mm:ss')));
  }

  checkUserInZendesk() {
    this.ticketService.checkUserInZendesk().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.status == 'success') {
        this.createButtonDisabled = false;
      } else {
        this.createButtonDisabled = true;
        this.createButtonTooltipMessage = res.status_message;
      }
    }, err => {

    });
  }

  onDateChanged() {
    this.dateChanged = true;
  }

  updateGraph() {
    if (!this.dateChanged) {
      return;
    }
    this.dateChanged = false;
    this.drawGraph();
  }

  drawGraph() {
    this.getOpenTicketsCount();
    this.getTicketsGraphData();
  }

  private showGraph(arr: number[]): boolean {
    let count = 0;
    arr.map(num => count += num);
    return count > 0 ? true : false;
  }

  private openTicketUtil(res: OpenTicketsCount) {
    const arr: number[] = [res.urgent, res.high, res.normal, res.low];
    if (this.showGraph(arr)) {
      this.openTicketsChartData = arr;
      this.openTicketsChartOptions = _merge({}, this.defaultChartOptions, { legend: { display: true } });
    } else {
      this.openTicketsChartData = null;
      this.openTicketsChartOptions = null;
    }
  }

  getOpenTicketsCount() {
    this.openTicketsChartLoading = true;
    this.ticketService.getOpenTicketsCount(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.openTicketsChartLoading = false;
      this.openTicketUtil(res);
    }, err => {
      this.openTicketsChartLoading = false;
      this.openTicketsChartData = null;
    });
  }

  private ticketByStatusUtil(res: TicketsCountByStatus) {
    const arr: number[] = [res.open, res.pending, res.solved, res.closed];
    if (this.showGraph(arr)) {
      this.ticketsByStatusChartData = arr;
      this.ticketsByStatusChartOptions = _merge({}, this.defaultChartOptions, { legend: { display: true } });
    } else {
      this.ticketsByStatusChartData = null;
      this.ticketsByStatusChartOptions = null;
    }
  }

  private solvedByResponseUtil(res: ClosedTicketsCountByResponseTime) {
    const arr: number[] = [res.one_day, res.one_week, res.one_month, res.greaterthan_month];
    if (this.showGraph(arr)) {
      this.solvedByResponseChartData = arr;
      this.solvedByResponseChartOptions = _merge({}, this.defaultChartOptions, { legend: { display: true } });
    } else {
      this.solvedByResponseChartData = null;
      this.solvedByResponseChartOptions = null;
    }
  }

  getTicketsGraphData() {
    this.ticketsByStatusChartLoading = true;
    this.solvedByResponseChartLoading = true;
    this.ticketService.getTicketsGraphData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ticketsByStatusChartLoading = false;
      this.ticketByStatusUtil(res.result.tickets_count_by_status);
      this.solvedByResponseChartLoading = false;
      this.solvedByResponseUtil(res.result.closed_tickets_count_by_response_time);
    }, err => {
      this.ticketsByStatusChartLoading = false;
      this.ticketsByStatusChartData = null;

      this.solvedByResponseChartLoading = false;
      this.solvedByResponseChartOptions = null;
    });
  }

  isFeedback() {
    return this.currentCriteria.params[0]['unity_feedback'] ? true : false;
  }

  hideCreateForAllTickets() {
    return this.currentCriteria.params[0]['ticket_type'];
  }

  goTo(ticketId: string) {
    this.router.navigate([ticketId, 'details'], { relativeTo: this.route });
  }

  createTicket() {
    this.createTicketService.createTicket({ subject: '', metadata: '', type: this.currentCriteria.params[0]['ticket_type'], feedback: this.isFeedback() }, null, this.instanceId);
  }
}