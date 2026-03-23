import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { SNMPCrudType } from '../entities/snmp-crud.type';
import { NoWhitespaceValidator, SNMPVersionMapping, AuthLevelMapping } from 'src/app/shared/app-utility/app-utility.service';
import { RxwebValidators, IpVersion } from '@rxweb/reactive-form-validators';

@Injectable({
  providedIn: 'root'
})
export class DevicesCrudMonitoringService {
  private submitAnnouncedSource = new Subject<string>();
  submitAnnounced$ = this.submitAnnouncedSource.asObservable();

  private errorAnnouncedSource = new Subject<any>();
  errorAnnounced$ = this.errorAnnouncedSource.asObservable();

  form: FormGroup;
  data: SNMPCrudType;
  monitoringEnabled: boolean;

  constructor(private builder: FormBuilder) { }

  addOrEdit<T extends SNMPCrudType>(obj: T) {
    this.buildForm(obj);
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
          this.addCryptoFields();
        case AuthLevelMapping.AuthNoPriv:
          this.addAuthFields();
        case AuthLevelMapping.NoAuthNoPriv:
        default:
          break;
      }
    } else {
      this.addDefaultFeilds();
    }
    this.monitoringEnabled = this.form.get('ip_address').value ? true : false;
  }

  private addDefaultFeilds(val?: SNMPCrudType) {
    this.form.addControl('ip_address', new FormControl(val && val.ip_address ? val.ip_address : '',
      [NoWhitespaceValidator, Validators.required, RxwebValidators.ip({ version: IpVersion.AnyOne })]));
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

  getFormValue() {
    if (this.monitoringEnabled) {
      return this.form.getRawValue();
    } else {
      return {};
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