import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { GET_DEVICE_MONITORING_BY_DEVICE_TYPE, MONITORING_CONFIGURATION_BY_DEVICE_TYPE, TOGGLE_MONITORING_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { AuthLevelMapping, DeviceMapping, NoWhitespaceValidator, SNMPVersionMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SNMPCrudType } from '../../entities/snmp-crud.type';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';

@Injectable()
export class StorageMonitoringConfigService {
  private monitoringAnnouncedSource = new Subject<string>();
  monitoringAnnounced$ = this.monitoringAnnouncedSource.asObservable();

  form: FormGroup;
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getDeviceMonitoring(deviceId: string, deviceType: DeviceMapping) {
    return this.http.get<{ monitoring: DeviceMonitoringType }>(GET_DEVICE_MONITORING_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  getMonitoringConfig(deviceId: string, deviceType: DeviceMapping) {
    return this.http.get<SNMPCrudType>(MONITORING_CONFIGURATION_BY_DEVICE_TYPE(deviceType, deviceId));
  }

  monitoringEnabled() {
    this.monitoringAnnouncedSource.next(null);
  }

  private getRawValue(obj: SNMPCrudType) {
    // let obj = <SNMPCrudType>this.form.getRawValue();
    let formData: SNMPCrudType = { connection_type: obj.connection_type, ip_address: obj.ip_address, snmp_version: obj.snmp_version, snmp_authlevel: '', snmp_community: '', snmp_authname: '', snmp_authpass: '', snmp_authalgo: '', snmp_cryptoalgo: '', snmp_cryptopass: '' };
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
      case AuthLevelMapping.NoAuthNoPriv:
      default:
        break;
    }
    return formData;
  }

  buildForm(obj: SNMPCrudType) {
    //TODO:Remove after server side fixed
    if (obj) {
      obj = this.getRawValue(obj);
    }
    this.form = this.builder.group({
      'connection_type': [{ value: (obj && obj.connection_type) ? obj.connection_type : 'SNMP', disabled: (obj && obj.connection_type) ? true : false }, [Validators.required, NoWhitespaceValidator]],
      'ip_address': [{ value: (obj && obj.ip_address) ? obj.ip_address : '', disabled: false }, [Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]]
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
           * NOTE: No need of `break` here, AuthPriv requires the next 2 case controls and so on.. 
           */
          case AuthLevelMapping.AuthPriv:
            this.addCryptoFields();
          case AuthLevelMapping.AuthNoPriv:
            this.addAuthFields();
          case AuthLevelMapping.NoAuthNoPriv:
          default:
            break;
        }
      } else {
        this.addSnmpField();
      }
    }
    if (this.form.get('connection_type').value == 'Api') {

    }
    return this.form;
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

  private addApiFields(val?: any) {
    this.form.get('management_ip') ? null : this.form.addControl('management_ip', new FormControl(val && val.management_ip ? val.management_ip : '',
      [NoWhitespaceValidator, Validators.required]));
    this.form.get('management_ip').disable();
    this.form.get('host_url') ? null : this.form.addControl('host_url', new FormControl(val && val.host_url ? val.host_url : '',
      [NoWhitespaceValidator, Validators.required]));
    this.form.get('host_url').disable();
    this.form.get('username') ? null : this.form.addControl('username', new FormControl('',
      [NoWhitespaceValidator, Validators.required]));
    this.form.get('username').disable();
    this.form.get('password') ? null : this.form.addControl('password', new FormControl('',
      [NoWhitespaceValidator, Validators.required]));
    this.form.get('password').disable();
  }

  private removeApiFields() {
    this.form.get('management_ip') ? this.form.removeControl('management_ip') : null;
    this.form.get('host_url') ? this.form.removeControl('host_url') : null;
    this.form.get('username') ? this.form.removeControl('username') : null;
    this.form.get('password') ? this.form.removeControl('password') : null;
  }

  setSnmpFields() {
    this.addSnmpField();
  }

  setAgentField() {
    this.removeSnmpField();
    this.removeV1_V2Field();
    return this.form;
  }

  setAPIField() {
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
    this.removeAuthFields();
    this.removeCryptoFields();
    return this.form;
  }

  setNoAuthNoPrivFields() {
    this.removeAuthFields();
    this.removeCryptoFields();
    return this.form;
  }

  setAtuhNoPrivFields() {
    this.removeCryptoFields();
    this.addAuthFields();
    return this.form;
  }

  setAuthPrivFields() {
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
}
