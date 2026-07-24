import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { ADD_CONTAINER_CONTROLLER, CONTAINER_CONTROLLER_BY_ID_AND_TYPE, EDIT_CONTAINER_CONTROLLER } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CONTROLLER_TYPE_MAPPING } from 'src/app/shared/SharedEntityTypes/container-contoller.type';

@Injectable()
export class UsiContainersDockerCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private appSvc: AppLevelService) { }

  createDockerForm(controllerId: string): Observable<FormGroup> {
    if (controllerId) {
      return this.http.get<any>(CONTAINER_CONTROLLER_BY_ID_AND_TYPE(controllerId, CONTROLLER_TYPE_MAPPING.DOCKER)).pipe(map(input => {
        return this.builder.group({
          'name': [input.name, [Validators.required, NoWhitespaceValidator]],
          'hostname': [input.hostname, [Validators.required, NoWhitespaceValidator]]
        });
      }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'hostname': ['', [Validators.required, NoWhitespaceValidator]]
      }));
    }
  }

  buildAttachmentForm(): FormGroup {
    return this.builder.group({});
  }

  resetDockerFormErrors() {
    return { 'name': '', 'hostname': '' };
  }

  resetAttachmentFormErrors() {
    return { 'cert': '', 'key': '', 'ca': '' };
  }

  dockerFormMessages = {
    'name': { 'required': 'Name is required' },
    'hostname': { 'required': 'Hostname is required' }
  };

  addController(data: FormData): Observable<any> {
    return this.http.post(ADD_CONTAINER_CONTROLLER(CONTROLLER_TYPE_MAPPING.DOCKER), data);
  }

  updateController(controllerId: string, data: FormData): Observable<any> {
    return this.http.put(EDIT_CONTAINER_CONTROLLER(controllerId, CONTROLLER_TYPE_MAPPING.DOCKER), data);
  }

  toFormData<T>(formValue: T, formValue1?: T): FormData {
    const formData = new FormData();
    for (const key of Object.keys(formValue)) {
      formData.append(key, formValue[key]);
    }
    if (formValue1) {
      for (const key of Object.keys(formValue1)) {
        const value = formValue1[key];
        if (key.includes('unity-cert')) {
          formData.append('cert', this.appSvc.convertToBinary(value));
        } else if (key.includes('unity-key')) {
          formData.append('key', this.appSvc.convertToBinary(value));
        } else if (key.includes('unity-ca')) {
          formData.append('ca', this.appSvc.convertToBinary(value));
        } else {
          formData.append(key, this.appSvc.convertToBinary(value));
        }
      }
    }
    return formData;
  }
}
