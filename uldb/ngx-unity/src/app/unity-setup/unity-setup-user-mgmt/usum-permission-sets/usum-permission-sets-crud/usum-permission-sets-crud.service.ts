import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ADD_PERMISSION_SET, EDIT_PERMISSION_SET, GET_ENTITY_GROUP_LIST_FAST, GET_MODULES_AND_PERMISSIONS, GET_PERMISSION_SET_DETAIL } from 'src/app/shared/api-endpoint.const';
import { ModulesAndPermissionsType, PermissionSetFormDataType } from '../usum-permission-sets.type';
import { EntityGroupsFastType, PermissionSetType } from 'src/app/shared/SharedEntityTypes/user-mgmt.type';

@Injectable()
export class UsumPermissionSetsCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getEntityGtoups(): Observable<EntityGroupsFastType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<EntityGroupsFastType[]>(GET_ENTITY_GROUP_LIST_FAST(), { params: params });
  }

  getModulesPermissionSets(): Observable<ModulesAndPermissionsType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<ModulesAndPermissionsType[]>(GET_MODULES_AND_PERMISSIONS(), { params: params });
  }

  convertToModulePermissionSetsViewData(data: ModulesAndPermissionsType[]): ModulePermissionSetViewData[] {
    let viewData: ModulePermissionSetViewData[] = [];
    data.map(d => {
      let a = new ModulePermissionSetViewData();
      a.moduleName = d.module_name;
      if (d.permission_names.length) {
        d.permission_names.map(p => {
          let ap = new ModulePermissionSetView();
          ap.permission = p;
          a.permissionSets.push(ap);
        })
      }
      viewData.push(a);
    })
    return viewData;
  }

  getPermissionSetDetails(permissionSetId: string): Observable<PermissionSetType> {
    return this.http.get<PermissionSetType>(GET_PERMISSION_SET_DETAIL(permissionSetId));
  }

  buildForm(permissionSetDetails: PermissionSetType): FormGroup {
    if (permissionSetDetails) {
      let form: FormGroup = this.builder.group({
        'name': [permissionSetDetails.name, [Validators.required, NoWhitespaceValidator]],
        'description': [permissionSetDetails.description, [Validators.required, NoWhitespaceValidator]],
        'entity_groups': [permissionSetDetails.entity_groups],
      });
      return form;
    } else {
      let form: FormGroup = this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'description': ['', [Validators.required, NoWhitespaceValidator]],
        'entity_groups': [[]],
      });
      return form;
    }
  }

  resetFormErrors() {
    return {
      'name': '',
      'description': '',
    }
  }

  formValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'description': {
      'required': 'Description is required'
    }
  }

  save(formData: PermissionSetFormDataType, permissionSetId?: string): Observable<PermissionSetType> {
    if (permissionSetId) {
      return this.http.patch<PermissionSetType>(EDIT_PERMISSION_SET(permissionSetId), formData);
    } else {
      return this.http.post<PermissionSetType>(ADD_PERMISSION_SET(), formData);
    }
  }

  convertToAPIData(fd: ModulePermissionSetAPIData, selectedPermissinSets: ModulePermissionSetViewData[]): ModulePermissionSetAPIData {
    fd.rbac_permissions = [];
    selectedPermissinSets.map(sp => {
      let k: ModulesAndPermissionsType = {
        module_name: sp.moduleName,
        permission_names: []
      };
      sp.permissionSets = sp.permissionSets.filter(sp => sp.isSelected);
      sp.permissionSets.map(spp => {
        k.permission_names.push(spp.permission);
      })
      fd.rbac_permissions.push(k);
    })
    return fd;
  }
}

export class ModulePermissionSetViewData {
  moduleName: string;
  permissionSets: ModulePermissionSetView[] = [];
}

export class ModulePermissionSetView {
  permission: string;
  isSelected: boolean = false;
}

export class ModulePermissionSetAPIData {
  name: string;
  description: string;
  rbac_permissions: ModulesAndPermissionsType[] = [];
}

export const viewPermissionEnabledBasedOnOnePermissionName: string[] = ['Download Activity Log', 'Manage AIML Event Management', 'Manage Cost Analysis',
  'Manage Credentials', 'Manage Dashboard', 'Manage DevOps Automation', 'View DevOps Automation', 'Manage Maintenance', 'Manage Monitoring',
  'Manage Notifications', 'Manage Service Catalog', 'Manage Services', 'Manage Tickets', 'Manage UnityConnect', 'Manage Unity Report', 'Manage UnitySetup',
  'Manage Scripts']

export const viewPermissionEnableBasedOnMultiplePermissionName: string[] = ['Manage Datacenter', 'Remote Management', 'Manage Integrations',
  'Add Integrations', 'Sync Integrations', 'Manage Onboarding', 'Discovery Admin', 'Manage Private Cloud', 'Manage Public Cloud',
  'Manage UnityCollector', 'Register UnityCollector', 'Manage Users', 'Create Users']