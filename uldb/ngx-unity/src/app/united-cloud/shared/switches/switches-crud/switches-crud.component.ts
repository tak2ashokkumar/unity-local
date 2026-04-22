import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, AuthLevelMapping, CRUDActionTypes, DeviceMapping, SNMPVersionMapping } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { SwitchCRUDManufacturer, SwitchCRUDModel } from '../../entities/switch-crud.type';
import { SwitchCRUDFormData, SwitchesCrudService } from './switches-crud.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UnityDevicesCustomAttributesCrudService } from 'src/app/app-shared-crud/unity-devices-custom-attributes-crud/unity-devices-custom-attributes-crud.service';

@Component({
  selector: 'switches-crud',
  templateUrl: './switches-crud.component.html',
  styleUrls: ['./switches-crud.component.scss']
})
export class SwitchesCrudComponent implements OnInit, OnDestroy {

  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  private ngUnsubscribe = new Subject();
  action: 'Add' | 'Edit';
  nonFieldErr: string = '';
  switchId: string;
  managementEnabled: boolean = false;

  deviceType: DeviceMapping = DeviceMapping.SWITCHES;
  SNMPVersionPlatFormMappingEnum = SNMPVersionMapping;
  AuthLevelPlatFormMappingEnum = AuthLevelMapping;

  @ViewChild('switchFormRef') switchFormRef: ElementRef;
  switchModelRef: BsModalRef;
  switchForm: FormGroup;
  switchFormErrors: any;
  switchFormValidationMessages: any;

  manufacturers: Array<SwitchCRUDManufacturer> = [];
  models: Array<SwitchCRUDModel> = [];
  datacenters: Array<DatacenterFast> = [];
  cabinets: Array<CabinetFast> = [];
  privateclouds: Array<DeviceCRUDPrivateCloudFast> = [];
  tagsAutocompleteItems: string[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmSwitchDeleteModalRef: BsModalRef;

  cloudSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: true
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

  constructor(private crudService: SwitchesCrudService,
    private caSvc: UnityDevicesCustomAttributesCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private appService: AppLevelService) {
    this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(switchId => {
      this.switchId = switchId;
      this.action = this.switchId ? 'Edit' : 'Add';
      this.nonFieldErr = '';
      this.switchModelRef = null;
      this.getTags();
      this.buildAddEditForm(switchId);
    });
    this.crudService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(switchId => {
      this.switchId = switchId;
      this.confirmSwitchDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  ngOnInit() {
    this.getManufacturers();
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
        this.switchForm.patchValue({ model: { id: '' } });
      }
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
        this.switchForm.patchValue({ cabinet: { id: '' } });
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
        this.switchForm.patchValue({ cloud: [] });
      } else {
        let clouds = (<DeviceCRUDPrivateCloudFast[]>this.switchForm.get('cloud').value).map(c => c.uuid);
        this.switchForm.get('cloud').setValue(this.privateclouds.filter(pc => clouds.includes(pc.uuid)));
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

  buildAddEditForm(switchId?: string) {
    this.crudService.createSwitchForm(switchId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.switchForm = form;
      this.switchFormErrors = this.crudService.resetSwitchFormErrors();
      this.switchFormValidationMessages = this.crudService.switchValidationMessages;
      if (switchId) {
        this.getModels(this.switchForm.get('manufacturer').value, false);
        this.getCabinets(this.switchForm.get('datacenter.uuid').value, false);
        this.getPrivateClouds(this.switchForm.get('datacenter.uuid').value, false);
      }
      this.switchModelRef = this.modalService.show(this.switchFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
      this.switchForm.get('manufacturer').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getModels(val, true);
      });
      this.switchForm.get('datacenter.uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getCabinets(val, true);
        this.getPrivateClouds(val, true);
      });
      this.switchForm.get('cabinet.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.switchForm.get('position').setValue('');
        if (val) {
          this.switchForm.get('position').enable();
        } else {
          this.switchForm.get('position').disable();
        }
      });
    });
  }

  handleError(err: any) {
    this.switchFormErrors = this.crudService.resetSwitchFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.switchForm.controls) {
          this.switchFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.switchModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  confirmSwitchCreate() {
    this.caSvc.submit();
    if (this.switchForm.invalid || this.caSvc.isInvalid()) {
      this.switchFormErrors = this.utilService.validateForm(this.switchForm, this.switchFormValidationMessages, this.switchFormErrors);
      this.switchForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => { 
        this.switchFormErrors = this.utilService.validateForm(this.switchForm, this.switchFormValidationMessages, this.switchFormErrors);
        this.caSvc.submit();
      });
    } else {
      let obj = <SwitchCRUDFormData>Object.assign({}, this.switchForm.getRawValue(), { 'custom_attribute_data': this.caSvc.getFormData() });
      this.spinnerService.start('main');
      if (this.switchId) {
        this.crudService.updateSwitch(obj, this.switchId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.switchModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Switch Updated Successfully.'));
          this.onCrud.emit(CRUDActionTypes.UPDATE);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudService.createSwitch(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.switchModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Switch Created Successfully.'));
          this.onCrud.emit(CRUDActionTypes.ADD);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  confirmSwitchDelete() {
    this.crudService.switchDelete(this.switchId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmSwitchDeleteModalRef.hide();
      this.notification.success(new Notification('Switch deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, err => {
      this.confirmSwitchDeleteModalRef.hide();
      this.notification.error(new Notification('Switch could not be deleted!!'));
    });
  }

}
