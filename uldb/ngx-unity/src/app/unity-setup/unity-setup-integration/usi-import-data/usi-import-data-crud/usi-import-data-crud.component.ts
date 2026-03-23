import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { UsiImportDataCrudService } from './usi-import-data-crud.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'usi-import-data-crud',
  templateUrl: './usi-import-data-crud.component.html',
  styleUrls: ['./usi-import-data-crud.component.scss']
})
export class UsiImportDataCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();
  importForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';
  invalidForms: boolean = false;

  constructor(
    private spinner: AppSpinnerService,
    private crudSvc: UsiImportDataCrudService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private route: ActivatedRoute,
    private router: Router) {
    this.crudSvc.invalidAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.invalidForms = true;
    });
  }

  ngOnInit() {
    this.buildForm();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  childFormData($event: any) {
    let childFormData = $event;
    if (this.importForm.valid) {
      this.invalidForms = false;
      let fd = Object.assign({}, this.importForm.getRawValue(), childFormData);
      this.submitFinalFormData(this.crudSvc.convertToFormData(fd));
    }
  }

  submitFinalFormData(fd: FormData) {
    this.spinner.start('main');
    this.crudSvc.submitFormData(fd).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.spinner.stop('main');
      this.goBack();
    }, (err: HttpErrorResponse) => {
      this.handleError(err);
    });
  };

  buildForm() {
    this.importForm = this.crudSvc.buildForm();
    this.formErrors = this.crudSvc.resetFormErrors();
    this.validationMessages = this.crudSvc.validationMessages;
    this.importForm.get('platform').setValue('sustainability');
  }

  handleError(err: any) {
    this.crudSvc.announceHandleError(err);
    this.formErrors = this.crudSvc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.importForm.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmit() {
    this.crudSvc.annouceSubmit();
    if (this.importForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.importForm, this.validationMessages, this.formErrors);
      this.importForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.importForm, this.validationMessages, this.formErrors); });
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
