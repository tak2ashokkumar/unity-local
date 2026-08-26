import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { CatalogDatacenter, CatalogItemPayload, CatalogMeta, ConfigOption, ConfigurationField, ConfigValidator, COST_COMPONENT_ALLOWED_KEYS, CostComponent, CURRENCY_SYMBOLS, FinopsBuildingBlock, InputMapping, Policy, TaskDropdownItem, TaskParameterInput, TaskParametersResponse, WorkflowDetail, WorkflowDropdownItem, WorkflowParameterInput, WorkflowParametersResponse } from './catalog-crud.type';
import { Observable } from 'rxjs';
import { ORCHESTRATION_GET_TASK } from 'src/app/shared/api-endpoint.const';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { map } from 'rxjs/operators';
const BASE_URL = `/api/service_catalog/v1/catalogs/`;

// Maps a cost-component key to the suffix of its size/capacity/count field,
// since different components name that field differently (e.g. ram_size vs storage_allocated_capacity).
const COUNT_KEY_SUFFIX_BY_COMPONENT: { [key: string]: string } = {
  ram: '_size',
  storage: '_allocated_capacity',
  cpu: '_count',
};

@Injectable({
  providedIn: 'root'
})
export class CatalogCrudService {

  constructor(private builder: FormBuilder, private http: HttpClient) { }

  // ---------- HTTP ----------

  getTaskData(): Observable<PaginatedResult<TaskDropdownItem>> {
    return this.http.get<PaginatedResult<TaskDropdownItem>>(ORCHESTRATION_GET_TASK());
  }

  getWorkflowData(triggerType: string): Observable<PaginatedResult<WorkflowDropdownItem>> {
    const params = new HttpParams().set('trigger_type', triggerType);
    return this.http.get<PaginatedResult<WorkflowDropdownItem>>(
      `/rest/orchestration/agentic_workflow/`,
      { params }
    );
  }

  getFinopsBuildingBlocks(): Observable<FinopsBuildingBlock> {
    return this.http.get<FinopsBuildingBlock>(`/customer/finops/building_blocks/`, {
      params: new HttpParams().set('page_size', '0')
    });
  }

  getVersionWorkflowData(uuid: string): Observable<WorkflowDetail> {
    return this.http.get<WorkflowDetail>(`/rest/orchestration/agentic_workflow/${uuid}/`);
  }

  getMetaData(): Observable<CatalogMeta> {
    return this.http.get<CatalogMeta>('/api/service_catalog/v1/catalogs/choices/');
  }

  getDatacenters(): Observable<CatalogDatacenter[]> {
    return this.http.get<CatalogDatacenter[]>('/customer/colo_cloud_fast/', {
      params: new HttpParams().set('page_size', '0')
    });
  }

  getCatalogDataById(uuid: string): Observable<CatalogItemPayload> {
    return this.http.get<CatalogItemPayload>(`${BASE_URL}${uuid}/`);
  }

  createCatalog(payload: CatalogItemPayload): Observable<CatalogItemPayload> {
    return this.http.post<CatalogItemPayload>(`${BASE_URL}`, this.toFormData(payload));
  }

  updateCatalog(uuid: string, payload: CatalogItemPayload): Observable<CatalogItemPayload> {
    return this.http.put<CatalogItemPayload>(`${BASE_URL}${uuid}/`, this.toFormData(payload));
  }

  getTaskParameters(taskUuid: string): Observable<TaskParametersResponse> {
    return this.http.get<TaskParametersResponse>(
      `/orchestration/tasks/${taskUuid}/get_parameters/`
    );
  }

  getWorkflowParameters(workflowUuid: string): Observable<WorkflowParametersResponse> {
    return this.http.get<WorkflowParametersResponse>(
      `/rest/orchestration/agentic_workflow/${workflowUuid}/manual/`
    );
  }

  getCloudAccounts(): Observable<any> {
    return this.http.get<any>(`/customer/cloud_fast/`, { params: new HttpParams().set('page_size', '0') });
  }

  getCredentials(): Observable<any> {
    return this.http.get<any>(`/customer/unity_discovery/credential/`, { params: new HttpParams().set('page_size', '0') });
  }

  getHost(query: string): Observable<any[]> {
    return this.http.get<any>(`/customer/advanced_search_fast/`, {
      params: new HttpParams().set('page_size', '0').set('search', query || '')
    }).pipe(
      map((res: any) => res.results || res || [])
    );
  }

