import { Injectable } from '@angular/core';

@Injectable()
export class MonitoringRemediationScriptStepService {
constructor() { }

  convertToRemediationScriptViewData(remediationData: any): RemediationScriptViewData {
    let viewData: RemediationScriptViewData = new RemediationScriptViewData();
    viewData.remediationScript = remediationData?.data?.script_name;
    viewData.targetDevice = remediationData?.data?.target_device;
    viewData.actions = remediationData?.data?.actions;
    viewData.risks = remediationData?.data?.risks;
    viewData.preConditions = remediationData?.data?.pre_conditions;
    viewData.postConditions = remediationData?.data?.post_conditions;

    viewData.isrecommendedActionsKeyPresent = remediationData?.data?.hasOwnProperty('recommended_actions');
    viewData.recommendedActions = remediationData?.data?.recommended_actions;
    return viewData;
  }
}

export class RemediationScriptViewData {
  constructor() { }
  remediationScript: string;
  targetDevice: string;
  actions: string[];
  risks: string[];
  preConditions: string[];
  postConditions: string[];
  isrecommendedActionsKeyPresent: boolean = false;
  recommendedActions: string;
}