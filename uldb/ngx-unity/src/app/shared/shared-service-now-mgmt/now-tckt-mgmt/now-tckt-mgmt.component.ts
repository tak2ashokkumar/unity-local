import { Component, OnInit } from '@angular/core';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { ChartOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { cloneDeep as _clone, merge as _merge } from 'lodash-es';
import * as moment from 'moment';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { takeUntil } from 'rxjs/operators';
import { Notification } from '../../app-notification/notification.type';
import { ServiceNowChoices, ServiceNowClosedTicketsCountByResponseTime, ServiceNowGraphData, ServiceNowTicketsCountByPriority, ServiceNowTicketsCountByStatus } from '../service-now-ticket-type';
import { SharedServiceNowMgmtComponent } from '../shared-service-now-mgmt.component';
import { SERVICE_NOW_TICKET_TYPE } from '../../app-utility/app-utility.service';
import { StorageType } from '../../app-storage/storage-type';
import { ServiceNowTicketViewData } from '../shared-service-now-mgmt.service';

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
  selector: 'now-tckt-mgmt',
  templateUrl: './now-tckt-mgmt.component.html',
  styleUrls: ['./now-tckt-mgmt.component.scss'],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }
  ]
})
export class NowTcktMgmtComponent extends SharedServiceNowMgmtComponent implements OnInit {
  dateChanged: boolean = false;
  ticketTypeOptions = SERVICE_NOW_TICKET_TYPE;
  ticketType: string;
  states: ServiceNowChoices[] = [];
  stateLables: string[] = [];
  priorities: ServiceNowChoices[] = [];
  priorityLables: string[] = [];
  openTicket: ServiceNowTicketsCountByPriority;
  ticketsByStatus: ServiceNowTicketsCountByStatus;
  solvedByResponse: ServiceNowClosedTicketsCountByResponseTime;
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

  ngOnInit() {
    this.ticketType = _clone(this.currentCriteria.params[0]['ticket_type']);
    this.buildFilterForm(this.ticketType);
    this.updateParams();
    super.ngOnInit();
    this.getStatePriorityGraphDataWithForkjoin();
  }

  getReadableTicketType(type: string) {
    return type.split('_').join(" ");
  }

  setDates() {
    this.filterForm.get('start_date').setValue(this.filterForm.getRawValue()['dateRange'][0].format('YYYY-MM-DD'));
    this.filterForm.get('end_date').setValue(this.filterForm.getRawValue()['dateRange'][1].format('YYYY-MM-DD'));
  }

  updateParams() {
    this.setDates();
    let obj = Object.assign({}, this.filterForm.getRawValue());
    if (obj.state && obj.state != '') {
      let states = this.states.filter(st => st.label == obj.state);
      obj.state = states.map(st => st.value).filter((value, index, self) => self.indexOf(value) === index);
    }
    if (obj.priority && obj.priority != '') {
      let priorities = this.priorities.filter(pt => pt.label == obj.priority);
      obj.priority = priorities.map(pt => pt.value).filter((value, index, self) => self.indexOf(value) === index)
    }
    this.currentCriteria.params[0] = _merge(this.currentCriteria.params[0], obj);
    this.currentCriteria.params[0]['dateRange'] = '';
    this.currentCriteria.pageNo = 1;
  }

  filterTickets() {
    this.updateParams();
    this.getFilteredTickets();
    this.updateGraph();
  }

  onDateChanged() {
    this.dateChanged = true;
  }

  updateGraph() {
    setTimeout(() => {
      if (!this.dateChanged) {
        return;
      }
      this.dateChanged = false;
      this.drawGraph();
    })
  }

  drawGraph() {
    this.getTicketsGraphData();
  }

  private showGraph(arr: number[]): boolean {
    let count = 0;
    arr.map(num => count += num);
    return count > 0 ? true : false;
  }

