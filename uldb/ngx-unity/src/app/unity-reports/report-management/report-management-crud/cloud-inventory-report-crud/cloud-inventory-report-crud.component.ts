import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  DateTimeAdapter,
  MomentDateTimeAdapter,
  OWL_DATE_TIME_FORMATS,
  OWL_DATE_TIME_LOCALE,
} from '@busacca/ng-pick-datetime';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import {
  AppUtilityService,
  NoWhitespaceValidator,
} from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import {
  ReportFormData,
  ReportManagementCrudService,
} from '../report-management-crud.service';
import {
  AttributeDataType,
  FieldsDataType,
  FieldsViewData,
  OsDataType,
  ReportManagementCloudInventoryCrudService,
  ReportTypesMapping,
} from './cloud-inventory-report-crud.service';

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
 * Coordinates the Report Management Cloud Inventory Crud screen state, template bindings, and user actions.
 */
@Component({
  selector: 'report-management-cloud-inventory-crud',
  templateUrl: './cloud-inventory-report-crud.component.html',
  styleUrls: ['./cloud-inventory-report-crud.component.scss'],
  providers: [
    ReportManagementCloudInventoryCrudService,
    {
      provide: DateTimeAdapter,
      useClass: MomentDateTimeAdapter,
      deps: [OWL_DATE_TIME_LOCALE],
    },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
  ],
})
export class ReportManagementCloudInventoryCrudComponent
  implements OnInit, OnDestroy
{
  private ngUnsubscribe = new Subject<void>();
  private formChangesUnsubscribe = new Subject<void>();
  private formValueChangesBound = false;
  private filterValidationControls: AbstractControl[] = [];
  /**
   * Receives report data from the parent CRUD component for edit mode.
   */
  @Input('reportdata') reportdata: ReportFormData;
  /**
   * Stores the selected report type used to configure report metadata.
   */
  @Input('reporttype') reportType: string;
  /**
   * Stores the cloud type value used by Report Management Cloud Inventory Crud Component.
   */
  @Input('cloudtype') cloudType: string;
  /**
   * Stores the execution type value used by Report Management Cloud Inventory Crud Component.
   */
  @Input('executiontype') executionType: string;
  /**
   * Stores the workflow integration value value used by Report Management Cloud Inventory Crud Component.
   */
  @Input('workflowintegration') workflowIntegrationValue: string;
  /**
   * Stores the table uuid value used by Report Management Cloud Inventory Crud Component.
   */
  @Input('tableUuid') tableUuid: string;

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
   * Stores the attribute list collection used by the template or payload builder.
   */
  attributeList: AttributeDataType[] = [];
  /**
   * Stores the operator list collection used by the template or payload builder.
   */
  operatorList: any[] = [];
  /**
   * Stores the option type value used by Report Management Cloud Inventory Crud Component.
   */
  optionType: string[] = [];
  /**
   * Stores the option list collection used by the template or payload builder.
   */
  optionList: any[] = [];

  /**
   * Stores the fields data value used by Report Management Cloud Inventory Crud Component.
   */
  fieldsData: FieldsDataType;
  /**
   * Stores the selected fields list array collection used by the template or payload builder.
   */
  selectedFieldsListArray = [];
  /**
   * Stores the all fields list array collection used by the template or payload builder.
   */
  allFieldsListArray = [];
  /**
   * Stores the all selected count value used by Report Management Cloud Inventory Crud Component.
   */
  allSelectedCount: number = 0;
  /**
   * Stores the selected fields count value used by Report Management Cloud Inventory Crud Component.
   */
  selectedFieldsCount: number = 0;
  /**
   * Stores the selected fields checked value used by Report Management Cloud Inventory Crud Component.
   */
  selectedFieldsChecked: boolean = false;
  /**
   * Stores the all fields checked value used by Report Management Cloud Inventory Crud Component.
   */
  allFieldsChecked: boolean = false;
  /**
   * Stores the current cloud value used by Report Management Cloud Inventory Crud Component.
   */
  currentCloud: string;
  /**
   * Stores the current execution type value used by Report Management Cloud Inventory Crud Component.
   */
  currentExecutionType: string;
  /**
   * Stores the active report identifier from the current route or row action.
   */
  reportId: string = null;
  /**
   * Stores the current cloud data value used by Report Management Cloud Inventory Crud Component.
   */
  currentCloudData: ReportFormData;
  /**
   * Stores the current workflow integration value used by Report Management Cloud Inventory Crud Component.
   */
  currentWorkflowIntegration: string;
  /**
   * Stores the previous workflow integration value value used by Report Management Cloud Inventory Crud Component.
   */
  previousWorkflowIntegrationValue: string;
  /**
   * Stores the current table uuid value used by Report Management Cloud Inventory Crud Component.
   */
  currentTableUuid: string;
  /**
   * Stores the unity one initial change handled value used by Report Management Cloud Inventory Crud Component.
   */
  unityOneInitialChangeHandled = false;

  /**
   * Configures the simple option UI behavior.
   */
  simpleOptionSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
  };

  /**
   * Configures the option UI behavior.
   */
  optionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: false,
    keyToSelect: 'name',
  };

  constructor(
    private svc: ReportManagementCloudInventoryCrudService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
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
    this.crudSvc.reportType$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((reportType) => {
        if (reportType && this.reportdata) {
          this.resetFiltersAndFields();
        }
      });
  }

  /**
   * Initializes Report Management Cloud Inventory Crud Component data and subscriptions.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.spinner.start('main');
    this.currentCloud = this.cloudType;
    this.currentExecutionType = this.executionType;
    this.currentTableUuid = this.tableUuid;
    this.currentWorkflowIntegration = this.workflowIntegrationValue;
    if (this.reportdata) {
      this.currentCloudData = JSON.parse(JSON.stringify(this.reportdata));
      this.reportId = this.reportdata.uuid;
    }
    if (!this.isUnityOneITSM() || this.tableUuid) {
      this.getFieldsList();
      this.getFiltersList();
    }
    this.buildForm();
  }

  /**
   * Executes the ng on changes workflow for Report Management Cloud Inventory Crud Component.
   *
   * @returns Nothing.
   */
  ngOnChanges(): void {
    // need to refactor this.
    if (
      (this.cloudType && this.currentCloud) ||
      this.executionType ||
      this.tableUuid
    ) {
      if (this.reportdata) {
        // Preserve edit data only while the parent selector remains on the original report subtype.
        if (this.cloudType && this.currentCloud) {
          this.reportdata.report_meta.fields =
            this.currentCloud == this.cloudType
              ? this.currentCloudData?.report_meta?.fields
              : [];
          this.reportdata.report_meta.filters =
            this.currentCloud == this.cloudType
              ? this.currentCloudData?.report_meta?.filters
              : [];
        }
        if (this.executionType && this.currentExecutionType) {
          this.reportdata.report_meta.fields =
            this.currentExecutionType == this.executionType
              ? this.currentCloudData?.report_meta?.fields
              : [];
          this.reportdata.report_meta.filters =
            this.currentExecutionType == this.executionType
              ? this.currentCloudData?.report_meta?.filters
              : [];
        }
        if (this.tableUuid && this.currentTableUuid) {
          this.reportdata.report_meta.fields =
            this.currentTableUuid === this.tableUuid
              ? this.currentCloudData?.report_meta?.fields
              : [];
          this.reportdata.report_meta.filters =
            this.currentTableUuid === this.tableUuid
              ? this.currentCloudData?.report_meta?.filters
              : [];
        }
      }
      if (this.tableUuid) {
        this.getFieldsList();
      }
      if (!this.isUnityOneITSM() || this.unityOneInitialChangeHandled) {
        this.getFiltersList();
        this.setFields();
      }
      if (this.workflowIntegrationValue) {
        if (this.reportdata) {
          if (
            this.workflowIntegrationValue &&
            this.currentWorkflowIntegration
          ) {
            this.reportdata.report_meta.fields =
              this.currentWorkflowIntegration == this.workflowIntegrationValue
                ? this.currentCloudData?.report_meta?.fields
                : [];
            this.reportdata.report_meta.filters =
              this.currentWorkflowIntegration == this.workflowIntegrationValue
                ? this.currentCloudData?.report_meta?.filters
                : [];
          }
        }
        if (
          this.workflowIntegrationValue !==
          this.previousWorkflowIntegrationValue
        ) {
          this.getFieldsList();
          this.previousWorkflowIntegrationValue = this.workflowIntegrationValue;
        }
      }
      this.buildForm();
    }
    if (this.isUnityOneITSM()) {
      this.unityOneInitialChangeHandled = true;
    }
  }

  /**
   * Releases Report Management Cloud Inventory Crud Component subscriptions and pending UI work.
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
   * Builds form used by the current workflow.
   *
   * @returns Nothing.
   */
  buildForm() {
    // This child can rebuild when parent feature metadata changes, so form-level subscriptions are scoped per build.
    this.formChangesUnsubscribe.next();
    this.formValueChangesBound = false;
    this.filterValidationControls = [];
    this.form = this.svc.buildForm(this.reportdata);
    this.formErrors = this.svc.resetFormErrors();
    if (this.filters) {
      for (let index = 0; index < this.filters.length - 1; index++) {
        this.formErrors.filters.push(this.svc.getFilterErrors());
      }
    }
    this.validationMessages = this.svc.validationMessages;
    this.manageFormsubscribtion();
    this.spinner.stop('main');
  }

  /**
   * Resets filters and fields to its default state.
   *
   * @returns Nothing.
   */
  resetFiltersAndFields() {
    this.reportdata.report_meta.fields = [];
    this.reportdata.report_meta.filters = [];
  }

  /**
   * Executes the manage formsubscribtion workflow for Report Management Cloud Inventory Crud Component.
   *
   * @returns Nothing.
   */
  manageFormsubscribtion() {
    if (
      this.reportType == 'Cost Analysis' ||
      this.reportType == 'sustainability'
    ) {
      if (!this.period) {
        this.form.addControl('period', this.svc.getPeriodFormControls(null));
      }
      this.period
        .get('period_type')
        .valueChanges.pipe(
          takeUntil(this.ngUnsubscribe),
          takeUntil(this.formChangesUnsubscribe)
        )
        .subscribe((val) => {
          this.handleFormFieldsByScheduleType(val);
        });
    }

    if (this.filters) {
      this.filters.controls.forEach((group: AbstractControl, index: number) => {
        this.subscribeToAttributeChange(group, index);
        const attrControl = group.get('attribute');
        const attr = attrControl?.value;
        const op = group.get('operator').value;
        if (['OS Type'].includes(attr)) {
          this.updateOSTypeValues(attr, op, index);
          this.subscribeToOperatorChange(group, index);
        }
      });
    }
  }

  /**
   * Handles form fields by schedule type for the current workflow.
   *
   * @param val - Val value used by this method.
   * @returns Nothing.
   */
  handleFormFieldsByScheduleType(val: string) {
    if (val == 'last' || val == 'current') {
      this.period.get('start_date')
        ? this.period.removeControl('start_date')
        : null;
      this.period.get('end_date')
        ? this.period.removeControl('end_date')
        : null;
      this.period.addControl(
        'counter',
        new FormControl('', [Validators.required, NoWhitespaceValidator])
      );
      this.period.addControl(
        'range',
        new FormControl('', [Validators.required, NoWhitespaceValidator])
      );
    } else {
      this.period.get('counter') ? this.period.removeControl('counter') : null;
      this.period.get('range') ? this.period.removeControl('range') : null;
      this.period.addControl(
        'start_date',
        new FormControl('', [Validators.required, NoWhitespaceValidator])
      );
      this.period.addControl(
        'end_date',
        new FormControl('', [Validators.required, NoWhitespaceValidator])
      );
    }
  }

  /**
   * Removes duplicates from the current workflow.
   *
   * @param arr - Arr value used by this method.
   * @param key - Key value used by this method.
   * @returns The value produced by the workflow.
   */
  removeDuplicates(arr: OsDataType[], key: string): any[] {
    return arr.reduce((resultArr, item) => {
      if (item[key] && item[key].trim() !== '') {
        if (!resultArr.find((obj: any) => obj[key] === item[key])) {
          resultArr.push(item);
        }
      }
      return resultArr;
    }, []);
  }

  /**
   * Loads or returns filters list for the current workflow.
   *
   * @returns Nothing.
   */
  getFiltersList() {
    this.svc
      .getFilterData(
        this.reportType,
        this.cloudType,
        this.executionType,
        this.tableUuid
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.attributeList = res;
          this.operatorList = [];
          this.optionType = [];
          this.optionList = [];
          //For qucik fix - need to refactor this.
          for (let attr of this.attributeList) {
            // Some option lists are loaded lazily because their source APIs are report-type specific.
            if (attr.name == 'Cloud Type') {
              attr.options = this.svc.getCloudAttributeOptions(this.cloudType);
            }
            if (attr.name == 'Datacenter') {
              this.svc
                .getDatacenterOptions()
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((res) => {
                  res.map((dc) => {
                    let index = attr.options.findIndex(
                      (aop) => aop.uuid == dc.uuid
                    );
                    if (index < 0) {
                      attr.options.push({ name: dc.name, uuid: dc.uuid });
                    }
                  });
                });
            }
            if (attr.name == 'Cabinet') {
              this.svc
                .getDatacenterOptions()
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((res) => {
                  res.map((dc) => {
                    dc.cabinets.map((cb) => {
                      let index = attr.options.findIndex(
                        (aop) => aop.uuid == cb.uuid
                      );
                      if (index < 0) {
                        attr.options.push({ name: cb.name, uuid: cb.uuid });
                      }
                    });
                  });
                });
            }
            if (attr.name == 'Resource Type') {
              this.svc
                .getResourcTypesOptions(this.cloudType)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((res) => {
                  attr.options = res[0].concat(res[1], res[2]);
                });
            }
            if (attr.name == 'Location') {
              this.svc
                .getLocationOptions()
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((res) => {
                  res.map((dc) => {
                    let index = attr.options.findIndex(
                      (aop) => aop.location == dc.location
                    );
                    if (index < 0 && dc.location && dc.location != '') {
                      attr.options.push(dc.location);
                    }
                  });
                });
            }
            if (attr.name == 'Manufacturer') {
              this.svc
                .getManufacturerOptions()
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((res) => {
                  res.map((m) => {
                    attr.options.push(m.name);
                  });
                });
            }
            if (attr.name == 'Category') {
              this.svc
                .getCategoryOptions()
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((res) => {
                  let categories = [];
                  if (
                    (this.executionType === 'Task' && res.Task) ||
                    (this.executionType === 'Task and Workflow' && res.Task)
                  ) {
                    categories = res.Task.map((m) => m.category);
                  } else if (
                    this.executionType === 'Workflow' &&
                    res.Worklfow
                  ) {
                    categories = res.Worklfow.map((m) => m.category);
                  }
                  attr.options = [...categories];
                });
            }
            if (attr.name == 'Executed By' || attr.name == 'Created By') {
              this.svc
                .getUsers()
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((res) => {
                  attr.options = [];
                  res.map((user) => {
                    attr.options.push({ name: user.full_name, uuid: user.id });
                  });
                });
            }

            if (attr.name == 'OS Name') {
              this.svc
                .getOSVersions()
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((res) => {
                  attr.options = [];
                  if (res && res.length > 0) {
                    const osTypes = this.removeDuplicates(res, 'name');
                    osTypes.map((os) => {
                      attr.options.push({ name: os.name, uuid: os.id });
                    });
                  }
                });
            }
          }
          if (this.reportType === ReportTypesMapping.UNITYONEITSM) {
            this.loadReferenceFields();
          }

          if (
            this.reportdata?.report_meta?.filters &&
            this.reportType === ReportTypesMapping.UNITYONEITSM
          ) {
            setTimeout(() => {
              this.operatorList = [];
              this.optionType = [];
              this.optionList = [];

              this.reportdata.report_meta.filters.forEach((filter) => {
                const attr = this.attributeList.find(
                  (a) => a.value === filter.attribute
                );
                if (!attr) return;

                this.operatorList.push(attr.operators);
                this.optionType.push(attr.value_type);
                this.optionList.push(attr.options?.length ? attr.options : []);
              });
            });
          }

          if (this.reportdata?.report_meta?.filters) {
            this.reportdata.report_meta.filters.map((filter) => {
              let arr = this.attributeList.filter(
                (i) => i.value == filter.attribute
              )[0];
              this.operatorList.push(arr?.operators);
              this.optionType.push(arr?.value_type);
              this.optionList.push(
                arr?.options?.length > 0 ? arr?.options : []
              );
            });
          } else {
            this.operatorList.push(this.attributeList[0]?.operators);
          }
        },
        () => {
          this.notification.error(
            new Notification('Error while fetching Filters!! Please try again.')
          );
        }
      );
  }

  /**
   * Executes the load reference fields workflow for Report Management Cloud Inventory Crud Component.
   *
   * @returns Nothing.
   */
  loadReferenceFields(): void {
    // UnityOne reference fields require a second lookup for selectable record values.
    this.attributeList
      .filter((attr) => attr.field_type === 'REFERENCE' && attr.reference_table)
      .forEach((attr) => {
        this.svc
          .fetchReferenceOptions(attr, attr.reference_table)
          .pipe(
            takeUntil(this.ngUnsubscribe),
            takeUntil(this.formChangesUnsubscribe)
          )
          .subscribe();
      });
  }

  /**
   * Loads or returns fields list for the current workflow.
   *
   * @returns Nothing.
   */
  getFieldsList() {
    this.svc
      .getFieldsData(
        this.reportType,
        this.reportId,
        this.workflowIntegrationValue,
        this.tableUuid
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.fieldsData = res;
          this.setFields();
        },
        () => {
          this.notification.error(
            new Notification('Error while fetching Fields!! Please try again.')
          );
        }
      );
  }

  /**
   * Executes the set fields workflow for Report Management Cloud Inventory Crud Component.
   *
   * @returns Nothing.
   */
  setFields() {
    let res = this.fieldsData;
    let fieldsArr;
    if (this.reportType === 'Cloud Inventory') {
      fieldsArr = this.cloudType
        ? res?.data[this.cloudType]
        : res?.data?.Public;
    } else if (this.reportType === 'DevOps Automation') {
      if (this.executionType && res?.data[this.executionType]) {
        fieldsArr = res?.data[this.executionType];
      }
    } else {
      fieldsArr = res?.data;
    }
    this.allFieldsListArray = fieldsArr?.Unselected
      ? this.svc.convertFields(fieldsArr.Unselected)
      : [];
    this.selectedFieldsListArray = fieldsArr?.Selected
      ? this.svc.convertFields(fieldsArr.Selected)
      : [];
    if (this.reportdata?.report_meta?.fields) {
      this.selectedFieldsListArray = this.svc.convertFields(
        this.reportdata.report_meta.fields
      );
    }
    this.setFieldsFormValue();
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
   * Returns the filters value used by this component.
   *
   * @returns The derived value for the current component state.
   */
  get filters(): FormArray {
    return this.form.get('filters') as FormArray;
  }

  /**
   * Returns the period value used by this component.
   *
   * @returns The derived value for the current component state.
   */
  get period(): FormGroup {
    return this.form.get('period') as FormGroup;
  }

  private isUnityOneITSM(): boolean {
    return this.reportType === ReportTypesMapping.UNITYONEITSM;
  }

  /**
   * Adds filter to the current workflow.
   *
   * @param i - I value used by this method.
   * @returns Nothing.
   */
  addFilter(i: number) {
    let filterFormGroup = <FormGroup>this.filters.at(i);
    if (filterFormGroup.invalid) {
      this.formErrors.filters[i] = this.utilService.validateForm(
        filterFormGroup,
        this.validationMessages.filters,
        this.formErrors.filters[i]
      );
      this.bindFilterValidation(filterFormGroup, i);
    } else {
      let newParamControl = this.builder.group({
        attribute: ['', [Validators.required, NoWhitespaceValidator]],
        operator: ['', [Validators.required, NoWhitespaceValidator]],
        value: ['', [Validators.required]],
      });
      this.formErrors.filters.push(this.svc.getFilterErrors());
      this.filters.push(newParamControl);

      this.subscribeToAttributeChange(newParamControl, this.filters.length - 1);
    }
  }

  /**
   * Removes filter from the current workflow.
   *
   * @param i - I value used by this method.
   * @returns Nothing.
   */
  removeFilter(i: number) {
    let filterFormControl = this.form.get('filters') as FormArray;
    if (filterFormControl.length > 1) {
      filterFormControl.removeAt(i);
      this.formErrors.filters.splice(i, 1);
    }
    this.operatorList.splice(i, 1);
    this.optionType.splice(i, 1);
    this.optionList.splice(i, 1);
  }

  /**
   * Executes the subscribe to attribute change workflow for Report Management Cloud Inventory Crud Component.
   *
   * @param group - Group value used by this method.
   * @param _index - Index of the item rendered by ngFor.
   * @returns Nothing.
   */
  subscribeToAttributeChange(group: AbstractControl, index: number) {
    const attributeControl = group.get('attribute');
    if (!attributeControl) return;
    attributeControl.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        takeUntil(this.formChangesUnsubscribe)
      )
      .subscribe((attrValue) => {
        if (!attrValue) return;
        if (['OS Type'].includes(attrValue)) {
          this.subscribeToOperatorChange(group, index);
        }
      });
  }

  /**
   * Executes the subscribe to operator change workflow for Report Management Cloud Inventory Crud Component.
   *
   * @param group - Group value used by this method.
   * @param _index - Index of the item rendered by ngFor.
   * @returns Nothing.
   */
  subscribeToOperatorChange(group: AbstractControl, index: number) {
    const operatorControl = group.get('operator');
    if (!operatorControl) return;
    operatorControl.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        takeUntil(this.formChangesUnsubscribe)
      )
      .subscribe((operatorVal) => {
        if (!operatorVal) return;
        const attribute = group.get('attribute').value;
        this.updateOSTypeValues(attribute, operatorVal, index);
        this.updateFilterValuesOptions(attribute, index);
      });
  }

  /**
   * Updates ostype values for the current workflow.
   *
   * @param attribute - Attribute value used by this method.
   * @param operatorVal - Operator Val value used by this method.
   * @param i - I value used by this method.
   * @returns Nothing.
   */
  updateOSTypeValues(attribute: string, operatorVal: string, i: number) {
    const attrItem = this.attributeList.find(
      (attr) => attr.value === attribute
    );
    if (!attrItem) return;
    if (['OS Type'].includes(attribute)) {
      if (['equal', 'not equal'].includes(operatorVal)) {
        attrItem.value_type = 'multi-select';
      } else {
        attrItem.value_type = 'input';
      }
      this.optionType[i] = attrItem.value_type;
    }
  }

  /**
   * Updates filter values options for the current workflow.
   *
   * @param attr - Attr value used by this method.
   * @param i - I value used by this method.
   * @returns Nothing.
   */
  updateFilterValuesOptions(attr: string, i: number) {
    let formGroup = <FormGroup>this.filters.at(i);
    let attribute = this.attributeList.filter((i) => i.value == attr)[0];
    if (
      attribute.value_type == 'multi-select' ||
      attribute.value_type == 'multi-select-simple'
    ) {
      formGroup.get('value').removeValidators([NoWhitespaceValidator]);
      formGroup.get('value').patchValue([]);
    } else {
      formGroup.get('value').setValue('');
      formGroup.get('value').addValidators([NoWhitespaceValidator]);
    }
    formGroup.updateValueAndValidity();
    this.optionType[i] = attribute.value_type;
    this.optionList[i] = attribute.options;
  }

  /**
   * Updates filter options for the current workflow.
   *
   * @param attr - Attr value used by this method.
   * @param i - I value used by this method.
   * @returns Nothing.
   */
  updateFilterOptions(attr: string, i: number) {
    let formGroup = <FormGroup>this.filters.at(i);
    let attribute = this.attributeList.filter((i) => i.value == attr)[0];
    formGroup.get('operator').setValue('');
    this.operatorList[i] = attribute.operators;
    this.updateFilterValuesOptions(attr, i);
  }

  /**
   * Executes the check all fields workflow for Report Management Cloud Inventory Crud Component.
   *
   * @param checked - Checked value used by this method.
   * @returns Nothing.
   */
  checkAllFields(checked: boolean) {
    this.allFieldsListArray.map((o: FieldsViewData) => (o.checked = !checked));
    this.allFieldsChecked = !checked;
    this.updateCounts();
  }
  /**
   * Executes the check all selected fields workflow for Report Management Cloud Inventory Crud Component.
   *
   * @param checked - Checked value used by this method.
   * @returns Nothing.
   */
  checkAllSelectedFields(checked: boolean) {
    this.selectedFieldsListArray.map(
      (o: FieldsViewData) => (o.checked = !checked)
    );
    this.selectedFieldsChecked = !checked;
    this.updateCounts();
  }

  /**
   * Toggles check state for the current selection.
   *
   * @param value - Value value used by this method.
   * @returns Nothing.
   */
  toggleCheck(value: any) {
    value.checked = !value.checked;
    this.updateCounts();
  }

  /**
   * Updates counts for the current workflow.
   *
   * @returns Nothing.
   */
  updateCounts() {
    this.allSelectedCount = this.allFieldsListArray?.filter(
      (i: FieldsViewData) => i.checked
    )?.length;
    this.selectedFieldsCount = this.selectedFieldsListArray?.filter(
      (i: FieldsViewData) => i.checked
    )?.length;
    this.allFieldsChecked =
      this.allSelectedCount > 0 &&
      this.allFieldsListArray.length == this.allSelectedCount
        ? true
        : false;
    this.selectedFieldsChecked =
      this.selectedFieldsCount > 0 &&
      this.selectedFieldsListArray.length == this.selectedFieldsCount
        ? true
        : false;
  }

  /**
   * Adds fields to the current workflow.
   *
   * @returns Nothing.
   */
  addFields() {
    let selectedVal = this.allFieldsListArray.filter(
      (i: FieldsViewData) => i.checked
    );
    this.allFieldsListArray = this.allFieldsListArray.filter(
      (arr) => !selectedVal.includes(arr)
    );
    selectedVal.map((o: FieldsViewData) => (o.checked = false));
    selectedVal.forEach((o: FieldsViewData) => {
      this.selectedFieldsListArray.push(JSON.parse(JSON.stringify(o)));
    });
    this.setFieldsFormValue();
    this.updateCounts();
  }

  /**
   * Removes fields from the current workflow.
   *
   * @returns Nothing.
   */
  removeFields() {
    let selectedVal = this.selectedFieldsListArray.filter(
      (i: FieldsViewData) => i.checked
    );
    this.selectedFieldsListArray = this.selectedFieldsListArray.filter(
      (arr) => !selectedVal.includes(arr)
    );
    selectedVal.map((o: FieldsViewData) => (o.checked = false));
    selectedVal.forEach((f: FieldsViewData) => {
      this.allFieldsListArray.push(JSON.parse(JSON.stringify(f)));
    });
    this.setFieldsFormValue();
    this.updateCounts();
  }

  /**
   * Executes the set fields form value workflow for Report Management Cloud Inventory Crud Component.
   *
   * @returns Nothing.
   */
  setFieldsFormValue() {
    this.allFieldsListArray.sort((a, b) =>
      a.key.toLowerCase().localeCompare(b.key.toLowerCase())
    );
    this.selectedFieldsListArray.sort((a, b) =>
      a.key.toLowerCase().localeCompare(b.key.toLowerCase())
    );
    this.form
      ?.get('fields')
      .setValue(
        this.selectedFieldsListArray?.length > 0
          ? this.svc.convertSelectedFields(this.selectedFieldsListArray)
          : []
      );
  }

  /**
   * Executes the submit workflow for Report Management Cloud Inventory Crud Component.
   *
   * @returns Nothing.
   */
  submit() {
    if (this.selectedFieldsListArray.length > 0) {
      this.form
        ?.get('fields')
        .setValue(this.svc.convertSelectedFields(this.selectedFieldsListArray));
    }
    if (this.form.invalid) {
      this.crudSvc.annouceInvalid();
      this.formErrors = this.utilService.validateForm(
        this.form,
        this.validationMessages,
        this.formErrors
      );
      this.bindFormValidation();
    } else {
      let form = this.form.getRawValue();
      // Cost and sustainability periods are stored as backend-friendly dates.
      if (form.period?.period_type == 'custom') {
        form.period.start_date = moment(form.period.start_date).format(
          'YYYY-MM-DD'
        ); //'YYYY-MM-DDTHH:mm:ssZ'
        form.period.end_date = moment(form.period.end_date).format(
          'YYYY-MM-DD'
        );
      }
      const obj = Object.assign({}, form);
      this.formData.emit(obj);
    }
  }

  private bindFilterValidation(
    filterFormGroup: FormGroup,
    index: number
  ): void {
    // Avoid binding the same invalid row repeatedly after multiple failed add/submit attempts.
    if (this.filterValidationControls.indexOf(filterFormGroup) >= 0) {
      return;
    }
    this.filterValidationControls.push(filterFormGroup);
    filterFormGroup.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        takeUntil(this.formChangesUnsubscribe)
      )
      .subscribe(() => {
        this.formErrors.filters[index] = this.utilService.validateForm(
          filterFormGroup,
          this.validationMessages.filters,
          this.formErrors.filters[index]
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
   * Returns a stable identity for attribute rows rendered by ngFor.
   *
   * @param _index - Index of the item rendered by ngFor.
   * @param attr - Attr value used by this method.
   * @returns A stable identity value for Angular change detection.
   */
  trackByAttribute(index: number, attr: AttributeDataType): string {
    return attr?.value || attr?.name || `${index}`;
  }

  /**
   * Returns a stable identity for option value rows rendered by ngFor.
   *
   * @param _index - Index of the item rendered by ngFor.
   * @param option - Option value used by this method.
   * @returns A stable identity value for Angular change detection.
   */
  trackByOptionValue(index: number, option: any): string {
    return option?.value || option?.uuid || option?.name || `${index}`;
  }

  /**
   * Returns a stable identity for field rows rendered by ngFor.
   *
   * @param _index - Index of the item rendered by ngFor.
   * @param field - Field value used by this method.
   * @returns A stable identity value for Angular change detection.
   */
  trackByField(index: number, field: FieldsViewData): string {
    return field?.key || `${index}`;
  }
}
