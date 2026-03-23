import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { ContainerControllerCrudService } from './container-controller-crud.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { CONTROLLER_TYPE_MAPPING } from 'src/app/shared/SharedEntityTypes/container-contoller.type';
import { FormGroup, FormControl } from '@angular/forms';
import { merge as _merge, isString } from 'lodash-es';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { ControllerCRUDBase, KubernetesCRUDRaw, KubernetesCRUDType, DockerCRUDType, DockerCredType, KubernetesCredType } from './container-controller-crud.type';

@Component({
  selector: 'container-controller-crud',
  templateUrl: './container-controller-crud.component.html',
  styleUrls: ['./container-controller-crud.component.scss']
})
export class ContainerControllerCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<string>();

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  @ViewChild('template') elementView: ElementRef;
  modalRef: BsModalRef;

  @ViewChild('passwordChange') passwordChange: ElementRef;
  passwordChangeRef: BsModalRef;

  private ngUnsubscribe = new Subject();
  conId: string;
  accountId: string;
  urlParam: string;
  action: 'Add' | 'Edit';
  credAction: string;
  nonFieldErr: string = '';
  id: number;
  ControllerTypeMapping = CONTROLLER_TYPE_MAPPING;
  certToUpload: File = null;
  keyToUpload: File = null;
  caToUpload: File = null;

  controllerType: CONTROLLER_TYPE_MAPPING;

  attachmentForm: FormGroup;
  attachmentFormErrors: any;
  baseForm: FormGroup;
  baseFormErrors: any;
  baseValidationMessages: any;

  kubernetesForm: FormGroup;
  kubernetesFormErrors: any;
  kubernetesValidationMessages: any;

  dockerForm: FormGroup;
  dockerFormErrors: any;
  dockerValidationMessages: any;

  kubernetesCredForm: FormGroup;
  kubernetesCredFormErrors: any;
  kubernetesCredValidationMessages: any;

  dockerCredForm: FormGroup;
  dockerCredFormErrors: any;
  dockerCredValidationMessages: any;

  constructor(private crudServie: ContainerControllerCrudService,
    private modalService: BsModalService,
    private spinnerService: AppSpinnerService,
    private utilService: AppUtilityService,
    private notificationService: AppNotificationService) {
    this.crudServie.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(obj => {
      console.log('contorller',obj)
      this.conId = obj.uuid;
      this.controllerType = obj.controllerType;
      this.accountId = obj.accountId;
      this.urlParam = obj.urlParam;
      this.action = this.conId ? 'Edit' : 'Add';
      this.modalRef = null;
      this.spinnerService.start('main');
      this.buildBaseForm();
    });

    this.crudServie.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(obj => {
      this.conId = obj.uuid;
      this.controllerType = obj.controllerType;
      this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });

    this.crudServie.changePasswordAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(obj => {
      this.conId = obj.uuid;
      this.controllerType = obj.controllerType;
      this.passwordChangeRef = null;
      this.buildPasswordChange();
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  openModal() {
    this.modalRef = this.modalService.show(this.elementView, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    this.spinnerService.stop('main');
  }

  createOtherForm(type: string) {
    this.resetOtherForm();
    switch (type) {
      case CONTROLLER_TYPE_MAPPING.KUBERNETES:
        this.dockerForm = null;
        this.attachmentForm = null;
        this.crudServie.createKubernetesForm(this.conId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
          this.kubernetesForm = form;
        });
        this.kubernetesFormErrors = this.crudServie.resetKubernetesFormErrors();
        this.kubernetesValidationMessages = this.crudServie.validationMessages.kubernetesFormMessages;
        break;
      case CONTROLLER_TYPE_MAPPING.DOCKER:
        this.kubernetesForm = null;
        this.crudServie.createDockerForm(this.conId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
          this.dockerForm = form;
          this.attachmentForm = this.crudServie.buildAttachmentForm();
          this.attachmentFormErrors = this.crudServie.resetAttachmentFormErrors();
        });
        this.dockerFormErrors = this.crudServie.resetDockerFormErrors();
        this.dockerValidationMessages = this.crudServie.validationMessages.dockerFormMessages;
        break;

      default:
        break;
    }
    if (!this.modalRef) {
      this.openModal();
    }
  }

  buildBaseForm() {
    this.nonFieldErr = '';
    this.baseFormErrors = this.crudServie.resetBaseFormErrors();
    this.attachmentForm = null;
    this.baseValidationMessages = this.crudServie.validationMessages.baseFormMessages;
    this.baseForm = this.crudServie.createBaseForm(this.accountId, this.urlParam, this.controllerType);
    this.createOtherForm(this.baseForm.get('controller_type').value);
    this.baseForm.get('controller_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: string) => {
      this.createOtherForm(data);
    });
  }

  resetOtherForm() {
    this.kubernetesForm = null;
    this.dockerForm = null;
  }

  handleError(type: string, err: any) {
    this.baseFormErrors = this.crudServie.resetBaseFormErrors();
    this.kubernetesFormErrors = this.crudServie.resetKubernetesFormErrors();
    this.dockerFormErrors = this.crudServie.resetDockerFormErrors();
    this.attachmentFormErrors = this.crudServie.resetAttachmentFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      } else {
        for (const field in err) {
          if (field in this.baseFormErrors) {
            this.baseFormErrors[field] = err[field][0];
          } else {
            switch (type) {
              case CONTROLLER_TYPE_MAPPING.KUBERNETES: this.kubernetesFormErrors[field] = err[field][0];
                break;
              case CONTROLLER_TYPE_MAPPING.DOCKER:
                if (field == 'cert' || field == 'key' || field == 'ca') {
                  this.attachmentFormErrors[field] = err[field][0];
                } else {
                  this.dockerFormErrors[field] = err[field][0];
                }
                break;
            }
          }
        }
      }
    } else {
      this.modalRef.hide();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
  }

  submitFormData(data: FormData, type: CONTROLLER_TYPE_MAPPING) {
    this.nonFieldErr = '';
    this.spinnerService.start('main');
    if (this.conId) {
      this.crudServie.updateControllerService(this.conId, data, type).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.modalRef.hide();
          this.spinnerService.stop('main');
          this.notificationService.success(new Notification('Controller updated successfully'));
          this.onCrud.emit(this.conId);
        }, (err: HttpErrorResponse) => {
          this.spinnerService.stop('main');
          this.handleError(data.get('controller_type').toString(), err.error);
        });
    } else {
      this.crudServie.addControllerService(data, type).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.modalRef.hide();
          this.spinnerService.stop('main');
          this.notificationService.success(new Notification('Controller added successfully'));
          this.onCrud.emit(data.uuid);
        }, (err: HttpErrorResponse) => {
          this.spinnerService.stop('main');
          this.handleError(data.get('controller_type').toString(), err.error);
        });
    }
  }

  validatekubernetesForm() {
    if (this.kubernetesForm.invalid) {
      this.kubernetesFormErrors = this.utilService.validateForm(this.kubernetesForm, this.kubernetesValidationMessages, this.kubernetesFormErrors);
      this.kubernetesForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.kubernetesFormErrors = this.utilService.validateForm(this.kubernetesForm, this.kubernetesValidationMessages, this.kubernetesFormErrors); });
    }
    if (!this.baseForm.invalid && this.kubernetesForm.valid) {
      const data = this.crudServie.toFormData(_merge({}, <ControllerCRUDBase>this.baseForm.getRawValue(), <KubernetesCRUDType>this.kubernetesForm.getRawValue()));
      this.submitFormData(data, CONTROLLER_TYPE_MAPPING.KUBERNETES);
    }
  }

  validateAttachmentForm() {
    if (!this.attachmentForm.get('unity-cert')) {
      this.attachmentFormErrors['cert'] = 'Cert file is required';
    }
    if (!this.attachmentForm.get('unity-key')) {
      this.attachmentFormErrors['key'] = 'key file is required';
    }
    if (!this.attachmentForm.get('unity-ca')) {
      this.attachmentFormErrors['ca'] = 'ca file is required';
    }
  }

  isAttachmentFormValid() {
    let valid = this.attachmentForm.get('unity-cert') && this.attachmentForm.get('unity-key') && this.attachmentForm.get('unity-ca')
    return valid != null || valid != undefined;
  }

  validatedockerForm() {
    if (this.dockerForm.invalid || !this.isAttachmentFormValid()) {
      this.dockerFormErrors = this.utilService.validateForm(this.dockerForm, this.dockerValidationMessages, this.dockerFormErrors);
      this.validateAttachmentForm();
      this.dockerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.dockerFormErrors = this.utilService.validateForm(this.dockerForm, this.dockerValidationMessages, this.dockerFormErrors); });
      this.attachmentForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => this.validateAttachmentForm());
    }
    if (!this.baseForm.invalid && this.dockerForm.valid) {
      const data = this.crudServie.toFormData(_merge({}, <ControllerCRUDBase>this.baseForm.getRawValue(), <DockerCRUDType>this.dockerForm.getRawValue()), this.attachmentForm.getRawValue());
      this.submitFormData(data, CONTROLLER_TYPE_MAPPING.DOCKER);
    }
  }

  onSubmit() {
    if (this.baseForm.invalid) {
      this.baseFormErrors = this.utilService.validateForm(this.baseForm, this.baseValidationMessages, this.baseFormErrors);
      this.baseForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.baseFormErrors = this.utilService.validateForm(this.baseForm, this.baseValidationMessages, this.baseFormErrors); });
    }
    switch (this.baseForm.get('controller_type').value) {
      case CONTROLLER_TYPE_MAPPING.KUBERNETES:
        this.validatekubernetesForm();
        break;
      case CONTROLLER_TYPE_MAPPING.DOCKER:
        this.validatedockerForm();
        break;
    }
  }

  confirmDelete() {
    this.crudServie.confirmDeleteController(this.conId, this.controllerType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmModalRef.hide();
      this.notificationService.success(new Notification('Controller deleted successfully'));
      this.onCrud.emit();
    }, err => {
      this.confirmModalRef.hide();
      this.notificationService.error(new Notification('Controller could not be deleted!!'));
    });
  }

  buildPasswordChange() {
    this.nonFieldErr = '';
    this.kubernetesCredForm = null;
    this.dockerCredForm = null;

    switch (this.controllerType) {
      case CONTROLLER_TYPE_MAPPING.KUBERNETES:
        this.credAction = 'Change Credentials';
        this.kubernetesCredFormErrors = this.crudServie.resetKubernetesCredFormErrors();
        this.kubernetesCredValidationMessages = this.crudServie.credValidationMessages.kubernetesMessages;
        this.kubernetesCredForm = this.crudServie.buildCredForm(this.controllerType);
        break;
      case CONTROLLER_TYPE_MAPPING.DOCKER:
        this.credAction = 'Change Auth Files';
        this.spinnerService.start('main');
        this.crudServie.buildDockerCredForm(this.conId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
          this.dockerCredForm = form;
          this.spinnerService.stop('main');
        });
        this.dockerCredFormErrors = this.crudServie.resetDockerCredFormErrors();
        this.dockerCredValidationMessages = this.crudServie.credValidationMessages.dockerMessages;
        break;
    }
    this.passwordChangeRef = this.modalService.show(this.passwordChange, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  handleCredError(data: any, err: any) {
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      } else {
        for (const field in err) {
          switch (data.controller_type) {
            case CONTROLLER_TYPE_MAPPING.KUBERNETES: this.kubernetesCredFormErrors[field] = err[field][0];
              break;
            case CONTROLLER_TYPE_MAPPING.DOCKER: this.dockerCredFormErrors[field] = err[field][0];
              break;
          }
        }
      }
    } else {
      this.passwordChangeRef.hide();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
  }

  submitCredFormdata(data: KubernetesCredType | DockerCredType) {
    this.nonFieldErr = '';
    this.spinnerService.start('main');
    this.crudServie.updateCredentials(this.conId, this.controllerType, data).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: any) => {
        this.passwordChangeRef.hide();
        this.spinnerService.stop('main');
        this.notificationService.success(new Notification('Credentials updated successfully'));
      }, (err: HttpErrorResponse) => {
        this.spinnerService.stop('main');
        this.handleCredError(data, err.error);
      });
  }

  validatekubernetesCredForm() {
    if (this.kubernetesCredForm.invalid) {
      this.kubernetesCredFormErrors = this.utilService.validateForm(this.kubernetesCredForm, this.kubernetesCredValidationMessages, this.kubernetesCredFormErrors);
      this.kubernetesCredForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.kubernetesCredFormErrors = this.utilService.validateForm(this.kubernetesCredForm, this.kubernetesCredValidationMessages, this.kubernetesCredFormErrors); });
    } else {
      this.submitCredFormdata(this.kubernetesCredForm.getRawValue());
    }
  }

  validatedockerCredForm() {
    if (this.dockerCredForm.invalid) {
      this.dockerCredFormErrors = this.utilService.validateForm(this.dockerCredForm, this.dockerCredValidationMessages, this.dockerCredFormErrors);
      this.dockerCredForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.dockerCredFormErrors = this.utilService.validateForm(this.dockerCredForm, this.dockerCredValidationMessages, this.dockerCredFormErrors); });
    } else {
      this.submitCredFormdata(this.dockerCredForm.getRawValue());
    }
  }

  updatePassword() {
    switch (this.controllerType) {
      case CONTROLLER_TYPE_MAPPING.KUBERNETES:
        this.validatekubernetesCredForm();
        break;
      case CONTROLLER_TYPE_MAPPING.DOCKER:
        this.validatedockerCredForm();
        break;
    }
  }

  handleCertFileInput(files: FileList) {
    for (let index = 0; index < 1; index++) {
      let reader = new FileReader();
      reader.onload = (e: any) => {
        this.attachmentForm.addControl(`unity-cert`, new FormControl(e.target.result));
        this.attachmentFormErrors['cert'] = '';
      }
      reader.readAsDataURL(files.item(index));
    }
  }

  handleKeyFileInput(files: FileList) {
    for (let index = 0; index < 1; index++) {
      let reader = new FileReader();
      reader.onload = (e: any) => {
        this.attachmentForm.addControl(`unity-key`, new FormControl(e.target.result));
        this.attachmentFormErrors['key'] = '';
      }
      reader.readAsDataURL(files.item(index));
    }
  }

  handleCaFileInput(files: FileList) {
    for (let index = 0; index < 1; index++) {
      let reader = new FileReader();
      reader.onload = (e: any) => {
        this.attachmentForm.addControl(`unity-ca`, new FormControl(e.target.result));
        this.attachmentFormErrors['ca'] = '';
      }
      reader.readAsDataURL(files.item(index));
    }
  }
}