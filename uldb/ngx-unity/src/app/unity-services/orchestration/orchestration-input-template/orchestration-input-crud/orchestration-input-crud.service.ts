import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class OrchestrationInputCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,) { }

  getCategoryList() {
    return this.http.get<any[]>(`/orchestration/template_category/?page_size=0`);
  }
  
  createCategory(obj:inputTemplateType){
    return this.http.post<any>('/orchestration/template_category/',obj);
  }

  getDependencyList() {
    return this.http.get<any[]>(`/orchestration/input_template/?page_size=0`);
  }

  updateTemplate(templateId: string, obj: any) {
    return this.http.put<any>(`/orchestration/input_template/${templateId}/`, obj);
  }

  createTemplate(obj: any){
    return this.http.post<any>(`/orchestration/input_template/`, obj);
  }

  getTemplateDataById(templateId:string){
    return this.http.get<inputTemplateType>(`/orchestration/input_template/${templateId}/`)
  }

  createCategoryForm(): FormGroup {
    return this.builder.group({
      'name': ['', [Validators.required, NoWhitespaceValidator]],
    });
  }

  resetCategoryFormErrors() {
    return {
      'name': '',
    }
  }

  categoryValidationMessages = {
    'name': {
      'required': 'Name is mandatory'
    },
  }



  buildForm(template?: inputTemplateType): FormGroup {
    if (template) {
      let form = this.builder.group({
        'name': [template.name, [Validators.required]],
        'category': [template.category, [Validators.required]],
        'description': [template.description],
        'input_type': [{ value: 'List', disabled: true }, [Validators.required]],
        'input_name': [template.input_name, [Validators.required]],
        'dependency':[template.dependency ? template.dependency : ''],
        'type': [{ value: 'Manual', disabled: true }, [Validators.required]],
        'options': [template.options, [Validators.required]],
        'template_status': [template.template_status, [Validators.required]],
      });

      return form;
    } else {
      let form = this.builder.group({
        'name': ['', [Validators.required]],
        'category': ['', [Validators.required]],
        'description': [''],
        'input_type': [{ value: 'List', disabled: true }, [Validators.required]],
        'input_name': ['', [Validators.required]],
        'dependency':[''],
        'type': [{ value: 'Manual', disabled: true }, [Validators.required]],
        'options': ['', [Validators.required]],
        'template_status': ['Enabled', [Validators.required]],
      });
      return form;
    }
  }

  resetFormErrors() {
    return {
      name: '',
      category: '',
      description: '',
      input_type: '',
      input_name: '',
      dependency: '',
      type: '',
      options: '',
      template_status: ''
    }
  }

  formValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'category': {
      'required': 'Category is required'
    },
    'description': {
      'required': 'description is required'
    },
    'input_type': {
      'required': 'Input Type is required'
    },
    'input_name': {
      'required': 'Input Name is required'
    },
    'dependency': {
      'required': 'Dependency is required'
    },
    'type': {
      'required': 'Type is required'
    },
    'options': {
      'required': 'Options is required'
    },
    'template_status': {
      'required': 'template Status is required'
    }
  }
}
