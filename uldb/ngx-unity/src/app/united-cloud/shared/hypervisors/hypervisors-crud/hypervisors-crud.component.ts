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
import { AppUtilityService, AuthLevelMapping, CRUDActionTypes, DeviceMapping, NoWhitespaceValidator, PlatFormMapping, SNMPVersionMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { HypervisorCRUDManufacturer, HypervisorCRUDModel, HypervisorCRUDOperatingSystem } from '../../entities/hypervisor-crud.type';
import { HypervisorCURDFormData, HypervisorsCrudService, LifeCycleStageOptions, LifeCycleStageStatusOptions } from './hypervisors-crud.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UnityDevicesCustomAttributesCrudService } from 'src/app/app-shared-crud/unity-devices-custom-attributes-crud/unity-devices-custom-attributes-crud.service';

@Component({
  selector: 'hypervisors-crud',
  templateUrl: './hypervisors-crud.component.html',
  styleUrls: ['./hypervisors-crud.component.scss']
})
export class HypervisorsCrudComponent implements OnInit, OnDestroy {

  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  private ngUnsubscribe = new Subject();
  action: 'Add' | 'Edit';
  hypervisorId: string;
  nonFieldErr: string = '';
  managementEnabled: boolean = false;

  deviceType: DeviceMapping = DeviceMapping.HYPERVISOR;
  SNMPVersionPlatFormMappingEnum = SNMPVersionMapping;
  AuthLevelPlatFormMappingEnum = AuthLevelMapping;

  @ViewChild('hypervisorFormRef') hypervisorFormRef: ElementRef;
  hypervisorModelRef: BsModalRef;
  hypervisorForm: FormGroup;
  hypervisorFormErrors: any;
  hypervisorFormValidationMessages: any;

  @ViewChild('resetPasswordFormRef') resetPasswordFormRef: ElementRef;
  resetPasswordModelRef: BsModalRef;
  resetPasswordForm: FormGroup;
  resetPasswordFormErrors: any;
  resetPasswordFormValidationMessages: any;

  manufacturers: Array<HypervisorCRUDManufacturer> = [];
  models: Array<HypervisorCRUDModel> = [];
  datacenters: Array<DatacenterFast> = [];
  cabinets: Array<CabinetFast> = [];
  privateclouds: Array<DeviceCRUDPrivateCloudFast> = [];
  operatingsystems: Array<HypervisorCRUDOperatingSystem> = [];
  backUpdata: { ip_address: string, snmp_version: string, snmp_authlevel: string, snmp_community: string, backend_url: string, snmp_authname: string, snmp_authpass: string, snmp_authalgo: string, snmp_cryptopass: string, snmp_cryptoalgo: string } = { ip_address: '', snmp_version: '', snmp_community: '', backend_url: '', snmp_authlevel: '', snmp_authname: '', snmp_authpass: '', snmp_authalgo: '', snmp_cryptopass: '', snmp_cryptoalgo: '' };
  tagsAutocompleteItems: string[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmHypervisorDeleteModalRef: BsModalRef;

  lifeCycleStageOptions: string[] = LifeCycleStageOptions;
  lifeCycleStageStatusOptions: string[] = LifeCycleStageStatusOptions;

  constructor(private crudService: HypervisorsCrudService,
    private caSvc: UnityDevicesCustomAttributesCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notificationService: AppNotificationService,
    private appService: AppLevelService) {
    this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(hypervisorId => {
      this.hypervisorId = hypervisorId;
      this.action = this.hypervisorId ? 'Edit' : 'Add';
      this.nonFieldErr = '';
      this.hypervisorModelRef = null;
      this.getTags();
      this.buildAddEditForm(hypervisorId);
    });
    this.crudService.resetPasswordAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(hypervisorId => {
      this.hypervisorId = hypervisorId;
      this.buildResetPasswordForm(hypervisorId);
    });
    this.crudService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(hypervisorId => {
      this.hypervisorId = hypervisorId;
      this.confirmHypervisorDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
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
        this.hypervisorForm.patchValue({ model: { id: '' } });
      }
    });
  }

  getOperatingSystems() {
    this.operatingsystems = [];
    this.crudService.getOperatingSystem().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.operatingsystems = res;
    });
  }

  getCollectors() {
    this.crudService.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
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
        this.hypervisorForm.patchValue({ cabinet: { id: '' } });
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
        this.hypervisorForm.patchValue({ private_cloud: { id: '' } });
      }
    });
  }

  getTags() {
    this.tagsAutocompleteItems = [];
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  managementFormCheck() {
    if (!this.managementEnabled) {
      this.hypervisorForm.addControl('backend_url', new FormControl(this.backUpdata.backend_url, [NoWhitespaceValidator, Validators.required]));
    } else {
      this.backUpdata.backend_url = this.hypervisorForm.controls.backend_url ? this.hypervisorForm.controls.backend_url.value : '';
      this.hypervisorForm.removeControl('backend_url');
    }
    this.managementEnabled = !this.managementEnabled;
  }

  buildAddEditForm(hypervisorId?: string) {
    this.crudService.createHypervisorForm(hypervisorId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.hypervisorForm = form;
      this.managementEnabled = this.hypervisorForm.controls.backend_url ? true : false;
      this.hypervisorFormErrors = this.crudService.resetHypervisorsFormErrors();
      this.hypervisorFormValidationMessages = this.crudService.hypervisorsValidationMessages;

      this.backUpdata.ip_address = this.hypervisorForm.controls.ip_address ? this.hypervisorForm.controls.ip_address.value : '';
      this.backUpdata.snmp_community = this.hypervisorForm.controls.snmp_community ? this.hypervisorForm.controls.snmp_community.value : '';
      this.backUpdata.backend_url = this.hypervisorForm.controls.backend_url ? this.hypervisorForm.controls.backend_url.value : '';
      if (hypervisorId) {
        this.getModels(this.hypervisorForm.get('manufacturer.id').value, false);
        this.getCabinets(this.hypervisorForm.get('datacenter.uuid').value, false);
        this.getPrivateClouds(this.hypervisorForm.get('datacenter.uuid').value, false);
        this.hypervisorForm.get('life_cycle_stage').enable;
        this.hypervisorForm.get('life_cycle_stage_status').enable;
      }
      this.hypervisorModelRef = this.modalService.show(this.hypervisorFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));

      this.hypervisorForm.get('manufacturer.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getModels(val, true);
      });
      this.hypervisorForm.get('datacenter.uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getCabinets(val, true);
        this.getPrivateClouds(val, true);
      });
      this.hypervisorForm.get('cabinet.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.hypervisorForm.get('position').setValue('');
        if (val) {
          this.hypervisorForm.get('position').enable();
        } else {
          this.hypervisorForm.get('position').disable();
        }
      });
      this.hypervisorForm.get('private_cloud.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: number) => {
        let selPC = this.privateclouds.find(pc => pc.id == val);
        if (selPC && selPC.platform_type == PlatFormMapping.ESXI) {
          form.addControl('hostname', new FormControl('', [NoWhitespaceValidator, Validators.required]));
          form.addControl('username', new FormControl('', [NoWhitespaceValidator, Validators.required]));
          if (!this.hypervisorId) {
            form.addControl('password', new FormControl('', [NoWhitespaceValidator, Validators.required]));
          }
        } else {
          this.hypervisorForm.removeControl('hostname');
          this.hypervisorForm.removeControl('username');
          if (!this.hypervisorId) {
            this.hypervisorForm.removeControl('password');
          }
        }
      });
    });
  }

  handleError(err: any) {
    this.hypervisorFormErrors = this.crudService.resetHypervisorsFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.hypervisorForm.controls) {
          this.hypervisorFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.hypervisorModelRef.hide();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  createHypervisor() {
    this.caSvc.submit();
    if (this.hypervisorForm.invalid || this.caSvc.isInvalid()) {
      this.hypervisorFormErrors = this.utilService.validateForm(this.hypervisorForm, this.hypervisorFormValidationMessages, this.hypervisorFormErrors);
      this.hypervisorForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.hypervisorFormErrors = this.utilService.validateForm(this.hypervisorForm, this.hypervisorFormValidationMessages, this.hypervisorFormErrors);
        this.caSvc.submit();
      });
    } else {
      let obj = <HypervisorCURDFormData>Object.assign({}, this.hypervisorForm.getRawValue(), { 'custom_attribute_data': this.caSvc.getFormData() });
      this.spinnerService.start('main');
      if (this.hypervisorId) {
        if (!this.managementEnabled) {
          this.hypervisorForm.removeControl('backend_url');
        }
        this.crudService.updateHypervisor(obj, this.hypervisorId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.hypervisorModelRef.hide();
          this.spinnerService.stop('main');
          this.notificationService.success(new Notification('Hypervisor updated successfully.'));
          this.onCrud.emit(CRUDActionTypes.UPDATE);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudService.createHypervisor(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.hypervisorModelRef.hide();
          this.spinnerService.stop('main');
          this.notificationService.success(new Notification('Hypervisor Created successfully.'));
          this.onCrud.emit(CRUDActionTypes.ADD);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  buildResetPasswordForm(hypervisorId: string) {
    this.crudService.buildResetPasswordForm(hypervisorId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.resetPasswordForm = form;
      this.resetPasswordFormErrors = this.crudService.resetResetPasswordFormErrors();
      this.resetPasswordFormValidationMessages = this.crudService.resetPasswordFormValidationMessages;
      this.resetPasswordModelRef = this.modalService.show(this.resetPasswordFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  handleResetPasswordError(err: any) {
    this.resetPasswordFormErrors = this.crudService.resetResetPasswordFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.resetPasswordForm.controls) {
          this.resetPasswordFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.resetPasswordModelRef.hide();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  confirmResetPassword() {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordFormErrors = this.utilService.validateForm(this.resetPasswordForm, this.resetPasswordFormValidationMessages, this.resetPasswordFormErrors);
      this.resetPasswordForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.resetPasswordFormErrors = this.utilService.validateForm(this.resetPasswordForm, this.resetPasswordFormValidationMessages, this.resetPasswordFormErrors); });
    } else {
      this.spinnerService.start('main');
      this.crudService.resetHypervisorPassword(this.resetPasswordForm.getRawValue(), this.hypervisorId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.resetPasswordModelRef.hide();
        this.spinnerService.stop('main');
        this.notificationService.success(new Notification('Hypervisor Password reset successful.'));
        this.onCrud.emit(CRUDActionTypes.UPDATE);
      }, (err: HttpErrorResponse) => {
        this.handleResetPasswordError(err.error);
      });
    }
  }

  confirmHypervisorDelete() {
    this.crudService.deleteHypervisorServer(this.hypervisorId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmHypervisorDeleteModalRef.hide();
      this.notificationService.success(new Notification('Hypervisor deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, err => {
      this.confirmHypervisorDeleteModalRef.hide();
      this.notificationService.error(new Notification('Hypervisor could not be deleted!!'));
    });
  }

}
