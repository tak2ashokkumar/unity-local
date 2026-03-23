import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable({
  providedIn: 'root'
})
export class UsiUnityoneItsmCrudService {
  private ngUnsubscribe = new Subject();

  constructor(private builder: FormBuilder, private http: HttpClient) { }

  createUnityOne(obj: any): Observable<any> {
    return this.http.post<any>(`rest/unity_itsm/tables/`, obj);
  }

  updateUnityOne(obj: any, uuid: string): Observable<any> {
    return this.http.put<any>(`rest/unity_itsm/tables/${uuid}/`, obj);
  }

  getReference(): Observable<any> {
    return this.http.get<any>(`rest/unity_itsm/tables/`);
  }

  getUnityOneData(uuid: string): Observable<any> {
    return this.http.get<any>(`rest/unity_itsm/tables/${uuid}`);
  }

  buildForm(task: any): FormGroup {
    if (task) {
      let form = this.builder.group({
        'name': [task?.name || '', [Validators.required, NoWhitespaceValidator]],
        'description': [task?.description || ''],
        'ticket_id_prefix': [task?.ticket_id_prefix || '', [Validators.required, NoWhitespaceValidator]],
        'fields': this.builder.array([]),
        'is_enabled': [task?.is_enabled]
      });
      return form;
    } else {
      let form = this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'description': [''],
        'ticket_id_prefix': ['', [Validators.required, NoWhitespaceValidator]],
        'fields': this.builder.array([]),
        'is_enabled': [true]
      });
      return form;
    }
  }

  createFieldGroup(task: any): FormGroup {
    if (task) {
      let form = this.builder.group({
        'id': [task?.id || null],
        'label': [task?.label || '', [Validators.required, NoWhitespaceValidator]],
        'field_name': [task?.field_name || '', [Validators.required, NoWhitespaceValidator, uniqueParamNameValidator]],
        'field_type': [task?.field_type || '', [Validators.required]],
        'is_required': [{ value: task?.is_required || false, disabled: task?.field_type === 'COMMENTS' }],
        'reference_table': [task?.reference_table || ''],
        'options': this.builder.array([])
      });
      form.get('field_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(type => {
        const isRequiredCtrl = form.get('is_required');
        if (type === 'COMMENTS') {
          isRequiredCtrl?.setValue(false);
          isRequiredCtrl?.disable({ emitEvent: false });
        } else {
          isRequiredCtrl?.enable({ emitEvent: false });
        }
      });
      return form;
    } else {
      let form = this.builder.group({
        'label': ['', [Validators.required, NoWhitespaceValidator]],
        'field_name': ['', [Validators.required, NoWhitespaceValidator, uniqueParamNameValidator]],
        'field_type': ['', [Validators.required]],
        'is_required': [false],
        'reference_table': [''],
        'options': this.builder.array([])
      });
      form.get('field_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(type => {
        const isRequiredCtrl = form.get('is_required');
        if (type === 'COMMENTS') {
          isRequiredCtrl?.setValue(false);
          isRequiredCtrl?.disable({ emitEvent: false });
        } else {
          isRequiredCtrl?.enable({ emitEvent: false });
        }
      });
      return form;
    }
  }

  resetFormErrors() {
    return {
      'name': '',
      'description': '',
      'ticket_id_prefix': '',
      'fields': []
    }
  }

  formValidationMessages = {
    'name': { 'required': 'Name is required' },
    'description': { 'required': 'Description is required' },
    'ticket_id_prefix': { 'required': 'Ticket ID Template is required' },
    'fields': {
      'label': {
        'required': 'Label is required',
      },
      'field_name': {
        'required': 'Field Name is required',
        'duplicateFieldName': 'Field name should be unique'
      },
      'field_type': {
        'required': 'Field type is required'
      },
      'reference_table': {
        'required': 'Reference is required'
      }
    }
  }

  getFieldErrors() {
    return {
      'label': '',
      'field_name': '',
      'field_type': '',
      'reference_table': '',
      'options': [] as string[]
    };
  }


}

export function uniqueParamNameValidator(control: AbstractControl): ValidationErrors | null {
  const currentValue = control.value?.trim();
  if (!currentValue) return null;

  const parentGroup = control.parent;
  if (!parentGroup) return null;

  const formArray = parentGroup.parent;
  if (!formArray || !Array.isArray((formArray as any).controls)) return null;

  const duplicateCount = (formArray as any).controls.filter((group: AbstractControl) =>
    group.get('field_name')?.value?.trim() === currentValue
  ).length;

  return duplicateCount > 1 ? { duplicateFieldName: true } : null;
}


