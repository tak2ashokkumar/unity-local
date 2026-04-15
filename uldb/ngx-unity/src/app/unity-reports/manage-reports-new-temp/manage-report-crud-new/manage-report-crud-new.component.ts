import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CloudInventoryMetaData, ManageReportCrudNewService, ModuleArrType, ReportFormData, ReportModelType, ReportModuleType } from './manage-report-crud-new.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import moment from 'moment';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'manage-report-crud-new',
  templateUrl: './manage-report-crud-new.component.html',
  styleUrls: ['./manage-report-crud-new.component.scss'],
  providers: [ManageReportCrudNewService]
})
export class ManageReportCrudNewComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  // @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();
  reportId: string = null;
  action: 'Create' | 'Update';

  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';
  invalidForms: boolean = false;
  maxDate: string = moment().format('YYYY-MM-DD');

  selectedReport: ReportFormData;
  workflowIntegration: any;
  // isCloudTypeEnabled: boolean = false;

  unityOneITSMTable: any;
  // unityOneTableLoaded = false;

  dynamicReportModulesSrc: ReportModuleType[] = [];
  dynamicReportModulesArr: ModuleArrType[] = [];
  dynamicReportModelsArr: ReportModelType[] = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private crudSvc: ManageReportCrudNewService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private notificationService: AppNotificationService,
    private storageService: StorageService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.reportId = params.get('reportId');
    });
    this.crudSvc.invalidAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.invalidForms = true;
    });
  }

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

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getReportById() {
    this.crudSvc.getReportById(this.reportId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedReport = res;
      this.buildForm();
    }, err => {
      this.notification.error(new Notification('Error while fetching report!! Please try again.'));
    });
  }

  getDynamicReportModules() {
    this.crudSvc.getDynamicReportModules().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.dynamicReportModulesSrc = res;
      this.dynamicReportModulesArr = [];
      res.forEach((val:ReportModuleType) => {
        this.dynamicReportModulesArr.push({ name: val.module_name, display_name: val.module_display_name })
      });
      const moduleName = this.reportMeta.get('module_name')?.value;
      this.dynamicReportModelsArr = module ? this.findModelsByModuleName(moduleName) : [];
    }, err => {
      this.notification.error(new Notification('Error while fetching dynamic report modules!! Please try again.'));
    });
  }

  get cloudType(): string {
    return this.reportMeta ? this.reportMeta.get('cloud_type').value : '';
  }

  get executionType(): string {
    return this.reportMeta ? this.reportMeta.get('execution_type').value : '';
  }

  get tableUuid(): string {
    return this.reportMeta ? this.reportMeta.get('table').value : '';
  }

  get workflowIntegrationValue(): string {
    return this.reportMeta ? this.reportMeta.get('workflow_integration')?.value : '';
  }

  get reportMeta(): FormGroup {
    return this.form.get("report_meta") as FormGroup;
  }

  get isDynamic(): boolean{
    return this.form.get('feature')?.value == 'Dynamic';
  }

  get dynamicModule(): string{
    return this.reportMeta?.get('module_name') ? this.reportMeta.get('module_name')?.value : '';
  }

  get dynamicModel(): string{
    return this.reportMeta?.get('model_name') ? this.reportMeta.get('model_name')?.value : '';
  }

  onReportTypeChange(selectedType: string) {
    this.crudSvc.setReportType(selectedType);
  }

  // childFormData($event: ManageReportDatacenterFormData | ManageReportPrivateCloudFormData | ManageReportPublicCloudFormData | ManageReportEventFormData) {
  childFormData($event: CloudInventoryMetaData) {
    let childFormData = $event;
    if (this.form.valid) {
      this.invalidForms = false;
      let fd = <ReportFormData>this.form.getRawValue();
      fd.report_meta = Object.assign({},fd.report_meta, childFormData);
      this.submitFinalFormData(fd);
    }
  }

  submitFinalFormData(fd: ReportFormData) {
    this.spinner.start('main');
    if (this.reportId) {
      this.crudSvc.updateReport(this.reportId, fd).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Report updated successfully.'));
        // this.onCrud.emit(CRUDActionTypes.ADD);
        this.router.navigate(['../../'], { relativeTo: this.route });
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notificationService.error(new Notification('Error while updating Report. Please try again'));
        this.handleError(err.error);
      });
    } else {
      this.crudSvc.createReport(fd).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Report created successfully.'));
        // this.onCrud.emit(CRUDActionTypes.ADD);
        this.router.navigate(['../'], { relativeTo: this.route });
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notificationService.error(new Notification('Error while creating Report. Please try again'));
        this.handleError(err.error);
      });
    }
  };

  buildForm() {
    this.spinner.start('main');
    this.form = this.crudSvc.buildForm(this.selectedReport);
    this.validationMessages = this.crudSvc.validationMessages;
    this.formErrors = this.crudSvc.resetFormErrors();   
    this.manageFormSubscription();
    this.form.patchValue({ 'feature': this.storageService.getByKey('feature', StorageType.SESSIONSTORAGE) });
    if (this.isDynamic) {
      this.form.get('feature').disable({ emitEvent: false });
      // if (this.reportId) {
      //   setTimeout(() => {
      //     this.reportMeta.get('module_name').setValue(this.selectedReport.report_meta.module_name)
      //     this.reportMeta.get('model_name').setValue(this.selectedReport.report_meta.model_name)
      //   }, 50);
      // }
    }
    else {
      this.form.get('feature').enable({ emitEvent: false });
      this.form.get('feature').setValidators([Validators.required, NoWhitespaceValidator]);
    }
    
    this.spinner.stop('main');
  }

  manageFormSubscription() {
    if (this.reportId) {
      if (this.selectedReport.feature == 'Performance') {
        this.reportMeta.addControl('sub_type', new FormControl(this.selectedReport.report_meta.sub_type, [Validators.required]));
        if (this.selectedReport?.report_meta?.sub_type != 'Latest') {
          this.reportMeta.addControl('duration_type', new FormControl(this.selectedReport.report_meta.duration_type, [Validators.required]));
          if (this.selectedReport?.report_meta?.duration_type == 'Last') {
            this.reportMeta.addControl('hour', new FormControl(this.selectedReport.report_meta.duration_values.hour, [Validators.required, Validators.max(23), Validators.min(0)]));
            this.reportMeta.addControl('min', new FormControl(this.selectedReport.report_meta.duration_values.min, [Validators.required, Validators.max(59), Validators.min(0)]));
          }
          if (this.selectedReport?.report_meta?.duration_type == 'Custom') {
            this.reportMeta.addControl('from_duration', new FormControl(new Date(this.selectedReport.report_meta.duration_values.from_duration), [Validators.required]));
            this.reportMeta.addControl('to_duration', new FormControl(new Date(this.selectedReport.report_meta.duration_values.to_duration), [Validators.required]));
          }
          this.manageReportSubType();
          this.manageDurationType();
        }
      }
      if (this.selectedReport.feature == 'DevOps Automation') {
        this.reportMeta.addControl('execution_type', new FormControl(this.selectedReport.report_meta.execution_type, [Validators.required]));
      } else {
        this.reportMeta.removeControl('execution_type');
      }

      if (this.selectedReport.report_meta.execution_type === 'Workflow Integration') {
        this.getWorkflowIntegration();
        this.reportMeta.addControl('workflow_integration', new FormControl(this.selectedReport.report_meta.workflow_integration, [Validators.required]));
      } else {
        this.reportMeta.removeControl('workflow_integration');
      }

      if (this.selectedReport.feature == 'UnityOne ITSM') {
        // this.getUnityOneITSMTable();
        this.reportMeta.addControl('table', new FormControl(this.selectedReport.report_meta.table, [Validators.required]));
      } else {
        this.reportMeta.removeControl('table');
      }

      // if (this.selectedReport.feature == 'Dynamic') {
      //   // this.getDynamicReportModules();
      //   this.reportMeta.addControl('module_name', new FormControl(this.selectedReport.report_meta.module_name, [Validators.required, NoWhitespaceValidator]));
      //   this.reportMeta.addControl('model_name', new FormControl(this.selectedReport.report_meta.model_name, [Validators.required, NoWhitespaceValidator]));
      //   // this.manageModuleAndModelSubscription();
      // }
    }

    //check this
    // if(this.form.get('feature').value == 'Performance'){
    //   this.reportMeta.addControl('sub_type', new FormControl('', [Validators.required]));
    //   this.manageReportSubType();
    // }
    
    // reset everything once report type changed
    this.form.get('feature').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value === 'Cloud Inventory') {
        let cloudSelected = this.selectedReport?.report_meta?.cloud_type ? this.selectedReport.report_meta.cloud_type : 'Public';
        this.reportMeta.addControl('cloud_type', new FormControl(cloudSelected, [Validators.required, NoWhitespaceValidator]));
      }
      else {
        this.reportMeta.removeControl('cloud_type');
      }
      if (value == 'Performance') {
        this.reportMeta.addControl('sub_type', new FormControl('', [Validators.required]));
        this.manageReportSubType();
      } else {
        this.reportMeta.removeControl('sub_type');
        this.reportMeta.removeControl('duration_type');
        this.reportMeta.removeControl('hour');
        this.reportMeta.removeControl('min');
        this.reportMeta.removeControl('from_duration');
        this.reportMeta.removeControl('to_duration');
      }
      if (value === 'DevOps Automation') {
        this.reportMeta.addControl('execution_type', new FormControl('', [Validators.required, NoWhitespaceValidator]));
        this.reportMeta.get('execution_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(executionType => {
          if (executionType === 'Workflow Integration') {
            this.getWorkflowIntegration();
            this.reportMeta.addControl('workflow_integration', new FormControl('', [Validators.required]));
          } else {
            this.reportMeta.removeControl('workflow_integration');
          }
        });
      }
      else {
        this.reportMeta.removeControl('execution_type');
      }
      if (value === 'UnityOne ITSM') {
        this.getUnityOneITSMTable();
        this.reportMeta.addControl('table', new FormControl('', [Validators.required]));
      } else {
        this.reportMeta.removeControl('table');
      }

      if (value === 'Dynamic') {
        this.getDynamicReportModules();
        const moduleName = this.selectedReport?.report_meta?.module_name ? this.selectedReport.report_meta.module_name : '';
        const modelName = this.selectedReport?.report_meta?.model_name ? this.selectedReport.report_meta.model_name : '';
        if (!this.reportMeta.get('module_name')) {
          this.reportMeta.addControl('module_name', new FormControl(moduleName, [Validators.required, NoWhitespaceValidator]));
        }
        else {
          this.reportMeta.get('module_name').setValue(moduleName);
        }
        if (!this.reportMeta.get('model_name')) {
          this.reportMeta.addControl('model_name', new FormControl(modelName, [Validators.required, NoWhitespaceValidator]));
        }
        else {
          this.reportMeta.get('model_name').setValue(modelName);
        }

        this.manageModuleAndModelSubscription();
      }
      else {
        this.reportMeta.removeControl('module_name');
        this.reportMeta.removeControl('model_name');
        this.dynamicReportModulesArr = [];
        this.dynamicReportModelsArr = [];
      }
    });
  }

  // Function to find models by module name
  findModelsByModuleName(type: string): ReportModelType[] {
    for (const module of this.dynamicReportModulesSrc) {
      if (module.module_name === type) {
        return module.models;
      }
    }
    return [];  // Return [] if no match is found
  }

  manageModuleAndModelSubscription() {
    this.reportMeta.get('module_name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(module => {
        this.reportMeta.get('model_name').setValue('');
        this.dynamicReportModelsArr = module ? this.findModelsByModuleName(module) : [];
        // this.crudSvc.resetDynamicFiltersAndFields(true);
    });
    
    // this.reportMeta.get('model_name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(model => {
    //     // this.crudSvc.resetDynamicFiltersAndFields(true);
    // });
  }

  getWorkflowIntegration() {
    this.crudSvc.getWorkflowIntegration().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.workflowIntegration = res.results;
    }, err => {
      this.notification.error(new Notification('Error while fetching report!! Please try again.'));
    });
  }

  getUnityOneITSMTable() {
    this.crudSvc.getUnityOneITSMTable().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.unityOneITSMTable = res.results;
    }, err => {
      this.notification.error(new Notification('Error while fetching Table Data!! Please try again.'));
    });
  }

  manageReportSubType() {
    this.reportMeta.get('sub_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val != 'Latest') {
        this.reportMeta.addControl('duration_type', new FormControl('Last', [Validators.required]));
        this.reportMeta.addControl('hour', new FormControl(0, [Validators.required, Validators.max(23), Validators.min(0)]));
        this.reportMeta.addControl('min', new FormControl(5, [Validators.required, Validators.max(59), Validators.min(0)]));
        this.manageDurationType();
      } else {
        this.reportMeta.removeControl('duration_type');
        this.reportMeta.removeControl('hour');
        this.reportMeta.removeControl('min');
        this.reportMeta.removeControl('from_duration');
        this.reportMeta.removeControl('to_duration');
      }
    });
  }

  manageDurationType() {
    this.reportMeta.get('duration_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val == 'Last') {
        this.reportMeta.addControl('hour', new FormControl(0, [Validators.required, Validators.max(23), Validators.min(0)]));
        this.reportMeta.addControl('min', new FormControl(5, [Validators.required, Validators.max(59), Validators.min(0)]));
        this.reportMeta.removeControl('from_duration');
        this.reportMeta.removeControl('to_duration');
      } else {
        this.reportMeta.addControl('from_duration', new FormControl('', [Validators.required]));
        this.reportMeta.addControl('to_duration', new FormControl('', [Validators.required]));
        this.reportMeta.removeControl('hour');
        this.reportMeta.removeControl('min');
      }
    });
  }

  handleError(err: any) {
    this.crudSvc.announceHandleError(err);
    this.formErrors = this.crudSvc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmit() {
    this.crudSvc.annouceSubmit();
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      });
    }
    else {
      // console.log('Form Submit Parent',this.form.getRawValue())
    }
  }

  goBack() {
    if (this.reportId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
