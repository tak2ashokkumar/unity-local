import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { MeshServicesCrudService } from './mesh-services-crud.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { MESH_SERVICE_TYPE_MAPPING } from '../mesh-service.type';
import { FormGroup } from '@angular/forms';
import { merge as _merge, isString } from 'lodash-es';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { MeshServiceCRUDBase, AnthosCRUDRaw, AnthosCRUDType, AppMeshCRUDType, IstioCRUDType, IstioCredType, AppMeshCredType, AnthosCredType } from './mesh-service-crud.type';

@Component({
  selector: 'mesh-services-crud',
  templateUrl: './mesh-services-crud.component.html',
  styleUrls: ['./mesh-services-crud.component.scss']
})
export class MeshServicesCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<string>();

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  @ViewChild('template') elementView: ElementRef;
  modalRef: BsModalRef;

  @ViewChild('passwordChange') passwordChange: ElementRef;
  passwordChangeRef: BsModalRef;

  private ngUnsubscribe = new Subject();
  svcId: string;
  action: 'Add' | 'Edit';
  credAction: string;
  nonFieldErr: string = '';
  id: number;
  MeshServiceTypeMapping = MESH_SERVICE_TYPE_MAPPING;

  serviceType: MESH_SERVICE_TYPE_MAPPING;

  baseForm: FormGroup;
  baseFormErrors: any;
  baseValidationMessages: any;

  anthosForm: FormGroup;
  anthosFormErrors: any;
  anthosValidationMessages: any;

  appMeshForm: FormGroup;
  appMeshFormErrors: any;
  appMeshValidationMessages: any;

  istioForm: FormGroup;
  istioFormErrors: any;
  istioValidationMessages: any;

  anthosCredForm: FormGroup;
  anthosCredFormErrors: any;
  anthosCredValidationMessages: any;

  appMeshCredForm: FormGroup;
  appMeshCredFormErrors: any;
  appMeshCredValidationMessages: any;

  istioCredForm: FormGroup;
  istioCredFormErrors: any;
  istioCredValidationMessages: any;

  constructor(private crudServie: MeshServicesCrudService,
    private modalService: BsModalService,
    private spinnerService: AppSpinnerService,
    private utilService: AppUtilityService,
    private notificationService: AppNotificationService) {
    this.crudServie.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(obj => {
      this.svcId = obj.uuid;
      this.serviceType = obj.serviceType;
      this.action = this.svcId ? 'Edit' : 'Add';
      this.modalRef = null;
      this.spinnerService.start('main');
      this.buildBaseForm();
    });

    this.crudServie.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(obj => {
      this.svcId = obj.uuid;
      this.serviceType = obj.serviceType;
      this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });

    this.crudServie.changePasswordAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(obj => {
      this.svcId = obj.uuid;
      this.serviceType = obj.serviceType;
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
      case MESH_SERVICE_TYPE_MAPPING.ANTHOS:
        this.crudServie.createAnthosForm(this.svcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
          this.anthosForm = form;
        });
        this.anthosFormErrors = this.crudServie.resetAnthosFormErrors();
        this.anthosValidationMessages = this.crudServie.validationMessages.anthosFormMessages;
        break;
      case MESH_SERVICE_TYPE_MAPPING.AWS:
        this.crudServie.createAppMeshForm(this.svcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
          this.appMeshForm = form;
        });
        this.appMeshFormErrors = this.crudServie.resetAppMeshFormErrors();
        this.appMeshValidationMessages = this.crudServie.validationMessages.appMeshFormMessages;
        break;
      case MESH_SERVICE_TYPE_MAPPING.ISTIO:
        this.crudServie.createIstioForm(this.svcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
          this.istioForm = form;
        });
        this.istioFormErrors = this.crudServie.resetIstioFormErrors();
        this.istioValidationMessages = this.crudServie.validationMessages.istioFormMessages;
        break;

      default: console.log(type)
        break;
    }
    if (!this.modalRef) {
      this.openModal();
    }
  }

  buildBaseForm() {
    this.nonFieldErr = '';
    this.baseFormErrors = this.crudServie.resetBaseFormErrors();
    this.baseValidationMessages = this.crudServie.validationMessages.baseFormMessages;
    this.baseForm = this.crudServie.createBaseForm(this.serviceType);
    this.createOtherForm(this.baseForm.get('service_type').value);
    this.baseForm.get('service_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: string) => {
      this.createOtherForm(data);
    });
  }

  resetOtherForm() {
    this.anthosForm = null;
    this.appMeshForm = null;
    this.istioForm = null;
  }

  handleError(data: any, err: any) {
    this.baseFormErrors = this.crudServie.resetBaseFormErrors();
    this.anthosFormErrors = this.crudServie.resetAnthosFormErrors();
    this.appMeshFormErrors = this.crudServie.resetAppMeshFormErrors();
    this.istioFormErrors = this.crudServie.resetIstioFormErrors();
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
            switch (data.service_type) {
              case MESH_SERVICE_TYPE_MAPPING.ANTHOS: this.anthosFormErrors[field] = err[field][0];
                break;
              case MESH_SERVICE_TYPE_MAPPING.AWS: this.appMeshFormErrors[field] = err[field][0];
                break;
              case MESH_SERVICE_TYPE_MAPPING.ISTIO: this.istioFormErrors[field] = err[field][0];
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

  submitFormData(data: AnthosCRUDType | AppMeshCRUDType | IstioCRUDType) {
    this.nonFieldErr = '';
    this.spinnerService.start('main');
    if (this.svcId) {
      this.crudServie.updateMeshService(this.svcId, data).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.modalRef.hide();
          this.spinnerService.stop('main');
          this.notificationService.success(new Notification('Mesh service updated successfully'));
          this.onCrud.emit(this.svcId);
        }, (err: HttpErrorResponse) => {
          this.spinnerService.stop('main');
          this.handleError(data, err.error);
        });
    } else {
      this.crudServie.addMeshService(data).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.modalRef.hide();
          this.spinnerService.stop('main');
          this.notificationService.success(new Notification('Mesh service added successfully'));
          this.onCrud.emit(data.uuid);
        }, (err: HttpErrorResponse) => {
          this.spinnerService.stop('main');
          this.handleError(data, err.error);
        });
    }
  }

  validateAnthosForm() {
    if (!this.anthosForm) {
      this.handleError(null, 'Failed to load Anthos form details!');
      return;
    }
    if (this.anthosForm.invalid) {
      this.anthosFormErrors = this.utilService.validateForm(this.anthosForm, this.anthosValidationMessages, this.anthosFormErrors);
      this.anthosForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.anthosFormErrors = this.utilService.validateForm(this.anthosForm, this.anthosValidationMessages, this.anthosFormErrors); });
    }
    if (this.baseForm.valid && this.anthosForm.valid) {
      this.submitFormData(_merge({}, <MeshServiceCRUDBase>this.baseForm.getRawValue(), <AnthosCRUDRaw>this.anthosForm.getRawValue()));
    }
  }

  validateAppMeshForm() {
    if (!this.appMeshForm) {
      this.handleError(null, 'Failed to load Mesh form details!');
      return;
    }
    if (this.appMeshForm.invalid) {
      this.appMeshFormErrors = this.utilService.validateForm(this.appMeshForm, this.appMeshValidationMessages, this.appMeshFormErrors);
      this.appMeshForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.appMeshFormErrors = this.utilService.validateForm(this.appMeshForm, this.appMeshValidationMessages, this.appMeshFormErrors); });
    }
    if (this.baseForm.valid && this.appMeshForm.valid) {
      this.submitFormData(_merge({}, <MeshServiceCRUDBase>this.baseForm.getRawValue(), <AppMeshCRUDType>this.appMeshForm.getRawValue()));
    }
  }

  validateIstioForm() {
    if (!this.istioForm) {
      this.handleError(null, 'Failed to load Istio form details!');
      return;
    }
    if (this.istioForm.invalid) {
      this.istioFormErrors = this.utilService.validateForm(this.istioForm, this.istioValidationMessages, this.istioFormErrors);
      this.istioForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.istioFormErrors = this.utilService.validateForm(this.istioForm, this.istioValidationMessages, this.istioFormErrors); });
    }
    if (this.baseForm.valid && this.istioForm.valid) {
      this.submitFormData(_merge({}, <MeshServiceCRUDBase>this.baseForm.getRawValue(), <IstioCRUDType>this.istioForm.getRawValue()));
    }
  }

  onSubmit() {
    if (this.baseForm.invalid) {
      this.baseFormErrors = this.utilService.validateForm(this.baseForm, this.baseValidationMessages, this.baseFormErrors);
      this.baseForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.baseFormErrors = this.utilService.validateForm(this.baseForm, this.baseValidationMessages, this.baseFormErrors); });
    }
    switch (this.baseForm.get('service_type').value) {
      case MESH_SERVICE_TYPE_MAPPING.ANTHOS:
        this.validateAnthosForm();
        break;
      case MESH_SERVICE_TYPE_MAPPING.AWS:
        this.validateAppMeshForm();
        break;
      case MESH_SERVICE_TYPE_MAPPING.ISTIO:
        this.validateIstioForm();
        break;
    }
  }

  confirmDelete() {
    this.crudServie.confirmDeleteMeshService(this.svcId, this.serviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmModalRef.hide();
      this.notificationService.success(new Notification('Mesh service deleted successfully'));
      this.onCrud.emit();
    }, err => {
      this.confirmModalRef.hide();
      this.notificationService.error(new Notification('Mesh service could not be deleted!!'));
    });
  }

  buildPasswordChange() {
    this.nonFieldErr = '';
    this.anthosCredForm = null;
    this.appMeshCredForm = null;
    this.istioCredForm = null;

    switch (this.serviceType) {
      case MESH_SERVICE_TYPE_MAPPING.ANTHOS:
        this.credAction = 'Change Service Account Info';
        this.anthosCredFormErrors = this.crudServie.resetAnthosCredFormErrors();
        this.anthosCredValidationMessages = this.crudServie.credValidationMessages.anthosMessages;
        this.anthosCredForm = this.crudServie.buildCredForm(this.serviceType);
        break;
      case MESH_SERVICE_TYPE_MAPPING.AWS:
        this.credAction = 'Change API Keys';
        this.spinnerService.start('main');
        this.crudServie.buildAppMeshCredForm(this.svcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
          this.appMeshCredForm = form;
          this.spinnerService.stop('main');
        });
        this.appMeshCredFormErrors = this.crudServie.resetAppMeshCredFormErrors();
        this.appMeshCredValidationMessages = this.crudServie.credValidationMessages.appMeshMessages;
        break;
      case MESH_SERVICE_TYPE_MAPPING.ISTIO:
        this.credAction = 'Change Password';
        this.istioCredFormErrors = this.crudServie.resetIstioCredFormErrors();
        this.istioCredValidationMessages = this.crudServie.credValidationMessages.istioMessages;
        this.istioCredForm = this.crudServie.buildCredForm(this.serviceType);
        break;
    }
    this.passwordChangeRef = this.modalService.show(this.passwordChange, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  handleCredError(data: any, err: any) {
    this.anthosCredFormErrors = this.crudServie.resetAnthosCredFormErrors();
    this.appMeshCredFormErrors = this.crudServie.resetAppMeshCredFormErrors();
    this.istioCredFormErrors = this.crudServie.resetIstioCredFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      } else {
        for (const field in err) {
          switch (data.service_type) {
            case MESH_SERVICE_TYPE_MAPPING.ANTHOS: this.anthosCredFormErrors[field] = err[field][0];
              break;
            case MESH_SERVICE_TYPE_MAPPING.AWS: this.appMeshCredFormErrors[field] = err[field][0];
              break;
            case MESH_SERVICE_TYPE_MAPPING.ISTIO: this.istioCredFormErrors[field] = err[field][0];
              break;
          }
        }
      }
    } else {
      this.passwordChangeRef.hide();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
  }

  submitCredFormdata(data: AnthosCredType | AppMeshCredType | IstioCredType) {
    this.nonFieldErr = '';
    this.spinnerService.start('main');
    this.crudServie.updateCredentials(this.svcId, this.serviceType, data).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: any) => {
        this.passwordChangeRef.hide();
        this.spinnerService.stop('main');
        this.notificationService.success(new Notification('Credentials updated successfully'));
      }, (err: HttpErrorResponse) => {
        this.spinnerService.stop('main');
        this.handleCredError(data, err.error);
      });
  }

  validateAnthosCredForm() {
    if (this.anthosCredForm.invalid) {
      this.anthosCredFormErrors = this.utilService.validateForm(this.anthosCredForm, this.anthosCredValidationMessages, this.anthosCredFormErrors);
      this.anthosCredForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.anthosCredFormErrors = this.utilService.validateForm(this.anthosCredForm, this.anthosCredValidationMessages, this.anthosCredFormErrors); });
    } else {
      this.submitCredFormdata(this.anthosCredForm.getRawValue());
    }
  }

  validateAppMeshCredForm() {
    if (this.appMeshCredForm.invalid) {
      this.appMeshCredFormErrors = this.utilService.validateForm(this.appMeshCredForm, this.appMeshCredValidationMessages, this.appMeshCredFormErrors);
      this.appMeshCredForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.appMeshCredFormErrors = this.utilService.validateForm(this.appMeshCredForm, this.appMeshCredValidationMessages, this.appMeshCredFormErrors); });
    } else {
      this.submitCredFormdata(this.appMeshCredForm.getRawValue());
    }
  }

  validateIstioCredForm() {
    if (this.istioCredForm.invalid) {
      this.istioCredFormErrors = this.utilService.validateForm(this.istioCredForm, this.istioCredValidationMessages, this.istioCredFormErrors);
      this.istioCredForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.istioCredFormErrors = this.utilService.validateForm(this.istioCredForm, this.istioCredValidationMessages, this.istioCredFormErrors); });
    } else {
      this.submitCredFormdata(this.istioCredForm.getRawValue());
    }
  }

  updatePassword() {
    switch (this.serviceType) {
      case MESH_SERVICE_TYPE_MAPPING.ANTHOS:
        this.validateAnthosCredForm();
        break;
      case MESH_SERVICE_TYPE_MAPPING.AWS:
        this.validateAppMeshCredForm();
        break;
      case MESH_SERVICE_TYPE_MAPPING.ISTIO:
        this.validateIstioCredForm();
        break;
    }
  }
}