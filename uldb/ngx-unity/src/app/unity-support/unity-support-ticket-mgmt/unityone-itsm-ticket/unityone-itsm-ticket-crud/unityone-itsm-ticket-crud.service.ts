import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable({
  providedIn: 'root'
})
export class UnityoneItsmTicketCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private tableService: TableApiServiceService) { }

  createUnityOne(tableId: string, obj: any): Observable<any> {
    return this.http.post<any>(`/rest/unity_itsm/tables/${tableId}/records/ `, obj);
  }

  updateUnityOne(tableId: string, recordUuid: string, obj: any): Observable<any> {
    return this.http.put<any>(`/rest/unity_itsm/tables/${tableId}/records/${recordUuid}/`, obj);
  }

  getUpdateUnityOne(tableId: string, recordUuid: string): Observable<any> {
    return this.http.get<any>(`/rest/unity_itsm/tables/${tableId}/records/${recordUuid}/`);
  }

  getReference(ticketId:string): Observable<any> {
    return this.http.get<any>(`rest/unity_itsm/tables/${ticketId}/records/`);
  }

  getUnityOneData(tableId: string): Observable<any> {
    return this.http.get<any>(`/rest/unity_itsm/tables/${tableId}/`);
  }

  createComment(tableId: string, recordUuid: string, obj: any): Observable<any> {
    return this.http.post<any>(`/rest/unity_itsm/tables/${tableId}/records/${recordUuid}/comments/ `, obj);
  }

  getComment(tableId: string, recordUuid: string, criteria: SearchCriteria): Observable<any> {
    return this.tableService.getData<any>(`/rest/unity_itsm/tables/${tableId}/records/${recordUuid}/activity/`, criteria);
  }

  buildFieldsFormFromMetadata(fieldsMeta: any[], fb: FormBuilder): FormGroup {
    const fieldsArr = fb.array([]);

    if (Array.isArray(fieldsMeta)) {
      fieldsMeta.forEach(fm => {
        fieldsArr.push(this.createRenderFieldGroup(fm, fb));
      });
    }

    return fb.group({
      fields: fieldsArr
    });
  }

  buildCommentForm(fieldName: string): FormGroup {
    return this.builder.group({
      'field_name': [fieldName, Validators.required],
      'comment': ['', [Validators.required, NoWhitespaceValidator]]
    });
  }

  resetFormErrors(fieldsLength: number = 0) {
    return {
      'fields': Array.from({ length: fieldsLength }).map(() => ({
        'value': ''
      }))
    };
  }

  formValidationMessages = {
    'fields': {
      'value': {
        'required': 'This field is required',
        'invalidJson': 'Please enter a valid JSON'
      }
    }
  };


  createRenderFieldGroup(fieldData: any, fb: FormBuilder): FormGroup {
    // Determine validator for user value
    const valueValidators = [];
    if (fieldData?.is_required) {
      valueValidators.push(Validators.required);
    }


    // Default initial value based on type
    let defaultValue: any = '';
    const ft = (fieldData?.field_type);
    if (ft === 'BOOLEAN') defaultValue = false;
    if (ft === 'NUMBER') defaultValue = null;
    if (ft === 'COMMENTS') defaultValue = null;
    if (ft === 'JSON') {
      valueValidators.push(JsonValidator);
    }

    // Create options FormArray (for DROPDOWN)
    const optionsArr = fb.array([]);
    if (Array.isArray(fieldData?.options)) {
      fieldData.options.forEach(opt => optionsArr.push(fb.control(opt)));
    }

    return fb.group({
      label: [fieldData?.label || ''],
      field_name: [fieldData?.field_name || ''],
      field_type: [ft],
      is_required: [!!fieldData?.is_required],
      reference_table: [fieldData?.reference_table || null],
      options: optionsArr,
      help_text: [fieldData?.help_text || ''],
      value: [defaultValue, valueValidators]
    });
  }
}

export function JsonValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  // allow empty → required validator handles mandatory check
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // already an object → valid
  if (typeof value === 'object') {
    return null;
  }

  // must be valid JSON string
  try {
    JSON.parse(value);
    return null;
  } catch {
    return { invalidJson: true };
  }
}