import { Injectable } from '@angular/core';
import { Subject, Observable, of } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CONTAINER_CONTROLLER_BY_ID_AND_TYPE, ADD_CONTAINER_CONTROLLER, EDIT_CONTAINER_CONTROLLER, DELETE_CONTAINER_CONTROLLER } from 'src/app/shared/api-endpoint.const';
import { map } from 'rxjs/operators';
import { NoWhitespaceValidator, EmailValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CONTROLLER_TYPE_MAPPING } from 'src/app/shared/SharedEntityTypes/container-contoller.type';
import { KubernetesCRUDType, DockerCRUDType, KubernetesCredType, DockerCredType } from './container-controller-crud.type';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { AppLevelService } from 'src/app/app-level.service';

@Injectable()
export class ContainerControllerCrudService {
  private addOrEditAnnouncedSource = new Subject<{ accountId: string, urlParam: string, uuid: string, controllerType: CONTROLLER_TYPE_MAPPING }>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private changePasswordAnnouncedSource = new Subject<{ uuid: string, controllerType: CONTROLLER_TYPE_MAPPING }>();
  changePasswordAnnounced$ = this.changePasswordAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<{ uuid: string, controllerType: CONTROLLER_TYPE_MAPPING }>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private appService: AppLevelService) { }

  addOrEdit(accountId: string, urlParam: string, uuid: string, controllerType: CONTROLLER_TYPE_MAPPING) {
    this.addOrEditAnnouncedSource.next({ accountId: accountId, urlParam: urlParam, uuid: uuid, controllerType: controllerType });
  }

  changePassword(uuid: string, controllerType: CONTROLLER_TYPE_MAPPING) {
    this.changePasswordAnnouncedSource.next({ uuid: uuid, controllerType: controllerType });
  }

  deleteController(conId: string, controllerType: CONTROLLER_TYPE_MAPPING) {
    this.deleteAnnouncedSource.next({ uuid: conId, controllerType: controllerType });
  }

  addControllerService(data: FormData, type: CONTROLLER_TYPE_MAPPING) {
    return this.http.post(ADD_CONTAINER_CONTROLLER(type), data);
  }

  updateControllerService(conId: string, data: FormData, type: CONTROLLER_TYPE_MAPPING) {
    return this.http.put(EDIT_CONTAINER_CONTROLLER(conId, type), data);
  }

  confirmDeleteController(conId: string, controllerType: CONTROLLER_TYPE_MAPPING) {
    return this.http.delete(DELETE_CONTAINER_CONTROLLER(conId, controllerType));
  }

  buildAttachmentForm() {
    return this.builder.group({});
  }

  resetBaseFormErrors() {
    return {
      'controller_type': ''
    };
  }

  resetKubernetesFormErrors() {
    return {
      'name': '',
      'hostname': '',
      'username': '',
      'password': '',
    };
  }
  resetDockerFormErrors() {
    return {
      'name': '',
      'hostname': '',
    };
  }
  resetAttachmentFormErrors() {
    return {
      'cert': '',
      'key': '',
      'ca': '',
    };
  }


  validationMessages = {
    baseFormMessages: {
      'controller_type': {
        'required': 'Service type is required'
      }
    },
    kubernetesFormMessages: {
      'name': {
        'required': 'Name is required'
      },
      'hostname': {
        'required': 'Hostname is required'
      },
      'username': {
        'required': 'Username is required'
      },
      'password': {
        'required': 'Password is required'
      }
    },
    dockerFormMessages: {
      'name': {
        'required': 'Name is required'
      },
      'hostname': {
        'required': 'Hostname is required'
      }
    }
  }

  createBaseForm(accountId: string, urlParam: string, type?: CONTROLLER_TYPE_MAPPING): FormGroup {
    let cloud_name: string = '';
    switch (urlParam) {
      case 'aws_id': cloud_name = 'aws_account'; break;
      case 'gcp_uuid': cloud_name = 'gcp_account'; break;
      case 'azure_id': cloud_name = 'azure_account'; break;
      case 'cloud_uuid': cloud_name = 'cloud'; break;
    }
    let form: FormGroup = this.builder.group({
      'controller_type': [type ? { value: type, disabled: true } : '', [Validators.required]]
    });
    form.addControl(cloud_name, new FormControl(accountId))
    return form;
  }

  createKubernetesForm(conId: string): Observable<FormGroup> {
    if (conId) {
      return this.http.get<any>(CONTAINER_CONTROLLER_BY_ID_AND_TYPE(conId, CONTROLLER_TYPE_MAPPING.KUBERNETES)).pipe(map(input => {
        return this.builder.group({
          'name': [input.name, [Validators.required, NoWhitespaceValidator]],
          'hostname': [input.hostname, [Validators.required, NoWhitespaceValidator]],
          'username': [input.username, [Validators.required, NoWhitespaceValidator]]
        });
      }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'hostname': ['', [Validators.required, NoWhitespaceValidator]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]]
      }));
    }
  }

  createDockerForm(conId: string): Observable<FormGroup> {
    if (conId) {
      return this.http.get<any>(CONTAINER_CONTROLLER_BY_ID_AND_TYPE(conId, CONTROLLER_TYPE_MAPPING.DOCKER)).pipe(map(input => {
        return this.builder.group({
          'name': [input.name, [Validators.required, NoWhitespaceValidator]],
          'hostname': [input.hostname, [Validators.required, NoWhitespaceValidator]],
        });
      }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'hostname': ['', [Validators.required, NoWhitespaceValidator]],
      }));
    }
  }

  resetKubernetesCredFormErrors(): any {
    return {
      'username': '',
      'password': '',
      'confirm_password': ''
    }
  }

  resetDockerCredFormErrors(): any {
    return {
      'cert': '',
      'key': '',
      'ca': ''
    }
  }

  credValidationMessages = {
    kubernetesMessages: {
      'username': {
        'required': 'Username is required'
      },
      'password': {
        'required': 'Password is required'
      },
      'confirm_password': {
        'required': 'Confirm Password is required',
        'compare': 'Passwords must match'
      }
    },
    dockerMessages: {
      'cert': {
        'required': 'Client cert is required'
      },
      'key': {
        'required': 'Client key is required',
      },
      'ca': {
        'required': 'Client CA is required',
      }
    },
  }

  buildDockerCredForm(conId: string) {
    return this.http.get<any>(CONTAINER_CONTROLLER_BY_ID_AND_TYPE(conId, CONTROLLER_TYPE_MAPPING.DOCKER)).pipe(map(data => {
      return this.builder.group({
        'cert': [, [Validators.required]],
        'key': ['', [Validators.required]],
        'ca': ['', [Validators.required]]
      });
    }));
  }

  buildCredForm(type: CONTROLLER_TYPE_MAPPING): FormGroup {
    switch (type) {
      case CONTROLLER_TYPE_MAPPING.KUBERNETES:
        return this.builder.group({
          'username': [, [Validators.required, NoWhitespaceValidator]],
          'password': [, [Validators.required, NoWhitespaceValidator]],
          'confirm_password': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.compare({ fieldName: 'password' })]],
        });
      case CONTROLLER_TYPE_MAPPING.DOCKER:
        return this.builder.group({
          'password': [, [Validators.required, NoWhitespaceValidator]],
          'confirm_password': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.compare({ fieldName: 'password' })]],
        });
      default:
        break;
    }
  }

  updateCredentials(conId: string, type: CONTROLLER_TYPE_MAPPING, data: DockerCredType | KubernetesCredType) {
    return this.http.put(EDIT_CONTAINER_CONTROLLER(conId, type), data);
  }

  toFormData<T>(formValue: T, formValue1?: T) {
    const formData = new FormData();
    for (const key of Object.keys(formValue)) {
      const value = formValue[key];
      formData.append(key, value);
    }
    if (formValue1) {
      for (const key of Object.keys(formValue1)) {
        const value = formValue1[key];
        if (key.includes('unity-cert')) {
          formData.append('cert', this.appService.convertToBinary(value));
        } else if (key.includes('unity-key')) {
          formData.append('key', this.appService.convertToBinary(value));
        } else if (key.includes('unity-ca')) {
          formData.append('ca', this.appService.convertToBinary(value));
        } else {
          formData.append(key, this.appService.convertToBinary(value));
        }
      }
    }
    return formData;
  }
}