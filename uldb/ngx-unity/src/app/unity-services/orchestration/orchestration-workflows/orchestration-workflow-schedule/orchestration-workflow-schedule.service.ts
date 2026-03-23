import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Account, Tag, WorkflowDetails, WorkflowMetaData, WorkflowTask } from './orchestration-workflow-schedule.type';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { DEVICES_FAST_BY_DEVICE_TYPE, GET_ADVANCED_DISCOVERY_CREDENTIALS, ORCHESTRATION_EXECUTE_TASK, ORCHESTRATION_TASK_PARAM_BY_ID } from 'src/app/shared/api-endpoint.const';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { GlobalAdvancedSearchResult } from 'src/app/global-search/global-search.type';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class OrchestrationWorkflowScheduleService {

  // constructor(private builder: FormBuilder,
  //   private http: HttpClient) { }

  // getWorkflowDetails(workflowId: string): Observable<WorkflowDetails> {
  //   return this.http.get<WorkflowDetails>(`/orchestration/workflows/${workflowId}/get_variable/`);
  // }

  // getCloudList(cloudType?: string): Observable<Account[]> {
  //   let param = new HttpParams().set('page_size', 0);
  //   if (cloudType) {
  //     param = param.append('cloud_type', cloudType);
  //   }
  //   return this.http.get<Account[]>(`customer/cloud_fast/`, { params: param });
  // }

  // getCredentials(): Observable<Array<DeviceDiscoveryCredentials>> {
  //   let param = new HttpParams().set('page_size', 0);
  //   return this.http.get<Array<DeviceDiscoveryCredentials>>(GET_ADVANCED_DISCOVERY_CREDENTIALS(), { params: param });
  // }

  // getScheduleData(taskId: string) {
  //   return this.http.get<any>(`/orchestration/workflows/${taskId}/schedule/`)
  // }

  // getTemplateOption(templateId: string): Observable<TemplateOption[]> {
  //   return this.http.get<TemplateOption[]>(`orchestration/input_template/${templateId}/options/`);
  // }

  // getTemplateOptionWithDep(templateId: string, filterId: string, accountId: string) {
  //   let param = new HttpParams().set('filter', filterId).set('account_id', accountId);
  //   return this.http.get(`orchestration/input_template/${templateId}/options/`, { params: param });
  // }

  // buildCloudForm(param: any): FormGroup {
  //   let form = this.builder.group({
  //     'cloud_cred': ['local', Validators.required],
  //     'cloud_credentials': ['', [Validators.required]],
  //     'cred': ['local', Validators.required],
  //     'credentials': ['', [Validators.required]],
  //     'templates': this.builder.array([])
  //   });
  //   if (param.templates) {
  //     const templatesArray = form.get('templates') as FormArray;
  //     param.templates.forEach((template) => {
  //       const control = this.builder.group({
  //         label: [template.label],
  //         value: [{ value: '', disabled: !!template.dependency_name }, Validators.required]
  //       });
  //       templatesArray.push(control);
  //     });
  //   }
  //   return form;
  // }

  // resetCloudFormErrors() {
  //   return {
  //     'account_id': '',
  //     'cloud_cred': '',
  //     'cloud_credentials': '',
  //     'username': '',
  //     'password': '',
  //     'cred': '',
  //     'credentials': '',
  //     'cloud_username': '',
  //     'cloud_password': '',
  //   };
  // }

  // cloudFormValidationMessages = {
  //   'account_id': {
  //     'required': 'Account Name Selection is Required'
  //   },
  //   'cloud_credentials': {
  //     'required': 'Credentials Selection is Required'
  //   },
  //   'credentials': {
  //     'required': 'Credentials Selection is Required'
  //   },
  //   'username': {
  //     'required': 'Username is Required'
  //   },
  //   'password': {
  //     'required': 'password is Required'
  //   },
  //   'cloud_username': {
  //     'required': 'Username is Required'
  //   },
  //   'cloud_password': {
  //     'required': 'password is Required'
  //   }
  // }

  // getIpAddress(ipAddress: string): Observable<any> {
  //   let param = new HttpParams().set('page_size', 0).set('ip_address', ipAddress);
  //   return this.http.get<any>(`customer/advanced_search/`, { params: param });
  // }

  // getDataCenters(): Observable<DatacenterFast[]> {
  //   return this.http.get<DatacenterFast[]>(DEVICES_FAST_BY_DEVICE_TYPE(DeviceMapping.DC_VIZ));
  // }

  // getClouds(): Observable<WorkflowMetaData> {
  //   return this.http.get<WorkflowMetaData>(`orchestration/workflows/get_metadata/`);
  // }

  // getHost(tag?: string, deviceType?: string, dc?: string, subType?: string, publicCloud?: string, privateCloud?: string): Observable<GlobalAdvancedSearchResult[]> {
  //   let params = new HttpParams().set('page_size', 0);
  //   if (tag) {
  //     params = params.append('tag', tag);
  //   }
  //   if (deviceType) {
  //     params = params.append('device_type', deviceType);
  //   }
  //   if (dc) {
  //     params = params.append('dc', dc);
  //   }
  //   if (subType) {
  //     params = params.append('sub_type', subType);
  //   }
  //   if (publicCloud) {
  //     const cloudTypeLowerCase = publicCloud.toLowerCase();
  //     const matchedDeviceType = deviceTypes.find(deviceType => cloudTypeLowerCase.includes(deviceType.name));
  //     if (matchedDeviceType) {
  //       deviceType = matchedDeviceType.name;
  //       params = params.append('device_type', deviceType);
  //     }
  //     params = params.append('public_cloud', publicCloud);
  //   }
  //   if (privateCloud) {
  //     params = params.append('private_cloud', privateCloud);
  //   }
  //   return this.http.get<GlobalAdvancedSearchResult[]>(`customer/advanced_search/`, { params: params });
  // }

  // getTags(): Observable<Tag[]> {
  //   let param = new HttpParams().set('page_size', 0);
  //   return this.http.get<Tag[]>(`customer/tags/`, { params: param });
  // }

  // buildHostForm(param: any): FormGroup {
  //   let form = this.builder.group({
  //     'ip': ['', [ipListValidator()]],
  //     'host_type': [''],
  //     'host': [[]],
  //     'cred': ['local', Validators.required],
  //     'credentials': ['', [Validators.required]],
  //     'templates': this.builder.array([])
  //   }, {
  //     validators: AtLeastOneInputHasValue(['ip', 'host'])
  //   });
  //   if (param.templates) {
  //     const templatesArray = form.get('templates') as FormArray;
  //     param.templates.forEach((template) => {
  //       const control = this.builder.group({
  //         label: [template.label],
  //         value: [{ value: '', disabled: !!template.dependency_name }, Validators.required]
  //       });
  //       templatesArray.push(control);
  //     });
  //   }
  //   return form;
  // }

  // resetHostFormErrors() {
  //   return {
  //     'ip': '',
  //     'host_type': '',
  //     'host': '',
  //     'datacenter': '',
  //     'device_category': '',
  //     'cloud': '',
  //     'account_name': '',
  //     'tag': '',
  //     'device_type': '',
  //     'cred': '',
  //     'credentials': '',
  //     'username': '',
  //     'password': '',
  //   }
  // }

  // hostFormValidationMessages = {
  //   'ip': {
  //     'invalidIps': 'IPs are invalid'
  //   },
  //   'host_type': {
  //     'required': 'Host Type Selection is required'
  //   },
  //   'datacenter': {
  //     'required': 'Datacenter Selection is required'
  //   },
  //   'device_category': {
  //     'required': 'Device Category Selection is required'
  //   },
  //   'cloud': {
  //     'required': 'Cloud Selection is required'
  //   },
  //   'account_name': {
  //     'required': 'Account Name Selection is required'
  //   },
  //   'tag': {
  //     'required': 'Tag Selection is required'
  //   },
  //   'device_type': {
  //     'required': 'Device Type Selection is required'
  //   },
  //   'credentials': {
  //     'required': 'Credentials Selection is required'
  //   },
  //   'username': {
  //     'required': 'Username is required'
  //   },
  //   'password': {
  //     'required': 'password is required'
  //   },
  // }

  // converToViewData(data: WorkflowDetails): WorkflowDetailsViewData[] {
  //   let viewData: WorkflowDetailsViewData[] = [];
  //   if (data.tasks.length) {
  //     data.tasks.forEach((task: WorkflowTask) => {
  //       let view: WorkflowDetailsViewData = new WorkflowDetailsViewData();
  //       view.taskName = task.name;
  //       view.taskForm = this.buildTaskForm(task);
  //       view.taskFormErrors = this.resetTaskFormErrors();
  //       view.taskValidationMessages = this.taskValidationMessages;
  //       view.type = task.type;
  //       view.inputs = task.inputs;
  //       if (task.type == 'Ansible Playbook' || task.type == 'Terraform Script') {
  //         if (task.inputs && task.inputs.length) {
  //           task.inputs.forEach(input => {
  //             view.taskFormErrors.inputs[input.param_name] = '';
  //             view.taskValidationMessages.inputs[input.param_name] = {};
  //             view.taskValidationMessages.inputs[input.param_name]['required'] = `${input.param_name} is required`;
  //           });
  //         }
  //       } else {
  //         if (task.inputs && Object.keys(task.inputs).length) {
  //           Object.keys(task.inputs).forEach(key => {
  //             view.taskFormErrors.inputs[key] = '';
  //             view.taskValidationMessages.inputs[key] = {};
  //             view.taskValidationMessages.inputs[key]['required'] = `${key} is required`;
  //           });
  //         }
  //       }
  //       viewData.push(view);
  //     });
  //   }
  //   return viewData;
  // }

  // buildTaskForm(data: WorkflowTask): FormGroup {
  //   let form = this.builder.group({
  //     'name_id': [data?.name_id],
  //     'uuid': [data?.uuid],
  //     'name': [data?.name],
  //     'type': [data?.type]
  //   });
  //   if (data.inputs && data.inputs.length) {
  //     form.addControl('inputs', this.builder.array([])); 

  //     data.inputs.forEach(input => {
  //       let inputGroup;

  //       if (input.param_type === 'Input Template') {
  //         inputGroup = new FormGroup({
  //           param_name: new FormControl(input.param_name), 
  //           template_name: new FormControl({ value: input.template_name, disabled: false }),
  //           attribute: new FormControl({ value: input.attribute, disabled: false }),
  //           param_type: new FormControl({ value: input.param_type, disabled: false }),
  //           default_value: new FormControl({ value: input.default_value, disabled: false }),
  //           template: new FormControl({ value: input.template, disabled: false })
  //         });
  //       } else {
  //         inputGroup = new FormGroup({
  //           param_name: new FormControl(input.param_name), 
  //           default_value: new FormControl(input.default_value, [Validators.required])
  //         });
  //       }

  //       (form.get('inputs') as FormArray).push(inputGroup);
  //     });

  //   }
  //   return form;
  // }

  // resetTaskFormErrors() {
  //   return {
  //     'inputs': {}
  //   }
  // }

  // taskValidationMessages = {
  //   'inputs': {}
  // }

  // scheduleWorkflow(data: any, workflowId: string) {
  //   return this.http.post(`/orchestration/workflows/${workflowId}/schedule/`, data);
  // }
  // }

  // export class WorkflowDetailsViewData {
  //   constructor() { }
  //   taskName: string;
  //   taskForm: FormGroup;
  //   taskFormErrors: any;
  //   taskValidationMessages: any;
  //   inputs: any;
  //   type: string;
  // }

  // export interface Hosts {
  //   name: string;
  //   ip_address: string;
  // }

  // export function ipListValidator(): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     const value = control.value;
  //     if (!value) {
  //       return null;
  //     }
  //     if (typeof value !== 'string') {
  //       return { invalidType: true };
  //     }
  //     const ips = value.split(',').map((ip: string) => ip.trim());
  //     const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  //     const invalidIps = ips.filter(ip => !ipRegex.test(ip));
  //     return invalidIps.length > 0 ? { invalidIps: true } : null;
  //   };
  // }

  // export const AtLeastOneInputHasValue = (fields: Array<string>) => {
  //   return (group: FormGroup) => {
  //     const hasValue = fields.some(fieldName => {
  //       const control = group.get(fieldName);
  //       return control && control.value && (Array.isArray(control.value) ? control.value.length > 0 : true);
  //     });
  //     return hasValue ? null : { atLeastOneRequired: true };
  //   };
  // };

  // export const deviceTypes = [
  //   {
  //     name: "switch",
  //     displayName: "Switch",
  //     mapping: DeviceMapping.SWITCHES
  //   },
  //   {
  //     name: "firewall",
  //     displayName: "Firewall",
  //     mapping: DeviceMapping.FIREWALL
  //   },
  //   {
  //     name: "load_balancer",
  //     displayName: "Load Balancer",
  //     mapping: DeviceMapping.LOAD_BALANCER
  //   },
  //   {
  //     name: "hypervisor",
  //     displayName: "Hypervisor",
  //     mapping: DeviceMapping.HYPERVISOR
  //   },
  //   {
  //     name: "baremetal",
  //     displayName: "Bare Metal",
  //     mapping: DeviceMapping.BARE_METAL_SERVER
  //   },
  //   {
  //     name: "storage",
  //     displayName: "Storage",
  //     mapping: DeviceMapping.STORAGE_DEVICES
  //   },
  //   {
  //     name: "mac_device",
  //     displayName: "Mac Device",
  //     mapping: DeviceMapping.MAC_MINI
  //   },
  //   {
  //     name: "vmware",
  //     displayName: "Vmware Virtual Machine",
  //     mapping: DeviceMapping.VMWARE_VIRTUAL_MACHINE
  //   },
  //   {
  //     name: "vcloud",
  //     displayName: "Vcloud Virtual Machine",
  //     mapping: DeviceMapping.VCLOUD
  //   },
  //   {
  //     name: "open_stack",
  //     displayName: "OpenStack Virtual Machine",
  //     mapping: DeviceMapping.OPENSTACK_VIRTUAL_MACHINE
  //   },
  //   {
  //     name: "esxi",
  //     displayName: "Esxi Virtual Machine",
  //     mapping: DeviceMapping.ESXI
  //   },
  //   {
  //     name: "hyperv",
  //     displayName: "Hyperv Virtual Machine",
  //     mapping: DeviceMapping.HYPER_V
  //   },
  //   {
  //     name: "awsvirtualmachine",
  //     displayName: "AWS Virtual Machine",
  //     mapping: DeviceMapping.AWS_VIRTUAL_MACHINE,
  //     cloudName: "aws"
  //   },
  //   {
  //     name: "azurevm",
  //     displayName: "Azure Virtual Machine",
  //     mapping: DeviceMapping.AZURE_VIRTUAL_MACHINE
  //   },
  //   {
  //     name: "gcpvirtualmachines",
  //     displayName: "GCP Virtual Machine",
  //     mapping: DeviceMapping.GCP_VIRTUAL_MACHINE
  //   },
  //   {
  //     name: "ocivirtualmachines",
  //     displayName: "Oracle Virtual Machine",
  //     mapping: DeviceMapping.ORACLE_VIRTUAL_MACHINE
  //   },
  // ];

  constructor(private http: HttpClient,
    private builder: FormBuilder,) { }

  getCloudAccountOption(accountId: string): Observable<TemplateOption[]> {
    return this.http.get<TemplateOption[]>(`orchestration/input_template/${accountId}/options/`);
  }

  buildCloudForm(param: TaskParamsType, taskId: string) {
    let form = this.builder.group({
      // 'account_id': ['', [Validators.required]],
      'cred': [param.cred, Validators.required],
      // 'credentials': ['', [Validators.required]],
      'cloud_account': ['', param.target_type === 'Cloud' ? Validators.required : []],
      'inputs': this.builder.array([]),
      'cloud_type': [param.cloud_type ? param.cloud_type : '']
      // 'templates': this.builder.array([])
    });
    if (Array.isArray(param.inputs)) {
      JSON.stringify(param.inputs) !== '{}' ? (param.inputs as TerraFormParams[]).forEach(p => {
        console.log(p.param_type, "param type")
        if (p.param_type === 'Input Template') {
          const hasFilters = p.filters && Object.keys(p.filters).length > 0;
          const inputGroup = this.builder.group({
            template_name: new FormControl({ value: p.template_name, disabled: true }),
            attribute: new FormControl({ value: p.attribute, disabled: true }),
            param_type: new FormControl({ value: p.param_type, disabled: false }),
            default_value: new FormControl({ value: p.default_value, disabled: hasFilters }),
            template: new FormControl({ value: p.template, disabled: false }),
            param_name: new FormControl({ value: p.param_name, disabled: false }),
            label: new FormControl({ value: p.param_name }),
            filters: new FormControl(p.filters)
          });
          (form.get('inputs') as FormArray).push(inputGroup);
        } else {
          if (p.param_type === 'Dictionary' || p.param_type === 'List') {
            p.default_value = JSON.stringify(p.default_value);
          }
          const defaultValueGroup = this.builder.group({
            default_value: new FormControl(p.default_value, [Validators.required]),
            param_name: new FormControl(p.param_name),
            param_type: new FormControl(p.param_type)
          });
          (form.get('inputs') as FormArray).push(defaultValueGroup);
        }
      }) : '';
    }
    if (param.templates) {
      const templatesArray = form.get('templates') as FormArray;
      param.templates.forEach((template) => {
        const control = this.builder.group({
          label: [template.label],
          value: [{ value: '', disabled: !!template.dependency_name }, Validators.required]
        });
        templatesArray.push(control);
      });
    }
    return form;
  }

  resetFormErrors() {
    let formErrors = {
      'account_id': '',
      'cred': '',
      'credentials': '',
      'username': '',
      'password': '',
      'inputs': {},
      'templates': {}
    };
    return formErrors;
  }

  formValidationMessages = {
    'account_id': {
      'required': 'Account Name Selection is Required'
    },
    'credentials': {
      'required': 'Credentials Selection is Required'
    },
    'username': {
      'required': 'Username is Required'
    },
    'password': {
      'required': 'password is Required'
    },
    'inputs': {},
    'templates': {}
  }

  buildHostForm(param: TaskParamsType, taskId: string) {
    let form = this.builder.group({
      // 'ip': ['', [ipListValidator()]],
      'targets': [param.targets, [Validators.required]],
      'host_type': [''],
      // 'host': [[]],
      'datacenter': [''],
      'device_category': [''],
      'cloud': [[]],
      'account_name': [''],
      'tag': [''],
      'device_type': [[]],
      'cred': [param.cred],
      'inputs': this.builder.array([]),
      // 'templates': this.builder.array([])
    });
    if (param.cred === 'local') {
      form.addControl('credentials', new FormControl(param.credentials, Validators.required));
    } else {
      form.addControl('username', new FormControl(param.username, Validators.required));
      form.addControl('password', new FormControl('', Validators.required));
    }
    if (Array.isArray(param.inputs)) {
      JSON.stringify(param.inputs) !== '{}' ? (param.inputs as TerraFormParams[]).forEach(p => {
        const hasFilters = p.filters && Object.keys(p.filters).length > 0;
        if (p.param_type === 'Input Template') {
          const inputGroup = this.builder.group({
            template_name: new FormControl({ value: p.template_name, disabled: true }),
            attribute: new FormControl({ value: p.attribute, disabled: true }),
            param_type: new FormControl({ value: p.param_type, disabled: false }),
            default_value: new FormControl({ value: p.default_value, disabled: hasFilters }, [Validators.required]),
            template: new FormControl({ value: p.template, disabled: false }),
            param_name: new FormControl({ value: p.param_name, disabled: false }),
            label: new FormControl({ value: p.param_name }),
            filters: new FormControl(p.filters)
          });
          (form.get('inputs') as FormArray).push(inputGroup);
        } else {
          const defaultValueGroup = this.builder.group({
            default_value: new FormControl(p.default_value, [Validators.required]),
            param_name: new FormControl(p.param_name),
            param_type: new FormControl(p.param_type)
          });
          (form.get('inputs') as FormArray).push(defaultValueGroup);
        }
      }) : '';
      // } 
      // else if (param.playbook_type == 'Bash Script' || param.playbook_type == 'Python Script' || param.playbook_type == 'Powershell Script') {
      //   const scriptParams = param.inputs as Scripts;
      //   JSON.stringify(param.inputs) !== '{}' ? (form.get('parameters') as FormGroup).addControl(scriptParams.param_name, new FormControl(scriptParams.default_value, [Validators.required])
      //   ) : '';
      // }
    }
    if (param.templates) {
      const templatesArray = form.get('templates') as FormArray;
      param.templates.forEach((template) => {
        const control = this.builder.group({
          label: [template.label],
          value: [{ value: '', disabled: !!template.dependency_name }, Validators.required]
        });
        templatesArray.push(control);
      });
    }
    return form;
  }

  resetHostFormErrors() {
    return {
      // 'ip': '',
      'targets': '',
      'host_type': '',
      // 'host': '',
      'datacenter': '',
      'device_category': '',
      'cloud': '',
      'account_name': '',
      'tag': '',
      'device_type': '',
      'cred': '',
      'credentials': '',
      'username': '',
      'password': '',
      'inputs': {},
      'templates': {}
    }
  }

  hostFormValidationMessages = {
    // 'ip': {
    //   'invalidIps': 'IPs are invalid',
    // },
    // 'host_type': {
    //   'required': 'Host Type Selection is Mandatory'
    // },
    'targets': {
      'required': 'Targets is required'
    },
    'datacenter': {
      'required': 'Datacenter Selection is Mandatory'
    },
    'device_category': {
      'required': 'Device Category Selection is Mandatory'
    },
    'cloud': {
      'required': 'Cloud Selection is Mandatory'
    },
    'account_name': {
      'required': 'Account Name Selection is Mandatory'
    },
    'tag': {
      'required': 'Tag Selection is Mandatory'
    },
    'device_type': {
      'required': 'Device Type Selection is Mandatory'
    },
    'credentials': {
      'required': 'Credentials Selection is Required'
    },
    'username': {
      'required': 'Username is Required'
    },
    'password': {
      'required': 'password is Required'
    },
    'inputs': {},
    'templates': {}
  }

  getTemplateOption(templateId: string): Observable<TemplateOption[]> {
    return this.http.get<TemplateOption[]>(`orchestration/input_template/${templateId}/options/`);
  }

  getTemplateOptionWithDep(templateId: string, filterId: string, accountId: string) {
    let param = new HttpParams().set('filter', filterId).set('account_id', accountId);
    return this.http.get(`orchestration/input_template/${templateId}/options/`, { params: param });
  }

  getTemplateOptionWithDependent(templateId: string, filters: any): Observable<TemplateOption[]> {
    let params = new HttpParams();
    for (const key in filters) {
      params = params.set(key, filters[key]);
    }
    return this.http.get<TemplateOption[]>(`orchestration/input_template/${templateId}/options/`, { params });
  }

  getCloudAccount(cloudType: string): Observable<any> {
    let param = new HttpParams().append('cloud_type', cloudType);
    return this.http.get<any>(`customer/cloud_fast/`, { params: param })
  }

  getCredentials(): Observable<Array<DeviceDiscoveryCredentials>> {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<Array<DeviceDiscoveryCredentials>>(GET_ADVANCED_DISCOVERY_CREDENTIALS(), { params: param });
  }

  submitExecution(uuid: string, data: any) {
    return this.http.post(`orchestration/workflows/${uuid}/execute/`, data);
  }

  getAllCloud(cloudType?: string): Observable<any> {
    let param = new HttpParams().set('page_size', 0);
    if (cloudType) {
      param = param.append('cloud_type', cloudType);
    }
    return this.http.get<any>(`customer/cloud_fast/`, { params: param });
  }

  getTags(): Observable<any> {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<any>(`customer/tags/`, { params: param });
  }

  getHost(search: string, tag?: string, deviceType?: string, dc?: string, subType?: string, publicCloud?: string, privateCloud?: string): Observable<any> {
    let params = new HttpParams().set('page_size', 0).set('search', search);
    if (tag) {
      params = params.append('tag', tag);
    }
    if (deviceType) {
      params = params.append('device_type', deviceType);
    }
    if (dc) {
      params = params.append('dc', dc);
    }
    if (subType) {
      params = params.append('sub_type', subType);
    }
    if (publicCloud) {
      const cloudTypeLowerCase = publicCloud.toLowerCase();
      const matchedDeviceType = deviceTypes.find(deviceType => cloudTypeLowerCase.includes(deviceType.name));
      if (matchedDeviceType) {
        deviceType = matchedDeviceType.name;
        params = params.append('device_type', deviceType);
      }
      params = params.append('public_cloud', publicCloud);
    }
    if (privateCloud) {
      params = params.append('private_cloud', privateCloud);
    }
    return this.http.get<any>(`customer/advanced_search_fast/`, { params: params });
  }

  getDc(): Observable<any> {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<any>(`customer/colo_cloud/`, { params: param });
  }

  getIpAddress(ipAddress: string): Observable<any> {
    let param = new HttpParams().set('page_size', 0).set('ip_address', ipAddress);
    return this.http.get<any>(`customer/advanced_search_fast/`, { params: param });
  }

  getCloudWithImg() {
    return this.http.get<any>(`orchestration/tasks/get_metadata/`);
  }

  getTaskParamsById(uuid: string): Observable<TaskParamsType> {
    return this.http.get<TaskParamsType>(`orchestration/workflows/${uuid}/get_parameters/`);
  }

  getScheduleData(taskId: string) {
    return this.http.get<any>(`/orchestration/workflows/${taskId}/schedule/`)
  }

  saveInstance(data: any, taskId?: string) {
    return this.http.post<any>(`/orchestration/workflows/${taskId}/schedule/`, data);
  }
}

