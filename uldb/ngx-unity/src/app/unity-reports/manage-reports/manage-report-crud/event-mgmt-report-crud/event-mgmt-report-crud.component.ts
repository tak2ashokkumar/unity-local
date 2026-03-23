import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EventMgmtReportCrudService, ManageReportEventFormData } from './event-mgmt-report-crud.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ManageReportCrudService } from '../manage-report-crud.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'event-mgmt-report-crud',
  templateUrl: './event-mgmt-report-crud.component.html',
  styleUrls: ['./event-mgmt-report-crud.component.scss'],
  providers: [EventMgmtReportCrudService]
})
export class EventMgmtReportCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe= new Subject();
  @Input('events') events: ManageReportEventFormData = null;
  @Output('formData') formData = new EventEmitter<ManageReportEventFormData>();

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  constructor(private eventMgmtSvc: EventMgmtReportCrudService,
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

  buildForm(){
    this.form = this.eventMgmtSvc.buildForm(this.events);
    this.formValidationMessages= this.eventMgmtSvc.formValidationMessages;
    this.formErrors= this.eventMgmtSvc.resetFormErrors();
  }

  handleError(err: any) {
    this.formErrors = this.eventMgmtSvc.resetFormErrors();
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