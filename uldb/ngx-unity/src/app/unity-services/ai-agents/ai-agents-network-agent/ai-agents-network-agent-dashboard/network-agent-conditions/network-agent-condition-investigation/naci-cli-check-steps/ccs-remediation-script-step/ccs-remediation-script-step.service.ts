import { Injectable } from '@angular/core';
import { RemediationScriptDataType } from '../../naci-chatbot/naci-chatbot.type';

@Injectable()
export class CcsRemediationScriptStepService {

  constructor() { }

  convertToRemediationScriptViewData(remediationData: RemediationScriptDataType): RemediationScriptViewData {
    let viewData: RemediationScriptViewData = new RemediationScriptViewData();
    viewData.remediationScript = remediationData?.script_name;
    viewData.targetDevice = remediationData?.target_device;
    viewData.actions = remediationData?.actions;
    viewData.risks = remediationData?.risks;
    viewData.preConditions = remediationData?.pre_conditions;
    viewData.postConditions = remediationData?.post_conditions;

    viewData.isrecommendedActionsKeyPresent = remediationData?.hasOwnProperty('recommended_actions');
    viewData.recommendedActions = remediationData?.recommended_actions;
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