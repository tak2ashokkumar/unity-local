import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GET_AIOPS_CONDITION_BY_ID } from 'src/app/shared/api-endpoint.const';
import { FormBuilder, Validators } from '@angular/forms';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AppLevelService } from 'src/app/app-level.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { map, switchMap, take } from 'rxjs/operators';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { NetworkAgentConditionActivityDetail } from '../network-agent-conditions.type';
import { NetworkAgentConditionActivityDetailViewData } from '../network-agent-conditions.service';
import { ConditionResponse } from './network-agent-condition-investigation.type';

@Injectable()
export class NetworkAgentConditionInvestigationService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService,
    private appService: AppLevelService,
    private tableService: TableApiServiceService) { }

  getConditionDetails(conditionUuid: string) {
    return this.http.get<NetworkAgentConditionDetails>(GET_AIOPS_CONDITION_BY_ID(conditionUuid));
  }

  convertToConditionDetailsViewdata(data: NetworkAgentConditionDetails): NetworkAgentConditionDetailsViewData {
    let viewdata: NetworkAgentConditionDetailsViewData = new NetworkAgentConditionDetailsViewData();
    viewdata.id = data.id;
    viewdata.uuid = data.uuid;
    viewdata.ruleName = data.rule_name;
    viewdata.alertCount = data.alert_count;
    viewdata.eventCount = data.event_count;
    viewdata.conditionSeverity = data.condition_severity;
    viewdata.severityBg = data.condition_severity == 'Critical' ? 'bg-danger' : data.condition_severity == 'Warning' ? 'bg-warning' : 'bg-primary';
    viewdata.conditionDatetime = data.condition_datetime ? this.utilSvc.toUnityOneDateFormat(data.condition_datetime) : 'N/A';
    viewdata.conditionDuration = data.condition_duration;
    viewdata.conditionStatus = data.condition_status;
    if (data.condition_status == 'Resolved') {
      viewdata.statusTextColor = 'text-success';
      viewdata.isStatusResolved = true;
      viewdata.resolveBtnTooltipMsg = 'Resolved';
    } else {
      viewdata.statusTextColor = 'text-danger';
      viewdata.isStatusResolved = false;
      viewdata.resolveBtnTooltipMsg = 'Resolve';
    }

    viewdata.hosts = Array.from(new Set(data.hosts));
    viewdata.conditionSource = data.condition_source_account;
    viewdata.correlator = data.correlators ? data.correlators : [];
    viewdata.correlationWindow = data.correlation_window;
    viewdata.firstAlertDateTime = data.first_alert_datetime ? this.utilSvc.toUnityOneDateFormat(data.first_alert_datetime) : 'N/A';
    viewdata.lastAlertDateTime = data.last_alert_datetime ? this.utilSvc.toUnityOneDateFormat(data.last_alert_datetime) : 'N/A';

    viewdata.isAcknowledged = data.is_acknowledged;
    viewdata.acknowledgedTime = data.acknowledged_time ? this.utilSvc.toUnityOneDateFormat(data.acknowledged_time) : null;;
    viewdata.acknowledgedBy = data.acknowledged_by;
    viewdata.acknowledgedComment = data.acknowledged_comment;
    viewdata.acknowledgedTooltipMsg = `Ack by: ${viewdata.acknowledgedBy}<br>` + `Ack Msg: ${insertLineBreaks(viewdata.acknowledgedComment, 10, 35)}<br>` + `Ack At: ${viewdata.acknowledgedTime}`;

    viewdata.ticketingSystem = data.ticketing_system_type;
    viewdata.accountId = data.account_id;
    viewdata.projectId = data.project_id;
    viewdata.ticketId = data.ticket_id;
    viewdata.ticketType = data.ticket_type;
    viewdata.ticketUuid = data.ticket_uuid;
    return viewdata;
  }

  convertToConditionOverviewData(data: ConditionResponse): ConditionResponseViewData {

    const viewdata = new ConditionResponseViewData();

    viewdata.stage = data.stage;
    viewdata.stageTitle = data.stage_title;
    viewdata.answer = data.answer;
    viewdata.status = data.status;
    viewdata.recommendedActions = data.recommended_actions || [];

    const overview = new ConditionOverviewData();
    const summary = data.data.condition_summary;

    const summaryView = new ConditionSummary();

    summaryView.conditionId = summary.condition_id;
    summaryView.conditionName = summary.condition_name;
    summaryView.severity = summary.severity;
    summaryView.status = summary.status;
    summaryView.alertCount = summary.alert_count;
    summaryView.eventCount = summary.event_count;
    summaryView.conditionDatetime = summary.condition_datetime;
    summaryView.conditionDuration = summary.condition_duration;
    summaryView.affectedDevices = summary.affected_devices || [];
    summaryView.businessImpact = summary.business_impact;
    summaryView.conditionAnalysis = summary.condition_analysis;
    summaryView.conditionSource = summary.condition_source;
    summaryView.correlators = summary.correlators;
    summaryView.firstAlertDatetime = this.utilSvc.toUnityOneDateFormat(summary.first_alert_datetime);
    summaryView.lastAlertDatetime = this.utilSvc.toUnityOneDateFormat(summary.last_alert_datetime);

    overview.conditionSummary = summaryView;


    overview.eventsTimeline = (data.data.events_timeline || []).map(event => {
      const eventView = new EventTimelineItem();
      eventView.timestamp = event.timestamp;
      eventView.type = event.type;
      eventView.description = event.description;
      eventView.severity = event.severity;
      return eventView;
    });

    overview.alertsTimeline = (data.data.alerts_timeline || []).map(alert => {
      const alertView = new AlertTimelineItem();
      alertView.timestamp = alert.timestamp;
      alertView.type = alert.type;
      alertView.description = alert.description;
      alertView.severity = alert.severity;
      return alertView;
    });

    overview.preliminaryRca = (data.data.preliminary_rca || []).map(rca => {
      const rcaView = new PreliminaryRca();
      rcaView.possibleCause = rca.possible_cause;
      rcaView.confidence = rca.confidence;
      rcaView.indicators = rca.indicators || [];
      return rcaView;
    });

    overview.planOfAction = data.data.plan_of_action || [];

    overview.suggestedCommands = (data.data.suggested_commands || []).map(cmd => {
      const cmdView = new SuggestedCommand();
      cmdView.command = cmd.command;
      cmdView.useCase = cmd.use_case;
      return cmdView;
    });

    viewdata.data = overview;

    return viewdata;
  }


  createTicket(conditionUuid: string) {
    return this.http.post(`/customer/aiops/conditions/${conditionUuid}/create_ticket/`, null);
  }

  buildAcknowledgeForm() {
    return this.builder.group({
      'is_acknowledged': [true],
      'ack_comment': ['', [Validators.required, NoWhitespaceValidator]]
    })
  }

  resetAcknowledgeFormErrors() {
    return {
      'ack_comment': ''
    }
  }

  acknowledgeFormValidationMessages = {
    'ack_comment': {
      'required': 'Acknowledge Comment is required'
    }
  }

  onConditionAcknowledge(conditionUuid: string, formData: any) {
    return this.http.post<NetworkAgentConditionDetails>(`/customer/aiops/conditions/${conditionUuid}/acknowledge/`, formData)
      .pipe(map(res => {
        res.acknowledged_time = res.acknowledged_time ? this.utilSvc.toUnityOneDateFormat(res.acknowledged_time) : null;
        return res;
      }));
  }

  resolveCondition(conditionUuid: string) {
    return this.http.post<CeleryTask>(`/customer/aiops/conditions/${conditionUuid}/resolve/`, {})
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 5, 25).pipe(take(1))), take(1));
  }

  getActivityDetails(conditionUuid: string, criteria: SearchCriteria): Observable<PaginatedResult<NetworkAgentConditionActivityDetail>> {
    return this.tableService.getData<PaginatedResult<NetworkAgentConditionActivityDetail>>(`customer/aiops/conditions/${conditionUuid}/activities/`, criteria);
  }

  convertToActivityWizardViewData(activityData: NetworkAgentConditionActivityDetail[]) {
    let viewdata: NetworkAgentConditionActivityDetailViewData[] = [];
    activityData.forEach((ad) => {
      let view = new NetworkAgentConditionActivityDetailViewData();
      view.id = ad.id;
      view.description = ad.description;
      view.action = ad.action;
      view.actionDisplay = ad.action_display;
      view.createdDatetime = ad.created_datetime ? this.utilSvc.toUnityOneDateFormat(ad.created_datetime) : 'NA';
      viewdata.push(view);
    })
    return viewdata;
  }

}

