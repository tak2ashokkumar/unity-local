import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { AttributeDataType, CloudInventoryReportCrudService, FieldsDataType, FieldsViewData, OsDataType, ReportTypesMapping } from './cloud-inventory-report-crud.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { ManageReportCrudNewService, ReportFormData } from 'src/app/unity-reports/manage-reports-new-temp/manage-report-crud-new/manage-report-crud-new.service';
import moment from 'moment';

export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'MMM DD, YYYY hh:mm A',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
}
@Component({
  selector: 'cloud-inventory-report-crud',
  templateUrl: './cloud-inventory-report-crud.component.html',
  styleUrls: ['./cloud-inventory-report-crud.component.scss'],
  providers: [CloudInventoryReportCrudService, { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] }, { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }]
})
export class CloudInventoryReportCrudComponent implements OnInit {

  private ngUnsubscribe = new Subject();
  @Input('reportdata') reportdata: ReportFormData;
  @Input('reporttype') reportType: string;
  @Input('cloudtype') cloudType: string;
  @Input('executiontype') executionType: string;
  @Input('workflowintegration') workflowIntegrationValue: string;
  @Input('tableUuid') tableUuid: string;

  @Output('formdata') formData = new EventEmitter<any>();
  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';

  attributeList: AttributeDataType[] = [];
  operatorList: any[] = [];
  optionType: string[] = [];
  optionList: any[] = [];

