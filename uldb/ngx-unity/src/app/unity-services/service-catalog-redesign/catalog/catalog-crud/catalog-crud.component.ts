import { HttpErrorResponse } from '@angular/common/http';
import { getCurrencySymbol } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { catchError, takeUntil } from 'rxjs/operators';
import { CATALOG_ACCORDION_SECTIONS, CatalogAccordionSection, CatalogDatacenter, CatalogItemPayload, CatalogMeta, CONFIG_FIELD_TYPES, COST_COMPONENT_ALLOWED_KEYS, CostComponent, FinopsBuildingBlock, FREQUENCY_FACTOR, FREQUENCY_OPTIONS, normalizeParamType, OPTION_TYPES, ParamControlKind, PLACEHOLDER_TYPES, POLICY_TYPES, RANGE_TYPES, SUPPORT_LEVELS, TaskDropdownItem, VALIDATOR_TYPES, WorkflowDropdownItem, WorkflowVersion } from './catalog-crud.type';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CatalogCrudService } from './catalog-crud.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { Observable, of, Subject } from 'rxjs';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { CatalogService } from '../catalog.service';

@Component({
  selector: 'catalog-crud',
  templateUrl: './catalog-crud.component.html',
  styleUrls: ['./catalog-crud.component.scss']
})
export class CatalogCrudComponent implements OnInit {
  private ngUnsubscribe = new Subject<void>();

  form: FormGroup;
  formErrors: any = {};
  formValidationMessages: any;

  catalogId: string;
  catalogData: CatalogItemPayload;
  meta: CatalogMeta = {
    category: [], platform: [], management_type: [],
    billing_model: [], frequency: [], pricing_basis: [], automation_type: [], finops_block: []
  };
  datacenters: CatalogDatacenter[] = [];

  policyTypes = POLICY_TYPES;
  supportLevels = SUPPORT_LEVELS;
  configFieldTypes = CONFIG_FIELD_TYPES;
  validatorTypes = VALIDATOR_TYPES;
  configOptionsForCostComponent: { key: string; label: string }[] = [];

  openSections: { [key in CatalogAccordionSection]?: boolean } = { descriptive: true };

  submitAttempted = false;
  payloadPreview = '';
  problems: string[] = [];
  action: string;
  accordionSections = CATALOG_ACCORDION_SECTIONS;
  tasks: TaskDropdownItem[] = [];
  workflows: WorkflowDropdownItem[] = [];
  versionWorkflows: WorkflowVersion[] = [];
  private activeAutomationType: 'Task' | 'Workflow' = 'Task';
  private automationMappings: { Task: any[]; Workflow: any[] } = { Task: [], Workflow: [] };
  private automationMappingsInitialized: { Task: boolean; Workflow: boolean } = {
    Task: false,
    Workflow: false
  };

  finopsOptions: FinopsBuildingBlock;
  loadingFinops = false;
  costComponentTotal = 0;
  costComponentHasError = false;
  loadingCostComponents = false;
  frequencyOptions = FREQUENCY_OPTIONS;

  cloudAccounts: any[] = [];
  credentials: any[] = [];

  logoUploadError = '';
  logoPreviewUrl: string | null = null;
  logoFileName: string | null = null;

  datacenterOptions: { value: string, label: string }[] = [];
  selectedDatacenters: string[] = [];
  configFieldErrors: { key: string; label: string; type: string }[] = [];

  private readonly FIELD_SECTION_MAP: { [key: string]: CatalogAccordionSection } = {
    name: 'descriptive',
    description: 'descriptive',
    logo: 'descriptive',
    category: 'descriptive',
    platform: 'descriptive',
    service: 'descriptive',
    datacenter: 'descriptive',
    management_type: 'descriptive',
    use_cases: 'descriptive',
    key_features: 'descriptive',
    require_approval: 'descriptive',

    configuration: 'configuration',

    billing_model: 'billing',
    finops_block: 'billing',
    price: 'billing',
    frequency: 'billing',
    currency: 'billing',
    cost_mapping: 'billing',

    sla: 'sla',

    policies: 'governance',
    requirements: 'governance',

    is_available: 'availability',
    allow_quantity: 'availability',
    min_quantity: 'availability',
    max_quantity: 'availability',

    automation_type: 'automation',
    task: 'automation',
    workflow: 'automation',
    workflow_version: 'automation',
    input_mapping: 'automation'
  };

  datacenterSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: false,
    keyToSelect: 'value'
  };

  datacenterTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Search...',
    defaultTitle: 'Select data center',
    allSelected: 'All selected'
  };

  constructor(private svc: CatalogCrudService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService, private catalogService: CatalogService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.catalogId = params.get('catalogId');
      this.action = this.catalogId ? 'Update' : 'Create';
    });
  }

  ngOnInit(): void {
    this.getMetaData();
    this.getDatacenters();
    if (this.catalogId) {
      this.getCatalogDataById();
    } else {
      this.buildForm();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  get currencySymbol(): string {
    const code = this.form.get('currency').value;
    return code ? getCurrencySymbol(code, 'wide') : '';
  }

  private getDatacenters(): void {
    this.svc.getDatacenters()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this.datacenters = data || [];
        this.datacenterOptions = this.datacenters.map(dc => ({
          value: dc.uuid,
          label: dc.name
        }));
      }, () => {
        this.notification.error(new Notification('Failed to load data centers'));
      });
  }

  // ---------- bootstrapping ----------

  getMetaData(): void {
    this.svc.getMetaData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (meta) => { this.meta = meta; },
      () => { /* dropdowns stay empty on failure */ }
    );
    this.svc.getTaskData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (tasks) => { this.tasks = tasks.results; },
      () => { /* task dropdown stays empty on failure */ }
    );
    this.svc.getWorkflowData("Manual Trigger").pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (workflows) => { this.workflows = workflows.results; },
      () => { /* workflow dropdown stays empty on failure */ }
    );
    this.loadingFinops = true;
    this.svc.getFinopsBuildingBlocks().pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (res) => {
        this.finopsOptions = res;
        this.loadingFinops = false;

        // const currentFinops = this.form?.get('finops_block')?.value;
        // if (currentFinops) {
        //   this.onFinopsChange(currentFinops, { preserveExisting: true });
        // }
      },
      () => { this.loadingFinops = false; }
    );

    this.svc.getCloudAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (res) => { this.cloudAccounts = res.results || res || []; },
      () => { /* stays empty on failure */ }
    );

    this.svc.getCredentials().pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (res) => { this.credentials = res.results || res || []; },
      () => { /* stays empty on failure */ }
    );
  }

  searchTargets = (query: string): Observable<any[]> => {
    return this.svc.getHost(query).pipe(catchError(err => {
      this.notification.error(new Notification('Failed to fetch targets. Please try again later.'));
      return of([]);
    }));
  };

  getCatalogDataById(): void {
    this.spinner.start('main');
    this.svc.getCatalogDataById(this.catalogId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (data) => {
        this.catalogData = data;
        this.buildForm();
        this.spinner.stop('main');
      },
      (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.handleError(err.error);
      }
    );
  }

  buildForm(): void {
    this.form = this.svc.buildForm(this.catalogData);
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.formValidationMessages;

    this.activeAutomationType = this.form.get('automation_type').value === 'Workflow' ? 'Workflow' : 'Task';
    this.automationMappings = { Task: [], Workflow: [] };
    this.automationMappingsInitialized = { Task: false, Workflow: false };
    this.automationMappings[this.activeAutomationType] = this.inputMappings.getRawValue();
    this.automationMappingsInitialized[this.activeAutomationType] = true;
    this.applyAutomationControlState(this.activeAutomationType);

    this.applyBillingState();
    this.applyQuantityState();
    this.bindQuantityRangeCheck();
    this.refreshAllMappingOptions();
    this.syncPreview();

    if (this.form.get('workflow')) {
      this.bindWorkflowValueChanges();
    }
    if (this.activeAutomationType === 'Workflow') {
      this.initWorkflowVersionIfNeeded();
    }

    this.form.get('billing_model')?.disable({ emitEvent: false });

    // Edit mode: re-derive billing without discarding the saved cost mappings.
    // FinOps metadata may still be loading; its subscription retries this.
    const existingFinops = this.form.get('finops_block')?.value;
    if (existingFinops) {
      this.onFinopsChange(existingFinops, { preserveExisting: true });
    }
    this.form.get('allow_quantity').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.applyQuantityState();
    });
    this.form.get('automation_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val) => {
      this.toggleAutomationControl(val);
    });
    this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.syncPreview();
      if (this.submitAttempted) {
        this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
        this.updateConfigFieldErrors();
        this.updateSlaErrors();
        this.markSectionsWithErrors();
      }
    });
    this.form.get('finops_block')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((uuid) => {
      this.onFinopsChange(uuid);
    });

    // frequency no longer triggers a fetch it only rescales existing rows
    this.form.get('frequency')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.recomputeCostComponentTotal();
    });

    this.costComponents?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.recomputeCostComponentTotal();
    });
    this.configuration?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.recomputeCostComponentTotal();
    });

    if (this.form.get('task')) {
      this.bindTaskValueChanges();
    }

    const existingLogo = (this.catalogData as any)?.logo || this.form.get('logo')?.value;
    if (typeof existingLogo === 'string' && existingLogo) {
      this.logoPreviewUrl = existingLogo;
      this.logoFileName = this.extractFileName(existingLogo);
    } else {
      this.logoPreviewUrl = null;
      this.logoFileName = null;
    }

    // this.form.get('currency')?.setValue('EUR', { emitEvent: false });
    // this.form.get('currency')?.disable({ emitEvent: false });
  }

  private bindTaskValueChanges(): void {
    this.form.get('task').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((uuid) => {
      this.onTaskChange(uuid);
    });
  }

  onTaskChange(uuid: string): void {
    this.automationMappingsInitialized.Task = false;
    if (!uuid) {
      this.automationMappings.Task = [];
      if (this.activeAutomationType === 'Task') { this.setInputMappings([]); }
      this.automationMappingsInitialized.Task = true;
      return;
    }
    if (this.activeAutomationType === 'Task') { this.setInputMappings([]); }
    this.svc.getTaskParameters(uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (data) => {
        if (this.form.get('task').value !== uuid) { return; }
        const mappings = this.svc.buildInputMappingsFromTaskData(data, this.cloudAccounts);
        this.automationMappings.Task = mappings;
        this.automationMappingsInitialized.Task = true;
        if (this.activeAutomationType === 'Task' && this.form.get('task').value === uuid) {
          this.setInputMappings(mappings);
        }
      },
      () => { /* leave input mapping empty on failure */ }
    );
  }

  // ---------- accordion ----------

  toggleAccordion(section: CatalogAccordionSection): void {
    this.openSections[section] = !this.openSections[section];
  }

  isOpen(section: CatalogAccordionSection): boolean {
    return !!this.openSections[section];
  }

  // Opens (never closes) the accordion section(s) that currently contain a
  // validation failure, so the user is guided straight to what needs fixing
  // instead of every section snapping open on submit.
  private markSectionsWithErrors(): void {
    if (!this.form) { return; }
    const sectionsToOpen = new Set<CatalogAccordionSection>();

    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      if (control && control.invalid) {
        const section = this.FIELD_SECTION_MAP[key];
        if (section) { sectionsToOpen.add(section); }
      }
    });

    this.problems.forEach((problem) => {
      if (/configuration key/i.test(problem)) { sectionsToOpen.add('configuration'); }
      else if (/quantity/i.test(problem)) { sectionsToOpen.add('availability'); }
      else if (/cost component/i.test(problem)) { sectionsToOpen.add('billing'); }
      else if (/currency/i.test(problem)) { sectionsToOpen.add('billing'); }
      else if (/mapping/i.test(problem)) { sectionsToOpen.add('automation'); }
    });

    sectionsToOpen.forEach((section) => { this.openSections[section] = true; });
  }

  // ---------- typed array getters ----------

  get useCases(): FormArray { return this.form.get('use_cases') as FormArray; }
  get keyFeatures(): FormArray { return this.form.get('key_features') as FormArray; }
  get configuration(): FormArray { return this.form.get('configuration') as FormArray; }
  get costComponents(): FormArray { return this.form.get('cost_mapping') as FormArray; }
  get policies(): FormArray { return this.form.get('policies') as FormArray; }
  get inputMappings(): FormArray { return this.form.get('input_mapping') as FormArray; }

  get functionalReqs(): FormArray { return this.form.get('requirements.functional') as FormArray; }
  get technicalReqs(): FormArray { return this.form.get('requirements.technical') as FormArray; }
  get accessPermissionReqs(): FormArray { return this.form.get('requirements.access_permissions') as FormArray; }
  get includedList(): FormArray { return this.form.get('requirements.included') as FormArray; }
  get notIncludedList(): FormArray { return this.form.get('requirements.not_included') as FormArray; }

  optionsArray(configIndex: number): FormArray {
    return this.configuration.at(configIndex).get('options') as FormArray;
  }
  validatorsArray(configIndex: number): FormArray {
    return this.configuration.at(configIndex).get('validators') as FormArray;
  }

  // ---------- add / remove: plain string rows ----------

  // Refuses to add a new row while the current last row of the array is
  // still empty/invalid; instead it marks that row touched so its
  // invalid-feedback message appears, and tells the user why nothing happened.
  private guardAndAdd(array: FormArray, addFn: () => void): void {
    if (!this.svc.canAddRow(array)) {
      this.notification.error(new Notification('Please complete the previous entry before adding a new one.'));
      return;
    }
    addFn();
  }

  addStringRow(array: FormArray): void {
    this.guardAndAdd(array, () => this.svc.pushString(array));
  }
  removeStringRow(array: FormArray, index: number): void { this.svc.removeAt(array, index); }

  // ---------- add / remove: structured rows ----------

  addConfigField(): void {
    this.guardAndAdd(this.configuration, () => {
      this.configuration.push(this.svc.buildConfigFieldGroup());
      this.refreshAllMappingOptions();
      this.refreshCostComponentConfigOptions();
    });
  }
  removeConfigField(index: number): void {
    this.configuration.removeAt(index);
    this.refreshAllMappingOptions();
    this.refreshCostComponentConfigOptions();
  }

  addOption(configIndex: number): void {
    this.guardAndAdd(this.optionsArray(configIndex), () => this.optionsArray(configIndex).push(this.svc.buildOptionGroup()));
  }
  removeOption(configIndex: number, optIndex: number): void { this.optionsArray(configIndex).removeAt(optIndex); }

  addValidator(configIndex: number): void {
    this.guardAndAdd(this.validatorsArray(configIndex), () => this.validatorsArray(configIndex).push(this.svc.buildValidatorGroup()));
  }
  removeValidator(configIndex: number, valIndex: number): void { this.validatorsArray(configIndex).removeAt(valIndex); }

  addCostComponent(): void { this.costComponents.push(this.svc.buildCostComponentGroup()); }
  // removeCostComponent(index: number): void { this.costComponents.removeAt(index); }

  addPolicy(): void {
    this.guardAndAdd(this.policies, () => this.policies.push(this.svc.buildPolicyGroup()));
  }
  removePolicy(index: number): void { this.policies.removeAt(index); }

  addInputMapping(): void {
    this.guardAndAdd(this.inputMappings, () => {
      this.inputMappings.push(this.svc.buildInputMappingGroup());
      this.refreshAllMappingOptions();
    });
  }
  removeInputMapping(index: number): void { this.inputMappings.removeAt(index); }

  // ---------- conditional field visibility (used from the template too) ----------

  showPlaceholder(type: string): boolean { return PLACEHOLDER_TYPES.indexOf(type as any) > -1; }
  showOptions(type: string): boolean { return OPTION_TYPES.indexOf(type as any) > -1; }
  showRange(type: string): boolean { return RANGE_TYPES.indexOf(type as any) > -1; }

  private applyBillingState(): void {
    const free = this.form.get('billing_model').value === 'Free';
    const price = this.form.get('price');
    const frequency = this.form.get('frequency');
    if (free) {
      price.disable({ emitEvent: false });
      frequency.disable({ emitEvent: false });
      frequency.clearValidators();
      price.setValue('0', { emitEvent: false });
      frequency.setValue('', { emitEvent: false });
    } else {
      price.enable({ emitEvent: false });
      frequency.enable({ emitEvent: false });
      frequency.setValidators([Validators.required]);
    }
    frequency.updateValueAndValidity({ emitEvent: false });
  }

  private applyQuantityState(): void {
    const on = this.form.get('allow_quantity').value;
    const min = this.form.get('min_quantity');
    const max = this.form.get('max_quantity');
    if (on) { min.enable({ emitEvent: false }); max.enable({ emitEvent: false }); }
    else { min.disable({ emitEvent: false }); max.disable({ emitEvent: false }); }
  }

  private toggleAutomationControl(val: string): void {
    const nextType: 'Task' | 'Workflow' = val === 'Workflow' ? 'Workflow' : 'Task';
    if (nextType === this.activeAutomationType) { return; }

    this.automationMappings[this.activeAutomationType] = this.inputMappings.getRawValue();
    if (this.inputMappings.length) {
      this.automationMappingsInitialized[this.activeAutomationType] = true;
    }

    this.activeAutomationType = nextType;
    this.applyAutomationControlState(nextType);

    if (this.automationMappingsInitialized[nextType]) {
      this.setInputMappings(this.automationMappings[nextType]);
    } else {
      this.setInputMappings([]);
      if (nextType === 'Task') {
        this.onTaskChange(this.form.get('task').value);
      } else {
        const workflowUuid = this.form.get('workflow').value;
        if (workflowUuid) {
          this.loadWorkflowVersions(workflowUuid, this.form.get('workflow_version').value);
          this.loadWorkflowParameters(workflowUuid);
        }
      }
    }
  }

  private applyAutomationControlState(type: 'Task' | 'Workflow'): void {
    const taskCtrl = this.form.get('task');
    const workflowCtrl = this.form.get('workflow');
    const versionCtrl = this.form.get('workflow_version');

    if (type === 'Workflow') {
      taskCtrl.disable({ emitEvent: false });
      workflowCtrl.enable({ emitEvent: false });
      if (workflowCtrl.value && this.versionWorkflows.length) {
        versionCtrl.enable({ emitEvent: false });
      } else {
        versionCtrl.disable({ emitEvent: false });
      }
    } else {
      taskCtrl.enable({ emitEvent: false });
      workflowCtrl.disable({ emitEvent: false });
      versionCtrl.disable({ emitEvent: false });
    }
  }

  private setInputMappings(mappings: any[]): void {
    this.inputMappings.clear();
    (mappings || []).forEach((mapping) => {
      this.inputMappings.push(this.svc.buildInputMappingGroup(mapping));
    });
    this.refreshAllMappingOptions();
  }

  // Subscribe once; the control remains in the form while inactive.
  private bindWorkflowValueChanges(): void {
    this.form.get('workflow').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((uuid) => {
      this.onWorkflowChange(uuid);
    });
  }

  // User picked a different workflow -> clear + disable version, then refetch.
  onWorkflowChange(uuid: string): void {
    const versionCtrl = this.form.get('workflow_version');
    if (!versionCtrl) { return; }
    versionCtrl.setValue('', { emitEvent: false });
    this.versionWorkflows = [];
    this.automationMappings.Workflow = [];
    this.automationMappingsInitialized.Workflow = false;
    if (this.activeAutomationType === 'Workflow') { this.setInputMappings([]); }

    if (!uuid) {
      versionCtrl.disable({ emitEvent: false });
      this.automationMappingsInitialized.Workflow = true;
      return;
    }
    this.loadWorkflowVersions(uuid, '');
    this.loadWorkflowParameters(uuid);
  }

  private loadWorkflowParameters(uuid: string): void {
    this.svc.getWorkflowParameters(uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (data) => {
        if (this.form.get('workflow').value !== uuid) { return; }
        const mappings = this.svc.buildInputMappingsFromParams(data.inputs || []);
        this.automationMappings.Workflow = mappings;
        this.automationMappingsInitialized.Workflow = true;
        if (this.activeAutomationType === 'Workflow' && this.form.get('workflow').value === uuid) {
          this.setInputMappings(mappings);
        }
      },
      () => { /* leave input mapping empty on failure */ }
    );
  }

  private loadWorkflowVersions(uuid: string, selectedVersion: string): void {
    const versionCtrl = this.form.get('workflow_version');
    versionCtrl.disable({ emitEvent: false });
    this.svc.getVersionWorkflowData(uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (data) => {
        if (this.form.get('workflow').value !== uuid) { return; }
        this.versionWorkflows = data.versions || [];
        versionCtrl.setValue(selectedVersion || '', { emitEvent: false });
        if (this.activeAutomationType === 'Workflow') {
          versionCtrl.enable({ emitEvent: false });
        }
      },
      () => {
        if (this.activeAutomationType === 'Workflow' && this.form.get('workflow').value === uuid) {
          versionCtrl.enable({ emitEvent: false });
        }
      }
    );
  }

  // Edit mode: workflow already has a value on load, so fetch versions
  // without wiping the previously-saved workflow_version.
  private initWorkflowVersionIfNeeded(): void {
    const workflowCtrl = this.form.get('workflow');
    const versionCtrl = this.form.get('workflow_version');
    if (!workflowCtrl || !versionCtrl || !workflowCtrl.value) { return; }
    const existingVersion = versionCtrl.value;
    this.loadWorkflowVersions(workflowCtrl.value, existingVersion);
  }

  paramControlKind(mappingGroup: FormGroup): ParamControlKind {
    return normalizeParamType(mappingGroup.get('param_type').value);
  }

  getJsonDisplay(mappingGroup: FormGroup): string {
    const v = mappingGroup.get('value').value;
    try { return JSON.stringify(v, null, 0); } catch { return ''; }
  }

  onJsonValueChange(mappingGroup: FormGroup, raw: string): void {
    try {
      mappingGroup.get('value').setValue(JSON.parse(raw));
    } catch {
      // leave previous value until it's valid JSON
    }
  }

  // ---------- input mapping: source select depends on configuration keys ----------

  getConfigKeys(): string[] {
    return this.configuration.controls
      .map(c => (c.get('key').value || '').trim())
      .filter(Boolean);
  }

  onMappingTypeChange(mappingGroup: FormGroup): void {
    // Values have different meanings for Config and Fixed mappings. Never
    // carry a configuration key into a fixed editor (or vice versa).
    mappingGroup.get('value').setValue('', { emitEvent: false });
    this.syncPreview();
  }

  onConfigKeyChange(): void {
    this.refreshAllMappingOptions();
  }

  private refreshAllMappingOptions(): void {
    // Re-validates that mapped values still point at an existing configuration
    // key; the <select> options themselves are rendered from getConfigKeys()
    // directly in the template, so nothing to patch here besides re-running
    // the problems check.
    this.refreshCostComponentConfigOptions();
    this.syncPreview();
  }

  trackByConfigKey(index: number, opt: { key: string; label: string }): string {
    return opt.key;
  }
  // ---------- payload preview / validation summary ----------

  syncPreview(): void {
    if (!this.form) { return; }
    this.recomputeCostComponentTotal();
    const payload = this.svc.buildPayload(this.form);
    this.payloadPreview = JSON.stringify(payload, null, 2);
    this.problems = this.svc.getFormProblems(this.form);
  }

  // ---------- submit ----------

  confirmCatalogCreate(): void {
    this.submitAttempted = true;
    this.form.markAllAsTouched();
    this.syncPreview();
    this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
    this.updateConfigFieldErrors();
    this.updateSlaErrors();
    if (this.form.invalid || this.problems.length) {
      this.markSectionsWithErrors();
      this.notification.error(new Notification('Please correct the highlighted fields before saving.'));
      return;
    }

    const payload = this.svc.buildPayload(this.form);
    this.spinner.start('main');

    if (this.catalogId) {
      this.svc.updateCatalog(this.catalogId, payload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        () => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Catalog updated successfully.'));
          this.goBack();
        },
        (err: HttpErrorResponse) => { this.spinner.stop('main'); this.handleError(err.error); }
      );
    } else {
      this.svc.createCatalog(payload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        () => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Catalog created successfully.'));
          this.goBack();
        },
        (err: HttpErrorResponse) => { this.spinner.stop('main'); this.handleError(err.error); }
      );
    }
  }

  frequencySuffix(frequency: string): string {
    return this.catalogService.frequencySuffix(frequency);
  }

  resetForm(): void {
    this.submitAttempted = false;
    this.catalogData = undefined;
    this.buildForm();
  }

  goBack(): void {
    if (this.catalogId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  private handleError(error: any): void {
    const messages = this.collectErrorMessages(error);
    const message = messages.length ? messages.join(' ') : 'Something went wrong. Please try again.';
    this.notification.error(new Notification(message));
  }

  private collectErrorMessages(error: any): string[] {
    if (!error) { return []; }
    if (typeof error === 'string') { return [error]; }
    if (Array.isArray(error)) {
      return error.reduce((all: string[], item: any) => all.concat(this.collectErrorMessages(item)), []);
    }
    if (typeof error === 'object') {
      return Object.keys(error).reduce((all: string[], key: string) => {
        return all.concat(this.collectErrorMessages(error[key]));
      }, []);
    }
    return [String(error)];
  }


  ///////////////////// COST COMPONENT CALCULATIONS /////////////////////////////////////////////////////////////

  onFinopsChange(uuid: string, opts: { preserveExisting?: boolean } = {}): void {
    const billingModelCtrl = this.form.get('billing_model');
    const currencyCtrl = this.form.get('currency');

    if (!uuid) {
      this.costComponents.clear();
      this.costComponentTotal = 0;
      this.costComponentHasError = false;
      billingModelCtrl.setValue('', { emitEvent: false });
      billingModelCtrl.disable({ emitEvent: false });
      currencyCtrl.setValue('EUR', { emitEvent: false });
      return;
    }

    const record = this.finopsOptions?.find(f => f.uuid === uuid);

    // Billing model is derived from the FinOps block's license model
    if (record) {
      const licenseModel = record.basic?.license_model || '';
      billingModelCtrl.setValue(licenseModel, { emitEvent: false });
      const billingCurrency = record.finops_cost?.billing_currency || 'EUR';
      currencyCtrl.setValue(billingCurrency, { emitEvent: false });
    }
    billingModelCtrl.disable({ emitEvent: false });
    this.applyBillingState();

    // Edit-mode initial load: keep whatever cost_mapping came back from the
    // catalog edit API do NOT overwrite it with the raw building-block shape.
    if (opts.preserveExisting && this.costComponents.length) {
      this.recomputeCostComponentTotal();
      return;
    }

    if (!record) { return; } // finopsOptions not loaded yet nothing more we can do right now

    this.costComponents.clear();
    const rows = this.svc.transformCostComponents(record.component);
    rows.forEach((row) => this.costComponents.push(this.svc.buildCostComponentGroup(row)));
    this.recomputeCostComponentTotal();
  }

  removeCostComponent(index: number): void {
    if (this.costComponents.length <= 1) {
      this.notification.error(new Notification('At least one cost component is required.'));
      return;
    }
    this.costComponents.removeAt(index);
  }

  getConfigOptionsForCostComponent(): { key: string; label: string }[] {
    return this.configuration.controls.map((c) => ({
      key: c.get('key').value,
      label: c.get('label').value || c.get('key').value
    })).filter(o => o.key);
  }

  private refreshCostComponentConfigOptions(): void {
    this.configOptionsForCostComponent = this.configuration.controls
      .map((c) => ({
        key: c.get('key').value,
        label: c.get('label').value || c.get('key').value
      }))
      .filter(o => o.key);
  }

  onCostComponentSourceTypeChange(group: FormGroup): void {
    group.get('config_key').setValue('', { emitEvent: false });
    group.get('count').setValue(null, { emitEvent: false });
    group.get('mapping_type').setValue('Multiply', { emitEvent: false });
    this.recomputeCostComponentTotal();
  }

  // current frequency-adjusted rate for a row
  currentRowRate(group: FormGroup): number {
    const rawRate = Number(group.get('rate').value) || 0;
    const rawBaseQuantity = Number(group.get('base_quantity')?.value);
    const baseQuantity = isFinite(rawBaseQuantity) && rawBaseQuantity > 0 ? rawBaseQuantity : 1;
    const sourceFreq = group.get('rate_frequency').value || 'Monthly';
    const targetFreq = this.form.get('frequency').value || 'Monthly';

    const sourceFactor = FREQUENCY_FACTOR[sourceFreq] !== undefined ? FREQUENCY_FACTOR[sourceFreq] : 1;
    const targetFactor = FREQUENCY_FACTOR[targetFreq] !== undefined ? FREQUENCY_FACTOR[targetFreq] : 1;

    // The FinOps rate covers baseQuantity units (for example, EUR 300 for
    // 4 CPUs). Convert the bundle rate to the selected frequency, then to
    // a per-unit rate before applying the requested configuration quantity.
    const monthlyEquivalent = rawRate / sourceFactor;
    const frequencyAdjustedRate = monthlyEquivalent * targetFactor;
    const perUnitRate = frequencyAdjustedRate / baseQuantity;

    return perUnitRate;
  }

  computeRowResult(group: FormGroup): number | null {
    const v = group.getRawValue();
    const rate = this.currentRowRate(group);

    if (v.source === 'Fixed') {
      const n = Number(v.count);
      return (v.count === null || v.count === '' || isNaN(n)) ? null : n;
    }

    if (v.source === 'Static') {
      const count = this.toFiniteNumber(v.count);
      const result = count !== null && v.mapping_type === 'Multiply' ? rate * count : null;
      return this.logRowResult(v, rate, count, result);
    }

    if (v.source !== 'Config' || !v.config_key) {
      return this.logRowResult(v, rate, null, null);
    }
    const cfgGroup = this.configuration.controls.find(c => c.get('key').value === v.config_key) as FormGroup;
    if (!cfgGroup) { return this.logRowResult(v, rate, null, null); }

    // A catalog's displayed price is its minimum purchasable price. Prefer
    // the configured minimum and fall back to the default for field types
    // that do not have a minimum.
    const minimumValue = this.toFiniteNumber(cfgGroup.get('min')?.value);
    const defaultValue = this.toFiniteNumber(cfgGroup.get('default')?.value);
    const configValue = defaultValue !== null ? defaultValue : minimumValue;
    const result = configValue !== null && v.mapping_type === 'Multiply' ? rate * configValue : null;
    return this.logRowResult(v, rate, configValue, result);
  }

  private logRowResult(row: any, perUnitRate: number, quantity: number | null, result: number | null): number | null {
    return result;
  }

  private toFiniteNumber(value: any): number | null {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }
    const numberValue = Number(value);
    return isFinite(numberValue) ? numberValue : null;
  }

  recomputeCostComponentTotal(): void {
    let total = 0;
    let hasError = false;
    this.costComponents.controls.forEach((ctrl) => {
      const result = this.computeRowResult(ctrl as FormGroup);
      ctrl.get('price').setValue(result, { emitEvent: false });
      if (result === null) { hasError = true; } else { total += result; }
    });
    this.costComponentHasError = hasError;
    this.costComponentTotal = total;

    const price = this.form.get('price');
    const isFree = this.form.get('billing_model').value === 'Free';
    if (price && !isFree) {
      price.setValue(hasError ? null : total.toFixed(2), { emitEvent: false });
    }
  }


  frequencyAbbrev(freq: string): string {
    switch ((freq || '').toLowerCase()) {
      case 'monthly': return 'mo';
      case 'daily': return 'day';
      case 'hourly': return 'hr';
      default: return freq || 'mo';
    }
  }

  ///////////////////// COST COMPONENT CALCULATIONS /////////////////////////////////////////////////////////////

  extractFileName(url: string): string {
    try {
      const path = url.split('?')[0];
      const segments = path.split('/');
      return decodeURIComponent(segments[segments.length - 1]) || url;
    } catch {
      return url;
    }
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) { return; }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (allowedTypes.indexOf(file.type) === -1) {
      this.logoUploadError = 'Only PNG, JPG, SVG, or WEBP files are allowed.';
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.logoUploadError = 'Logo must be under 2MB.';
      input.value = '';
      return;
    }

    this.logoUploadError = '';
    this.form.get('logo').setValue(file);
    this.logoFileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  removeLogo(): void {
    this.form.get('logo').setValue(null);
    this.logoPreviewUrl = null;
    this.logoFileName = null;
    this.logoUploadError = '';
  }

  compareCloudAccount = (a: any, b: any): boolean => {
    if (a === b) { return true; }
    if (!a || !b) { return false; }
    const idA = a.uuid ?? a.id;
    const idB = b.uuid ?? b.id;
    return idA !== undefined && idA !== null && idA === idB;
  };

  bindQuantityRangeCheck(): void {
    this.form.get('min_quantity').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.form.get('max_quantity').updateValueAndValidity();
    });
  }

  controlErrorMessage(control: AbstractControl | null, messages: any): string {
    if (!control || !control.errors || !messages) { return ''; }
    const errorKey = Object.keys(control.errors)[0];
    return messages[errorKey] || '';
  }

  updateConfigFieldErrors(): void {
    const msgs = this.formValidationMessages.configuration;
    this.configFieldErrors = this.configuration.controls.map((cfg: FormGroup) => ({
      key: this.controlErrorMessage(cfg.get('key'), msgs.key),
      label: this.controlErrorMessage(cfg.get('label'), msgs.label),
      type: this.controlErrorMessage(cfg.get('type'), msgs.type)
    }));
  }

  updateSlaErrors(): void {
    this.formErrors.provisioning_time = this.controlErrorMessage(
      this.form.get('sla.provisioning_time'),
      this.formValidationMessages.provisioning_time
    );
  }
}