  private toFormData(payload: CatalogItemPayload): FormData {
    const { logo, ...rest } = payload as any;
    const fd = new FormData();

    if (logo instanceof File) {
      fd.append('logo', logo, logo.name);
    } else if (logo === null) {
      // An explicit empty value clears an existing image on edit. Existing
      // URL strings are deliberately omitted because they are not uploads.
      fd.append('logo', '');
    }

    Object.keys(rest).forEach((key) => {
      const value = rest[key];
      if (value === undefined) {
        return;
      }
      if (value === null) {
        fd.append(key, '');
        return;
      }
      if (typeof value === 'object') {
        fd.append(key, JSON.stringify(value));
      } else {
        fd.append(key, String(value));
      }
    });

    return fd;
  }
  buildForm(catalogData?: CatalogItemPayload): FormGroup {
    const c = catalogData || ({} as Partial<CatalogItemPayload>);
    const initialBillingModel = c.billing_model || '';
    const frequencyValidators = initialBillingModel && initialBillingModel !== 'Free' ? [Validators.required] : [];

    const form = this.builder.group({
      uuid: [c.uuid || null],
      name: [c.name || '', [Validators.required, Validators.maxLength(255)]],
      description: [c.description || '', [Validators.required, Validators.maxLength(1000)]],
      logo: [c.logo || null, [Validators.required]],
      category: [c.category || '', [Validators.required]],
      platform: [c.platform || '', [Validators.required, Validators.maxLength(64)]],
      service: [c.service || '', [Validators.required, Validators.maxLength(64)]],
      datacenter: [c.datacenter || []],
      management_type: [c.management_type || 'Unmanaged'],

      use_cases: this.builder.array((c.use_cases || []).map(v => this.builder.control(v, [Validators.required]))),
      key_features: this.builder.array((c.key_features || []).map(v => this.builder.control(v, [Validators.required]))),

      configuration: this.builder.array(
        (c.configuration || []).map(f => this.buildConfigFieldGroup(f))
      ),

      billing_model: [initialBillingModel, [Validators.required]],
      finops_block: [c.finops_block || '', [Validators.required]],
      price: [c.price !== undefined ? c.price : '', [Validators.required, priceValidator()]],
      frequency: [c.frequency || '', frequencyValidators],
      currency: [c.currency ?? 'EUR', [Validators.pattern(/^[A-Za-z]{3}$/)]],
      pricing_basis: [c.pricing_basis || 'Per Instance'],
      cost_mapping: this.builder.array(
        (c.cost_mapping || []).map(cc => this.buildCostComponentGroup(cc))
      ),

      sla: this.builder.group({
        provisioning_time: [c.sla?.provisioning_time || '', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
        uptime_sla: [c.sla?.uptime_sla || ''],
        support_level: [c.sla?.support_level || ''],
        response_time: [c.sla?.response_time || '']
      }),

      policies: this.builder.array((c.policies || []).map(p => this.buildPolicyGroup(p))),

      requirements: this.builder.group({
        functional: this.builder.array((c.requirements?.functional || []).map(v => this.builder.control(v, [Validators.required]))),
        technical: this.builder.array((c.requirements?.technical || []).map(v => this.builder.control(v, [Validators.required]))),
        access_permissions: this.builder.array((c.requirements?.access_permissions || []).map(v => this.builder.control(v, [Validators.required]))),
        included: this.builder.array((c.requirements?.included || []).map(v => this.builder.control(v, [Validators.required]))),
        not_included: this.builder.array((c.requirements?.not_included || []).map(v => this.builder.control(v, [Validators.required])))
      }),

      is_available: [c.is_available !== undefined ? c.is_available : true],
      allow_quantity: [c.allow_quantity !== undefined ? c.allow_quantity : true],
      min_quantity: [c.min_quantity !== undefined && c.min_quantity !== null ? c.min_quantity : 1],
      max_quantity: [c.max_quantity !== undefined ? c.max_quantity : null, [maxQuantityValidator()]],

      automation_type: [c.automation_type || 'Task', [Validators.required]],

      input_mapping: this.builder.array((c.input_mapping || []).map(m => this.buildInputMappingGroup(m))),
      require_approval: [c.require_approval || false]
    });

    const isWorkflow = c.automation_type === 'Workflow';
    // Keep both automation selections in the form so toggling modes does not
    // discard either value. Only the active controls participate in validation.
    form.addControl('task', this.builder.control(
      { value: c.task || '', disabled: isWorkflow }, Validators.required
    ));
    form.addControl('workflow', this.builder.control(
      { value: c.workflow || '', disabled: !isWorkflow }, Validators.required
    ));
    form.addControl('workflow_version', this.builder.control(
      { value: c.workflow_version || c.workflow || '', disabled: true }, Validators.required
    ));

    return form;
  }

  uploadLogo(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`/api/service_catalog/v1/catalogs/upload_logo/`, formData);
  }

