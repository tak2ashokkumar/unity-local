import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import * as moment from 'moment';
import { Color, Label, SingleDataSet } from 'ng2-charts';

import { HttpErrorResponse } from '@angular/common/http';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { cloneDeep as _clone, merge as _merge } from 'lodash-es';
import { takeUntil } from 'rxjs/operators';
import { JiraTicketIssueType, JiraTicketPriorityType, JiraTicketQueueType } from '../../SharedEntityTypes/jira.type';
import { Notification } from '../../app-notification/notification.type';
import { SharedJiraTcktMgmtComponent } from '../shared-jira-tckt-mgmt.component';

export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'DD MMM, YYYY',
  datePickerInput: 'll',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
}

@Component({
  selector: 'jira-tckt-mgmt',
  templateUrl: './jira-tckt-mgmt.component.html',
  styleUrls: ['./jira-tckt-mgmt.component.scss'],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }
  ]
})
export class JiraTcktMgmtComponent extends SharedJiraTcktMgmtComponent implements OnInit {
  issues: JiraTicketIssueType[] = [];
  queues: JiraTicketQueueType[] = [];
  priorities: JiraTicketPriorityType[] = [];
  statusTypes: any[] = [];
  dateChanged: boolean = false;
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

  priorityTicketsChartLabels: Label[] = [];
  priorityTicketsChartColor: Color[] = [{ backgroundColor: [] }];
  priorityTicketsChartData: SingleDataSet;
  priorityTicketsChartOptions: ChartOptions;
  priorityTicketsChartLoading: boolean = false;

  ticketsByStatusChartLabels: Label[] = [];
  ticketsByStatusChartColor: Color[] = [{ backgroundColor: [] }];
  ticketsByStatusChartData: SingleDataSet;
  ticketsByStatusChartOptions: ChartOptions;
  ticketsByStatusChartLoading: boolean = false;

  solvedByResponseChartLabels: Label[] = ['1 Day', '1 Week', '1 Month', '>1 Month'];
  solvedByResponseChartColor: Color[] = [{ backgroundColor: [] }];
  solvedByResponseChartData: SingleDataSet;
  solvedByResponseChartOptions: ChartOptions;
  solvedByResponseChartLoading: boolean = false;

  ngOnInit(): void {
    this.spinnerService.start(this.spinnerName);
    this.getQueues();
    this.getFilterDropdownData();
  }

