import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { GET_ADVANCED_DISCOVERY_CREDENTIALS, GET_AGENT_CONFIGURATIONS, ORCHESTRATION_ADD_TASK, ORCHESTRATION_EDIT_TASK, ORCHESTRATION_GET_META_DATA, ORCHESTRATION_GET_TASK_BY_ID } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { playbookTypes, TaskParams } from '../orchestration-tasks.service';
import { OrchestrationTaskDataType } from '../orchestration-task.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { inputTemplateType, OrchestrationTaskCrudDataType, parameterDataType, parameterRestApi, parametersType, Token } from './orchestration-tasks-crud.type';
import { catchError, switchMap, take } from 'rxjs/operators';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { AppLevelService } from 'src/app/app-level.service';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';

@Injectable()
export class OrchestrationTasksCrudService {
  // private syncVMAnnouncedSource = new Subject<{ vmCount: number }>();
  // syncVMAnnounced$ = this.syncVMAnnouncedSource.asObservable();

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private appService: AppLevelService,) { }

  testConnection(testUrl: string, urlType: string, collectorAddr: string, baseUrl: string) {
    const payloadJson = {
      "url": testUrl,
      "url_type": urlType,
      "collector": collectorAddr,
      "base_url": baseUrl
    }
    return this.http.post<any>(`orchestration/tasks/connection/`, payloadJson);
  }

  getbodyFormGroup(body: any) {
    return this.builder.group({
      'key': [body.key, [Validators.required]],
      'value': [body.value, [Validators.required]],
    })
  }

  getHeadersFormGroup(header) {
    return this.builder.group({
      header_name: [header.header_name],
      header_value: [header.header_value]
    });
  }

  getResponseDataFormGroup(responseData: any) {
    let group = this.builder.group({
      'response_type': [responseData.response_type, [Validators.required]],
      'response_operator': [responseData.response_operator, [Validators.required]],
      'response_value': [responseData.response_value, [Validators.required, validateValue]]
    });
    if (responseData.response_type == 'json_query') {
      group.addControl('response_key', new FormControl(responseData.response_key, [Validators.required]));
    }
    return group;
  }

  getRequestDataFormGroup(requestData: any) {
    let group = this.builder.group({
      'request_type': [requestData.request_type, [Validators.required]],
      'request_operator': [requestData.request_operator, [Validators.required]],
      'request_value': [requestData.request_value, [Validators.required]]
    });
    if (requestData.request_type == 'json_query') {
      group.addControl('request_key', new FormControl(requestData.request_key, [Validators.required, NoWhitespaceValidator]));
    }
    return group;
  }

  isParameterDataTypeArray(params: parametersType): params is parameterDataType[] {
    return Array.isArray(params);
  }

  isGeneralDictionary(params: parameterRestApi): params is parameterRestApi {
    return typeof params === 'object';
    // && !this.isParameterDataTypeArray(params)
  }

  getCredentials(): Observable<Array<DeviceDiscoveryCredentials>> {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<Array<DeviceDiscoveryCredentials>>(GET_ADVANCED_DISCOVERY_CREDENTIALS(), { params: param });
  }

  getScriptWithPlaybookType(repoId: string, playbookType: string): Observable<any> {
    let param = new HttpParams().set('page_size', 0).set('script_type', playbookType);
    return this.http.get<any>(`/orchestration/scripts/${repoId}/get_repo_playbook/`, { params: param })
  }

  getInputParameters(scriptId: string): Observable<any> {
    return this.http.get<any>(`/orchestration/scripts/${scriptId}/get_inputs/`)
  }

  getCloudAccount(cloudType: string): Observable<any> {
    let param = new HttpParams().set('cloud_type', cloudType);
    return this.http.get<any>(`customer/cloud_fast/`, { params: param })
  }

  getTargets(search: string): Observable<any> {
    let param = new HttpParams().set('search', search)
    return this.http.get<any>(`/customer/advanced_search_fast/`, { params: param })
  }
  getConnections() {
    return this.http.get<any>(`/orchestration/connection/`);
  }

  buildForm(task: OrchestrationTaskCrudDataType): FormGroup {
    if (task) {
      let form = this.builder.group({
        'name': [task.name, [Validators.required, NoWhitespaceValidator]],
        'category': [task.category, [Validators.required]],
        'script_type': [task.script_type, [Validators.required]],
        'target_type': [task.target_type, [Validators.required]],
        'description': [task.description],
        'inputs': this.builder.array(task.inputs?.map(input => this.getParameterForm(input)) || [])
      });
      if (task.script_type == playbookTypes.TerraformScript ||
        task.script_type == playbookTypes.AnsibleBook) {
        form.addControl('source', new FormControl(task.source, [Validators.required]));
        form.addControl('script', new FormControl(task.script ? task.script : '', [Validators.required]));
        // form.addControl('define_parameter', new FormControl(task.define_parameter, [Validators.required]));
        form.addControl('output_type', new FormControl({ value: task.output_type, disabled: true }, [Validators.required]))
        if (task.script_type === playbookTypes.AnsibleBook) {
          form.addControl('target_type', new FormControl(task.target_type ? task.target_type : '', [Validators.required]));
        } else if (task.script_type == playbookTypes.TerraformScript) {
          form.addControl('target_type', new FormControl('Cloud', [Validators.required]));
          form.get('target_type').disable();
        }
        if (task.target_type === 'Host') {
          // const ipAddresses = task.config.targets.map((t: any) => t.ip_address).join(', ');
          form.addControl('targets', new FormControl(task?.config?.targets));
          form.addControl('cred', new FormControl(task.config.cred ?? 'local'));
          if (task.config.cred === 'local') {
            form.addControl('credentials', new FormControl(task.config.credentials));
          } else {
            form.addControl('username', new FormControl(task.config.username));
            form.addControl('password', new FormControl(task.config.password));
          }
        }
        if (task.target_type == 'Cloud') {
          // form.addControl('cloud', new FormControl(task.cloud ? task.cloud : ''));
          form.addControl('cloud_type', new FormControl(task.config.cloud_type, [Validators.required]));
          form.addControl('cloud_account', new FormControl(task.config.cloud_account));
        }
        // if (task.define_parameter) {
        // if (this.isParameterDataTypeArray(task.inputs)) {
        // form.addControl('inputs', this.builder.array(task?.inputs.map(input => this.getParameterForm(input))))
        // }
        // }
      } else if (task.script_type == playbookTypes.BashScript ||
        task.script_type == playbookTypes.PythonScript ||
        task.script_type == playbookTypes.PowershellScript) {
        form.addControl('source', new FormControl(task.source ? task.source : '', [Validators.required]));
        form.addControl('script', new FormControl(task.script ? task.script : '', [Validators.required]));
        // form.addControl('define_parameter', new FormControl(task.define_parameter, [Validators.required]));
        form.addControl('output_type', new FormControl(task.output_type ? task.output_type : '', [Validators.required]))
        if (task.script_type == playbookTypes.PythonScript) {
          form.addControl('requirements', new FormControl(task.config.requirements ? task.config.requirements : ''))
        }
        if (task.target_type === 'Host') {
          // const ipAddresses = task.config.targets.map((t: any) => t.ip_address).join(', ');
          form.addControl('targets', new FormControl(task?.config?.targets));
          form.addControl('cred', new FormControl(task.config.cred ?? 'local'));
          if (task.config.cred === 'local') {
            form.addControl('credentials', new FormControl(task.config.credentials));
          } else {
            form.addControl('username', new FormControl(task.config.username));
            form.addControl('password', new FormControl(task.config.password));
          }
        }
        if (task.script_type === playbookTypes.PythonScript) {
          form.addControl('target_type', new FormControl(task.target_type ? task.target_type : '', [Validators.required]));
        } else if (task.script_type == playbookTypes.BashScript || task.script_type == playbookTypes.PowershellScript) {
          form.addControl('target_type', new FormControl('Host', [Validators.required]));
          form.get('target_type').disable();
        }
        if (task.target_type == 'Cloud') {
          form.addControl('cloud', new FormControl(task.cloud));
        }
        // if (task.define_parameter) {
        // if (this.isParameterDataTypeArray(task.inputs)) {
        // form.addControl('inputs', this.builder.array(task?.inputs.map(input => this.getParameterForm(input))))
        // }
        // }
      } else {
        if (task.config?.body_type == 'json' || task.config?.body_type == 'form') {
          if (this.isGeneralDictionary(task.config)) {
            form.addControl('inputs', this.builder.array(task?.inputs.map(input => this.getParameterForm(input))))
          }
        }
        form.addControl('output_type', new FormControl(task.output_type, [Validators.required]));
        if (this.isGeneralDictionary(task.config)) {
          form.addControl('url_type', new FormControl(task.config.url_type, [Validators.required]));
          if (task.config.url_type == 'private') {
            form.addControl('collector', new FormControl(task.config.collector, [Validators.required]));
          }
          form.addControl('method', new FormControl(task.config.method, [Validators.required]));
          form.addControl('url', new FormControl(task.config.url, [Validators.required]));
          if (task.config?.auth && 'basic' in task.config?.auth) {
            form.addControl('auth', new FormControl('basic', [Validators.required]));
            form.addControl('username', new FormControl(task.config.auth.basic.username, [Validators.required]));
            form.addControl('password', new FormControl(task.config.auth.basic.password, [Validators.required]));
          } else if (task.config?.auth && 'token' in task.config?.auth) {
            form.addControl('auth', new FormControl('token', [Validators.required]));
            form.addControl('prefix', new FormControl(task.config.auth.token.prefix, [Validators.required]));
            form.addControl('token', new FormControl(task.config.auth.token.token, [Validators.required]));
          } else {
            if (!task.config?.auth) {
              form.addControl('auth', new FormControl('null', [Validators.required]));
            }
          }
          form.addControl('body_type', new FormControl(task.config?.body_type, [Validators.required]));
          form.addControl('responseData', this.builder.array(task.config?.response_validation.map(responseData => this.getResponseDataFormGroup(responseData))))
          form.addControl('request_type', new FormControl(task.config?.request_type, [Validators.required]));
          if (task.config.request_type == 'async') {
            // form.addControl('callback_url_key', new FormControl(task.config.callback_url_key, [Validators.required]));    
            form.addControl('callback_request_validation', this.builder.array(task.config?.callback_request_validation.map(requestFormData => this.getRequestDataFormGroup(requestFormData))));
          }
          if (task.target_type == 'Cloud') {
            form.addControl('cloud', new FormControl(task.cloud));
          }
          if (task?.config?.headers) {
            form.addControl('headers', this.builder.array(task?.config?.headers.map(header => this.getHeadersFormGroup(header))))
          }
          form.addControl('connection', new FormControl(task.config?.connection));
          form.addControl('verify_ssl', new FormControl(task.config?.verify_ssl));
        }
      }
      return form;
    } else {
      let form = this.builder.group({
        'name': ['', [Validators.required, NoWhitespaceValidator]],
        'category': ['', [Validators.required, NoWhitespaceValidator]],
        'script_type': ['', [Validators.required, NoWhitespaceValidator]],
        'description': [''],
        'source': ['', [Validators.required, NoWhitespaceValidator]],
        'script': ['', [Validators.required, NoWhitespaceValidator]],
        'target_type': ['', [Validators.required, NoWhitespaceValidator]],
        'output_type': ['', [Validators.required, NoWhitespaceValidator]],
        // 'outputs': this.builder.array([
        //   this.builder.group({
        //     'param_name': ['', [Validators.required, NoWhitespaceValidator]]
        //   })
        // ])
      });
      return form;
    }
  }

  getParameterForm(param?: parameterDataType) {
    if (param) {
      const isInputTemplate = param.param_type === 'Input Template';
      let group = this.builder.group({
        "param_name": [param.param_name, [Validators.required, uniqueParamNameValidator]],
        "param_type": [param.param_type, [Validators.required]],
        // "is_visible": [param.is_visible]
      });
      // if (param.param_type === 'Input Template') {
      //   group.get('is_visible')?.disable();
      // } else {
      //   group.get('is_visible')?.enable();
      // }
      if (param.param_type == 'Input Template') {
        group.addControl('template', new FormControl(param.template, [Validators.required]));
        group.addControl('attribute', new FormControl(param.attribute));
      } else {
        // let value = param.default_value;
        if (param.param_type === 'Dictionary' || param.param_type === 'List') {
          const defaultValueString = typeof param.default_value === 'string' ? param.default_value : JSON.stringify(param.default_value);
          group.addControl('default_value', new FormControl(defaultValueString, [validateDefaultValue]));
        } else if (param.param_type === 'Boolean') {
          group.addControl('default_value', new FormControl(param.default_value, [validateDefaultValue]));
        }
        group.addControl('default_value', new FormControl(param.default_value, [validateDefaultValue]));
      }
      return group;
    } else {
      let group = this.builder.group({
        "param_name": [param.param_name, [Validators.required, uniqueParamNameValidator]],
        "param_type": [param.param_type, [Validators.required]],
        // "is_visible": [param.is_visible]
      });
      // if (param.param_type === 'Input Template') {
      //   group.get('is_visible')?.disable();
      // } else {
      //   group.get('is_visible')?.enable();
      // }
      return group;
    }
  }

  resetFormErrors() {
    return {
      'name': '',
      'category': '',
      'script_type': '',
      'description': '',
      'source': '',
      'cloud': '',
      'script': '',
      'target_type': '',
      'auth': '',
      'username': '',
      'password': '',
      'prefix': '',
      'token': '',
      'body': '',
      'json': '',
      'responseData': [this.getResponseDataErrors()],
      'callback_url_key': '',
      'collector': '',
      'url': '',
      'method': '',
      'output_type': '',
      'targets': '',
      'cred': '',
      'credentials': '',
      // 'username': '',
      // 'password': '',
      'cloud_type': '',
      'cloud_account': '',
      'requirements': ''
    }
  }

  getParameterErrors() {
    return {
      'param_name': '',
      'param_type': '',
      'default_value': '',
      'template': '',
      'attribute': '',
    }
  }

  getBodyDataErrors() {
    return {
      'key': '',
      'value': '',
    }
  }

  getResponseDataErrors() {
    return {
      'response_type': '',
      'response_operator': '',
      'response_value': '',
      'response_key': '',
    }
  }

  getRequestDataErrors() {
    return {
      'request_type': '',
      'request_operator': '',
      'request_value': '',
      'request_key': '',
    }
  }

  getHeadersErrors() {
    return {
      header_name: '',
      header_value: ''
    }
  }

  formValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'category': {
      'required': 'Category is required'
    },
    'script_type': {
      'required': 'Type is required'
    },
    'source': {
      'required': 'Source is required'
    },
    'script': {
      'required': 'Script is required'
    },
    'target_type': {
      'required': 'Target Type is required'
    },
    'cloud': {
      'required': 'Cloud is required'
    },
    'auth': {
      'required': 'Authorization method is required'
    },
    'json': {
      'jsonInvalid': 'Json Format is Invalid'
    },
    'url': {
      'required': 'Url is required'
    },
    'inputs': {
      'param_name': {
        'required': 'Name is required',
        'duplicateParamName': 'Param name should be unique'
      },
      'param_type': {
        'required': 'Type is required'
      },
      'default_value': {
        'invalidNumberValue': 'Value should be a number',
        'invalidBooleanValue': 'Value should be true or false',
        'invalidDictValue': 'Value must be a valid dictionary like {"key": "value"}',
        'invalidListValue': 'Value must be a valid list like ["item1", "item2"]'
      },
      'template': {
        'required': 'Template is required'
      },
      'attribute': {
        'required': 'Attribute is required'
      },
    },
    'outputs': {
      'param_name': {
        'required': 'Name is required',
        // 'duplicateParamName': 'Param name should be unique'
      },
    },
    'bodyData': {
      'key': {
        'required': 'Field Name is required'
      },
      'value': {
        'required': 'Value is required'
      }
    },
    'responseData': {
      'response_type': {
        'required': 'Field Name is required'
      },
      'response_operator': {
        'required': 'operator is required'
      },
      'response_value': {
        'required': 'Value is required',
        'invalidNumberValue': 'Value should be a number',
      },
      'response_key': {
        'required': 'key is required'
      }
    },
    'callback_request_validation': {
      'request_type': {
        'required': 'Field Name is required'
      },
      'request_operator': {
        'required': 'operator is required'
      },
      'request_value': {
        'required': 'Value is required'
      },
      'request_key': {
        'required': 'key is required'
      }
    },
    'callback_url_key': {
      'required': 'Callback url Key is Required'
    },
    'output_type': {
      'required': 'Output Type is required'
    },
    'collector': {
      'required': 'Collector is required'
    },
    'method': {
      'required': 'Method is required'
    },
    // 'targets': {
    //   'invalidIps': 'IPs are invalid',
    // },
    // 'credentials': {
    //   'required': 'Credentials Selection is required'
    // },
    'cloud_type': {
      'required': 'Cloud type is required'
    },
    // 'cloud_account': {
    //   'required': 'Cloud account is required'
    // },
    'headers': {
      'header_name': {
        'required': 'Name is required'
      },
      'header_value': {
        'required': 'Value is required'
      }
    }
  }

  getTaskDataById(uuid: string) {
    return this.http.get<OrchestrationTaskDataType>(ORCHESTRATION_GET_TASK_BY_ID(uuid));
  }

  getMetadata() {
    return this.http.get<MetaData>(ORCHESTRATION_GET_META_DATA());
  }

  getCollectors() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params: params });
  }

  getInputTemplate() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<inputTemplateType[]>(`/orchestration/input_template/`, { params: params });
  }

  getDropdownData(): Observable<{ metadata: any, templates: any[], collectors: DeviceDiscoveryAgentConfigurationType[] }> {
    return forkJoin({
      metadata: this.getMetadata().pipe(catchError(error => of(undefined))),
      templates: this.getInputTemplate().pipe(catchError(error => of(undefined))),
      collectors: this.getCollectors().pipe(catchError(error => of(undefined)))
    });
  }

  // createTask(obj: any): Observable<CeleryTask> {
  //   return this.http.post<CeleryTask>(ORCHESTRATION_ADD_TASK(), obj);
  // }

  // updateTask(uuid: string, data: any): Observable<CeleryTask> {
  //   return this.http.put<CeleryTask>(ORCHESTRATION_EDIT_TASK(uuid), data);
  // }
  createTask(obj: any): Observable<any> {
    return this.http.post<any>(ORCHESTRATION_ADD_TASK(), obj);
  }

  updateTask(uuid: string, data: any): Observable<CeleryTask> {
    return this.http.put<any>(ORCHESTRATION_EDIT_TASK(uuid), data);
  }

  ipListValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      if (typeof value !== 'string') {
        return { invalidType: true };
      }
      const ips = value.split(',').map((ip: string) => ip.trim());
      const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      const invalidIps = ips.filter(ip => !ipRegex.test(ip));
      return invalidIps.length > 0 ? { invalidIps: true } : null;
    };
  }
}

