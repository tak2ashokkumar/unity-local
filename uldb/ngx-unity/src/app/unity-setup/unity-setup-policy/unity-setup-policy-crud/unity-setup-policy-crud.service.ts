import { Injectable } from '@angular/core';
import { ApprovalWorkflows, UnitySetupPolicyItem } from '../unity-setup-policy.type';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { forkJoin, Observable, of } from 'rxjs';
import { PublicCloudFast } from 'src/app/shared/SharedEntityTypes/public-cloud.type';
import { GET_USER_GROUPS_LIST, LIST_ACTIVE_USER, PUBLIC_CLOUDS_FAST } from 'src/app/shared/api-endpoint.const';
import { TicketMgmtList } from 'src/app/shared/SharedEntityTypes/ticket-mgmt-list.type';
import { UserGroupType } from 'src/app/shared/SharedEntityTypes/user-mgmt.type';
import { catchError } from 'rxjs/operators';
import { Account } from 'src/app/unity-services/orchestration/orchestration-workflows/orchestration-workflow-execution/orchestration-workflow-execution.type';

@Injectable()
export class UnitySetupPolicyCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient
  ) { }

  getPolicyData(policyId: string): Observable<any> {
    return this.http.get<any>(`/rest/policy/policies/${policyId}/`);
  }


  getCloudTypes(policyType: string): Observable<PrivateCLoudFast[] | Account[]> {
    const params = new HttpParams().set('page_size', '0');

    if (policyType === PolicyType.RESOURCE_QUOTA) {
      return this.http.get<PrivateCLoudFast[]>('customer/private_cloud_fast/', { params });
    } else {
      return this.http.get<Account[]>('/customer/cloud_fast/', { params });
    }
  }



  getTicketManagementList() {
    const params = new HttpParams().set('page_size', '0');
    return this.http.get<TicketMgmtList[]>(`customer/itsm_accounts/`, { params: params })
  }

  getApprovalWorkflows(itsmType: string, instanceId: string) {
    let params = new HttpParams().set('itsm_type', itsmType).set('instance_id', instanceId);
    return this.http.get<ApprovalWorkflows>(`/rest/policy/policies/get_approval_workflows/`, { params: params });
  }


  getWorkflowVariable(itsmInstance: string, workflow: string, instanceId: string) {
    let params = new HttpParams().set('itsm_type', instanceId).set('instance_id', itsmInstance).set('workflow_id', workflow);
    return this.http.get<ApprovalWorkflows>(`/rest/policy/policies/get_workflow_variable/`, { params: params });
  }

  getUserGroups(): Observable<UserGroupType[]> {
    let params: HttpParams = new HttpParams().set('status', true).set('page_size', 0);
    return this.http.get<UserGroupType[]>(GET_USER_GROUPS_LIST(), { params: params });
  }

  getUserList(): Observable<string[]> {
    return this.http.get<string[]>(LIST_ACTIVE_USER());
  }

  getDropdownData(): Observable<{ userGroups: UserGroupType[], userList: string[] }> {
    return forkJoin({
      userGroups: this.getUserGroups().pipe(catchError(error => of(undefined))),
      userList: this.getUserList().pipe(catchError(error => of(undefined))),
    })
  }

  createPolicy(data: any) {
    return this.http.post(`/rest/policy/policies/`, data);
  }


  updatePolicy(data: any, policyId: string) {
    return this.http.put(`/rest/policy/policies/${policyId}/`, data);
  }


  buildForm(data: any): FormGroup {
    if (data) {
      const form = this.builder.group({
        name: [data.name, [Validators.required, NoWhitespaceValidator]],
        scope: [data.scope, [Validators.required, NoWhitespaceValidator]],
        description: [data.description],
        policy_type: [{ value: data.policy_type, disabled: true }, [Validators.required]],
        is_enabled: [data.is_enabled],
        notification_enabled: [data.notification_enabled],
        notify_groups: [data.notify_groups],
        notify_users: [data.notify_users],
      });

      if (data.scope == 'Cloud') {
        console.log('hello')
        form.addControl('cloud_type', new FormControl(data.cloud_type, Validators.required));
        form.addControl('scope_id', new FormControl(data.scope_id, Validators.required));
      }

      if (data.policy_type === PolicyType.RESOURCE_QUOTA) {
        const configGroup = this.builder.group({
          max_vms: [data.config?.max_vms || ''],
          max_cpus: [data.config?.max_cpus || ''],
          max_memory: [data.config?.max_memory || ''],
          max_storage: [data.config?.max_storage || '']
        }, {
          validators: atLeastOneFieldRequiredValidator([
            'max_vms', 'max_cpus', 'max_memory', 'max_storage'
          ])
        });

        form.addControl('config', configGroup);
      }

      else if (data.policy_type === PolicyType.PROVISIONAL_APPROVAL) {
        const paramArray = this.builder.array([]);
        if (Array.isArray(data.config?.parameter_mapping)) {
          data.config.parameter_mapping.forEach(mapping => {
            paramArray.push(this.builder.group({
              workflow_attribute: [mapping.workflow_attribute, Validators.required],
              unityone_attribute: [mapping.unityone_attribute, Validators.required]
            }));
          });
        }
        const configGroup = this.builder.group({
          itsm_type: [data.config?.itsm_type || '', Validators.required],
          itsm_instance: [data.config?.itsm_instance || '', Validators.required],
          approval_workflow: [data.config?.approval_workflow, Validators.required],
          parameter_mapping: paramArray
        });

        form.addControl('config', configGroup);
      }

      else if (data.policy_type === PolicyType.NAMING) {
        const configGroup = this.builder.group({
          naming_pattern: [data.config?.naming_pattern, [Validators.required, regexSyntaxValidator()]],
          case_sensitivity: [data.config?.case_sensitivity, [Validators.required]],
        });

        form.addControl('config', configGroup);
      }
      else if (data.policy_type === PolicyType.TAGGING) {
        const tagsArray = this.builder.array([]);

        if (Array.isArray(data.config?.required_tags)) {
          data.config.required_tags.forEach(tag => {
            tagsArray.push(this.builder.group({
              tag_name: [tag.tag_name, Validators.required],
              allowed_values: [tag.allowed_values, commaSeparatedValidator()],
              required: [tag.required]
            }));
          });
        }

        const configGroup = this.builder.group({
          required_tags: tagsArray
        });

        form.addControl('config', configGroup);
      }


      return form;
    }

    // Default (create) flow
    return this.builder.group({
      name: ['', [Validators.required, NoWhitespaceValidator]],
      description: [''],
      policy_type: ['', [Validators.required]],
      scope: [{ value: '', disabled: true }, [Validators.required]],
      notify_groups: [[]],
      notify_users: [[]],
      is_enabled: [true],
      notification_enabled: [true],
    });
  }





  resetFormErrors() {
    return {
      name: '',
      description: '',
      policy_type: '',
      scope: '',
      notify_groups: '',
      notify_users: '',
      cloud_type: '',
      scope_id: '',
      config: {
        atLeastOneRequired: '',
        approval_workflow: '',
        itsm_instance: '',
        itsm_type: '',
        naming_pattern: '',
        parameter_mapping: [this.getParamaterMappingErros()],
        required_tags: [this.getTagsErros()],
      }
    };
  }


  getParamaterMappingErros() {
    return {
      'unityone_attribute': '',
    }
  }

  getTagsErros() {
    return {
      'tag_name': '',
      'allowed_values': '',
    }
  }

  formValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'description': {
      'required': 'Description is required'
    },
    'policy_type': {
      'required': 'Policy Type is required'
    },
    'scope': {
      'required': 'Scope is required'
    },
    'notify_groups': {
      'required': 'At least one User Group must be selected'
    },
    'notify_users': {
      'required': 'At least one User must be selected'
    },
    'cloud_type': {
      'required': 'Cloud Type is required'
    },
    'scope_id': {
      'required': 'Scope ID is required'
    },
    'config': {
      'atLeastOneRequired': 'At least one Resource Quota field must be filled',
      approval_workflow: {
        'required': 'Approval Workflow is required'
      },
      'itsm_instance': {
        'required': 'ITSM Instance is required'
      },
      'itsm_type': {
        'required': 'ITSM Type is required'
      },
      'naming_pattern': {
        'required': 'Naming pattern Type is required',
        'invalidRegex': 'Please enter a valid regex'
      },
      'parameter_mapping': {
        'unityone_attribute': {
          'required': 'UnityOne attribute is required'
        }
      },
      'required_tags': {
        'tag_name': {
          'required': 'Tag Name is required'
        },
        'allowed_values': {
          'commaSeparated': 'Please enter comma sepreated input'
        }
      },

    }
  };

  transformInput(input: any): any {
    if (input.policy_type === PolicyType.RESOURCE_QUOTA) {
      const normalizedConfig = {
        max_vms: this.toNumber(input.config?.max_vms),
        max_cpus: this.toNumber(input.config?.max_cpus),
        max_memory: this.toNumber(input.config?.max_memory),
        max_storage: this.toNumber(input.config?.max_storage),
      };
      return {
        ...input,
        config: normalizedConfig
      };
    }

    else if (input.policy_type === PolicyType.PROVISIONAL_APPROVAL) {
      // input.config.approval_workflow = input.config.approval_workflow[0];
      return input;
    }
    else return input;

  }


  private toNumber(value: any): number {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }





  getUniqueItsmTypes(instances: TicketMgmtList[]): string[] {

    const allowedTypes = ['ServiceNow'];

    const uniqueSet = new Set<string>();
    instances.forEach(item => {
      if (allowedTypes.includes(item.type)) {
        uniqueSet.add(item.type);
      }
    });

    return Array.from(uniqueSet);
  }

}

