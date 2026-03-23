import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { CustomCloudVMCRUDOS } from '../../../entities/custom-cloud-vm-crud.type';
import { VmsListCustomCrudService } from './vms-list-custom-crud.service';
import { UnityDevicesCustomAttributesCrudService } from 'src/app/shared/unity-devices-custom-attributes-crud/unity-devices-custom-attributes-crud.service';

@Component({
  selector: 'vms-list-custom-crud',
  templateUrl: './vms-list-custom-crud.component.html',
  styleUrls: ['./vms-list-custom-crud.component.scss']
})
export class VmsListCustomCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  private ngUnsubscribe = new Subject();
  pcId: string;
  deviceId: string;
  nonFieldErr: string = '';
  action: 'Add' | 'Edit';
  deviceType: DeviceMapping = DeviceMapping.CUSTOM_VIRTUAL_MACHINE;


  @ViewChild('deviceFormRef') deviceFormRef: ElementRef;
  deviceFormModelRef: BsModalRef;
  deviceForm: FormGroup;
  deviceFormErrors: any;
  deviceFormValidationMessages: any;

  operatingSystems: Array<CustomCloudVMCRUDOS> = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  @ViewChild('confirmDeleteRef') confirmDeleteRef: ElementRef;
  confirmDeviceDeleteModalRef: BsModalRef;

  constructor(private crudService: VmsListCustomCrudService,
    private caSvc: UnityDevicesCustomAttributesCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService) {
    this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.pcId = params.pcId;
      this.deviceId = params.deviceId;
      this.action = this.deviceId ? 'Edit' : 'Add';
      this.nonFieldErr = '';
      this.deviceFormModelRef = null;
      this.buildAddEditForm();
    });
    this.crudService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.deviceId = params.deviceId;;
      this.confirmDeviceDeleteModalRef = this.modalService.show(this.confirmDeleteRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  ngOnInit() {
    this.getOperatingSystems();
    this.getCollectors();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getOperatingSystems() {
    this.crudService.getOperatingSystem().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.operatingSystems = res;
    });
  }

  getCollectors() {
    this.crudService.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  buildAddEditForm() {
    this.crudService.buildDeviceForm(this.pcId, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.deviceForm = form;
      this.deviceFormErrors = this.crudService.resetDeviceFormErrors();
      this.deviceFormValidationMessages = this.crudService.deviceFormValidationMessages;
      this.deviceFormModelRef = this.modalService.show(this.deviceFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  handleError(err: any) {
    this.deviceFormErrors = this.crudService.resetDeviceFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.deviceForm.controls) {
          this.deviceFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.deviceFormModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  confirmDeviceAddOrEdit() {
    this.caSvc.submit();
    if (this.deviceForm.invalid || this.caSvc.isInvalid()) {
      this.deviceFormErrors = this.utilService.validateForm(this.deviceForm, this.deviceFormValidationMessages, this.deviceFormErrors);
      this.deviceForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.deviceFormErrors = this.utilService.validateForm(this.deviceForm, this.deviceFormValidationMessages, this.deviceFormErrors);
        this.caSvc.submit();
      });
    } else {
      let obj = Object.assign({}, this.deviceForm.getRawValue(), { 'custom_attribute_data': this.caSvc.getFormData() });
      this.spinnerService.start('main');
      if (this.deviceId) {
        this.crudService.updateDevice(obj, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.deviceFormModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Virtual Machine updated successfully.'));
          this.onCrud.emit(CRUDActionTypes.UPDATE);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudService.createDevice(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.deviceFormModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Virtual Machine Created successfully.'));
          this.onCrud.emit(CRUDActionTypes.ADD);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  confirmDeviceDelete() {
    this.crudService.deleteDevice(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmDeviceDeleteModalRef.hide();
      this.notification.success(new Notification('Virtual Machine deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, err => {
      this.confirmDeviceDeleteModalRef.hide();
      this.notification.error(new Notification('Virtual Machine could not be deleted!!'));
    });
  }

}
