import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, AuthLevelMapping, CRUDActionTypes, DeviceMapping, NoWhitespaceValidator, SNMPVersionMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { DevicesCrudMonitoringService } from '../../devices-crud-monitoring/devices-crud-monitoring.service';
import { StorageCRUDManufacturer, StorageCRUDModel, StorageDeviceCRUDOperatingSystem } from '../../entities/storage-device-crud.type';
import { StorageCRUDFormData, StorageCrudService } from './storage-crud.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UnityDevicesCustomAttributesCrudService } from 'src/app/shared/unity-devices-custom-attributes-crud/unity-devices-custom-attributes-crud.service';

@Component({
  selector: 'storage-crud',
  templateUrl: './storage-crud.component.html',
  styleUrls: ['./storage-crud.component.scss']
})
export class StorageCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  private ngUnsubscribe = new Subject();
  storageDeviceId: string;
  nonFieldErr: string = '';
  action: 'Add' | 'Edit';
  managementEnabled: boolean = false;

  deviceType: DeviceMapping = DeviceMapping.STORAGE_DEVICES;
  SNMPVersionPlatFormMappingEnum = SNMPVersionMapping;
  AuthLevelPlatFormMappingEnum = AuthLevelMapping;
  tagsAutocompleteItems: string[] = [];

  @ViewChild('storageFormRef') storageFormRef: ElementRef;
  storageModelRef: BsModalRef;
  storageForm: FormGroup;
  storageFormErrors: any;
  storageFormValidationMessages: any;

  manufacturers: Array<StorageCRUDManufacturer> = [];
  models: Array<StorageCRUDModel> = [];
  operatingSystems: Array<StorageDeviceCRUDOperatingSystem> = [];
  datacenters: Array<DatacenterFast> = [];
  cabinets: Array<CabinetFast> = [];
  privateclouds: Array<DeviceCRUDPrivateCloudFast> = [];
  backUpdata: { ip_address: string, snmp_version: string, snmp_authlevel: string, snmp_community: string, backend_url: string, snmp_authname: string, snmp_authpass: string, snmp_authalgo: string, snmp_cryptopass: string, snmp_cryptoalgo: string } = { ip_address: '', snmp_version: '', snmp_community: '', backend_url: '', snmp_authlevel: '', snmp_authname: '', snmp_authpass: '', snmp_authalgo: '', snmp_cryptopass: '', snmp_cryptoalgo: '' };
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmStorageDeleteModalRef: BsModalRef;

  constructor(private crudService: StorageCrudService,
    private caSvc: UnityDevicesCustomAttributesCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private appService: AppLevelService,
    private snmpCrudSvc: DevicesCrudMonitoringService) {

    this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(deviceId => {
      this.storageDeviceId = deviceId;
      this.action = this.storageDeviceId ? 'Edit' : 'Add';
      this.nonFieldErr = '';
      this.storageModelRef = null;
      this.getTags();
      this.buildAddEditForm(deviceId);
    });

    this.crudService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(deviceId => {
      this.storageDeviceId = deviceId;
      this.confirmStorageDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  ngOnInit() {
    this.getManufacturers();
    this.getOperatingSystems();
    this.getDatacenters();
    this.getCollectors();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getTags() {
    this.tagsAutocompleteItems = [];
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  getManufacturers() {
    this.manufacturers = [];
    this.crudService.getManufacturers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.manufacturers = res;
    });
  }

  getModels(manufacturer: string, patchValue: boolean) {
    this.models = [];
    this.crudService.getModels(manufacturer).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.models = res;
      if (patchValue) {
        this.storageForm.patchValue({ model: { id: '' } });
      }
    });
  }

  getOperatingSystems() {
    this.operatingSystems = [];
    this.crudService.getOperatingSystem().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.operatingSystems = res;
    });
  }

  getDatacenters() {
    this.datacenters = [];
    this.crudService.getDatacenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenters = res;
    });
  }

  getCabinets(dcId: string, patchValue: boolean) {
    if (!dcId) {
      return;
    }
    this.cabinets = [];
    this.crudService.getCabinets(dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cabinets = res;
      if (patchValue) {
        this.storageForm.patchValue({ cabinet: { id: '' } });
      }
    });
  }

  getPrivateClouds(dcId: string, patchValue: boolean) {
    if (!dcId) {
      return;
    }
    this.privateclouds = [];
    this.crudService.getPrivateClouds(dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.privateclouds = res;
      if (patchValue) {
        this.storageForm.patchValue({ private_cloud: { id: '' } });
      }
    });
  }

  getCollectors() {
    this.crudService.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  managementFormCheck() {
    if (!this.managementEnabled) {
      this.storageForm.addControl('backend_url', new FormControl(this.backUpdata.backend_url, [NoWhitespaceValidator, Validators.required]));
    } else {
      this.backUpdata.backend_url = this.storageForm.controls.backend_url ? this.storageForm.controls.backend_url.value : '';
      this.storageForm.removeControl('backend_url');
    }
    this.managementEnabled = !this.managementEnabled;
  }

  buildAddEditForm(storageDeviceId?: string) {
    this.crudService.createStorageDeviceForm(storageDeviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.storageForm = form;
      this.managementEnabled = this.storageForm.controls.backend_url ? true : false;
      this.storageFormErrors = this.crudService.resetStorageDeviceFormErrors();
      this.storageFormValidationMessages = this.crudService.storageDeviceFormValidationMessages;

      this.backUpdata.ip_address = this.storageForm.controls.ip_address ? this.storageForm.controls.ip_address.value : '';
      this.backUpdata.snmp_community = this.storageForm.controls.snmp_community ? this.storageForm.controls.snmp_community.value : '';
      // this.backUpdata.backend_url = this.storageForm.controls.backend_url ? this.storageForm.controls.backend_url.value : '';
      if (storageDeviceId) {
        this.getModels(this.storageForm.get('manufacturer.id').value, false);
        this.getCabinets(this.storageForm.get('datacenter.uuid').value, false);
        this.getPrivateClouds(this.storageForm.get('datacenter.uuid').value, false);
      }
      this.storageForm.get('manufacturer.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getModels(val, true);
      });
      this.storageModelRef = this.modalService.show(this.storageFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));

      this.storageForm.get('datacenter.uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getCabinets(val, true);
        this.getPrivateClouds(val, true);
      });

      this.storageForm.get('cabinet.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.storageForm.get('position').setValue('');
        if (val) {
          this.storageForm.get('position').enable();
        } else {
          this.storageForm.get('position').disable();
        }
      });
    });
  }

  handleError(err: any) {
    this.snmpCrudSvc.handleError(err);
    this.storageFormErrors = this.crudService.resetStorageDeviceFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.storageForm.controls) {
          this.storageFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.storageModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  onSubmitCreate() {
    this.caSvc.submit();
    if (this.storageForm.invalid || this.caSvc.isInvalid()) {
      this.storageFormErrors = this.utilService.validateForm(this.storageForm, this.storageFormValidationMessages, this.storageFormErrors);
      this.storageForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.storageFormErrors = this.utilService.validateForm(this.storageForm, this.storageFormValidationMessages, this.storageFormErrors);
        this.caSvc.submit();
      });
    } else {
      let obj = <StorageCRUDFormData>Object.assign({}, this.storageForm.getRawValue(), { 'custom_attribute_data': this.caSvc.getFormData() });
      this.spinnerService.start('main');
      if (this.storageDeviceId) {
        this.crudService.updateStorageDevice(obj, this.storageDeviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.storageModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Storage Device updated successfully.'));
          this.onCrud.emit(CRUDActionTypes.UPDATE);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudService.createStorageDevice(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.storageModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Storage Device Created successfully.'));
          this.onCrud.emit(CRUDActionTypes.ADD);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  onSubmitDelete() {
    this.crudService.deleteStorageDevice(this.storageDeviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmStorageDeleteModalRef.hide();
      this.notification.success(new Notification('Storage Device deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, err => {
      this.confirmStorageDeleteModalRef.hide();
      this.notification.error(new Notification('Storage Device could not be deleted!!'));
    });
  }

}
