import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_ONBOARDING_DETAILS } from 'src/app/shared/api-endpoint.const';


@Injectable({
  providedIn: 'root'
})
export class SharedOnboardingStatusService {

  constructor(private http: HttpClient) { }

  getOnboardDetails(): Observable<PaginatedResult<OnbDetails>> {
    return this.http.get<PaginatedResult<OnbDetails>>(GET_ONBOARDING_DETAILS());
  }

  getVPNBtnClass(onbDetails: OnbDetails) {
    if (!onbDetails.onb_status.vpn_req) {
      return onbDetails.vpn_status ? 'btn-success' : 'btn-secondary';
    }
    return onbDetails.vpn_status ? 'btn-success' : 'btn-primary';
  }

  getExcelBtnClass(onbDetails: OnbDetails) {
    // if(onbDetails.onb_status.excel_start) {
    //   return onbDetails.onb_status.excel_end ? 'btn-success' : 'btn-warning';
    // }
    // return 'btn-secondary';
    if (onbDetails.onb_status.excel_end) {
      return 'btn-success';
    }
    if (onbDetails.onb_status.excel_start && !onbDetails.onb_status.excel_end) {
      return 'btn-warning';
    } else {
      return 'btn-secondary';
    }
  }

  getMonitoringBtnClass(onbDetails: OnbDetails) {
    // if (onbDetails.vpn_status) {
    //   if (onbDetails.onb_status.monitoring_start) {
    //     return onbDetails.onb_status.monitoring_end ? 'btn-success' : (onbDetails.onb_status.monitoring_error ? 'btn-warning' : 'btn-primary')
    //   }
    //   return 'btn-secondary';
    // }
    // return 'btn-secondary';
    if (onbDetails.onb_status.monitoring_end) {
      return 'btn-success';
    }
    if (onbDetails.onb_status.monitoring_error) {
      return 'btn-warning';
    }
    if (onbDetails.onb_status.monitoring_start) {
      return 'btn-primary';
    }
    return 'btn-secondary';
  }

  getProxyBtnClass(onbDetails: OnbDetails) {
    // if (onbDetails.vpn_status) {
    //   if (onbDetails.onb_status.manage_start) {
    //     return onbDetails.onb_status.manage_end ? 'btn-success' : onbDetails.onb_status.manage_error ? 'btn-warning' : 'btn-primary';
    //   }
    //   return 'btn-secondary';
    // }
    // return 'btn-secondary';

    if (onbDetails.onb_status.manage_end) {
      return 'btn-success';
    }
    if (onbDetails.onb_status.manage_error) {
      return 'btn-warning';
    }
    if (onbDetails.onb_status.manage_start) {
      return 'btn-primary';
    }
    return 'btn-secondary';
  }

  changeViewData(onbDetails: OnbDetails): OnboardStatusViewData {
    let viewData: OnboardStatusViewData = new OnboardStatusViewData();
    const onb_status = onbDetails.onb_status;
    if (!onbDetails.vpn_status || !onb_status.excel_end || !onb_status.monitoring_end || !onb_status.manage_end) {
      viewData.showOnboardStatus = true;
      viewData.vpnBtnClass = this.getVPNBtnClass(onbDetails);
      viewData.excelBtnClass = this.getExcelBtnClass(onbDetails);
      viewData.monitoringBtnClass = this.getMonitoringBtnClass(onbDetails);
      viewData.proxyBtnClass = this.getProxyBtnClass(onbDetails);
    }
    return viewData;
  }
}

export class OnboardStatusViewData {
  showOnboardStatus: boolean;
  vpnBtnClass?: string;
  excelBtnClass?: string;
  monitoringBtnClass?: string;
  proxyBtnClass?: string;
  connectionRequested: boolean;
}
