import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  APM_ONBOARDING,
  APM_ONBOARDING_BY_ID,
  GET_AGENT_CONFIGURATIONS,
  GET_ALL_DEVICES_TAGS,
  UNITY_CREDENTIALS
} from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { ApmTag, OnboardedApplication, RuntimeOption } from '../application-onboarding.type';

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
      target_type: [record && record.target_type ? record.target_type : 'host'],
      device_id: [record ? record.device_id : null, [Validators.required]],
      credential_type: ['local']
    });
    // A persisted record always carries a credential id, so edit opens on Local.
    form.addControl('credentials', new FormControl(record ? record.credentials : null, [Validators.required]));
    return form;
  }

  resetHostConfigFormErrors(): any {
    return {
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
