import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { AgentConfigurationViewData } from '../advanced-discovery-connectivity.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdvancedDiscoveryConnectivityCrudService } from './advanced-discovery-connectivity-crud.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { AuthType } from 'src/app/shared/check-auth/check-auth.service';

@Component({
  selector: 'advanced-discovery-connectivity-crud',
  templateUrl: './advanced-discovery-connectivity-crud.component.html',
  styleUrls: ['./advanced-discovery-connectivity-crud.component.scss']
})
export class AdvancedDiscoveryConnectivityCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  selectedAgent: AgentConfigurationViewData;

  modalRef: BsModalRef;
  agentForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';
  resetPassword: boolean = false;
  action: 'Add' | 'Edit';
  @ViewChild('addEditTemplate') addEditTemplate: ElementRef;

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  privateKeyForm: FormGroup;
  privateKeyFormErrors: any;
  privateKeyValidationMessages: any;
  
  constructor(private agentService: AdvancedDiscoveryConnectivityCrudService,
    private notificationService: AppNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService) {
    this.agentService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((view: AgentConfigurationViewData) => {
      this.agentForm = null;
      this.privateKeyForm = null;
      if (view) {
        this.editAgent(view);
      } else {
        this.addAgent();
      }
    });
    this.agentService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(view => {
      this.deleteConfig(view);
    })
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  addAgent() {
    this.action = 'Add';
    this.nonFieldErr = '';
    this.resetPassword = true;
    this.agentForm = this.agentService.buildForm();
    this.subscribeAuthType();
    this.formErrors = this.agentService.resetFormErrors();
    this.validationMessages = this.agentService.validationMessages;
    this.modalRef = this.modalService.show(this.addEditTemplate, { class: '', keyboard: true, ignoreBackdropClick: true });
  }

  editAgent(view: AgentConfigurationViewData) {
    this.action = 'Edit';
    this.nonFieldErr = '';
    this.resetPassword = false;
    this.selectedAgent = view;
    this.agentForm = this.agentService.buildForm(view);
    this.formErrors = this.agentService.resetFormErrors();
    this.validationMessages = this.agentService.validationMessages;
    this.modalRef = this.modalService.show(this.addEditTemplate, { class: '', keyboard: true, ignoreBackdropClick: true });
  }

  buildPrivateKeyForm() {
    this.privateKeyForm = this.agentService.buildPrivateKeyForm();
    this.privateKeyFormErrors = this.agentService.resetPrivateFormErrors();
    this.privateKeyValidationMessages = this.agentService.privateKeyValidationMessages;
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

  subscribeAuthType() {
    this.agentForm.get('ssh_authtype').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value == 'password') {
        this.agentForm.removeControl('sudo_password');
        this.privateKeyForm = null;
        this.agentForm.addControl('ssh_password', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      } else {
        this.agentForm.removeControl('ssh_password');
        this.agentForm.addControl('sudo_password', new FormControl('', [Validators.required, NoWhitespaceValidator]));
        this.buildPrivateKeyForm();
      }
    });
  }

  toggleResetPasswordField() {
    this.resetPassword = !this.resetPassword;
    if (this.resetPassword) {
      this.agentForm.addControl('ssh_authtype', new FormControl('password', [Validators.required]));
      this.agentForm.addControl('ssh_password', new FormControl('', [Validators.required, NoWhitespaceValidator]));
    } else {
      this.agentForm.removeControl('ssh_authtype');
      this.agentForm.removeControl('ssh_password');
      this.agentForm.removeControl('sudo_password');
      this.privateKeyForm = null;
    }
    this.subscribeAuthType();
  }

  closeAddModal() {
    this.modalRef.hide();
    // if (this.selectedAgent) {
    //   this.selectedAgent.updating = false;
    // }
  }

  handleError(err: any) {
    this.formErrors = this.agentService.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.agentForm.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.closeAddModal();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
  }

  submitAgentForm() {
    if (this.agentForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.agentForm, this.validationMessages, this.formErrors);
      this.agentForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.agentForm, this.validationMessages, this.formErrors); });
      return;
    }    
    if (this.privateKeyForm && this.privateKeyForm.invalid) {
      this.privateKeyFormErrors = this.utilService.validateForm(this.privateKeyForm, this.privateKeyValidationMessages, this.privateKeyFormErrors);
      this.privateKeyForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.privateKeyFormErrors = this.utilService.validateForm(this.privateKeyForm, this.privateKeyValidationMessages, this.privateKeyFormErrors); });
    }
    if (this.agentForm.valid) {
      if (this.privateKeyForm && this.privateKeyForm.invalid) {
        return;
      }
      this.spinner.start('main');
      let uuid = this.agentForm.getRawValue().uuid;
      let fd = this.agentService.toFormData(<AuthType>this.agentForm.getRawValue(), this.privateKeyForm ? this.privateKeyForm.getRawValue() : null);
      if (this.action == 'Add') {
        this.agentService.addConfigurations(fd).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          this.notificationService.success(new Notification('Collector Installation is complete.'));
          this.closeAddModal();
          this.agentService.crudAnnounced();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
          this.spinner.stop('main');
        });
      } else {
        this.agentService.updateConfigurations(uuid, fd).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          this.notificationService.success(new Notification('Collector update is complete.'));
          this.closeAddModal();
          this.agentService.crudAnnounced();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
          this.spinner.stop('main');
        });
      }
    }
  }

  deleteConfig(view: AgentConfigurationViewData) {
    this.selectedAgent = view;
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', backdrop: true, keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.confirmModalRef.hide();
    this.agentService.deleteConfig(this.selectedAgent.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notificationService.success(new Notification('Collector deleted sucessfully'));
      this.agentService.crudAnnounced();
    }, err => {
      this.notificationService.error(new Notification('Error while deleting. Please try again!!'));
    });
  }
}