export class MetaData {
  constructor() { }
  category: string[];
  source: Repos[];
  cloud: string[];
  public_cloud: cloudTypes[];
  private_cloud: cloudTypes[];
  types: string[];
  target_type: string[];
  callback_url: string;
}

export class Repos {
  constructor() { }
  playbooks: Playbooks[];
  type: string;
  uuid: string;
  name: string;
}

export class Playbooks {
  constructor() { }
  input_variables: any[];
  output_parameters: any[];
  type: string;
  uuid: string;
  name: string;
}

export class cloudTypes {
  image: string;
  type: string;
}

export const scriptParamDataTypes: string[] = [
  "String", "Number", "Boolean", "List", "Dictionary", "Secret", "Input Template"
]

export const scriptOutputTypes: string[] = [
  "String", "JSON", "Key-Value"
]

const OPERATOR_MAPPING = {
  "==": "==",
  "!=": "!=",
  ">=": ">=",
  "<=": "<=",
  ">": ">",
  "<": "<",
  "contains": "Contains",
  "not_contains": "Not Contains",
};

export const operators = Object.keys(OPERATOR_MAPPING).map(key => ({
  name: OPERATOR_MAPPING[key],
  nameValue: key
}));


export const methods: string[] = [
  "GET", "POST", "PUT", "PATCH", "DELETE"
]

