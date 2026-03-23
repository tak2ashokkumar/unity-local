import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { NagiosEventCategory, NagiosEventType } from 'src/app/shared/SharedEntityTypes/nagios-settings.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { ADDING_DEFAULT_CATEGORY_TYPE, ADDING_DEFAULT_EVENT_TYPE, DELETE_DEFAULT_CATEGORY_TYPE, DELETE_DEFAULT_EVENT_TYPE, GET_DEFAULT_CATEGORY_TYPE, GET_DEFAULT_EVENT_TYPE, UPDATE_DEFAULT_CATEGORY_TYPE, UPDATE_DEFAULT_EVENT_TYPE } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class NagiosSettingsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService) { }

  getEventTypes(criteria: SearchCriteria): Observable<PaginatedResult<NagiosEventType>>{
    return this.tableService.getData<PaginatedResult<NagiosEventType>>(GET_DEFAULT_EVENT_TYPE(), criteria);
  }

  eventUpdate(obj: any, uuid: string){
    return this.http.put<NagiosEventType>(UPDATE_DEFAULT_EVENT_TYPE(uuid), obj);
  }

  eventAdd(formData: any) {
    return this.http.post<NagiosEventType>(ADDING_DEFAULT_EVENT_TYPE(), formData);
  }

  eventDelete(uuid : string){
    return this.http.delete(DELETE_DEFAULT_EVENT_TYPE(uuid));
  }

  keywordUpdate(arr: string[], uuid: string) {
    return this.http.patch(UPDATE_DEFAULT_EVENT_TYPE(uuid), { 'keyword': arr });
  }

  eventCategorykeywordUpdate(arr: string[], uuid: string) {
    return this.http.patch(UPDATE_DEFAULT_EVENT_TYPE(uuid), { 'event_category_data': arr });
  }

  getEventCategories(criteria: SearchCriteria): Observable<PaginatedResult<NagiosEventCategory>> {
    return this.tableService.getData<PaginatedResult<NagiosEventCategory>>(GET_DEFAULT_CATEGORY_TYPE(), criteria);
  }

  categoryAdd(formData: any) {
    formData['event_source'] = 'Nagios';
    return this.http.post<NagiosEventCategory>(ADDING_DEFAULT_CATEGORY_TYPE(), formData);
  }

  categoryDelete(uuid: string) {
    return this.http.delete(DELETE_DEFAULT_CATEGORY_TYPE(uuid));
  }

  categoryUpdate(obj: any, uuid: string) {
    obj['event_source'] = 'Nagios';
    return this.http.put<NagiosEventCategory>(UPDATE_DEFAULT_CATEGORY_TYPE(uuid), obj);
  }

  keywordCategoryUpdate(arr: string[], uuid: string) {
    return this.http.patch(UPDATE_DEFAULT_CATEGORY_TYPE(uuid), { 'keyword': arr });
  }

  categoryEventkeywordUpdate(arr: string[], uuid: string) {
    return this.http.patch(UPDATE_DEFAULT_CATEGORY_TYPE(uuid), { 'event_type_data': arr });
  }

  convertToEventTypeViewData(eventTypes: NagiosEventType[]): NagiosEventTypeViewData[] {
    let viewData: NagiosEventTypeViewData[] = [];
    eventTypes.map(et => {
      let a = new NagiosEventTypeViewData();
      a.name = et.name;
      a.uuid = et.uuid;
      a.keywords = et.keyword ? et.keyword : [];
      a.categories = et.event_category_data ? et.event_category_data : [];
      a.isDisabled = et.is_enabled;
      a.statusEventIconTooltip = et.is_enabled ? 'Disable' : 'Enable';
      a.statusIconClass = et.is_enabled ? 'fas fa-toggle-on' : 'fas fa-toggle-off';
      a.eventForm = this.buildForm(a.name);
      a.eventFormErrors = this.eventFormErrors;
      a.eventFormValidationMessage = this.eventFormValidationMessage;
      a.onForm = false;
      // a.form = this.buildKeywordForm();
      // a.formErrors = this.resetKeywordFormErrors();
      // a.formValidationMessages = this.keywordFormValidationMessages;
      viewData.push(a);
    })
    return viewData;
  }

  convertToEventCategoryViewData(categories: NagiosEventCategory[]): NagiosEventCategoryViewData[] {
    let viewData: NagiosEventCategoryViewData[] = [];
    categories.map(et => {
      let a = new NagiosEventCategoryViewData();
      a.name = et.name;
      a.uuid = et.uuid;
      a.keywords = et.keyword ? et.keyword: [];
      a.types = et.event_type_data ? et.event_type_data : [];
      a.isDisabled = et.is_enabled;
      a.statusEventIconTooltip = et.is_enabled ? 'Disable' : 'Enable';
      a.statusIconClass = et.is_enabled ? 'fas fa-toggle-on' : 'fas fa-toggle-off';
      a.categoryForm = this.buildForm(a.name);
      a.categoryFormErrors = this.eventFormErrors;
      a.categoryFormValidationMessage = this.eventFormValidationMessage;
      a.onForm = false;

      // a.form = this.buildKeywordForm();
      // a.formErrors = this.resetKeywordFormErrors();
      // a.formValidationMessages = this.keywordFormValidationMessages;
      viewData.push(a);
    })
    return viewData;
  }

  buildForm(name: string) {
    if (name) {
      return this.builder.group({
        'name': [name, [Validators.required]],
      });
    } else {
      return this.builder.group({
        'name': ['', [Validators.required]],
      });
    }
  }

  eventFormErrors() {
    return {
      'name': '',
    }
  }

  eventFormValidationMessage = {
    'name': {
      'required': 'name is required'
    }
  }

  buildKeywordForm(): FormGroup {
    return this.builder.group({
      "keyword": ['', [Validators.required, NoWhitespaceValidator]]
    })
  }

  resetKeywordFormErrors() {
    return {
      "keyword": ""
    }
  }

  keywordFormValidationMessages = {
    "keyword": {
      "required": "Keyword is required"
    }
  }
}

