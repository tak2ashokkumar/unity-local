import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { BMServer_DELETE, BMServer_MANUFACTURERS, BMServer_MODELS, BMServer_OS, BMServer_UPDATE, CABINET_FAST_BY_DEVICE_ID, DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_LIST_BY_DEVICE_TYPE, GET_AGENT_CONFIGURATIONS, PRIVATE_CLOUD_FAST_BY_DC_ID } from 'src/app/shared/api-endpoint.const';
import { BMServerSidePlatformMapping, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { DevicesCrudMonitoringService } from '../../devices-crud-monitoring/devices-crud-monitoring.service';
import { BMServerCRUDManufacturer, BMServerCRUDModel, BMServerCRUDOperatingSystem } from '../../entities/bm-server-crud.type';
import { BMServer } from '../../entities/bm-server.type';
import { SNMPCrudTypeClass } from '../../entities/snmp-crud.type';

@Injectable()
export class BmServersCrudService {
  private addOrEditAnnouncedSource = new Subject<string>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder, private http: HttpClient,
    private snmpCrudSvc: DevicesCrudMonitoringService,
    private userInfo: UserInfoService) { }

  addOrEditBaremetalServer(bareMetalServerId: string) {
    this.addOrEditAnnouncedSource.next(bareMetalServerId);
  }

  deleteBaremetalServer(bareMetalServerId: string) {
    this.deleteAnnouncedSource.next(bareMetalServerId);
  }

  getManufacturers() {
    return this.http.get<BMServerCRUDManufacturer[]>(BMServer_MANUFACTURERS());
  }

  getModels(manufacturer: string): Observable<Array<BMServerCRUDModel>> {
    return this.http.get<Array<BMServerCRUDModel>>(BMServer_MODELS(manufacturer));
  }

  getOperatingSystem() {
    return this.http.get<BMServerCRUDOperatingSystem[]>(BMServer_OS());
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

  createBMServer(data: BareMetalServerCRUDFormData): Observable<any> {
    return this.http.post<BMServer[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.BARE_METAL_SERVER), data)
  }

  deleteBMServer(bareMetalServerId: string): Observable<any> {
    return this.http.delete(BMServer_DELETE(bareMetalServerId));
  }

  updateBMServer(data: BareMetalServerCRUDFormData, uuid: string): Observable<BMServer[]> {
    return this.http.put<BMServer[]>(BMServer_UPDATE(uuid), data)
  }

  createBareMetalServerForm(bareMetalServerId?: string): Observable<FormGroup> {
    if (bareMetalServerId) {
      return this.http.get<BMServer>(BMServer_UPDATE(bareMetalServerId)).pipe(
        map(bm => {
          let form = this.builder.group({
            'name': [bm.server.name, [Validators.required, NoWhitespaceValidator]],
            'manufacturer': this.builder.group({
              'id': [bm.server.manufacturer ? bm.server.manufacturer.id : '', [Validators.required, NoWhitespaceValidator]]
            }),
            'model': this.builder.group({
              'id': [bm.server.model ? bm.server.model.id : '', [Validators.required, NoWhitespaceValidator]]
            }),
            'num_cpus': [bm.server.num_cpus, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'num_cores': [bm.server.num_cores, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'memory_mb': [bm.server.memory_mb, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'capacity_gb': [bm.server.capacity_gb, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'position': [{ value: bm.server.cabinet ? bm.server.position : '', disabled: bm.server.cabinet ? false : true }, [Validators.min(0), NoWhitespaceValidator]],
            'size': [bm.server.size, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'os': this.builder.group({
              'id': [bm.os ? bm.os.id : '', [Validators.required, NoWhitespaceValidator]],
            }),
            'datacenter': this.builder.group({
              'uuid': [bm.server.datacenter ? bm.server.datacenter.uuid : '', [Validators.required, NoWhitespaceValidator]]
            }),
            'cabinet': this.builder.group({
              'id': [bm.server.cabinet ? bm.server.cabinet.id : '', [NoWhitespaceValidator]]
            }),
            'private_cloud': this.builder.group({
              'id': [bm.server.private_cloud ? bm.server.private_cloud.id : '', [NoWhitespaceValidator]],
            }),
            'asset_tag': [bm.server.asset_tag, [NoWhitespaceValidator]],
            'management_ip': [bm.server.management_ip, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
            'bmc_type': [{ value: bm.bmc_type, disabled: bm.bmc_type && (bm.bmc_type != BMServerSidePlatformMapping.None) }, [Validators.required, NoWhitespaceValidator]],
            'tags': [bm.server.tags.filter(tg => tg)],
            'custom_attribute_data': [bm.custom_attribute_data],
            'life_cycle_stage': [bm.life_cycle_stage ? bm.life_cycle_stage : 'Operational'],
            'life_cycle_stage_status' : [bm.life_cycle_stage_status ? bm.life_cycle_stage_status : 'In Use']
          });
          if (this.userInfo.linkDeviceToCollector) {
            const collector = this.builder.group({
              'uuid': [bm.server.collector ? bm.server.collector.uuid : '', [Validators.required]],
            });
            form.addControl('collector', collector);
          }
          this.snmpCrudSvc.addOrEdit(bm.server);
          return form;
        }));
    } else {
      return of(this.builder.group({
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
        'position': [{ value: '', disabled: true }, [Validators.min(0), NoWhitespaceValidator]],
        'size': ['', [Validators.required, Validators.min(1), NoWhitespaceValidator]],
        'os': this.builder.group({
          'id': ['', [Validators.required, NoWhitespaceValidator]],
        }),
        'datacenter': this.builder.group({
          'uuid': ['', [Validators.required, NoWhitespaceValidator]]
        }),
        'cabinet': this.builder.group({
          'id': ['', [NoWhitespaceValidator]]
        }),
        'private_cloud': this.builder.group({
          'id': ['', [NoWhitespaceValidator]],
        }),
        'asset_tag': ['', [NoWhitespaceValidator]],
        'bmc_type': ['', [Validators.required, NoWhitespaceValidator]],
        'management_ip': ['', [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'tags': [[]],
        'life_cycle_stage': [{ value: 'Operational', disabled: true }],
        'life_cycle_stage_status': [{ value: 'In Use', disabled: true }]
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

  createIPMIForm(bareMetalServerId?: string): Observable<FormGroup> {
    if (bareMetalServerId) {
      return this.http.get<BMServer>(BMServer_UPDATE(bareMetalServerId)).pipe(
        map(im => {
          let form = this.builder.group({
            'ip': [im.bm_controller.ip, [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
            'username': [im.bm_controller.username, [Validators.required, NoWhitespaceValidator]],
            'proxy_url': [im.bm_controller.proxy_url, [Validators.required, NoWhitespaceValidator]],
          });
          return form;
        }));
    } else {
      return of(this.builder.group({
        'ip': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'proxy_url': ['', [Validators.required, NoWhitespaceValidator]],
      }));
    }
  }

  createDARCForm(bareMetalServerId?: string): Observable<FormGroup> {
    if (bareMetalServerId) {
      return this.http.get<BMServer>(BMServer_UPDATE(bareMetalServerId)).pipe(
        map(dr => {
          let form = this.builder.group({
            'version': [dr.bm_controller.version, [Validators.required, NoWhitespaceValidator]],
            'ip': [dr.bm_controller.ip, [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
            'username': [dr.bm_controller.username, [Validators.required, Validators.maxLength(20), NoWhitespaceValidator]],
            'proxy_url': [dr.bm_controller.proxy_url, [Validators.required, NoWhitespaceValidator]]
          });
          return form;
        }));
    } else {
      return of(this.builder.group({
        'version': ['', [Validators.required, NoWhitespaceValidator]],
        'ip': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'username': ['', [Validators.required, Validators.maxLength(20), NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'proxy_url': ['', [Validators.required, NoWhitespaceValidator]],
      }));
    }
  }

  resetBareMetalServerFormErrors() {
    return {
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
      'num_cpus': '',
      'num_cores': '',
      'memory_mb': '',
      'capacity_gb': '',
      'position': '',
      'size': '',
      'os': {
        'id': ''
      },
      'cabinet': {
        'id': ''
      },
      'asset_tag': '',
      'management_ip': '',
      'bmc_type': '',
      'collector': {
        'uuid': ''
      },
      'life_cycle_stage' : '',
      'life_cycle_stage_status': ''
    };
  }

  resetIPMIFormErrors() {
    return {
      'ip': '',
      'username': '',
      'password': '',
      'proxy_url': ''
    };
  }

  resetDRACFormErrors() {
    return {
      'version': '',
      'ip': '',
      'username': '',
      'password': '',
      'proxy_url': ''
    };
  }

  validationMessages = {
    bareMetalServerMessages: {
      'name': {
        'required': 'Bare Metal Server name is required'
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
      'position': {
        'min': 'Minimum value should be greater than or equal to 0'
      },
      'size': {
        'required': 'Size is required',
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
      'bmc_type': {
        'required': 'BM Controller is required'
      },
      'collector': {
        'uuid': {
          'required': 'Collector is required'
        }
      },
      'life_cycle_stage': {
        'required': 'Life Cycle Stage is required'
      },
      'life_cycle_stage_status': {
        'required': 'Life Cycle Stage Status is required'
      },
    },
    IPMIFormMessages: {
      'ip': {
        'required': 'IP is required',
        'ip': 'Invalid IP'
      },
      'username': {
        'required': 'Username  is required'
      },
      'password': {
        'required': 'Password is required'
      },
      'proxy_url': {
        'required': 'Proxy URL is required'
      }
    },
    DRACFormMessages: {
      'version': {
        'required': 'DRAC Version is required'
      },
      'ip': {
        'required': 'IP address is required',
        'ip': 'Invalid IP'
      },
      'username': {
        'required': 'Username  is required',
        'maxlength': 'Username can have maximum of 20 characters',
      },
      'password': {
        'required': 'Password is required'
      },
      'proxy_url': {
        'required': 'Proxy URL is required'
      }
    }
  }
}

export class BareMetalServerCRUDFormData extends SNMPCrudTypeClass {
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
  position: number;
  size: number;
  os: {
    id: string;
  }
  cabinet: {
    id: string;
  }
  asset_tag: string;
  management_ip: string;
  bmc_type: string;
  version: number;
  ip: string;
  username: string;
  password: string;
  proxy_url: string;
  collector: {
    uuid: string;
  };
  tags: string[];
  custom_attribute_data?: { [key: string]: any }
}


