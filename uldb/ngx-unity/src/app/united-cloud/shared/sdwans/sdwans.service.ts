import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { SdWanAccountDetails } from 'src/app/unity-setup/unity-setup-integration/usi-others/usio-sdwan/usio-sdwan.type';

@Injectable()
export class SdwansService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder) { }

  getSdWanAccounts(criteria: SearchCriteria): Observable<SdWanAccountDetails[]> {
    return this.tableService.getData<SdWanAccountDetails[]>(`/customer/sdwan/accounts/`, criteria);
  }

  convertToViewData(data: SdWanAccountDetails[]): SdwanViewData[] {
    let viewData: SdwanViewData[] = [];
    data.map((sd) => {
      let vd = new SdwanViewData();
      vd.sdwanId = sd.uuid;
      vd.name = sd.name;
      vd.username = sd.username;
      vd.port = sd.port;
      vd.accountUrl = sd.account_url;
      vd.collector = sd.collector;
      vd.deviceStatus = this.utilSvc.getDeviceStatus(sd.status);
      vd.schedule = sd.schedule_meta?.schedule_type;
      vd.proxyUrl = sd.proxy && sd.proxy.backend_url ? sd.proxy.backend_url : null;
      vd.proxyTooltip = vd.proxyUrl ? 'Manage In New Tab' : 'Not Configured';
      vd.tags = sd.tags?.filter(tg => tg);
      vd.monitoring = sd.monitoring;
      viewData.push(vd);
    })
    return viewData;
  }

  getDeviceData(device: SdwanViewData) {
    if (!device.monitoring.configured) {
      if (!device.deviceStatus) {
        device.deviceStatus = 'Not Configured';
      }
      device.statsTooltipMessage = 'Configure Monitoring';
      return EMPTY;
    }
    if (device.monitoring.configured && !device.monitoring.enabled) {
      if (!device.deviceStatus) {
        device.deviceStatus = this.utilSvc.getDeviceStatus('-2');
      }
      device.statsTooltipMessage = 'Enable monitoring';
      return EMPTY;
    }
    return this.http.get(ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.SDWAN_ACCOUNTS, device.sdwanId), { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            if (!device.deviceStatus) {
              device.deviceStatus = this.utilSvc.getDeviceStatus(value.status);
            }
            device.statsTooltipMessage = 'Sdwan account statistics';
          }
          return device;
        })
      );
  }

  createTagsForm(tags: string[]): FormGroup {
    return this.builder.group({
      'tags': [tags],
    });
  }

  resetTagsFormErrors() {
    return {
      'tags': ''
    };
  }

  tagsFormValidationMessages = {
    'tags': {
      'required': 'Tags are required'
    }
  }

  updateTags(data: { tags: string[] }, view: SdwanViewData) {
    return this.http.post(`/customer/sdwan/accounts/${view.sdwanId}/associate_tag/`, data);
  }

  sdwanDelete(sdwanId: string) {
    return this.http.delete(`/customer/sdwan/accounts/${sdwanId}/`);
  }

}

export class SdwanViewData {
  constructor() { };
  sdwanId: string;
  name: string;
  accountUrl: string;
  port: string;
  collector: string;
  username: string;
  deviceStatus: string;
  schedule: string;
  proxyUrl: string;
  proxyTooltip: string;
  tags: string[];
  monitoring: DeviceMonitoringType;
  statsTooltipMessage: string;
}