  resetFormErrors(): any {
    return {
      name: '', description: '', logo: '', category: '', platform: '', service: '',
      billing_model: '', price: '', currency: '', frequency: '',
      automation_type: '', task: '', workflow: '', workflow_version: '', max_quantity: '', finops_block: '',
      provisioning_time: ''
    };
  }

  formValidationMessages = {
    name: { required: 'Name is required.' },
    description: { required: 'Description is required.', maxlength: 'Description must be under 1000 characters.' },
    logo: { required: 'Logo is required.' },
    category: { required: 'Category is required.' },
    platform: { required: 'Platform is required.' },
    service: { required: 'Service is required.' },
    billing_model: { required: 'Billing model is required.' },
    price: { required: 'Price is required.', price: 'Enter a valid, non-negative price.' },
    currency: { pattern: 'Currency must be a 3-letter ISO code.' },
    frequency: { required: 'Frequency is required.' },
    automation_type: { required: 'Catalog type is required.' },
    task: { required: 'Select a task.' },
    workflow: { required: 'Select a workflow.' },
    workflow_version: { required: 'Select a workflow version.' },
    max_quantity: { belowMin: 'Maximum quantity is below the minimum.' },
    provisioning_time: {
      required: 'Provisioning time is required.',
      pattern: 'Provisioning time must be a whole number of minutes.'
    },
    configuration: {
      key: { required: 'Key is required.', snakeCase: 'Use snake case only — lowercase letters, numbers, and underscores, no spaces, and it can\'t start or end with an underscore.' },
      label: { required: 'Label is required.' },
      type: { required: 'Type is required.' }
    },
    input_mapping: {
      param_name: { required: 'Parameter name is required.' },
      value: { required: 'Value is required.', missingKey: 'Points at a missing configuration key.' }
    },
    finops_block: { required: 'FinOps building block is required.' },
  };

  // ---------- nested group builders ----------

  buildConfigFieldGroup(field?: ConfigurationField): FormGroup {
    const f = field || ({} as Partial<ConfigurationField>);
    return this.builder.group({
      key: [f.key || '', [Validators.required, snakeCaseKeyValidator()]],
      label: [f.label || '', [Validators.required]],
      type: [f.type || 'text', [Validators.required]],
      placeholder: [f.placeholder || ''],
      help_text: [f.help_text || ''],
      default: [f.default !== undefined ? f.default : ''],
      unit: [f.unit || ''],
      min: [f.min !== undefined ? f.min : null],
      max: [f.max !== undefined ? f.max : null],
      step: [f.step !== undefined ? f.step : null],
      options: this.builder.array((f.options || []).map(o => this.buildOptionGroup(o))),
      validators: this.builder.array((f.validators || []).map(v => this.buildValidatorGroup(v))),
      required: [f.required || false],
      disabled: [f.disabled || false]
    });
  }

  buildOptionGroup(opt?: ConfigOption): FormGroup {
    const o = opt || ({} as Partial<ConfigOption>);
    return this.builder.group({
      value: [o.value || '', [Validators.required]],
      label: [o.label || '']
    });
  }

  buildValidatorGroup(v?: ConfigValidator): FormGroup {
    const val = v || ({} as Partial<ConfigValidator>);
    return this.builder.group({
      type: [val.type || 'regex'],
      value: [val.value || '', [Validators.required]]
    });
  }

  buildCostComponentGroup(cc?: CostComponent): FormGroup {
    const c = cc || ({} as Partial<CostComponent>);
    return this.builder.group({
      key: [{ value: c.key || '', disabled: true }],
      label: [{ value: c.label || '', disabled: true }],
      subtitle: [{ value: c.subtitle || '', disabled: true }],
      unit: [{ value: c.unit || '', disabled: true }],
      rate: [{ value: c.rate !== undefined ? c.rate : 0, disabled: true }],
      rate_frequency: [{ value: c.rate_frequency || 'Monthly', disabled: true }],
      base_quantity: [{ value: c.base_quantity !== undefined ? c.base_quantity : 1, disabled: true }],
      source: [c.source || 'Config'],
      config_key: [c.config_key || ''],
      count: [c.count !== undefined && c.count !== null ? c.count : null],
      mapping_type: [c.mapping_type || 'Multiply'],
      sentence: [{ value: c.sentence || '', disabled: true }],
      price: [{ value: c.price !== undefined ? c.price : null, disabled: true }],
    });
  }

