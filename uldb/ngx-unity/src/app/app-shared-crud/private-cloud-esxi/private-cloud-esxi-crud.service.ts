import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, of } from 'rxjs';
import { CABINET_FAST_BY_DEVICE_ID, DATA_CENTERS, GET_AGENT_CONFIGURATIONS, HYPERVISOR_MANUFACTURERS, HYPERVISOR_MODELS, HYPERVISOR_OS } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DataCenter } from 'src/app/united-cloud/datacenter/tabs';
import { HypervisorCRUDManufacturer, HypervisorCRUDModel, HypervisorCRUDOperatingSystem } from 'src/app/united-cloud/shared/entities/hypervisor-crud.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { CreateEsxiServerFormData, EsxiServerAccount, EsxiServers } from './private-cloud-esxi.type';

@Injectable()
export class PrivateCloudEsxiCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder, private tableService: TableApiServiceService,
  ) { }

  loadDatacenters(): Observable<DataCenter[]> {
    return this.http.get<DataCenter[]>(DATA_CENTERS(), { params: { 'page_size': '0' } });
  }
  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }
  getEsxiServers(criteria: SearchCriteria): Observable<PaginatedResult<EsxiServers>> {
    return this.tableService.getData<PaginatedResult<EsxiServers>>(`/customer/servers/?virtualization_type=ESXi`, criteria);
  }

  getManufacturers(): Observable<HypervisorCRUDManufacturer[]> {
    return this.http.get<HypervisorCRUDManufacturer[]>(HYPERVISOR_MANUFACTURERS());
  }

  getModels(manufacturer: string): Observable<HypervisorCRUDModel[]> {
    return this.http.get<HypervisorCRUDModel[]>(HYPERVISOR_MODELS(manufacturer));
  }

  getOperatingSystems(): Observable<HypervisorCRUDOperatingSystem[]> {
    return this.http.get<HypervisorCRUDOperatingSystem[]>(HYPERVISOR_OS());
  }

  getCabinets(dcId: string): Observable<CabinetFast[]> {
    return this.http.get<CabinetFast[]>(CABINET_FAST_BY_DEVICE_ID(dcId));
  }


  getInstanceDetails(instanceId: string): Observable<EsxiServerAccount> {
    return this.http.get<EsxiServerAccount>(`/customer/integration/esxi/accounts/${instanceId}/`);
  }

  saveCredentialsForm(data: any, instanceId?: string,): Observable<any> {
    if (instanceId) {
      return this.http.patch<any>(`/customer/integration/esxi/accounts/${instanceId}/`, data);
    } else {
      return this.http.post<any>(`/customer/integration/esxi/accounts/`, data);
    }
  }

  saveSelectedServers(servers: string[], instanceId?: string): Observable<any> {
    const payload = { servers };

    return this.http.post<any>(`/customer/integration/esxi/accounts/${instanceId}/add_servers/`, payload);

  }

  saveInstance(data: any, instanceId: string) {
    return this.http.put<any>(`/customer/integration/esxi/accounts/${instanceId}/`, data);
  }

  createEsxiServer(instanceId: string, data: CreateEsxiServerFormData): Observable<any> {
    return this.http.post<any>(`/customer/integration/esxi/accounts/${instanceId}/create_server/`, data);
  }

  buildCreateEsxiForm(): Observable<FormGroup> {
    return of(this.builder.group({
      name: ['', [Validators.required, NoWhitespaceValidator]],
      manufacturer: this.builder.group({
        id: ['', [Validators.required, NoWhitespaceValidator]]
      }),
      model: this.builder.group({
        id: ['', [Validators.required, NoWhitespaceValidator]]
      }),
      position: ['', [NoWhitespaceValidator]],
      size: [1, [Validators.required, Validators.min(1), NoWhitespaceValidator]],
      os: this.builder.group({
        id: ['', [Validators.required, NoWhitespaceValidator]]
      }),
      cabinet: this.builder.group({
        id: ['', [NoWhitespaceValidator]]
      }),
      asset_tag: ['', [NoWhitespaceValidator]],
      management_ip: ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      life_cycle_stage: ['Operational', [Validators.required, NoWhitespaceValidator]],
      life_cycle_stage_status: ['In Use', [Validators.required, NoWhitespaceValidator]],
      hostname: ['', [Validators.required, NoWhitespaceValidator]],
      username: ['', [Validators.required, NoWhitespaceValidator]],
      password: ['', [Validators.required, NoWhitespaceValidator]],
      custom_attribute_data: [{}]
    }));
  }

  resetCreateEsxiFormErrors() {
    return {
      name: '',
      manufacturer: {
        id: ''
      },
      model: {
        id: ''
      },
      position: '',
      size: '',
      os: {
        id: ''
      },
      cabinet: {
        id: ''
      },
      asset_tag: '',
      management_ip: '',
      life_cycle_stage: '',
      life_cycle_stage_status: '',
      hostname: '',
      username: '',
      password: ''
    };
  }

  createEsxiFormValidationMessages = {
    name: {
      required: 'Name is required'
    },
    manufacturer: {
      id: {
        required: 'Manufacturer is required'
      }
    },
    model: {
      id: {
        required: 'Model is required'
      }
    },
    size: {
      required: 'Size is required',
      min: 'Minimum value should be greater than or equal to 1'
    },
    os: {
      id: {
        required: 'OS is required'
      }
    },
    management_ip: {
      required: 'Management IP is required',
      ip: 'Invalid IP'
    },
    life_cycle_stage: {
      required: 'Life Cycle Stage is required'
    },
    life_cycle_stage_status: {
      required: 'Life Cycle Stage Status is required'
    },
    hostname: {
      required: 'Hostname is required'
    },
    username: {
      required: 'Username is required'
    },
    password: {
      required: 'Password is required'
    }
  };

  convertToViewData(data: EsxiServers[]): EsxiServerViewData[] {
    return (data || []).map((item: EsxiServers) => ({
      serverName: item?.instance?.name || '',
      uuid: item?.uuid || '',
      status: item?.status || '',
      statusText: +item.status === 0 ? 'Pending' : 'Active',
      statusClass: +item.status === 0 ? 'text-danger' : 'text-success',
      os: item?.os?.full_name || '',
      tagsList: (item?.tags || []).map((tag: any) => typeof tag === 'string' ? tag : (tag?.name || '')).filter(Boolean),
      tag: item?.tags.length ? item.tags[0] : '',
      extraTags: item?.tags.length ? item.tags.slice(1) : [],
      isSelected: false
    }));
  }


  buildCredentialForm(d: any): FormGroup {
    return this.builder.group({
      'name': [d?.name ?? '', [Validators.required]],
      'colocation_cloud': this.builder.group({
        'uuid': [d?.colocation_cloud?.uuid ?? '', [Validators.required]]
      }),
      'collector': this.builder.group({
        'uuid': [d?.collector?.uuid ?? '', [Validators.required]]
      }),
      'schedule_meta': this.builder.group({
        'run_now': [d?.schedule_meta?.run_now ?? false],
        'schedule_type': [d?.schedule_meta?.schedule_type ?? 'none', [Validators.required]]
      })
    });
  }

  resetCredentialFormErrors() {
    return {
      'name': '',
      'colocation_cloud': {
        'uuid': ''
      },
      'collector': {
        'uuid': ''
      },
      'schedule_meta': {
        'schedule_type': ''
      }
    };
  }

  credentialFormValidationMessages = {
    'name': {
      'required': 'Account name is required'
    },
    'colocation_cloud': {
      'uuid': {
        'required': 'Datacenter is required'
      }
    },
    'collector': {
      'uuid': {
        'required': 'Collector is required'
      }
    },
    'schedule_meta': {
      'schedule_type': {
        'required': 'Schedule type is required'
      }
    }
  };
}

export class EsxiServerViewData {
  serverName: string;
  uuid: string;
  status: string;
  statusText: string;
  statusClass: string;
  os: string;
  tagsList: string[];
  tag: string;
  extraTags: string[];
  isSelected: boolean;
}

