import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { CABINET_FAST_BY_DEVICE_ID, DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_LIST_BY_DEVICE_TYPE, GET_AGENT_CONFIGURATIONS, MAC_DELETE, MAC_MANUFACTURERS, MAC_MODELS, MAC_OS, MAC_UPDATE, PRIVATE_CLOUD_FAST_BY_DC_ID } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { DevicesCrudMonitoringService } from '../../devices-crud-monitoring/devices-crud-monitoring.service';
import { MacMiniCRUDManufacturer, MacMiniCRUDModel, MacMiniCRUDOperatingSystem } from '../../entities/mac-mini-crud.type';
import { MacMini } from '../../entities/mac-mini.type';
import { SNMPCrudTypeClass } from '../../entities/snmp-crud.type';

@Injectable()
export class MacMiniCrudService {
  private addOrEditAnnouncedSource = new Subject<string>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private snmpCrudSvc: DevicesCrudMonitoringService,
    private userInfo: UserInfoService) { }

  addOrEdit(deviceId?: string) {
    this.addOrEditAnnouncedSource.next(deviceId);
  }

  delete(deviceId: string) {
    this.deleteAnnouncedSource.next(deviceId);
  }

  getManufacturers() {
    return this.http.get<MacMiniCRUDManufacturer[]>(MAC_MANUFACTURERS());
  }

  getModels(manufacturer: string): Observable<Array<MacMiniCRUDModel>> {
    return this.http.get<Array<MacMiniCRUDModel>>(MAC_MODELS(manufacturer));
  }

  getOperatingSystems() {
    return this.http.get<MacMiniCRUDOperatingSystem[]>(MAC_OS());
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

  createMacMini(data: MacMiniCRUDFormData): Observable<MacMini[]> {
    return this.http.post<MacMini[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.MAC_MINI), data)
  }

  deleteMacMini(deviceId: string): Observable<any> {
    return this.http.delete(MAC_DELETE(deviceId));
  }

  updateMacMini(data: MacMiniCRUDFormData, deviceId: string): Observable<MacMini[]> {
    return this.http.put<MacMini[]>(MAC_UPDATE(deviceId), data)
  }

  createMacMiniForm(deviceId?: string): Observable<FormGroup> {
    if (deviceId) {
      return this.http.get<MacMini>(MAC_UPDATE(deviceId)).pipe(
        map(mm => {
          let form = this.builder.group({
            'serial_number': [mm.serial_number, [Validators.required, NoWhitespaceValidator]],
            'name': [mm.name, [Validators.required, NoWhitespaceValidator]],
            'manufacturer': this.builder.group({
              'id': [mm.manufacturer ? mm.manufacturer.id : '', [Validators.required, NoWhitespaceValidator]]
            }),
            'model': this.builder.group({
              'id': [mm.model ? mm.model.id : '', [Validators.required, NoWhitespaceValidator]]
            }),
            'num_cpus': [mm.num_cpus, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'num_cores': [mm.num_cores, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'memory_mb': [mm.memory_mb, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'capacity_gb': [mm.capacity_gb, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'os': this.builder.group({
              'id': [mm.os ? mm.os.id : '', [Validators.required, NoWhitespaceValidator]],
            }),
            'datacenter': this.builder.group({
              'uuid': [mm.datacenter ? mm.datacenter.uuid : '', [Validators.required, NoWhitespaceValidator]]
            }),
            'cabinet': this.builder.group({
              'id': [mm.cabinet ? mm.cabinet.id : '', [NoWhitespaceValidator]]
            }),
            'private_cloud': this.builder.group({
              'id': [mm.private_cloud ? mm.private_cloud.id : '', [NoWhitespaceValidator]],
            }),
            'asset_tag': [mm.asset_tag, [NoWhitespaceValidator]],
            'management_ip': [mm.management_ip, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
            'tags': [mm.tags.filter(tg => tg)]
          });
          if (this.userInfo.linkDeviceToCollector) {
            const collector = this.builder.group({
              'uuid': [mm.collector ? mm.collector.uuid : '', [Validators.required]],
            });
            form.addControl('collector', collector);
          }
          this.snmpCrudSvc.addOrEdit(mm);
          return form;
        }));
    } else {
      return of(this.builder.group({
        'serial_number': ['', [Validators.required, NoWhitespaceValidator]],
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'manufacturer': this.builder.group({
          'id': ['', [Validators.required, NoWhitespaceValidator]],
        }),
        'model': this.builder.group({
          'id': ['', [Validators.required, NoWhitespaceValidator]]
        }),
        'num_cpus': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'num_cores': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'memory_mb': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'capacity_gb': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'os': this.builder.group({
          'id': ['', [Validators.required, NoWhitespaceValidator]],
        }),
        'datacenter': this.builder.group({
          'uuid': ['', [Validators.required, NoWhitespaceValidator]]
        }),
        'cabinet': this.builder.group({
          'id': ['', [NoWhitespaceValidator]],
        }),
        'private_cloud': this.builder.group({
          'id': ['', [NoWhitespaceValidator]],
        }),
        'asset_tag': ['', [NoWhitespaceValidator]],
        'management_ip': ['', [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'tags': [[]]
      })).pipe(map(form => {
        if (this.userInfo.linkDeviceToCollector) {
          const collector = this.builder.group({
            'uuid': ['', [Validators.required]],
          });
          form.addControl('collector', collector);
        }
        this.snmpCrudSvc.addOrEdit(null);
        return form;
      }));
    }
  }

  resetMacMiniFormErrors() {
    return {
      'serial_number': '',
      'name': '',
      'private_cloud': {
        'id': ''
      },
      'manufacturer': {
        'id': ''
      },
      'model': {
        'id': ''
      },
      'datacenter': {
        'uuid': ''
      },
      'cabinet': {
        'id': ''
      },
      'num_cpus': '',
      'num_cores': '',
      'memory_mb': '',
      'capacity_gb': '',
      'os': {
        'id': ''
      },
      'asset_tag': '',
      'management_ip': '',
      'collector': {
        'uuid': ''
      }
    };
  }

  validationMessages = {
    macMiniMessages: {
      'serial_number': {
        'required': 'Serial Number is required'
      },
      'name': {
        'required': 'Mac Mini name is required'
      },
      'manufacturer': {
        'id': {
          'required': 'Manufacturer is required'
        }
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
      'num_cpus': {
        'required': 'Number of CPUs is required',
        'min': 'Minimum value should be greater than or equal to 1'
      },
      'num_cores': {
        'required': 'Number of cores is required',
        'min': 'Minimum value should be greater than or equal to 1'
      },
      'memory_mb': {
        'required': 'Memory in MB is required',
        'min': 'Minimum value should be greater than or equal to 1'
      },
      'capacity_gb': {
        'required': 'Capacity in GB is required',
        'min': 'Minimum value should be greater than or equal to 1'
      },
      'os': {
        'id': {
          'required': 'OS is required'
        }
      },
      'management_ip': {
        'ip': 'Invalid IP'
      },
      'collector': {
        'uuid': {
          'required': 'Collector is required'
        }
      }
    },
  }
}


export class MacMiniCRUDFormData extends SNMPCrudTypeClass {
  name: string;
  private_cloud: {
    id: string;
  }
  manufacturer: {
    id: string;
  }
  model: {
    id: string;
  }
  num_cpus: number;
  num_cores: number;
  memory_mb: number;
  capacity_gb: number;
  os: {
    id: string;
  }
  cabinet: {
    id: string;
  }
  asset_tag: string;
  management_ip: string;
  collector: {
    uuid: string;
  };
  tags: string[];
}