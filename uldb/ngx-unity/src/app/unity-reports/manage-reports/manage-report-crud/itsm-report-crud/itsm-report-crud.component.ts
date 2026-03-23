import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ManageReportCrudService } from '../manage-report-crud.service';
import { ItsmReportCrudService, ManageReportItsmFormData } from './itsm-report-crud.service';

@Component({
  selector: 'itsm-report-crud',
  templateUrl: './itsm-report-crud.component.html',
  styleUrls: ['./itsm-report-crud.component.scss'],
  providers: [ItsmReportCrudService]
})
export class ItsmReportCrudComponent implements OnInit {

  itsmUuid: string = '';
  private ngUnsubscribe = new Subject();
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  @Input('itsm') itsm: ManageReportItsmFormData = null;
  @Output('formData') formData = new EventEmitter<ManageReportItsmFormData>();

  constructor(private itsmCrdSvc: ItsmReportCrudService,
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
  }

  ngOnInit(): void {
    this.getItsmUuid();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getItsmUuid() {
    this.itsmCrdSvc.getUuidForItsm().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      let itsmData = data;
      for (const item of itsmData) {
        if (item.type == 'DynamicsCrm') {
          this.itsmUuid = item.uuid;
        }
      }
      this.buildFilterForm();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
      this.spinner.stop('main');
    })
  }

  buildFilterForm() {
    this.form = this.itsmCrdSvc.buildForm(this.itsm, this.itsmUuid);
    this.formValidationMessages = this.itsmCrdSvc.formValidationMessages;
    this.formErrors = this.itsmCrdSvc.resetFormErrors();
  }

  handleError(err: any) {
    this.formErrors = this.itsmCrdSvc.resetFormErrors();
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
