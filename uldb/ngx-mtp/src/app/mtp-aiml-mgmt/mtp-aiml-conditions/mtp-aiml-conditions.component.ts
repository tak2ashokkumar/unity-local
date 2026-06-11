import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MTPAIMLSummary } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { MtpAimlAlertDetailsService } from '../mtp-aiml-alert-details/mtp-aiml-alert-details.service';
import { AIMLConditionAlertEventViewData, AIMLConditionAlertsViewData, AIMLConditionsViewData, AIMLHostBasedEventsData, MtpAimlConditionsService } from './mtp-aiml-conditions.service';
import { MtpAimlMgmtService } from '../mtp-aiml-mgmt.service';
import { cloneDeep as _clone } from 'lodash-es';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'mtp-aiml-conditions',
  templateUrl: './mtp-aiml-conditions.component.html',
  styleUrls: ['./mtp-aiml-conditions.component.scss'],
  providers: [MtpAimlConditionsService]
})
export class MtpAimlConditionsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  tenants: string[] = [];

  summaryViewData: MTPAIMLSummary;
  viewData: AIMLConditionsViewData[] = [];
  selectedConditionIndex: number = 0;
  selectedAlert: AIMLConditionAlertsViewData;
  selectedEvent: AIMLConditionAlertEventViewData;
  specificUuid: string;
  count: number;
  view: AIMLConditionAlertsViewData[] = [];

  alerts: AIMLConditionAlertsViewData[] = [];
  alertsCount: number;
  alertsCurrentCriteria: SearchCriteria;

  conditionUuid: string;

  alertEventsEle: any;
  @ViewChild('alertEventsElem', { static: true }) alertEventsElem: ElementRef;
  selectedConditionId: string;

  constructor(private conditionSvc: MtpAimlConditionsService,
    // private conditionDetailSvc: AimlConditionDetailsService,
    private alertDetailSvc: MtpAimlAlertDetailsService,
    private aimlSvc: MtpAimlMgmtService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private renderer: Renderer2,
    private refreshService: DataRefreshBtnService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.alertsCurrentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.selectedConditionId = params.get('id');
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
    this.aimlSvc.filterChangeAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(filterData => {
      this.tenants = filterData.tenants;
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getConditionsSummary();
    this.getConditions();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getConditionsSummary();
    this.getConditions();
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getConditions();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getConditions();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getConditions();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getConditions();
  }

  alertsPageChange(pageNo: number) {
    if (this.alertsCurrentCriteria.pageNo !== pageNo) {
      // this.spinner.start('main');
      this.alertsCurrentCriteria.pageNo = pageNo;
      this.getAlerts(this.conditionUuid);
    }
  }

  severityDonutStyle: SafeStyle = '';
  getConditionsSummary() {
    this.conditionSvc.getConditionsSummary(this.tenants).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.summaryViewData = res;
      let critical = (360 / this.summaryViewData.total.condition_count) * this.summaryViewData.total.critical;
      let warning = (360 / this.summaryViewData.total.condition_count) * this.summaryViewData.total.warning;
      let info = (360 / this.summaryViewData.total.condition_count) * this.summaryViewData.total.information;
      const gradient = `conic-gradient(#cc0000 0deg ${critical}deg, #ff8800 ${critical}deg ${warning}deg, #378ad8 ${warning}deg ${info}deg)`;
      this.severityDonutStyle = this.sanitizer.bypassSecurityTrustStyle(`background: ${gradient}`);
    }, (err) => {
      this.notification.error(new Notification('Error whlie getting alert summary'));
    });
  }

  getConditions() {
    this.conditionSvc.getConditions(this.tenants, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.count = res.count;
      this.viewData = this.conditionSvc.convertToViewdata(res.results);
      if (this.selectedConditionId) {
        let index = this.viewData.findIndex((vd) => vd.uuid == this.selectedConditionId);
        this.selectedConditionIndex = index == -1 ? 0 : index;
      }
      if (this.viewData.length) {
        this.selectCondition(this.selectedConditionIndex);
      }
      this.spinner.stop('main');
    }, (err) => {
      // this.notification.error(new Notification('Error whlie getting conditions'));
      this.spinner.stop('main');
    });
  }

  getAlerts(conditionId: string) {
    this.alerts = [];
    this.conditionSvc.getAlerts(conditionId, this.alertsCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.alertsCount = res.count;
      this.alerts = this.conditionSvc.convertToAlertsViewdata(res.results);
    }, (err) => {
      this.notification.error(new Notification('Error whlie fetching Alerts.'));
    });
  }

  selectCondition(i: number, isCondtionOrAlertResolved?: boolean) {
    if (!isCondtionOrAlertResolved) {
      this.viewData[i].viewType = this.viewData[this.selectedConditionIndex].viewType;
      this.alertsCurrentCriteria.pageNo = 1;
      this.selectedEvent = null;
      this.selectedConditionIndex = i;
      this.conditionUuid = this.viewData[i].uuid;
    }
    this.spinner.start('main');
    this.conditionSvc.getConditionDetails(this.viewData[i].uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.spinner.stop('main');
      this.viewData[i].ticketId = res.ticket_id;
      this.viewData[i].ticketUuid = res.ticket_uuid;
      this.viewData[i].accountId = res.account_id;
      this.viewData[i].eventCount = res.event_count;
      if (isCondtionOrAlertResolved) {
        this.viewData[i].conditionStatus = res.condition_status;
        if (res.condition_status == 'Resolved') {
          this.viewData[i].statusTextColor = 'text-success';
          this.viewData[i].isStatusResolved = true;
          this.viewData[i].resolveBtnTooltipMsg = 'Resolved';
        } else {
          this.viewData[i].statusTextColor = 'text-danger';
          this.viewData[i].isStatusResolved = false;
          this.viewData[i].resolveBtnTooltipMsg = 'Resolve';
        }
      }
      // this.viewData[i].alerts = this.conditionSvc.convertToAlertsViewdata(res.alerts);
      this.viewData[i].hostBasedEvents = this.conditionSvc.convertToHostBasedEvents(res);
      this.getAlerts(this.viewData[i].uuid);
      this.handleTimelineWidth();
    }, (err) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error whlie getting condition details'));
    });
  }

  viewConditionDetails() {
    // this.conditionDetailSvc.showConditionDetails(this.viewData[this.selectedConditionIndex].uuid);
  }

  viewAlertDetails(alertId: string) {
    this.alertDetailSvc.showAlertDetails(alertId);
  }

  switchView(type: string) {
    this.viewData[this.selectedConditionIndex].viewType = type;
    this.handleTimelineWidth();
  }

  viewEventDetails(event: AIMLHostBasedEventsData) {
    this.conditionSvc.getEventDetails(event.eventId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.selectedEvent = this.conditionSvc.convertToEventDetailsViewdata(res); this.handleTimelineWidth();
    }, (err) => {
      this.notification.error(new Notification('Failed to fetch event details. Please try again later.'));
    });
  }

  closeEventDetails() {
    this.selectedEvent = null;
    this.handleTimelineWidth();
  }

  showConditionEventTimeline: boolean = false;
  handleTimelineWidth() {
    if (this.viewData[this.selectedConditionIndex].viewType == 'list') {
      return;
    }
    this.showConditionEventTimeline = false;
    setTimeout(() => {
      let totalColumnWidth = document.getElementById('condition-events-timeline').clientWidth - 32;
      let lengthFor1MS = totalColumnWidth / this.viewData[this.selectedConditionIndex].totalTimeBetweenEvents;
      this.viewData[this.selectedConditionIndex].hostBasedEvents.map((host) => {
        host.events.map((ev, index) => {
          // if (ev.isFirst) {
          //   host.events[index].severityTimelineLength = 0;
          // } else {
          //   host.events[index].severityTimelineLength = lengthFor1MS * ev.diffBwfirstAndCurrentEventTime;
          // }

          ev.totalTimelineLength = totalColumnWidth;
          host.events[index].inActiveTimelineLength = lengthFor1MS * ev.diffBwfirstAndCurrentEventTime;
          if (index == host.events.length - 1) {
            host.events[index].activeTimelineLength = lengthFor1MS * ev.diffBwCurrentAndLastEventTime;
          } else {
            host.events[index].activeTimelineLength = lengthFor1MS * (ev.diffBwCurrentAndLastEventTime - host.events[index + 1].diffBwCurrentAndLastEventTime);
          }
        });
      });
      this.showConditionEventTimeline = true;
    }, 200);
  }

  goToTicketDetails(view: AIMLConditionsViewData) {
    this.router.navigate([`ticketmgmt/ticket/`, view.ticketUuid]);
  }

  updateCondtionDetailsAfterCelerySuccess(i: number) {
    this.conditionSvc.getConditionDetails(this.viewData[i].uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.viewData[i].conditionStatus = res.condition_status;
      if (res.condition_status == 'Resolved') {
        this.viewData[i].statusTextColor = 'text-success';
      } else {
        this.viewData[i].statusTextColor = 'text-danger';
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(`Error whlie getting Condition ID: ${this.viewData[i].id} details`));
    });
  }

  resolveCondtion() {
    let selectedConditionIndex = _clone(this.selectedConditionIndex);
    const selectedCondtionData = _clone(this.viewData[selectedConditionIndex]);
    if (selectedCondtionData.isStatusResolved || selectedCondtionData.resolveInProgress) {
      return;
    }
    this.viewData[selectedConditionIndex].resolveInProgress = true;
    this.conditionSvc.resolveCondition(selectedCondtionData.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      const matchedConditionIndex = this.viewData.findIndex(c => c.uuid === selectedCondtionData.uuid);
      if (matchedConditionIndex !== -1) {
        this.viewData[matchedConditionIndex].resolveInProgress = false;
      }
      if (selectedCondtionData.uuid === this.viewData[this.selectedConditionIndex]?.uuid) {
        this.selectCondition(this.selectedConditionIndex, true);
      } else if (matchedConditionIndex !== -1) {
        this.updateCondtionDetailsAfterCelerySuccess(matchedConditionIndex);
      }
      this.notification.success(new Notification(`Request to resolve Condition ID: ${selectedCondtionData.id} processed successfully`));
    }, (err: HttpErrorResponse) => {
      selectedCondtionData.resolveInProgress = false;
      this.notification.error(new Notification(`Request to resolve Condition ID: ${selectedCondtionData.id} failed. Please try again.`));
      this.spinner.stop('main');
    });
  }

  resolveAlert(view: AIMLConditionAlertsViewData) {
    if (view.isStatusResolved) {
      return;
    }
    const selectedConditionIndex = _clone(this.selectedConditionIndex);
    const selectedCondtionData = _clone(this.viewData[selectedConditionIndex]);
    view.resolveInProgress = true;
    this.conditionSvc.resolveAlert(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      view.resolveInProgress = false;
      const matchedConditionIndex = this.viewData.findIndex(c => c.uuid === selectedCondtionData.uuid);
      if (selectedCondtionData.uuid === this.viewData[this.selectedConditionIndex].uuid) {
        this.selectCondition(this.selectedConditionIndex, true);
      } else if (matchedConditionIndex !== -1) {
        this.updateCondtionDetailsAfterCelerySuccess(matchedConditionIndex);
      }
      this.notification.success(new Notification(`Request to resolve Alert ID: ${view.id} processed successfully`));
    }, (err: HttpErrorResponse) => {
      view.resolveInProgress = false;
      this.spinner.stop('main');
      this.notification.error(new Notification(`Request to resolve Alert ID: ${view.id} failed. Please try again.`));
    });
  }
}
