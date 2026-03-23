import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Observable } from 'rxjs';
import { ADD_SCRIPT, DELETE_SCRIPT, GET_SCRIPT, UPDATE_SCRIPT, ZABBIX_TRIGGER_SCRIPTS } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ZabbixTriggerScriptType } from './zabbix-trigger-scripts.type';


@Injectable()
export class ZabbixTriggerScriptsService {
  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  getScripts(): Observable<ZabbixTriggerScriptType[]> {
    return this.http.get<ZabbixTriggerScriptType[]>(GET_SCRIPT(), { params: new HttpParams().set('page_size', '0') });
  }

  buildFilterForm() {
    return this.builder.group({
      search: [''],
      script_type: [''],
      category: [''],
      dateRange: [[moment().subtract(1, 'month'), moment()]],
      startDate: [''],
      endDate: [''],
    });
  }

  filterScripts(formdata: any): Observable<ZabbixTriggerScriptType[]> {
    let params = new HttpParams();
    Object.keys(formdata).forEach(key => {
      params = params.append(key, formdata[key]);
    });
    params = params.set('page_size', '0');
    return this.http.get<ZabbixTriggerScriptType[]>(ZABBIX_TRIGGER_SCRIPTS(), { params: params });
  }

  convertToViewData(scripts?: ZabbixTriggerScriptType[]): ZabbixTriggerScriptViewdata[] {
    let viewData: ZabbixTriggerScriptViewdata[] = [];
    scripts.forEach(s => {
      let a: ZabbixTriggerScriptViewdata = new ZabbixTriggerScriptViewdata();
      a.uuid = s.uuid;
      a.id = s.script_id;
      a.name = s.name;
      a.category = s.category;
      a.deviceCategory = s.device_category;
      a.description = s.description;
      a.scriptType = s.script_type;
      a.createdAt = s.created_at ? this.utilSvc.toUnityOneDateFormat(s.created_at) : 'N/A';
      a.content = s.script_content;
      a.uploadScript = s.upload_script;
      a.scriptFileName = s.upload_script ? s.upload_script.split('/').pop() : null;
      a.requiredCredentials = s.required_credentials;
      a.os = s.os
      viewData.push(a);
    });
    return viewData;
  }

  buildForm(view: ZabbixTriggerScriptViewdata): FormGroup {
    if (view) {
      let form = this.builder.group({
        'name': [view.name, [Validators.required]],
        'category': [view.category, [Validators.required]],
        'device_category': [view.deviceCategory],
        'description': [view.description, [Validators.required]],
        'upload_script': [view.uploadScript, [Validators.required]],
        'script_type': [view.scriptType, [Validators.required]],
        'required_credentials': [view.requiredCredentials],
      });
      if (view.deviceCategory == 'Virtual Machines' || view.deviceCategory == 'Hypervisors' || view.deviceCategory == 'Bare Metal Servers') {
        form.addControl('os', new FormControl(view.os, [Validators.required]));
      }
      return form;
    }
    else {
      return this.builder.group({
        'name': ['', [Validators.required]],
        'category': ['', [Validators.required]],
        'device_category': [''],
        'description': ['', [Validators.required]],
        'upload_script': ['', [Validators.required]],
        'script_type': ['', [Validators.required]],
        'required_credentials': [false],
      });
    }
  }

  resetFormErrors() {
    return {
      'name': '',
      'category': '',
      'device_category': '',
      'description': '',
      'upload_script': '',
      'script_type': '',
      'required_credentials': '',
      'os': ''
    }
  }

  formValidationMessages = {
    'name': {
      'required': 'Name Selection is Mandatory'
    },
    'category': {
      'required': 'Category Selection is Mandatory'
    },
    'description': {
      'required': 'Description Selection is Mandatory'
    },
    'upload_script': {
      'required': 'File Selection is Mandatory'
    },
    'script_type': {
      'required': 'Type Selection is Mandatory'
    },
    'os': {
      'required': 'Os Selection is Mandatory'
    }
  }

  private createFormData(obj: ZabbixTriggerScriptFormdata, fileToUpload: File): FormData {
    const formData = new FormData();
    formData.append('name', obj.name);
    formData.append('category', obj.category);
    formData.append('description', obj.description);
    if ('os' in obj) {
      formData.append('os', obj.os);
    }
    formData.append('upload_script', fileToUpload);
    formData.append('script_type', obj.script_type);
    formData.append('device_category', obj.device_category);
    formData.append('credential_fk', obj.required_credentials ? 'true' : 'false');
    return formData;
  }

  addScript(obj: ZabbixTriggerScriptFormdata, fileToUpload: File): Observable<ZabbixTriggerScriptType> {
    const formData = this.createFormData(obj, fileToUpload);
    return this.http.post<ZabbixTriggerScriptType>(ADD_SCRIPT(), formData);
  }

  updateScript(uuid: string, obj: ZabbixTriggerScriptFormdata, fileToUpload?: File): Observable<ZabbixTriggerScriptType> {
    if (fileToUpload) {
      const formData = this.createFormData(obj, fileToUpload);
      return this.http.patch<ZabbixTriggerScriptType>(UPDATE_SCRIPT(uuid), formData);
    } else {
      return this.http.patch<ZabbixTriggerScriptType>(UPDATE_SCRIPT(uuid), obj);
    }
  }

  deletescript(uuid: string) {
    return this.http.delete(DELETE_SCRIPT(uuid));
  }

  fetchScriptContent(view: ZabbixTriggerScriptViewdata): Observable<string> {
    return this.http.get(view.uploadScript, { responseType: 'text' });
  }
}

export class ZabbixTriggerScriptViewdata {
  constructor() { }
  uuid: string;
  id: string;
  name: string;
  category: string;
  deviceCategory: string;
  description: string;
  scriptType: string;
  uploadScript: string;
  scriptFileName: string;
  createdAt: string;
  content: string;
  requiredCredentials: boolean;
  os: string;
}

export class ZabbixTriggerScriptFormdata {
  constructor() { }
  name: string;
  category: string;
  device_category: string;
  description: string;
  script_type: string;
  upload_script: string;
  content: string;
  required_credentials: boolean;
  os: string;
}