  buildPolicyGroup(p?: Policy): FormGroup {
    const policy = p || ({} as Partial<Policy>);
    return this.builder.group({
      policy: [policy.policy || '', [Validators.required]],
      description: [policy.description || ''],
      type: [policy.type || 'Mandatory']
    });
  }

  buildInputMappingGroup(m?: InputMapping): FormGroup {
    const map = m || ({} as Partial<InputMapping>);
    return this.builder.group({
      param_name: [{ value: map.param_name || '', disabled: !!map.param_type }, [Validators.required]],
      mapping_type: [map.mapping_type || 'catalog_field'],
      value: [map.value !== undefined ? map.value : '', [requiredMappingValue]],
      param_type: [{ value: map.param_type || '', disabled: true }]
    });
  }

  buildInputMappingsFromParams(inputs: (TaskParameterInput | WorkflowParameterInput)[]): InputMapping[] {
    return (inputs || [])
      .map((i) => ({
        param_name: i.param_name,
        mapping_type: 'static' as const,
        value: i.default_value !== undefined ? i.default_value : '',
        param_type: i.param_type
      }));
  }

  buildInputMappingsFromTaskData(data: any, cloudAccounts: any[] = []): InputMapping[] {
    const extraRows: InputMapping[] = [];
    const targetType = data?.target_type || '';

    if (targetType === 'Host') {
      extraRows.push({
        param_name: 'Target',
        mapping_type: 'static',
        value: data.targets || [],
        param_type: 'Target'          // <-- matches PARAM_TYPE_MAP key
      } as InputMapping);
      extraRows.push({
        param_name: 'Credential',
        mapping_type: 'static',
        value: data.credentials || '',
        param_type: 'Credential'      // <-- matches PARAM_TYPE_MAP key
      } as InputMapping);
    } else if (targetType === 'Cloud') {
      const rawCloudAccount = data.cloud_account || '';
      const matchedAccount = (cloudAccounts || []).find(
        (ca) => ca && (ca.uuid === rawCloudAccount || ca.id === rawCloudAccount)
      ) || rawCloudAccount;

      extraRows.push({
        param_name: 'Cloud Account',
        mapping_type: 'static',
        value: matchedAccount,
        param_type: 'Cloud Account'   // <-- matches PARAM_TYPE_MAP key
      } as InputMapping);
    }

    return [...extraRows, ...this.buildInputMappingsFromParams(data.inputs || [])];
  }

  // ---------- generic FormArray helpers (used for the plain string lists) ----------

  pushString(array: FormArray, value = ''): void {
    array.push(this.builder.control(value, [Validators.required]));
  }

  removeAt(array: FormArray, index: number): void {
    array.removeAt(index);
  }

  canAddRow(array: FormArray): boolean {
    if (!array || !array.length) { return true; }
    const last = array.at(array.length - 1);
    last.updateValueAndValidity();
    return last.valid;
  }

  // ---------- payload assembly (form -> API) ----------

