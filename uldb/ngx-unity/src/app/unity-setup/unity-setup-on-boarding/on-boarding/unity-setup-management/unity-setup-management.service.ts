import { Injectable } from '@angular/core';
import { SharedOnboardingStatusService } from 'src/app/shared/shared-on-boarding/shared-on-boarding.service';
import { HttpClient } from '@angular/common/http';
import { ACTIVATE_MGMT_ACCESS } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class UnitySetupManagementService {

  constructor(private http: HttpClient,
    private sharedOnboardingService: SharedOnboardingStatusService) { }

  converToViewData(onbDetails: OnbDetails) {
    let viewData = new UnitySetupManagementViewData();
    if (onbDetails.onb_status.manage_end) {
      viewData.status = 'success';
      viewData.icon = 'cfa-checkmark';
      viewData.backgroundColor = 'bg-success';
    } else if (onbDetails.onb_status.manage_error) {
      viewData.status = 'error';
      viewData.icon = 'cfa-close';
      viewData.backgroundColor = 'bg-danger';
    } else if (onbDetails.onb_status.manage_start) {
      viewData.status = 'inprogress';
      viewData.icon = 'fa-exclamation-triangle';
      viewData.backgroundColor = 'bg-warning';
    } else {
      viewData.status = 'iprequired';
      viewData.icon = 'fa-exclamation-triangle';
      viewData.backgroundColor = 'bg-warning';
    }

    // if (onbDetails.onb_status.manage_start && !onbDetails.onb_status.manage_error && !onbDetails.onb_status.manage_end) {
    //   viewData.status = 'inprogress';
    //   viewData.icon = 'fa-exclamation-triangle';
    //   viewData.backgroundColor = 'bg-warning';
    // } else if (!onbDetails.onb_status.manage_error && !onbDetails.onb_status.manage_end) {
    //   viewData.status = 'iprequired';
    //   viewData.icon = 'fa-exclamation-triangle';
    //   viewData.backgroundColor = 'bg-warning';
    // } else if (onbDetails.onb_status.manage_error && !onbDetails.onb_status.manage_end) {
    //   viewData.status = 'error';
    //   viewData.icon = 'fa-close';
    //   viewData.backgroundColor = 'bg-danger';
    // } else if (onbDetails.onb_status.manage_end) {
    //   viewData.status = 'success';
    //   viewData.icon = 'cfa-checkmark';
    //   viewData.backgroundColor = 'bg-success';
    // }
    viewData.proxyBtnClass = this.sharedOnboardingService.getProxyBtnClass(onbDetails);
    viewData.managementBtnEnabled = onbDetails.vpn_status;
    return viewData;
  }

  activate() {
    return this.http.get(ACTIVATE_MGMT_ACCESS());
  }
}

export class UnitySetupManagementViewData {
  constructor() { }
  connectionRequested: boolean;
  backgroundColor: string;
  icon: string;
  status: string;
  proxyBtnClass: string;
  managementBtnEnabled: boolean;
}