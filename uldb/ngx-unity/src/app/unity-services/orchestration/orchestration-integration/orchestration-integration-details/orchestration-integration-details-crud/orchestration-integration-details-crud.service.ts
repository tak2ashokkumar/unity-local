import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable()
export class OrchestrationIntegrationDetailsCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  addScript(obj: ScriptType, fileToUpload: File): Observable<ScriptType> {
    const formData = this.manageFormData(obj, fileToUpload);
    return this.http.post<ScriptType>(`orchestration/scripts/`, formData);
  }

  updateScript(scriptId: string, obj: ScriptType, fileToUpload?: File): Observable<ScriptType> {
    if (fileToUpload) {
      const formData = this.manageFormData(obj, fileToUpload);
      return this.http.put<ScriptType>(`orchestration/scripts/${scriptId}/`, formData);
    } else {
      const formData = this.manageFormData(obj);
      return this.http.put<ScriptType>(`orchestration/scripts/${scriptId}/`, formData);
    }
  }

  getScriptDataById(scriptId: string): Observable<ScriptType> {
    return this.http.get<ScriptType>(`orchestration/scripts/${scriptId}/`);
  }

  buildForm(script: ScriptType): FormGroup {
    if (script) {
      let form = this.builder.group({
        'name': [script.name, [Validators.required]],
        'description': [script.description],
        'script_type': [{ value: script.script_type, disabled: true }, [Validators.required]],
        'is_source_code': [script.is_source_code, [Validators.required]],
      });
      return form;
    } else {
      let form = this.builder.group({
        'name': ['', [Validators.required]],
        'description': [''],
        'script_type': ['', [Validators.required]],
        'is_source_code': ['false', [Validators.required]],
        'script_file': ['', [Validators.required]]
      });
      return form;
    }
  }

  private manageFormData(obj: ScriptType, fileToUpload?: File) {
    const formData = new FormData();
    formData.append('name', obj.name);
    formData.append('script_type', obj.script_type);
    formData.append('description', obj.description);
    formData.append('is_source_code', obj.is_source_code);
    formData.append('repo', obj.repo)
    if (obj.is_source_code === 'false' || !obj.is_source_code) {
      if (fileToUpload) {
        formData.append('script_file', fileToUpload);
      }
    } else {
      formData.append('source_code', obj.source_code);
    }
    return formData;
  }

  resetFormErrors() {
    return {
      'name': '',
      'description': '',
      'script_type': '',
      'is_source_code': '',
      'script_file': '',
      'source_code': ''
    }
  }

  formValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'description': {
      'required': 'Description is required'
    },
    'script_type': {
      'required': 'Script type is required'
    },
    'is_source_code': {
      'required': 'Upload option is required'
    },
    'script_file': {
      'required': 'Script is required'
    },
    'source_code': {
      'required': 'Source code is required'
    }
  }
}
export interface ScriptType {
  name: string;
  script_type: string;
  description: string;
  repo: string;
  is_source_code: string;
  script_file: string;
  source_code: string;
  content: string;
  file_name: string;
}