export class NetworkAgentConditionDetailsViewData {
  constructor() { }
  id: number;
  uuid: string;
  ruleName: string;
  alertCount: number;
  eventCount: number;
  conditionDatetime: string;
  conditionDuration: string;
  conditionStatus: string;
  statusTextColor: string = "";
  conditionSeverity: string;
  severityBg: string = "";
  hosts: string[];
  conditionSource: string;
  correlator: string[];
  correlationWindow: string;
  firstAlertDateTime: string;
  lastAlertDateTime: string;
  totalTimeBetweenEvents: number;
  recoveredDateTime: string;
  isAcknowledged: boolean;
  acknowledgedBy: string;
  acknowledgedTime: string;
  acknowledgedComment: string;
  acknowledgedTooltipMsg: string;
  ticketingSystem: string;
  accountId: string;
  projectId?: string;
  ticketUuid: string;
  ticketId: string;
  ticketType: string;
  resolveInProgress: boolean;
  isStatusResolved: boolean;
  resolveBtnTooltipMsg: string;
}

export interface NetworkAgentConditionDetails {
  id: number;
  uuid: string;
  rule_name: string;
  alert_count: number;
  event_count: number;
  condition_datetime: string;
  first_alert_datetime: string;
  last_alert_datetime: string;
  condition_source: string;
  condition_source_account: string;
  condition_duration: string;
  condition_status: string;
  condition_severity: string;
  correlators: null;
  correlation_window: string;
  hosts: string[];
  recovered_datetime: null;
  is_acknowledged: boolean;
  acknowledged_by: string;
  acknowledged_time: string;
  acknowledged_comment: string;
  root_cause_alert: null;
  ticket_id: string;
  ticket_uuid: string;
  account_id: string;
  ticketing_system_type: string;
  project_id: string;
  ticket_type: string;
}

