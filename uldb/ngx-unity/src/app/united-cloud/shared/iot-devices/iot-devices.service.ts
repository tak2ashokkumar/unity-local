import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { IotDeviceManufacturerType, IotDeviceModelType, IotDeviceType } from '../entities/iot-device.type';
import { GET_IOT_DEVICE_Models, UPDATE_IOT_DEVICE_TAGS, ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { map } from 'rxjs/operators';
import { Handle404Header } from 'src/app/app-http-interceptor';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';

@Injectable()
export class IotDevicesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder) { }

  getIotDevices(criteria: SearchCriteria): Observable<PaginatedResult<IotDeviceType>> {
    return this.tableService.getData<PaginatedResult<IotDeviceType>>(`/customer/iot_devices/`, criteria);
  }

  getManufacturers(): Observable<IotDeviceManufacturerType[]> {
    return this.http.get<IotDeviceManufacturerType[]>(`rest/manufacturer/?page_size=0`);
  }

  getModels(deviceType: string, manufacturers: string[]): Observable<IotDeviceModelType[]> {
    const mappedDeviceType = this.utilSvc.getDeviceMappingByDeviceType(deviceType);
    let params: HttpParams = new HttpParams();
    manufacturers.map(manufacturer => params = params.append('manufacturer', manufacturer));
    return this.http.get<IotDeviceModelType[]>(GET_IOT_DEVICE_Models(mappedDeviceType), { params: params });
  }

  convertToIotDevicesViewData(data: IotDeviceType[]): IotDeviceViewData[] {
    let viewData: IotDeviceViewData[] = [];
    data.forEach(d => {
      let view: IotDeviceViewData = new IotDeviceViewData();
      view.deviceId = d.uuid;
      view.name = d.name;
      view.deviceType = d.device_type;
      view.displayDeviceType = this.utilSvc.getDeviceMappingByDeviceType(d.device_type);
      view.manufacturer = d.manufacturer;
      view.model = d.model;
      view.ipaddress = d.ip_address;
      view.tags = d.tags.filter(tag => tag);
      view.deviceStatus = this.utilSvc.getDeviceStatus(d.status);
      view.monitoring = d.monitoring;
      view.isStatsButtonEnabled = d.device_type == 'smart_pdu' ? true : false;
      viewData.push(view);
    })
    return viewData;
  }

  getDeviceData(device: IotDeviceViewData) {
    const isSensorOrRfid = (device.deviceType == 'sensor' || device.deviceType == 'rfid_reader');
    if (isSensorOrRfid) {
      device.statsTooltipMessage = 'Coming Soon';
      return EMPTY;
    }
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
    return this.http.get(ZABBIX_DEVICE_DATA_BY_DEVICE_TYPE(DeviceMapping.SMART_PDU, device.deviceId), { headers: Handle404Header })
      .pipe(
        map((res: DeviceData) => {
          if (res) {
            const value = res.device_data;
            if (!device.deviceStatus) {
              device.deviceStatus = this.utilSvc.getDeviceStatus(value.status);
            }
            device.statsTooltipMessage = 'View Statistics';
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

  updateTags(data: { tags: string[] }, view: IotDeviceViewData) {
    let mappedDeviceType = this.utilSvc.getDeviceMappingByDeviceType(view.deviceType);
    return this.http.post(UPDATE_IOT_DEVICE_TAGS(mappedDeviceType, view.deviceId), data);
  }

}

export class IotDeviceViewData {
  constructor() { }
  deviceId: string;
  name: string;
  deviceType: string;
  displayDeviceType: DeviceMapping;
  manufacturer: string;
  model: string;
  ipaddress: string;
  tags: string[];
  deviceStatus: string;
  monitoring: DeviceMonitoringType;
  statsTooltipMessage: string;
  isStatsButtonEnabled: boolean;
}

export const deviceTypeList: LabelValueType[] = [
  {
    'label': 'Sensor',
    'value': 'sensor'
  },
  {
    'label': 'Smart PDU',
    'value': 'smart_pdu'
  },
  {
    'label': 'RFID Reader',
    'value': 'rfid_reader'
  }
]

export const statusList: LabelValueType[] = [
  {
    'label': 'Up',
    'value': '1'
  },
  {
    'label': 'Down',
    'value': '0'
  },
  {
    'label': 'Unknown',
    'value': '-1'
  }
]