import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DateRange, Duration, ManageReportDatacenterCabinetView, deviceTypes, AWSAccountReportFormData, ManageReportDatacenterView, SustainabilityReportCrudService, ManageReportDatacenterFormData, GCPAccountReportFormData, MetaReportFormData } from './sustainability-report-crud.service';
import { ManageReportCrudService } from '../manage-report-crud.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import moment from 'moment';

@Component({
  selector: 'sustainability-report-crud',
  templateUrl: './sustainability-report-crud.component.html',
  styleUrls: ['./sustainability-report-crud.component.scss'],
  providers: [SustainabilityReportCrudService],
})
export class SustainabilityReportCrudComponent implements OnInit {

  private ngUnsubscribe = new Subject();
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  datacenters: ManageReportDatacenterView[] = [];
  awsAccounts: AWSAccountReportFormData[] = [];
  gcpAccounts: GCPAccountReportFormData[] = [];
  datacenterCabinets: ManageReportDatacenterCabinetView[] = [];
  deviceTypes: Array<{ name: string, displayName: string, mapping: DeviceMapping }> = deviceTypes;

  @Input('sustainability') sustainability: MetaReportFormData = null;
  @Output('formData') formData = new EventEmitter();
  selectedDCIds: string[] = [];
  dateRange: DateRange;
  now: Date;
  duration = Duration;

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

  deviceTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'displayName',
    keyToSelect: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  awsAccountSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    keyToSelect: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  gcpAccountSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    keyToSelect: 'uuid',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  constructor(private sustCrdSvc: SustainabilityReportCrudService,
    private crudSvc: ManageReportCrudService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,) {
    this.crudSvc.submitAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.submit();
    });
    this.crudSvc.errorAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(err => {
      this.handleError(err);
    });

    this.now = new Date();
    this.now.setDate(this.now.getDate() - 1);
  }

  ngOnInit(): void {
    this.getInfo()
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getInfo() {
    this.sustCrdSvc.getDataCenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.datacenters = this.sustCrdSvc.convertToManageReportDatacenterView(data);
      this.buildFilterForm();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
      this.spinner.stop('main');
    })

    this.sustCrdSvc.getAwsAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.awsAccounts = data;
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
      this.spinner.stop('main');
    })

    this.sustCrdSvc.getGcpAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.gcpAccounts = data;
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
      this.spinner.stop('main');
    })
  }

  dcChange() {
    let selectedDCIds = <string[]>this.form.get('dc_uuids').value;
    if (selectedDCIds == this.selectedDCIds) {
      return;
    }

    this.selectedDCIds = selectedDCIds;
    if (selectedDCIds.length) {
      this.form.get('cabinet_uuids').reset();
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
    this.dateRange = this.sustCrdSvc.getDateRangeByPeriod(this.duration.CURRENT_YEAR);
    this.form = this.sustCrdSvc.buildForm(this.sustainability);
    this.formValidationMessages = this.sustCrdSvc.formValidationMessages;
    this.formErrors = this.sustCrdSvc.resetFormErrors();

    if (this.sustainability) {
      // Edit flow
      this.form.get('report_type').disable();
      const name = this.form.get('report_type').value;

      switch (name) {
        case 'sustainability_devices':
          this.form = this.sustCrdSvc.selectionSpecificForm(this.sustainability, this.form, 'sustainability_devices', this.dateRange);
          this.dcChange();
          this.form.get('cabinet_uuids').setValue(this.sustainability.cabinet_uuids);
          this.form.get('period').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
            this.dateRange = this.sustCrdSvc.getDateRangeByPeriod(val);
            if (this.dateRange) {
              this.form.get('from').patchValue(new Date(this.dateRange.from));
              this.form.get('to').patchValue(new Date(this.dateRange.to));
            }
            if (val == this.duration.CUSTOM) {
              this.form.get('from').enable();
              this.form.get('to').enable();
            } else {
              this.form.get('from').disable();
              this.form.get('to').disable();
            }
            this.form.get('from').updateValueAndValidity();
            this.form.get('to').updateValueAndValidity();
          });
          break;
        case 'sustainability_aws':
          this.form = this.sustCrdSvc.selectionSpecificForm(this.sustainability, this.form, 'sustainability_aws', this.dateRange);
          break;
        default:
          this.form = this.sustCrdSvc.selectionSpecificForm(this.sustainability, this.form, 'sustainability_gcp', this.dateRange);
          break;
      }

    } else {
      //Create flow
      this.form.get('report_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(name => {
        switch (name) {
          case 'sustainability_devices':
            this.form = this.sustCrdSvc.selectionSpecificForm(this.sustainability, this.form, 'sustainability_devices', this.dateRange);
            this.form.get('period').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
              this.dateRange = this.sustCrdSvc.getDateRangeByPeriod(val);
              if (this.dateRange) {
                this.form.get('from').patchValue(new Date(this.dateRange.from));
                this.form.get('to').patchValue(new Date(this.dateRange.to));
              }
              if (val == this.duration.CUSTOM) {
                this.form.get('from').enable();
                this.form.get('to').enable();
              } else {
                this.form.get('from').disable();
                this.form.get('to').disable();
              }
              this.form.get('from').updateValueAndValidity();
              this.form.get('to').updateValueAndValidity();
            });
            break;
          case 'sustainability_aws':
            this.form = this.sustCrdSvc.selectionSpecificForm(this.sustainability, this.form, 'sustainability_aws', this.dateRange);
            break;
          default:
            this.form = this.sustCrdSvc.selectionSpecificForm(this.sustainability, this.form, 'sustainability_gcp', this.dateRange);
            break;
        }

      });
    }
  }

  formatFormData(data: ManageReportDatacenterFormData) {
    if (data.to && data.from) {
      data.to = moment(data.to).format('YYYY-MM');
      data.from = moment(data.from).format('YYYY-MM');
    }
    return data;
  }

  handleError(err: any) {
    this.formErrors = this.sustCrdSvc.resetFormErrors();
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
      this.formData.emit(this.formatFormData(this.form.getRawValue()));
    }
  }
}
