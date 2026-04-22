import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { isString, merge as _merge } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, AuthLevelMapping, BMServerSidePlatformMapping, CRUDActionTypes, DeviceMapping, SNMPVersionMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { BMServerCRUDManufacturer, BMServerCRUDModel, BMServerCRUDOperatingSystem, DRAC, IPMI } from '../../entities/bm-server-crud.type';
import { BMServer } from '../../entities/bm-server.type';
import { BareMetalServerCRUDFormData, BmServersCrudService } from './bm-servers-crud.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UnityDevicesCustomAttributesCrudService } from 'src/app/app-shared-crud/unity-devices-custom-attributes-crud/unity-devices-custom-attributes-crud.service';
import { LifeCycleStageOptions, LifeCycleStageStatusOptions } from '../../hypervisors/hypervisors-crud/hypervisors-crud.service';

@Component({
  selector: 'bm-servers-crud',
  templateUrl: './bm-servers-crud.component.html',
  styleUrls: ['./bm-servers-crud.component.scss']
})

export class BmServersCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  private ngUnsubscribe = new Subject();
  action: 'Add' | 'Edit';
  nonFieldErr: string = '';
  bareMetalServerId: string;

  deviceType: DeviceMapping = DeviceMapping.BARE_METAL_SERVER;
  BMPlatFormMappingEnum = BMServerSidePlatformMapping;
  SNMPVersionPlatFormMappingEnum = SNMPVersionMapping;
  AuthLevelPlatFormMappingEnum = AuthLevelMapping;

  @ViewChild('bareMetalServerFormRef') bareMetalServerFormRef: ElementRef;
  bareMetalServerModelRef: BsModalRef;
  bareMetalServerForm: FormGroup;
  bareMetalServerFormErrors: any;
  bareMetalServerFormValidationMessages: any;

  IPMIForm: FormGroup;
  IPMIFormErrors: any;
  IPMIFormValidationMessages: any;

  DRACForm: FormGroup;
  DRACFormErrors: any;
  DRACFormValidationMessages: any

  manufacturers: Array<BMServerCRUDManufacturer> = [];
  models: Array<BMServerCRUDModel> = [];
  operatingsystems: Array<BMServerCRUDOperatingSystem> = [];
  datacenters: Array<DatacenterFast> = [];
  cabinets: Array<CabinetFast> = [];
  privateclouds: Array<DeviceCRUDPrivateCloudFast> = [];
  backUpdata: { ip_address: string, snmp_version: string, snmp_authlevel: string, snmp_community: string, backend_url: string, snmp_authname: string, snmp_authpass: string, snmp_authalgo: string, snmp_cryptopass: string, snmp_cryptoalgo: string } = { ip_address: '', snmp_version: '', snmp_community: '', backend_url: '', snmp_authlevel: '', snmp_authname: '', snmp_authpass: '', snmp_authalgo: '', snmp_cryptopass: '', snmp_cryptoalgo: '' };
  tagsAutocompleteItems: string[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmBareMetalServerDeleteModalRef: BsModalRef;

  lifeCycleStageOptions: string[] = LifeCycleStageOptions;
  lifeCycleStageStatusOptions: string[] = LifeCycleStageStatusOptions;

  constructor(private crudService: BmServersCrudService,
    private caSvc: UnityDevicesCustomAttributesCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private appService: AppLevelService) {
    this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(bareMetalServerId => {
      this.bareMetalServerId = bareMetalServerId;
      this.action = this.bareMetalServerId ? 'Edit' : 'Add';
      this.nonFieldErr = '';
      this.bareMetalServerModelRef = null;
      this.getTags();
      this.buildAddEditForm(bareMetalServerId);
    });
    this.crudService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(bareMetalServerId => {
      this.bareMetalServerId = bareMetalServerId;
      this.confirmBareMetalServerDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    })
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
        this.bareMetalServerForm.patchValue({ model: { id: '' } });
      }
    });
  }

  getOperatingSystems() {
    this.operatingsystems = [];
    this.crudService.getOperatingSystem().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.operatingsystems = res;
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
        this.bareMetalServerForm.patchValue({ cabinet: { id: '' } });
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
        this.bareMetalServerForm.patchValue({ private_cloud: { id: '' } });
      }
    });
  }

  getTags() {
    this.tagsAutocompleteItems = [];
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  getCollectors() {
    this.crudService.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  openModal() {
    this.bareMetalServerModelRef = this.modalService.show(this.bareMetalServerFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    this.spinnerService.stop('main');
  }

  resetOtherForm() {
    this.IPMIForm = null;
    this.DRACForm = null;
    this.IPMIFormErrors = null;
    this.DRACFormErrors = null;
  }

  createOtherForm(data: string, bareMetalServerId: string) {
    this.resetOtherForm();
    switch (data) {
      case BMServerSidePlatformMapping.IPMI:
        this.crudService.createIPMIForm(bareMetalServerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
          this.IPMIForm = form;
        });
        this.IPMIFormErrors = this.crudService.resetIPMIFormErrors();
        this.IPMIFormValidationMessages = this.crudService.validationMessages.IPMIFormMessages;
        break;
      case BMServerSidePlatformMapping.DRAC:
        this.crudService.createDARCForm(bareMetalServerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
          this.DRACForm = form;
        });
        this.DRACFormErrors = this.crudService.resetDRACFormErrors();
        this.DRACFormValidationMessages = this.crudService.validationMessages.DRACFormMessages;
        break;
      case BMServerSidePlatformMapping.None:
        break;
      default:
        break;
    }
    if (!this.bareMetalServerModelRef) {
      this.openModal();
    }
  }

  buildAddEditForm(bareMetalServerId?: string) {
    this.crudService.createBareMetalServerForm(bareMetalServerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.bareMetalServerForm = form;
      this.bareMetalServerFormErrors = this.crudService.resetBareMetalServerFormErrors();
      this.bareMetalServerFormValidationMessages = this.crudService.validationMessages.bareMetalServerMessages;
      this.backUpdata.ip_address = this.bareMetalServerForm.controls.ip_address ? this.bareMetalServerForm.controls.ip_address.value : '';
      this.backUpdata.snmp_community = this.bareMetalServerForm.controls.snmp_community ? this.bareMetalServerForm.controls.snmp_community.value : '';
      this.createOtherForm(this.bareMetalServerForm.get('bmc_type').value, this.bareMetalServerId);
      if (bareMetalServerId) {
        this.getModels(this.bareMetalServerForm.get('manufacturer.id').value, false);
        this.getCabinets(this.bareMetalServerForm.get('datacenter.uuid').value, false);
        this.getPrivateClouds(this.bareMetalServerForm.get('datacenter.uuid').value, false);
        this.bareMetalServerForm.get('life_cycle_stage').enable;
        this.bareMetalServerForm.get('life_cycle_stage_status').enable;
      }
      this.bareMetalServerForm.get('manufacturer.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getModels(val, true);
      });
      this.bareMetalServerForm.get('datacenter.uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getCabinets(val, true);
        this.getPrivateClouds(val, true);
      });
      this.bareMetalServerForm.get('cabinet.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.bareMetalServerForm.get('position').setValue('');
        if (val) {
          this.bareMetalServerForm.get('position').enable();
        } else {
          this.bareMetalServerForm.get('position').disable();
        }
      });
      this.bareMetalServerForm.get('bmc_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: string) => {
        this.createOtherForm(data, null);
      });
    });
  }

  handleError(data: BMServer | IPMI | DRAC, err: any) {
    this.bareMetalServerFormErrors = this.crudService.resetBareMetalServerFormErrors();
    this.IPMIFormErrors = this.crudService.resetIPMIFormErrors();
    this.DRACFormErrors = this.crudService.resetDRACFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      } else {
        for (const field in err) {
          if (field in this.bareMetalServerFormErrors) {
            this.bareMetalServerFormErrors[field] = err[field][0];
          } else if (field in this.IPMIFormErrors) {
            this.IPMIFormErrors[field] = err[field][0];
          } else if (field in this.DRACFormErrors) {
            this.DRACFormErrors[field] = err[field][0];
          }
        }
      }
    } else {
      this.bareMetalServerModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
  }


  validateIPMIForm() {
    if (this.IPMIForm.invalid) {
      this.IPMIFormErrors = this.utilService.validateForm(this.IPMIForm, this.IPMIFormValidationMessages, this.IPMIFormErrors);
      this.IPMIForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.IPMIFormErrors = this.utilService.validateForm(this.IPMIForm, this.IPMIFormValidationMessages, this.IPMIFormErrors); });
    }
    if (this.bareMetalServerForm.valid && this.IPMIForm.valid) {
      this.createBMServers(_merge({}, <BMServer>this.bareMetalServerForm.getRawValue(), <IPMI>this.IPMIForm.getRawValue()));
    }
  }

  validateDARCForm() {
    if (this.DRACForm.invalid) {
      this.DRACFormErrors = this.utilService.validateForm(this.DRACForm, this.DRACFormValidationMessages, this.DRACFormErrors);
      this.DRACForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.DRACFormErrors = this.utilService.validateForm(this.DRACForm, this.DRACFormValidationMessages, this.DRACFormErrors); });
    }
    if (this.bareMetalServerForm.valid && this.DRACForm.valid) {
      this.createBMServers(_merge({}, <DRAC>this.bareMetalServerForm.getRawValue(), <DRAC>this.DRACForm.getRawValue()));
    }
  }

  validateBMSForm() {
    this.createBMServers(<BMServer>this.bareMetalServerForm.getRawValue());
  }

  createBMServer() {
    this.caSvc.submit();
    if (this.bareMetalServerForm.invalid || this.caSvc.isInvalid()) {
      this.bareMetalServerFormErrors = this.utilService.validateForm(this.bareMetalServerForm, this.bareMetalServerFormValidationMessages, this.bareMetalServerFormErrors);
      this.bareMetalServerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.bareMetalServerFormErrors = this.utilService.validateForm(this.bareMetalServerForm, this.bareMetalServerFormValidationMessages, this.bareMetalServerFormErrors);
        this.caSvc.submit();
      });
    }
    switch (this.bareMetalServerForm.get('bmc_type').value) {
      case BMServerSidePlatformMapping.IPMI:
        this.validateIPMIForm();
        break;
      case BMServerSidePlatformMapping.DRAC:
        this.validateDARCForm();
        break;
      case BMServerSidePlatformMapping.None:
        this.validateBMSForm();
        break;
    }
  }

  createBMServers(data: BMServer | IPMI | DRAC) {
    if (this.bareMetalServerForm.invalid) {
      this.bareMetalServerFormErrors = this.utilService.validateForm(this.bareMetalServerForm, this.bareMetalServerFormValidationMessages, this.bareMetalServerFormErrors);
      this.bareMetalServerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.bareMetalServerFormErrors = this.utilService.validateForm(this.bareMetalServerForm, this.bareMetalServerFormValidationMessages, this.bareMetalServerFormErrors); });
    } else {
      let obj = <BareMetalServerCRUDFormData>Object.assign({}, data, { 'custom_attribute_data': this.caSvc.getFormData() });
      this.spinnerService.start('main');
      if (this.bareMetalServerId) {
        this.crudService.updateBMServer(obj, this.bareMetalServerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.bareMetalServerModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Bare Metal Server updated successfully.'));
          this.onCrud.emit(CRUDActionTypes.UPDATE);
        }, (err: HttpErrorResponse) => {
          this.spinnerService.stop('main');
          this.handleError(data, err.error);
        });
      } else {
        this.crudService.createBMServer(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.bareMetalServerModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Bare Metal Server Created successfully.'));
          this.onCrud.emit(CRUDActionTypes.ADD);
        }, (err: HttpErrorResponse) => {
          this.spinnerService.stop('main');
          this.handleError(data, err.error);
        });
      }
    }
  }

  confirmBareMetalServerDelete() {
    this.crudService.deleteBMServer(this.bareMetalServerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmBareMetalServerDeleteModalRef.hide();
      this.notification.success(new Notification('Bare Metal Server deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, err => {
      this.confirmBareMetalServerDeleteModalRef.hide();
      this.notification.error(new Notification('Bare Metal Server could not be deleted!!'));
    });
  }

}
