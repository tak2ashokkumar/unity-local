import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { PublicCloudAwsCrudService } from './public-cloud-aws-crud.service';
import { FormGroup } from '@angular/forms';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AWSAccountViewData } from 'src/app/united-cloud/public-cloud/public-cloud-aws/public-cloud-aws-summary/public-cloud-aws-summary.service';

@Component({
  selector: 'public-cloud-aws-crud',
  templateUrl: './public-cloud-aws-crud.component.html',
  styleUrls: ['./public-cloud-aws-crud.component.scss']
})
export class PublicCloudAwsCrudComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  accountId: number;
  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  @ViewChild('addAccount') addAccount: ElementRef;
  addAccountModalRef: BsModalRef;
  addAccountFormErrors: any;
  addAccountValidationMessages: any;
  addAccountForm: FormGroup;

  @ViewChild('editAccount') editAccount: ElementRef;
  editAccountModalRef: BsModalRef;
  editAccountFormErrors: any;
  editAccountValidationMessages: any;
  editAccountForm: FormGroup;

  constructor(private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private notificationService: AppNotificationService,
    private utilService: AppUtilityService,
    private crudSvc: PublicCloudAwsCrudService) {
    this.crudSvc.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((view: AWSAccountViewData) => {
      if (view) {
        this.editAWSAccount(view);
      } else {
        this.addAWSAccount();
      }
    });
    this.crudSvc.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(accountId => {
      this.accountId = accountId;
      this.deleteAccount();
    })
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  addAWSAccount() {
    this.addAccountFormErrors = this.crudSvc.resetAddAccountFormErrors();
    this.addAccountValidationMessages = this.crudSvc.addAccountValidationMessages;
    this.addAccountForm = this.crudSvc.createAddAccountForm();
    this.addAccountModalRef = this.modalService.show(this.addAccount, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  createAccount() {
    if (this.addAccountForm.invalid) {
      this.addAccountFormErrors = this.utilService.validateForm(this.addAccountForm, this.addAccountValidationMessages, this.addAccountFormErrors);
      this.addAccountForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.addAccountFormErrors = this.utilService.validateForm(this.addAccountForm, this.addAccountValidationMessages, this.addAccountFormErrors); });
    } else {
      this.spinner.start('main');
      const data = this.addAccountForm.getRawValue();
      this.crudSvc.addAccount(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.onCrud.emit(CRUDActionTypes.ADD);
        this.addAccountModalRef.hide();
        this.spinner.stop('main');
        this.notificationService.success(new Notification('Account added successfully'));
      }, (err: HttpErrorResponse) => {
        if (err.error.data) {
          this.notificationService.error(new Notification(err.error.data));
        } else {
          this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
        }
        this.addAccountModalRef.hide();
        this.spinner.stop('main');
      });
    }
  }

  editAWSAccount(view: AWSAccountViewData) {
    this.editAccountFormErrors = this.crudSvc.resetEditAccountFormErrors();
    this.editAccountValidationMessages = this.crudSvc.editAccountValidationMessages;
    this.editAccountForm = this.crudSvc.createEditAddAccountForm(view);
    this.editAccountModalRef = this.modalService.show(this.editAccount, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  updateAccount() {
    if (this.editAccountForm.invalid) {
      this.editAccountFormErrors = this.utilService.validateForm(this.editAccountForm, this.editAccountValidationMessages, this.editAccountFormErrors);
      this.editAccountForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.editAccountFormErrors = this.utilService.validateForm(this.editAccountForm, this.editAccountValidationMessages, this.editAccountFormErrors); });
    } else {
      this.spinner.start('main');
      const data = this.editAccountForm.getRawValue();
      this.crudSvc.updateAccount(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.onCrud.emit(CRUDActionTypes.UPDATE);
        this.editAccountModalRef.hide();
        this.spinner.stop('main');
        this.notificationService.success(new Notification('Account updated successfully'));
      }, (err: HttpErrorResponse) => {
        if (err.status < 500) {
          this.editAccountFormErrors.error = err.error;
        } else {
          this.editAccountModalRef.hide();
          this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
        }
        this.spinner.stop('main');
      });
    }
  }

  deleteAccount() {
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.crudSvc.deleteAccount(this.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.onCrud.emit(CRUDActionTypes.DELETE);
      this.confirmModalRef.hide();
      this.notificationService.success(new Notification('Account deleted successfully'));
    }, err => {
      this.confirmModalRef.hide();
      this.notificationService.error(new Notification('Account could not be deleted!!'));
    });
  }
}
