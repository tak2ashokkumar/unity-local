import { Injectable } from '@angular/core';
import { Subject, Observable, of } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MESH_SERVICE_MANAGER_BY_ID_AND_TYPE, ADD_SERVICE_MANAGER, EDIT_SERVICE_MANAGER, DELETE_SERVICE_MANAGER, CHANGE_SERVICE_MANAGER_PASSWORD } from 'src/app/shared/api-endpoint.const';
import { map } from 'rxjs/operators';
import { NoWhitespaceValidator, EmailValidator } from 'src/app/shared/app-utility/app-utility.service';
import { MESH_SERVICE_TYPE_MAPPING } from '../mesh-service.type';
import { AnthosCRUDType, AppMeshCRUDType, IstioCRUDType, IstioCredType, AppMeshCredType, AnthosCredType } from './mesh-service-crud.type';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

@Injectable()
export class MeshServicesCrudService {
  private addOrEditAnnouncedSource = new Subject<{ uuid: string, serviceType: MESH_SERVICE_TYPE_MAPPING }>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  private changePasswordAnnouncedSource = new Subject<{ uuid: string, serviceType: MESH_SERVICE_TYPE_MAPPING }>();
  changePasswordAnnounced$ = this.changePasswordAnnouncedSource.asObservable();

  private deleteAnnouncedSource = new Subject<{ uuid: string, serviceType: MESH_SERVICE_TYPE_MAPPING }>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  addOrEdit(uuid: string, serviceType: MESH_SERVICE_TYPE_MAPPING) {
    this.addOrEditAnnouncedSource.next({ uuid: uuid, serviceType: serviceType });
  }

  changePassword(uuid: string, serviceType: MESH_SERVICE_TYPE_MAPPING) {
    this.changePasswordAnnouncedSource.next({ uuid: uuid, serviceType: serviceType });
  }

  deleteMeshService(svcId: string, serviceType: MESH_SERVICE_TYPE_MAPPING) {
    this.deleteAnnouncedSource.next({ uuid: svcId, serviceType: serviceType });
  }

  addMeshService(data: AnthosCRUDType | AppMeshCRUDType | IstioCRUDType) {
    return this.http.post(ADD_SERVICE_MANAGER(data.service_type), data);
  }

  updateMeshService(svcId: string, data: AnthosCRUDType | AppMeshCRUDType | IstioCRUDType) {
    return this.http.put(EDIT_SERVICE_MANAGER(svcId, data.service_type), data);
  }

  confirmDeleteMeshService(svcId: string, serviceType: MESH_SERVICE_TYPE_MAPPING) {
    return this.http.delete(DELETE_SERVICE_MANAGER(svcId, serviceType));
  }

  resetBaseFormErrors() {
    return {
      'service_type': ''
    };
  }
  resetAnthosFormErrors() {
    return {
      'name': '',
      'email': '',
      'service_account_info': ''
    };
  }
  resetAppMeshFormErrors() {
    return {
      'account_name': '',
      'access_key': '',
      'secret_key': ''
    };
  }

  resetIstioFormErrors() {
    return {
      'name': '',
      'hostname': '',
      'username': '',
      'password': '',
    }
  }

  validationMessages = {
    baseFormMessages: {
      'service_type': {
        'required': 'Service type is required'
      }
    },
    anthosFormMessages: {
      'name': {
        'required': 'Account Name is required'
      },
      'email': {
        'required': 'Email is required',
        'invalidEmail': 'Enter a valid email address'
      },
      'service_account_info': {
        'required': 'Service Account Info is required',
        'json': 'Invalid json'
      }
    },
    appMeshFormMessages: {
      'account_name': {
        'required': 'Account Name is required'
      },
      'access_key': {
        'required': 'Access Key is required'
      },
      'secret_key': {
        'required': 'Secret Key is required'
      }
    },
    istioFormMessages: {
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
    }
  }

  createBaseForm(type?: MESH_SERVICE_TYPE_MAPPING): FormGroup {
    return this.builder.group({
      'service_type': [type ? { value: type, disabled: true } : '', [Validators.required]]
    });
  }