export class NagiosEventTypeViewData {
  constructor() { }
  id: string;
  uuid: string;
  name: string;
  keywords: string[];
  categories: string[];
  isDisabled: boolean;
  isAddkeywordsPopover: boolean = false;
  isAddEventCategoryPopover: boolean = false;
  status: string;
  statusEventIconTooltip: string;
  statusIconClass: string;
  eventForm: FormGroup;
  eventFormErrors: any;
  eventFormValidationMessage: any;
  // form: FormGroup;
  // formErrors: any;
  // formValidationMessages: any;
  onForm: boolean;
}

export class NagiosEventCategoryViewData {
  constructor() { }
  id: string;
  uuid: string;
  name: string;
  keywords: string[];
  types: string[];
  isDisabled: boolean;
  status: string;
  statusEventIconTooltip: string;
  statusIconClass: string;
  isAddkeywordsPopover: boolean = false;
  isAddEventTypePopover: boolean = false;
  categoryForm: FormGroup;
  categoryFormErrors: any;
  categoryFormValidationMessage: any;
  // form: FormGroup;
  // formErrors: any;
  // formValidationMessages: any;
  onForm: boolean;
}

// export const eventTypes: NagiosEventType[] = [
//   {
//     name: "Up",
//     keywords: ["Running", "Success"],
//     categories: ["Memory", "Interface"]
//   },
//   {
//     name: "Down",
//     keywords: ["Fail", "warning"],
//     categories: ["Node", "CPU"]
//   }
// ]

// export const eventCategories: NagiosEventCategory[] = [
//   {
//     name: "Node",
//     keywords: ["Node", "Host"],
//     types: ["Down", "Restart"]
//   },
//   {
//     name: "CPU",
//     keywords: ["Fail", "warning"],
//     types: ["Down", "Threshold", "Up"]
//   }
// ]
