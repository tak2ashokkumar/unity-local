import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { AgentAnalysisRecommendedScriptExecutionType, AlertsControlPanelType, SummaryType } from './ai-agents-network-agent-dashboard.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import moment from 'moment';
import { environment } from 'src/environments/environment';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';

@Injectable()
export class AiAgentsNetworkAgentDashboardService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService) { }

  getSummary(): Observable<SummaryType> {
    return this.http.get<SummaryType>(`/customer/aiops/network_agent_alerts/summary/`);
  }

  getAlertsControlPanel(criteria: SearchCriteria): Observable<PaginatedResult<AlertsControlPanelType>> {
    return this.tableService.getData<PaginatedResult<AlertsControlPanelType>>(`/customer/aiops/network_agent_alerts/`, criteria);
  }

  convertToSummaryWidgetsViewData(data: SummaryType): SummaryWidgetsViewData {
    let viewData: SummaryWidgetsViewData = new SummaryWidgetsViewData();
    viewData.taskRecommended = data.total_tasks_recommended;
    viewData.taskExecuted = data.executed_count;
    viewData.taskApproved = data.approved_count;
    viewData.waitingForApproval = data.waiting_for_approval_count;
    viewData.approvalRejected = data.rejected_count;
    return viewData;
  }

  convertToAlertsControlPanelViewData(data: AlertsControlPanelType[]): AlertsControlPanelViewData[] {
    let viewData: AlertsControlPanelViewData[] = [];
    data.forEach(d => {
      let view: AlertsControlPanelViewData = new AlertsControlPanelViewData();
      view.alertUuid = d.alert_uuid;
      view.alertId = d.alert_id;
      view.deviceName = d.alert_data?.device_name ? d.alert_data?.device_name : 'N/A';
      view.alertDescription = d.alert_data?.description ? d.alert_data?.description : 'N/A';
      view.alertTime = d.alert_data?.alert_datetime ? this.utilSvc.toUnityOneDateFormat(d.alert_data.alert_datetime) : 'N/A';
      view.status = d.execution_status ? this.utilSvc.toTitleCase(d.execution_status) : '';
      view.statusClass = this.getStatusIcon(d.execution_status);
      let { icon, tooltipMessage } = d.remediation_script_status ? this.getExecutionStatusIcon(d.remediation_script_status) : { icon: '', tooltipMessage: '' };
      view.executionStatusCssClass = icon;
      view.executionStatusTooltip = tooltipMessage;
      let contextualSummaryConverted = d.contextual_summary ? JSON.parse(d.contextual_summary) : null;
      view.aiTaskRecomendation = contextualSummaryConverted?.recommended_scripts?.length ? contextualSummaryConverted?.recommended_scripts[0]?.name : 'N/A';
      if (d.approval_status == 'approved') {
        view.approvalStatus = true;
        view.approvalStatusStateMaintain = true;
      } else if (d.approval_status == 'rejected') {
        view.approvalStatus = false;
        view.approvalStatusStateMaintain = false;
      } else {
        view.approvalStatus = null;
        view.approvalStatusStateMaintain = null;
      }
      view.contextualSummary = new AlertsControlPanelContextualSummaryViewData();
      view.contextualSummary.summary = contextualSummaryConverted?.summary;
      view.contextualSummary.rootCause = contextualSummaryConverted?.root_cause_analysis?.identified_cause;
      view.contextualSummary.supportingEvidence = contextualSummaryConverted?.root_cause_analysis?.supporting_evidence;
      view.contextualSummary.recommendedScript = contextualSummaryConverted?.recommended_scripts?.length ? contextualSummaryConverted?.recommended_scripts[0]?.name : '';
      view.contextualSummary.scriptDescription = contextualSummaryConverted?.remediation_description?.script_description;
      view.contextualSummary.expectedRemediationOutcome = contextualSummaryConverted?.remediation_description?.expected_remediation_outcome;
      view.contextualSummary.impactedDevices = (contextualSummaryConverted?.impacted_devices_services?.devices_affected || []).join(', ');
      view.contextualSummary.isRecommendedScriptPresent = contextualSummaryConverted?.recommended_scripts?.length ? true : false;
      view.isApprovalStatusPending = d.approval_status == 'pending';
      view.contextualSummary.accuracyScore = contextualSummaryConverted?.result_accuracy_percentage;
      view.contextualSummary.whyItHappened = contextualSummaryConverted?.why_it_happened || [];
      view.contextualSummary.howItHappened = contextualSummaryConverted?.how_it_happened || [];
      view.contextualSummary.timelineOfEvents = (contextualSummaryConverted?.timeline_of_events?.event_sequence || []).map(item => ({
        description: item.description,
        time: item.timestamp ? moment(item.timestamp).format('HH:mm:ss') : 'N/A',
        date: item.timestamp ? moment(item.timestamp).format('MMM DD, YYYY') : 'N/A'
      }));
      view.contextualSummary.notes = contextualSummaryConverted?.notes;
      viewData.push(view);
    })
    return viewData;
  }

  getStatusIcon(status: string) {
    switch (status) {
      case 'Completed':
        return 'fas fa-check-circle text-success fa-lg';
      case 'Failed':
        return 'fas fa-exclamation-triangle text-danger fa-lg';
      case 'Paused':
      case 'In Progress':
        return 'fas fa-exclamation-circle text-warning fa-lg';
    }
  }

  getExecutionStatusIcon(name: string) {
    let icon: string;
    let tooltipMessage: string;
    switch (name) {
      case 'Success':
        icon = "fa-check-circle text-success";
        tooltipMessage = "Success";
        break;
      case 'Failed':
        icon = "fa-exclamation-circle text-danger";
        tooltipMessage = "Failed";
        break;
      case 'Pending':
        icon = "fa-hourglass-half text-primary";
        tooltipMessage = "Pending";
        break;
      case 'No Script':
        icon = "fa-ban text-primary";
        tooltipMessage = "No Script";
        break;
      default:
        icon = "fas fa-spinner fa-spin fa-info-circle text-primary";
        tooltipMessage = "In Progress";
        break;
    }
    return { icon, tooltipMessage };
  }

  approval(data: AgentAnalysisRecommendedScriptExecutionType) {
    return this.http.post(`/customer/aiops/network_agent_alerts/${data.alert_uuid}/approval_status/`, data);
  }
}

