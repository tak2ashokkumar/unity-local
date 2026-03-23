import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CABINET_FAST_BY_DEVICE_ID, DEVICES_FAST_BY_DEVICE_TYPE, DEVICE_LIST_BY_DEVICE_TYPE, GET_AGENT_CONFIGURATIONS, HYPERVISOR_DELETE, HYPERVISOR_MANUFACTURERS, HYPERVISOR_MODELS, HYPERVISOR_OS, HYPERVISOR_RESET_PASSWORD, HYPERVISOR_UPDATE, PRIVATE_CLOUD_FAST_BY_DC_ID } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { DevicesCrudMonitoringService } from '../../devices-crud-monitoring/devices-crud-monitoring.service';
import { HypervisorCRUDManufacturer, HypervisorCRUDModel, HypervisorCRUDOperatingSystem } from '../../entities/hypervisor-crud.type';
import { Hypervisor } from '../../entities/hypervisor.type';
import { SNMPCrudTypeClass } from '../../entities/snmp-crud.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Injectable()
export class HypervisorsCrudService {
  private addOrEditAnnouncedSource = new Subject<string>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private resetPasswordAnnouncedSource = new Subject<string>();
  resetPasswordAnnounced$ = this.resetPasswordAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder, private http: HttpClient,
    private snmpCrudSvc: DevicesCrudMonitoringService,
    private userInfo: UserInfoService) { }

  addOrEditHypervisor(hypervisorId: string) {
    this.addOrEditAnnouncedSource.next(hypervisorId);
  }

  resetPassword(hypervisorId: string) {
    this.resetPasswordAnnouncedSource.next(hypervisorId);
  }

  deleteHypervisor(hypervisorId: string) {
    this.deleteAnnouncedSource.next(hypervisorId);
  }

  getManufacturers() {
    return this.http.get<HypervisorCRUDManufacturer[]>(HYPERVISOR_MANUFACTURERS());
  }

  getModels(manufacturer: string): Observable<Array<HypervisorCRUDModel>> {
    return this.http.get<Array<HypervisorCRUDModel>>(HYPERVISOR_MODELS(manufacturer));
  }

  getOperatingSystem() {
    return this.http.get<HypervisorCRUDOperatingSystem[]>(HYPERVISOR_OS());
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

  createHypervisorForm(hypervisorId?: string): Observable<FormGroup> {
    if (hypervisorId) {
      return this.http.get<Hypervisor>(HYPERVISOR_UPDATE(hypervisorId)).pipe(
        map(hy => {
          let form = this.builder.group({
            'name': [hy.name, [Validators.required, NoWhitespaceValidator]],
            'manufacturer': this.builder.group({
              'id': [hy.manufacturer ? hy.manufacturer.id : '', [Validators.required, NoWhitespaceValidator]]
            }),
            'model': this.builder.group({
              'id': [hy.model ? hy.model.id : '', [Validators.required, NoWhitespaceValidator]]
            }),
            'num_cpus': [hy.num_cpus, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'num_cores': [hy.num_cores, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'memory_mb': [hy.memory_mb, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'capacity_gb': [hy.capacity_gb, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'position': [{ value: hy.cabinet ? hy.position : '', disabled: hy.cabinet ? false : true }, [Validators.min(0), NoWhitespaceValidator]],
            'size': [hy.size, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
            'virtualization_type': [hy.instance.virtualization_type == 'None' ? '' : hy.instance.virtualization_type, [Validators.required, NoWhitespaceValidator]],
            'os': this.builder.group({
              'id': [hy.instance.os ? hy.instance.os.id : '', [Validators.required, NoWhitespaceValidator]],
            }),
            'datacenter': this.builder.group({
              'uuid': [hy.datacenter ? hy.datacenter.uuid : '', [Validators.required, NoWhitespaceValidator]]
            }),
            'cabinet': this.builder.group({
              'id': [hy.cabinet ? hy.cabinet.id : '', [NoWhitespaceValidator]]
            }),
            'private_cloud': this.builder.group({
              'id': [hy.private_cloud ? hy.private_cloud.id : '', [NoWhitespaceValidator]],
            }),
            'asset_tag': [hy.asset_tag, [NoWhitespaceValidator]],
            'management_ip': [hy.management_ip, [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
            'tags': [hy.tags.filter(tg => tg)],
            'custom_attribute_data': [hy.custom_attribute_data],
            'life_cycle_stage': [hy.life_cycle_stage ? hy.life_cycle_stage : 'Operational'],
            'life_cycle_stage_status' : [hy.life_cycle_stage_status ? hy.life_cycle_stage_status : 'In Use']
          });
          if (this.userInfo.linkDeviceToCollector) {
            const collector = this.builder.group({
              'uuid': [hy.collector ? hy.collector.uuid : '', [Validators.required]],
            });
            form.addControl('collector', collector);
          }
          this.snmpCrudSvc.addOrEdit(hy);
          if (hy.proxy && hy.proxy.backend_url) {
            form.addControl('backend_url', new FormControl(hy.proxy.backend_url, [NoWhitespaceValidator, Validators.required]));
          }
          if (hy.esxi_hostname && hy.esxi_username) {
            form.addControl('hostname', new FormControl(hy.esxi_hostname, [NoWhitespaceValidator, Validators.required]));
            form.addControl('username', new FormControl(hy.esxi_username, [NoWhitespaceValidator, Validators.required]));
            // form.addControl('password', new FormControl('', [NoWhitespaceValidator, Validators.required]));
          }
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
        'virtualization_type': ['', [Validators.required, NoWhitespaceValidator]],
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
        'management_ip': ['', [NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'tags': [[]],
        'life_cycle_stage': [{ value: 'Operational', disabled: true }],
        'life_cycle_stage_status': [{ value: 'In Use', disabled: true }]
      })).pipe(map(form => {
        this.snmpCrudSvc.addOrEdit(null);
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

  resetHypervisorsFormErrors() {
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
      'num_cpus': '',
      'num_cores': '',
      'memory_mb': '',
      'capacity_gb': '',
      'position': '',
      'size': '',
      'virtualization_type': '',
      'os': {
        'id': ''
      },
      'datacenter': {
        'uuid': ''
      },
      'cabinet': {
        'id': ''
      },
      'asset_tag': '',
      'management_ip': '',
      'ip_address': '',
      'snmp_community': '',
      'backend_url': '',
      'snmp_authlevel': '',
      'snmp_authname': '',
      'snmp_authpass': '',
      'snmp_authalgo': '',
      'snmp_cryptopass': '',
      'snmp_cryptoalgo': '',
      'hostname': '',
      'username': '',
      'password': '',
      'collector': {
        'uuid': ''
      },
      'life_cycle_stage' : '',
      'life_cycle_stage_status': ''
    };
  }

  hypervisorsValidationMessages = {
    'name': {
      'required': 'Hypervisor name is required'
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
    'virtualization_type': {
      'required': 'Virtualization Type is required'
    },
    'os': {
      'id': {
        'required': 'OS is required'
      }
    },
    'management_ip': {
      'ip': 'Invalid IP'
    },
    'backend_url': {
      'required': 'Web Url is required'
    },
    'hostname': {
      'required': 'Hostname is required'
    },
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
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
  }

  createHypervisor(data: HypervisorCURDFormData): Observable<any> {
    return this.http.post<Hypervisor[]>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.HYPERVISOR), data)
  }

  deleteHypervisorServer(hypervisorId: string): Observable<any> {
    return this.http.delete(HYPERVISOR_DELETE(hypervisorId));
  }

  updateHypervisor(data: HypervisorCURDFormData, uuid: string): Observable<Hypervisor[]> {
    return this.http.put<Hypervisor[]>(HYPERVISOR_UPDATE(uuid), data)
  }

  buildResetPasswordForm(hypervisorId: string): Observable<FormGroup> {
    return this.http.get<Hypervisor>(HYPERVISOR_UPDATE(hypervisorId)).pipe(
      map(hy => {
        let form = this.builder.group({
          'hostname': [{ value: hy.esxi_hostname ? hy.esxi_hostname : '', disabled: hy.esxi_hostname ? true : false }, [NoWhitespaceValidator, Validators.required]],
          'username': [{ value: hy.esxi_username ? hy.esxi_username : '', disabled: hy.esxi_username ? true : false }, [NoWhitespaceValidator, Validators.required]],
          'password': ['', [NoWhitespaceValidator, Validators.required]],
        });
        return form;
      }));
  }

  resetResetPasswordFormErrors() {
    return {
      'hostname': '',
      'username': '',
      'password': ''
    }
  }

  resetPasswordFormValidationMessages = {
    'hostname': {
      'required': 'Hostname is required'
    },
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'Password is required'
    }
  }

  resetHypervisorPassword(formData: any, uuid: string): Observable<any> {
    return this.http.post<any>(HYPERVISOR_RESET_PASSWORD(uuid), formData)
  }
}

export class HypervisorCURDFormData extends SNMPCrudTypeClass {
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
  virtualization_type: string;
  os: {
    id: string;
  }
  cabinet: {
    id: string;
  }
  asset_tag: string;
  management_ip: string;
  backend_url?: string;
  hostname?: string;
  username?: string;
  password?: string;
  tags: string[];
  collector: {
    uuid: string;
  }
}

export const LifeCycleStageOptions = [
  'Defective',
  'Deploy',
  'End of Life',
  'End of Operation',
  'Inventory',
  'Missing',
  'Operational',
  'Purchase',
]
export const LifeCycleStageStatusOptions = [
  'Buy Out',
  'Disposed',
  'Donated',  
  'In Stock',
  'In Transit',
  'In Use',
  'Lease Return',
  'Pending Certificate',
  'Pending Disposal',  
  'Pending Transfer',
  'Pending Retirement',
  'Reserved',
  'Retired',
  'RMA',
  'Sold',
  'Test',
  'Vendor Credit',
]