  private ticketByPriorityUtil(res: ServiceNowTicketsCountByPriority) {
    let arr: number[] = [];
    let colors: string[] = [];
    this.priorityTicketsChartLabels = [];
    this.priorityLables.forEach(label => {
      this.priorityTicketsChartLabels.push(label);
      arr.push(res[label] ? res[label] : 0);
    });
    this.priorityTicketsChartColor.getFirst().backgroundColor = this.colorSvc.getRandomColorSet(this.priorityLables.length);
    if (this.showGraph(arr)) {
      this.priorityTicketsChartData = arr;
      this.priorityTicketsChartOptions = _merge({}, this.defaultChartOptions, { legend: { display: true } });
    } else {
      this.priorityTicketsChartData = null;
      this.priorityTicketsChartOptions = null;
    }
  }

  private ticketByStatusUtil(res: ServiceNowTicketsCountByStatus) {
    let arr: number[] = [];
    this.ticketsByStatusChartLabels = [];
    this.stateLables.forEach(label => {
      this.ticketsByStatusChartLabels.push(label);
      arr.push(res[label] ? res[label] : 0);
    });
    this.ticketsByStatusChartColor.getFirst().backgroundColor = this.colorSvc.getRandomColorSet(this.stateLables.length);
    if (this.showGraph(arr)) {
      this.ticketsByStatusChartData = arr;
      this.ticketsByStatusChartOptions = _merge({}, this.defaultChartOptions, { legend: { display: true } });
    } else {
      this.ticketsByStatusChartData = null;
      this.ticketsByStatusChartOptions = null;
    }
  }

  private solvedByResponseUtil(res: ServiceNowClosedTicketsCountByResponseTime) {
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

  private getGraphDataSuccess(res: ServiceNowGraphData) {
    this.ticketsByStatusChartLoading = false;
    this.ticketByStatusUtil(res.by_state);

    this.solvedByResponseChartLoading = false;
    this.solvedByResponseUtil(res.closed_tickets_count_by_response_time);

    this.priorityTicketsChartLoading = false;
    this.ticketByPriorityUtil(res.by_priority);
  }

  private getGraphDataError() {
    this.ticketsByStatusChartLoading = false;
    this.ticketsByStatusChartData = null;

    this.solvedByResponseChartLoading = false;
    this.solvedByResponseChartOptions = null;

    this.priorityTicketsChartLoading = false;
    this.priorityTicketsChartData = null;
  }

  getTicketsGraphData() {
    this.ticketService.getTicketsGraphData(this.instanceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getGraphDataSuccess(res);
    }, err => {
      this.getGraphDataError();
    });
  }

  getStatePriorityGraphDataWithForkjoin() {
    this.ticketsByStatusChartLoading = true;
    this.solvedByResponseChartLoading = true;
    this.priorityTicketsChartLoading = true;
    this.ticketService.getStatePriorityGraphDataWithForkjoin(this.instanceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res[0]) {
        this.states = _clone(res[0]);
        this.stateLables = res[0].map(item => item.label).filter((value, index, self) => self.indexOf(value) === index);
      } else {
        this.notification.error(new Notification("Error while fetching state list"));
      }

      if (res[1]) {
        this.priorities = res[1];
        this.priorityLables = res[1].map(item => item.label).filter((value, index, self) => self.indexOf(value) === index);
      } else {
        this.notification.error(new Notification("Error while fetching priority list"));
      }

      if (res[2]) {
        this.getGraphDataSuccess(res[2]);
      } else {
        this.getGraphDataError();
      }
    });
  }

  goToDetails(view: ServiceNowTicketViewData) {
    if (view.isEnhanceDetailsPage) {
      this.storage.put('selectedTicketSysId', view.sysId, StorageType.SESSIONSTORAGE);
    }
    this.router.navigateByUrl(view.detailsUrl);
  }

  createTicket() {
    this.createTicketService.createTicket({ subject: '', metadata: '', type: this.currentCriteria.params[0]['ticket_type'] }, null, this.instanceId);
  }

}
