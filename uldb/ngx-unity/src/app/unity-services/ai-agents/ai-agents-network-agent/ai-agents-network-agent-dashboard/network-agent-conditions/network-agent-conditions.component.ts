import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AnalysisLogos, NetworkAgentConditionAlertEventViewData, NetworkAgentConditionAlertsViewData, NetworkAgentConditionsService, NetworkAgentConditionsSummaryViewData, NetworkAgentConditionsViewData, tabData } from './network-agent-conditions.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AimlAlertDetailsService } from 'src/app/shared/aiml-alert-details/aiml-alert-details.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppUtilityService, SERVICE_NOW_TICKET_TYPE, TICKET_MGMT_TYPE } from 'src/app/shared/app-utility/app-utility.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { TabData } from 'src/app/shared/tabdata';
import { FormGroup } from '@angular/forms';
import { AimlConditionDetailsService } from 'src/app/unity-services/aiml-event-mgmt/aiml-condition-details/aiml-condition-details.service';
import { cloneDeep as _clone } from 'lodash-es';
import { HttpErrorResponse } from '@angular/common/http';
import { NetworkAgentConditionDetails } from './network-agent-conditions.type';

@Component({
  selector: 'network-agent-conditions',
  templateUrl: './network-agent-conditions.component.html',
  styleUrls: ['./network-agent-conditions.component.scss'],
  providers: [NetworkAgentConditionsService]
})
export class NetworkAgentConditionsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  conditionsSummaryViewdata: NetworkAgentConditionsSummaryViewData;

  conditionCount: number;
  viewData: NetworkAgentConditionsViewData[] = [];
  selectedConditionIndex: number = 0;
  selectedConditionId: string;
  conditionUuid: string;
  selectedCondition: NetworkAgentConditionDetails;

  acknowledgeForm: FormGroup;
  acknowledgeFormErrors: any;
  acknowledgeFormValidationMessages: any;

  isBlinking = false;
  blinkInterval: any;
  matchedAlert: NetworkAgentConditionAlertsViewData;


  tabItems: TabData[] = tabData;
  tabdetails: string = 'Alerts';

  activitiesCount: number;
  activityCurrentCriteria: SearchCriteria;
  activityVerticalWizardViewData: any;

  alertsCurrentCriteria: SearchCriteria;
  alertsCount: number;
  alerts: NetworkAgentConditionAlertsViewData[] = [];
  view: NetworkAgentConditionAlertsViewData[] = [];
  hoveredIndex: number = -1;
  tooltipDirection: 'top' | 'bottom' = 'top';
  selectedAlert: NetworkAgentConditionAlertsViewData;
  selectedAlertIndex: number;
  @ViewChild('tooltipRef', { static: false }) tooltipElementRef: ElementRef;

  analysisViewData: any;
  analysisLogos = AnalysisLogos;
  downloadUrl: string = '';

  selectedEvent: NetworkAgentConditionAlertEventViewData;
  alertEventsEle: any;
  @ViewChild('alertEventsElem', { static: true }) alertEventsElem: ElementRef;

  constructor(
    private conditionSvc: NetworkAgentConditionsService,
    private conditionDetailSvc: AimlConditionDetailsService,
    private alertDetailSvc: AimlAlertDetailsService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private refreshService: DataRefreshBtnService,
    private route: ActivatedRoute,
    private router: Router,
    private utilService: AppUtilityService,
    public storage: StorageService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.activityCurrentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.alertsCurrentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };

    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getConditions();
    this.getConditionsSummary();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
    }
  }

  refreshData() {
    this.spinner.start('main');
    this.getConditionsSummary();
    this.getConditions();
  }

  onSearched(event: string) {
    this.selectedConditionId = event;
    if (event == '') {
      this.currentCriteria['params'] = [{ search_key: event }];
      this.currentCriteria.pageNo = 1;
    }
    if (this.selectedConditionId) {
      this.currentCriteria['params'] = [{ search_key: this.selectedConditionId }];
      this.currentCriteria.pageNo = 1;
    }
    this.getConditions();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getConditions();
    }
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

  activityPageChange(pageNo: number) {
    if (this.activityCurrentCriteria.pageNo !== pageNo) {
      // this.spinner.start('main');
      this.activityCurrentCriteria.pageNo = pageNo;
      this.getActivities();
    }
  }

  getConditionsSummary() {
    this.conditionSvc.getConditionsSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.conditionsSummaryViewdata = this.conditionSvc.convertToConditionsSummaryViewData(res);
    }, (err) => {
      this.conditionsSummaryViewdata = null;
      this.notification.error(new Notification('Error whlie getting Condition summary'));
    });
  }

  getConditions() {
    this.conditionSvc.getConditions(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.spinner.stop('main');
      this.conditionCount = res.count;
      this.viewData = this.conditionSvc.convertToConditionsViewdata(res.results);
      if (this.selectedConditionId) {
        let index = this.viewData.findIndex((vd) => vd.uuid == this.selectedConditionId);
        this.selectedConditionIndex = (index == -1) ? 0 : index;
      }
      if (this.viewData.length) {
        this.selectCondition(this.selectedConditionIndex);
      }
    }, (err) => {
      this.notification.error(new Notification('Error whlie getting conditions'));
      this.spinner.stop('main');
    });
  }

  selectCondition(i: number, isCondtionOrAlertResolved?: boolean) {
    if (!isCondtionOrAlertResolved) {
      this.alertsCurrentCriteria.pageNo = 1;
      this.activityCurrentCriteria.pageNo = 1;
      this.analysisViewData = null;
      this.tabdetails = 'Alerts';
      this.viewData[i].viewType = this.viewData[this.selectedConditionIndex].viewType;
      this.conditionUuid = this.viewData[i].uuid;
      this.selectedEvent = null;
      this.selectedConditionIndex = i;
    }
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
    }
    // if (this.viewData[i].loaded) {
    //   return;
    // }
    this.spinner.start('main');
    this.selectedCondition = null;
    // this.router.navigate([ this.viewData[i].uuid, 'condition-alerts'], { relativeTo: this.route });
    this.conditionSvc.getConditionDetails(this.viewData[i].uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      // this.viewData[i].loaded = true;
      // this.spinner.stop('main');
      this.selectedCondition = res;
      this.viewData[i].eventCount = res.event_count;
      this.viewData[i].ticketingSystem = res.ticketing_system_type;
      this.viewData[i].accountId = res.account_id;
      this.viewData[i].projectId = res.project_id;
      this.viewData[i].ticketId = res.ticket_id;
      this.viewData[i].ticketType = res.ticket_type;
      this.viewData[i].ticketUuid = res.ticket_uuid;
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
      // this.viewData[i].hostBasedAlerts = this.conditionSvc.convertToHostBasedAlerts(res);
      this.handleTimelineWidth();
      this.blinkInterval = setInterval(() => { this.isBlinking = !this.isBlinking; }, 1000);
      this.matchedAlert = this.viewData[i].alerts.find(alert => alert.id === this.viewData[i].rootCauseAlert);
      this.getAlerts(this.viewData[i].uuid);
      this.getAlertsStack(this.viewData[i].uuid, i);
      this.getActivities();
      this.spinner.stop('main');
    }, (err) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error whlie getting condition details'));
    });
  }

  goToTicketDetails(view: NetworkAgentConditionsViewData) {
    switch (view.ticketingSystem) {
      case TICKET_MGMT_TYPE.CRM:
        if (view.accountId && view.ticketUuid) {
          this.router.navigate(['/support/ticketmgmt', view.accountId, 'dynamics-crm-tickets', view.ticketUuid, 'details']);
        } else {
          if (!view.accountId) {
            this.notification.error(new Notification('CRM account is not linked to UnityOne'));
          } else if (!view.ticketUuid) {
            this.notification.error(new Notification('Ticket not found in linked CRM account'));
          }
        }
        break;
      case TICKET_MGMT_TYPE.SERVICENOW:
        if (view.accountId && view.ticketUuid) {
          if (view.ticketId && (view.ticketType == SERVICE_NOW_TICKET_TYPE.INCIDENT || view.ticketType == SERVICE_NOW_TICKET_TYPE.PROBLEM)) {
            this.storage.put('selectedTicketSysId', view.ticketUuid, StorageType.SESSIONSTORAGE);
            this.router.navigate(['/support/ticketmgmt', view.accountId, 'nowtickets', view.ticketId, 'enhanced-details']);
          } else if (view.ticketType == SERVICE_NOW_TICKET_TYPE.CHANGE_REQUEST) {
            this.router.navigate(['/support/ticketmgmt', view.accountId, 'nowtickets', view.ticketUuid, 'details']);
          }
        } else {
          if (!view.accountId) {
            this.notification.error(new Notification('ServiceNow account is not linked to UnityOne'));
          } else if (!view.ticketUuid) {
            this.notification.error(new Notification('Ticket not found in linked ServiceNow account'));
          }
        }
        break;
      case TICKET_MGMT_TYPE.JIRA:
        if (view.accountId && view.projectId && view.ticketId) {
          this.router.navigate(['/support/ticketmgmt', view.accountId, 'jira', 'projects', view.projectId, view.ticketId, 'details']);
        } else {
          if (!view.accountId) {
            this.notification.error(new Notification('JIRA account is not linked to UnityOne'));
          } else if (!view.projectId) {
            this.notification.error(new Notification('Project not found in linked JIRA account'));
          } else if (!view.ticketId) {
            this.notification.error(new Notification('Ticket not found in linked JIRA account'));
          }
        }
        break;
      default: return;
    }
  }

  createTicket(conditionId: string) {
    this.spinner.start('main');
    this.conditionSvc.createTicket(conditionId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.notification.success(new Notification('Ticket Created Successfully.'));
      this.spinner.stop('main');
      this.viewData[this.selectedConditionIndex].loaded = false;
      this.selectCondition(this.selectedConditionIndex);
    }, (err) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to create a ticket. Please try again later.'));
    });
  }

  conditionAcknowledge() {
    this.acknowledgeForm = this.conditionSvc.buildAcknowledgeForm();
    this.acknowledgeFormErrors = this.conditionSvc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.conditionSvc.acknowledgeFormValidationMessages;
    this.handleAcknowledgementFormSubscriptions();
  }

  handleAcknowledgementFormSubscriptions() {
    this.acknowledgeForm.get('ack_comment').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value && value.length > 512) {
        this.acknowledgeForm.get('ack_comment').setValue(value.slice(0, 512), { emitEvent: false });
      }
    });
  }

  onConditionAcknowledge() {
    if (this.acknowledgeForm.invalid) {
      this.acknowledgeFormErrors = this.utilService.validateForm(this.acknowledgeForm, this.acknowledgeFormValidationMessages, this.acknowledgeFormErrors);
      this.acknowledgeForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.acknowledgeFormErrors = this.utilService.validateForm(this.acknowledgeForm, this.acknowledgeFormValidationMessages, this.acknowledgeFormErrors);
      });
    } else {
      let obj = Object.assign({}, this.acknowledgeForm.getRawValue());
      let selectedConditionIndex = _clone(this.selectedConditionIndex);
      this.onCloseConditionAcknowledge();
      this.viewData[selectedConditionIndex].isAcknowledged = true;
      this.conditionSvc.onConditionAcknowledge(this.viewData[selectedConditionIndex].uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.viewData[selectedConditionIndex].isAcknowledged = res.is_acknowledged;
        this.viewData[selectedConditionIndex].acknowledgedTime = res.acknowledged_time;
        this.viewData[selectedConditionIndex].acknowledgedComment = res.acknowledged_comment;
        this.viewData[selectedConditionIndex].acknowledgedBy = res.acknowledged_by;
        this.viewData[selectedConditionIndex].acknowledgedTooltipMsg = `Ack by: ${res.acknowledged_by}<br>` + `Ack Msg: ${res.acknowledged_comment}<br>` + `Ack at: ${res.acknowledged_time}`;
        this.spinner.stop('main');
      }, err => {
        this.viewData[selectedConditionIndex].isAcknowledged = false;
        this.spinner.stop('main');
        this.notification.error(new Notification('Error while acknowledging an events'));
      });
    }
  }

  onCloseConditionAcknowledge() {
    let element: HTMLElement = document.getElementById('event-severity') as HTMLElement;
    element.click();
    this.acknowledgeForm = null;
    this.acknowledgeFormErrors = this.conditionSvc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.conditionSvc.acknowledgeFormValidationMessages;
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

  switchView(type: string) {
    this.viewData[this.selectedConditionIndex].viewType = type;
    this.handleTimelineWidth();
  }

  viewConditionDetails() {
    this.conditionDetailSvc.showConditionDetails(
      this.viewData[this.selectedConditionIndex].uuid
    );
  }

  isActive(tab: TabData) {
    if (this.tabdetails == tab.name) {
      return 'active text-success';
    }
  }

  goTo(tab: TabData) {
    this.tabdetails = tab.name;
    if (this.tabdetails == 'Alert Stack') {
      this.switchView('timeline');
    }
    else {
      this.switchView('list');
    }
  }

  goToInvestigate() {
    const queryParams: any = {};
    if (this.selectedCondition.conversation_detail.conversation_id) {
      queryParams.conversation_id = this.selectedCondition.conversation_detail.conversation_id;
    }
    if (this.selectedCondition.conversation_detail.title && this.selectedCondition.conversation_detail.title.trim() !== '') {
      queryParams.title = this.selectedCondition.conversation_detail.title;
    }
    return this.router.navigate([`/services/ai-agents/network-agent/conditions/${this.selectedCondition.id}/${this.conditionUuid}/investigate`],
      Object.keys(queryParams).length ? { queryParams } : {}
    );
  }

  getActivities() {
    this.activityVerticalWizardViewData = [];
    this.conditionSvc.getActivityDetails(this.conditionUuid, this.activityCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.activitiesCount = res.count;
      this.activityVerticalWizardViewData = this.conditionSvc.convertToActivityWizardViewData(res.results);
    }, (err) => {
      this.notification.error(new Notification('Error whlie getting Activity details'));
    })
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

  viewAlertDetails(uuid: string) {
    this.alertDetailSvc.showAlertDetails(uuid);
  }

  alertAcknowledge(index: number) {
    this.selectedAlertIndex = index;
    this.acknowledgeForm = this.conditionSvc.buildAcknowledgeForm();
    this.acknowledgeFormErrors = this.conditionSvc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.conditionSvc.acknowledgeFormValidationMessages;
  }

  onAlertAcknowledge() {
    if (this.acknowledgeForm.invalid) {
      this.acknowledgeFormErrors = this.utilService.validateForm(this.acknowledgeForm, this.acknowledgeFormValidationMessages, this.acknowledgeFormErrors);
      this.acknowledgeForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.acknowledgeFormErrors = this.utilService.validateForm(this.acknowledgeForm, this.acknowledgeFormValidationMessages, this.acknowledgeFormErrors);
      });
    } else {
      let obj = Object.assign({}, this.acknowledgeForm.getRawValue());
      let selectedAlertIndex = _clone(this.selectedAlertIndex);
      this.onCloseAlertAcknowledge();
      this.viewData[this.selectedConditionIndex].alerts[selectedAlertIndex].isAcknowledged = true;
      this.conditionSvc.onAlertAcknowledge(this.viewData[this.selectedConditionIndex].alerts[selectedAlertIndex].uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.viewData[this.selectedConditionIndex].alerts[selectedAlertIndex].isAcknowledged = res.is_acknowledged;
        this.viewData[this.selectedConditionIndex].alerts[selectedAlertIndex].acknowledgedTime = res.acknowledged_time;
        this.viewData[this.selectedConditionIndex].alerts[selectedAlertIndex].acknowledgedComment = res.acknowledged_comment;
        this.viewData[this.selectedConditionIndex].alerts[selectedAlertIndex].acknowledgedBy = res.acknowledged_by;
        this.viewData[this.selectedConditionIndex].alerts[selectedAlertIndex].acknowledgedTooltipMsg = `Acknowledged by ${res.acknowledged_by} at ${res.acknowledged_time}`;
        this.spinner.stop('main');
      }, err => {
        this.viewData[this.selectedConditionIndex].alerts[selectedAlertIndex].isAcknowledged = false;
        this.spinner.stop('main');
        this.notification.error(new Notification('Error while acknowledging an events'));
      });
    }
  }

  onCloseAlertAcknowledge() {
    this.selectedAlertIndex = null;
    let element: HTMLElement = document.getElementById('event-severity') as HTMLElement;
    element.click();
    this.acknowledgeForm = null;
    this.acknowledgeFormErrors = this.conditionSvc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.conditionSvc.acknowledgeFormValidationMessages;
  }

  onMouseEnterTooltip(i: number, element: HTMLElement) {
    this.hoveredIndex = i;
    setTimeout(() => {
      const tooltip = this.tooltipElementRef?.nativeElement;
      if (tooltip) {
        const tooltipHeight = tooltip.getBoundingClientRect();
        if (tooltipHeight.height > 150) {
          this.tooltipDirection = 'bottom';
        } else {
          this.tooltipDirection = 'top';
        }
      }
    }, 0);
  }

  resolveAlert(view: NetworkAgentConditionAlertsViewData) {
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

  getConditionRcaAnalysis() {
    this.spinner.start('main');
    this.analysisViewData = null;
    this.conditionSvc.getAnalysisDetails(this.conditionUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.downloadUrl = `customer/aiops/rca_analysis/download/?condition_uuid=${this.conditionUuid}`
      this.analysisViewData = this.conditionSvc.convertToAnalysisData(res);
      this.spinner.stop('main');
    }, (err) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error whlie getting Analysis details'));
    })
  }

  getAlertsStack(conditionId: string, cIndex: number) {
    this.conditionSvc.getAlertsStack(conditionId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.viewData[cIndex].hostBasedAlerts = this.conditionSvc.convertToHostBasedAlerts(this.selectedCondition, res);
    }, (err) => {
      this.notification.error(new Notification('Error whlie fetching Alerts Stack.'));
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
      let totalColumnWidth =
        document.getElementById('condition-events-timeline')?.clientWidth - 32;
      let lengthFor1MS =
        totalColumnWidth /
        this.viewData[this.selectedConditionIndex].totalTimeBetweenEvents;
      this.viewData[this.selectedConditionIndex].hostBasedAlerts.map((host) => {
        host.alerts.map((ev, index) => {
          // if (ev.isFirst) {
          //   host.events[index].severityTimelineLength = 0;
          // } else {
          //   host.events[index].severityTimelineLength = lengthFor1MS * ev.diffBwfirstAndCurrentEventTime;
          // }

          ev.totalTimelineLength = totalColumnWidth;
          host.alerts[index].inActiveTimelineLength =
            lengthFor1MS * ev.diffBwfirstAndCurrentAlertTime;
          if (index == host.alerts.length - 1) {
            host.alerts[index].activeTimelineLength =
              lengthFor1MS * ev.diffBwCurrentAndLastAlertTime;
          } else {
            host.alerts[index].activeTimelineLength =
              lengthFor1MS *
              (ev.diffBwCurrentAndLastAlertTime -
                host.alerts[index + 1].diffBwCurrentAndLastAlertTime);
          }
        });
      });
      this.showConditionEventTimeline = true;
    }, 200);
  }

}