  getQueues() {
    this.queues = [];
    this.ticketService.getQueues(this.instanceId, this.currentCriteria.params[0]['project_id'], this.currentCriteria.params[0]['serviceDeskId']).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.queues = res;
      this.buildFilterForm(this.queues.length ? this.queues[0].queue_id : null);
      this.updateParams();
      this.getTicketChartsData();
      super.ngOnInit();
      this.spinnerService.stop(this.spinnerName);
    }, (err: HttpErrorResponse) => {
      this.queues = [];
      this.spinnerService.stop(this.spinnerName);
    })
  }

  getFilterDropdownData() {
    this.ticketsByStatusChartLoading = true;
    this.solvedByResponseChartLoading = true;
    this.priorityTicketsChartLoading = true;
    this.issues = [];
    this.statusTypes = [];
    this.priorities = [];
    this.ticketService.getFilterDropdownData(this.instanceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res[0]) {
        this.issues = res[0];
      } else {
        this.issues = [];
        this.notification.error(new Notification("Error while fetching issue types list"));
      }

      if (res[1]) {
        this.statusTypes = _clone(res[1]);
      } else {
        this.statusTypes = [];
        this.notification.error(new Notification("Error while fetching status list"));
      }

      if (res[2]) {
        this.priorities = _clone(res[2]);
      } else {
        this.priorities = [];
        this.notification.error(new Notification("Error while fetching priority list"));
      }
    });
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

  refreshData(pageNo: number) {
    this.refresh(pageNo);
    this.updateGraph();
  }

  setDates() {
    this.filterForm.get('start_date').setValue(this.filterForm.getRawValue()['dateRange'][0].format('YYYY-MM-DD'));
    this.filterForm.get('end_date').setValue(this.filterForm.getRawValue()['dateRange'][1].format('YYYY-MM-DD'));
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
    this.getTicketChartsData();
  }

  private showGraph(arr: number[]): boolean {
    let count = 0;
    arr.map(num => count += num);
    return count > 0 ? true : false;
  }

  private ticketByPriorityUtil(res: any) {
    let arr: number[] = [];
    let colors: string[] = [];
    this.priorityTicketsChartLabels = [];
    this.priorities.forEach(priority => {
      this.priorityTicketsChartLabels.push(priority.name);
      arr.push(res[priority.name] ? res[priority.name] : 0);
    });
    this.priorityTicketsChartColor.getFirst().backgroundColor = this.colorSvc.getRandomColorSet(this.priorities.length);
    if (this.showGraph(arr)) {
      this.priorityTicketsChartData = arr;
      this.priorityTicketsChartOptions = _merge({}, this.defaultChartOptions, { legend: { display: true } });
    } else {
      this.priorityTicketsChartData = null;
      this.priorityTicketsChartOptions = null;
    }
  }

  private ticketByStatusUtil(res: any) {
    let arr: number[] = [];
    this.ticketsByStatusChartLabels = [];
    this.statusTypes.forEach(states => {
      this.ticketsByStatusChartLabels.push(states.name);
      arr.push(res[states.name] ? res[states.name] : 0);
    });
    this.ticketsByStatusChartColor.getFirst().backgroundColor = this.colorSvc.getRandomColorSet(this.statusTypes.length);
    if (this.showGraph(arr)) {
      this.ticketsByStatusChartData = arr;
      this.ticketsByStatusChartOptions = this.defaultChartOptions;
      // this.ticketsByStatusChartOptions = _merge({}, this.defaultChartOptions, { legend: { display: true } });
    } else {
      this.ticketsByStatusChartData = null;
      this.ticketsByStatusChartOptions = null;
    }
  }

  private solvedByResponseUtil(res: any) {
    const arr: number[] = [res.one_day, res.one_week, res.one_month, res.greaterthan_month];
    if (this.showGraph(arr)) {
      this.solvedByResponseChartData = arr;
      this.solvedByResponseChartColor.getFirst().backgroundColor = this.colorSvc.getRandomColorSet(4);
      this.solvedByResponseChartOptions = _merge({}, this.defaultChartOptions, { legend: { display: true } });
    } else {
      this.solvedByResponseChartData = null;
      this.solvedByResponseChartOptions = null;
    }
  }

  private getChartsDataSuccess(res: any) {
    this.priorityTicketsChartLoading = false;
    this.ticketByPriorityUtil(res.by_priority);

    this.ticketsByStatusChartLoading = false;
    this.ticketByStatusUtil(res.by_state);

    this.solvedByResponseChartLoading = false;
    this.solvedByResponseUtil(res.closed_tickets_count_by_response_time);
  }

  private getChartsDataError() {
    this.ticketsByStatusChartLoading = false;
    this.ticketsByStatusChartData = null;

    this.solvedByResponseChartLoading = false;
    this.solvedByResponseChartOptions = null;

    this.priorityTicketsChartLoading = false;
    this.priorityTicketsChartData = null;
  }

  getTicketChartsData() {
    return;
    this.ticketsByStatusChartLoading = true;
    this.solvedByResponseChartLoading = true;
    this.priorityTicketsChartLoading = true;
    this.feedback = this.currentCriteria.params[0]['unity_feedback'] ? true : false;
    this.ticketService.getTicketChartsData(this.instanceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getChartsDataSuccess(res);
    }, err => {
      this.getChartsDataError();
    });
  }

  createTicket() {
    let input = {
      subject: '',
      metadata: '',
      type: null,
      projectId: this.currentCriteria.params[0]['project_id'],
      queueId: this.filterForm.get('queue_id').value
    }
    this.createTicketService.createTicket(input, null, this.instanceId);
  }
}
