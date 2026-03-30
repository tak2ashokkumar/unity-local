import { Injectable } from '@angular/core';
import { ValidateFixDataType } from '../../naci-chatbot/naci-chatbot.type';

@Injectable()
export class MonitoringValidateFixStepService {

  constructor() { }

  convertToValidateFixViewData(validateFixData: ValidateFixDataType): ValidateFixViewData {
    let viewData: ValidateFixViewData = new ValidateFixViewData();
    viewData.targetDevice = validateFixData?.execution?.target_device;
    viewData.executionStatus = validateFixData?.execution?.execution_status;
    viewData.logs = validateFixData?.execution?.logs;
    return viewData;
  }
}

export class ValidateFixViewData {
  constructor() { }
  targetDevice: string;
  executionStatus: string;
  logs: string[];
}