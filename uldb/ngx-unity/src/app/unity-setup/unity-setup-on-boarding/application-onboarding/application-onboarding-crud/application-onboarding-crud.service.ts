import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  ADVANCED_SEARCH_FAST,
  APM_ONBOARDING,
  APM_ONBOARDING_BY_ID,
  CLOUD_FAST,
  GET_AGENT_CONFIGURATIONS,
  GET_ALL_DEVICES_TAGS,
  ORCHESTRATION_GET_META_DATA,
  UNITY_CREDENTIALS
} from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { ApmTag, OnboardedApplication, RuntimeOption, TargetOption } from '../application-onboarding.type';

@Injectable()
export class ApplicationOnboardingCrudService {

  // Static runtime/language list - drives the Configuration sections.
  readonly runtimeOptions: RuntimeOption[] = [
    { label: 'Java', value: 'java' },
    { label: 'Dot Net', value: 'dotnet' },
    { label: 'Python', value: 'python' },
    { label: 'php', value: 'php' },
    { label: 'c++', value: 'cpp' }
  ];

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  // ---------------------------------- Dropdown loaders ----------------------------------

  getTags(): Observable<ApmTag[]> {
    return this.http.get<ApmTag[]>(GET_ALL_DEVICES_TAGS());
  }

  getCollectors(): Observable<DeviceDiscoveryAgentConfigurationType[]> {
    const params: HttpParams = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryAgentConfigurationType[]>(GET_AGENT_CONFIGURATIONS(), { params });
  }

  getCredentials(): Observable<DeviceDiscoveryCredentials[]> {
    const params: HttpParams = new HttpParams().set('page_size', '0');
    return this.http.get<DeviceDiscoveryCredentials[]>(UNITY_CREDENTIALS(), { params });
  }

  // Target search for the Host Config step - same source as the DevOps "Execute Task"
  // host page. The host-type filter selection narrows results via the extra params.
  getTargets(search: string, filters: { tag?: string; deviceType?: string[]; publicCloud?: string; privateCloud?: string } = {}): Observable<TargetOption[]> {
    let params: HttpParams = new HttpParams().set('page_size', '0').set('search', search);
    if (filters.tag) {
      params = params.append('tag', filters.tag);
    }
    if (filters.deviceType && filters.deviceType.length) {
      params = params.append('device_type', filters.deviceType.join(','));
    }
    if (filters.publicCloud) {
      params = params.append('public_cloud', filters.publicCloud);
    }
    if (filters.privateCloud) {
      params = params.append('private_cloud', filters.privateCloud);
    }
    return this.http.get<TargetOption[]>(ADVANCED_SEARCH_FAST(), { params });
  }

  // Cloud types for the "Cloud" host-type filter (response shape: { cloud: [...] }).
  getCloudTypes(): Observable<any> {
    return this.http.get<any>(ORCHESTRATION_GET_META_DATA());
  }

  // Cloud accounts for the selected cloud type.
  getCloudAccounts(cloudType: string): Observable<any[]> {
    let params: HttpParams = new HttpParams().set('page_size', '0');
    if (cloudType) {
      params = params.append('cloud_type', cloudType);
    }
    return this.http.get<any[]>(CLOUD_FAST(), { params });
  }

  getApplication(id: string): Observable<OnboardedApplication> {
    return this.http.get<OnboardedApplication>(APM_ONBOARDING_BY_ID(id));
  }

  // ---------------------------------- Step 1: Application ----------------------------------

  buildApplicationForm(record?: any): FormGroup {
    return this.builder.group({
      application_name: [record ? record.application_name : '', [Validators.required, NoWhitespaceValidator]],
      tags: [record && record.tags ? this.extractTagIds(record.tags) : []],
      runtime: [record && record.runtime ? record.runtime : [], [Validators.required]],
      collector: [record ? record.collector : null, [Validators.required]],
      project_dir: [record ? record.project_dir : '', [Validators.required, NoWhitespaceValidator]],
      log_file_path: [record ? record.log_file_path : '']
    });
  }

  resetApplicationFormErrors(): any {
    return {
      application_name: '',
      runtime: '',
      collector: '',
      project_dir: ''
    };
  }

  applicationFormValidationMessages = {
    application_name: {
      required: 'Application Name is required'
    },
    runtime: {
      required: 'Select at least one runtime'
    },
    collector: {
      required: 'Collector is required'
    },
    project_dir: {
      required: 'Project Directory is required'
    }
  };

  // ---------------------------------- Step 2: Host Config ----------------------------------

  buildHostConfigForm(record?: any): FormGroup {
    const form: FormGroup = this.builder.group({
      host_type: [''],
      device_id: [record ? record.device_id : null, [Validators.required]],
      host: [record ? record.host : null],
      credential_type: ['local']
    });
    // A persisted record always carries a credential id, so edit opens on Local.
    form.addControl('credentials', new FormControl(record ? record.credentials : null, [Validators.required]));
    return form;
  }

