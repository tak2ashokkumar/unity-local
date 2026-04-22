import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Subject } from 'rxjs';
import { DeviceMonitoringSNMPCrudType } from '../../shared/SharedEntityTypes/devices-monitoring.type';
import { AuthLevelMapping, NoWhitespaceValidator, SNMPVersionMapping } from '../../shared/app-utility/app-utility.service';
import { MonitoringTemplate } from '../../shared/SharedEntityTypes/monitoring-templates.type';
import { TENANT_TEMPLATES } from '../../shared/api-endpoint.const';

@Injectable({
  providedIn: 'root'
})
export class UnityDevicesMonitoringCrudService {
  private submitAnnouncedSource = new Subject<string>();
  submitAnnounced$ = this.submitAnnouncedSource.asObservable();

  private errorAnnouncedSource = new Subject<any>();
  errorAnnounced$ = this.errorAnnouncedSource.asObservable();

  form: FormGroup;
  data: DeviceMonitoringSNMPCrudType;
  monitoringEnabled: boolean;
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  addOrEdit<T extends DeviceMonitoringSNMPCrudType>(obj: T) {
    this.buildForm(obj);
  }

  getTemplates() {
    return this.http.get<MonitoringTemplate[]>(TENANT_TEMPLATES());
  }

  submit() {
    this.submitAnnouncedSource.next();
  }

  handleError(err: any) {
    this.errorAnnouncedSource.next(err);
  }

  monitoringFormCheck() {
    this.monitoringEnabled = !this.monitoringEnabled;
    return this.monitoringEnabled;
  }

  private getRawValue(obj: DeviceMonitoringSNMPCrudType) {
    // let obj = <SNMPCrudType>this.form.getRawValue();
    let formData: DeviceMonitoringSNMPCrudType = {
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
      case AuthLevelMapping.NoAuthNoPriv:
      default:
        break;
    }
    return formData;
  }

  buildForm(obj: DeviceMonitoringSNMPCrudType) {
    //TODO:Remove after server side fixed
    if (obj) {
      obj = this.getRawValue(obj);
    }
    this.form = this.builder.group({});
    if (obj && obj.ip_address) {
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
         * NOTE: No need of `break` here, AuthPriv requires the next 2 case controls and so on.. 
         */
        case AuthLevelMapping.AuthPriv:
          this.addCryptoFields(obj);
        case AuthLevelMapping.AuthNoPriv:
          this.addAuthFields(obj);
        case AuthLevelMapping.NoAuthNoPriv:
        default:
          break;
      }
    } else {
      this.addDefaultFeilds();
    }
    this.monitoringEnabled = this.form.get('ip_address')?.value ? true : false;
  }

  private addDefaultFeilds(val?: DeviceMonitoringSNMPCrudType) {
    this.form.addControl('connection_type', new FormControl('SNMP',
      [Validators.required]));
    this.form.addControl('ip_address', new FormControl(val && val.ip_address ? val.ip_address : '',
      [NoWhitespaceValidator, Validators.required, RxwebValidators.ip({ version: IpVersion.AnyOne })]));
    this.form.addControl('snmp_version', new FormControl(val && val.snmp_version ? val.snmp_version : '',
      [NoWhitespaceValidator, Validators.required]));
    this.form.addControl('mtp_templates', new FormControl(val && val.mtp_templates ? val.mtp_templates : [],
      [Validators.required]));
  }

  removeDefaultFeilds(val?: DeviceMonitoringSNMPCrudType) {
    this.form.get('connection_type') ? this.form.removeControl('snmp_community') : null;
    this.form.get('ip_address') ? this.form.removeControl('snmp_community') : null;
    this.form.get('snmp_version') ? this.form.removeControl('snmp_community') : null;
    this.form.get('mtp_templates') ? this.form.removeControl('snmp_community') : null;
  }

  private addV1_V2Field(val?: DeviceMonitoringSNMPCrudType) {
    this.form.get('snmp_community') ? null : this.form.addControl('snmp_community', new FormControl(val && val.snmp_community ? val.snmp_community : '',
      [NoWhitespaceValidator, Validators.required]));
  }

  private removeV1_V2Field() {
    this.form.get('snmp_community') ? this.form.removeControl('snmp_community') : null;
  }

  private addAuthLevelField(val?: DeviceMonitoringSNMPCrudType) {
    this.form.get('snmp_authlevel') ? null : this.form.addControl('snmp_authlevel', new FormControl(val && val.snmp_authlevel ? val.snmp_authlevel : '',
      [NoWhitespaceValidator, Validators.required]));
  }

  private removeAuthLevelField() {
    this.form.get('snmp_authlevel') ? this.form.removeControl('snmp_authlevel') : null;
  }

  private addAuthFields(val?: DeviceMonitoringSNMPCrudType) {
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

  private addCryptoFields(val?: DeviceMonitoringSNMPCrudType) {
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
      'snmp_cryptoalgo': '',
      'mtp_templates': ''
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
    }
  }

  setForm(form: FormGroup) {

  }

  getFormData() {
    if (this.monitoringEnabled) {
      return Object.assign({}, { 'activate_monitoring': true }, this.form.getRawValue());
    } else {
      return { 'activate_monitoring': false };
    }
  }

  isInvalid() {
    if (this.monitoringEnabled) {
      return this.form.invalid;
    } else {
      return false;
    }
  }
}

export class DeviceSNMPCrudFormData implements DeviceMonitoringSNMPCrudType {
  ip_address: string;
  snmp_version: SNMPVersionMapping;
  snmp_community?: string;
  snmp_authlevel?: AuthLevelMapping | '';
  snmp_authname?: string;
  snmp_authpass?: string;
  snmp_authalgo?: string;
  snmp_cryptoalgo?: string;
  snmp_cryptopass?: string;
  connection_type: string;
  is_snmptrap_enabled?: boolean;
  mtp_templates?: number[];
}