export function validateDefaultValue(control: AbstractControl): ValidationErrors | null {
  const paramTypeControl = control.parent?.get('param_type');
  if (!paramTypeControl) {
    return null;
  }

  const paramType = paramTypeControl.value;
  const defaultValue = control.value;

  if (paramType === 'Number') {
    const numberValue = Number(defaultValue);
    if (isNaN(numberValue)) {
      return { invalidNumberValue: true };
    }
  }
  // else if (paramType === 'Boolean') {
  //   if (typeof defaultValue !== 'string' ||
  //     (defaultValue.toLowerCase() !== 'true' && defaultValue.toLowerCase() !== 'false')) {
  //     return { invalidBooleanValue: true };
  //   }
  // } 
  else if (paramType === 'List') {
    try {
      const parsed = JSON.parse(defaultValue);
      if (!Array.isArray(parsed)) {
        return { invalidListValue: true };
      }
    } catch (e) {
      return { invalidListValue: true };
    }
  } else if (paramType === 'Dictionary') {
    try {
      const parsed = JSON.parse(defaultValue);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return { invalidDictValue: true };
      }
    } catch (e) {
      return { invalidDictValue: true };
    }
  }

  return null;
}

export function validateValue(control: AbstractControl): ValidationErrors | null {
  const paramTypeControl = control.parent?.get('response_type');
  if (!paramTypeControl) {
    return null;
  }
  const paramType = paramTypeControl.value;
  const defaultValue = control.value;

  if (paramType === 'response_code') {
    const numberValue = Number(defaultValue);
    if (isNaN(numberValue)) {
      return { invalidNumberValue: true };
    }
  } else {
    return null;
  }
}

export function jsonValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  try {
    JSON.parse(control.value);
    return null;
  } catch (e) {
    return { jsonInvalid: true };
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
    group.get('param_name')?.value?.trim() === currentValue
  ).length;

  return duplicateCount > 1 ? { duplicateParamName: true } : null;
}