  resetHostConfigFormErrors(): any {
    return {
      host_type: '',
      cloud: '',
      account_name: '',
      tag: '',
      device_type: '',
      device_id: '',
      credentials: '',
      username: '',
      password: ''
    };
  }

  hostConfigFormValidationMessages = {
    device_id: {
      required: 'Target is required'
    },
    cloud: {
      required: 'Cloud is required'
    },
    account_name: {
      required: 'Account is required'
    },
    tag: {
      required: 'Tag is required'
    },
    device_type: {
      required: 'Device Type is required'
    },
    credentials: {
      required: 'Credential is required'
    },
    username: {
      required: 'Username is required'
    },
    password: {
      required: 'Password is required'
    }
  };

  // ---------------------------------- Step 3: Configuration ----------------------------------

  // Per-language sections mirror the design. The backend stores a single
  // service_name, so every section's Service Name is seeded from it on edit and
  // collapsed back to one value on save (see buildPayload).
  buildConfigurationForm(record?: any): FormGroup {
    const serviceName: string = record ? record.service_name : '';
    return this.builder.group({
      java: this.builder.group({
        agent_dir: [record ? record.java_agent_dir : ''],
        tool_option: [record ? record.java_tool_option : ''],
        service_name: [serviceName]
      }),
      dotnet: this.builder.group({
        runtime_dir: [record ? record.dotnet_runtime_dir : ''],
        service_name: [serviceName]
      }),
      python: this.builder.group({ service_name: [serviceName] }),
      php: this.builder.group({ service_name: [serviceName] }),
      cpp: this.builder.group({ service_name: [serviceName] })
    });
  }

  resetConfigurationFormErrors(): any {
    return {
      java: { agent_dir: '', tool_option: '', service_name: '' },
      dotnet: { runtime_dir: '', service_name: '' },
      python: { service_name: '' },
      php: { service_name: '' },
      cpp: { service_name: '' }
    };
  }

  configurationFormValidationMessages = {
    java: {
      agent_dir: { required: 'Agent Directory is required' },
      tool_option: { required: 'Java Tool Option is required' },
      service_name: { required: 'Service Name is required' }
    },
    dotnet: {
      runtime_dir: { required: 'Runtime Directory is required' },
      service_name: { required: 'Service Name is required' }
    },
    python: { service_name: { required: 'Service Name is required' } },
    php: { service_name: { required: 'Service Name is required' } },
    cpp: { service_name: { required: 'Service Name is required' } }
  };

  // ---------------------------------- Save ----------------------------------

  buildPayload(applicationForm: FormGroup, hostConfigForm: FormGroup, configurationForm: FormGroup, existing?: any): OnboardedApplication {
    const config = configurationForm.value;
    // The API keeps a single service_name; take it from the first SELECTED
    // runtime's section that has a value (hidden sections may hold stale seeds).
    const runtimes: string[] = applicationForm.value.runtime || [];
    const serviceByRuntime: { [key: string]: string } = {
      java: config.java.service_name,
      dotnet: config.dotnet.service_name,
      python: config.python.service_name,
      php: config.php.service_name,
      cpp: config.cpp.service_name
    };
    let serviceName = '';
    for (const runtime of runtimes) {
      if (serviceByRuntime[runtime]) {
        serviceName = serviceByRuntime[runtime];
        break;
      }
    }
    const value: any = {
      application_name: applicationForm.value.application_name,
      service_name: serviceName,
      runtime: applicationForm.value.runtime,
      collector: applicationForm.value.collector,
      project_dir: applicationForm.value.project_dir,
      log_file_path: applicationForm.value.log_file_path,
      tags: applicationForm.value.tags,
      device_id: hostConfigForm.value.device_id,
      host: hostConfigForm.value.host,
      java_agent_dir: config.java.agent_dir,
      java_tool_option: config.java.tool_option,
      dotnet_runtime_dir: config.dotnet.runtime_dir
    };
    if (hostConfigForm.value.credential_type === 'local') {
      value.credentials = hostConfigForm.value.credentials;
    } else {
      value.username = hostConfigForm.value.username;
      value.password = hostConfigForm.value.password;
    }
    // For edit, preserve server-managed fields (id, content_type, timestamps, etc.).
    return existing ? Object.assign({}, existing, value) : value;
  }

  save(payload: OnboardedApplication, id?: string): Observable<OnboardedApplication> {
    if (id) {
      return this.http.put<OnboardedApplication>(APM_ONBOARDING_BY_ID(id), payload);
    }
    return this.http.post<OnboardedApplication>(APM_ONBOARDING(), payload);
  }

  // Tags may be persisted as ids or nested objects - normalise to ids.
  private extractTagIds(tags: any[]): number[] {
    return (tags || []).map(t => (t && t.id != null ? t.id : t));
  }
}
