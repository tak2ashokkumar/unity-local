import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { UsiMsDynamicsCrmCrudService } from './usi-ms-dynamics-crm-crud.service';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { isString } from 'lodash-es';
import { MSDynamicsCRMType } from '../usi-ms-dynamics-crm.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'usi-ms-dynamics-crm-crud',
  templateUrl: './usi-ms-dynamics-crm-crud.component.html',
  styleUrls: ['./usi-ms-dynamics-crm-crud.component.scss']
})
export class UsiMsDynamicsCrmCrudComponent implements OnInit {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;

  actionMessage: 'Add' | 'Edit';
  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';
  instanceId: string;
  private ngUnsubscribe = new Subject();

  isAddOrEdit: boolean = false;

  constructor(private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private crudSvc: UsiMsDynamicsCrmCrudService,
    private route: ActivatedRoute,
    private router: Router) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((param: ParamMap) => {
      this.instanceId = param.get('instanceId');
    })
    this.crudSvc.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(uuid => {
      this.instanceId = uuid;
      this.delete(uuid);
    })
  }

  ngOnInit(): void {
    this.isAddOrEdit = this.router.url == '/setup/integration/msdynamics' || this.router.url.includes('create') || this.router.url.includes('edit');
    if (this.isAddOrEdit) {
      this.spinner.start('main');
      if (this.instanceId) {
        this.buildForm(this.instanceId);
      } else {
        this.buildForm(null);
      }
    }
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  delete(uuid: string) {
    this.instanceId = uuid;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.modalRef.hide();
    this.crudSvc.delete(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notification.success(new Notification('ServiceNow disconnected successfully'));
      this.onCrud.emit(CRUDActionTypes.DELETE)
    }, err => {
      this.notification.error(new Notification('ServiceNow could not be disconnected'));
    });
  }

  buildForm(instanceId: string) {
    this.crudSvc.buildForm(instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.form = form;
      this.formErrors = this.crudSvc.resetFormErrors();
      this.validationMessages = this.crudSvc.validationMessages;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    });
  }

  handleError(err: any) {
    this.formErrors = this.crudSvc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.modalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.spinner.start('main');
      if (this.instanceId) {
        this.crudSvc.save(this.instanceId, <MSDynamicsCRMType>this.form.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.notification.success(new Notification('Microsoft Dynamics CRM updated successfully'));
            this.spinner.stop('main');
            this.goBack();
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
          });
      } else {
        this.crudSvc.save(null, <MSDynamicsCRMType>this.form.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.notification.success(new Notification('Microsoft Dynamics CRM added successfully'));
            this.spinner.stop('main');
            this.goBack();
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
          });
      }
    }
  }

  goBack() {
    if (this.instanceId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
