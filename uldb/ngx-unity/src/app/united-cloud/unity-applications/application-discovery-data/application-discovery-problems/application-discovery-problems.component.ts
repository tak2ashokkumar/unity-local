import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { interval, Subject, Subscription } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AimlAlertDetailsService } from 'src/app/shared/aiml-alert-details/aiml-alert-details.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, SERVICE_NOW_TICKET_TYPE, TICKET_MGMT_TYPE } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { ApplicationProblemSummaryType } from 'src/app/shared/SharedEntityTypes/application.type';
import { ApplicationNetworkTopology } from 'src/app/shared/SharedEntityTypes/unity-application-topology.type';
import { TabData } from 'src/app/shared/tabdata';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { AIMLConditionAlertEventViewData, AIRemediationViewData, AppDataType, ApplicationDiscoveryProblemsService, ProblemConditionAlertsViewData, ProblemConditionsViewData, RecommendedWorkflowFromUnityAIViewData } from './application-discovery-problems.service';


@Component({
  selector: 'application-discovery-problems',
  templateUrl: './application-discovery-problems.component.html',
  styleUrls: ['./application-discovery-problems.component.scss'],
  providers: [ApplicationDiscoveryProblemsService]
})
export class ApplicationDiscoveryProblemsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  appId: string;
  appData: AppDataType;
  currentCriteria: SearchCriteria;
  poll: boolean = false;
  tabdetails: string = 'Alerts';

  summaryViewData: ApplicationProblemSummaryType;
  conditionCount: number;
  conditionsViewData: any[] = [];
  selectedCondition: any;
  selectedConditionIndex: number = 0;
  selectedConditionId: string;
  conditionUuid: string;

  tabItems: TabData[] = tabData;

  activityCriteria: SearchCriteria;
  activitiesCount: number;
  activityVerticalWizardViewData: any;

  alertsCriteria: SearchCriteria;
  alertsCount: number;
  alerts: ProblemConditionAlertsViewData[] = [];
  view: ProblemConditionAlertsViewData[] = [];
  selectedAlert: ProblemConditionAlertsViewData;
  selectedAlertIndex: number;
  matchedAlert: ProblemConditionAlertsViewData;
  hoveredIndex: number = -1;
  tooltipDirection: 'top' | 'bottom' = 'top';
  selectedEvent: AIMLConditionAlertEventViewData;
  alertEventsEle: any;
  @ViewChild('alertEventsElem', { static: true }) alertEventsElem: ElementRef;
  @ViewChild('tooltipRef', { static: false }) tooltipElementRef: ElementRef;

  aiAnalysisViewData: any;
  analysisLogos = AnalysisLogos;
  downloadUrl: string = '';

  aiRemediationViewData: AIRemediationViewData;

  acknowledgeForm: FormGroup;
  acknowledgeFormErrors: any;
  acknowledgeFormValidationMessages: any;

  isBlinking = false;
  blinkInterval: any;

  subscr: Subscription;

  impactView: 'topology' | 'impact' = 'topology';

  constructor(private svc: ApplicationDiscoveryProblemsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private terminalSvc: FloatingTerminalService,
    private alertDetailSvc: AimlAlertDetailsService,
    private utilService: AppUtilityService,
    public storage: StorageService,
    private refreshSvc: DataRefreshBtnService,) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.appId = params.get('appId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'app_id': this.appId }] };
      this.alertsCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'app_id': this.appId }] };
      this.activityCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'app_id': this.appId }] };
    });

    this.refreshSvc.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });

    this.terminalSvc.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.refreshData());
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.appData = <AppDataType>this.storage.getByKey('app-data', StorageType.SESSIONSTORAGE);
    this.getConditionsSummary();
    this.getConditions();
  }

  ngOnDestroy(): void {
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

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
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
      this.currentCriteria.pageNo = 0;
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
    if (this.alertsCriteria.pageNo !== pageNo) {
      // this.spinner.start('main');
      this.alertsCriteria.pageNo = pageNo;
      this.getAlerts(this.conditionUuid);
    }
  }

  activityPageChange(pageNo: number) {
    if (this.activityCriteria.pageNo !== pageNo) {
      // this.spinner.start('main');
      this.activityCriteria.pageNo = pageNo;
      this.getActivities();
    }
  }

  getConditionsSummary() {
    this.svc.getSummary(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.summaryViewData = res;
    }, (err) => {
      this.summaryViewData = null;
      this.notification.error(new Notification('Error whlie getting problem summary'));
    });
  }

  getConditions() {
    this.svc.getConditions(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.conditionCount = res.count;
      this.conditionsViewData = this.svc.convertToViewdata(res.results);
      if (this.selectedConditionId) {
        let index = this.conditionsViewData.findIndex((vd) => vd.uuid == this.selectedConditionId);
        this.selectedConditionIndex = (index == -1) ? 0 : index;
      }
      if (this.conditionsViewData.length) {
        this.selectCondition(this.selectedConditionIndex);
      }
      this.spinner.stop('main');
    }, (err) => {
      this.notification.error(new Notification('Error whlie getting conditions'));
      this.spinner.stop('main');
    });
  }

  selectCondition(i: number, isCondtionOrAlertResolved?: boolean) {
    if (!isCondtionOrAlertResolved) {
      this.alertsCriteria.pageNo = 1;
      this.activityCriteria.pageNo = 1;
      this.aiAnalysisViewData = null;
      this.tabdetails = 'Alerts';
      this.conditionsViewData[i].viewType = this.conditionsViewData[this.selectedConditionIndex].viewType;
      this.conditionUuid = this.conditionsViewData[i].uuid;
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
    this.svc.getConditionDetails(this.conditionsViewData[i].uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      // this.viewData[i].loaded = true;
      // this.spinner.stop('main');
      this.selectedCondition = res;
      this.conditionsViewData[i].eventCount = res.event_count;
      this.conditionsViewData[i].ticketingSystem = res.ticketing_system_type;
      this.conditionsViewData[i].accountId = res.account_id;
      this.conditionsViewData[i].projectId = res.project_id;
      this.conditionsViewData[i].ticketId = res.ticket_id;
      this.conditionsViewData[i].ticketType = res.ticket_type;
      this.conditionsViewData[i].ticketUuid = res.ticket_uuid;
      if (isCondtionOrAlertResolved) {
        this.conditionsViewData[i].conditionStatus = res.condition_status;
        if (res.condition_status == 'Resolved') {
          this.conditionsViewData[i].statusTextColor = 'text-success';
          this.conditionsViewData[i].isStatusResolved = true;
          this.conditionsViewData[i].resolveBtnTooltipMsg = 'Resolved';
        } else {
          this.conditionsViewData[i].statusTextColor = 'text-danger';
          this.conditionsViewData[i].isStatusResolved = false;
          this.conditionsViewData[i].resolveBtnTooltipMsg = 'Resolve';
        }
      }
      // this.viewData[i].alerts = this.conditionSvc.convertToAlertsViewdata(res.alerts);
      // this.viewData[i].hostBasedAlerts = this.conditionSvc.convertToHostBasedAlerts(res);
      this.handleTimelineWidth();
      this.blinkInterval = setInterval(() => { this.isBlinking = !this.isBlinking; }, 1000);
      this.matchedAlert = this.conditionsViewData[i].alerts.find(alert => alert.id === this.conditionsViewData[i].rootCauseAlert);
      this.getAlerts(this.conditionsViewData[i].uuid);
      this.getAlertsStack(this.conditionsViewData[i].uuid, i);
      this.getActivities();
      this.getImapctAnalysisData();
      this.spinner.stop('main');
    }, (err) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error whlie getting condition details'));
    });
  }

  showConditionEventTimeline: boolean = false;
  handleTimelineWidth() {
    if (this.conditionsViewData[this.selectedConditionIndex].viewType == 'list') {
      return;
    }
    this.showConditionEventTimeline = false;
    setTimeout(() => {
      let totalColumnWidth =
        document.getElementById('condition-events-timeline')?.clientWidth - 32;
      let lengthFor1MS =
        totalColumnWidth /
        this.conditionsViewData[this.selectedConditionIndex].totalTimeBetweenEvents;
      this.conditionsViewData[this.selectedConditionIndex].hostBasedAlerts.map((host) => {
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

  conditionAcknowledge() {
    this.acknowledgeForm = this.svc.buildAcknowledgeForm();
    this.acknowledgeFormErrors = this.svc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.svc.acknowledgeFormValidationMessages;
    this.handleAcknowledgementFormSubscriptions();
  }

  handleAcknowledgementFormSubscriptions() {
    this.acknowledgeForm.get('ack_comment').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value && value.length > 512) {
        this.acknowledgeForm.get('ack_comment').setValue(value.slice(0, 512), { emitEvent: false });
      }
    });
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
      this.conditionsViewData[selectedConditionIndex].isAcknowledged = true;
      this.svc.onConditionAcknowledge(this.conditionsViewData[selectedConditionIndex].uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.conditionsViewData[selectedConditionIndex].isAcknowledged = res.is_acknowledged;
        this.conditionsViewData[selectedConditionIndex].acknowledgedTime = res.acknowledged_time;
        this.conditionsViewData[selectedConditionIndex].acknowledgedComment = res.acknowledged_comment;
        this.conditionsViewData[selectedConditionIndex].acknowledgedBy = res.acknowledged_by;
        this.conditionsViewData[selectedConditionIndex].acknowledgedTooltipMsg = `Ack by: ${res.acknowledged_by}<br>` + `Ack Msg: ${res.acknowledged_comment}<br>` + `Ack at: ${res.acknowledged_time}`;
        this.spinner.stop('main');
      }, err => {
        this.conditionsViewData[selectedConditionIndex].isAcknowledged = false;
        this.spinner.stop('main');
        this.notification.error(new Notification('Error while acknowledging an events'));
      });
    }
  }

  onCloseConditionAcknowledge() {
    let element: HTMLElement = document.getElementById('event-severity') as HTMLElement;
    element.click();
    this.acknowledgeForm = null;
    this.acknowledgeFormErrors = this.svc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.svc.acknowledgeFormValidationMessages;
  }

  resolveCondtion() {
    let selectedConditionIndex = _clone(this.selectedConditionIndex);
    const selectedCondtionData = _clone(this.conditionsViewData[selectedConditionIndex]);
    if (selectedCondtionData.isStatusResolved || selectedCondtionData.resolveInProgress) {
      return;
    }
    this.conditionsViewData[selectedConditionIndex].resolveInProgress = true;
    this.svc.resolveCondition(selectedCondtionData.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      const matchedConditionIndex = this.conditionsViewData.findIndex(c => c.uuid === selectedCondtionData.uuid);
      if (matchedConditionIndex !== -1) {
        this.conditionsViewData[matchedConditionIndex].resolveInProgress = false;
      }
      if (selectedCondtionData.uuid === this.conditionsViewData[this.selectedConditionIndex]?.uuid) {
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
    this.svc.getConditionDetails(this.conditionsViewData[i].uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.conditionsViewData[i].conditionStatus = res.condition_status;
      if (res.condition_status == 'Resolved') {
        this.conditionsViewData[i].statusTextColor = 'text-success';
      } else {
        this.conditionsViewData[i].statusTextColor = 'text-danger';
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(`Error whlie getting Condition ID: ${this.conditionsViewData[i].id} details`));
    });
  }

  viewConditionDetails() {
    // this.svc.showConditionDetails(this.conditionsViewData[this.selectedConditionIndex].uuid);
  }

  // capture tab events
  goTo(tab: TabData) {
    const tabName = this.tabdetails;
    this.tabdetails = tab.name;
    if (this.tabdetails == 'Alert Stack') {
      this.switchView('timeline');
    } else {
      this.switchView('list');
    }
    if (tabName != 'AI Remediation' && this.tabdetails == 'AI Remediation') {
      setTimeout(() => {
        this.getAIRemediationData();
      }, 5)
    }
  }

  switchView(type: string) {
    this.conditionsViewData[this.selectedConditionIndex].viewType = type;
    this.handleTimelineWidth();
  }

  isActive(tab: TabData) {
    if (this.tabdetails == tab.name) {
      return 'active text-success';
    }
  }

  getAlerts(conditionId: string) {
    this.alerts = [];
    this.svc.getAlerts(conditionId, this.alertsCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.alertsCount = res.count;
      this.alerts = this.svc.convertToAlertsViewdata(res.results);
    }, (err) => {
      this.notification.error(new Notification('Error whlie fetching Alerts.'));
    });
  }

  getAlertsStack(conditionId: string, cIndex: number) {
    this.svc.getAlertsStack(conditionId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.conditionsViewData[cIndex].hostBasedAlerts = this.svc.convertToHostBasedAlerts(this.selectedCondition, res);
    }, (err) => {
      this.notification.error(new Notification('Error whlie fetching Alerts Stack.'));
    });
  }

  alertAcknowledge(index: number) {
    this.selectedAlertIndex = index;
    this.acknowledgeForm = this.svc.buildAcknowledgeForm();
    this.acknowledgeFormErrors = this.svc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.svc.acknowledgeFormValidationMessages;
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
      this.conditionsViewData[this.selectedConditionIndex].alerts[selectedAlertIndex].isAcknowledged = true;
      this.svc.onAlertAcknowledge(this.conditionsViewData[this.selectedConditionIndex].alerts[selectedAlertIndex].uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.conditionsViewData[this.selectedConditionIndex].alerts[selectedAlertIndex].isAcknowledged = res.is_acknowledged;
        this.conditionsViewData[this.selectedConditionIndex].alerts[selectedAlertIndex].acknowledgedTime = res.acknowledged_time;
        this.conditionsViewData[this.selectedConditionIndex].alerts[selectedAlertIndex].acknowledgedComment = res.acknowledged_comment;
        this.conditionsViewData[this.selectedConditionIndex].alerts[selectedAlertIndex].acknowledgedBy = res.acknowledged_by;
        this.conditionsViewData[this.selectedConditionIndex].alerts[selectedAlertIndex].acknowledgedTooltipMsg = `Acknowledged by ${res.acknowledged_by} at ${res.acknowledged_time}`;
        this.spinner.stop('main');
      }, err => {
        this.conditionsViewData[this.selectedConditionIndex].alerts[selectedAlertIndex].isAcknowledged = false;
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
    this.acknowledgeFormErrors = this.svc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.svc.acknowledgeFormValidationMessages;
  }

  resolveAlert(view: ProblemConditionAlertsViewData) {
    if (view.isStatusResolved) {
      return;
    }
    const selectedConditionIndex = _clone(this.selectedConditionIndex);
    const selectedCondtionData = _clone(this.conditionsViewData[selectedConditionIndex]);
    view.resolveInProgress = true;
    this.svc.resolveAlert(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      view.resolveInProgress = false;
      const matchedConditionIndex = this.conditionsViewData.findIndex(c => c.uuid === selectedCondtionData.uuid);
      if (selectedCondtionData.uuid === this.conditionsViewData[this.selectedConditionIndex].uuid) {
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

  viewAlertDetails(uuid: string) {
    this.alertDetailSvc.showAlertDetails(uuid);
  }

  closeEventDetails() {
    this.selectedEvent = null;
    this.handleTimelineWidth();
  }

  getActivities() {
    this.activityVerticalWizardViewData = [];
    this.svc.getOverviewDetails(this.conditionUuid, this.activityCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.activitiesCount = res.count;
      this.activityVerticalWizardViewData = this.svc.convertToActivityWizardViewData(res.results);
    }, (err) => {
      this.notification.error(new Notification('Error whlie getting Activity details'));
    })
  }

  goToTicketDetails(view: ProblemConditionsViewData) {
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

  getConditionRcaAnalysis() {
    this.spinner.start('main');

    this.aiAnalysisViewData = null;
    this.svc.getAnalysisDetails(this.conditionUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.downloadUrl = `customer/aiops/rca_analysis/download/?condition_uuid=${this.conditionUuid}`
      console.log(res, 'result')
      this.aiAnalysisViewData = this.svc.convertToAnalysisData(res);
      console.log(this.aiAnalysisViewData, 'this ia analysis viewdata')
      this.spinner.stop('main');
    }, (err) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error whlie getting Analysis details'));
    })
  }

  getAIRemediationData() {
    this.spinner.start('aiRemediation');
    this.aiRemediationViewData = null;
    this.svc.getAIRemediationData(this.conditionUuid, this.appData).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.aiRemediationViewData = this.svc.convertToAIRemediationViewData(res.response);
      this.spinner.stop('aiRemediation');
    }, (err) => {
      this.notification.error(new Notification('Error whlie getting AI Remediation details'));
      this.spinner.stop('aiRemediation');
    })
  }

  goToExecuteWorkflow(recommendedWorkflow: RecommendedWorkflowFromUnityAIViewData) {
    if (!recommendedWorkflow.workflowId || !recommendedWorkflow.triggerType) {
      return;
    }
    this.router.navigate([`/services/orchestration/workflows/${recommendedWorkflow.workflowId}/manual-trigger`]);
  }


  impactAnalysisData: ApplicationNetworkTopology;
  getImapctAnalysisData() {
    this.svc.getImapctAnalysisData(this.appId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.impactAnalysisData = res;
    }, (err) => {
      this.impactAnalysisData = null;
      this.notification.error(new Notification('Error whlie getting Impact Analysis details'));
    })
  }

  setImpactView(view: 'topology' | 'impact') {
    this.impactView = view;
  }
}

const tabData: TabData[] = [
  {
    name: 'Activity',
  },
  {
    name: 'Alerts',
  },
  {
    name: 'AI Analysis',
  },
  {
    name: 'AI Remediation',
  },
  {
    name: 'Alert Stack',
  },
  {
    name: 'Impact Analysis',
  }
];

const AnalysisLogos = {
  'UnityOne': {
    'imageURL': `${environment.assetsUrl}brand/unity-logo-old.png`,

  },
  'rootCause': {
    'imageURL': `${environment.assetsUrl}misc/Icon.svg`,

  },
  'factors': {
    'imageURL': `${environment.assetsUrl}misc/contributing_factor.svg`,

  },
  'remediation': {
    'imageURL': `${environment.assetsUrl}misc/Mail-1.svg`,

  },
  'event': {
    'imageURL': `${environment.assetsUrl}misc/Mail-2.svg`,

  },
  'llm': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/stars.svg`,
  },
}
