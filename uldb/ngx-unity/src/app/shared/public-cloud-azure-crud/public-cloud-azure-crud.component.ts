import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { PublicCloudAzureCrudService } from './public-cloud-azure-crud.service';
import { AzureAccountsViewData } from 'src/app/united-cloud/public-cloud/public-cloud-azure/entities/azure-accounts.type';

@Component({
  selector: 'public-cloud-azure-crud',
  templateUrl: './public-cloud-azure-crud.component.html',
  styleUrls: ['./public-cloud-azure-crud.component.scss']
})
export class PublicCloudAzureCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  accountId: number;

  @ViewChild('createacc') createacc: ElementRef;
  createAzureAccountForm: FormGroup;
  createAzureAccountFormErrors: any;
  createAzureAccountValidationMessages: any;
  createAzureAccountModalRef: BsModalRef;

  @ViewChild('editazureacc') editazureacc: ElementRef;
  editAzureAccountModalRef: BsModalRef;
  editAzureAccountForm: FormGroup;
  editAzureAccountFormErrors: any;
  editAzureAccountValidationMessages: any;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  deleteAzureModalRef: BsModalRef;

  constructor(private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private crudSvc: PublicCloudAzureCrudService) {
    this.crudSvc.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((view: AzureAccountsViewData) => {
      if (view) {
        this.accountId = view.accountId;
        this.editAzureAccount(view);
      } else {
        this.addAzureAccount();
      }
    });
    this.crudSvc.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(accountId => {
      this.accountId = accountId;
      this.deleteAzureAccount();
    })
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  addAzureAccount() {
    this.createAzureAccountForm = this.crudSvc.createAzureAccount();
    this.createAzureAccountFormErrors = this.crudSvc.resetFormErrors();
    this.createAzureAccountValidationMessages = this.crudSvc.validationMessages;
    this.createAzureAccountModalRef = this.modalService.show(this.createacc, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmAzureAccountCreate() {
    if (this.createAzureAccountForm.invalid) {
      this.createAzureAccountFormErrors = this.utilService.validateForm(this.createAzureAccountForm, this.createAzureAccountValidationMessages, this.createAzureAccountFormErrors);
      this.createAzureAccountForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.createAzureAccountFormErrors = this.utilService.validateForm(this.createAzureAccountForm, this.createAzureAccountValidationMessages, this.createAzureAccountFormErrors); });
    } else {
      this.spinner.start('main');
      this.createAzureAccountModalRef.hide();
      this.crudSvc.createAzureAcount(this.createAzureAccountForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.notification.success(new Notification('Account created successfully'));
        this.onCrud.emit(CRUDActionTypes.ADD);
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification(err.error));
      });
    }
  }

  deleteAzureAccount() {
    this.deleteAzureModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDeleteAzureAccount() {
    this.deleteAzureModalRef.hide();
    this.spinner.start('main');
    this.crudSvc.deleteAzureAccount(this.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.onCrud.emit(CRUDActionTypes.DELETE);
      this.notification.success(new Notification('Azure Account deleted successfully'));
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification(''));
    });
  }

  editAzureAccount(view: AzureAccountsViewData) {
    this.editAzureAccountForm = this.crudSvc.editAzureAccountForm(view);
    this.editAzureAccountFormErrors = this.crudSvc.resetEditErrors();
    this.editAzureAccountValidationMessages = this.crudSvc.validationEditMessages;
    this.editAzureAccountModalRef = this.modalService.show(this.editazureacc, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  saveAzureAccount() {
    if (this.editAzureAccountForm.invalid) {
      this.editAzureAccountFormErrors = this.utilService.validateForm(this.editAzureAccountForm, this.editAzureAccountValidationMessages, this.editAzureAccountFormErrors);
      this.editAzureAccountForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.editAzureAccountFormErrors = this.utilService.validateForm(this.editAzureAccountForm, this.editAzureAccountValidationMessages, this.editAzureAccountFormErrors); });
    } else {
      this.editAzureAccountModalRef.hide();
      this.spinner.start('main');
      this.crudSvc.editAzureAccount(this.accountId, this.editAzureAccountForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.onCrud.emit(CRUDActionTypes.UPDATE);
        this.notification.success(new Notification('Account updated successfully'));
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        if (err.status != 500) {
          this.notification.error(new Notification(err.error));
        } else {
          this.notification.error(new Notification('Something went wrong. Please try again!!'));
        }
      });
    }
  }

}
