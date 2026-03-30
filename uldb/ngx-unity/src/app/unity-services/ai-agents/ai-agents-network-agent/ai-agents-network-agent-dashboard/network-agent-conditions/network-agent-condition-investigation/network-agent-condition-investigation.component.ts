import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { NetworkAgentConditionDetailsViewData, NetworkAgentConditionInvestigationService } from './network-agent-condition-investigation.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService, SERVICE_NOW_TICKET_TYPE, TICKET_MGMT_TYPE } from 'src/app/shared/app-utility/app-utility.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { DOCUMENT } from '@angular/common';
import { NetworkAgentsChatResponseType } from './naci-chatbot/naci-chatbot.type';

@Component({
  selector: 'network-agent-condition-investigation',
  templateUrl: './network-agent-condition-investigation.component.html',
  styleUrls: ['./network-agent-condition-investigation.component.scss'],
  providers: [NetworkAgentConditionInvestigationService]
})
export class NetworkAgentConditionInvestigationComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  conditionId: string;
  conditionUuid: string;
  conditionDetailsViewData: NetworkAgentConditionDetailsViewData;
  conditionOverviewViewData: any;

  acknowledgeForm: FormGroup;
  acknowledgeFormErrors: any;
  acknowledgeFormValidationMessages: any;

  analysisLogos = AnalysisLogos;

  activitiesCount: number;
  activityCurrentCriteria: SearchCriteria;
  activityVerticalWizardViewData: any;

  chatResponse: any;

  initialChatResponseData: any[] = [];
  isAnyStepDataPresent: boolean = false;
  currentStageTitle: string = '';

  constructor(private svc: NetworkAgentConditionInvestigationService,
    @Inject(DOCUMENT) private document,
    private renderer: Renderer2,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private utilService: AppUtilityService,
    public storage: StorageService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.conditionId = params.get('conditionId');
      this.conditionUuid = params.get('conditionUuid');
    });
    this.activityCurrentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.minimizeLeftPanel();
    setTimeout(() => {
      // this.spinner.start('conditionDetailsSpinner');
      this.spinner.start('conditionSummarySpinner');
    }, 5);
    this.getConditionDetails();
    this.getActivities();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.maximizeLeftPanel();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  minimizeLeftPanel() {
    let isSideBarMinimised = this.document.body.className.includes('sidebar-minimized');
    if (!isSideBarMinimised) {
      let sidebar_minimizer = this.document.getElementsByClassName('sidebar-minimizer').item(0);
      this.renderer.setStyle(sidebar_minimizer, 'display', 'none');
      sidebar_minimizer.click();
    }
  }

  maximizeLeftPanel() {
    let isSideBarMinimised = this.document.body.className.includes('sidebar-minimized');
    if (isSideBarMinimised) {
      let sidebar_minimizer = this.document.getElementsByClassName('sidebar-minimizer').item(0);
      this.renderer.setStyle(sidebar_minimizer, 'display', 'unset');
      sidebar_minimizer.click();
    }
  }

  getConditionDetails() {
    this.svc.getConditionDetails(this.conditionUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.conditionDetailsViewData = this.svc.convertToConditionDetailsViewdata(res);
      // this.spinner.stop('conditionDetailsSpinner');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('conditionDetailsSpinner');
      this.notification.error(new Notification('Error whlie getting condition details'));
    });
  }

  goToTicketDetails(view: NetworkAgentConditionDetailsViewData) {
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

  createTicket(conditionUuid: string) {
    this.spinner.start('main');
    this.svc.createTicket(conditionUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.notification.success(new Notification('Ticket Created Successfully.'));
      this.spinner.stop('main');
      this.getConditionDetails();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to create a ticket. Please try again later.'));
    });
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

  onConditionAcknowledge() {
    if (this.acknowledgeForm.invalid) {
      this.acknowledgeFormErrors = this.utilService.validateForm(this.acknowledgeForm, this.acknowledgeFormValidationMessages, this.acknowledgeFormErrors);
      this.acknowledgeForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.acknowledgeFormErrors = this.utilService.validateForm(this.acknowledgeForm, this.acknowledgeFormValidationMessages, this.acknowledgeFormErrors);
      });
    } else {
      let obj = Object.assign({}, this.acknowledgeForm.getRawValue());
      this.onCloseConditionAcknowledge();
      this.conditionDetailsViewData.isAcknowledged = true;
      this.svc.onConditionAcknowledge(this.conditionUuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.conditionDetailsViewData.isAcknowledged = res.is_acknowledged;
        this.conditionDetailsViewData.acknowledgedTime = res.acknowledged_time;
        this.conditionDetailsViewData.acknowledgedComment = res.acknowledged_comment;
        this.conditionDetailsViewData.acknowledgedBy = res.acknowledged_by;
        this.conditionDetailsViewData.acknowledgedTooltipMsg = `Ack by: ${res.acknowledged_by}<br>` + `Ack Msg: ${res.acknowledged_comment}<br>` + `Ack at: ${res.acknowledged_time}`;
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.conditionDetailsViewData.isAcknowledged = false;
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
    if (this.conditionDetailsViewData.isStatusResolved || this.conditionDetailsViewData.resolveInProgress) {
      return;
    }
    this.conditionDetailsViewData.resolveInProgress = true;
    this.svc.resolveCondition(this.conditionUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.conditionDetailsViewData.resolveInProgress = false;
      this.getConditionDetails();
      this.notification.success(new Notification(`Request to resolve Condition ID: ${this.conditionDetailsViewData.id} processed successfully`));
    }, (err: HttpErrorResponse) => {
      this.conditionDetailsViewData.resolveInProgress = false;
      this.notification.error(new Notification(`Request to resolve Condition ID: ${this.conditionDetailsViewData.id} failed. Please try again.`));
      this.spinner.stop('main');
    });
  }

  getActivities() {
    this.activityVerticalWizardViewData = [];
    this.svc.getActivityDetails(this.conditionUuid, this.activityCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.activitiesCount = res.count;
      this.activityVerticalWizardViewData = this.svc.convertToActivityWizardViewData(res.results);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Activity details. Please try again later.'));
    })
  }

  activityPageChange(pageNo: number) {
    if (this.activityCurrentCriteria.pageNo !== pageNo) {
      // this.spinner.start('main');
      this.activityCurrentCriteria.pageNo = pageNo;
      this.getActivities();
    }
  }

  handleChatResponse(res: NetworkAgentsChatResponseType | null) {
    if (this.initialChatResponseData?.length == 0) {
      this.initialChatResponseData.push(res);
      this.spinner.stop('conditionSummarySpinner');
    }
    if (res == null || res?.answer?.phase == 'General') { return; }
    this.isAnyStepDataPresent = res?.answer?.stage ? true : this.isAnyStepDataPresent;
    const stageTitle = ["Basic CLI Check", "Monitoring", "Resource Utilization", "Check Device Health", "Centralized Logs", "Network Topology"];
    if (stageTitle.includes(res?.answer?.stage_title)) {
      this.currentStageTitle = res.answer.stage_title;
    } else {
      this.currentStageTitle = this.currentStageTitle ? this.currentStageTitle : '';
    }
    this.chatResponse = res;
    if (res?.answer?.stage == "Stage 0") {
      this.conditionOverviewViewData = this.svc.convertToConditionOverviewData(res.answer);
    }
    this.spinner.stop('main');
  }

}


const AnalysisLogos = {
  'UnityOne': {
    'imageURL': `${environment.assetsUrl}brand/unity-logo-old.png`,
  },
}