export class ConditionResponseViewData {
  constructor() { };
  stage: string;
  stageTitle: string;
  answer: string;
  status: 'success' | 'error';
  data: ConditionOverviewData;
  recommendedActions: string[];
}

export class ConditionOverviewData {
  constructor() { };
  conditionSummary: ConditionSummary;
  eventsTimeline: EventTimelineItem[];
  alertsTimeline: AlertTimelineItem[];
  preliminaryRca: PreliminaryRca[];
  planOfAction: string[];
  suggestedCommands: SuggestedCommand[];
}

export class ConditionSummary {
  constructor() { };
  conditionId: string;
  conditionName: string;
  severity: Severity | string;
  status: ConditionStatus | string;
  alertCount: number;
  eventCount: number;
  conditionDatetime: string;
  conditionDuration: string;
  affectedDevices: string[];
  businessImpact: string;
  conditionAnalysis: string;
  conditionSource: string;
  correlators: string;
  firstAlertDatetime: string;
  lastAlertDatetime: string;
}

export class EventTimelineItem {
  constructor() { }
  timestamp: string;
  type: string;
  description: string;
  severity: Severity | string;
}

export class AlertTimelineItem {
  constructor() { }
  timestamp: string;
  type: string;
  description: string;
  severity: Severity | string;
}

export class PreliminaryRca {
  constructor() { }
  possibleCause: string;
  confidence: ConfidenceLevel | string;
  indicators: string[];
}

export class SuggestedCommand {
  command: string;
  useCase: string;
}

export type Severity = 'Critical' | 'Warning' | 'Information';
export type ConditionStatus = 'Resolved' | 'Active';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';


export function insertLineBreaks(text: string, wordLimit: number, maxWordLength: number): string {
  if (text) {
    const words = text.split(' ');
    let result = '';
    let wordCount = 0;

    for (let word of words) {
      // Handle very long words (no spaces)
      if (word.length > maxWordLength) {
        while (word.length > maxWordLength) {
          result += word.substring(0, maxWordLength) + '<wbr>';
          word = word.substring(maxWordLength);
        }
        result += word + ' ';
      } else {
        result += word + ' ';
      }

      wordCount++;
      if (wordCount % wordLimit === 0) {
        result += '<br>';
      }
    }

    return result.trim();
  } else {
    return null;
  }
}