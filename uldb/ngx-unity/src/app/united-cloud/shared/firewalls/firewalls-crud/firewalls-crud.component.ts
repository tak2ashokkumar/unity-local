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
import { UnityDevicesCustomAttributesCrudService } from 'src/app/shared/unity-devices-custom-attributes-crud/unity-devices-custom-attributes-crud.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { FirewallCRUDManufacturer, FirewallCRUDModel } from '../../entities/firewall-crud.type';
import { FirewallCRUDFormData, FirewallCrudService } from './firewalls-crud.service';

@Component({
  selector: 'firewalls-crud',
  templateUrl: './firewalls-crud.component.html',
  styleUrls: ['./firewalls-crud.component.scss']
})
export class FirewallsCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  private ngUnsubscribe = new Subject();
  fireWallId: string;
  nonFieldErr: string = '';
  action: 'Add' | 'Edit';
  managementEnabled: boolean = false;

  deviceType: DeviceMapping = DeviceMapping.FIREWALL;
  SNMPVersionPlatFormMappingEnum = SNMPVersionMapping;
  AuthLevelPlatFormMappingEnum = AuthLevelMapping;

  @ViewChild('firewallFormRef') firewallFormRef: ElementRef;
  firewallModelRef: BsModalRef;
  firewallForm: FormGroup;
  firewallFormErrors: any;
  firewallFormValidationMessages: any;

  manufacturers: Array<FirewallCRUDManufacturer> = [];
  models: Array<FirewallCRUDModel> = [];
  datacenters: Array<DatacenterFast> = [];
  cabinets: Array<CabinetFast> = [];
  privateclouds: Array<DeviceCRUDPrivateCloudFast> = [];
  tagsAutocompleteItems: string[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmFirewallDeleteModalRef: BsModalRef;

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

  constructor(private crudService: FirewallCrudService,
    private caSvc: UnityDevicesCustomAttributesCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private appService: AppLevelService) {
    this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(fireWallId => {
      this.fireWallId = fireWallId;
      this.action = this.fireWallId ? 'Edit' : 'Add';
      this.nonFieldErr = '';
      this.firewallModelRef = null;
      this.getTags();
      this.buildAddEditForm(fireWallId);
    });
    this.crudService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(fireWallId => {
      this.fireWallId = fireWallId;
      this.confirmFirewallDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
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
        this.firewallForm.patchValue({ model: { id: '' } });
      }
    });
  }

  getDatacenters() {
    this.datacenters = [];
    this.crudService.getDatacenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenters = res;
    });
  }

  getCollectors() {
    this.crudService.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
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
        this.firewallForm.patchValue({ cabinet: { id: '' } });
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
        this.firewallForm.patchValue({ cloud: [] });
      } else {
        let clouds = (<DeviceCRUDPrivateCloudFast[]>this.firewallForm.get('cloud').value).map(c => c.uuid);
        this.firewallForm.get('cloud').setValue(this.privateclouds.filter(pc => clouds.includes(pc.uuid)));
      }
    });
  }

  getTags() {
    this.tagsAutocompleteItems = [];
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  buildAddEditForm(fireWallId?: string) {
    this.crudService.createFirewallForm(fireWallId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.firewallForm = form;
      this.firewallFormErrors = this.crudService.resetFirewallFormErrors();
      this.firewallFormValidationMessages = this.crudService.firewallValidationMessages;
      if (fireWallId) {
        this.getModels(this.firewallForm.get('manufacturer').value, false);
        this.getCabinets(this.firewallForm.get('datacenter.uuid').value, false);
        this.getPrivateClouds(this.firewallForm.get('datacenter.uuid').value, false);
      }
      this.firewallModelRef = this.modalService.show(this.firewallFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
      this.firewallForm.get('manufacturer').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getModels(val, true);
      });
      this.firewallForm.get('datacenter.uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getCabinets(val, true);
        this.getPrivateClouds(val, true);
      });
      this.firewallForm.get('cabinet.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.firewallForm.get('position').setValue('');
        if (val) {
          this.firewallForm.get('position').enable();
        } else {
          this.firewallForm.get('position').disable();
        }
      });
    });
  }

  handleError(err: any) {
    this.firewallFormErrors = this.crudService.resetFirewallFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.firewallForm.controls) {
          this.firewallFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.firewallModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  confirmFirewallCreate() {
    this.caSvc.submit();
    if (this.firewallForm.invalid || this.caSvc.isInvalid()) {
      this.firewallFormErrors = this.utilService.validateForm(this.firewallForm, this.firewallFormValidationMessages, this.firewallFormErrors);
      this.firewallForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.firewallFormErrors = this.utilService.validateForm(this.firewallForm, this.firewallFormValidationMessages, this.firewallFormErrors);
        this.caSvc.submit();
      });
    } else {
      let obj = <FirewallCRUDFormData>Object.assign({}, this.firewallForm.getRawValue(), { 'custom_attribute_data': this.caSvc.getFormData() });
      this.spinnerService.start('main');
      if (this.fireWallId) {
        this.crudService.updateFirewall(obj, this.fireWallId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.firewallModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Firewall updated successfully.'));
          this.onCrud.emit(CRUDActionTypes.UPDATE);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudService.createFirewall(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.firewallModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Firewall Created successfully.'));
          this.onCrud.emit(CRUDActionTypes.ADD);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  confirmFirewallDelete() {
    this.crudService.deleteFirewall(this.fireWallId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmFirewallDeleteModalRef.hide();
      this.notification.success(new Notification('Firewall deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, err => {
      this.confirmFirewallDeleteModalRef.hide();
      this.notification.error(new Notification('Firewall could not be deleted!!'));
    });
  }
}