export interface TaskParamsType {
  inputs: TerraFormParams[] | Scripts[] | {};
  cloud_type: string;
  target_type: string;
  playbook_type: string;
  workflow_name: string;
  templates: TemplateList[];
  cloud_account: string;
  cloud_image: string;
  targets: [];
  cred: string;
  credentials: string;
  username: string;
  password: string;
  cloud_template: string;
  required_credentials: boolean;
}

export interface TemplateList {
  label: string;
  name: string;
  uuid: string;
  dependency_name: string;
}

export interface TemplateOption {
  value: string;
  label: string;
}

export interface TerraFormParams {
  param_name: string,
  mandatory: boolean,
  param_type: string,
  placeholder: string,
  default_value: any;
  attribute: string;
  template: string;
  template_name: string;
  label: string;
  filters: {};
}

export interface Hosts {
  name: string;
  ip_address: string;
}

export interface HostType {
  ip_address: string[];
  hosts: string[];
  cred: string;
  credentials: string;
  username: string;
  password: string;
}

export interface Scripts {
  param_name: string,
  mandatory: boolean,
  param_type: string,
  placeholder: string,
  default_value: any;
  attribute: string;
  template: string;
  template_name: string;
}

export const deviceTypes = [
  {
    name: "switch",
    displayName: "Switch",
    mapping: DeviceMapping.SWITCHES
  },
  {
    name: "firewall",
    displayName: "Firewall",
    mapping: DeviceMapping.FIREWALL
  },
  {
    name: "load_balancer",
    displayName: "Load Balancer",
    mapping: DeviceMapping.LOAD_BALANCER
  },
  {
    name: "hypervisor",
    displayName: "Hypervisor",
    mapping: DeviceMapping.HYPERVISOR
  },
  {
    name: "baremetal",
    displayName: "Bare Metal",
    mapping: DeviceMapping.BARE_METAL_SERVER
  },
  {
    name: "storage",
    displayName: "Storage",
    mapping: DeviceMapping.STORAGE_DEVICES
  },
  {
    name: "mac_device",
    displayName: "Mac Device",
    mapping: DeviceMapping.MAC_MINI
  },
  {
    name: "vmware",
    displayName: "Vmware Virtual Machine",
    mapping: DeviceMapping.VMWARE_VIRTUAL_MACHINE
  },
  {
    name: "vcloud",
    displayName: "Vcloud Virtual Machine",
    mapping: DeviceMapping.VCLOUD
  },
  {
    name: "open_stack",
    displayName: "OpenStack Virtual Machine",
    mapping: DeviceMapping.OPENSTACK_VIRTUAL_MACHINE
  },
  {
    name: "esxi",
    displayName: "Esxi Virtual Machine",
    mapping: DeviceMapping.ESXI
  },
  {
    name: "hyperv",
    displayName: "Hyperv Virtual Machine",
    mapping: DeviceMapping.HYPER_V
  },
  {
    name: "awsvirtualmachine",
    displayName: "AWS Virtual Machine",
    mapping: DeviceMapping.AWS_VIRTUAL_MACHINE,
    cloudName: "aws"
  },
  {
    name: "azurevm",
    displayName: "Azure Virtual Machine",
    mapping: DeviceMapping.AZURE_VIRTUAL_MACHINE
  },
  {
    name: "gcpvirtualmachines",
    displayName: "GCP Virtual Machine",
    mapping: DeviceMapping.GCP_VIRTUAL_MACHINE
  },
  {
    name: "ocivirtualmachines",
    displayName: "Oracle Virtual Machine",
    mapping: DeviceMapping.ORACLE_VIRTUAL_MACHINE
  },
  {
    name: "virtual_machine",
    displayName: "Virtual Machine",
    mapping: DeviceMapping.VIRTUAL_MACHINE
  },
];

export function ipListValidator(): ValidatorFn {
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

export const AtLeastOneInputHasValue = (fields: Array<string>) => {
  return (group: FormGroup) => {
    const hasValue = fields.some(fieldName => {
      const control = group.get(fieldName);
      return control && control.value && (Array.isArray(control.value) ? control.value.length > 0 : true);
    });
    return hasValue ? null : { atLeastOneRequired: true };
  };
};
