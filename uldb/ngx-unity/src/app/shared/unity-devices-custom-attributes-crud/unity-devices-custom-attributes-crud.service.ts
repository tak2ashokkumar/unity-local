import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { DeviceCustomAttribute } from '../SharedEntityTypes/device-custom-attributes.type';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from '../app-utility/app-utility.service';
import { CUSTOM_ATTRIBUTES_FAST_BY_DEVICE_TYPE, DEVICE_CUSTOM_ATTRIBUTES_BY_DEVICE_ID } from '../api-endpoint.const';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

@Injectable({
  providedIn: 'root'
})
export class UnityDevicesCustomAttributesCrudService {
  private addOrEditAnnouncedSource = new Subject<string>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private submitAnnouncedSource = new Subject<string>();
  submitAnnounced$ = this.submitAnnouncedSource.asObservable();

  private errorAnnouncedSource = new Subject<any>();
  errorAnnounced$ = this.errorAnnouncedSource.asObservable();

  form: FormGroup;
  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  addOrEdit<T extends string>(obj: T) {
    this.addOrEditAnnouncedSource.next(obj);
  }

  getCustomAttributes(deviceType: DeviceMapping): Observable<DeviceCustomAttribute[]> {
    return this.http.get<DeviceCustomAttribute[]>(CUSTOM_ATTRIBUTES_FAST_BY_DEVICE_TYPE(this.utilSvc.getDeviceAPIMappingByDeviceMapping(deviceType)));
  }

  submit() {
    this.submitAnnouncedSource.next();
  }

  handleError(err: any) {
    this.errorAnnouncedSource.next(err);
  }

  buildForm(attrs: DeviceCustomAttribute[], deviceAttrs: { [key: string]: any }): FormGroup {
    let form = this.builder.group({});
    attrs.map(ca => {
      let key = ca.name;
      switch (ca.value_type) {
        case 'Integer':
          if (deviceAttrs && deviceAttrs[key]) {
            form.addControl(ca.name, new FormControl(deviceAttrs[key], [RxwebValidators.numeric({ allowDecimal: false }), NoWhitespaceValidator]));
          } else {
            form.addControl(ca.name, new FormControl(ca.default_value, [RxwebValidators.numeric({ allowDecimal: false }), NoWhitespaceValidator]));
          }
          break;
        case 'Char':
          if (deviceAttrs && deviceAttrs[key]) {
            form.addControl(ca.name, new FormControl(deviceAttrs[key], [Validators.pattern(/^[\s\S]+$/), NoWhitespaceValidator]));
          } else {
            form.addControl(ca.name, new FormControl(ca.default_value, [Validators.pattern(/^[\s\S]+$/), NoWhitespaceValidator]));
          }
          break;
        default:
          if (deviceAttrs && deviceAttrs[key]) {
            form.addControl(ca.name, new FormControl(deviceAttrs[key]));
          } else {
            form.addControl(ca.name, new FormControl(ca.default_value));
          }
      }
    })
    return form;
  }

  resetFormErrors(attrs: DeviceCustomAttribute[]) {
    let obj = {};
    attrs.map(ca => {
      obj[ca.name] = '';
    })
    return obj;
  }

  formValidationMsgs(attrs: DeviceCustomAttribute[]) {
    let obj = {};
    attrs.map(ca => {
      switch (ca.value_type) {
        case 'Integer':
          obj[ca.name] = {
            "numeric": 'Value should be of Integer type',
          };
          break;
        case 'Char':
          obj[ca.name] = {
            'pattern': "Value should be of Character type"
          };
          break;
      }
    })
    return obj;
  }

  setForm(form: FormGroup) {
    this.form = form;
  }

  getFormData() {
    if (this.form) {
      return Object.assign({}, this.form.getRawValue());
    } else {
      return {};
    }
  }

  isInvalid() {
    if (this.form) {
      return this.form.invalid;
    } else {
      return false;
    }
  }

  saveAttributes(deviceType: DeviceMapping, deviceId: string, obj: any) {
    return this.http.patch(DEVICE_CUSTOM_ATTRIBUTES_BY_DEVICE_ID(deviceType, deviceId), obj)
  }
}
