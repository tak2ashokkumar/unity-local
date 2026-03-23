import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { CABINET_FAST_BY_DEVICE_ID, DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_LIST_BY_DEVICE_TYPE, GET_AGENT_CONFIGURATIONS, PRIVATE_CLOUD_FAST_BY_DC_ID, SWITCH_DELETE, SWITCH_MANUFACTURERS, SWITCH_MODELS, SWITCH_UPDATE } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { SNMPCrudTypeClass } from '../../entities/snmp-crud.type';
import { SwitchCRUDManufacturer, SwitchCRUDModel } from '../../entities/switch-crud.type';
import { Switch } from '../../entities/switch.type';

@Injectable()
export class SwitchesCrudService {
  private addOrEditAnnouncedSource = new Subject<string>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private userInfo: UserInfoService) { }

  addOrEditSwitch(switchId: string) {
    this.addOrEditAnnouncedSource.next(switchId);
  }

  deleteSwitch(switchId: string) {
    this.deleteAnnouncedSource.next(switchId);
  }

  getManufacturers() {
    return this.http.get<SwitchCRUDManufacturer[]>(SWITCH_MANUFACTURERS());
  }

  getModels(manufacturer: string): Observable<Array<SwitchCRUDModel>> {
    return this.http.get<Array<SwitchCRUDModel>>(SWITCH_MODELS(manufacturer));
  }

  getDatacenters(): Observable<DatacenterFast[]> {
    return this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
  }

  getCabinets(dcId: string): Observable<CabinetFast[]> {
    return this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
  }

  getPrivateClouds(dcId: string): Observable<DeviceCRUDPrivateCloudFast[]> {
    return this.http.get<DeviceCRUDPrivateCloudFast[]>(PRIVATE_CLOUD_FAST_BY_DC_ID(dcId));
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  createSwitch(data: SwitchCRUDFormData): Observable<Switch[]> {
    return this.http.post<Switch[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.SWITCHES), data);
  }

  switchDelete(switchId: string): Observable<any> {
    return this.http.delete(SWITCH_DELETE(switchId));
  }

  updateSwitch(data: SwitchCRUDFormData, uuid: string): Observable<Switch[]> {
    return this.http.put<Switch[]>(SWITCH_UPDATE(uuid), data);
  }

  createSwitchForm(switchId?: string): Observable<FormGroup> {
    if (switchId) {
      return this.http.get<Switch>(SWITCH_UPDATE(switchId)).pipe(
        map(sw => {
          let form = this.builder.group({
            'name': [sw.name, [Validators.required, NoWhitespaceValidator]],
            'manufacturer': [sw.manufacturer_id, [Validators.required, NoWhitespaceValidator]],
            'model': this.builder.group({
              'id': [sw.model_id, [Validators.required, NoWhitespaceValidator]]
            }),
            'datacenter': this.builder.group({
              'uuid': [sw.datacenter ? sw.datacenter.uuid : '', [Validators.required, NoWhitespaceValidator]]
            }),
            'cabinet': this.builder.group({
              'id': [sw.cabinet ? sw.cabinet.id : '', [NoWhitespaceValidator]]
            }),
            'position': [{ value: sw.cabinet ? sw.position : '', disabled: sw.cabinet ? false : true }, [Validators.min(0), NoWhitespaceValidator]],
            'size': [sw.size, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'management_ip': [sw.management_ip, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
            'asset_tag': [sw.asset_tag, [NoWhitespaceValidator]],
            'cloud': [sw.cloud, []],
            'tags': [sw.tags.filter(tg => tg)],
            'custom_attribute_data': [sw.custom_attribute_data],
          });
          if (this.userInfo.linkDeviceToCollector) {
            const collector = this.builder.group({
              'uuid': [sw.collector ? sw.collector.uuid : '', [Validators.required]],
            });
            form.addControl('collector', collector);
          }
          return form;
        }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'manufacturer': ['', [Validators.required, NoWhitespaceValidator]],
        'model': this.builder.group({
          'id': ['', [Validators.required, NoWhitespaceValidator]]
        }),
        'datacenter': this.builder.group({
          'uuid': ['', [Validators.required, NoWhitespaceValidator]]
        }),
        'cabinet': this.builder.group({
          'id': ['', [NoWhitespaceValidator]]
        }),
        'position': [{ value: '', disabled: true }, [Validators.min(0), NoWhitespaceValidator]],
        'size': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'management_ip': ['', [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'asset_tag': ['', [NoWhitespaceValidator]],
        'cloud': [[], []],
        'tags': [[]]
      })).pipe(map(form => {
        if (this.userInfo.linkDeviceToCollector) {
          const collector = this.builder.group({
            'uuid': ['', [Validators.required]],
          });
          form.addControl('collector', collector);
        }
        return form
      }));
    }
  }

  resetSwitchFormErrors() {
    return {
      'name': '',
      'manufacturer': '',
      'model': {
        'id': ''
      },
      'datacenter': {
        'uuid': ''
      },
      'cabinet': {
        'id': ''
      },
      'position': '',
      'size': '',
      'management_ip': '',
      'asset_tag': '',
      'collector': {
        'uuid': ''
      }
    }
  }

  switchValidationMessages = {
    'name': {
      'required': 'Firewall name is required'
    },
    'manufacturer': {
      'required': 'Manufacturer name is required'
    },
    'model': {
      'id': {
        'required': 'Model is required'
      }
    },
    'datacenter': {
      'uuid': {
        'required': 'Datacenter is required'
      }
    },
    'position': {
      'min': 'Minimum value should be is greater than or equal to 0'
    },
    'size': {
      'required': 'Size is required',
      'min': 'Minimum value should be greater than or equal to 1'
    },
    'management_ip': {
      'ip': 'Invalid IP'
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    }
  }
}

export class SwitchCRUDFormData extends SNMPCrudTypeClass {
  name: string;
  manufacturer: string;
  model: {
    id: string;
  }
  cabinet: {
    id: string;
  }
  position: number;
  size: number;
  management_ip: string;
  asset_tag: string;
  cloud: PrivateCLoudFast[];
  collector: {
    uuid: string;
  };
  tags: string[];
}