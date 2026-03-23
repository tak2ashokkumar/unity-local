import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CABINET_FAST_BY_DEVICE_ID, DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_LIST_BY_DEVICE_TYPE, FIREWALL_DELETE, FIREWALL_MANUFACTURERS, FIREWALL_MODELS, FIREWALL_UPDATE, GET_AGENT_CONFIGURATIONS, PRIVATE_CLOUD_FAST_BY_DC_ID } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { FirewallCRUDManufacturer, FirewallCRUDModel } from '../../entities/firewall-crud.type';
import { Firewall } from '../../entities/firewall.type';
import { SNMPCrudTypeClass } from '../../entities/snmp-crud.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DeviceCustomAttribute } from 'src/app/shared/SharedEntityTypes/device-custom-attributes.type';

@Injectable()
export class FirewallCrudService {
  private addOrEditAnnouncedSource = new Subject<string>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private userInfo: UserInfoService) { }

  addOrEditFireWall(fireWallId: string) {
    this.addOrEditAnnouncedSource.next(fireWallId);
  }

  deleteFireWall(fireWallId: string) {
    this.deleteAnnouncedSource.next(fireWallId);
  }

  getManufacturers() {
    return this.http.get<FirewallCRUDManufacturer[]>(FIREWALL_MANUFACTURERS());
  }

  getModels(manufacturer: string): Observable<Array<FirewallCRUDModel>> {
    return this.http.get<Array<FirewallCRUDModel>>(FIREWALL_MODELS(manufacturer));
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

  createFirewall(data: FirewallCRUDFormData): Observable<Firewall[]> {
    return this.http.post<Firewall[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.FIREWALL), data);
  }

  deleteFirewall(fireWallId: string): Observable<any> {
    return this.http.delete(FIREWALL_DELETE(fireWallId));
  }

  updateFirewall(data: FirewallCRUDFormData, uuid: string): Observable<Firewall[]> {
    return this.http.put<Firewall[]>(FIREWALL_UPDATE(uuid), data);
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  createFirewallForm(deviceId?: string): Observable<FormGroup> {
    if (deviceId) {
      return this.http.get<Firewall>(FIREWALL_UPDATE(deviceId)).pipe(
        map(d => {
          let form = this.builder.group({
            'name': [d.name, [Validators.required, NoWhitespaceValidator]],
            'manufacturer': [d.manufacturer_id, [Validators.required, NoWhitespaceValidator]],
            'model': this.builder.group({
              'id': [d.model_id, [Validators.required, NoWhitespaceValidator]]
            }),
            'datacenter': this.builder.group({
              'uuid': [d.datacenter ? d.datacenter.uuid : '', [Validators.required, NoWhitespaceValidator]]
            }),
            'cabinet': this.builder.group({
              'id': [d.cabinet ? d.cabinet.id : '', [NoWhitespaceValidator]]
            }),
            'position': [{ value: d.cabinet ? d.position : '', disabled: d.cabinet ? false : true }, [Validators.min(0), NoWhitespaceValidator]],
            'size': [d.size, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'management_ip': [d.management_ip, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
            'asset_tag': [d.asset_tag, [NoWhitespaceValidator]],
            'cloud': [d.cloud, []],
            'tags': [d.tags.filter(tg => tg)],
            'custom_attribute_data': [d.custom_attribute_data],
          });
          if (this.userInfo.linkDeviceToCollector) {
            const collector = this.builder.group({
              'uuid': [d.collector ? d.collector.uuid : '', [Validators.required]],
            });
            form.addControl('collector', collector);
          }
          return form;
        }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'resource_mapping_type': [DeviceMapping.FIREWALL],
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
        return form;
      }));
    }
  }

  resetFirewallFormErrors() {
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

  firewallValidationMessages = {
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
      'min': 'Minimum value should be greater than or equal to 0'
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

export class FirewallCRUDFormData extends SNMPCrudTypeClass {
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
  cloud: PrivateCLoudFast[]
  tags: string[];
  collector: {
    uuid: string;
  }
}