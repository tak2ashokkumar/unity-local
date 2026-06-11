import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject, Observable, of } from 'rxjs';
import { DeviceMapping, SNMPVersionMapping, AuthLevelMapping, NoWhitespaceValidator, BMServerSidePlatformMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SNMPCrudType } from '../../entities/snmp-crud.type';
import { MONITORING_CONFIGURATION_BY_DEVICE_TYPE, GET_DEVICE_MONITORING_BY_DEVICE_TYPE, TOGGLE_MONITORING_BY_DEVICE_TYPE, BMServer_UPDATE, DOWNLOAD_AGENT_BY_DEVICE_TYPE, TENANT_TEMPLATES } from 'src/app/shared/api-endpoint.const';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { RxwebValidators, IpVersion } from '@rxweb/reactive-form-validators';
import { BMServer } from '../../entities/bm-server.type';
import { map } from 'rxjs/operators';
import { MonitoringTemplate } from 'src/app/shared/SharedEntityTypes/monitoring-templates.type';

@Injectable()
export class BmServersMonitoringConfigService {
  private monitoringAnnouncedSource = new Subject<string>();
  monitoringAnnounced$ = this.monitoringAnnouncedSource.asObservable();

  form: FormGroup;

  private _preservedIpAddress: string = '';

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getDeviceMonitoring(deviceId: string, deviceType: DeviceMapping): Observable<BMServer> {
    return this.http.get<BMServer>(GET_DEVICE_MONITORING_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  getMonitoringConfig(deviceId: string, deviceType: DeviceMapping) {
    return this.http.get<SNMPCrudType>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  monitoringEnabled() {
    this.monitoringAnnouncedSource.next(null);
  }

  getCredentials(type: string) {
    return this.http.get<any[]>(`/customer/unity_discovery/credential/?page_size=0&type=${type}`);
  }

  private getRawValue(obj: SNMPCrudType) {
    // let obj = <SNMPCrudType>this.form.getRawValue();
    let formData: SNMPCrudType = {
      connection_type: obj.connection_type,
      ip_address: obj.ip_address,
      snmp_version: obj.snmp_version,
      snmp_authlevel: '',
      snmp_community: '',
      snmp_authname: '',
      snmp_authpass: '',
      snmp_authalgo: '',
      snmp_cryptoalgo: '',
      snmp_cryptopass: '',
      mtp_templates: obj.mtp_templates
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
  buildForm(obj: SNMPCrudType) {
    //TODO:Remove after server side fixed
    if (obj?.mon_connection_type === 'SSH' || obj?.mon_connection_type === 'WinRM') {
      this.form = this.builder.group({
        connection_type: [{ value: obj.mon_connection_type, disabled: !!obj.mon_connection_type }, Validators.required],

        host_ip: [
          obj.ip_address || '',
          [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]
        ],

        mon_port: [
          obj.mon_port || (obj.mon_connection_type === 'SSH' ? 22 : 5985)
        ],

        mon_credential_mode: [
          obj.mon_credential_mode || 'local',
          Validators.required
        ],

        mon_credential_id: [obj.mon_credential_id || ''],
        mon_username: [obj.mon_username || ''],
        mon_password: [''],

        mtp_templates: [obj.mtp_templates || []]
      });

      return this.form;
    }
    if (obj) {
      obj = this.getRawValue(obj);
      // if (!obj.connection_type) {
      //   obj.connection_type = 'SNMP';
      // }
    }
    this.form = this.builder.group({
      'connection_type': [{ value: (obj && obj.connection_type) ? obj.connection_type : 'SNMP', disabled: (obj && obj.connection_type) ? true : false }, [Validators.required, NoWhitespaceValidator]],
      'ip_address': [{ value: (obj && obj.ip_address) ? obj.ip_address : '', disabled: false }, [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
      'mtp_templates': [obj && obj.mtp_templates ? obj.mtp_templates : [], [Validators.required]]
    });
    if (this.form.get('connection_type').value == 'SNMP') {
      if (obj && obj.ip_address) {
        switch (obj.snmp_version) {
          case SNMPVersionMapping.V1:
          case SNMPVersionMapping.V2C:
            this.addV1_V2Field(obj);
          case SNMPVersionMapping.V3:
          default:
            this.addSnmpField(obj);
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
        this.addSnmpField();
      }
    }
    return this.form;
  }

  setSshWinRmFields(connectionType: 'SSH' | 'WinRM') {
    // Remove SNMP-specific fields
    this.removeSnmpField();
    this.removeV1_V2Field();
    this.removeAuthLevelField();
    this.removeAuthNameField();
    this.removeAuthFields();
    this.removeCryptoFields();

    // Remove Agent-specific field
    // ip_address stays but we'll add host_ip separately
    this._preservedIpAddress = this.form.get('ip_address')?.value || '';
    this.form.get('ip_address') ? this.form.removeControl('ip_address') : null;

    this.form.get('connection_type')?.setValue(connectionType, { emitEvent: false });

    // Add SSH/WinRM fields if not already present
    if (!this.form.get('host_ip')) {
      this.form.addControl('host_ip', new FormControl('', [
        Validators.required,
        NoWhitespaceValidator,
        RxwebValidators.ip({ version: IpVersion.AnyOne })
      ]));
    }
    if (!this.form.get('mon_port')) {
      this.form.addControl('mon_port', new FormControl(
        connectionType === 'SSH' ? 22 : 5985
      ));
    } else {
      this.form.get('mon_port').setValue(connectionType === 'SSH' ? 22 : 5985);
    }
    if (!this.form.get('mon_credential_mode')) {
      this.form.addControl('mon_credential_mode', new FormControl('local', [Validators.required]));
    }
    if (!this.form.get('mon_credential_id')) {
      this.form.addControl('mon_credential_id', new FormControl(''));
    }
    if (!this.form.get('mon_username')) {
      this.form.addControl('mon_username', new FormControl(''));
    }
    if (!this.form.get('mon_password')) {
      this.form.addControl('mon_password', new FormControl(''));
    }

    return this.form;
  }

  clearSshWinRmFields() {
    ['host_ip', 'mon_port', 'mon_credential_mode', 'mon_credential_id', 'mon_username', 'mon_password']
      .forEach(ctrl => {
        this.form.get(ctrl) ? this.form.removeControl(ctrl) : null;
      });

    // Restore ip_address for SNMP/Agent
    if (!this.form.get('ip_address')) {
      this.form.addControl('ip_address', new FormControl(this._preservedIpAddress || '', [
        Validators.required,
        NoWhitespaceValidator,
        RxwebValidators.ip({ version: IpVersion.AnyOne })
      ]));
    }
  }

  private addSnmpField(val?: SNMPCrudType) {
    this.form.addControl('snmp_version', new FormControl(val && val.snmp_version ? val.snmp_version : '',
      [NoWhitespaceValidator, Validators.required]));
  }

  private removeSnmpField() {
    this.form.get('snmp_version') ? this.form.removeControl('snmp_version') : null;
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

  setSnmpFields() {
    this.addSnmpField();
  }

  setAgentField() {
    this.removeSnmpField();
    this.removeV1_V2Field();
    return this.form;
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
      'snmp_cryptoalgo': '',
      'mtp_templates': '',
      'connection_type': '',
      'host_ip': '',
      'mon_port': '',
      'mon_credential_mode': '',
      'mon_credential_id': '',
      'mon_username': '',
      'mon_password': '',
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
    },
    'mtp_templates': {
      'required': 'Templates are required'
    },
    'mon_credential_id': {
      'required': 'Please select a credential'
    },
    'mon_username': {
      'required': 'Username is required'
    },
    'mon_password': {
      'required': 'Password is required'
    },
    'host_ip': {
      'required': 'Host IP is required',
      'ip': 'Invalid IP'
    }
  }

  enableMonitoring(deviceId: string, deviceType: DeviceMapping, data: SNMPCrudType): Observable<SNMPCrudType> {
    return this.http.post<SNMPCrudType>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId), data);
  }

  updateMonitoring(deviceId: string, deviceType: DeviceMapping, data: SNMPCrudType): Observable<SNMPCrudType> {
    return this.http.put<SNMPCrudType>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId), data);
  }

  deleteMonitoring(deviceId: string, deviceType: DeviceMapping): Observable<SNMPCrudType> {
    return this.http.delete<SNMPCrudType>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  toggleMonitoring(deviceId: string, deviceType: DeviceMapping, enabled: boolean) {
    return this.http.request<SNMPCrudType>('put', TOGGLE_MONITORING_BY_DEVICE_TYPE(deviceType, deviceId, enabled));
  }

  buildBMCTypeForm(bm: BMServer): FormGroup {
    return this.builder.group({
      'bmc_type': [{ value: bm.bmc_type ? bm.bmc_type : BMServerSidePlatformMapping.None, disabled: bm.bmc_type && (bm.bmc_type != BMServerSidePlatformMapping.None) }],
    });
  }

  createIPMIForm(bm: BMServer): FormGroup {
    if (bm.bmc_type && (bm.bmc_type != BMServerSidePlatformMapping.None)) {
      return this.builder.group({
        'ip': [{ value: bm.bm_controller.ip, disabled: true }, [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'username': [{ value: bm.bm_controller.username, disabled: true }, [Validators.required, Validators.maxLength(20), NoWhitespaceValidator]],
        'proxy_url': [{ value: bm.bm_controller.proxy_url, disabled: true }, [Validators.required, NoWhitespaceValidator]],
      });
    } else {
      return this.builder.group({
        'ip': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'username': ['', [Validators.required, Validators.maxLength(20), NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'proxy_url': ['', [Validators.required, NoWhitespaceValidator]],
      });
    }
  }

  resetIPMIFormErrors() {
    return {
      'ip': '',
      'username': '',
      'password': '',
      'proxy_url': ''
    };
  }

  IPMIFormValidationMessages = {
    'ip': {
      'required': 'IP is required',
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

  createDARCForm(bm: BMServer): FormGroup {
    if (bm.bmc_type && (bm.bmc_type != BMServerSidePlatformMapping.None)) {
      return this.builder.group({
        'version': [{ value: bm.bm_controller.version, disabled: true }, [Validators.required, NoWhitespaceValidator]],
        'ip': [{ value: bm.bm_controller.ip, disabled: true }, [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'username': [{ value: bm.bm_controller.username, disabled: true }, [Validators.required, Validators.maxLength(20), NoWhitespaceValidator]],
        'proxy_url': [{ value: bm.bm_controller.proxy_url, disabled: true }, [Validators.required, NoWhitespaceValidator]]
      });
    } else {
      return this.builder.group({
        'version': ['', [Validators.required, NoWhitespaceValidator]],
        'ip': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]],
        'username': ['', [Validators.required, Validators.maxLength(20), NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'proxy_url': ['', [Validators.required, NoWhitespaceValidator]],
      });
    }
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

  DRACFormValidationMessages = {
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

  getTemplates() {
    return this.http.get<MonitoringTemplate[]>(TENANT_TEMPLATES());
  }
}
