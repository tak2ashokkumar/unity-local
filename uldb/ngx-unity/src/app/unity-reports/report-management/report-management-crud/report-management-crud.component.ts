import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import moment from 'moment';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import {
  StorageService,
  StorageType,
} from 'src/app/shared/app-storage/storage.service';
import {
  AppUtilityService,
  NoWhitespaceValidator,
} from 'src/app/shared/app-utility/app-utility.service';
import {
  CloudInventoryMetaData,
  ModuleArrType,
  ReportFormData,
  ReportManagementCrudService,
  ReportModelType,
  ReportModuleType,
} from './report-management-crud.service';

/**
 * Coordinates the Report Management Crud screen state, template bindings, and user actions.
 */
@Component({
  selector: 'report-management-crud',
  templateUrl: './report-management-crud.component.html',
  styleUrls: ['./report-management-crud.component.scss'],
  providers: [ReportManagementCrudService],
})
export class ReportManagementCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  private executionTypeChangesSub: Subscription;
  private moduleNameChangesSub: Subscription;
  private reportSubTypeChangesSub: Subscription;
  private durationTypeChangesSub: Subscription;
  private formValueChangesBound = false;
  /**
   * Stores the active report identifier from the current route or row action.
   */
  reportId: string = null;
  /**
   * Stores whether the current form is creating or editing an entity.
   */
  action: 'Create' | 'Update';

  /**
   * Holds the reactive form used by the current report workflow.
   */
  form: FormGroup;
  /**
   * Stores validation errors displayed by the report form template.
   */
  formErrors: any;
  /**
   * Defines validation message text used by form validation helpers.
   */
  validationMessages: any;
  /**
   * Stores API validation errors that are not tied to a single form control.
   */
  nonFieldErr: string = '';
  /**
   * Stores the invalid forms value used by Report Management Crud Component.
   */
  invalidForms: boolean = false;
  /**
   * Stores the max date value used by Report Management Crud Component.
   */
  maxDate: string = moment().format('YYYY-MM-DD');

  /**
   * Stores the report loaded for edit or preview workflows.
   */
  selectedReport: ReportFormData;
  /**
   * Stores the workflow integration value used by Report Management Crud Component.
   */
  workflowIntegration: any;
  // isCloudTypeEnabled: boolean = false;

  /**
   * Stores the unity one itsmtable value used by Report Management Crud Component.
   */
  unityOneITSMTable: any;
  // unityOneTableLoaded = false;

  /**
   * Stores the dynamic report modules src value used by Report Management Crud Component.
   */
  dynamicReportModulesSrc: ReportModuleType[] = [];
  /**
   * Stores the dynamic report modules arr collection used by the template or payload builder.
   */
  dynamicReportModulesArr: ModuleArrType[] = [];
  /**
   * Stores the dynamic report models arr collection used by the template or payload builder.
   */
  dynamicReportModelsArr: ReportModelType[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private crudSvc: ReportManagementCrudService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private notificationService: AppNotificationService,
    private storageService: StorageService
  ) {
    this.route.paramMap
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params: ParamMap) => {
        this.reportId = params.get('reportId');
      });
    this.crudSvc.invalidAnnounced$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.invalidForms = true;
      });
  }

  /**
   * Initializes Report Management Crud Component data and subscriptions.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.selectedReport = null;
    if (this.reportId) {
      this.action = 'Update';
      this.getReportById();
    } else {
      this.action = 'Create';
      this.buildForm();
    }
  }

  /**
   * Releases Report Management Crud Component subscriptions and pending UI work.
   *
   * @returns Nothing.
   */
  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.unsubscribeValueChangeSubscriptions();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Loads or returns report by id for the current workflow.
   *
   * @returns Nothing.
   */
  getReportById() {
    this.crudSvc
      .getReportById(this.reportId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.selectedReport = res;
          this.buildForm();
        },
        () => {
          this.notification.error(
            new Notification('Error while fetching report!! Please try again.')
          );
        }
      );
  }

  /**
   * Loads or returns dynamic report modules for the current workflow.
   *
   * @returns Nothing.
   */
  getDynamicReportModules() {
    this.crudSvc
      .getDynamicReportModules()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.dynamicReportModulesSrc = res;
          this.dynamicReportModulesArr = [];
          res.forEach((val: ReportModuleType) => {
            this.dynamicReportModulesArr.push({
              name: val.module_name,
              display_name: val.module_display_name,
            });
          });
          const moduleName = this.reportMeta.get('module_name')?.value;
          this.dynamicReportModelsArr = moduleName
            ? this.findModelsByModuleName(moduleName)
            : [];
        },
        () => {
          this.notification.error(
            new Notification(
              'Error while fetching dynamic report modules!! Please try again.'
            )
          );
        }
      );
  }

  /**
   * Returns the cloud type value used by this component.
   *
   * @returns The derived value for the current component state.
   */
  get cloudType(): string {
    return this.reportMeta ? this.reportMeta.get('cloud_type').value : '';
  }

  /**
   * Returns the execution type value used by this component.
   *
   * @returns The derived value for the current component state.
   */
  get executionType(): string {
    return this.reportMeta ? this.reportMeta.get('execution_type').value : '';
  }

  /**
   * Returns the table uuid value used by this component.
   *
   * @returns The derived value for the current component state.
   */
  get tableUuid(): string {
    return this.reportMeta ? this.reportMeta.get('table').value : '';
  }

  /**
   * Returns the workflow integration value value used by this component.
   *
   * @returns The derived value for the current component state.
   */
  get workflowIntegrationValue(): string {
    return this.reportMeta
      ? this.reportMeta.get('workflow_integration')?.value
      : '';
  }

  /**
   * Returns the report meta value used by this component.
   *
   * @returns The derived value for the current component state.
   */
  get reportMeta(): FormGroup {
    return this.form.get('report_meta') as FormGroup;
  }

  /**
   * Returns the is dynamic value used by this component.
   *
   * @returns The derived value for the current component state.
   */
  get isDynamic(): boolean {
    return this.form.get('feature')?.value == 'Dynamic';
  }

  /**
   * Returns the dynamic module value used by this component.
   *
   * @returns The derived value for the current component state.
   */
  get dynamicModule(): string {
    return this.reportMeta?.get('module_name')
      ? this.reportMeta.get('module_name')?.value
      : '';
  }

  /**
   * Returns the dynamic model value used by this component.
   *
   * @returns The derived value for the current component state.
   */
  get dynamicModel(): string {
    return this.reportMeta?.get('model_name')
      ? this.reportMeta.get('model_name')?.value
      : '';
  }

  /**
   * Handles the report type change event from the template.
   *
   * @param selectedType - Selected Type value used by this method.
   * @returns Nothing.
   */
  onReportTypeChange(selectedType: string) {
    this.crudSvc.setReportType(selectedType);
  }

  // childFormData($event: ManageReportDatacenterFormData | ManageReportPrivateCloudFormData | ManageReportPublicCloudFormData | ManageReportEventFormData) {
  /**
   * Executes the child form data workflow for Report Management Crud Component.
   *
   * @param $event - Event payload emitted by the template control.
   * @returns Nothing.
   */
  childFormData($event: CloudInventoryMetaData) {
    let childFormData = $event;
    if (this.form.valid) {
      this.invalidForms = false;
      // Child components own report-type-specific fields; parent owns the common report payload.
      let fd = <ReportFormData>this.form.getRawValue();
      fd.report_meta = Object.assign({}, fd.report_meta, childFormData);
      this.submitFinalFormData(fd);
    }
  }

  /**
   * Executes the submit final form data workflow for Report Management Crud Component.
   *
   * @param fd - Raw form data to normalize before API submission.
   * @returns Nothing.
   */
  submitFinalFormData(fd: ReportFormData) {
    this.spinner.start('main');
    if (this.reportId) {
      this.crudSvc
        .updateReport(this.reportId, fd)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          () => {
            this.spinner.stop('main');
            this.notification.success(
              new Notification('Report updated successfully.')
            );
            this.router.navigate(['../../'], { relativeTo: this.route });
          },
          (err) => {
            this.spinner.stop('main');
            this.notificationService.error(
              new Notification('Error while updating Report. Please try again')
            );
            this.handleError(err.error);
          }
        );
    } else {
      this.crudSvc
        .createReport(fd)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          () => {
            this.spinner.stop('main');
            this.notification.success(
              new Notification('Report created successfully.')
            );
            this.router.navigate(['../'], { relativeTo: this.route });
          },
          (err) => {
            this.spinner.stop('main');
            this.notificationService.error(
              new Notification('Error while creating Report. Please try again')
            );
            this.handleError(err.error);
          }
        );
    }
  }

  /**
   * Builds form used by the current workflow.
   *
   * @returns Nothing.
   */
  buildForm() {
    this.spinner.start('main');
    this.form = this.crudSvc.buildForm(this.selectedReport);
    this.validationMessages = this.crudSvc.validationMessages;
    this.formErrors = this.crudSvc.resetFormErrors();
    this.formValueChangesBound = false;
    // Create reads the feature selected on the list page; update trusts the loaded report payload.
    const initialFeature = this.getInitialFeature();
    if (initialFeature) {
      this.form.get('feature').setValue(initialFeature, { emitEvent: false });
    }
    this.manageFormSubscription();
    if (this.isDynamic) {
      this.form.get('feature').disable({ emitEvent: false });
      // if (this.reportId) {
      //   setTimeout(() => {
      //     this.reportMeta.get('module_name').setValue(this.selectedReport.report_meta.module_name)
      //     this.reportMeta.get('model_name').setValue(this.selectedReport.report_meta.model_name)
      //   }, 50);
      // }
    } else {
      this.form.get('feature').enable({ emitEvent: false });
      this.form
        .get('feature')
        .setValidators([Validators.required, NoWhitespaceValidator]);
    }

    this.spinner.stop('main');
  }

  /**
   * Executes the manage form subscription workflow for Report Management Crud Component.
   *
   * @returns Nothing.
   */
  manageFormSubscription() {
    this.configureReportMetaControls(this.form.get('feature').value);
    this.form
      .get('feature')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((value: string) => {
        this.configureReportMetaControls(value);
      });
  }

  private configureReportMetaControls(value: string): void {
    this.resetReportTypeSubscriptions();

    // Keep parent-level report_meta controls limited to fields needed before the child form renders.
    if (value === 'Cloud Inventory') {
      const cloudSelected = this.getReportMetaValueForFeature(
        value,
        'cloud_type',
        'Public'
      );
      this.setReportMetaControl(
        'cloud_type',
        new FormControl(cloudSelected, [
          Validators.required,
          NoWhitespaceValidator,
        ])
      );
    } else {
      this.reportMeta.removeControl('cloud_type');
    }

    if (value == 'Performance') {
      this.configurePerformanceControls(value);
    } else {
      this.removePerformanceControls();
    }

    if (value === 'DevOps Automation') {
      this.configureDevOpsControls(value);
    } else {
      this.reportMeta.removeControl('execution_type');
      this.reportMeta.removeControl('workflow_integration');
    }

    if (value === 'UnityOne ITSM') {
      this.getUnityOneITSMTable();
      const table = this.getReportMetaValueForFeature(value, 'table', '');
      this.setReportMetaControl(
        'table',
        new FormControl(table, [Validators.required])
      );
    } else {
      this.reportMeta.removeControl('table');
    }

    if (value === 'Dynamic') {
      this.configureDynamicControls(value);
    } else {
      this.reportMeta.removeControl('module_name');
      this.reportMeta.removeControl('model_name');
      this.dynamicReportModulesArr = [];
      this.dynamicReportModelsArr = [];
    }
  }

  private configurePerformanceControls(feature: string): void {
    const subType = this.getReportMetaValueForFeature(feature, 'sub_type', '');
    this.setReportMetaControl(
      'sub_type',
      new FormControl(subType, [Validators.required])
    );

    // Latest reports do not need duration fields; all other subtypes require either last/custom duration.
    if (subType && subType != 'Latest') {
      const durationType = this.getReportMetaValueForFeature(
        feature,
        'duration_type',
        'Last'
      );
      this.setReportMetaControl(
        'duration_type',
        new FormControl(durationType, [Validators.required])
      );
      this.configureDurationControls(durationType);
    } else {
      this.reportMeta.removeControl('duration_type');
      this.reportMeta.removeControl('hour');
      this.reportMeta.removeControl('min');
      this.reportMeta.removeControl('from_duration');
      this.reportMeta.removeControl('to_duration');
    }

    this.manageReportSubType();
    if (this.reportMeta.get('duration_type')) {
      this.manageDurationType();
    }
  }

  private configureDevOpsControls(feature: string): void {
    const executionType = this.getReportMetaValueForFeature(
      feature,
      'execution_type',
      ''
    );
    this.setReportMetaControl(
      'execution_type',
      new FormControl(executionType, [
        Validators.required,
        NoWhitespaceValidator,
      ])
    );
    this.updateWorkflowIntegrationControl(
      executionType,
      this.getReportMetaValueForFeature(feature, 'workflow_integration', '')
    );

    this.executionTypeChangesSub = this.reportMeta
      .get('execution_type')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((value) => {
        this.updateWorkflowIntegrationControl(value, '');
      });
  }

  private configureDynamicControls(feature: string): void {
    this.getDynamicReportModules();
    const moduleName = this.getReportMetaValueForFeature(
      feature,
      'module_name',
      ''
    );
    const modelName = this.getReportMetaValueForFeature(
      feature,
      'model_name',
      ''
    );
    this.setReportMetaControl(
      'module_name',
      new FormControl(moduleName, [Validators.required, NoWhitespaceValidator])
    );
    this.setReportMetaControl(
      'model_name',
      new FormControl(modelName, [Validators.required, NoWhitespaceValidator])
    );
    this.manageModuleAndModelSubscription();
  }

  private configureDurationControls(durationType: string): void {
    const durationValues = this.isSelectedReportFeature('Performance')
      ? this.selectedReport?.report_meta?.duration_values
      : null;

    if (durationType == 'Last') {
      this.setReportMetaControl(
        'hour',
        new FormControl(
          durationValues?.hour !== undefined ? durationValues.hour : 0,
          [Validators.required, Validators.max(23), Validators.min(0)]
        )
      );
      this.setReportMetaControl(
        'min',
        new FormControl(
          durationValues?.min !== undefined ? durationValues.min : 5,
          [Validators.required, Validators.max(59), Validators.min(0)]
        )
      );
      this.reportMeta.removeControl('from_duration');
      this.reportMeta.removeControl('to_duration');
    } else {
      this.setReportMetaControl(
        'from_duration',
        new FormControl(
          durationValues?.from_duration
            ? new Date(durationValues.from_duration)
            : '',
          [Validators.required]
        )
      );
      this.setReportMetaControl(
        'to_duration',
        new FormControl(
          durationValues?.to_duration
            ? new Date(durationValues.to_duration)
            : '',
          [Validators.required]
        )
      );
      this.reportMeta.removeControl('hour');
      this.reportMeta.removeControl('min');
    }
  }

  private updateWorkflowIntegrationControl(
    executionType: string,
    workflowIntegration: string
  ): void {
    // Workflow Integration is the only DevOps execution type that needs an integration selector.
    if (executionType === 'Workflow Integration') {
      this.getWorkflowIntegration();
      this.setReportMetaControl(
        'workflow_integration',
        new FormControl(workflowIntegration, [Validators.required])
      );
    } else {
      this.reportMeta.removeControl('workflow_integration');
    }
  }

  // Function to find models by module name
  /**
   * Executes the find models by module name workflow for Report Management Crud Component.
   *
   * @param type - Type value used by this method.
   * @returns The value produced by the workflow.
   */
  findModelsByModuleName(type: string): ReportModelType[] {
    for (const module of this.dynamicReportModulesSrc) {
      if (module.module_name === type) {
        return module.models;
      }
    }
    return []; // Return [] if no match is found
  }

  /**
   * Executes the manage module and model subscription workflow for Report Management Crud Component.
   *
   * @returns Nothing.
   */
  manageModuleAndModelSubscription() {
    this.unsubscribeSubscription(this.moduleNameChangesSub);
    this.moduleNameChangesSub = this.reportMeta
      .get('module_name')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((moduleName) => {
        this.reportMeta.get('model_name').setValue('');
        this.dynamicReportModelsArr = moduleName
          ? this.findModelsByModuleName(moduleName)
          : [];
        // this.crudSvc.resetDynamicFiltersAndFields(true);
      });

    // this.reportMeta.get('model_name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(model => {
    //     // this.crudSvc.resetDynamicFiltersAndFields(true);
    // });
  }

  /**
   * Loads or returns workflow integration for the current workflow.
   *
   * @returns Nothing.
   */
  getWorkflowIntegration() {
    this.crudSvc
      .getWorkflowIntegration()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.workflowIntegration = res.results;
        },
        () => {
          this.notification.error(
            new Notification('Error while fetching report!! Please try again.')
          );
        }
      );
  }

  /**
   * Loads or returns unity one itsmtable for the current workflow.
   *
   * @returns Nothing.
   */
  getUnityOneITSMTable() {
    this.crudSvc
      .getUnityOneITSMTable()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.unityOneITSMTable = res.results;
        },
        () => {
          this.notification.error(
            new Notification(
              'Error while fetching Table Data!! Please try again.'
            )
          );
        }
      );
  }

  /**
   * Executes the manage report sub type workflow for Report Management Crud Component.
   *
   * @returns Nothing.
   */
  manageReportSubType() {
    this.unsubscribeSubscription(this.reportSubTypeChangesSub);
    this.reportSubTypeChangesSub = this.reportMeta
      .get('sub_type')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((val) => {
        if (val != 'Latest') {
          this.setReportMetaControl(
            'duration_type',
            new FormControl('Last', [Validators.required])
          );
          this.configureDurationControls('Last');
          this.manageDurationType();
        } else {
          this.reportMeta.removeControl('duration_type');
          this.reportMeta.removeControl('hour');
          this.reportMeta.removeControl('min');
          this.reportMeta.removeControl('from_duration');
          this.reportMeta.removeControl('to_duration');
          this.unsubscribeSubscription(this.durationTypeChangesSub);
        }
      });
  }

  /**
   * Executes the manage duration type workflow for Report Management Crud Component.
   *
   * @returns Nothing.
   */
  manageDurationType() {
    this.unsubscribeSubscription(this.durationTypeChangesSub);
    this.durationTypeChangesSub = this.reportMeta
      .get('duration_type')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((val) => {
        this.configureDurationControls(val);
      });
  }

  /**
   * Handles error for the current workflow.
   *
   * @param err - HTTP or validation error returned by the API.
   * @returns Nothing.
   */
  handleError(err: any) {
    // Forward nested backend errors to the active child form before mapping parent errors.
    this.crudSvc.announceHandleError(err?.report_meta || err);
    this.formErrors = this.crudSvc.resetFormErrors();
    if (err?.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
        if (field === 'report_meta') {
          this.mapReportMetaErrors(err[field]);
        }
      }
    } else {
      this.notification.error(
        new Notification('Something went wrong!! Please try again.')
      );
    }
    this.spinner.stop('main');
  }

  private mapReportMetaErrors(errors: any): void {
    // Backend report_meta validation returns nested keys; parent template renders these under formErrors.report_meta.
    if (!errors) {
      return;
    }
    for (const field in errors) {
      if (field in this.formErrors.report_meta) {
        this.formErrors.report_meta[field] = Array.isArray(errors[field])
          ? errors[field][0]
          : errors[field];
      }
    }
  }

  /**
   * Handles the submit event from the template.
   *
   * @returns Nothing.
   */
  onSubmit() {
    this.crudSvc.annouceSubmit();
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(
        this.form,
        this.validationMessages,
        this.formErrors
      );
      if (!this.formValueChangesBound) {
        this.formValueChangesBound = true;
        this.form.valueChanges
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(() => {
            this.formErrors = this.utilService.validateForm(
              this.form,
              this.validationMessages,
              this.formErrors
            );
          });
      }
    }
  }

  /**
   * Executes the go back workflow for Report Management Crud Component.
   *
   * @returns Nothing.
   */
  goBack() {
    if (this.reportId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  /**
   * Returns a stable identity for module rows rendered by ngFor.
   *
   * @param _index - Index of the item rendered by ngFor.
   * @param module - Module value used by this method.
   * @returns A stable identity value for Angular change detection.
   */
  trackByModule(index: number, module: ModuleArrType): string {
    return module?.name || `${index}`;
  }

  /**
   * Returns a stable identity for model rows rendered by ngFor.
   *
   * @param _index - Index of the item rendered by ngFor.
   * @param model - Model value used by this method.
   * @returns A stable identity value for Angular change detection.
   */
  trackByModel(index: number, model: ReportModelType): string {
    return model?.model_name || `${index}`;
  }

  /**
   * Returns a stable identity for name rows rendered by ngFor.
   *
   * @param _index - Index of the item rendered by ngFor.
   * @param item - Item value used by this method.
   * @returns A stable identity value for Angular change detection.
   */
  trackByName(index: number, item: any): string {
    return item?.name || `${index}`;
  }

  /**
   * Returns a stable identity for uuid rows rendered by ngFor.
   *
   * @param _index - Index of the item rendered by ngFor.
   * @param item - Item value used by this method.
   * @returns A stable identity value for Angular change detection.
   */
  trackByUuid(index: number, item: any): string {
    return item?.uuid || item?.name || `${index}`;
  }

  private unsubscribeValueChangeSubscriptions(): void {
    this.unsubscribeSubscription(this.executionTypeChangesSub);
    this.unsubscribeSubscription(this.moduleNameChangesSub);
    this.unsubscribeSubscription(this.reportSubTypeChangesSub);
    this.unsubscribeSubscription(this.durationTypeChangesSub);
  }

  private resetReportTypeSubscriptions(): void {
    this.unsubscribeSubscription(this.executionTypeChangesSub);
    this.unsubscribeSubscription(this.moduleNameChangesSub);
    this.unsubscribeSubscription(this.reportSubTypeChangesSub);
    this.unsubscribeSubscription(this.durationTypeChangesSub);
  }

  private unsubscribeSubscription(subscription: Subscription): void {
    if (subscription && !subscription.closed) {
      subscription.unsubscribe();
    }
  }

  private setReportMetaControl(name: string, control: FormControl): void {
    // setControl avoids duplicate-control errors when edit data already added a dynamic control.
    if (this.reportMeta.get(name)) {
      this.reportMeta.setControl(name, control);
    } else {
      this.reportMeta.addControl(name, control);
    }
  }

  private removePerformanceControls(): void {
    this.reportMeta.removeControl('sub_type');
    this.reportMeta.removeControl('duration_type');
    this.reportMeta.removeControl('hour');
    this.reportMeta.removeControl('min');
    this.reportMeta.removeControl('from_duration');
    this.reportMeta.removeControl('to_duration');
  }

  private getInitialFeature(): string {
    // Direct update URLs must not depend on stale session feature state.
    if (this.reportId && this.selectedReport?.feature) {
      return this.selectedReport.feature;
    }
    return (
      this.storageService.getByKey('feature', StorageType.SESSIONSTORAGE) ||
      this.form.get('feature').value
    );
  }

  private getReportMetaValueForFeature(
    feature: string,
    key: string,
    fallback: any
  ): any {
    const reportMeta = this.selectedReport?.report_meta as any;
    return this.isSelectedReportFeature(feature) &&
      reportMeta &&
      reportMeta[key] !== undefined
      ? reportMeta[key]
      : fallback;
  }

  private isSelectedReportFeature(feature: string): boolean {
    return this.selectedReport?.feature === feature;
  }
}
