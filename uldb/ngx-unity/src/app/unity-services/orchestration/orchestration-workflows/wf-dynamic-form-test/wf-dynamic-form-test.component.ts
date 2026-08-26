import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import {
  NodeDetailsArrayModel,
  nodeTypes,
} from '../orchestration-agentic-workflow-container/orchestration-agentic-workflow-container.type';
import {
  cloudAttributes,
  WfDynamicParamsService,
} from '../wf-dynamic-params/wf-dynamic-params.service';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { TitleCasePipe } from '@angular/common';
import { AimlRulesService } from 'src/app/unity-services/aiml-event-mgmt/aiml-rules/aiml-rules.service';
import { UserGroupType } from 'src/app/shared/SharedEntityTypes/user-mgmt.type';
import { WfDynamicContainerService } from '../wf-dynamic-container/wf-dynamic-container.service';
import { aimlTriggerData, ApiField, ApiSchema, ApiTab, ApiValidator, ApiVisibleWhen, chatData, DynamicField, DynamicSchema, DynamicTab, DynamicValidator, DynamicVisibleWhen, itsmTriggerData, manualData, scheduleData, taskNodeData, webhookData } from '../wf-dynamic-params/wf-dynamic-params.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { QueryBuilderComponent } from 'src/app/shared/query-builder/query-builder.component';
import { QueryBuilderConfig, QueryBuilderClassNames, RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';
import { queryBuilderClassNames } from 'src/app/unity-setup/unity-setup-notification-group/unity-setup-notification-group-crud/unity-setup-notification-group-crud.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'wf-dynamic-form-test',
  templateUrl: './wf-dynamic-form-test.component.html',
  styleUrls: ['./wf-dynamic-form-test.component.scss']
})
export class WfDynamicFormTestComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  contextVarHeader: boolean = false;
  middlePanelLogo: string = '';
  onClose!: (data: any, modalState?: { action?: 'save' | 'test' }) => void;
  updatedFormDatas: any;

  cloudAccount: any;
  credentials: any;

  createTicketForm!: FormGroup;

  updateTicketForm!: FormGroup;

  commentInTicketForm!: FormGroup;

  getTicketForm!: FormGroup;

  contextVars = [
    { key: 'workflow_id', value: '{{ workflow_id }}' },
    { key: 'workflow_name', value: '{{ workflow_name }}' },
    { key: 'execution_id', value: '{{ execution_id }}' },
    { key: 'execution_user', value: '{{ execution_user }}' },
    { key: 'now', value: "{{ now | strftime('%Y-%m-%d %H:%M:%S') }}" },
    { key: 'today', value: "{{ today | strftime('%Y-%m-%d') }}" },
    {
      key: 'yesterday',
      value: "{{ (today - timedelta(days=1)) | strftime('%Y-%m-%d') }}",
    },
  ];

  activeTab;
  nodeId: number;
  nodeData: NodeDetailsArrayModel;
  connectedNodes = [];
  modalName: string;
  accordionState: { [nodeId: number]: boolean } = {};
  propertiesForm: FormGroup;
  isPromptExpanded = false;
  inputPanelWidth = 220;
  outputPanelWidth = 230;
  collapsedPanelWidth = 38;
  inputPanelCollapsed = false;
  outputPanelCollapsed = false;
  expandedLabel;
  expandedFormControlName;
  tableListOptions = [];
  getTicketKeyList = [];
  commentFieldsList = [];
  updateTicketList = [];
  realTimeData;
  nodeOutput;
  workflowVarsData;
  workflowVarHeader: boolean = false;
  aimlData;
  triggerTypes = [
    'Manual Trigger',
    'Schedule Trigger',
    'Chat Trigger',
    'ITSM Event Trigger',
    'Webhook Trigger',
    'AIML Event Trigger'
  ];

  userGroups: UserGroupType[] = [];
  userList: string[] = [];

  private readonly minSidePanelWidth = 180;
  private readonly maxSidePanelWidth = 360;
  private readonly minMiddlePanelWidth = 280;
  private resizingSidePanel: 'input' | 'output' | null = null;
  private resizeStartX = 0;
  private resizeStartWidth = 0;

  nodeForm: FormGroup = this.fb.group({});
  dynamicSchema: DynamicSchema = { tabs: [] };

  formErrors: any = {};
  validationMessages: any = {};

  initialValues: Record<string, any> = {};
  private subscriptions: Subscription[] = [];
  dynamicOptionStore: Record<string, Array<{ label: string; value: any }>> = {};
  dynamicOptionLoading: Record<string, boolean> = {};

  queryBuilderConfig: QueryBuilderConfig;
  queryBuilderClassNames: QueryBuilderClassNames = queryBuilderClassNames;
  @ViewChild('queryBuilder') queryBuilder: QueryBuilderComponent;
  tagsAutocompleteItems: string[] = [];
  currentRuleSetValue: RuleSet;
  allowRuleset: boolean = true;
  allowCollapse: boolean = false;
  persistValueOnFieldChange: boolean = false;
  onSave!: (data: any, modalState?: any) => void;

  @ViewChild('nameInput') nameInput!: ElementRef;

  isNameEditing = false;
  editName = '';
  fieldModes: Record<string, 'normal' | 'expression'> = {};
  fieldValues: Record<string, { normal: any; expression: string }> = {};
  private fieldFormIds = new WeakMap<FormGroup, string>();
  private nextFieldFormId = 0;

  //condition builder 
  conditionTree: any = {
    type: 'group',
    condition: 'AND',
    children: []
  };
  jsonData = '';

  constructor(
    private fb: FormBuilder,
    private svc: WfDynamicParamsService,
    private containerSvc: WfDynamicContainerService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private el: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef,
    private titleCasePipe: TitleCasePipe,
    private http: HttpClient,
    private scheduleSvc: UnityScheduleService,
  ) { }

  ngOnInit(): void {
    console.log('INIT CONFIG', this.nodeData?.config);
    this.initializeDetails();
  }

  displayForm() {
    // const initialValues = Object.keys(this.initialValues || {}).length > 0 ? this.initialValues : this.extractInitialValues(this.nodeData?.config ?? {});
    // console.log('INITIAL VALUES', initialValues);
    this.loadDynamicSchema(this.jsonData);
    this.nodeId = this.nodeData?.isTool ? this.nodeData?.tool_id.split('-')[1] : this.nodeData?.node_id;
    this.changeTab(this.modalName ? this.modalName : 'properties');
  }

  initializeDetails() {
    if (this.nodeData?.config?.schedule_meta) {
      this.scheduleSvc.addOrEdit(this.nodeData.config.schedule_meta);
    } else {
      this.scheduleSvc.addOrEdit(null);
    }
  }

  private extractInitialValues(config: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const tabValues of Object.values(config ?? {})) {
      if (tabValues && typeof tabValues === 'object' && !Array.isArray(tabValues)) {
        Object.assign(result, tabValues);
      }
    }
    return result;
  }

  changeTab(val: string) {
    this.activeTab = val;
    this.cdr.detectChanges();
  }

  loadDynamicSchema(apiSchema: any, values: Record<string, any> = {}): void {
    const parsedSchema = this.parseSchemaInput(apiSchema);
    if (!parsedSchema) {
      return;
    }

    this.dynamicOptionStore = {};
    this.dynamicOptionLoading = {};
    this.initialValues = values || {};
    this.dynamicSchema = this.normalizeSchema(parsedSchema);

    this.nodeForm = this.fb.group({});
    this.formErrors = {};
    this.validationMessages = {};
    this.fieldModes = {};
    this.fieldValues = {};
    this.fieldFormIds = new WeakMap<FormGroup, string>();
    this.nextFieldFormId = 0;

    this.ensureControlsForSchema(this.nodeForm, this.dynamicSchema);
    this.initializeDynamicOptions();
    this.ensureActiveTab();
    this.bindFormErrorRefresh();
    const allFields = (this.dynamicSchema?.tabs || []).flatMap(tab => tab.fields || []);
    this.restoreFieldModes(this.nodeForm, allFields);
    this.markAllTouched(this.nodeForm);
    this.refreshFormErrors();
  }

  private parseSchemaInput(schemaInput: any): ApiSchema | null {
    let schema: any = schemaInput;

    if (schemaInput && typeof schemaInput === 'object') {
      schema = schemaInput;
    } else if (typeof schemaInput !== 'string' || !schemaInput.trim()) {
      this.notification.error(new Notification('Please paste a valid JSON schema.'));
      return null;
    } else {
      try {
        schema = JSON.parse(schemaInput);
      } catch {
        this.notification.error(new Notification('Invalid JSON. Please check the schema and try again.'));
        return null;
      }
    }

    if (Array.isArray(schema)) {
      schema = { tabs: schema };
    } else if (!Array.isArray(schema?.tabs) && Array.isArray(schema?.data?.tabs)) {
      schema = schema.data;
    } else if (!Array.isArray(schema?.tabs) && Array.isArray(schema?.schema?.tabs)) {
      schema = schema.schema;
    }

    if (!Array.isArray(schema?.tabs)) {
      this.notification.error(new Notification('Schema JSON must contain a tabs array.'));
      return null;
    }

    return schema;
  }

  private bindFormErrorRefresh(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];

    this.subscriptions.push(
      this.nodeForm.valueChanges.subscribe(() => this.refreshFormErrors()),
      this.nodeForm.statusChanges.subscribe(() => this.refreshFormErrors())
    );
  }

  private normalizeSchema(schema: ApiSchema): DynamicSchema {
    return {
      tabs: (schema?.tabs || []).map((tab: ApiTab) => ({
        id: tab.id || 'properties',
        label: tab.label || 'Properties',
        fields: this.normalizeFields(tab.fields || [])
      }))
    };
  }

  private normalizeFields(fields: ApiField[]): DynamicField[] {
    return (fields || []).map((field: ApiField & Partial<DynamicField> & {
      name?: string;
      controlLabel?: string;
      default_value?: any;
      value?: any;
    }) => {
      const normalized: DynamicField = {
        // Workflow schemas in the wild use all three forms. Resolve them to the
        // single name expected by Angular's reactive-form bindings.
        control_name: field.key || field.control_name || field.name || '',
        type: this.normalizeFieldType(field.type, field.fields),
        label: field.label || field.controlLabel,
        placeholder: field.placeholder,
        helpText: field.help_text ?? field.helpText,
        maxlength: field.max_length ?? field.maxlength,
        rows: field.rows,
        default: field.default ?? field.default_value ?? field.value,
        disabled: field.disabled,
        add_button_label: field.add_label ?? field.add_button_label,
        min_items: field.min_items,
        options: field.options || [],
        multiselect_properties: field.multiselect_properties,
        options_api: field.options_api || null,
        show_add_remove: field.show_add_remove ?? true,
        validators: this.normalizeValidators(field.validators),
        visible_when: this.normalizeVisibleWhen(field.visible_when),
        clear_on_hide: field.clear_on_hide ?? false,
        width: field.width ?? 'full',
        fields: field.fields?.length ? this.normalizeFields(field.fields) : undefined
      };
      return normalized;
    });
  }
  private normalizeFieldType(type?: string, childFields?: ApiField[]): string {
    if (type === 'textarea' || type === 'text-area') {
      return 'text_area';
    }

    if (type === 'form_array' || type === 'form-array') {
      return 'array';
    }

    if (type) {
      return type;
    }

    return childFields?.length ? 'array' : 'text';
  }

  private normalizeValidators(validators: any): any {
    if (!Array.isArray(validators)) {
      return validators;
    }

    return validators.map((validator: ApiValidator) => ({
      ...validator,
      type: this.normalizeValidatorType(validator.type)
    }));
  }

  private normalizeValidatorType(type: string): string {
    switch (type) {
      case 'min_length':
        return 'minlength';
      case 'max_length':
        return 'maxlength';
      case 'minLength':
        return 'minlength';
      case 'maxLength':
        return 'maxlength';
      default:
        return type;
    }
  }

  private normalizeVisibleWhen(visibleWhen: any): any {
    if (!visibleWhen) {
      return null;
    }

    const normalizeOne = (condition: ApiVisibleWhen): DynamicVisibleWhen => {
      const controlName = condition.control_name || condition.field || '';
      const operator = condition.operator as string;

      if (operator === 'neq') {
        return {
          control_name: controlName,
          not_value: condition.value
        };
      }

      if (operator === 'nin') {
        return {
          control_name: controlName,
          not_value: condition.value // array → "not in this list"
        };
      }

      if (operator === 'in') {
        return {
          control_name: controlName,
          value: condition.value,
          is_in: true // array → "in this list" (distinguishes from plain eq)
        };
      }

      return {
        control_name: controlName,
        value: condition.value
      };
    };

    return Array.isArray(visibleWhen)
      ? visibleWhen.map(normalizeOne)
      : normalizeOne(visibleWhen);
  }

  get visibleTabs(): DynamicTab[] {
    return (this.dynamicSchema?.tabs || []).filter(tab => !!tab.fields?.length);
  }

  get activeFields(): DynamicField[] {
    const active = this.visibleTabs.find(tab => tab.id === this.activeTab) || this.visibleTabs[0];
    return active?.fields || [];
  }

  private ensureActiveTab(): void {
    const tabs = this.visibleTabs;
    if (!tabs.length) {
      this.activeTab = 'properties';
      return;
    }

    if (!tabs.some(tab => tab.id === this.activeTab)) {
      this.activeTab = tabs[0].id;
    }
  }

  private ensureControlsForSchema(form: FormGroup, schema: DynamicSchema): void {
    (schema?.tabs || []).forEach(tab => {
      (tab.fields || []).forEach(field => {
        this.ensureFieldControl(form, field);
        this.ensureFieldValidationState(field);
      });
    });
  }

  private ensureFieldControl(form: FormGroup, field: DynamicField): void {
    if (!field?.control_name) {
      return;
    }

    const type = this.getDynamicFieldType(field);

    if (type === 'array') {
      if (!form.get(field.control_name)) {
        const formArray = this.createInitialArray(field);
        form.addControl(field.control_name, formArray);
      }
      return;
    }

    if (!form.get(field.control_name)) {
      const initialValue = this.getInitialFieldValue(
        field,
        this.initialValues?.[field.control_name]
      );
      const disabled = field.disabled === true;

      form.addControl(
        field.control_name,
        this.fb.control(
          { value: initialValue, disabled },
          this.getValidatorsFromField(field)
        )
      );
    }
  }

  private createInitialArray(field: DynamicField): FormArray {
    const existingItems = Array.isArray(this.initialValues?.[field.control_name]) ? this.initialValues[field.control_name] : Array.isArray(this.initialValues?.properties?.[field.control_name]) ? this.initialValues.properties[field.control_name] : [];

    const groups = existingItems.map((item: any) =>
      this.createArrayItemGroup(field.fields || [], item)
    );

    // Pad up to min_items with empty groups
    const minItems = field.min_items || 0;
    while (groups.length < minItems) {
      groups.push(this.createArrayItemGroup(field.fields || []));
    }


    return this.fb.array(groups, this.getArrayValidatorsFromField(field));
  }

  private createNestedArray(field: DynamicField, existingValue: any): FormArray {
    const items = Array.isArray(existingValue) ? existingValue : [];

    const groups = items.map((item: any) =>
      this.createArrayItemGroup(field.fields || [], item)
    );

    return this.fb.array(groups, this.getArrayValidatorsFromField(field));
  }

  addDynamicArrayItem(field: DynamicField, form: FormGroup): void {
    const array = this.getDynamicFormArray(form, field.control_name);
    if (!array) {
      return;
    }

    array.push(this.createArrayItemGroup(field.fields || []));
    this.refreshFormErrors();
  }

  private createArrayItemGroup(fields: DynamicField[], itemValue: any = {}): FormGroup {
    const group = this.fb.group({});

    (fields || []).forEach(field => {
      if (!field.control_name) {
        return;
      }

      if (this.getDynamicFieldType(field) === 'array') {
        const nestedArray = this.createNestedArray(field, itemValue?.[field.control_name]);
        group.addControl(field.control_name, nestedArray);
        return;
      }

      group.addControl(
        field.control_name,
        this.fb.control(
          this.getInitialFieldValue(field, itemValue?.[field.control_name]),
          this.getValidatorsFromField(field)
        )
      );
    });

    return group;
  }

  private ensureFieldValidationState(field: DynamicField): void {
    if (!field?.control_name) {
      return;
    }

    const type = this.getDynamicFieldType(field);

    if (this.formErrors[field.control_name] === undefined) {
      this.formErrors[field.control_name] = type === 'array' ? [] : '';
    }

    if (this.validationMessages[field.control_name] === undefined) {
      this.validationMessages[field.control_name] = this.getFieldValidationMessages(field);
    }

    if (type === 'array' && field.fields?.length) {
      this.validationMessages[field.control_name] = field.fields.reduce((acc: any, child) => {
        acc[child.control_name] = this.getFieldValidationMessages(child);
        return acc;
      }, {});
    }
  }

  private getInitialFieldValue(field: DynamicField, explicitValue: any): any {
    if (explicitValue !== undefined) {
      return explicitValue;
    }

    if (field.default !== undefined) {
      return field.default;
    }

    switch (field.type) {
      case 'checkbox':
        return false;
      case 'multiselect':
        return [];
      default:
        return '';
    }
  }

  private getValidatorsFromField(field: DynamicField): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (field.maxlength) {
      validators.push(Validators.maxLength(field.maxlength));
    }
    if (Array.isArray(field.validators)) {
      field.validators.forEach((validator: DynamicValidator) => {
        switch (validator.type) {
          case 'required':
            validators.push(Validators.required);
            break;
          case 'pattern':
            validators.push(Validators.pattern(validator.value));
            break;
          case 'min':
            validators.push(Validators.min(validator.value));
            break;
          case 'max':
            validators.push(Validators.max(validator.value));
            break;
          case 'json':
            validators.push(this.jsonValidator());
            break;
        }
      });
      return validators;
    }
    if (field.validators?.required) {
      validators.push(Validators.required);
    }
    if (field.validators?.pattern) {
      validators.push(Validators.pattern(field.validators.pattern));
    }
    if (field.validators?.min !== undefined) {
      validators.push(Validators.min(field.validators.min));
    }
    if (field.validators?.max !== undefined) {
      validators.push(Validators.max(field.validators.max));
    }
    if (field.validators?.json) {
      validators.push(this.jsonValidator());
    }
    if (field.control_name === 'param_name') {
      validators.push(this.paramNameValidator());
    }
    return validators;
  }

  private getArrayValidatorsFromField(field: DynamicField): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (field.min_items) {
      validators.push(Validators.minLength(field.min_items));
    }
    const hasParamName = field.fields?.some(f => f.control_name === 'param_name');
    if (hasParamName) {
      validators.push(this.uniqueParamNameValidator('param_name'));
    }
    return validators;
  }

  private getFieldValidationMessages(field: DynamicField): any {
    const label = field.label || this.prettify(field.control_name);
    const messages: any = {
      required: `${label} is required.`,
      pattern: `${label} is invalid.`,
      min: `${label} is below the minimum allowed value.`,
      max: `${label} exceeds the maximum allowed value.`,
      json: `${label} must be valid JSON.`,
      paramName: `${label} must start with a letter or underscore, not a number or special character.`
    };
    if (Array.isArray(field.validators)) {
      field.validators.forEach((validator: DynamicValidator) => {
        if (validator.message) {
          messages[validator.type] = validator.message;
        }
      });
    }
    return messages;
  }
  private getAllValidationMessages(): string[] {
    const messages: string[] = [];
    (this.dynamicSchema?.tabs || []).forEach(tab => {
      this.collectFieldMessages(this.nodeForm, tab.fields || [], messages);
    });
    return messages;
  }
  private paramNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const invalid = /^[^a-zA-Z_]/.test(control.value);
      return invalid ? { paramName: true } : null;
    };
  }

  private uniqueParamNameValidator(controlName: string): ValidatorFn {
    return (array: AbstractControl): ValidationErrors | null => {
      const formArray = array as FormArray;
      const values = formArray.controls
        .map(group => (group as FormGroup).get(controlName)?.value)
        .filter(v => !!v);
      const hasDuplicates = values.some((v, i) => values.indexOf(v) !== i);
      return hasDuplicates ? { uniqueParamName: true } : null;
    };
  }

  private jsonValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      try {
        JSON.parse(control.value);
        return null;
      } catch {
        return { json: true };
      }
    };
  }


  private collectFieldMessages(form: FormGroup, fields: DynamicField[], messages: string[], prefix: string = ''): void {
    fields.forEach(field => {
      if (this.getDynamicFieldType(field) === 'array') {
        const formArray = form.get(field.control_name) as FormArray;
        if (formArray) {
          if (formArray.errors?.['uniqueParamName']) {
            messages.push(`${field.label || field.control_name}: param_name must be unique across all items.`);
          }
          formArray.controls.forEach((control, index) => {
            this.collectFieldMessages(
              control as FormGroup,
              field.fields || [],
              messages,
              `${field.label || field.control_name}[${index + 1}]`
            );
          });
        }
        return;
      }
      const control = form.get(field.control_name);
      if (control?.invalid && control.errors) {
        const fieldMessages = this.getFieldValidationMessages(field);
        Object.keys(control.errors).forEach(errorKey => {
          const message = fieldMessages[errorKey] || `${field.control_name} is invalid.`;
          messages.push(prefix ? `${prefix} > ${message}` : message);
        });
      }
    });
  }
  private prettify(value: string): string {
    return (value || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, ch => ch.toUpperCase());
  }

  getDynamicFieldType(field: DynamicField): string {
    return field?.type || (field?.fields?.length ? 'array' : 'text');
  }

  getDynamicControl(form: FormGroup, controlName: string): FormControl {
    return form.get(controlName) as FormControl;
  }

  getDynamicFormArray(form: FormGroup, controlName: string): FormArray {
    return form.get(controlName) as FormArray;
  }

  asDynamicFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  getDynamicOptions(field: DynamicField, form?: FormGroup): any[] {
    if (field.options_api && form) {
      const cacheKey = this.getDynamicOptionsCacheKey(field, form);
      return this.dynamicOptionStore[cacheKey] || [];
    }
    return Array.isArray(field?.options) ? field.options : [];
  }

  isDynamicOptionsLoading(field: DynamicField, form?: FormGroup): boolean {
    if (!field.options_api || !form) {
      return false;
    }

    const cacheKey = this.getDynamicOptionsCacheKey(field, form);
    return !!this.dynamicOptionLoading[cacheKey];
  }

  getDynamicOptionValue(option: any, field?: DynamicField): any {
    if (option === null || option === undefined || typeof option !== 'object') {
      return option;
    }

    // Use value_key from options_api if available
    if (field?.options_api?.value_key) {
      const val = this.readPath(option, field.options_api.value_key);
      if (val !== undefined) return val;
    }

    return option.value ?? option.uuid ?? option.id ?? option.name ?? option;
  }

  getDynamicOptionLabel(option: any, field?: DynamicField): string {
    if (option === null || option === undefined || typeof option !== 'object') {
      return String(option);
    }

    // Use label_key from options_api if available
    if (field?.options_api?.label_key) {
      const val = this.readPath(option, field.options_api.label_key);
      if (val !== undefined) return String(val);
    }

    return option.label ?? option.name ?? option.display_name ?? option.account_name ?? String(option);
  }

  getDynamicTooltip(field: DynamicField): string {
    return field?.helpText || '';
  }

  isDynamicFieldVisible(field: DynamicField, form: FormGroup): boolean {
    if (!field || !form) return false;
    const visible = this.evaluateVisibleWhen(field.visible_when, form);

    if (!visible && field.clear_on_hide !== false) {
      const control = form.get(field.control_name);
      if (control && control.value !== '' && control.value !== null) {
        setTimeout(() => {
          control.setValue('');
          this.refreshFormErrors();
        });
      }
    }

    return visible;
  }

  private initializeDynamicOptions(): void {
    (this.dynamicSchema?.tabs || []).forEach(tab => {
      this.walkFieldContexts(this.nodeForm, tab.fields || [], (field, form) => {
        if (!field.options_api) {
          return;
        }

        if (!this.evaluateVisibleWhen(field.visible_when, form)) {
          return;
        }

        const cacheKey = this.getDynamicOptionsCacheKey(field, form);

        // ← If already in service cache, sync to local store and skip API
        const cached = this.containerSvc.getOptionCache(cacheKey);
        if (cached) {
          this.dynamicOptionStore[cacheKey] = cached;
          return;
        }

        const dependsOn = field.options_api.depends_on;
        if (!dependsOn || dependsOn === '') {
          this.loadOptionsForField(field, form);
          return;
        }

        const dependsValue = form.get(dependsOn)?.value;
        if (dependsValue !== undefined && dependsValue !== null && dependsValue !== '') {
          this.loadOptionsForField(field, form);
        }
      });
    });
  }

  private loadDependentOptionsForFormGroup(targetForm: FormGroup, changedControlName: string): void {
    (this.dynamicSchema?.tabs || []).forEach(tab => {
      this.walkFieldContexts(this.nodeForm, tab.fields || [], (field, form) => {
        if (form !== targetForm) {
          return;
        }
        if (field.type === 'select' && field.options_api?.depends_on === changedControlName) {
          const isVisible = this.evaluateVisibleWhen(field.visible_when, form);
          if (isVisible) {
            this.loadOptionsForField(field, form);
          }
        }
      });
    });
  }

  private walkFieldContexts(
    form: FormGroup,
    fields: DynamicField[],
    callback: (field: DynamicField, currentForm: FormGroup) => void
  ): void {
    (fields || []).forEach(field => {
      callback(field, form);

      if (this.getDynamicFieldType(field) === 'array') {
        const formArray = form.get(field.control_name) as FormArray;
        if (!formArray?.controls?.length) {
          return;
        }

        formArray.controls.forEach(control => {
          this.walkFieldContexts(control as FormGroup, field.fields || [], callback);
        });
      }
    });
  }

  private loadOptionsForField(field: DynamicField, form: FormGroup): void {
    const endpoint = this.resolveDynamicEndpoint(field, form);
    const cacheKey = this.getDynamicOptionsCacheKey(field, form);
    const control = form.get(field.control_name);

    if (!endpoint) {
      this.containerSvc.setOptionCache(cacheKey, []);  // ← replace this.dynamicOptionStore[cacheKey] = []
      return;
    }

    // ← Check service cache first, skip API call if already loaded
    const cached = this.containerSvc.getOptionCache(cacheKey);
    if (cached) {
      this.dynamicOptionStore[cacheKey] = cached;  // ← sync to local store for template binding
      return;
    }

    if (this.dynamicOptionLoading[cacheKey]) {
      return;
    }

    this.dynamicOptionLoading[cacheKey] = true;
    const valueBeforeLoad = control?.value;

    this.fetchDynamicOptions(field, form, endpoint).subscribe({
      next: (items: any[]) => {
        this.containerSvc.setOptionCache(cacheKey, items);
        this.dynamicOptionStore[cacheKey] = items;
        this.dynamicOptionLoading[cacheKey] = false;

        // Only reset if current value not in new options
        const validValues = items.map((o: any) => this.getDynamicOptionValue(o, field)); // ← was: o.value
        if (valueBeforeLoad && !validValues.includes(valueBeforeLoad)) {
          control?.setValue('');
        }
      },
      error: () => {
        this.containerSvc.setOptionCache(cacheKey, []);
        this.dynamicOptionStore[cacheKey] = [];
        this.dynamicOptionLoading[cacheKey] = false;
      }
    });
  }

  private fetchDynamicOptions(field: DynamicField, form: FormGroup, endpoint: string): Observable<any[]> {
    const config = field.options_api;
    const method = config?.method || 'GET';
    return this.http.get<any>(endpoint).pipe(
      map(response => this.extractOptionItems(response, config?.data_path)),
      catchError(() => of([]))
    );
  }

  private resolveDynamicEndpoint(field: DynamicField, form: FormGroup): string {
    const config = field.options_api;
    if (!config) {
      return '';
    }

    return config.endpoint || '';
  }

  private getDynamicOptionsCacheKey(field: DynamicField, form: FormGroup): string {
    const endpoint = this.resolveDynamicEndpoint(field, form);
    const dependsValue = field.options_api?.depends_on
      ? form.get(field.options_api.depends_on)?.value
      : '';
    return `${field.control_name}__${endpoint}__${String(dependsValue ?? '')}`;
  }

  private extractOptionItems(response: any, dataPath?: string): any[] {
    if (!dataPath) {
      if (Array.isArray(response)) {
        return response;
      }
      if (Array.isArray(response?.data)) {
        return response.data;
      }
      if (Array.isArray(response?.results)) {
        return response.results;
      }
      return [];
    }

    const value = this.readPath(response, dataPath);
    return Array.isArray(value) ? value : [];
  }

  private mapDynamicOptions(items: any[], field: DynamicField): Array<{ label: string; value: any }> {
    const labelKey = field.options_api?.label_key || 'label';
    const valueKey = field.options_api?.value_key || 'value';

    return (items || []).map(item => ({
      label:
        this.readPath(item, labelKey) ??
        item.label ??
        item.name ??
        item.account_name ??
        item.display_name ??
        String(item),
      value:
        this.readPath(item, valueKey) ??
        item.value ??
        item.uuid ??
        item.id ??
        item.name ??
        item
    }));
  }

  private readPath(obj: any, path: string): any {
    if (!obj || !path) {
      return undefined;
    }

    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  private evaluateVisibleWhen(visibleWhen: any, form: FormGroup): boolean {
    if (!visibleWhen) {
      return true;
    }

    const conditions = Array.isArray(visibleWhen) ? visibleWhen : [visibleWhen];

    // logic lives on the object, not the array — so read from original if object, default 'all' for arrays
    const logic = Array.isArray(visibleWhen)
      ? (visibleWhen.find(c => c.logic)?.logic ?? 'all')
      : (visibleWhen.logic ?? 'all');

    const results = conditions.map(condition => {
      const key = condition.field ?? condition.control_name;
      const controlValue = form.get(key)?.value;

      if (condition.operator === 'neq') {
        return Array.isArray(condition.value)
          ? !condition.value.includes(controlValue)
          : controlValue !== condition.value;
      }

      if (condition.value !== undefined) {
        return Array.isArray(condition.value)
          ? condition.value.includes(controlValue)
          : controlValue === condition.value;
      }

      if (condition.not_value !== undefined) {
        return Array.isArray(condition.not_value)
          ? !condition.not_value.includes(controlValue)
          : controlValue !== condition.not_value;
      }

      return true;
    });
    return logic === 'any' ? results.some(Boolean) : results.every(Boolean);
  }

  isDynamicFieldRequired(field: DynamicField): boolean {
    if (Array.isArray(field?.validators)) {
      return field.validators.some(v => v?.type === 'required');
    }

    return field?.validators?.required === true;
  }

  removeDynamicArrayItem(field: DynamicField, index: number, form: FormGroup): void {
    const array = this.getDynamicFormArray(form, field.control_name);
    if (!array) {
      return;
    }

    array.removeAt(index);
    this.refreshFormErrors();
  }

  onDynamicFieldChange(field: DynamicField, form?: FormGroup): void {
    const currentForm = form || this.nodeForm;
    this.loadDependentOptionsForFormGroup(currentForm, field.control_name);
    this.refreshFormErrors();
  }

  getDynamicError(
    errors: any,
    field: DynamicField,
    arrayName?: string,
    index?: number,
    controlName?: string
  ): string {
    const key = controlName || field?.control_name;

    if (!errors || !key) {
      return '';
    }

    if (arrayName !== undefined && index !== undefined) {
      const arrayErrors = errors?.[arrayName];
      if (Array.isArray(arrayErrors)) {
        return arrayErrors[index]?.[key] || '';
      }
      return '';
    }

    return errors?.[key] || '';
  }

  getDynamicArrayErrors(errors: any, arrayName: string, index: number): any {
    const arrayErrors = errors?.[arrayName];
    return Array.isArray(arrayErrors) ? (arrayErrors[index] || {}) : {};
  }

  private refreshFormErrors(): void {
    this.formErrors = this.buildErrorsForTabs(this.nodeForm, this.dynamicSchema.tabs || []);
  }

  private buildErrorsForTabs(form: FormGroup, tabs: DynamicTab[]): any {
    const result: any = {};

    tabs.forEach(tab => {
      const tabErrors = this.buildErrorsForFields(form, tab.fields || []);
      Object.keys(tabErrors).forEach(key => {
        result[key] = tabErrors[key];
      });
    });

    return result;
  }

  private buildErrorsForFields(form: FormGroup, fields: DynamicField[]): any {
    const result: any = {};
    (fields || []).forEach(field => {
      if (!field.control_name) {
        return;
      }
      if (this.getDynamicFieldType(field) === 'array') {
        const array = form.get(field.control_name) as FormArray;
        if (array?.errors?.['uniqueParamName']) {
          result[`${field.control_name}_error`] = `${field.label || field.control_name}: param_name must be unique across all items.`;
        }
        result[field.control_name] = Array.isArray(array?.controls)
          ? array.controls.map(ctrl => this.buildErrorsForFields(ctrl as FormGroup, field.fields || []))
          : [];
        return;
      }
      const control = form.get(field.control_name);
      result[field.control_name] = this.getControlErrorMessage(control, field);
    });
    return result;
  }

  private getControlErrorMessage(control: AbstractControl | null, field: DynamicField): string {
    if (!control || !control.errors || !(control.touched || control.dirty)) {
      return '';
    }
    const messages = this.validationMessages[field.control_name] || this.getFieldValidationMessages(field);
    const errorKeys = Object.keys(control.errors);
    if (!errorKeys.length) {
      return '';
    }
    return messages[errorKeys[0]] || `${field.label || field.control_name} is invalid.`;
  }

  onDateChange(event: { value: Date | null }, field: any, form: AbstractControl): void {
    const date = event.value;
    if (!date) {
      form.get(field.control_name)?.setValue(null, { emitEvent: true });
      return;
    }

    if (field.type === 'date') {
      // Store as ISO date string e.g. "2025-06-04"
      const iso = date.toISOString().split('T')[0];
      form.get(field.control_name)?.setValue(iso, { emitEvent: true });
    } else {
      // Store as full ISO string e.g. "2025-06-04T14:30:00.000Z"
      form.get(field.control_name)?.setValue(date.toISOString(), { emitEvent: true });
    }
  }

  private markAllTouched(control: AbstractControl): void {
    if (control instanceof FormControl) {
      control.markAsTouched();
      control.updateValueAndValidity();
      return;
    }

    if (control instanceof FormGroup) {
      Object.values(control.controls).forEach(child => this.markAllTouched(child));
      return;
    }

    if (control instanceof FormArray) {
      control.controls.forEach(child => this.markAllTouched(child));
    }
  }

  getFieldMode(field: DynamicField, form: FormGroup): 'normal' | 'expression' {
    const key = this.getFieldStateKey(field, form);
    if (key in this.fieldModes) {
      return this.fieldModes[key];
    }
    // Default to normal for saved plain values. Dropped workflow/node values are
    // stored as template tokens, so only those reopen in expression mode.
    const raw = form.get(field.control_name)?.value;
    if (raw === null || raw === undefined || raw === '') {
      return 'normal';
    }
    return this.isDroppedExpressionValue(raw) ? 'expression' : 'normal';
  }

  setFieldMode(field: DynamicField, form: FormGroup, mode: 'normal' | 'expression'): void {
    const key = this.getFieldStateKey(field, form);
    const currentMode = this.getFieldMode(field, form);
    if (currentMode === mode) {
      return; // no-op, nothing to switch
    }
    const control = form.get(field.control_name);
    const currentVal = control?.value;
    const currentText = this.stripNormalPrefix(currentVal);

    if (!this.fieldValues[key]) {
      this.fieldValues[key] = { normal: '', expression: '' };
    }
    // Stash whatever was in the tab we're leaving, always stored WITHOUT '=' prefix
    this.fieldValues[key][currentMode] = currentText;

    this.fieldModes[key] = mode;

    // Pull back whatever was previously typed in the tab we're entering
    const restoreText = this.fieldValues[key][mode] ?? '';
    control?.setValue(mode === 'normal' ? this.toNormalValue(restoreText) : restoreText);
    this.refreshFormErrors();
  }

  onNormalInput(event: Event, field: DynamicField, form: FormGroup): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value;
    const text = raw.startsWith('=') ? raw.slice(1) : raw; // store WITHOUT prefix internally
    const val = '=' + text;
    form.get(field.control_name)?.setValue(val, { emitEvent: true });
    const key = this.getFieldStateKey(field, form);
    if (!this.fieldValues[key]) {
      this.fieldValues[key] = { normal: '', expression: '' };
    }
    this.fieldValues[key].normal = text;
  }

  onExprInput(event: Event, field: DynamicField, form: FormGroup): void {
    const input = event.target as HTMLInputElement;
    const val = input.value;
    form.get(field.control_name)?.setValue(val, { emitEvent: true });
    const key = this.getFieldStateKey(field, form);
    if (!this.fieldValues[key]) {
      this.fieldValues[key] = { normal: '', expression: '' };
    }
    this.fieldModes[key] = 'expression';
    this.fieldValues[key].expression = val;
  }

  getDisplayValue(field: DynamicField, form: FormGroup): string {
    const raw = form.get(field.control_name)?.value;
    const val: string = typeof raw === 'string' ? raw : JSON.stringify(raw ?? '');
    // Always strip '=' prefix for display — both normal and expression store it internally
    return val.startsWith('=') ? val.slice(1) : val;
  }

  private restoreFieldModes(form: FormGroup, fields: DynamicField[]): void {
    fields.forEach(field => {
      const type = this.getDynamicFieldType(field);
      if (type === 'array' && field.fields?.length) {
        const formArray = form.get(field.control_name) as FormArray;
        formArray?.controls.forEach(ctrl => {
          this.restoreFieldModes(ctrl as FormGroup, field.fields!);
        });
      }
      if (!['text', 'text_area', 'number', 'checkbox', 'radio', 'select', 'password', 'multiselect', 'target_search'].includes(type)) return;

      const key = this.getFieldStateKey(field, form);
      const raw = form.get(field.control_name)?.value;

      const isEmpty = raw === null || raw === undefined || raw === '';
      const val: string = isEmpty ? '' : (typeof raw === 'string' ? raw : JSON.stringify(raw));
      const isExpression = !isEmpty && this.isDroppedExpressionValue(val);

      this.fieldModes[key] = isExpression ? 'expression' : 'normal';

      this.fieldValues[key] = {
        normal: isExpression ? '' : this.stripNormalPrefix(val),
        expression: isExpression ? val : ''
      };
    });
  }

  private getFieldStateKey(field: DynamicField, form: FormGroup): string {
    if (!this.fieldFormIds.has(form)) {
      this.fieldFormIds.set(form, `form_${++this.nextFieldFormId}`);
    }
    return `${this.fieldFormIds.get(form)}.${field.control_name}`;
  }

  private stripNormalPrefix(value: any): string {
    const text = typeof value === 'string' ? value : this.getDisplayText(value);
    return text.startsWith('=') ? text.slice(1) : text;
  }

  private toNormalValue(value: any): string {
    const text = this.stripNormalPrefix(value);
    return text ? `${text}` : '';
  }

  private isDroppedExpressionValue(value: any): boolean {
    const text = this.getDisplayText(value).trim();
    return !!text && !text.startsWith('=') && /\{\{[\s\S]*\}\}/.test(text);
  }

  private getDisplayText(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    return typeof value === 'string' ? value : JSON.stringify(value);
  }

  /////////////////////////////////////////////////////////////// START CONDITION BUILDER ///////////////////////////////////////////////////////
  // Don't Add anything until you see End Condition builder comment

  getColClass(field: any) {
    switch (field?.width) {
      case 'half':
        return 'col-md-6';
      case 'full':
        return 'col-md-12';
      case 'auto':
        return 'col-auto';
      default:
        return 'col-md-12';
    }
  }

  getConditionTree(field) {
    if (!field._conditionTree) {
      field._conditionTree = {
        type: 'group',
        condition: 'AND',
        children: []
      };
      const minConditions = field.min_conditions || 1;
      for (let i = 0; i < minConditions; i++) {
        field._conditionTree.children.push(this.createRule());
      }
    }
    return field._conditionTree;
  }

  createRule() {
    return {
      type: 'rule',
      field: '',
      data_type: 'string',
      operator: 'eq',
      value: '',
      ignoreCase: false
    };
  }

  addRule(group: any) {
    group.children.push(this.createRule());
  }

  addGroup(group: any) {
    group.children.push({
      type: 'group',
      condition: 'AND',
      children: [this.createRule()]
    });
  }

  removeChild(parentGroup: any, index: number, field: any) {
    const min = parentGroup === this.getConditionTree(field) ? (field.min_conditions || 1) : 1;
    if (parentGroup.children.length <= min) {
      return;
    }
    parentGroup.children.splice(index, 1);
  }

  getOperatorOptions(conditionField: any, rule: any) {
    const operators = conditionField?.fields?.filter(
      (f: any) =>
        f.control_name === 'operator' &&
        this.isVisible(f, rule)
    );
    return operators?.[0]?.options || [];
  }

  onDataTypeChange(conditionField: any, rule: any, value: string) {
    rule.data_type = value;
    const operators = this.getOperatorOptions(conditionField, rule);
    rule.operator = operators?.[0]?.value || '';
    this.cdr.detectChanges();
  }

  isVisible(field: any, rule: any): boolean {
    if (!field.visible_when) return true;
    const conditions = Array.isArray(field.visible_when) ? field.visible_when : [field.visible_when];

    return conditions.every((condition: any) => {
      let currentValue: any;
      switch (condition.control_name) {
        case 'dataType':
        case 'data_type':
        case 'datat_type':
          currentValue = rule.data_type;
          break;
        case 'operator':
          currentValue = rule.operator;
          break;
        default:
          currentValue = rule[condition.control_name];
      }

      if (Array.isArray(condition.not_value)) {
        return !condition.not_value.includes(currentValue);
      }
      if (Array.isArray(condition.value)) {
        return condition.is_in
          ? condition.value.includes(currentValue)
          : !condition.value.includes(currentValue);
      }

      return currentValue === condition.value;
    });
  }

  getFieldByKey(conditionField: any, key: string) {
    return conditionField?.fields?.find(
      (f: any) => f.control_name === key
    );
  }

  getDataTypeField(conditionField: any) {
    return conditionField?.fields?.find(
      (f: any) => f.control_name === 'data_type'
    );
  }

  getOperatorField(conditionField: any, rule: any) {
    return conditionField?.fields?.find(
      (f: any) =>
        f.control_name === 'operator' &&
        this.isVisible(f, rule)
    );
  }

  getDataTypeOptions(conditionField: any) {
    return (
      conditionField?.fields?.find(
        (x: any) => x.control_name === 'data_type'
      )?.options || []
    );
  }

  getValueField(conditionField: any, rule: any) {
    const valueFields =
      conditionField?.fields?.filter(
        (f: any) => f.control_name === 'value'
      ) || [];
    return valueFields.find((field: any) =>
      this.isVisible(field, rule)
    );
  }

  showIgnoreCase(conditionField: any, rule: any) {
    const ignoreCaseField =
      conditionField?.fields?.find(
        (f: any) => f.control_name === 'ignoreCase'
      );
    if (!ignoreCaseField) return false;
    return this.isVisible(ignoreCaseField, rule);
  }
  // Generates a short random id like "6ranf", "vlqsv" etc.
  private generateId(): string {
    return Math.random().toString(36).substring(2, 7);
  }

  // Converts internal conditionTree (type/condition/data_type) 
  // into backend payload shape (logic/dataType, with ids)
  buildConditionPayload(node: any): any {
    if (!node) return null;

    if (node.type === 'group') {
      return {
        id: this.generateId(),
        logic: (node.condition || 'AND').toLowerCase(),
        children: (node.children || [])
          .map((child: any) => this.buildConditionPayload(child))
          .filter((c: any) => c !== null)
      };
    }

    // rule
    return {
      id: this.generateId(),
      field: node.field ?? '',
      dataType: node.data_type ?? 'string',
      operator: node.operator ?? 'eq',
      value: node.value ?? ''
    };
  }
  /////////////////////////////////////////////////////////////// END CONDITION BUILDER ///////////////////////////////////////////////////////

}
