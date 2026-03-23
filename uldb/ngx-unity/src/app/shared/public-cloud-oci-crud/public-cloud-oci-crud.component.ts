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
import { PublicCloudOciCrudService } from './public-cloud-oci-crud.service';
import { OCIAccountViewData } from 'src/app/united-cloud/public-cloud/public-cloud-oci/public-cloud-oci-accounts/public-cloud-oci-accounts.service';
import { IMultiSelectSettings, IMultiSelectTexts } from '../multiselect-dropdown/types';

@Component({
  selector: 'public-cloud-oci-crud',
  templateUrl: './public-cloud-oci-crud.component.html',
  styleUrls: ['./public-cloud-oci-crud.component.scss']
})
export class PublicCloudOciCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  action: 'Add' | 'Edit';
  nonFieldErr: string = '';
  selectedUUID: string;
  regions: { display: string; value: string }[] = [];
  @ViewChild('accountFormRef') accountFormRef: ElementRef;
  accountModelRef: BsModalRef;
  accountForm: FormGroup;
  accountFormErrors: any;
  accountFormValidationMessages: any;

  privateKeyForm: FormGroup;
  privateKeyFormErrors: any;
  privateKeyValidationMessages: any;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  regionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'display',
    keyToSelect: 'value',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    selectionLimit: 1
  };

  // Text configuration
  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All Selected',
  };

  constructor(private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private crudSvc: PublicCloudOciCrudService) {
    this.crudSvc.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((view: OCIAccountViewData) => {
      if (view) {
        this.selectedUUID = view.uuid;
        this.action = 'Edit';
        this.editAccount(view);
      } else {
        this.action = 'Add';
        this.addAccount();
      }
    });
    this.crudSvc.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(uuid => {
      this.selectedUUID = uuid;
      this.deleteAccount();
    })
  }

  ngOnInit(): void {
    this.getRegions();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getRegions() {
    this.crudSvc.getRegions().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: { display: string; value: string }[]) => {
      this.regions = data;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  addAccount() {
    this.action = 'Add';
    this.buildAddEditForm(null);
  }

  editAccount(view: OCIAccountViewData) {
    this.action = 'Edit';
    this.buildAddEditForm(view.uuid);
  }

  buildAddEditForm(uuid?: string) {
    this.nonFieldErr = '';
    this.accountForm = null;
    this.privateKeyForm = null;
    this.selectedUUID = uuid;
    this.crudSvc.createEditAccountForm(uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.accountForm = form;
      this.accountFormErrors = this.crudSvc.resetAccountFormErrors();
      this.accountFormValidationMessages = this.crudSvc.accountValidationMessages;
      this.accountModelRef = this.modalService.show(this.accountFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));

      this.privateKeyForm = this.crudSvc.buildPrivateKeyForm();
      this.privateKeyFormErrors = this.crudSvc.resetPrivateFormErrors();
      this.privateKeyValidationMessages = this.crudSvc.privateKeyValidationMessages;
    });
  }

  handlePrivateKeyInput(files: FileList) {
    for (let index = 0; index < 1; index++) {
      let reader = new FileReader();
      reader.onload = (e: any) => {
        this.privateKeyForm.get('key_content').setValue(e.target.result);
        this.privateKeyFormErrors['key_content'] = '';
      }
      reader.readAsDataURL(files.item(index));
    }
  }

  handleError(err: any) {
    this.accountFormErrors = this.crudSvc.resetAccountFormErrors();
    this.privateKeyFormErrors = this.crudSvc.resetPrivateFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.accountForm.controls) {
          this.accountFormErrors[field] = err[field][0];
        } else {
          if (field == 'key_content') {
            this.privateKeyFormErrors[field] = err[field][0];
          }
        }
      }
    } else {
      this.accountModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  deleteAccount() {
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmAccountCreate() {
    if (this.accountForm.invalid) {
      this.accountFormErrors = this.utilService.validateForm(this.accountForm, this.accountFormValidationMessages, this.accountFormErrors);
      this.accountForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.accountFormErrors = this.utilService.validateForm(this.accountForm, this.accountFormValidationMessages, this.accountFormErrors); });
    } if (this.privateKeyForm.invalid) {
      this.privateKeyFormErrors = this.utilService.validateForm(this.privateKeyForm, this.privateKeyValidationMessages, this.privateKeyFormErrors);
      this.privateKeyForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.privateKeyFormErrors = this.utilService.validateForm(this.privateKeyForm, this.privateKeyValidationMessages, this.privateKeyFormErrors); });
    } else if (this.accountForm.valid && this.privateKeyForm.valid) {
      let obj = this.accountForm.getRawValue();
      obj['region'] = obj.region[0];
      this.spinner.start('main');
      if (this.selectedUUID) {
        this.crudSvc.updateAccount(this.crudSvc.toFormData(obj, this.privateKeyForm.getRawValue()), this.selectedUUID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.accountModelRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Account updated successfully.'));
          this.onCrud.emit(CRUDActionTypes.UPDATE);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudSvc.createAccount(this.crudSvc.toFormData(obj, this.privateKeyForm.getRawValue())).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.accountModelRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Account Created successfully.'));
          this.onCrud.emit(CRUDActionTypes.ADD);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  confirmAccountDelete() {
    this.crudSvc.deleteAccount(this.selectedUUID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmDeleteModalRef.hide();
      this.notification.success(new Notification('Account deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, err => {
      this.confirmDeleteModalRef.hide();
      this.notification.error(new Notification('Account could not be deleted!!'));
    });
  }
}
