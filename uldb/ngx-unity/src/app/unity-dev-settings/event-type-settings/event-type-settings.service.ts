import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { EventType } from 'src/app/shared/SharedEntityTypes/event-source-settings.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { ADDING_DEFAULT_EVENT_TYPE, DELETE_DEFAULT_EVENT_TYPE, GET_DEFAULT_EVENT_TYPE, UPDATE_DEFAULT_EVENT_TYPE } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class EventTypeSettingsService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService) { }

  getEventTypes(criteria: SearchCriteria): Observable<PaginatedResult<EventType>> {
    return this.tableService.getData<PaginatedResult<EventType>>(GET_DEFAULT_EVENT_TYPE(), criteria);
  }

  convertToEventTypeViewData(eventTypes: EventType[]): EventTypeViewData[] {
    let viewData: EventTypeViewData[] = [];
    eventTypes.map(et => {
      let a = new EventTypeViewData();
      a.name = et.name;
      a.uuid = et.uuid;
      a.keywords = et.keywords ? et.keywords : [];
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

  keywordUpdate(arr: string[], uuid: string) {
    return this.http.patch(UPDATE_DEFAULT_EVENT_TYPE(uuid), { 'keyword': arr });
  }

  eventAdd(formData: any) {
    return this.http.post<EventType>(ADDING_DEFAULT_EVENT_TYPE(), formData);
  }

  eventUpdate(obj: any, uuid: string) {
    return this.http.put<EventType>(UPDATE_DEFAULT_EVENT_TYPE(uuid), obj);
  }

  eventDelete(uuid: string) {
    return this.http.delete(DELETE_DEFAULT_EVENT_TYPE(uuid));
  }
}

export class EventTypeViewData {
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
  onForm: boolean;
}