  buildPayload(form: FormGroup): CatalogItemPayload {
    const raw = form.getRawValue();
    const automationType = raw.automation_type;

    const configuration: ConfigurationField[] = (raw.configuration || []).map((f: any) => {
      const item: ConfigurationField = {
        key: (f.key || '').trim(),
        type: f.type,
        label: (f.label || '').trim(),
        required: !!f.required,
        disabled: !!f.disabled
      };
      if (['text', 'password', 'number', 'textarea'].indexOf(f.type) > -1 && f.placeholder) {
        item.placeholder = f.placeholder;
      }
      if (f.help_text) { item.help_text = f.help_text; }
      if (f.unit) { item.unit = f.unit; }
      item.default = f.default !== '' && f.default !== null ? this.coerce(f.default, f.type) : '';
      if (['select', 'multiselect', 'radio'].indexOf(f.type) > -1) {
        item.options = (f.options || []).filter((o: any) => o.value);
      }
      if (['range', 'number'].indexOf(f.type) > -1) {
        ['min', 'max', 'step'].forEach((k) => {
          if (f[k] !== null && f[k] !== '') { (item as any)[k] = Number(f[k]); }
        });
      }
      const validators = (f.validators || []).filter((v: any) => v.type && v.value !== '');
      if (validators.length) { item.validators = validators; }
      return item;
    });

    return {
      uuid: raw.uuid || undefined,
      name: (raw.name || '').trim(),
      description: raw.description || '',
      logo: raw.logo || null,
      category: raw.category,
      platform: raw.platform || '',
      service: raw.service || '',
      datacenter: raw.datacenter || [],
      management_type: raw.management_type,
      use_cases: (raw.use_cases || []).filter((v: string) => (v || '').trim()),
      key_features: (raw.key_features || []).filter((v: string) => (v || '').trim()),
      configuration,
      billing_model: raw.billing_model,
      finops_block: raw.finops_block,
      price: raw.price === '' || raw.price === null ? null : Number(raw.price).toFixed(2),
      frequency: raw.billing_model === 'Free' ? '' : raw.frequency,
      currency: (raw.currency ?? 'USD'),
      cost_mapping: raw.cost_mapping || [],
      sla: raw.sla,
      policies: raw.policies || [],
      requirements: {
        functional: (raw.requirements.functional || []).filter((v: string) => (v || '').trim()),
        technical: (raw.requirements.technical || []).filter((v: string) => (v || '').trim()),
        access_permissions: (raw.requirements.access_permissions || []).filter((v: string) => (v || '').trim()),
        included: (raw.requirements.included || []).filter((v: string) => (v || '').trim()),
        not_included: (raw.requirements.not_included || []).filter((v: string) => (v || '').trim())
      },
      is_available: !!raw.is_available,
      allow_quantity: !!raw.allow_quantity,
      min_quantity: raw.allow_quantity ? raw.min_quantity : null,
      max_quantity: raw.allow_quantity && raw.max_quantity !== '' ? raw.max_quantity : null,
      automation_type: automationType,
      task: automationType === 'Task' ? (raw.task || null) : null,
      // The API stores the selected WorkflowVersion, not its parent workflow.
      workflow_version: automationType === 'Workflow' ? (raw.workflow_version || null) : null,
      input_mapping: raw.input_mapping || [],
      require_approval: !!raw.require_approval
    };
  }

  private coerce(v: any, type: string): any {
    if (type === 'number' || type === 'range') {
      const n = Number(v);
      return isNaN(n) ? v : n;
    }
    if (type === 'checkbox') { return v === true || v === 'true'; }
    return v;
  }

  // Cross-field checks the standard Validators can't express cleanly on their
  // own (duplicate keys, dangling mappings, quantity bounds, unresolved cost
  // components). Surfaced as a plain string list next to the payload preview
  // / submit button, and used to decide which accordion sections to reopen.
  getFormProblems(form: FormGroup): string[] {
    const p = this.buildPayload(form);
    const out: string[] = [];

    const keys = p.configuration.map(cfg => cfg.key);
    keys.forEach((k, i) => {
      if (k && keys.indexOf(k) !== i) { out.push(`Duplicate configuration key "${k}"`); }
    });

    p.input_mapping.forEach(m => {
      if (m.mapping_type === 'catalog_field' && m.value && keys.indexOf(m.value) === -1) {
        out.push(`Mapping "${m.param_name}" points at a missing configuration key`);
      }
    });

    if (p.max_quantity !== null && p.min_quantity !== null && Number(p.max_quantity) < Number(p.min_quantity)) {
      out.push('Maximum quantity is below the minimum');
    }
    if (p.currency && p.currency.length !== 3) {
      out.push('Currency must be a 3-letter ISO code');
    }

    // A billed (non-Free) catalog item with a frequency selected must have
    // at least one cost component, and every row must resolve to a price.
    if (p.billing_model && p.billing_model !== 'Free' && p.frequency) {
      if (!p.cost_mapping || !p.cost_mapping.length) {
        out.push('At least one cost component is required.');
      } else {
        const hasUnresolved = p.cost_mapping.some((cc: any) => cc.price === null || cc.price === undefined || cc.price === '');
        if (hasUnresolved) {
          out.push('One or more cost components are unresolved. Complete the Source/Configuration selection for each row.');
        }
      }
    }

    return out;
  }

  ///////////////////////////////// COST COMPONENT ////////////////////////////////////////////////
  transformCostComponents(component: any): CostComponent[] {
    if (!component) { return []; }
    return COST_COMPONENT_ALLOWED_KEYS
      .filter((key) => component[key] && typeof component[key] === 'object')
      .map((key) => this.extractComponentRow(key, component[key]));
  }

