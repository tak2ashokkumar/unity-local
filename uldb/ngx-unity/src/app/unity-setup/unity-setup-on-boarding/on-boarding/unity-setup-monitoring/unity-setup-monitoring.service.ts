import { Injectable } from '@angular/core';
import { SharedOnboardingStatusService } from 'src/app/shared/shared-on-boarding/shared-on-boarding.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UPLOAD_VM_MONITORING_FILE, GET_UN_MAPPED_DEVICES, ACTIVATE_MONITORING } from 'src/app/shared/api-endpoint.const';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';

@Injectable()
export class UnitySetupMonitoringService {

  constructor(private http: HttpClient,
    private sharedOnboardingService: SharedOnboardingStatusService) { }

  getUnMappedDevices() {
    return this.http.get<{ [key: string]: string[] }>(GET_UN_MAPPED_DEVICES());
  }

  converToViewData(onbDetails: OnbDetails) {
    let viewData = new OnnboardMonitoringViewData();
    viewData.monitoringBtnClass = this.sharedOnboardingService.getMonitoringBtnClass(onbDetails);
    viewData.monitoringBtnEnabled = onbDetails.vpn_status;
    return viewData;
  }

  convertToDeviceMonitoringViewData(onbDetails: OnbDetails) {
    if (onbDetails.onb_status.monitoring_end) {
      return 'completed';
    }
    if (onbDetails.onb_status.monitoring_error) {
      return 'error';
    }
    if (onbDetails.onb_status.monitoring_start) {
      return 'inprogress';
    }
    return 'notstarted';
  }

  uploadFile<T>(cloudType: string, file: File, key: string) {
    const params = new HttpParams().set('cloud_type', cloudType)
    const formData = new FormData();
    formData.append(key, file, file.name);
    return this.http.post(UPLOAD_VM_MONITORING_FILE(), formData, { params: params });
  }

  activateMonitoring() {
    return this.http.get<CeleryTask>(ACTIVATE_MONITORING());
  }
}

export class OnnboardMonitoringViewData {
  constructor() { }
  monitoringBtnClass: string;
  monitoringBtnEnabled: boolean;
}