export class SummaryWidgetsViewData {
  constructor() { }
  tasksRecommendedLoader: string = 'tasksRecommendedWidgetLoader';
  taskExecutedLoader: string = 'taskExecutedWidgetLoader';
  taskApprovedLoader: string = 'taskApprovedWidgetLoader';
  waitingForApprovalLoader: string = 'waitingForApprovalWidgetLoader';
  approvalRejectedLoader: string = 'approvalRejectedWidgetLoader';

  taskRecommended: number = 0;
  taskExecuted: number = 0;
  taskApproved: number = 0;
  waitingForApproval: number = 0;
  approvalRejected: number = 0;
}

export class AlertsControlPanelViewData {
  constructor() { }
  alertUuid: string;
  alertId: number;
  deviceName: string;
  alertDescription: string;
  alertTime: string;
  status: string;
  statusClass: string;
  executionStatusCssClass: string;
  executionStatusTooltip: string;
  aiTaskRecomendation: string;
  approvalStatus: boolean;
  approvalStatusStateMaintain: boolean;
  isApprovalStatusPending: boolean;
  contextualSummary: AlertsControlPanelContextualSummaryViewData;
}

export class AlertsControlPanelContextualSummaryViewData {
  constructor() { }
  summary: string;
  rootCause: string;
  supportingEvidence: string;
  isRecommendedScriptPresent: boolean;
  recommendedScript: string;
  scriptDescription: string;
  expectedRemediationOutcome: string;
  impactedDevices: string;
  accuracyScore: number;
  whyItHappened: string[];
  howItHappened: string[];
  timelineOfEvents: AlertsTimeLineOfEventsType[];
  notes: string;
}

export class AlertsTimeLineOfEventsType {
  constructor() { }
  description: string;
  time: string;
  date: string
}

export const deviceTypesList: LabelValueType[] = [
  {
    'label': 'Switch',
    'value': 'switch'
  },
  {
    'label': 'Firewall',
    'value': 'firewall'
  },
  {
    'label': 'Load Balancer',
    'value': 'load_balancer'
  }
]

export const AnalysisLogos = {
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
}