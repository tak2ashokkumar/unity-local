import { Injectable } from '@angular/core';
import moment from 'moment';
import { environment } from 'src/environments/environment';
import { RcaDataType } from '../../naci-chatbot/naci-chatbot.type';

@Injectable()
export class RusRootCauseAnalysisStepService {

  constructor() { }

  convertToRCAViewData(stepData: RcaDataType): NetworkAgentRCAViewData {
    let viewData = new NetworkAgentRCAViewData();

    const summary = stepData?.rca_result?.incident_summary;
    viewData.title = summary?.title;
    viewData.description = summary?.description;
    viewData.severity = summary?.severity;
    viewData.affectedDevices = (summary?.device || []).join(', ');
    viewData.affectedInterfaces = (summary?.interface || []).join(', ');
    viewData.sourceAccount = summary?.source_account;
    viewData.rootCause = stepData?.rca_result?.root_cause_analysis?.root_cause;
    viewData.contributingFactors = stepData?.rca_result?.contributing_factors || [];

    viewData.timelineOfEvents = (stepData?.rca_result?.timeline_of_events || []).map(item => ({
      event: item.event,
      time: moment(item.time).format('HH:mm:ss'),
      date: moment(item.time).format('MMM DD, YYYY')
    }));

    viewData.remediationRecommendations = stepData?.rca_result?.remediation_recommendations || [];
    viewData.whyItHappened = stepData?.rca_result?.why_it_happened || [];
    viewData.howItHappened = stepData?.rca_result?.how_it_happened || [];
    viewData.resultAccuracyPercentage = stepData?.result_accuracy_percentage;

    return viewData;
  }
}

export class NetworkAgentRCAViewData {
  constructor() { }
  title: string;
  description: string;
  severity: string;
  affectedDevices: string;
  affectedInterfaces: string;
  sourceAccount: string;
  rootCause: string;
  contributingFactors: string[];
  whyItHappened: string[];
  howItHappened: string[];
  timelineOfEvents: { event: string; time: string; date: string }[];
  remediationRecommendations: string[];
  resultAccuracyPercentage: string;
  success: string;
  failureReason: string;
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
  'llm': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/stars.svg`,
  },
}
