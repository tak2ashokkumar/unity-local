import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AIMLSourceData } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { ADDING_CATEGORY_TYPE, DELETE_CATEGORY_TYPE, GET_CATEGORY_TYPE, TOGGLE_CATEGORY_TYPE, UPDATE_CATEGORY_TYPE } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class SourceEventCategoriesService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getEventTypes(): Observable<string[]> {
    return this.http.get<string[]>(`/customer/aiops/event-types/unique-names/`);
  }

  getCategoryTypes(criteria: SearchCriteria): Observable<AIMLSourceCategoryType[]> {
    return this.tableService.getData<AIMLSourceCategoryType[]>(GET_CATEGORY_TYPE(), criteria);
  }

  convertToCategoryTypeViewData(categories: AIMLSourceCategoryType[]): AIMLCategoryTypeViewdata[] {
    let viewData: AIMLCategoryTypeViewdata[] = [];
    categories.forEach(s => {
      let a = new AIMLCategoryTypeViewdata();
      a.id = s.id;
      a.uuid = s.uuid;
      a.categoryType = s.name;
      a.keywords = s.keywords ? s.keywords : [];
      a.eventType = s.event_type_data ? s.event_type_data : [];
      a.isDisabled = s.is_enabled;
      a.statusEventIconTooltip = s.is_enabled ? 'Disable' : 'Enable';
      a.statusIconClass = s.is_enabled ? 'fas fa-toggle-on' : 'fas fa-toggle-off';
      a.categoryForm = this.buildCategoryForm(a.categoryType);
      a.categoryFormErrors = this.resetCategoryFormErrors();
      a.categoryFormValidationMessages = this.categoryFormValidationMessages;
      a.onForm = false;
      viewData.push(a);
    })
    return viewData;
  }

  buildCategoryForm(name?: string) {
    if (name) {
      return this.builder.group({
        'name': [name, [Validators.required, NoWhitespaceValidator]],
      });
    } else {
      return this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
      });
    }
  }

  resetCategoryFormErrors() {
    return {
      'name': '',
    }
  }

  categoryFormValidationMessages = {
    'name': {
      'required': 'name is required'
    }
  }

  categoryAdd(formData: any, criteria: SearchCriteria) {
    // formData['source'] = { "id": criteria.params[0].source };
    return this.http.post<AIMLSourceCategoryType>(ADDING_CATEGORY_TYPE(), formData);
  }

  categoryUpdate(obj: any, uuid: string, criteria: SearchCriteria) {
    // obj['source'] = { "id": criteria.params[0].source };
    return this.http.put<AIMLSourceCategoryType>(UPDATE_CATEGORY_TYPE(uuid), obj);
  }

  toggleCategory(uuid: string) {
    return this.http.get(TOGGLE_CATEGORY_TYPE(uuid));
  }

  categoryDelete(uuid: string) {
    return this.http.delete(DELETE_CATEGORY_TYPE(uuid));
  }

  buildKeywordForm() {
    return this.builder.group({
      'keywords': [[], [Validators.required, NoWhitespaceValidator]]
    })
  }

  resetKeywordFormErrors() {
    return {
      'keywords': '',
    }
  }

  keywordFormValidationMessages = {
    'keywords': {
      'required': 'keyword is required'
    }
  }

  updateKeywords(arr: string[], uuid: string) {
    return this.http.patch(UPDATE_CATEGORY_TYPE(uuid), { 'keywords': arr });
  }

  updateEventTypes(arr: string[], uuid: string) {
    return this.http.patch(UPDATE_CATEGORY_TYPE(uuid), { 'event_type_data': arr });
  }
}

export interface AIMLSourceCategoryType {
  id: string;
  uuid: string;
  name: string
  keywords: string[];
  event_type_data: string[];
  is_enabled: boolean;
}

export class AIMLCategoryTypeViewdata {
  constructor() { }
  id: string;
  uuid: string;
  categoryType: string;
  keywords: string[] = [];
  eventType: string[];
  isDisabled: boolean;
  status: string;
  statusEventIconTooltip: string;
  statusIconClass: string;
  categoryForm: FormGroup;
  categoryFormErrors: any;
  categoryFormValidationMessages: any;
  onForm: boolean;
  isAddkeywordsPopover: boolean = false;
  isAddEventTypePopover: boolean = false;
}

export class UpdateViewData {
  constructor() { }
  id: number;
  uuid: string;
  event: string;
  category: string;
  customer: CustomerViewData;
  source: SourceViewData;
}

export class CustomerViewData {
  constructor() { }
  id: number;
}

export class SourceViewData {
  constructor() { }
  id: number;
}
