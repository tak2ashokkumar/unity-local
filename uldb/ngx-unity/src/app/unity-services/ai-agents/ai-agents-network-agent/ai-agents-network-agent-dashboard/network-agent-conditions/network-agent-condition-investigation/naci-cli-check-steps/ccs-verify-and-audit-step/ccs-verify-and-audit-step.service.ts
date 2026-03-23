import { Injectable } from '@angular/core';

@Injectable()
export class CcsVerifyAndAuditStepService {

  constructor() { }

  convertToVerifyAndAuditViewData(verifyauditdata: any) {
    let viewData: VerifyAndAuditViewData = new VerifyAndAuditViewData();
    viewData.stage = verifyauditdata?.stage;
    viewData.data = verifyauditdata?.data;
    return viewData;
  }
}

export class VerifyAndAuditViewData {
  constructor() { };
  stage: string;
  stage_title: string;
  answer: string;
  status: string;
  data: StageData;
  recommended_actions: string[];
}

export interface StageData {
  executed_command: string;
  validation_findings: string[];
  persistence: string;
}