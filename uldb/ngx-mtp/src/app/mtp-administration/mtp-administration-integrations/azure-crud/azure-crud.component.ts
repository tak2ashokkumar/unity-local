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
import { AzureAccountsViewData } from '../azure-details/azure-details.service';
import { AzureCrudService } from './azure-crud.service';

@Component({
  selector: 'azure-crud',
  templateUrl: './azure-crud.component.html',
  styleUrls: ['./azure-crud.component.scss'],
})
export class AzureCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  accountId: string;
  actionMessage: 'Add' | 'Edit';
  nonFieldErr: string = '';
  selectedViewData: AzureAccountsViewData;

  @ViewChild('createacc') createacc: ElementRef;
  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  modalRef: BsModalRef;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  deleteAzureModalRef: BsModalRef;

  constructor(private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private crudSvc: AzureCrudService) {
    this.crudSvc.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((view: AzureAccountsViewData) => {
      if (view) {
        this.accountId = view.uuid;
        this.actionMessage = 'Edit';
        this.editAzureAccount(view);
      } else {
        this.actionMessage = 'Add';
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
    this.actionMessage = 'Add';
    this.buildForm(null);
  }

  buildForm(view: AzureAccountsViewData) {
    this.nonFieldErr = '';
    this.form = this.crudSvc.buildForm(view);
    this.formErrors = this.crudSvc.resetFormErrors();
    this.validationMessages = this.crudSvc.validationMessages;
    this.modalRef = this.modalService.show(this.createacc, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
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
      this.modalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  confirmAzureAccountCreate() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors); });
    } else {
      if (this.selectedViewData) {
        this.modalRef.hide();
        this.spinner.start('main');
        this.crudSvc.editAzureAccount(this.accountId, this.form.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.onCrud.emit(CRUDActionTypes.UPDATE);
          this.notification.success(new Notification('Account updated successfully'));
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.spinner.start('main');
        this.modalRef.hide();
        this.crudSvc.createAzureAcount(this.form.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.notification.success(new Notification('Account created successfully'));
          this.onCrud.emit(CRUDActionTypes.ADD);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  editAzureAccount(view: AzureAccountsViewData) {
    this.selectedViewData = view;
    this.actionMessage = 'Edit';
    this.buildForm(view);
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
      this.notification.error(new Notification("Failed to delete. Please try again."));
    });
  }
}
