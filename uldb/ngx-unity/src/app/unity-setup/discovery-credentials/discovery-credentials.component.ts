import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { DiscoveryCredentialsService, DiscoveryCredentialViewData } from './discovery-credentials.service';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RxwebValidators, IpVersion } from '@rxweb/reactive-form-validators';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AUTH_ALGOS, CRYPTO_ALGOS } from 'src/app/app-constants';

@Component({
  selector: 'discovery-credentials',
  templateUrl: './discovery-credentials.component.html',
  styleUrls: ['./discovery-credentials.component.scss'],
  providers: [DiscoveryCredentialsService]
})
export class DiscoveryCredentialsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  count: number = 0;
  viewData: DiscoveryCredentialViewData[] = [];
  selectedView: DiscoveryCredentialViewData;
  @ViewChild('credentialCRUD') credentialCRUD: ElementRef;

  @Output() toggleModal: EventEmitter<string> = new EventEmitter<string>();

  modalRef: BsModalRef;
  credentialForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';
  action: 'Add' | 'Edit';

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  authAlgos = AUTH_ALGOS;
  cryptoAlgos = CRYPTO_ALGOS;

  constructor(private notificationService: AppNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private credentialService: DiscoveryCredentialsService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getCredentials();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getCredentials();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getCredentials();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getCredentials();
  }

  getCredentials() {
    this.credentialService.getCredentials(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.credentialService.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification(err.error.error));
    });
  }

  createCredForm(view: DiscoveryCredentialViewData) {
    this.credentialForm = this.credentialService.buildForm(view);
    this.formErrors = this.credentialService.resetFormErrors();
    this.validationMessages = this.credentialService.validationMessages;
    this.modalRef = this.modalService.show(this.credentialCRUD, { class: 'second', keyboard: true, ignoreBackdropClick: true });
    this.credentialForm.get('type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val == 'SNMPv1' || val == 'SNMPv2') {
        this.credentialForm.removeControl('username');
        this.credentialForm.removeControl('key');
        this.credentialForm.removeControl('password');
        this.credentialForm.removeControl('sudo_password');
        this.credentialForm.removeControl('host');
        this.credentialForm.removeControl('ip_address');

        this.credentialForm.removeControl('security_name');
        this.credentialForm.removeControl('security_level');
        this.credentialForm.removeControl('authentication_protocol');
        this.credentialForm.removeControl('authentication_passphrase');
        this.credentialForm.removeControl('privacy_protocol');
        this.credentialForm.removeControl('privacy_passphrase');

        this.credentialForm.addControl('community', new FormControl('', [Validators.required]));
      } else if (val == 'SSH' || val == 'Windows' || val == 'Default' || val == 'REDFISH') {
        this.credentialForm.removeControl('community');
        this.credentialForm.removeControl('key');
        this.credentialForm.removeControl('sudo_password');
        this.credentialForm.removeControl('host');
        this.credentialForm.removeControl('ip_address');

        this.credentialForm.removeControl('security_name');
        this.credentialForm.removeControl('security_level');
        this.credentialForm.removeControl('authentication_protocol');
        this.credentialForm.removeControl('authentication_passphrase');
        this.credentialForm.removeControl('privacy_protocol');
        this.credentialForm.removeControl('privacy_passphrase');

        this.credentialForm.addControl('username', new FormControl('', [Validators.required]));
        this.credentialForm.addControl('password', new FormControl('', [Validators.required]));
      } else if (val == 'SSH Key') {
        this.credentialForm.removeControl('community');
        this.credentialForm.removeControl('security_name');
        this.credentialForm.removeControl('security_level');
        this.credentialForm.removeControl('authentication_protocol');
        this.credentialForm.removeControl('authentication_passphrase');
        this.credentialForm.removeControl('privacy_protocol');
        this.credentialForm.removeControl('privacy_passphrase');
        this.credentialForm.removeControl('host');
        this.credentialForm.removeControl('ip_address');

        this.credentialForm.addControl('username', new FormControl('', [Validators.required]));
        this.credentialForm.addControl('key', new FormControl('', [Validators.required]));
        this.credentialForm.addControl('password', new FormControl('', [Validators.required]));
        this.credentialForm.addControl('sudo_password', new FormControl(''));
      } else if (val == 'SNMPv3') {
        this.credentialForm.removeControl('community');
        this.credentialForm.removeControl('username');
        this.credentialForm.removeControl('key');
        this.credentialForm.removeControl('password');
        this.credentialForm.removeControl('sudo_password');
        this.credentialForm.removeControl('host');
        this.credentialForm.removeControl('ip_address');

        this.credentialForm.addControl('security_name', new FormControl('', [Validators.required]));
        this.credentialForm.addControl('security_level', new FormControl('', [Validators.required]));
        this.credentialForm.addControl('authentication_protocol', new FormControl('', [Validators.required]));
        this.credentialForm.addControl('authentication_passphrase', new FormControl('', [Validators.required]));
        this.credentialForm.addControl('privacy_protocol', new FormControl('', [Validators.required]));
        this.credentialForm.addControl('privacy_passphrase', new FormControl('', [Validators.required]));
      } else if (val == 'Active Directory') {
        this.credentialForm.removeControl('key');
        this.credentialForm.removeControl('sudo_password');
        this.credentialForm.removeControl('community');
        this.credentialForm.removeControl('security_name');
        this.credentialForm.removeControl('security_level');
        this.credentialForm.removeControl('authentication_protocol');
        this.credentialForm.removeControl('authentication_passphrase');
        this.credentialForm.removeControl('privacy_protocol');
        this.credentialForm.removeControl('privacy_passphrase');

        this.credentialForm.addControl('host', new FormControl('', [Validators.required]));
        this.credentialForm.addControl('ip_address', new FormControl('', [Validators.required, RxwebValidators.ip({ version: IpVersion.AnyOne })]));
        this.credentialForm.addControl('username', new FormControl('', [Validators.required]));
        this.credentialForm.addControl('password', new FormControl('', [Validators.required]));
      }
    });
  }

  addCredential() {
    this.toggleModal.emit();
    this.nonFieldErr = '';
    this.action = 'Add';
    this.selectedView = null;
    this.createCredForm(null);
  }

  editCredential(view: DiscoveryCredentialViewData) {
    this.selectedView = view;
    this.action = 'Edit';
    this.toggleModal.emit();
    this.nonFieldErr = '';
    this.createCredForm(view);
  }

  onFocus(ctrName: string) {
    this.credentialForm.get(ctrName).setValue('');
    this.credentialForm.get(ctrName).updateValueAndValidity();
  }

  onBlur(ctrName: string) {
    if (this.credentialForm.get(ctrName).value == '') {
      this.credentialForm.get(ctrName).reset(Array(this.selectedView[ctrName].length).fill('*').join(''))
      this.credentialForm.get(ctrName).updateValueAndValidity();
    }
  }

  handleError(err: any) {
    this.formErrors = this.credentialService.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.credentialForm.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.closeAddModal();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
  }

  submitCredentialForm() {
    if (this.credentialForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.credentialForm, this.validationMessages, this.formErrors);
      this.credentialForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.credentialForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.spinner.start('main');
      if (this.selectedView) {
        let obj = this.credentialForm.getRawValue();
        if (this.credentialForm.get('password')) {
          if (!this.credentialForm.get('password').touched) {
            delete obj['password'];
          }
        }
        if (this.credentialForm.get('sudo_password')) {
          if (!this.credentialForm.get('sudo_password').touched) {
            delete obj['sudo_password'];
          }
        }
        this.credentialService.updateCredential(this.selectedView.uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.getCredentials();
          this.closeAddModal();
          this.spinner.stop('main');
          this.notificationService.success(new Notification('Credential updated successfully.'));
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        });
      } else {
        this.credentialService.addCredential(this.credentialForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.getCredentials();
          this.closeAddModal();
          this.spinner.stop('main');
          this.notificationService.success(new Notification('Credential added successfully.'));
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        });
      }
    }
  }

  closeAddModal() {
    this.toggleModal.emit();
    this.modalRef.hide();
  }

  deleteCredential(view: DiscoveryCredentialViewData) {
    this.selectedView = view;
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: 'second', backdrop: true, keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.confirmModalRef.hide();
    this.credentialService.deleteCredential(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getCredentials();
      this.spinner.stop('main');
      this.notificationService.success(new Notification('Credentials Deleted sucessfully'));
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Error while deleting. Please try again!!'));
    });
  }
}
