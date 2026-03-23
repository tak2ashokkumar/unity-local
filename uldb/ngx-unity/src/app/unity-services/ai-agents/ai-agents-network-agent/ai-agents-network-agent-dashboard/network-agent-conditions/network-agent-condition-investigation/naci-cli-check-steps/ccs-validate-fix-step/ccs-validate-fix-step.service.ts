import { Injectable } from '@angular/core';

@Injectable()
export class CcsValidateFixStepService {

  constructor() { }

  convertToValidateFixViewData(validateFixData: any): ValidateFixViewData {
    let viewData: ValidateFixViewData = new ValidateFixViewData();
    viewData.targetDevice = validateFixData?.data?.execution?.target_device;
    viewData.executionStatus = validateFixData?.data?.execution?.execution_status;
    viewData.logs = validateFixData?.data?.execution?.logs;
    return viewData;
  }
}

export class ValidateFixViewData {
  constructor() { }
  targetDevice: string;
  executionStatus: string;
  logs: string[];
}