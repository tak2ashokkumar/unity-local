import { Component, OnInit } from '@angular/core';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { ChartOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { clone as _clone, merge as _merge } from 'lodash-es';
import * as moment from 'moment';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { takeUntil } from 'rxjs/operators';
import { MS_DYNAMICS_TICKET_TYPE } from '../../app-utility/app-utility.service';
import { MSDynamicsTicketGraphByClosedResponseTimeType, MSDynamicsTicketGraphByPriorityType, MSDynamicsTicketGraphByStateType, MSDynamicsTicketGraphType } from '../ms-dynamics-ticket-type';
import { SharedMsDynamicsTcktMgmtComponent } from '../shared-ms-dynamics-tckt-mgmt.component';
import { CRM_TICKET_PRIORITIES, CRM_TICKET_STATES } from '../shared-ms-dynamics-tckt-mgmt.service';
import { DynamicCrmFeedbackTicketPriorityType, DynamicCrmFeedbackTicketStateType, DynamicCrmFeedbackTicketType, DynamicCrmTicketPriorityType, DynamicCrmTicketStateType, DynamicCrmTicketType } from '../../SharedEntityTypes/crm.type';
import { Notification } from '../../app-notification/notification.type';

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
  selector: 'ms-dynamics-tckt-mgmt',
  templateUrl: './ms-dynamics-tckt-mgmt.component.html',
  styleUrls: ['./ms-dynamics-tckt-mgmt.component.scss'],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }
  ],
})
export class MsDynamicsTcktMgmtComponent extends SharedMsDynamicsTcktMgmtComponent implements OnInit {
  dateChanged: boolean = false;
  maxDate: string = moment().format('YYYY-MM-DDTHH:mm:ss');
  ticketTypeOptions = MS_DYNAMICS_TICKET_TYPE;
  ticketType: number;
  states: Array<{ key: string, value: number }> = CRM_TICKET_STATES;
  priorities: Array<{ key: string, value: number }> = CRM_TICKET_PRIORITIES;

  ticketStateList: DynamicCrmTicketStateType[] | DynamicCrmFeedbackTicketStateType[] = [];
  ticketTypeList: DynamicCrmTicketType[] | DynamicCrmFeedbackTicketType[] = [];
  ticketPriorityList: DynamicCrmTicketPriorityType[] | DynamicCrmFeedbackTicketPriorityType[] = [];

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

  ngOnInit() {
    this.feedback = this.currentCriteria.params[0]['unity_feedback'] ? true : false;
    this.getTicketTypes();
    setTimeout(() => {
      if (this.feedback) {
        this.currentCriteria.params[0]['ticket_type'] = this.ticketTypeList.find(type => type.display_name == 'Incident')?.value;
      }
      this.ticketType = _clone(this.currentCriteria.params[0]['ticket_type']);
      this.buildFilterForm(this.feedback);
      this.getDropdownData();
      this.updateParams();
      super.ngOnInit();
      this.getTicketChartsData();
    }, 1400);
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

  getTicketTypes() {
    this.ticketTypeList = [];
    this.ticketService.getTicketTypes(this.instanceId, this.feedback).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ticketTypeList = res;
    });
  }

  getDropdownData() {
    this.ticketStateList = [];
    this.ticketPriorityList = [];
    this.ticketService.getDropdownData(this.instanceId, this.feedback).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ states, priorities }) => {
        if (states) {
          this.ticketStateList = _clone(states);
        } else {
          this.ticketStateList = [];
          this.notification.error(new Notification("Error while fetching state list"));
        }

        if (priorities) {
          this.ticketPriorityList = _clone(priorities);
        } else {
          this.ticketPriorityList = [];
          this.notification.error(new Notification("Error while fetching priorities list"));
        }
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
    this.getTicketChartsData();
  }

  private showGraph(arr: number[]): boolean {
    let count = 0;
    arr.map(num => count += num);
    return count > 0 ? true : false;
  }

  private ticketByPriorityUtil(res: MSDynamicsTicketGraphByPriorityType) {
    let arr: number[] = [];
    let colors: string[] = [];
    this.priorityTicketsChartLabels = [];
    this.priorities.forEach(priority => {
      this.priorityTicketsChartLabels.push(priority.key);
      arr.push(res[priority.key] ? res[priority.key] : 0);
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

  private ticketByStatusUtil(res: MSDynamicsTicketGraphByStateType) {
    let arr: number[] = [];
    this.ticketsByStatusChartLabels = [];
    this.states.forEach(states => {
      this.ticketsByStatusChartLabels.push(states.key);
      arr.push(res[states.key] ? res[states.key] : 0);
    });
    this.ticketsByStatusChartColor.getFirst().backgroundColor = this.colorSvc.getRandomColorSet(this.states.length);
    if (this.showGraph(arr)) {
      this.ticketsByStatusChartData = arr;
      this.ticketsByStatusChartOptions = _merge({}, this.defaultChartOptions, { legend: { display: true } });
    } else {
      this.ticketsByStatusChartData = null;
      this.ticketsByStatusChartOptions = null;
    }
  }

  private solvedByResponseUtil(res: MSDynamicsTicketGraphByClosedResponseTimeType) {
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

  private getChartsDataSuccess(res: MSDynamicsTicketGraphType) {
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
    this.ticketsByStatusChartLoading = true;
    this.solvedByResponseChartLoading = true;
    this.priorityTicketsChartLoading = true;
    this.feedback = this.currentCriteria.params[0]['unity_feedback'] ? true : false;
    this.ticketService.getTicketChartsData(this.instanceId, this.currentCriteria, this.feedback).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getChartsDataSuccess(res);
    }, err => {
      this.getChartsDataError();
    });
  }

  syncAttributes() {
    this.spinnerService.start('main');
    this.ticketService.syncAttributes(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Sync attributes successfully.'));
      this.getTicketTypes();
      this.getDropdownData();
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Failed to Sync attributes. Try again later.'));
    })
  }

  createTicket() {
    this.createTicketService.createTicket({ subject: '', metadata: '', type: this.currentCriteria.params[0]['ticket_type'] }, null, this.instanceId);
  }

}
