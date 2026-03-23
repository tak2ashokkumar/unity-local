import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DatacenterReportCrudService, ManageReportDatacenterCabinetView, ManageReportDatacenterFormData, ManageReportDatacenterView } from './datacenter-report-crud.service';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ManageReportCrudService } from '../manage-report-crud.service';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'datacenter-report-crud',
  templateUrl: './datacenter-report-crud.component.html',
  styleUrls: ['./datacenter-report-crud.component.scss'],
  providers: [DatacenterReportCrudService]
})
export class DatacenterReportCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  @Input('datacenter') datacenter: ManageReportDatacenterFormData = null;
  @Output('formData') formData = new EventEmitter<ManageReportDatacenterFormData>();

  datacenters: ManageReportDatacenterView[] = [];
  selectedDCIds: string[] = [];
  datacenterCabinets: ManageReportDatacenterCabinetView[] = [];

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  dcSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  cabinetSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    keyToSelect: 'uuid',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  constructor(private dcSvc: DatacenterReportCrudService,
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
    this.getDataCenters();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDataCenters() {
    this.dcSvc.getDataCenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.datacenters = this.dcSvc.convertToManageReportDatacenterView(data);
      this.buildFilterForm();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
      this.spinner.stop('main');
    })
  }

  dcChange() {
    let selectedDCIds = <string[]>this.form.get('datacenters').value;
    if (selectedDCIds == this.selectedDCIds) {
      return;
    }

    this.selectedDCIds = selectedDCIds;
    if (selectedDCIds.length) {
      this.form.get('cabinets').reset();
      let dcCabinets = [];
      selectedDCIds.map(dcId => {
        const dcData = this.datacenters.find(dc => dc.uuid == dcId);
        dcCabinets = dcCabinets.concat(dcData.cabinets);
      })
      this.datacenterCabinets = dcCabinets;
    } else {
      this.datacenterCabinets = [];
    }
  }

  buildFilterForm() {
    this.form = this.dcSvc.buildForm(this.datacenter);
    this.formValidationMessages = this.dcSvc.formValidationMessages;
    this.formErrors = this.dcSvc.resetFormErrors();
    if (this.datacenter) {
      this.dcChange();
      this.form.get('cabinets').setValue(this.datacenter.cabinets);
    }
  }

  handleError(err: any) {
    this.formErrors = this.dcSvc.resetFormErrors();
    if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    }
  }

  dcFilterData(formData: ManageReportDatacenterFormData): ManageReportDatacenterFormData {
    if (this.form.get('reportType').value == 'cabinet') {
      formData.device_list = false;
    } else {
      formData.device_list = true;
    }
    return formData;
  }

  submit() {
    if (this.form.invalid) {
      this.crudSvc.annouceInvalid();
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors); });
    } else {
      this.formData.emit(this.dcFilterData(this.form.getRawValue()));
    }
  }
}