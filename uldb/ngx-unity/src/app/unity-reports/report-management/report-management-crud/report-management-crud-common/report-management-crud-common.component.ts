import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  DateTimeAdapter,
  MomentDateTimeAdapter,
  OWL_DATE_TIME_FORMATS,
  OWL_DATE_TIME_LOCALE,
} from '@busacca/ng-pick-datetime';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import {
  AppUtilityService,
  NoWhitespaceValidator,
} from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { QueryBuilderComponent } from 'src/app/shared/query-builder/query-builder.component';
import {
  QueryBuilderClassNames,
  QueryBuilderConfig,
} from 'src/app/shared/query-builder/query-builder.interfaces';
import {
  ReportFormData,
  ReportManagementCrudService,
} from '../report-management-crud.service';
import { DynamicReportsFieldMeta } from './report-crud-common.type';
import { queryBuilderClassNames } from './report-crud.const';
import { ReportManagementCrudCommonService } from './report-management-crud-common.service';

export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'MMM DD, YYYY hh:mm A',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

/**
 * Coordinates the Report Management Crud Common screen state, template bindings, and user actions.
 */
@Component({
  selector: 'report-management-crud-common',
  templateUrl: './report-management-crud-common.component.html',
  styleUrls: ['./report-management-crud-common.component.scss'],
  providers: [
    ReportManagementCrudCommonService,
    {
      provide: DateTimeAdapter,
      useClass: MomentDateTimeAdapter,
      deps: [OWL_DATE_TIME_LOCALE],
    },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
  ],
})
export class ReportManagementCrudCommonComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  private formChangesUnsubscribe = new Subject<void>();
  private formValueChangesBound = false;
  private selectFieldValidationControls: FormGroup[] = [];
  /**
   * Receives report data from the parent CRUD component for edit mode.
   */
  @Input('reportdata') reportdata: ReportFormData;
  /**
   * Stores the selected report type used to configure report metadata.
   */
  @Input('reporttype') reportType: string;
  /**
   * Stores the dynamic module value used by Report Management Crud Common Component.
   */
  @Input('module') dynamicModule: string;
  /**
   * Stores the dynamic model value used by Report Management Crud Common Component.
   */
  @Input('model') dynamicModel: string;

  /**
   * Emits child form data back to the parent report CRUD component.
   */
  @Output('formdata') formData = new EventEmitter<any>();
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
   * Stores the active report identifier from the current route or row action.
   */
  reportId: string = null;

  /**
   * Configures the proc func options UI behavior.
   */
  procFuncOptionsSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: true,
    checkedStyle: 'none',
    buttonClasses: 'btn btn-default btn-block',
    selectionLimit: 1,
    autoUnselect: true,
    closeOnSelect: true,
    dynamicTitleMaxItems: 1,
  };

  /**
   * Configures the summary func options UI behavior.
   */
  summaryFuncOptionsSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
  };

  //query builder
  /**
   * Stores the query builder config value used by Report Management Crud Common Component.
   */
  queryBuilderConfig: QueryBuilderConfig;
  /**
   * Stores the query builder class names value used by Report Management Crud Common Component.
   */
  queryBuilderClassNames: QueryBuilderClassNames = queryBuilderClassNames;
  /**
   * Stores the query builder value used by Report Management Crud Common Component.
   */
  @ViewChild('queryBuilder') queryBuilder: QueryBuilderComponent;

  /**
   * Stores the allow ruleset value used by Report Management Crud Common Component.
   */
  public allowRuleset: boolean = true;
  /**
   * Stores the allow collapse value used by Report Management Crud Common Component.
   */
  public allowCollapse: boolean = false;
  /**
   * Stores the persist value on field change value used by Report Management Crud Common Component.
   */
  public persistValueOnFieldChange: boolean = false;

  /**
   * Stores the fields meta data value used by Report Management Crud Common Component.
   */
  fieldsMetaData: DynamicReportsFieldMeta[];
  /**
   * Stores the processing func list collection used by the template or payload builder.
   */
  processingFuncList: any[] = [];
  /**
   * Stores the summary func list collection used by the template or payload builder.
   */
  summaryFuncList: any[] = ['sum', 'max', 'min', 'avg', 'total'];

  /**
   * Stores the current module value used by Report Management Crud Common Component.
   */
  currentModule: string;
  /**
   * Stores the current model value used by Report Management Crud Common Component.
   */
  currentModel: string;

  constructor(
    private svc: ReportManagementCrudCommonService,
    private spinner: AppSpinnerService,
    private crudSvc: ReportManagementCrudService,
    private builder: FormBuilder,
    private utilService: AppUtilityService
  ) {
    this.crudSvc.submitAnnounced$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.submit();
      });
    this.crudSvc.errorAnnounced$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((err) => {
        this.handleError(err);
      });
    // this.crudSvc.dynamicModel$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(reset => {
    //   if(reset){
    //     // this.resetDynamicFiltersAndFields();
    //   }
    // });
  }

  /**
   * Initializes Report Management Crud Common Component data and subscriptions.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.spinner.start('main');
    this.currentModule = _clone(this.dynamicModule);
    this.currentModel = _clone(this.dynamicModel);
    if (this.reportdata) {
      this.reportId = this.reportdata.uuid;
    }
    this.buildForm();
  }

  /**
   * Executes the ng on changes workflow for Report Management Crud Common Component.
   *
   * @param changes - Changes value used by this method.
   * @returns Nothing.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.dynamicModule?.currentValue) {
      this.dynamicModule = changes.dynamicModule.currentValue;
    }
    if (changes?.dynamicModel?.currentValue) {
      this.dynamicModel = changes.dynamicModel.currentValue;
      // Model changes require fresh query/filter metadata from the backend.
      this.getDynamicReportQueryFiltersMeta();
      this.getDynamicReportQueryFieldsMeta();
      if (
        this.dynamicModel &&
        this.dynamicModel != this.currentModel &&
        !changes?.dynamicModel?.firstChange
      ) {
        this.currentModel = _clone(changes.dynamicModel.currentValue);
        this.resetDynamicFiltersAndFields();
      }
    }
  }

  /**
   * Releases Report Management Crud Common Component subscriptions and pending UI work.
   *
   * @returns Nothing.
   */
  ngOnDestroy(): void {
    this.formChangesUnsubscribe.next();
    this.formChangesUnsubscribe.complete();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Loads or returns dynamic report query filters meta for the current workflow.
   *
   * @returns Nothing.
   */
  getDynamicReportQueryFiltersMeta() {
    if (!this.dynamicModule || !this.dynamicModel) {
      return;
    }
    // To reset query builder to initial state
    this.queryBuilderConfig = undefined;
    this.svc
      .getDynamicReportFilterMetaData(this.dynamicModule, this.dynamicModel)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        if (res.length) {
          this.svc
            .updateChoices(res)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((updatedData) => {
              this.queryBuilderConfig = this.svc.convert(updatedData);
              this.spinner.stop('main');
            });
        }
      });
  }

  /**
   * Loads or returns dynamic report query fields meta for the current workflow.
   *
   * @returns Nothing.
   */
  getDynamicReportQueryFieldsMeta() {
    if (!this.dynamicModule || !this.dynamicModel) {
      return;
    }
    this.fieldsMetaData = [];
    this.svc
      .getDynamicReportFieldMetaData(this.dynamicModule, this.dynamicModel)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        if (res.length) {
          this.svc
            .updateChoices(res)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((updatedData) => {
              this.fieldsMetaData = updatedData;
            });
          // this.setQueryFieldsConfig(this.fieldsMetaData);
        }
        this.spinner.stop('main');
      });
    //get data processing function list- for now common for all fields
    this.svc
      .getDataProcessingFunctionData()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        if (res.length) {
          this.processingFuncList = res;
        }
      });
  }

  /**
   * Resets dynamic filters and fields to its default state.
   *
   * @returns Nothing.
   */
  resetDynamicFiltersAndFields() {
    // Switching models invalidates saved query rules and selected fields.
    if (this.reportdata) {
      this.reportdata.report_meta.select_fields = [];
      this.reportdata.report_meta.query_meta = [];
    }
    this.form?.get('query_meta')?.setValue(null);
    let fieldFormArr = this.svc.createSelectFieldsArray();
    this.form?.get('select_fields')?.setValue(fieldFormArr.value);
  }

  // setQueryFieldsConfig(fieldsJson : DynamicReportsFieldMeta[]){
  //   this.fieldsList = [];
  //   this.processingFuncList = [][];
  //   this.summaryFunctionList = [][];
  //   fieldsJson.forEach((field:DynamicReportsFieldMeta, index)=>{
  //      this.fieldsList.push({ name: field.display_name, value: field.name });
  //      this.processingFuncList[index] = this.svc.getDataProcessingFunctionData(field.name);
  //      this.summaryFunctionList[index] = this.svc.getDataSummaryFunctionData(field.name);
  //   })
  // }

  /**
   * Returns the select fields value used by this component.
   *
   * @returns The derived value for the current component state.
   */
  get selectFields(): FormArray {
    return this.form.get('select_fields') as FormArray;
  }

  /**
   * Builds form used by the current workflow.
   *
   * @returns Nothing.
   */
  buildForm() {
    this.formChangesUnsubscribe.next();
    this.formValueChangesBound = false;
    this.selectFieldValidationControls = [];
    this.form = this.svc.buildForm(this.reportdata);
    this.formErrors = this.svc.resetFormErrors();
    if (this.selectFields) {
      for (let index = 0; index < this.selectFields.length - 1; index++) {
        this.formErrors.select_fields.push(this.svc.getSelectFieldsErrors());
      }
    }
    this.validationMessages = this.svc.validationMessages;

    // this.manageFormsubscribtion();
    this.spinner.stop('main');
  }

  // manageFormsubscribtion() {
  //   if (this.selectFields) {
  //     this.selectFields.controls.forEach((group: AbstractControl, index: number) => {
  //       this.subscribeToSelectFieldChange(group, index);
  //     });
  //   }
  // }

  // subscribeToSelectFieldChange(group: AbstractControl, index: number) {
  //   const fieldControl = group.get('name');
  //   if (!fieldControl) return;
  //   fieldControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(field => {
  //     if (!field) return;
  //   });
  // }

  /**
   * Updates show as field for the current workflow.
   *
   * @param name - Name value used by this method.
   * @param i - I value used by this method.
   * @returns Nothing.
   */
  updateShowAsField(name: string, i: number) {
    // Default display name follows the selected metadata field label.
    let formGroup = <FormGroup>this.selectFields.at(i);
    let field = this.fieldsMetaData.find((f) => f.name == name);
    formGroup.get('show_as').setValue(field.display_name);
    formGroup.get('data_processing_fn').setValue([]);
    formGroup.get('summary_fn').setValue([]);
  }

  /**
   * Adds select fields to the current workflow.
   *
   * @param i - I value used by this method.
   * @returns Nothing.
   */
  addSelectFields(i: number) {
    let fields = <FormGroup>this.selectFields.at(i);
    if (fields.invalid) {
      this.formErrors.select_fields[i] = this.utilService.validateForm(
        fields,
        this.validationMessages.select_fields,
        this.formErrors.select_fields[i]
      );
      this.bindSelectFieldValidation(fields, i);
    } else {
      let newParamControl = this.builder.group({
        name: ['', [Validators.required, NoWhitespaceValidator]],
        show_as: ['', [Validators.required, NoWhitespaceValidator]],
        data_processing_fn: [[]],
        summary_fn: [[]],
      });
      this.formErrors.select_fields.push(this.svc.getSelectFieldsErrors());
      this.selectFields.push(newParamControl);

      // this.subscribeToSelectFieldChange(newParamControl, this.selectFields.length - 1);
    }
  }

  /**
   * Removes select fields from the current workflow.
   *
   * @param i - I value used by this method.
   * @returns Nothing.
   */
  removeSelectFields(i: number) {
    if (this.selectFields.length > 1) {
      this.selectFields.removeAt(i);
      this.formErrors.select_fields.splice(i, 1);
    }
    // this.processingFuncList.splice(i, 1)
    // this.summaryFunctionList.splice(i, 1)
  }

  /**
   * Handles error for the current workflow.
   *
   * @param err - HTTP or validation error returned by the API.
   * @returns Nothing.
   */
  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
    if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    }
  }

  /**
   * Executes the submit workflow for Report Management Crud Common Component.
   *
   * @returns Nothing.
   */
  submit() {
    if (this.form.invalid) {
      this.crudSvc.annouceInvalid();
      this.formErrors = this.utilService.validateForm(
        this.form,
        this.validationMessages,
        this.formErrors
      );
      this.bindFormValidation();
    } else {
      // Let the query-builder normalize its form control value before parent submission.
      if (this.queryBuilder) {
        this.queryBuilder.submit();
      }
      let form = this.form.getRawValue();
      const obj = Object.assign({}, form);
      this.formData.emit(obj);
    }
  }

  private bindSelectFieldValidation(fields: FormGroup, index: number): void {
    // Repeated invalid add attempts should not register duplicate row subscriptions.
    if (this.selectFieldValidationControls.indexOf(fields) >= 0) {
      return;
    }
    this.selectFieldValidationControls.push(fields);
    fields.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        takeUntil(this.formChangesUnsubscribe)
      )
      .subscribe(() => {
        this.formErrors.select_fields[index] = this.utilService.validateForm(
          fields,
          this.validationMessages.select_fields,
          this.formErrors.select_fields[index]
        );
      });
  }

  private bindFormValidation(): void {
    // Whole-form validation should be subscribed once per form instance.
    if (this.formValueChangesBound) {
      return;
    }
    this.formValueChangesBound = true;
    this.form.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        takeUntil(this.formChangesUnsubscribe)
      )
      .subscribe(() => {
        this.formErrors = this.utilService.validateForm(
          this.form,
          this.validationMessages,
          this.formErrors
        );
      });
  }

  /**
   * Returns a stable identity for control rows rendered by ngFor.
   *
   * @param _index - Index of the item rendered by ngFor.
   * @param control - Control value used by this method.
   * @returns A stable identity value for Angular change detection.
   */
  trackByControl(_index: number, control: AbstractControl): AbstractControl {
    return control;
  }

  /**
   * Returns a stable identity for dynamic field rows rendered by ngFor.
   *
   * @param _index - Index of the item rendered by ngFor.
   * @param field - Field value used by this method.
   * @returns A stable identity value for Angular change detection.
   */
  trackByDynamicField(index: number, field: DynamicReportsFieldMeta): string {
    return field?.name || `${index}`;
  }
}
