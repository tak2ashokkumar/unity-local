import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NetworkScanType } from './network-scan.type';
import { GET_ONBOARDING_NETWORK_SCAN, SCAN_ONBOARDING_NETWORK, NEW_NETWORK_SCAN, DELETE_ONBOARDING_NETWORK_SCAN, GET_EXCEL_ONBARDING_FILE_PATH, ON_BOARD_EXCEL_FILE, GET_CUSTOMER_VCENTERS, UPDATE_CUSTOMER_VCENTERS } from 'src/app/shared/api-endpoint.const';
import { DatePipe } from '@angular/common';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { SharedOnboardingStatusService } from 'src/app/shared/shared-on-boarding/shared-on-boarding.service';
import { AppLevelService } from 'src/app/app-level.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { OnboaringCustomerVCenter } from './customer-vcenter.type';
import { environment } from 'src/environments/environment';

@Injectable()
export class OnBoardAssetsService {

  constructor(private http: HttpClient,
    private userInfo: UserInfoService,
    private appService: AppLevelService,
    private sharedOnboardingService: SharedOnboardingStatusService,
    private builder: FormBuilder) { }

  getExcelOnboardingFile() {
    return this.http.get<{ file_path: string }>(GET_EXCEL_ONBARDING_FILE_PATH());
  }

  buildAttachmentForm() {
    return this.builder.group({});
  }

  uploadFile<T>(file: File, key: string) {
    const formData = new FormData();
    formData.append(key, file, file.name);
    return this.http.post(ON_BOARD_EXCEL_FILE(), formData);
  }

  getCustomerVCenters() {
    return this.http.get<PaginatedResult<OnboaringCustomerVCenter>>(GET_CUSTOMER_VCENTERS());
  }

  converToViewData(onbDetails: OnbDetails) {
    let viewData = new OnboardAssetViewData();
    viewData.excelBtnClass = this.sharedOnboardingService.getExcelBtnClass(onbDetails);
    return viewData;
  }

  convertToVCenterViewData(data: OnboaringCustomerVCenter[]) {
    let viewData: OnboardCustomerVCenterViewData[] = [];
    data.map(vcenter => {
      let a = new OnboardCustomerVCenterViewData();
      a.id = vcenter.id;
      a.hostname = vcenter.hostname;
      a.port = vcenter.port;
      a.username = vcenter.username;
      a.cloudName = vcenter.private_cloud.name;

      viewData.push(a);
    });
    return viewData;
  }

  updateVCenter(data: OnboardCustomerVCenterViewData[]) {
    return this.http.post<{
      errors: { [key: number]: string },
      success: { [key: number]: string }
    }>(UPDATE_CUSTOMER_VCENTERS(), { data: data });
  }
}

export class NetworkScanViewData {
  constructor() { }
  iNet: string;
  uuid: string;
  status: string;
  updatedAt: string;
  reScanReportIconMessage: string;
  reScanReportIconEnabled: boolean;

  downloadReportIconMessage: string;
  downloadReportIconEnabled: boolean;
  downloadReportUrl: string;
}

export class OnboardAssetViewData {
  constructor() { }
  excelBtnClass: string;
}

export class OnboardCustomerVCenterViewData {
  constructor() { }
  id: number;
  cloudName: string;
  hostname: string;
  username: string;
  port: number;
  password?: string = '';
  message?: string = '';
  icon: 'fa-times text-danger' | 'fa-check text-success';
}