  createAnthosForm(svcId: string): Observable<FormGroup> {
    if (svcId) {
      return this.http.get<GCPAccount>(MESH_SERVICE_MANAGER_BY_ID_AND_TYPE(svcId, MESH_SERVICE_TYPE_MAPPING.ANTHOS)).pipe(map(data => {
        return this.builder.group({
          'uuid': [data.uuid],
          'name': [data.name, [Validators.required, NoWhitespaceValidator]],
          'email': [data.email, [Validators.required, NoWhitespaceValidator, EmailValidator]],
          'service_mesh': [true]
        });
      }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'email': ['', [Validators.required, NoWhitespaceValidator, EmailValidator]],
        'service_account_info': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.json()]],
        'service_mesh': [true]
      }));
    }
  }

  createAppMeshForm(svcId: string): Observable<FormGroup> {
    if (svcId) {
      return this.http.get<AWSAccount>(MESH_SERVICE_MANAGER_BY_ID_AND_TYPE(svcId, MESH_SERVICE_TYPE_MAPPING.AWS)).pipe(map(data => {
        return this.builder.group({
          'id': [data.id],
          'aws_user': [data.aws_user],
          'account_name': [data.account_name, [Validators.required, NoWhitespaceValidator]],
          'service_mesh': [true]
        });
      }));
    } else {
      return of(this.builder.group({
        'account_name': ['', [Validators.required, NoWhitespaceValidator]],
        'access_key': ['', [Validators.required, NoWhitespaceValidator]],
        'secret_key': ['', [Validators.required]],
        'service_mesh': [true]
      }));
    }
  }

  createIstioForm(svcId: string): Observable<FormGroup> {
    if (svcId) {
      return this.http.get<any>(MESH_SERVICE_MANAGER_BY_ID_AND_TYPE(svcId, MESH_SERVICE_TYPE_MAPPING.ISTIO)).pipe(map(input => {
        return this.builder.group({
          'name': [input.name, [Validators.required, NoWhitespaceValidator]],
          'hostname': [input.hostname, [Validators.required, NoWhitespaceValidator]],
          'username': [input.username, [Validators.required, NoWhitespaceValidator]],
          'service_mesh': [true]
        });
      }));
    } else {
      return of(this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'hostname': ['', [Validators.required, NoWhitespaceValidator]],
        'username': ['', [Validators.required, NoWhitespaceValidator]],
        'password': ['', [Validators.required, NoWhitespaceValidator]],
        'service_mesh': [true]
      }));
    }
  }

  resetAnthosCredFormErrors(): any {
    return {
      'service_account_info': ''
    }
  }

  resetAppMeshCredFormErrors(): any {
    return {
      'access_key': '',
      'secret_key': ''
    }
  }

  resetIstioCredFormErrors(): any {
    return {
      'password': '',
      'confirm_password': ''
    }
  }

  credValidationMessages = {
    anthosMessages: {
      'service_account_info': {
        'required': 'Service Account Info is required',
        'json': 'Invalid json'
      }
    },
    appMeshMessages: {
      'access_key': {
        'required': 'Access Key is required'
      },
      'secret_key': {
        'required': 'Secret Key is required'
      }
    },
    istioMessages: {
      'password': {
        'required': 'Password is required'
      },
      'confirm_password': {
        'required': 'Confirm Password is required',
        'compare': 'Passwords must match'
      }
    }
  }

  buildAppMeshCredForm(svcId: string) {
    return this.http.get<AWSAccount>(MESH_SERVICE_MANAGER_BY_ID_AND_TYPE(svcId, MESH_SERVICE_TYPE_MAPPING.AWS)).pipe(map(data => {
      return this.builder.group({
        'id': [data.id],
        'access_key': [data.access_key, [Validators.required, NoWhitespaceValidator]],
        'secret_key': ['', [Validators.required]]
      });
    }));
  }

  buildCredForm(type: MESH_SERVICE_TYPE_MAPPING): FormGroup {
    switch (type) {
      case MESH_SERVICE_TYPE_MAPPING.ANTHOS:
        return this.builder.group({
          'service_account_info': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.json()]],
        });
      case MESH_SERVICE_TYPE_MAPPING.ISTIO:
        return this.builder.group({
          'password': [, [Validators.required, NoWhitespaceValidator]],
          'confirm_password': ['', [Validators.required, NoWhitespaceValidator, RxwebValidators.compare({ fieldName: 'password' })]],
        });
      default:
        break;
    }
  }

  updateCredentials(svcId: string, type: MESH_SERVICE_TYPE_MAPPING, data: AnthosCredType | AppMeshCredType | IstioCredType) {
    return this.http.post(CHANGE_SERVICE_MANAGER_PASSWORD(svcId, type), data);
  }
}