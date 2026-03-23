import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ManageReportPrivateCloudFormData, PrivateCloudReportCrudService, ReportPrivateCloudNamesType } from './private-cloud-report-crud.service';
import { AppUtilityService, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { FormControl, FormGroup } from '@angular/forms';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ManageReportCrudService } from '../manage-report-crud.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ManageReportCloudDataType } from '../../manage-reports.type';

@Component({
  selector: 'private-cloud-report-crud',
  templateUrl: './private-cloud-report-crud.component.html',
  styleUrls: ['./private-cloud-report-crud.component.scss'],
  providers: [PrivateCloudReportCrudService]
})
export class PrivateCloudReportCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  @Input('private') private: ManageReportPrivateCloudFormData = null;
  @Output('formData') formData = new EventEmitter<ManageReportPrivateCloudFormData>();

  clouds: { name: PlatFormMapping, value: string, isPublic: boolean }[] = [
    { name: PlatFormMapping.VMWARE, value: 'VMware', isPublic: false },
    { name: PlatFormMapping.OPENSTACK, value: 'OpenStack', isPublic: false },
    { name: PlatFormMapping.VCLOUD, value: 'OVM', isPublic: false },
    { name: PlatFormMapping.PROXMOX, value: 'Proxmox', isPublic: false },
    { name: PlatFormMapping.G3_KVM, value: 'G3 KVM', isPublic: false },
    { name: PlatFormMapping.ESXI, value: 'ESXi', isPublic: false },
    { name: PlatFormMapping.CUSTOM, value: 'Custom', isPublic: false }
  ];

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  selectedClouds: string[] = [];
  names: ReportPrivateCloudNamesType[] = [];

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
  constructor(private pcSvc: PrivateCloudReportCrudService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private crudSvc: ManageReportCrudService) {
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
    // this.spinner.stop('main');
    this.form = this.pcSvc.buildForm(this.private);
    this.formValidationMessages = this.pcSvc.formValidationMessages;
    this.formErrors = this.pcSvc.resetFormErrors();
    if (this.private) {
      this.selectedClouds = this.private.cloud;
      this.form.addControl('tempCloudNames', new FormControl(this.private.cloudName))
      this.getCloudNames(this.private.cloud)
    }
    this.spinner.stop('main');
  }

  private getCloudNames(selectedClouds: string[]) {
    this.pcSvc.getCloudNames(selectedClouds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.names = res;
      if(this.private && this.form.contains('tempCloudNames')){
        let tempCloudName = <ManageReportCloudDataType[]>this.form.get('tempCloudNames').value;
        let arr:ManageReportCloudDataType[] = [];
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