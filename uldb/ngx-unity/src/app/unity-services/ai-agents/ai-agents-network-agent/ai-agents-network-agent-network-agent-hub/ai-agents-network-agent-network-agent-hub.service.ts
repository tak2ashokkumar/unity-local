import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { AlertType, ConditionType, NetworkAgentSummaryType } from './ai-agents-network-agent-network-agent-hub.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { environment } from 'src/environments/environment';
import moment from 'moment';

@Injectable()
export class AiAgentsNetworkAgentNetworkAgentHubService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private tableService: TableApiServiceService) { }

  getSummary(): Observable<NetworkAgentSummaryType> {
    return this.http.get<NetworkAgentSummaryType>('/customer/aiops/network_agent_summary/');
  }

  getAlertDetails(criteria: SearchCriteria): Observable<PaginatedResult<AlertType>> {
    return this.tableService.getData<PaginatedResult<AlertType>>('/customer/aiops/network_agent_alerts/', criteria);
  }
  getConditionDetails(criteria: SearchCriteria): Observable<PaginatedResult<ConditionType>> {
    return this.tableService.getData<PaginatedResult<ConditionType>>('/customer/aiops/network_agent_conditions/', criteria);
  }
  getAnomalyDetails(criteria: SearchCriteria): Observable<PaginatedResult<any>> {
    return this.tableService.getData<PaginatedResult<any>>('/customer/aiops/network_agent_anomaly/', criteria);
  }

  convertToSummaryWidgetsViewData(data: NetworkAgentSummaryType): SummaryWidgetsViewData {
    let viewData: SummaryWidgetsViewData = new SummaryWidgetsViewData();
    viewData.taskRecommended = data.total_tasks_recommended;
    viewData.taskExecuted = data.executed_count;
    viewData.taskApproved = data.approved_count;
    viewData.waitingForApproval = data.waiting_for_approval_count;
    viewData.approvalRejected = data.rejected_count;
    return viewData;
  }

  convertoToAlertsViewData(results: AlertType[]): AlertsViewData[] {
    let viewData: AlertsViewData[] = [];
    results.forEach(r => {
      let d: AlertsViewData = new AlertsViewData();

      //------------------START of alerts list page related code------------------
      d.alertUuid = r.alert_uuid;
      d.alertId = r.alert_id;
      d.deviceName = r.alert_data?.device_name ? r.alert_data?.device_name : 'N/A';
      d.alertDescription = r.alert_data?.description ? r.alert_data?.description : 'N/A';
      d.alertTime = r.alert_data?.alert_datetime ? this.utilSvc.toUnityOneDateFormat(r.alert_data.alert_datetime) : 'N/A';
      d.alertSeverity = r.alert_data?.severity;
      d.alertSeverityIcon = this.getSeverityIcon(r.alert_data?.severity);
      d.executionStatus = r.execution_status ? r.execution_status : '';
      let { icon, tooltipMessage } = r.remediation_script_status ? this.getExecutionStatusIcon(r.remediation_script_status) : { icon: '', tooltipMessage: '' };
      d.executionStatusCssClass = icon;
      d.executionStatusTooltip = tooltipMessage;
      // d.approvedBy = r.approved_by;
      //------------------END of alerts list page related code------------------

      //------------------START of alert POPUP related code ------------------
      d.alertsPopupDetails = new AlertsPopupDetailsViewData();
      d.alertsPopupDetails.alertId = r.alert_id;
      d.alertsPopupDetails.managementIp = r.alert_data?.management_ip;
      d.alertsPopupDetails.eventCount = r.alert_data?.event_count;
      d.alertsPopupDetails.deviceName = r.alert_data?.device_name;
      d.alertsPopupDetails.firstEventDatetime = this.utilSvc.toUnityOneDateFormat(r.alert_data?.first_event_datetime);
      d.alertsPopupDetails.lastEventDatetime = this.utilSvc.toUnityOneDateFormat(r.alert_data?.last_event_datetime);
      d.alertsPopupDetails.deviceType = r.alert_data?.device_type;
      d.alertsPopupDetails.isAcknowledged = r.alert_data?.is_acknowledged;
      d.alertsPopupDetails.source = r.alert_data?.source;
      d.alertsPopupDetails.sourceAccountName = r.alert_data?.source_account_name;
      d.alertsPopupDetails.alertDuration = r.alert_data?.alert_duration;
      d.alertsPopupDetails.eventMetric = r.alert_data?.event_metric;

      d.alertsPopupDetails.description = r.alert_data?.description;
      let contextualSummaryConverted = r.contextual_summary ? JSON.parse(r.contextual_summary) : null;
      d.alertsPopupDetails.summary = contextualSummaryConverted?.summary;
      d.alertsPopupDetails.rootCause = contextualSummaryConverted?.root_cause_analysis?.identified_cause;
      d.alertsPopupDetails.supportingEvidence = contextualSummaryConverted?.root_cause_analysis?.supporting_evidence;
      d.alertsPopupDetails.scriptDescription = contextualSummaryConverted?.remediation_description?.script_description;
      d.alertsPopupDetails.expectedRemediationOutcome = contextualSummaryConverted?.remediation_description?.expected_remediation_outcome;
      d.alertsPopupDetails.impactedDevices = (contextualSummaryConverted?.impacted_devices_services?.devices_affected || []).join(', ');
      d.alertsPopupDetails.recommendedScript = contextualSummaryConverted?.recommended_scripts?.length ? contextualSummaryConverted?.recommended_scripts[0]?.name : '';
      d.alertsPopupDetails.accuracyScore = contextualSummaryConverted?.result_accuracy_percentage;
      d.alertsPopupDetails.whyItHappened = contextualSummaryConverted?.why_it_happened || [];
      d.alertsPopupDetails.howItHappened = contextualSummaryConverted?.how_it_happened || [];
      d.alertsPopupDetails.timelineOfEvents = (contextualSummaryConverted?.timeline_of_events?.event_sequence || []).map(item => ({
        description: item.description ? item.description : 'N/A',
        time: item.timestamp ? moment(item.timestamp).format('HH:mm:ss') : 'N/A',
        date: item.timestamp ? moment(item.timestamp).format('MMM DD, YYYY') : 'N/A'
      }));
      d.alertsPopupDetails.notes = contextualSummaryConverted?.notes?.length ? contextualSummaryConverted?.notes : '';
      //------------------END of alert POPUP related code------------------

      viewData.push(d);
    })
    return viewData;
  }

  convertToConditionsViewData(results: ConditionType[]): ConditionsViewData[] {
    let viewData: ConditionsViewData[] = [];
    results.forEach(r => {
      let d: ConditionsViewData = new ConditionsViewData();

      //------------------START of condition list page related code------------------
      d.alertId = r.alert_id;
      d.alertName = r.alert_name;
      d.conditionTime = r.condition_analysis?.condition_datetime ? this.utilSvc.toUnityOneDateFormat(r.condition_analysis?.condition_datetime) : 'N/A';
      d.conditionSeverity = r.condition_analysis?.condition_severity;
      d.conditionSeverityIcon = this.getSeverityIcon(r.condition_analysis?.condition_severity);
      // d.approvedBy = r.approved_by;
      //------------------END of condition list page related code------------------

      //------------------START of condition RCA POPUP code------------------
      let conditionRcaConverted = r.condition_rca ? JSON.parse(r.condition_rca) : null;
      d.conditionStatus = conditionRcaConverted?.status ? conditionRcaConverted?.status : '';
      d.conditionsRcaPopupDetails = new ConditionsRcaPopupDetailsViewData();
      d.conditionsRcaPopupDetails.title = conditionRcaConverted?.rca_report?.incident_summary?.title;
      d.conditionsRcaPopupDetails.description = conditionRcaConverted?.rca_report?.incident_summary?.description;
      d.conditionsRcaPopupDetails.severity = conditionRcaConverted?.rca_report?.incident_summary?.severity;
      d.conditionsRcaPopupDetails.affectedDevices = (conditionRcaConverted?.rca_report?.incident_summary?.device || []).join(', ');
      d.conditionsRcaPopupDetails.affectedInterfaces = (conditionRcaConverted?.rca_report?.incident_summary?.interface || []).join(', ');
      d.conditionsRcaPopupDetails.contributingFactors = conditionRcaConverted?.rca_report?.contributing_factors || [];
      d.conditionsRcaPopupDetails.remediationRecommendations = conditionRcaConverted?.rca_report?.remediation_recommendations;
      d.conditionsRcaPopupDetails.sourceAccount = conditionRcaConverted?.rca_report?.incident_summary?.source_account;
      d.conditionsRcaPopupDetails.score = conditionRcaConverted?.result_accuracy_percentage;
      d.conditionsRcaPopupDetails.conclusion = conditionRcaConverted?.rca_report?.conclusion;
      d.conditionsRcaPopupDetails.whyItHappened = conditionRcaConverted?.rca_report?.why_it_happened || [];
      d.conditionsRcaPopupDetails.howItHappened = conditionRcaConverted?.rca_report?.how_it_happened || [];
      d.conditionsRcaPopupDetails.timelineOfEvents = (conditionRcaConverted?.rca_report?.timeline_of_events || []).map(item => ({
        event: item.event,
        time: item.time ? moment(item.time).format('HH:mm:ss') : 'N/A',
        date: item.time ? moment(item.time).format('MMM DD, YYYY') : 'N/A'
      }));
      //------------------END of condition RCA POPUP code------------------

      viewData.push(d);
    })
    return viewData;
  }

  getSeverityIcon(severity: string) {
    if (severity == 'Critical') {
      return 'fa-exclamation-circle text-danger';
    } else if (severity == 'Warning') {
      return 'fa-exclamation-circle text-warning';
    } else {
      return 'fa-info-circle text-primary';
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
}

export class SummaryWidgetsViewData {
  constructor() { }
  taskRecommended: number = 0;
  taskExecuted: number = 0;
  taskApproved: number = 0;
  waitingForApproval: number = 0;
  approvalRejected: number = 0;
}

export class AlertsViewData {
  constructor() { }
  alertUuid: string;
  alertId: number;
  deviceName: string;
  alertDescription: string;
  alertTime: string;
  alertSeverity: string;
  alertSeverityIcon: string;
  executionStatus: string;
  executionStatusCssClass: string;
  executionStatusTooltip: string;
  approvedBy: string;
  alertsPopupDetails: AlertsPopupDetailsViewData;
}

export class ConditionsViewData {
  constructor() { }
  alertId: number;
  alertName: string;
  conditionTime: string;
  conditionSeverity: string;
  conditionSeverityIcon: string;
  conditionStatus: string;
  approvedBy: string;
  conditionsRcaPopupDetails: ConditionsRcaPopupDetailsViewData;
}

export class AlertsPopupDetailsViewData {
  constructor() { }
  alertId: number;
  eventCount: number;
  managementIp: string;
  firstEventDatetime: string;
  lastEventDatetime: string;
  deviceName: string;
  deviceType: string;
  description: string;
  isAcknowledged: boolean;
  source: string;
  sourceAccountName: string;
  alertDuration: string;
  eventMetric: string;

  summary: string;
  rootCause: string;
  supportingEvidence: string;
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

export class ConditionsRcaPopupDetailsViewData {
  constructor() { }
  title: string;
  description: string;
  severity: string;
  affectedDevices: string;
  affectedInterfaces: string;
  sourceAccount: string;
  score: string;
  conclusion: string;
  remediationRecommendations: string[];
  contributingFactors: string[];
  whyItHappened: string[];
  howItHappened: string[];
  timelineOfEvents: ConditionRcaTimeLineOfEventsType[];
}

export class ConditionRcaTimeLineOfEventsType {
  constructor() { }
  event: string;
  time: string;
  date: string
}

export interface AgentAnalysisRecommendedScriptExecutionType {
  alert_uuid: string;
  approve: boolean;
}

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
  'event': {
    'imageURL': `${environment.assetsUrl}misc/Mail-2.svg`,
  },
}