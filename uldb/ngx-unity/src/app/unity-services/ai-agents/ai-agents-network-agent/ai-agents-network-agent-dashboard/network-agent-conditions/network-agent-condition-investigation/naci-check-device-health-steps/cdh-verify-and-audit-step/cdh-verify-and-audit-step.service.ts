import { Injectable } from '@angular/core';
import { ResourceUtilizationSummaryType } from '../../naci-chatbot/naci-chatbot.type';

@Injectable()
export class CdhVerifyAndAuditStepService {

  constructor() { }

  convertToDeviceHealthSummaryViewData(data: ResourceUtilizationSummaryType): DeviceHealthSummaryViewData {
    let viewData: DeviceHealthSummaryViewData = new DeviceHealthSummaryViewData();
    viewData.cpu = data?.cpu;
    viewData.memory = data?.memory;
    viewData.uptime = data?.uptime;
    viewData.latency = data?.latency;
    viewData.bandwidth = data?.bandwidth;
    viewData.interfaceError = data?.interface_error;
    return viewData;
  }

}

export class DeviceHealthSummaryViewData {
  constructor() { }
  cpu: string;
  memory: string;
  uptime: string;
  latency: string;
  bandwidth: string;
  interfaceError: string;
}