import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ADD_ENTITY_GROUP_LIST, EDIT_ENTITY_GROUP_LIST, GET_ENTITY_RESOURCES_LIST, GET_ENTITY_TYPES_LIST } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceIconService } from 'src/app/shared/device-icon.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { EntityGroupDataType, GroupObjectsDataType, ModuleModelsDataType } from '../usum-entity-group.type';

@Injectable()
export class UsumEntityGroupCrudService {
  
    constructor(private http: HttpClient,
      private builder: FormBuilder,
      private tableSvc: TableApiServiceService,
      private utilSvc: AppUtilityService,
      private iconSvc: DeviceIconService) { }

    getEntityGroupDetailsById(uuid: string) {
      return this.http.get<EntityGroupDataType>(EDIT_ENTITY_GROUP_LIST(uuid));
    }

    getEntityTypes() {
      return this.http.get<ModuleModelsDataType[]>(GET_ENTITY_TYPES_LIST());
    }
    
    getResourcesByEntityTypes(criteria: SearchCriteria): Observable<PaginatedResult<GroupObjectsDataType>> {
      let params = this.tableSvc.getWithParam(criteria);
      return this.http.get<PaginatedResult<GroupObjectsDataType>>(GET_ENTITY_RESOURCES_LIST(), { params: params });
    }
  
    buildForm(data?: EntityGroupDataType) {
      if (data) {
        let form = this.builder.group({
          'name': [data.name, [Validators.required, NoWhitespaceValidator]],
          'description': [data.description],
          'module_models': [data.module_models, [Validators.required]],
          'entity_selection': [data.entity_selection, [Validators.required]],
        });
        if (data.entity_selection == 'custom') {
          form.addControl('group_objects', new FormControl(data.group_objects, [Validators.required]));
        }
        return form;
      } else {
        return this.builder.group({
          'name': ['', [Validators.required]],
          'description': [''],
          'module_models': [[], [Validators.required]],
          'entity_selection': ['all', [Validators.required]]
        });
      }
    }
  
    resetFormErrors(): any {
      let formErrors = {
        'name': '',
        // 'description': '',
        'module_models': '',
        'entity_selection': '',
        'group_objects': '',
      };
      return formErrors;
    }
  
    formValidationMessages = {
      'name': {
        'required': 'Name is required'
      },
      // 'description': {
      //   'required': 'Description is required'
      // },
      'module_models': {
        'required': 'Entity Type is required'
      },
      'entity_selection': {
        'required': 'Selection is required'
      },
      'group_objects': {
        'required': 'Entity Resources is required'
      },
    };
    
    
    create(data: EntityGroupDataType, id?: string) {
      if (id) {
        return this.http.put<EntityGroupDataType>(EDIT_ENTITY_GROUP_LIST(id), data);
      } else {
        return this.http.post<EntityGroupDataType>(ADD_ENTITY_GROUP_LIST(), data);
      }
    }
  }