import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DATA_CENTERS, DEVICE_MODELS, FIREWALL_MANUFACTURERS, GET_AGENT_CONFIGURATIONS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { FirewallCRUDManufacturer } from 'src/app/united-cloud/shared/entities/firewall-crud.type';
import { SwitchCRUDModel } from 'src/app/united-cloud/shared/entities/switch-crud.type';
import { ManageReportDatacenterType } from 'src/app/unity-reports/manage-reports/manage-report-crud/datacenter-report-crud/datacenter-report-crud.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { NCMDeviceType, NCMRunningConfigurationType, NCMStartupConfigurationType, NCMSummaryType, NCMValidateCredentialsFormDataType } from './nc-status.type';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class NcStatusService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder) { }

  getDatacenters(): Observable<ManageReportDatacenterType[]> {
    return this.http.get<ManageReportDatacenterType[]>(DATA_CENTERS(), { params: new HttpParams().set('page_size', '0') })
  }

  getManufacturers(): Observable<FirewallCRUDManufacturer[]> {
    return this.http.get<FirewallCRUDManufacturer[]>(FIREWALL_MANUFACTURERS());
  }

  getNCMSummaryData(criteria: SearchCriteria): Observable<NCMSummaryType> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<NCMSummaryType>(`/customer/ncm_devices/summary/`, { params: params });
  }

  getNCMDevices(criteria: SearchCriteria): Observable<PaginatedResult<NCMDeviceType>> {
    return this.tableService.getData<PaginatedResult<NCMDeviceType>>(`/customer/ncm_devices/`, criteria);
  }

  getModels(manufacturer: string, deviceType: string): Observable<Array<SwitchCRUDModel>> {
    const convertedDeviceType: DeviceMapping = this.utilSvc.getDeviceMappingByDeviceType(deviceType);
    return this.http.get<Array<SwitchCRUDModel>>(DEVICE_MODELS(convertedDeviceType, manufacturer));
  }

  getStartupConfigDetails(deviceType: string, deviceId: string): Observable<NCMStartupConfigurationType> {
    let params: HttpParams = new HttpParams().set('device_type', deviceType).set('device_uuid', deviceId);
    return this.http.get<NCMStartupConfigurationType>(`/customer/device_configuration/startup_configuration/`, { params: params });
  }

  getRunningConfigDetails(deviceType: string, deviceId: string): Observable<NCMRunningConfigurationType> {
    let params: HttpParams = new HttpParams().set('device_type', deviceType).set('device_uuid', deviceId);
    return this.http.get<NCMRunningConfigurationType>(`/customer/device_configuration/running_configuration/`, { params: params });
  }

  getCollectors() {
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: new HttpParams().set('page_size', '0') });
  }

  convertToViewData(data: NCMDeviceType[]): NCMDeviceViewData[] {
    let viewData: NCMDeviceViewData[] = [];
    data.forEach(val => {
      let view: NCMDeviceViewData = new NCMDeviceViewData();
      view.name = val.name ? val.name : 'N/A';
      view.uuid = val.uuid;
      view.datacenterName = val.datacenter_name ? val.datacenter_name : 'N/A';
      view.deviceTypeDisplayName = val.device_type ? this.utilSvc.getDeviceMappingByDeviceType(val.device_type) : 'N/A';
      view.deviceType = val.device_type ? val.device_type : 'N/A';
      view.deviceTypeForURL = this.getDeviceTypeForURL(val.device_type);
      view.mangementIp = val.management_ip ? val.management_ip : 'N/A';
      view.model = val.model ? val.model : 'N/A';
      view.manufacturer = val.manufacturer ? val.manufacturer : 'N/A';
      view.lastBackupDate = val.last_backup ? this.utilSvc.toUnityOneDateFormat(val.last_backup) : 'N/A';
      view.status = this.utilSvc.getDeviceStatus(val.status);
      view.hasStartupConfig = val.has_startup_config;
      view.isRunningConfigEncrypted = val.is_running_config_encrypted;
      view.isValidated = false;
      viewData.push(view);
    })
    return viewData;
  }

  buildCredentialsForm(): FormGroup {
    return this.builder.group({
      'username': ['', [Validators.required]],
      'password': ['', [Validators.required]],
      'enable_or_encrypted_password': [''],
    });
  }

  resetCredentialsFormErrors() {
    return {
      'username': '',
      'password': '',
    }
  }

  credentialsFormValdiationMessages = {
    'username': {
      'required': 'Username is required'
    },
    'password': {
      'required': 'password is required'
    },
  }

  validateCredentials(data: NCMValidateCredentialsFormDataType): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(`/customer/validate_device_credentials/`, data);
  }

  convertToConfigDetails(configData: NCMStartupConfigurationType) {
    let viewData: NCMConfigDetailsViewData = new NCMConfigDetailsViewData();
    if (configData.is_valid) {
      viewData.statusIcon = `fa-circle text-success`;
      viewData.statusTooltip = `Valid`;
    } else {
      viewData.statusIcon = `fa-circle text-danger`;
      viewData.statusTooltip = `Invalid`;
    }
    viewData.data = configData.data;
    return viewData;
  }

  getDeviceTypeForURL(deviceType: string) {
    switch (deviceType) {
      case 'switch':
        return 'switch';
      case 'firewall':
        return 'firewall';
      case 'load_balancer':
        return 'load-balancer';
      default:
        return;
    }
  }
}

export class NCMDeviceViewData {
  constructor() { };
  uuid: string;
  name: string;
  deviceType: string;
  deviceTypeDisplayName: string;
  deviceTypeForURL: string;
  manufacturer: string;
  model: string;
  mangementIp: string;
  datacenterName: string;
  status: string;
  statusIcon: string;
  lastBackupDate: string;
  hasStartupConfig: boolean;
  hasRunningConfig: boolean;
  isRunningConfigEncrypted: boolean;
  isValidated: boolean;
  activeActionBtn: string;
}

export class NCMConfigDetailsViewData {
  constructor() { }
  statusIcon: string;
  statusTooltip: string;
  data: string;
}

export const statusOptions: LabelValueType[] = [
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
  }];