  fieldsData: FieldsDataType;
  selectedFieldsListArray = [];
  allFieldsListArray = [];
  allSelectedCount: number = 0;
  selectedFieldsCount: number = 0;
  selectedFieldsChecked: boolean = false;
  allFieldsChecked: boolean = false;
  currentCloud: string;
  currentExecutionType: string;
  reportId: string = null;
  currentCloudData: ReportFormData;
  currentWorkflowIntegration: string;
  previousWorkflowIntegrationValue: string;
  currentTableUuid: string;
  unityOneInitialChangeHandled = false;

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
    keyToSelect: 'name'
  };

  constructor(private svc: CloudInventoryReportCrudService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private crudSvc: ManageReportCrudNewService,
    private builder: FormBuilder,
    private utilService: AppUtilityService,
  ) {
    this.crudSvc.submitAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.submit();
    });
    this.crudSvc.errorAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(err => {
      this.handleError(err);
    });
    this.crudSvc.reportType$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((reportType) => {
      if (reportType && this.reportdata) {
        this.resetFiltersAndFields();
      }
    });
  }

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

  ngOnChanges(): void { // need to refactor this.
    if ((this.cloudType && this.currentCloud) || this.executionType || this.tableUuid) {
      if (this.reportdata) {
        if (this.cloudType && this.currentCloud) {
          this.reportdata.report_meta.fields = this.currentCloud == this.cloudType ? this.currentCloudData?.report_meta?.fields : []
          this.reportdata.report_meta.filters = this.currentCloud == this.cloudType ? this.currentCloudData?.report_meta?.filters : []
        }
        if (this.executionType && this.currentExecutionType) {
          this.reportdata.report_meta.fields = this.currentExecutionType == this.executionType ? this.currentCloudData?.report_meta?.fields : []
          this.reportdata.report_meta.filters = this.currentExecutionType == this.executionType ? this.currentCloudData?.report_meta?.filters : []
        }
        if (this.tableUuid && this.currentTableUuid) {
          this.reportdata.report_meta.fields = this.currentTableUuid === this.tableUuid ? this.currentCloudData?.report_meta?.fields : [];
          this.reportdata.report_meta.filters = this.currentTableUuid === this.tableUuid ? this.currentCloudData?.report_meta?.filters : [];
          this.getFieldsList();
        }
      }
      if (this.tableUuid) {
        console.log("heyy")
        this.getFieldsList();
      }
      if (!this.isUnityOneITSM() || this.unityOneInitialChangeHandled) {
        this.getFiltersList();
        this.setFields();
      }
      if (this.workflowIntegrationValue) {
        if (this.reportdata) {
          if (this.workflowIntegrationValue && this.currentWorkflowIntegration) {
            this.reportdata.report_meta.fields = this.currentWorkflowIntegration == this.workflowIntegrationValue ? this.currentCloudData?.report_meta?.fields : []
            this.reportdata.report_meta.filters = this.currentWorkflowIntegration == this.workflowIntegrationValue ? this.currentCloudData?.report_meta?.filters : []
          }
        }
        if (this.workflowIntegrationValue !== this.previousWorkflowIntegrationValue) {
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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildForm() {
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

  resetFiltersAndFields() {
    this.reportdata.report_meta.fields = [];
    this.reportdata.report_meta.filters = [];
  }

  manageFormsubscribtion() {
    if (this.reportType == "Cost Analysis" || this.reportType == "sustainability") {
      if (!this.period) {
        this.form.addControl('period', this.svc.getPeriodFormControls(null));
      }
      this.period.get('period_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
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

  handleFormFieldsByScheduleType(val: string) {
    if (val == 'last' || val == 'current') {
      this.period.get('start_date') ? this.period.removeControl('start_date') : null;
      this.period.get('end_date') ? this.period.removeControl('end_date') : null;
      this.period.addControl('counter', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      this.period.addControl('range', new FormControl('', [Validators.required, NoWhitespaceValidator]));
    }
    else {
      this.period.get('counter') ? this.period.removeControl('counter') : null;
      this.period.get('range') ? this.period.removeControl('range') : null;
      this.period.addControl('start_date', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      this.period.addControl('end_date', new FormControl('', [Validators.required, NoWhitespaceValidator]));
    }
  }

  removeDuplicates(arr: OsDataType[], key: string): any[] {
    return arr.reduce((resultArr, item) => {
      if (item[key] && item[key].trim() !== "") {
        if (!resultArr.find((obj: any) => obj[key] === item[key])) {
          resultArr.push(item);
        }
      }
      return resultArr;
    }, []);
  }

  getFiltersList() {
    this.svc.getFilterData(this.reportType, this.cloudType, this.executionType, this.tableUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.attributeList = res;
      this.operatorList = [];
      this.optionType = [];
      this.optionList = [];
      //For qucik fix - need to refactor this.
      for (let attr of this.attributeList) {
        if (attr.name == 'Cloud Type') {
          attr.options = this.svc.getCloudAttributeOptions(this.cloudType);
        }
        if (attr.name == 'Datacenter') {
          this.svc.getDatacenterOptions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
            res.map(dc => {
              let index = attr.options.findIndex(aop => aop.uuid == dc.uuid);
              if (index < 0) {
                attr.options.push({ name: dc.name, uuid: dc.uuid });
              }
            });
          });
        }
        if (attr.name == 'Cabinet') {
          this.svc.getDatacenterOptions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
            res.map(dc => {
              dc.cabinets.map((cb) => {
                let index = attr.options.findIndex(aop => aop.uuid == cb.uuid);
                if (index < 0) {
                  attr.options.push({ name: cb.name, uuid: cb.uuid });
                }
              });
            });
          });
        }
        if (attr.name == 'Resource Type') {
          this.svc.getResourcTypesOptions(this.cloudType).subscribe(res => {
            attr.options = res[0].concat(res[1], res[2]);
          });
        }
        if (attr.name == 'Location') {
          this.svc.getLocationOptions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
            res.map(dc => {
              let index = attr.options.findIndex(aop => aop.location == dc.location);
              if ((index < 0) && dc.location && dc.location != '') {
                attr.options.push(dc.location);
              }
            });
          });
        }
        if (attr.name == 'Manufacturer') {
          this.svc.getManufacturerOptions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
            res.map(m => {
              attr.options.push(m.name);
            });
          });
        }
        if (attr.name == 'Category') {
          this.svc.getCategoryOptions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
            let categories = [];
            if ((this.executionType === 'Task' && res.Task) || (this.executionType === 'Task and Workflow' && res.Task)) {
              categories = res.Task.map(m => m.category);
            } else if (this.executionType === 'Workflow' && res.Worklfow) {
              categories = res.Worklfow.map(m => m.category);
            }
            attr.options = [...categories];
          });
        }
        if (attr.name == 'Executed By' || attr.name == 'Created By') {
          this.svc.getUsers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
            attr.options = [];
            res.map(user => {
              attr.options.push({ name: user.full_name, uuid: user.id });
            });
          });
        }

        if (attr.name == 'OS Name') {
          this.svc.getOSVersions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
            attr.options = [];
            if (res && res.length > 0) {
              const osTypes = this.removeDuplicates(res, "name");
              osTypes.map(os => {
                attr.options.push({ name: os.name, uuid: os.id });
              });
            }
          });
        }
      }
      if (this.reportType === ReportTypesMapping.UNITYONEITSM) {
        this.loadReferenceFields();
      }

      if (this.reportdata?.report_meta?.filters && this.reportType === ReportTypesMapping.UNITYONEITSM) {
        setTimeout(() => {
          this.operatorList = [];
          this.optionType = [];
          this.optionList = [];

          this.reportdata.report_meta.filters.forEach(filter => {
            const attr = this.attributeList.find(a => a.value === filter.attribute);
            if (!attr) return;

            this.operatorList.push(attr.operators);
            this.optionType.push(attr.value_type);
            this.optionList.push(attr.options?.length ? attr.options : []);
          });
        });
      }

      if (this.reportdata?.report_meta?.filters) {
        this.reportdata.report_meta.filters.map(filter => {
          let arr = this.attributeList.filter(i => i.value == filter.attribute)[0];
          this.operatorList.push(arr?.operators);
          this.optionType.push(arr?.value_type);
          this.optionList.push(arr?.options?.length > 0 ? arr?.options : []);
        });
      }
      else {
        this.operatorList.push(this.attributeList[0]?.operators);
      }
    }, err => {
      this.notification.error(new Notification('Error while fetching Filters!! Please try again.'));
    });
  }

  loadReferenceFields(): void {
    this.attributeList
      .filter(attr => attr.field_type === 'REFERENCE' && attr.reference_table)
      .forEach(attr => {
        this.svc.fetchReferenceOptions(attr, attr.reference_table);
      });
  }

  getFieldsList() {
    this.svc.getFieldsData(this.reportType, this.reportId, this.workflowIntegrationValue, this.tableUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.fieldsData = res;
      this.setFields();
    }, err => {
      this.notification.error(new Notification('Error while fetching Fields!! Please try again.'));
    });
  }

  setFields() {
    let res = this.fieldsData;
    let fieldsArr;
    if (this.reportType === 'Cloud Inventory') {
      fieldsArr = this.cloudType ? res?.data[this.cloudType] : res?.data?.Public;
    } else if (this.reportType === 'DevOps Automation') {
      if (this.executionType && res?.data[this.executionType]) {
        fieldsArr = res?.data[this.executionType];
      }
    } else {
      fieldsArr = res?.data;
    }
    this.allFieldsListArray = fieldsArr?.Unselected ? this.svc.convertFields(fieldsArr.Unselected) : [];
    this.selectedFieldsListArray = fieldsArr?.Selected ? this.svc.convertFields(fieldsArr.Selected) : [];
    if (this.reportdata?.report_meta?.fields) {
      this.selectedFieldsListArray = this.svc.convertFields(this.reportdata.report_meta.fields);
    }
    this.setFieldsFormValue();
  }

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

  get filters(): FormArray {
    return this.form.get("filters") as FormArray;
  }

  get period(): FormGroup {
    return this.form.get("period") as FormGroup;
  }

  private isUnityOneITSM(): boolean {
    return this.reportType === ReportTypesMapping.UNITYONEITSM;
  }

  addFilter(i: number) {
    let filterFormGroup = <FormGroup>this.filters.at(i);
    if (filterFormGroup.invalid) {
      this.formErrors.filters[i] = this.utilService.validateForm(filterFormGroup, this.validationMessages.filters, this.formErrors.filters[i]);
      filterFormGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors.filters[i] = this.utilService.validateForm(filterFormGroup, this.validationMessages.filters, this.formErrors.filters[i]);
      });
    } else {
      let newParamControl = this.builder.group({
        attribute: ['', [Validators.required, NoWhitespaceValidator]],
        operator: ['', [Validators.required, NoWhitespaceValidator]],
        value: ['', [Validators.required]],
      })
      this.formErrors.filters.push(this.svc.getFilterErrors());
      this.filters.push(newParamControl);

      this.subscribeToAttributeChange(newParamControl, this.filters.length - 1);
    }
  }

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

  subscribeToAttributeChange(group: AbstractControl, index: number) {
    const attributeControl = group.get('attribute');
    if (!attributeControl) return;
    attributeControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(attrValue => {
      if (!attrValue) return;
      if (['OS Type'].includes(attrValue)) {
        this.subscribeToOperatorChange(group, index);
      }
    });
  }

  subscribeToOperatorChange(group: AbstractControl, index: number) {
    const operatorControl = group.get('operator');
    if (!operatorControl) return;
    operatorControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(operatorVal => {
      if (!operatorVal) return;
      const attribute = group.get('attribute').value;
      this.updateOSTypeValues(attribute, operatorVal, index)
      this.updateFilterValuesOptions(attribute, index);
    });
  }

  updateOSTypeValues(attribute: string, operatorVal: string, i: number) {
    const attrItem = this.attributeList.find(attr => attr.value === attribute);
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

  updateFilterValuesOptions(attr: string, i: number,) {
    let formGroup = <FormGroup>this.filters.at(i);
    let attribute = this.attributeList.filter(i => i.value == attr)[0];
    if (attribute.value_type == 'multi-select' || attribute.value_type == 'multi-select-simple') {
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

  updateFilterOptions(attr: string, i: number) {
    let formGroup = <FormGroup>this.filters.at(i);
    let attribute = this.attributeList.filter(i => i.value == attr)[0];
    formGroup.get('operator').setValue('');
    this.operatorList[i] = attribute.operators;
    this.updateFilterValuesOptions(attr, i);
  }

  checkAllFields(checked: boolean) {
    this.allFieldsListArray.map((o: FieldsViewData) => o.checked = !checked);
    this.allFieldsChecked = !checked;
    this.updateCounts();
  }
  checkAllSelectedFields(checked: boolean) {
    this.selectedFieldsListArray.map((o: FieldsViewData) => o.checked = !checked);
    this.selectedFieldsChecked = !checked;
    this.updateCounts();
  }

  toggleCheck(value: any) {
    value.checked = !value.checked;
    this.updateCounts();
  }

  updateCounts() {
    this.allSelectedCount = this.allFieldsListArray?.filter((i: FieldsViewData) => i.checked)?.length;
    this.selectedFieldsCount = this.selectedFieldsListArray?.filter((i: FieldsViewData) => i.checked)?.length;
    this.allFieldsChecked = (this.allSelectedCount > 0 && this.allFieldsListArray.length == this.allSelectedCount) ? true : false;
    this.selectedFieldsChecked = (this.selectedFieldsCount > 0 && this.selectedFieldsListArray.length == this.selectedFieldsCount) ? true : false;
  }

  addFields() {
    let selectedVal = this.allFieldsListArray.filter((i: FieldsViewData) => i.checked);
    this.allFieldsListArray = this.allFieldsListArray.filter((arr) => !selectedVal.includes(arr));
    selectedVal.map((o: FieldsViewData) => o.checked = false);
    selectedVal.forEach((o: FieldsViewData) => {
      this.selectedFieldsListArray.push(JSON.parse(JSON.stringify(o)));
    })
    this.setFieldsFormValue();
    this.updateCounts();
  }

  removeFields() {
    let selectedVal = this.selectedFieldsListArray.filter((i: FieldsViewData) => i.checked);
    this.selectedFieldsListArray = this.selectedFieldsListArray.filter((arr) => !selectedVal.includes(arr));
    selectedVal.map((o: FieldsViewData) => o.checked = false);
    selectedVal.forEach((f: FieldsViewData) => {
      this.allFieldsListArray.push(JSON.parse(JSON.stringify(f)));
    });
    this.setFieldsFormValue();
    this.updateCounts();
  }

  setFieldsFormValue() {
    this.allFieldsListArray.sort((a, b) => a.key.toLowerCase().localeCompare(b.key.toLowerCase()));
    this.selectedFieldsListArray.sort((a, b) => a.key.toLowerCase().localeCompare(b.key.toLowerCase()));
    this.form?.get('fields').setValue(this.selectedFieldsListArray?.length > 0 ? this.svc.convertSelectedFields(this.selectedFieldsListArray) : [])
  }

  submit() {
    if (this.selectedFieldsListArray.length > 0) {
      this.form?.get('fields').setValue(this.svc.convertSelectedFields(this.selectedFieldsListArray))
    }
    if (this.form.invalid) {
      this.crudSvc.annouceInvalid();
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      });
    } else {
      let form = this.form.getRawValue();
      if (form.period?.period_type == 'custom') {
        form.period.start_date = moment(form.period.start_date).format('YYYY-MM-DD'); //'YYYY-MM-DDTHH:mm:ssZ'
        form.period.end_date = moment(form.period.end_date).format('YYYY-MM-DD');
      }
      const obj = Object.assign({}, form);
      this.formData.emit(obj);
    }
  }
}



