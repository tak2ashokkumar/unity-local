import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MSDynamicsCRMType, MtpAdministrationIntegrationsService } from './mtp-administration-integrations.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { isString } from 'lodash-es';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { MTPTicketInstance } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';
import { ActivatedRoute, Router } from '@angular/router';
import { AzureCrudService } from './azure-crud/azure-crud.service';
import { ServicenowCrudService } from './servicenow-crud/servicenow-crud.service';

@Component({
  selector: 'mtp-administration-integrations',
  templateUrl: './mtp-administration-integrations.component.html',
  styleUrls: ['./mtp-administration-integrations.component.scss'],
  providers: [MtpAdministrationIntegrationsService, ServicenowCrudService]
})
export class MtpAdministrationIntegrationsComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  crmImageUrl = `${environment.assetsUrl}external-brand/ms-dynamic-crm.svg`;
  azureImageURL: string = `${environment.assetsUrl}external-brand/azure.svg`;
  azureADImageURL: string = `${environment.assetsUrl}external-brand/azure-ad.svg`;
  serviceNowImageURL: string = `${environment.assetsUrl}external-brand/servicenow.svg`;

  instance: MTPTicketInstance;
  @ViewChild('create') create: ElementRef;
  modalRef: BsModalRef;
  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';
  constructor(private svc: MtpAdministrationIntegrationsService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private crudSvc: AzureCrudService,
    private snCrudSvc: ServicenowCrudService) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.getInstance();
    })
  }

  getInstance() {
    this.spinner.start('main');
    this.svc.getInstance().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res && res.length) {
        this.instance = res[0];
      } else {
        this.instance = null;
      }
      this.spinner.stop('main');
    }, err => {
      this.instance = null;
      this.spinner.stop('main');
    });
  }

  goToViewDetails() {
    this.router.navigate(['azure'], { relativeTo: this.route })
  }

  goToServiceNowViewDetails() {
    this.router.navigate(['servicenow'], { relativeTo: this.route })
  }

  addAzureAccount() {
    this.crudSvc.addOrEdit(null);
  }

  addServiceNowAccount() {
    this.router.navigate(['servicenow/add'], { relativeTo: this.route });
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['azure'], { relativeTo: this.route });
  }

  onServiceNowCrud(event: CRUDActionTypes) {
    this.router.navigate(['servicenow'], { relativeTo: this.route });
  }

  buildForm() {
    this.nonFieldErr = '';
    this.form = this.svc.buildForm(this.instance);
    this.formErrors = this.svc.resetFormErrors();
    this.validationMessages = this.svc.validationMessages;
    this.modalRef = this.modalService.show(this.create, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
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
      this.svc.save(<MSDynamicsCRMType>this.form.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.modalRef.hide();
          this.notification.success(new Notification('Microsoft Dynamics CRM added successfully'));
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
    }
  }

}