export enum PolicyType {
  PROVISIONAL_APPROVAL = 'Approval Policy',
  RESOURCE_QUOTA = 'Resource Quota Policy',
  NAMING = 'Naming Policy',
  TAGGING = 'Tagging Policy',
}

export const POLICY_TYPE_LIST = [
  PolicyType.PROVISIONAL_APPROVAL, PolicyType.RESOURCE_QUOTA, PolicyType.TAGGING
];

export class ScopeIdentifierListViewData {
  constructor() { }
  id: number;
  account_name: string | null;
}

export function atLeastOneFieldRequiredValidator(fields: string[]): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const hasValue = fields.some(field => {
      const control = group.get(field);
      return control && control.value != null && control.value !== '';
    });

    return hasValue ? null : { atLeastOneRequired: true };
  };
}

export function regexSyntaxValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    try {
      new RegExp(value);
      return null;
    } catch (e) {
      return { invalidRegex: true };
    }
  };
}

export function commaSeparatedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (typeof value !== 'string' || value.trim() === '') {
      return null; // Use Validators.required for required
    }

    // Must contain at least one comma
    if (!value.includes(',')) {
      return { commaSeparated: true };
    }

    const items = value.split(',').map(item => item.trim());
    const hasEmpty = items.some(item => item === '');

    if (hasEmpty) {
      return { commaSeparated: true };
    }
    return null; // Valid
  };
}
