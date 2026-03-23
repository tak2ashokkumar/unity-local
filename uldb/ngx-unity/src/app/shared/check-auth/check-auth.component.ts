import { Component, OnInit, ElementRef, ViewChild, OnDestroy, Input } from '@angular/core';
import { CheckAuthService, AuthType, ConsoleAccessInput } from './check-auth.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AppUtilityService, NoWhitespaceValidator } from '../app-utility/app-utility.service';
import { AppSpinnerService } from '../app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'check-auth',
  templateUrl: './check-auth.component.html',
  styleUrls: ['./check-auth.component.scss']
})
export class CheckAuthComponent implements OnInit, OnDestroy {
  input: ConsoleAccessInput;
  @ViewChild('checkAuthForm') elementView: ElementRef;
  modalRef: BsModalRef;
  authForm: FormGroup;
  formErrors: any;
  validationMessages: any;

  privateKeyForm: FormGroup;
  privateKeyFormErrors: any;
  privateKeyValidationMessages: any;

  authData: AuthType = null;
  private ngUnsubscribe = new Subject();
  constructor(private authService: CheckAuthService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService) {
    this.authService.authAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((input) => {
      this.input = input;
      this.privateKeyForm = null;
      this.onHidden();
      this.buildForm();
      this.modalRef = this.modalService.show(this.elementView, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  ngOnInit() {
  }
  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onHidden() {
    this.modalService.onHidden.pipe(takeUntil(this.ngUnsubscribe)).subscribe((reason: string) => {
      if (reason == 'backdrop-click' || reason == 'esc') {
        this.authService.authConfirmed(null);
      } else {
        this.authService.authConfirmed(this.authData);
      }
    });
  }

  buildForm() {
    this.authForm = this.authService.buildForm(this.input);
    this.formErrors = this.authService.resetFormErrors();
    this.validationMessages = this.authService.validationMessages;
    this.authForm.get('authtype').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value == 'password') {
        this.privateKeyForm = null;
        this.authForm.addControl('password', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      } else {
        this.authForm.removeControl('password');
        this.buildPrivateKeyForm();
      }
    });
  }

  buildPrivateKeyForm() {
    this.privateKeyForm = this.authService.buildPrivateKeyForm();
    this.privateKeyFormErrors = this.authService.resetPrivateFormErrors();
    this.privateKeyValidationMessages = this.authService.privateKeyValidationMessages;
  }

  handlePrivateKeyInput(files: FileList) {
    for (let index = 0; index < 1; index++) {
      let reader = new FileReader();
      reader.onload = (e: any) => {
        this.privateKeyForm.get('pkey').setValue(e.target.result);
        this.privateKeyFormErrors['pkey'] = '';
      }
      reader.readAsDataURL(files.item(index));
    }
  }

  onSubmit() {
    if (this.authForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.authForm, this.validationMessages, this.formErrors);
      this.authForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.authForm, this.validationMessages, this.formErrors); });
    }
    if (this.privateKeyForm && this.privateKeyForm.invalid) {
      this.privateKeyFormErrors = this.utilService.validateForm(this.privateKeyForm, this.privateKeyValidationMessages, this.privateKeyFormErrors);
      this.privateKeyForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.privateKeyFormErrors = this.utilService.validateForm(this.privateKeyForm, this.privateKeyValidationMessages, this.privateKeyFormErrors); });
    }
    if (this.authForm.valid) {
      if (this.privateKeyForm && this.privateKeyForm.invalid) {
        return;
      }
      this.spinner.start('main');
      this.formErrors = this.authService.resetFormErrors();
      let fd = this.authService.toFormData(<AuthType>this.authForm.getRawValue(), this.privateKeyForm ? this.privateKeyForm.getRawValue() : null);
      this.authService.validateAuth(this.input.deviceType, this.input.deviceId, fd)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.authData = <AuthType>this.authForm.getRawValue();
          this.authData.agent_id = res.agent_id;
          this.authData.org_id = res.org_id;
          this.authData.pkey = res.pkey;
          this.modalRef.hide();
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.formErrors.invalidCred = err.error;
          this.spinner.stop('main');
        });
    }
  }

  closeModal() {
    this.authData = null;
    this.modalRef.hide();
  }
}