  private extractComponentRow(key: string, obj: any): CostComponent {
    const keys = Object.keys(obj || {});
    const rateKey = keys.find(k => k.endsWith('_rate_value'));
    const rateFreqKey = keys.find(k => k.endsWith('_rate_frequency'));
    const unitKey = keys.find(k => k.endsWith('_metric_unit'));
    const countSuffix = COUNT_KEY_SUFFIX_BY_COMPONENT[key];
    const countKey = countSuffix
      ? keys.find(k => k.endsWith(countSuffix))
      : keys.find(k => k.endsWith('_allocated_capacity') || k.endsWith('_size') || k.endsWith('_count'));
    const typeKey = keys.find(k => k.endsWith('_type') && !k.endsWith('_metric_type'))
      || keys.find(k => k.endsWith('_usage_metric'));

    const rate = rateKey ? Number(obj[rateKey]) || 0 : 0;
    const rateFrequency = rateFreqKey ? (obj[rateFreqKey] || 'Monthly') : 'Monthly';
    const unit = unitKey ? obj[unitKey] : '';
    const countVal = countKey ? obj[countKey] : null;
    const typeLabel = typeKey ? obj[typeKey] : '';

    console.log('extractComponentRow', {
      key, obj, keys,
      rateKey, rateFreqKey, unitKey, countKey, typeKey,
      rate, rateFrequency, unit, countVal, typeLabel
    });

    const subtitle = (countVal !== null && countVal !== undefined && countVal !== '')
      ? `${countVal} ${unit}`.trim()
      : (typeLabel ? `${typeLabel}${unit ? ' (' + unit + ')' : ''}` : unit);

    // Build: "20/d for 10 vcpu"
    const sentence = this.buildCostSentence(rate, rateFrequency, countVal, unit);

    const baseQuantity = Number(countVal) > 0 ? Number(countVal) : 1;
    return {
      key, label: key.toUpperCase(), subtitle, unit,
      rate,
      rate_frequency: rateFrequency,
      base_quantity: baseQuantity,
      sentence,
      // A newly selected FinOps block must have a complete, calculable
      // default. Users can switch a row to Configuration afterwards.
      source: 'Static', config_key: '', count: baseQuantity, mapping_type: 'Multiply'
    };
  }

  // "20/d for 10 vcpu" rate + frequency + count + unit,
  // gracefully drops the "for X unit" clause when count/unit are missing (e.g. storage: all null)
  private buildCostSentence(rate: number, frequency: string, countVal: any, unit: string): string {
    if (!rate) { return ''; } // nothing meaningful to say (e.g. storage row with all nulls)

    const frequencySuffix: { [k: string]: string } = {
      'Monthly': '/mo',
      'Daily': '/day',
      'Hourly': '/hr'
    };
    const freqPhrase = frequencySuffix[frequency] || `/${frequency.toLowerCase()}`;

    let sentence = `${rate}${freqPhrase}`;

    if (countVal !== null && countVal !== undefined && countVal !== '') {
      const unitLabel = (unit || '').toUpperCase();
      sentence += ` for ${countVal}${unitLabel ? ' ' + unitLabel : ''}`;
    }

    return sentence;
  }

  // catalog-crud.service.ts
  getCurrencySymbol(code: string): string {
    return CURRENCY_SYMBOLS[(code || '').toUpperCase()] || code || '';
  }

  ///////////////////////////////// COST COMPONENT ////////////////////////////////////////////////

}

function requiredMappingValue(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  // Angular's Validators.required treats boolean false as empty, but false is
  // a valid fixed value for boolean orchestration parameters.
  return value === null || value === undefined || value === '' ? { required: true } : null;
}

export function priceValidator(): ValidatorFn {
  return (control) => {
    if (control.value === null || control.value === '' || control.value === undefined) {
      return null;
    }
    const n = Number(control.value);
    if (isNaN(n) || n < 0) {
      return { price: true };
    }
    return null;
  };
}

export function snakeCaseKeyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) { return null; } // let Validators.required handle empty
    // lowercase letters/numbers, words separated by single underscores,
    // no leading/trailing underscore, no spaces, no double underscores
    const valid = /^[a-z0-9]+(_[a-z0-9]+)*$/.test(value);
    return valid ? null : { snakeCase: true };
  };
}

export function maxQuantityValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) { return null; }
    const min = control.parent.get('min_quantity')?.value;
    const max = control.value;
    const hasBoth = min !== null && min !== '' && min !== undefined
      && max !== null && max !== '' && max !== undefined;
    return hasBoth && Number(max) < Number(min) ? { belowMin: true } : null;
  };
}