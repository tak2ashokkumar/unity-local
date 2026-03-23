import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { GET_ADVANCED_DISCOVERY_CREDENTIALS } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { NCMConfigureDeviceFormDataType, NetworkConfigurationDeviceType, ValidateCredentialsFormDataType } from './nc-configure.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class NcConfigureService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getCredentials(): Observable<Array<DeviceDiscoveryCredentials>> {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<Array<DeviceDiscoveryCredentials>>(GET_ADVANCED_DISCOVERY_CREDENTIALS(), { params: param });
  }

  getDevices(criteria: SearchCriteria): Observable<PaginatedResult<NetworkConfigurationDeviceType>> {
    return this.tableService.getData<PaginatedResult<NetworkConfigurationDeviceType>>(`customer/network_devices/`, criteria);
  }

  buildForm(): FormGroup {
    return this.builder.group({
      'device_type': ['']
    });
  }

  convertToViewData(data: NetworkConfigurationDeviceType[]): NetworkDeviceViewData[] {
    let viewData: NetworkDeviceViewData[] = [];
    data.forEach(device => {
      let view: NetworkDeviceViewData = new NetworkDeviceViewData();
      view.uuid = device.uuid;
      view.name = device.name;
      view.deviceType = device.device_type;
      view.deviceTypeDisplayName = device.device_type ? this.utilSvc.getDeviceMappingByDeviceType(device.device_type) : 'N/A';
      view.ip = device.management_ip;
      view.form = this.buildDeviceForm(device);
      view.formErrors = this.resetDeviceFormErrors();
      view.validationMessages = this.deviceValdiationMessages;
      view.isConfigured = device.is_ncm_enabled;
      view.inProgress = device.is_in_progress;
      viewData.push(view);
    })
    return viewData;
  }

  buildDeviceForm(device: NetworkConfigurationDeviceType): FormGroup {
    return this.builder.group({
      'ncm_credentials': [{ value: device.ncm_credentials ? device.ncm_credentials : '', disabled: true }],
      'enable_or_encrypted_password': [{ value: device.enable_or_encrypted_password ? device.enable_or_encrypted_password : '', disabled: true }],
      'config_device_type': [{ value: device.config_device_type ? device.config_device_type : '', disabled: true }]
    });
  }

  resetDeviceFormErrors() {
    return {
      'ncm_credentials': '',
      'config_device_type': ''
    }
  }

  deviceValdiationMessages = {
    'ncm_credentials': {
      'required': 'Credential is required'
    },
    'config_device_type': {
      'required': 'Config Device Type is required'
    }
  }

  syncConfiguration(deviceId: string, deviceType: string) {
    return this.http.get<CeleryTask>(`/customer/ncm_devices/${deviceId}/sync_configuration/${deviceType}/`)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 60, 100).pipe(take(1))), take(1));
  }

  validateCredentials(data: ValidateCredentialsFormDataType) {
    return this.http.post(`/customer/ncm_devices/validate_credentials/`, data);
  }

  configureDevice(data: NCMConfigureDeviceFormDataType): Observable<CeleryTask> {
    return this.http.post<CeleryTask>(`/customer/ncm_devices/`, data);
  }

  bulkUpdate(data: NCMConfigureDeviceFormDataType): Observable<CeleryTask> {
    return this.http.post<CeleryTask>(`/customer/ncm_devices/`, data);
  }

  syncDeviceData(taskId: string) {
    return this.appService.pollForTask(taskId, 5, 25).pipe(take(1));
  }

  deleteDeviceConfig(deviceId: string, deviceType: string) {
    return this.http.delete(`/customer/ncm_devices/${deviceId}/${deviceType}/`);
  }
}

export class NetworkDeviceViewData {
  constructor() { }
  name: string;
  uuid: string;
  ip: string;
  deviceType: string;
  deviceTypeDisplayName: string;
  credential: string;
  password: string;
  syncInProgress: boolean = false;
  isSelected: boolean = false;
  onEdit: boolean = false;
  onValidateCredBtn: boolean = false;
  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  isConfigured: boolean;
  inProgress: boolean;
}

export const deviceTypes: Array<{ name: string, displayName: string }> = [
  {
    name: "switch",
    displayName: "Switch"
  },
  {
    name: "firewall",
    displayName: "Firewall"
  },
  {
    name: "load_balancer",
    displayName: "Load Balancer"
  }
];

export const configDeviceTypeList: LabelValueType[] = [
  {
    'label': 'Cisco IOS',
    'value': 'cisco_ios'
  },
  {
    'label': 'Cisco FTD',
    'value': 'cisco_ftd'
  },
  {
    'label': 'Cisco Nexus',
    'value': 'cisco_nxos'
  },
  {
    'label': 'F5 LTM',
    'value': 'f5_ltm'
  },
  {
    'label': 'Fortinet',
    'value': 'fortinet'
  },
  {
    'label': 'Palo Alto',
    'value': 'paloalto_panos'
  }
]