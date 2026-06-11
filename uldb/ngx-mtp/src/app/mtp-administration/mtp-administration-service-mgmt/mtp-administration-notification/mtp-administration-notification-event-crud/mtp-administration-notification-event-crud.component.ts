import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { CRMTenantDataType, MtpAdministrationNotificationEventCrudService, eventOptions, severityOptions, ticketTypeOptions } from './mtp-administration-notification-event-crud.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { take, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { MTPTicketInstance } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';

@Component({
  selector: 'mtp-administration-notification-event-crud',
  templateUrl: './mtp-administration-notification-event-crud.component.html',
  styleUrls: ['./mtp-administration-notification-event-crud.component.scss'],
  providers: [MtpAdministrationNotificationEventCrudService]
})
export class MtpAdministrationNotificationEventCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  nonFieldErr: string = '';

  action: 'Add' | 'Update';
  eventId: string;
  tenants: CRMTenantDataType[] = [];
  instance: MTPTicketInstance;
  severityOptions = severityOptions;
  eventOptions = eventOptions;
  ticketOptions = ticketTypeOptions;

  eventSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
  };

  tenantSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "id",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
  };

  constructor(private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private crudSvc: MtpAdministrationNotificationEventCrudService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
  ) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.eventId = params.get('eventId');
      this.action = this.eventId ? 'Update' : 'Add';
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getInstance();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getInstance() {
    this.spinner.start('main');
    this.crudSvc.getInstance().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.length) {
        this.instance = res.getFirst();
      }
      this.getTenants();
      this.spinner.stop('main');
    }, err => {
      this.instance = null;
      this.spinner.stop('main');
    });
  }

  getTenants() {
    this.spinner.start('main');
    this.crudSvc.getCRMTenants(this.instance.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res && res.length) {
        this.tenants = res;
      } else {
        this.tenants = [];
      }
      this.buildForm();
      this.spinner.stop('main');
    }, err => {
      this.tenants = [];
      this.spinner.stop('main');
    });
  }

  buildForm() {
    this.spinner.start('main');
    this.crudSvc.createForm(this.eventId, this.instance.uuid).pipe(take(1)).subscribe(res => {
      this.form = res;
      this.formErrors = this.crudSvc.resetFormErrors();
      this.formValidationMessages = this.crudSvc.validationMessages;
      this.spinner.stop('main');
    });
    this.spinner.stop('main');
  }

  handleError(err: any) {
    this.formErrors = this.crudSvc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  submit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors); });
    } else {
      let obj = Object.assign({}, this.form.getRawValue());
      this.spinner.start('main');
      if (this.eventId) {
        this.crudSvc.updateEvent(this.eventId, this.instance.uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.goBack();
          this.notification.success(new Notification('Event updated successfully.'));
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudSvc.createEvent(this.instance.uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.goBack();
          this.notification.success(new Notification('Event Created successfully.'));
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}