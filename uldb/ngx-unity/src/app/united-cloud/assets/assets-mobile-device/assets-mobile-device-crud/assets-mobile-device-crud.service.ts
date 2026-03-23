import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DEVICE_LIST_BY_DEVICE_TYPE, DEVICE_TAG_LIST_BY_DEVICE_TYPE, MOBILE_DEVICE_DELETE, MOBILE_DEVICE_UPDATE, DEVICES_FAST_BY_DEVICE_TYPE, GET_AGENT_CONFIGURATIONS } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { MobileDevice } from 'src/app/united-cloud/shared/entities/mobile-device-crud.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

@Injectable()
export class AssetsMobileDeviceCrudService {
  private addOrEditAnnouncedSource = new Subject<string>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();
  constructor(private builder: FormBuilder, private http: HttpClient, private userInfo: UserInfoService) { }

  addOrEditMobile(deviceId: string) {
    this.addOrEditAnnouncedSource.next(deviceId);
  }

  deleteMobile(deviceId: string) {
    this.deleteAnnouncedSource.next(deviceId);
  }

  getDatacenters(): Observable<DatacenterFast[]> {
    return this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
  }

  createMobileDevice(data: MobileCRUDFormData): Observable<MobileDevice[]> {
    return this.http.post<MobileDevice[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.MOBILE_DEVICE), data);
  }

  updateMobileDevice(data: MobileCRUDFormData, uuid: string): Observable<MobileDevice[]> {
    return this.http.put<MobileDevice[]>(MOBILE_DEVICE_UPDATE(uuid), data);
  }

  deleteMobileDevice(storageDeviceId: string): Observable<any> {
    return this.http.delete(MOBILE_DEVICE_DELETE(storageDeviceId));
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  private mapToDevice(devices: any[]) {
    let data: TagDevice[] = [];
    devices.forEach(dev => {
      data.push({ id: dev.id, name: dev.name });
    });
    return data;
  }

  getTagDevices(platform: string, search: string): Observable<Array<TagDevice>> {
    let params = new HttpParams().set('search', search);
    if (platform == 'Android') {
      return this.http.get<Array<TagDevice>>(DEVICE_TAG_LIST_BY_DEVICE_TYPE(DeviceMapping.BARE_METAL_SERVER), { params: params });
    } else if (platform == 'ios') {
      return this.http.get<Array<TagDevice>>(DEVICE_TAG_LIST_BY_DEVICE_TYPE(DeviceMapping.MAC_MINI), { params: params });
    }
  }

  createMobileDeviceForm(deviceId?: string): Observable<FormGroup> {
    if (deviceId) {
      return this.http.get<MobileDevice>(MOBILE_DEVICE_UPDATE(deviceId)).pipe(
        map(md => {
          let form = this.builder.group({
            'name': [md.name, [Validators.required, NoWhitespaceValidator]],
            'serial_number': [md.serial_number, [Validators.required, NoWhitespaceValidator]],
            'platform': [md.platform, [Validators.required]],
            'device_type': [md.device_type, [Validators.required]],
            'model': [md.model ? md.model : '', [Validators.required, NoWhitespaceValidator]],
            'ip_address': [md.ip_address, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
            'datacenter': this.builder.group({
              'uuid': [md.datacenter ? md.datacenter.uuid : '', [Validators.required, NoWhitespaceValidator]]
            }),
            'device_tagged': [md.device_tagged],
            'tags': [md.tags.filter(tg => tg)],
            'custom_attribute_data': [md.custom_attribute_data],
          });
          if (this.userInfo.linkDeviceToCollector) {
            const collector = this.builder.group({
              'uuid': [md.collector ? md.collector.uuid : '', [Validators.required]],
            });
            form.addControl('collector', collector);
          }
          return form;
        }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'serial_number': ['', [Validators.required, NoWhitespaceValidator]],
        'platform': ['', [Validators.required]],
        'device_type': ['', [Validators.required]],
        'model': ['', [Validators.required, NoWhitespaceValidator]],
        'ip_address': ['', [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'datacenter': this.builder.group({
          'uuid': ['', [Validators.required, NoWhitespaceValidator]]
        }),
        'device_tagged': [null],
        'tags': [[]]
      })).pipe(map(form => {
        if (this.userInfo.linkDeviceToCollector) {
          const collector = this.builder.group({
            'uuid': ['', [Validators.required]],
          });
          form.addControl('collector', collector);
        }
        return form;
      }));
    }
  }

  resetMobileDeviceFormErrors() {
    return {
      'name': '',
      'serial_number': '',
      'platform': '',
      'device_type': '',
      'model': '',
      'ip_address': '',
      'datacenter': {
        'uuid': ''
      },
      'collector': {
        'uuid': ''
      },
    };
  }

  mobileDeviceFormValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'serial_number': {
      'required': 'Serial number is required'
    },
    'device_type': {
      'required': 'Type is required'
    },
    'platform': {
      'required': 'Type is required'
    },
    'model': {
      'required': 'Model is required'
    },
    'ip_address': {
      'ip': 'Invalid IP'
    },
    'datacenter': {
      'uuid': {
        'required': 'Datacenter is required'
      }
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    },
  }
}

export class MobileCRUDFormData {
  name: string;
  model: string
  device_type: string;
  ip_address: string;
  collector: {
    uuid: string;
  }
}

export interface TagDevice {
  id: number;
  name: string;
}