import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ManageReportPublicCloudFormData, PublicCloudReportCrudService, ReportPublicCloudNamesType } from './public-cloud-report-crud.service';
import { AppUtilityService, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ManageReportCrudService } from '../manage-report-crud.service';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'public-cloud-report-crud',
  templateUrl: './public-cloud-report-crud.component.html',
  styleUrls: ['./public-cloud-report-crud.component.scss'],
  providers: [PublicCloudReportCrudService]
})
export class PublicCloudReportCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  @Input('public') public: ManageReportPublicCloudFormData = null;
  @Output('formData') formData = new EventEmitter<ManageReportPublicCloudFormData>();

  clouds: { name: PlatFormMapping, value: string, isPublic: boolean }[] = [
    { name: PlatFormMapping.AWS, value: 'AWS', isPublic: true },
    { name: PlatFormMapping.AZURE, value: 'Azure', isPublic: true },
    { name: PlatFormMapping.GCP, value: 'GCP', isPublic: true }
  ];

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  selectedClouds: string[] = [];
  names: ReportPublicCloudNamesType[] = [];


  cloudSettings: IMultiSelectSettings = {
    keyToSelect: "value",
    lableToDisplay: "name",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  namesSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    selectAsObject: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  // Text configuration
  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All Selected',
  };
  constructor(private pcSvc: PublicCloudReportCrudService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private crudSvc: ManageReportCrudService,) {
    this.crudSvc.submitAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.submit();
    });
    this.crudSvc.errorAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(err => {
      this.handleError(err);
    });
  }

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildForm() {
    this.form = this.pcSvc.buildForm(this.public);
    this.formValidationMessages = this.pcSvc.formValidationMessages;
    this.formErrors = this.pcSvc.resetFormErrors();
    if (this.public) {
      this.cloudChanged();
      this.selectedClouds = this.public.cloud;
      this.form.addControl('tempCloudNames', new FormControl(this.public.cloudName))
      this.getCloudNames(this.public.cloud)
    }
  }

  private getCloudNames(selectedClouds: string[]) {
    this.pcSvc.getCloudNames(selectedClouds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.names = res;
      if(this.public && this.form.contains('tempCloudNames')){
        let tempCloudName = <ReportPublicCloudNamesType[]>this.form.get('tempCloudNames').value;
        let arr:ReportPublicCloudNamesType[] = [];
        tempCloudName.forEach(name => {
          arr.push(this.names.find(n => n.uuid == name.uuid));
        });
        this.form.get('cloudName').setValue(arr);
        this.form.removeControl('tempCloudName');
      }
    }, err => {
      this.names = [];
    });
  }

  cloudChanged() {
    let selectedClouds = (<string[]>this.form.get('cloud').value);
    if (this.selectedClouds == selectedClouds) {
      return;
    }
    this.selectedClouds = selectedClouds;
    if (selectedClouds.length) {
      this.form.get('cloudName').reset();
      this.getCloudNames(selectedClouds);
    } else {
      this.names = [];
    }
  }

  handleError(err: any) {
    this.formErrors = this.pcSvc.resetFormErrors();
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
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors); });
    } else {
      this.formData.emit(this.form.getRawValue());
    }
  }
}