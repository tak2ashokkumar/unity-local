import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { NoWhitespaceValidator, SNMPVersionMapping, AuthLevelMapping, AtLeastOneInputHasValue } from 'src/app/shared/app-utility/app-utility.service';
import { MonitoringConfigurationDevice, MonitoringConfigurationDeviceSummary, MonitoringConfigurationDeviceMonitoring } from './monitoring-configuration.type';
import { SNMPCrudType } from 'src/app/united-cloud/shared/entities/snmp-crud.type';
import { RxwebValidators, IpVersion } from '@rxweb/reactive-form-validators';
import { DELETE_BULK_MONITORING, DISABLE_BULK_MONITORING, ENABLE_BULK_MONITORING, BULK_MONITORING, DEVICES_MONITORING_DETAILS, DEVICES_MONITORING_SUMMARY, ACTIVATE_BULK_MONITORING } from 'src/app/shared/api-endpoint.const';
import { format } from 'path';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Injectable()
export class MonitoringConfigurationService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService,) { }

  getDevicesSummary(): Observable<MonitoringConfigurationDeviceSummary> {
    return this.http.get<MonitoringConfigurationDeviceSummary>(DEVICES_MONITORING_SUMMARY());
  }

  getAllDevices(filter: MonitoringConfigurationDeviceViewDataFilter, currentCriteria: SearchCriteria): Observable<PaginatedResult<MonitoringConfigurationDevice>> {
    // let params: HttpParams = new HttpParams().set('status', filter.status);
    if (filter.status) {
      currentCriteria.params[0].status = filter.status;
    }
    if (filter.device_type) {
      currentCriteria.params[0].device_type = filter.device_type;
    } else {
      currentCriteria.params[0].device_type = null;
    }
    if (filter.snmp_version) {
      currentCriteria.params[0].snmp_version = filter.snmp_version;
    } else {
      currentCriteria.params[0].snmp_version = null;
    }
    if (filter.search) {
      currentCriteria.params[0].search = filter.search;
    } else {
      currentCriteria.params[0].search = null;
    }
    return this.tableService.getData<PaginatedResult<MonitoringConfigurationDevice>>(DEVICES_MONITORING_DETAILS(), currentCriteria);
  }

  convertToViewData(devices: MonitoringConfigurationDevice[]): MonitoringConfigurationDeviceViewData[] {
    let viewData: MonitoringConfigurationDeviceViewData[] = [];
    devices.map(d => {
      let a: MonitoringConfigurationDeviceViewData = new MonitoringConfigurationDeviceViewData();
      a.deviceId = d.uuid;
      a.deviceName = d.name;
      a.deviceType = d.device_type;
      a.managementIP = d.management_ip;
      a.monitoringStatus = d.monitoring.configured ? (d.monitoring.enabled ? 'Enabled' : 'Disabled') : 'Not Configured';
      a.snmpIP = d.ip_address;
      a.snmpVersion = d.snmp_version;
      a.snmpCommunity = d.snmp_community;
      a.snmpAuthLevel = d.snmp_authlevel;
      a.monitoring = d.monitoring;

      a.form = this.builder.group({
        'connection_type': [{ value: 'SNMP', disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'ip_address': [{ value: d.ip_address ? d.ip_address : '', disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'snmp_version': [{ value: d.snmp_version ? d.snmp_version : '', disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'snmp_community': [{ value: d.snmp_community, disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'snmp_authlevel': [{ value: d.snmp_authlevel ? d.snmp_authlevel : '', disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'snmp_authname': [{ value: d.snmp_authname, disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'snmp_authpass': [{ value: d.snmp_authpass, disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'snmp_authalgo': [{ value: d.snmp_authalgo, disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'snmp_cryptopass': [{ value: d.snmp_cryptopass, disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'snmp_cryptoalgo': [{ value: d.snmp_cryptoalgo, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      });
      if (['switch', 'firewall', 'load_balancer'].includes(a.deviceType)) {
        a.applicableModulePermissions = d.applicable_module_permissions;
      }
      viewData.push(a);
    })
    return viewData;
  }

  formValidationMessages = {
    'snmp_version': {
      'required': 'SNMP Protocol Version is required',
    },
    'snmp_community': {
      'required': 'SNMP String is required',
    },
    'snmp_authlevel': {
      'required': 'Auth Level is required'
    },
    'snmp_authname': {
      'required': 'Auth Username is required'
    },
    'snmp_authpass': {
      'required': 'Auth Password is required'
    },
    'snmp_authalgo': {
      'required': 'Auth Algorithm is required'
    },
    'snmp_cryptopass': {
      'required': 'Crypto Password is required'
    },
    'snmp_cryptoalgo': {
      'required': 'Crypto Algorithm is required'
    }
  }

  buildFilterForm(status: string): FormGroup {
    return this.builder.group({
      'status': [status],
      'device_type': [''],
      'snmp_version': [''],
      'search': [''],
    }, {
      validators: AtLeastOneInputHasValue(['device_type', 'snmp_version', 'search'])
    })
  }

  private getRawValue(obj: SNMPCrudType) {
    // let obj = <SNMPCrudType>this.form.getRawValue();
    let formData: SNMPCrudType = {
      connection_type: obj.connection_type, ip_address: obj.ip_address, snmp_version: obj.snmp_version, snmp_authlevel: '', snmp_community: '', snmp_authname: '', snmp_authpass: '', snmp_authalgo: '', snmp_cryptoalgo: '', snmp_cryptopass: ''
    };
    switch (obj.snmp_version) {
      case SNMPVersionMapping.V1:
      case SNMPVersionMapping.V2C:
        formData.snmp_community = obj.snmp_community;
        break;
      case SNMPVersionMapping.V3:
        formData.snmp_authlevel = obj.snmp_authlevel;
        break;
    }
    switch (obj.snmp_authlevel) {
      case AuthLevelMapping.AuthPriv:
        formData.snmp_cryptoalgo = obj.snmp_cryptoalgo;
        formData.snmp_cryptopass = obj.snmp_cryptopass;
      case AuthLevelMapping.AuthNoPriv:
        formData.snmp_authname = obj.snmp_authname;
        formData.snmp_authpass = obj.snmp_authpass;
        formData.snmp_authalgo = obj.snmp_authalgo;
        break;
      case AuthLevelMapping.NoAuthNoPriv:
        formData.snmp_authname = obj.snmp_authname;
        break;
      default:
        break;
    }
    return formData;
  }

  form: FormGroup;

  buildForm(obj?: SNMPCrudType) {
    //TODO:Remove after server side fixed
    if (obj) {
      obj = this.getRawValue(obj);
    }

    this.form = this.builder.group({
      'connection_type': [{ value: obj ? obj.connection_type : 'SNMP', disabled: obj ? true : false }, [Validators.required, NoWhitespaceValidator]]
    });
    if (this.form.get('connection_type').value == 'SNMP') {
      if (obj && obj.hasOwnProperty('ip_address')) {
        switch (obj.snmp_version) {
          case SNMPVersionMapping.V1:
          case SNMPVersionMapping.V2C:
            this.addV1_V2Field(obj);
          case SNMPVersionMapping.V3:
          default:
            this.addDefaultFeilds(obj);
            break;
        }

        if (obj.snmp_authlevel) {
          this.addAuthLevelField(obj);
        }
        switch (obj.snmp_authlevel) {
          /**
           * NOTE: No need of `break` here, AuthPriv requires the next 2 case controls
           */
          case AuthLevelMapping.AuthPriv:
            this.addCryptoFields();
          case AuthLevelMapping.AuthNoPriv:
            this.addAuthFields();
            break;
          case AuthLevelMapping.NoAuthNoPriv:
            this.addAuthNameField();
            break;
          default:
            break;
        }
      } else {
        this.addDefaultFeilds();
      }
    } else {
      this.form.addControl('ip_address', new FormControl(obj && obj.ip_address ? obj.ip_address : '',
        [NoWhitespaceValidator, Validators.required, RxwebValidators.ip({ version: IpVersion.AnyOne })]));
    }
    return this.form;
  }

  private addDefaultFeilds(val?: SNMPCrudType) {
    if (val) {
      this.form.addControl('ip_address', new FormControl(val && val.ip_address ? val.ip_address : '',
        [NoWhitespaceValidator, Validators.required, RxwebValidators.ip({ version: IpVersion.AnyOne })]));
    }
    this.form.addControl('snmp_version', new FormControl(val && val.snmp_version ? val.snmp_version : '',
      [NoWhitespaceValidator, Validators.required]));
  }

  private addV1_V2Field(val?: SNMPCrudType) {
    this.form.get('snmp_community') ? null : this.form.addControl('snmp_community', new FormControl(val && val.snmp_community ? val.snmp_community : '',
      [NoWhitespaceValidator, Validators.required]));
  }

  private removeV1_V2Field() {
    this.form.get('snmp_community') ? this.form.removeControl('snmp_community') : null;
  }

  private addAuthLevelField(val?: SNMPCrudType) {
    this.form.get('snmp_authlevel') ? null : this.form.addControl('snmp_authlevel', new FormControl(val && val.snmp_authlevel ? val.snmp_authlevel : '',
      [NoWhitespaceValidator, Validators.required]));
  }

  private removeAuthLevelField() {
    this.form.get('snmp_authlevel') ? this.form.removeControl('snmp_authlevel') : null;
  }

  private addAuthNameField(val?: SNMPCrudType) {
    this.form.get('snmp_authname') ? null :
      this.form.addControl('snmp_authname', new FormControl(val && val.snmp_authname ? val.snmp_authname : '', [NoWhitespaceValidator, Validators.required]));
  }

  private removeAuthNameField() {
    this.form.get('snmp_authname') ? this.form.removeControl('snmp_authname') : null;
  }

  private addAuthFields(val?: SNMPCrudType) {
    this.form.get('snmp_authalgo') ? null :
      this.form.addControl('snmp_authalgo', new FormControl(val && val.snmp_authalgo ? val.snmp_authalgo : '', [NoWhitespaceValidator, Validators.required]));
    this.form.get('snmp_authpass') ? null :
      this.form.addControl('snmp_authpass', new FormControl('', [NoWhitespaceValidator, Validators.required]));
    this.form.get('snmp_authname') ? null :
      this.form.addControl('snmp_authname', new FormControl(val && val.snmp_authname ? val.snmp_authname : '', [NoWhitespaceValidator, Validators.required]));
  }

  private removeAuthFields() {
    this.form.get('snmp_authalgo') ? this.form.removeControl('snmp_authalgo') : null;
    this.form.get('snmp_authpass') ? this.form.removeControl('snmp_authpass') : null;
    this.form.get('snmp_authname') ? this.form.removeControl('snmp_authname') : null;
  }

  private addCryptoFields(val?: SNMPCrudType) {
    this.form.get('snmp_cryptoalgo') ? null : this.form.addControl('snmp_cryptoalgo', new FormControl(val && val.snmp_cryptoalgo ? val.snmp_cryptoalgo : '',
      [NoWhitespaceValidator, Validators.required]));
    this.form.get('snmp_cryptopass') ? null : this.form.addControl('snmp_cryptopass', new FormControl('',
      [NoWhitespaceValidator, Validators.required]));
  }

  private removeCryptoFields() {
    this.form.get('snmp_cryptoalgo') ? this.form.removeControl('snmp_cryptoalgo') : null;
    this.form.get('snmp_cryptopass') ? this.form.removeControl('snmp_cryptopass') : null;
  }

  setV3Fields() {
    this.removeV1_V2Field();
    this.addAuthLevelField();
    return this.form;
  }

  setV1_V2Fields() {
    this.addV1_V2Field();
    this.removeAuthLevelField();
    this.removeAuthNameField();
    this.removeAuthFields();
    this.removeCryptoFields();
    return this.form;
  }

  setNoAuthNoPrivFields() {
    this.removeAuthFields();
    this.removeCryptoFields();
    this.addAuthNameField();
    return this.form;
  }

  setAtuhNoPrivFields() {
    this.removeAuthNameField();
    this.removeCryptoFields();
    this.addAuthFields();
    return this.form;
  }

  setAuthPrivFields() {
    this.removeAuthNameField();
    this.addAuthFields();
    this.addCryptoFields();
    return this.form;
  }

  resetFormErrors() {
    return {
      'ip_address': '',
      'snmp_version': '',
      'snmp_community': '',
      'snmp_authlevel': '',
      'snmp_authname': '',
      'snmp_authpass': '',
      'snmp_authalgo': '',
      'snmp_cryptopass': '',
      'snmp_cryptoalgo': ''
    }
  }

  switchValidationMessages = {
    'ip_address': {
      'required': 'IP is required',
      'ip': 'Invalid IP'
    },
    'snmp_version': {
      'required': 'SNMP Protocol Version is required',
    },
    'snmp_community': {
      'required': 'SNMP String is required',
    },
    'snmp_authlevel': {
      'required': 'Auth Level is required'
    },
    'snmp_authname': {
      'required': 'Auth Username is required'
    },
    'snmp_authpass': {
      'required': 'Auth Password is required'
    },
    'snmp_authalgo': {
      'required': 'Auth Algorithm is required'
    },
    'snmp_cryptopass': {
      'required': 'Crypto Password is required'
    },
    'snmp_cryptoalgo': {
      'required': 'Crypto Algorithm is required'
    }
  }

  editConfiguration(devices: MonitoringConfigurationDeviceViewData[], formData: any) {
    let data: Array<MonitoringConfigurationDeviceViewDataAPIObject> = [];
    devices.map(d => {
      let a: MonitoringConfigurationDeviceViewDataAPIObject = new MonitoringConfigurationDeviceViewDataAPIObject();
      a.uuid = d.deviceId;
      a.device_type = d.deviceType;
      data.push(a);
    })
    formData.devices = data;
    return this.http.post(BULK_MONITORING(), formData);
  }

  activateMonitoring(devices: MonitoringConfigurationDeviceViewData[]) {
    let data: Array<MonitoringConfigurationDeviceViewDataAPIObject> = [];
    devices.map(d => {
      let a: MonitoringConfigurationDeviceViewDataAPIObject = new MonitoringConfigurationDeviceViewDataAPIObject();
      a.uuid = d.deviceId;
      a.device_type = d.deviceType;
      data.push(a);
    })
    return this.http.put(ACTIVATE_BULK_MONITORING(), data);
  }

  enableMonitoring(devices: MonitoringConfigurationDeviceViewData[]) {
    let data: Array<MonitoringConfigurationDeviceViewDataAPIObject> = [];
    devices.map(d => {
      let a: MonitoringConfigurationDeviceViewDataAPIObject = new MonitoringConfigurationDeviceViewDataAPIObject();
      a.uuid = d.deviceId;
      a.device_type = d.deviceType;
      data.push(a);
    })
    return this.http.put(ENABLE_BULK_MONITORING(), data);
  }

  disableMonitoring(devices: MonitoringConfigurationDeviceViewData[]) {
    let data: Array<MonitoringConfigurationDeviceViewDataAPIObject> = [];
    devices.map(d => {
      let a: MonitoringConfigurationDeviceViewDataAPIObject = new MonitoringConfigurationDeviceViewDataAPIObject();
      a.uuid = d.deviceId;
      a.device_type = d.deviceType;
      data.push(a);
    })
    return this.http.put(DISABLE_BULK_MONITORING(), data);
  }

  deleteConfiguration(devices: MonitoringConfigurationDeviceViewData[]) {
    let data: Array<MonitoringConfigurationDeviceViewDataAPIObject> = [];
    devices.map(d => {
      let a: MonitoringConfigurationDeviceViewDataAPIObject = new MonitoringConfigurationDeviceViewDataAPIObject();
      a.uuid = d.deviceId;
      a.device_type = d.deviceType;
      data.push(a);
    })
    return this.http.post(DELETE_BULK_MONITORING(), data);
  }
}

export class MonitoringConfigurationDeviceViewData {
  constructor() {
    this.resetFormErrors();
  }
  deviceId: string;
  deviceName: string;
  deviceType: string;
  managementIP: string;
  snmpIP: string;
  snmpVersion: string;
  snmpCommunity: string;
  snmpAuthLevel: string;

  monitoringStatus: string;
  isSelected: boolean = false;

  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  resetFormErrors() {
    this.formErrors = {
      'ip_address': '',
      'snmp_version': '',
      'snmp_community': '',
      'snmp_authlevel': '',
      'snmp_authname': '',
      'snmp_authpass': '',
      'snmp_authalgo': '',
      'snmp_cryptopass': '',
      'snmp_cryptoalgo': '',
    }
  }
  nonFieldErr: string;
  monitoring: MonitoringConfigurationDeviceMonitoring;
  applicableModulePermissions?: any[];

  get snmpDetailsAvailable() {
    return this.snmpVersion ? (this.snmpVersion == SNMPVersionMapping.V1 || this.snmpVersion == SNMPVersionMapping.V2C) ? (this.snmpCommunity ? true : false) : (this.snmpAuthLevel ? true : false) : false;
  }

  get canActivate() {
    return this.monitoring.configured ? false : this.snmpDetailsAvailable;
  }

  get canEnable() {
    return this.monitoring.configured && !this.monitoring.enabled;
  }

  get canDisable() {
    return this.monitoring.configured && this.monitoring.enabled;
  }

  get canDelete() {
    return this.monitoring.configured;
  }
}

export class MonitoringConfigurationDeviceSummaryViewData {
  constructor() { }
  total: number = 0;
  not_configured: number = 0;
  disabled: number = 0;
  enabled: number = 0;
}

export class MonitoringConfigurationActionFailureViewData {
  constructor() { }
  action: string;
  errorMsg: string;
  data: MonitoringConfigurationDeviceViewData[] = [];
}

export class MonitoringConfigurationDeviceViewDataFilter {
  constructor() { }
  status: string;
  device_type?: string;
  snmp_version?: string;
  search?: string;

  get canActivate() {
    return this.status == 'all' || this.status == 'not_configured';
  }

  get canEnable() {
    return this.status != 'enabled' && this.status != 'not_configured';
  }

  get canDisable() {
    return this.status != 'disabled' && this.status != 'not_configured';
  }

  get canDelete() {
    return this.status != 'not_configured';
  }
}

export class MonitoringConfigurationDeviceViewDataAPIObject {
  constructor() { }
  device_type: string;
  uuid: string;
}