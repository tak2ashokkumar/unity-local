
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ReportCrudCommonService } from './report-crud-common.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
// import { ManageReportCrudNewService, ReportFormData } from 'src/app/unity-reports/manage-reports-new-temp/manage-report-crud-new/manage-report-crud-new.service';
import moment from 'moment';
import { ManageReportCrudNewService, ReportFormData } from '../manage-report-crud-new.service';
import { QueryBuilderClassNames, QueryBuilderConfig } from 'src/app/shared/query-builder/query-builder.interfaces';
import { queryBuilderClassNames, queryBuilderConfig } from './report-crud.const';
import { QueryBuilderComponent } from 'src/app/shared/query-builder/query-builder.component';
import { DynamicReportsFieldMeta } from './report-crud-common.type';
import { cloneDeep as _clone } from 'lodash-es';

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
  selector: 'report-crud-common',
  templateUrl: './report-crud-common.component.html',
  styleUrls: ['./report-crud-common.component.scss'],
  providers: [ReportCrudCommonService, { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] }, { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }]
})
export class ReportCrudCommonComponent implements OnInit, OnDestroy {
    private ngUnsubscribe = new Subject();
    @Input('reportdata') reportdata: ReportFormData;
    @Input('reporttype') reportType: string;
    @Input('module') dynamicModule: string;
    @Input('model') dynamicModel: string;
  
    @Output('formdata') formData = new EventEmitter<any>();
    form: FormGroup;
    formErrors: any;
    validationMessages: any;
    nonFieldErr: string = '';
  
    reportId: string = null;
  
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
    queryBuilderConfig: QueryBuilderConfig;
    queryBuilderClassNames: QueryBuilderClassNames = queryBuilderClassNames;
    @ViewChild('queryBuilder') queryBuilder: QueryBuilderComponent;

    public allowRuleset: boolean = true;
    public allowCollapse: boolean = false;
    public persistValueOnFieldChange: boolean = false;

    fieldsMetaData: DynamicReportsFieldMeta[];
    processingFuncList: any[] = [];
    summaryFuncList: any[] = ['sum', 'max', 'min', 'avg', 'total'];
  
    currentModule:string;
    currentModel: string;
    
    constructor(private svc: ReportCrudCommonService,
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
      // this.crudSvc.dynamicModel$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(reset => {
      //   if(reset){
      //     // this.resetDynamicFiltersAndFields();
      //   }
      // });
    }
  
    ngOnInit(): void {
      this.spinner.start('main');
      this.currentModule = _clone(this.dynamicModule);
      this.currentModel = _clone(this.dynamicModel);
      if (this.reportdata) {
        this.reportId = this.reportdata.uuid;
      }
      this.buildForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
      if (changes?.dynamicModule?.currentValue) {
        this.dynamicModule = changes.dynamicModule.currentValue;
      }
      if (changes?.dynamicModel?.currentValue) {
        this.dynamicModel = changes.dynamicModel.currentValue;
        this.getDynamicReportQueryFiltersMeta();
        this.getDynamicReportQueryFieldsMeta();
        if (this.dynamicModel && this.dynamicModel != this.currentModel && !changes?.dynamicModel?.firstChange) {
          this.currentModel = _clone(changes.dynamicModel.currentValue);
          this.resetDynamicFiltersAndFields();
        }
      }
    }
  
    ngOnDestroy(): void {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }

    getDynamicReportQueryFiltersMeta() {
      if (!this.dynamicModule && !this.dynamicModel) {
        return;
      }
      // To reset query builder to initial state
      this.queryBuilderConfig = undefined;
      this.svc.getDynamicReportFilterMetaData(this.dynamicModule, this.dynamicModel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if (res.length) {
          this.svc.updateChoices(res).subscribe(updatedData => {
            this.queryBuilderConfig = this.svc.convert(updatedData);
            this.spinner.stop('main');
          });
        }
      });
    }
    
    getDynamicReportQueryFieldsMeta() {
      if(!this.dynamicModule && !this.dynamicModel){
        return;
      }
      this.fieldsMetaData = [];
      this.svc.getDynamicReportFieldMetaData(this.dynamicModule, this.dynamicModel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if (res.length) {
          this.svc.updateChoices(res).subscribe(updatedData => {
            this.fieldsMetaData = updatedData;
          });
          // this.setQueryFieldsConfig(this.fieldsMetaData);
        }
        this.spinner.stop('main');
      })
      //get data processing function list- for now common for all fields
      this.svc.getDataProcessingFunctionData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if (res.length) {
          this.processingFuncList = res;
        }
      });
    }

    resetDynamicFiltersAndFields() {
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
      
    get selectFields(): FormArray {
      return this.form.get("select_fields") as FormArray;
    }
    
    buildForm() {
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

    updateShowAsField(name: string, i: number) {
      let formGroup = <FormGroup>this.selectFields.at(i);
      let field = this.fieldsMetaData.find(f => f.name == name);
      formGroup.get('show_as').setValue(field.display_name);
    }

    addSelectFields(i: number) {
      let fields = <FormGroup>this.selectFields.at(i);
      if (fields.invalid) {
        this.formErrors.select_fields[i] = this.utilService.validateForm(fields, this.validationMessages.select_fields, this.formErrors.select_fields[i]);
        fields.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
          this.formErrors.select_fields[i] = this.utilService.validateForm(fields, this.validationMessages.select_fields, this.formErrors.select_fields[i]);
        });
      } else {
        let newParamControl = this.builder.group({
          name: ['', [Validators.required, NoWhitespaceValidator]],
          show_as: ['', [Validators.required, NoWhitespaceValidator]],
          data_processing_fn: [[]],
          summary_fn: [[]],
        })
        this.formErrors.select_fields.push(this.svc.getSelectFieldsErrors());
        this.selectFields.push(newParamControl);
  
        // this.subscribeToSelectFieldChange(newParamControl, this.selectFields.length - 1);
      }
    }
  
    removeSelectFields(i: number) {
      if (this.selectFields.length > 1) {
        this.selectFields.removeAt(i);
        this.formErrors.select_fields.splice(i, 1);
      }
      // this.processingFuncList.splice(i, 1)
      // this.summaryFunctionList.splice(i, 1)
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
    
    submit() {
      if (this.form.invalid) {
        this.crudSvc.annouceInvalid();
        this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
        this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
          this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
        });
      } else {
        this.queryBuilder.submit();
        let form = this.form.getRawValue();
        const obj = Object.assign({}, form);
        this.formData.emit(obj);
      }
    }



}
