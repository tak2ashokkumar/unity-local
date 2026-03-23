import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AiAgentsNetworkAgentDashboardService, AlertsControlPanelViewData, AnalysisLogos, deviceTypesList, SummaryWidgetsViewData } from './ai-agents-network-agent-dashboard.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AgentAnalysisRecommendedScriptExecutionType } from './ai-agents-network-agent-dashboard.type';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'ai-agents-network-agent-dashboard',
  templateUrl: './ai-agents-network-agent-dashboard.component.html',
  styleUrls: ['./ai-agents-network-agent-dashboard.component.scss'],
  providers: [AiAgentsNetworkAgentDashboardService]
})
export class AiAgentsNetworkAgentDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  subscr: Subscription;
  currentPath: string;

  summaryWidgetsViewData: SummaryWidgetsViewData = new SummaryWidgetsViewData();

  deviceTypesSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block multiselect-dropdown-padding',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };
  deviceTypesTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Device Type',
  };

  deviceTypesList: LabelValueType[] = deviceTypesList;

  currentCriteria: SearchCriteria;
  count: number = 0;
  alertsControlPanelViewData: AlertsControlPanelViewData[] = [];
  selectedAlertsControlPanelView: AlertsControlPanelViewData;
  @ViewChild('agentAnalysis') agentAnalysis: ElementRef;
  agentAnalysisModalRef: BsModalRef;
  analysisLogos = AnalysisLogos;
  // currentPath: string = 'events';

  constructor(private svc: AiAgentsNetworkAgentDashboardService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private modalSvc: BsModalService,
    private notification: AppNotificationService) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/services/ai-agents/network-agent/dashboard') {
          this.router.navigate(['events'], { relativeTo: this.route });
        }
        this.currentPath = event.url.split('/').pop();
      }
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}], multiValueParam: { device_type: [] } };
  }

  ngOnInit(): void {
    // setTimeout(() => {
    //   this.geSummary();
    //   this.getAlertsControlPanel();
    // }, 0);
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.subscr?.unsubscribe();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAlertsControlPanel();
  }

  OnFilterChange() {
    this.currentCriteria.pageNo = 1;
    this.getAlertsControlPanel();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.currentCriteria.pageNo = pageNo;
      this.getAlertsControlPanel();
    }
  }

  refreshData(pageNo: number) {
    this.currentCriteria.searchValue = '';
    this.currentCriteria.pageNo = 1;
    this.geSummary();
    this.getAlertsControlPanel();
  }

  geSummary(isSkipSpinnerStart?: boolean) {
    if (!isSkipSpinnerStart) {
      this.startSummarySpinner();
    }
    this.svc.getSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryWidgetsViewData = this.svc.convertToSummaryWidgetsViewData(res);
      this.stopSummarySpinner();
    }, (err: HttpErrorResponse) => {
      this.stopSummarySpinner();
      this.notification.error(new Notification('Failed to get Summary data. Please try again later'));
    })
  }

  startSummarySpinner() {
    this.spinner.start(this.summaryWidgetsViewData.tasksRecommendedLoader);
    this.spinner.start(this.summaryWidgetsViewData.taskExecutedLoader);
    this.spinner.start(this.summaryWidgetsViewData.taskApprovedLoader);
    this.spinner.start(this.summaryWidgetsViewData.waitingForApprovalLoader);
    this.spinner.start(this.summaryWidgetsViewData.approvalRejectedLoader);
  }

  stopSummarySpinner() {
    this.spinner.stop(this.summaryWidgetsViewData.tasksRecommendedLoader);
    this.spinner.stop(this.summaryWidgetsViewData.taskExecutedLoader);
    this.spinner.stop(this.summaryWidgetsViewData.taskApprovedLoader);
    this.spinner.stop(this.summaryWidgetsViewData.waitingForApprovalLoader);
    this.spinner.stop(this.summaryWidgetsViewData.approvalRejectedLoader);
  }

  getAlertsControlPanel(isSkipSpinnerStart?: boolean) {
    if (!isSkipSpinnerStart) {
      this.spinner.start('alertsControlPanelWidgetLoader');
    }
    this.svc.getAlertsControlPanel(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.alertsControlPanelViewData = this.svc.convertToAlertsControlPanelViewData(res.results);
      this.spinner.stop('alertsControlPanelWidgetLoader');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('alertsControlPanelWidgetLoader');
      this.notification.error(new Notification('Failed to get Alerts control panel data. Please try again later'));
    })
  }

  agentAnalysisOfAlert(view: AlertsControlPanelViewData) {
    this.selectedAlertsControlPanelView = null;
    this.agentAnalysisModalRef = this.modalSvc.show(this.agentAnalysis, Object.assign({}, { class: 'modal-xl pl-5', keyboard: true, ignoreBackdropClick: true }));
    setTimeout(() => {
      this.spinner.start('agentAnalysisPopupLoader');
    }, 2);
    setTimeout(() => {
      this.selectedAlertsControlPanelView = view;
      this.spinner.stop('agentAnalysisPopupLoader');
    }, 4050);
  }

  confirmScriptExecute(isConfirmed: boolean) {
    this.spinner.start('main');
    const obj: AgentAnalysisRecommendedScriptExecutionType = { alert_uuid: this.selectedAlertsControlPanelView.alertUuid, approve: isConfirmed };
    this.svc.approval(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.agentAnalysisModalRef.hide();
      this.spinner.stop('main');
      this.geSummary();
      this.getAlertsControlPanel();
      this.notification.success(new Notification("Confirmation submitted successfully."));
    }, (err: HttpErrorResponse) => {
      this.agentAnalysisModalRef.hide();
      this.spinner.stop('main');
      this.spinner.stop('alertsControlPanelWidgetLoader');
      this.notification.error(new Notification("Failed to submit Confirmation. Please try again later."));
    })
  }

  onApprovalChange(view: AlertsControlPanelViewData) {
    this.selectedAlertsControlPanelView = view;
    this.startSummarySpinner();
    this.spinner.start('alertsControlPanelWidgetLoader');
    const obj: AgentAnalysisRecommendedScriptExecutionType = { alert_uuid: this.selectedAlertsControlPanelView.alertUuid, approve: this.selectedAlertsControlPanelView.approvalStatus };
    this.svc.approval(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.geSummary(true);
      this.getAlertsControlPanel(true);
      this.notification.success(new Notification("Confirmation submitted successfully."));
    }, (err: HttpErrorResponse) => {
      if (this.selectedAlertsControlPanelView.approvalStatusStateMaintain === null) {
        this.selectedAlertsControlPanelView.approvalStatus = null;
      } else {
        this.selectedAlertsControlPanelView.approvalStatus = !this.selectedAlertsControlPanelView.approvalStatus;
      }
      this.stopSummarySpinner();
      this.spinner.stop('alertsControlPanelWidgetLoader');
      this.notification.error(new Notification("Failed to submit Confirmation. Please try again later."));
    })
  }

  goTo(target: string) {
    switch (target) {
      case 'rules': this.router.navigate(['aiml/rules', 'firstresponsepolicies'], { relativeTo: this.route.parent }); break;
      case 'summary': this.router.navigate(['aiml', 'summary'], { relativeTo: this.route.parent }); break;
      case 'analytics': this.router.navigate(['aiml', 'analytics'], { relativeTo: this.route.parent }); break;
      default: this.router.navigate([target], { relativeTo: this.route }); break;
    }
  }

}
