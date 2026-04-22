import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GCPAccountViewData } from 'src/app/united-cloud/public-cloud/public-cloud-gcp/gcp-dashboard/gcp-dashboard.service';
import { AppNotificationService } from '../../shared/app-notification/app-notification.service';
import { Notification } from '../../shared/app-notification/notification.type';
import { AppSpinnerService } from '../../shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes } from '../../shared/app-utility/app-utility.service';
import { PublicCloudGcpCrudService } from './public-cloud-gcp-crud.service';

@Component({
  selector: 'public-cloud-gcp-crud',
  templateUrl: './public-cloud-gcp-crud.component.html',
  styleUrls: ['./public-cloud-gcp-crud.component.scss']
})
export class PublicCloudGcpCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  accountId: string;

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  @ViewChild('accountAddEdit') account: ElementRef;
  actionMessage: 'Add' | 'Edit';
  accountAddEditModalRef: BsModalRef;
  accountAddEditFormErrors: any;
  accountAddEditValidationMessages: any;
  accountAddEditForm: FormGroup;

  constructor(private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private crudSvc: PublicCloudGcpCrudService) {
    this.crudSvc.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((view: GCPAccountViewData) => {
      if (view) {
        this.accountId = view.uuid;
        this.editAccount(view);
      } else {
        this.addAccount();
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

  addAccount() {
    this.actionMessage = 'Add';
    this.accountAddEditForm = this.crudSvc.buildForm();
    this.accountAddEditFormErrors = this.crudSvc.resetAddFormErrors();
    this.accountAddEditValidationMessages = this.crudSvc.addFormValidationMessages();
    this.accountAddEditModalRef = this.modalService.show(this.account, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  editAccount(view: GCPAccountViewData) {
    this.actionMessage = 'Edit';
    this.accountAddEditForm = this.crudSvc.buildForm(view);
    this.accountAddEditFormErrors = this.crudSvc.resetAddFormErrors();
    this.accountAddEditValidationMessages = this.crudSvc.addFormValidationMessages();
    this.accountAddEditModalRef = this.modalService.show(this.account, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  handleError(err: any) {
    this.accountAddEditFormErrors = this.crudSvc.resetAddFormErrors();
    if (err.error) {
      this.accountAddEditFormErrors.error = err.error;
    } else if (err) {
      for (const field in err) {
        if (field in this.accountAddEditForm.controls) {
          this.accountAddEditFormErrors[field] = err[field][0];
        }
      }
    } else {
      let action: string = this.actionMessage == 'Add' ? 'create' : 'update'
      this.notification.error(new Notification('Failed to ' + action + 'GCP Account. Please try again later.'));
    }
    this.accountAddEditModalRef.hide();
    this.spinner.stop('main');
  }

  onSubmit() {
    if (this.accountAddEditForm.invalid) {
      this.accountAddEditFormErrors = this.utilService.validateForm(this.accountAddEditForm, this.accountAddEditValidationMessages, this.accountAddEditFormErrors);
      this.accountAddEditForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.accountAddEditFormErrors = this.utilService.validateForm(this.accountAddEditForm, this.accountAddEditValidationMessages, this.accountAddEditFormErrors); });
    } else {
      if (this.actionMessage == 'Add') {
        this.spinner.start('main');
        this.crudSvc.addAccount(this.accountAddEditForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.onCrud.emit(CRUDActionTypes.ADD);
            this.accountAddEditModalRef.hide();
            this.spinner.stop('main');
            this.notification.success(new Notification('Account added successfully'));
          }, (err: HttpErrorResponse) => {
            this.handleError(err);
          });
      } else {
        this.spinner.start('main');
        this.crudSvc.updateAccount(this.accountAddEditForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.accountAddEditModalRef.hide();
            this.onCrud.emit(CRUDActionTypes.UPDATE);
            this.spinner.stop('main');
            this.notification.success(new Notification('Account updated Successfully'));
          }, (err: HttpErrorResponse) => {
            this.handleError(err);
          });
      }
    }
  }

  deleteAccount() {
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.crudSvc.deleteAccount(this.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.onCrud.emit(CRUDActionTypes.DELETE);
      this.confirmModalRef.hide();
      this.notification.success(new Notification('Account deleted successfully'));
    }, err => {
      this.confirmModalRef.hide();
      this.notification.error(new Notification('Account could not be deleted!!'));
    });
  }
}
