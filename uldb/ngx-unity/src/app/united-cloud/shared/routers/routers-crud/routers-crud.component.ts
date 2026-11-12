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
import { SwitchCRUDFormData, RoutersCrudService } from './routers-crud.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UnityDevicesCustomAttributesCrudService } from 'src/app/app-shared-crud/unity-devices-custom-attributes-crud/unity-devices-custom-attributes-crud.service';

@Component({
  selector: 'routers-crud',
  templateUrl: './routers-crud.component.html',
  styleUrls: ['./routers-crud.component.scss']
})
export class RoutersCrudComponent implements OnInit, OnDestroy {

  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  private ngUnsubscribe = new Subject();
  action: 'Add' | 'Edit';
  nonFieldErr: string = '';
  routerId: string;
  managementEnabled: boolean = false;

  deviceType: DeviceMapping = DeviceMapping.ROUTERS;
  SNMPVersionPlatFormMappingEnum = SNMPVersionMapping;
  AuthLevelPlatFormMappingEnum = AuthLevelMapping;

  @ViewChild('routerFormRef') routerFormRef: ElementRef;
  routerModelRef: BsModalRef;
  routerForm: FormGroup;
  routerFormErrors: any;
  routerFormValidationMessages: any;

  manufacturers: Array<SwitchCRUDManufacturer> = [];
  models: Array<SwitchCRUDModel> = [];
  datacenters: Array<DatacenterFast> = [];
  cabinets: Array<CabinetFast> = [];
  privateclouds: Array<DeviceCRUDPrivateCloudFast> = [];
  tagsAutocompleteItems: string[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmRouterDeleteModalRef: BsModalRef;

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

  constructor(private crudService: RoutersCrudService,
    private caSvc: UnityDevicesCustomAttributesCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private appService: AppLevelService) {
    this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(routerId => {
      this.routerId = routerId;
      this.action = this.routerId ? 'Edit' : 'Add';
      this.nonFieldErr = '';
      this.routerModelRef = null;
      this.getTags();
      this.buildAddEditRouterForm(routerId);
    });
    this.crudService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(routerId => {
      this.routerId = routerId;
      this.confirmRouterDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  ngOnInit() {
    this.getManufacturers();
    this.getDatacenters();
    this.getCollectors();
  }

  ngOnDestroy() {
    this.confirmRouterDeleteModalRef?.hide();
    this.routerModelRef?.hide();
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
        this.routerForm.patchValue({ model: { id: '' } });
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
        this.routerForm.patchValue({ cabinet: { id: '' } });
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
        this.routerForm.patchValue({ cloud: [] });
      } else {
        let clouds = (<DeviceCRUDPrivateCloudFast[]>this.routerForm.get('cloud').value).map(c => c.uuid);
        this.routerForm.get('cloud').setValue(this.privateclouds.filter(pc => clouds.includes(pc.uuid)));
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

  buildAddEditRouterForm(routerId?: string) {
    this.crudService.createRouterForm(routerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.routerForm = form;
      this.routerFormErrors = this.crudService.resetRouterFormErrors();
      this.routerFormValidationMessages = this.crudService.routerValidationMessages;
      if (routerId) {
        this.getModels(this.routerForm.get('manufacturer').value, false);
        this.getCabinets(this.routerForm.get('datacenter.uuid').value, false);
        this.getPrivateClouds(this.routerForm.get('datacenter.uuid').value, false);
      }
      this.routerModelRef = this.modalService.show(this.routerFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
      this.routerForm.get('manufacturer').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getModels(val, true);
      });
      this.routerForm.get('datacenter.uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getCabinets(val, true);
        this.getPrivateClouds(val, true);
      });
      this.routerForm.get('cabinet.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.routerForm.get('position').setValue('');
        if (val) {
          this.routerForm.get('position').enable();
        } else {
          this.routerForm.get('position').disable();
        }
      });
    });
  }

  handleError(err: any) {
    this.routerFormErrors = this.crudService.resetRouterFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.routerForm.controls) {
          this.routerFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.routerModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  confirmRouterCreate() {
    this.caSvc.submit();
    if (this.routerForm.invalid || this.caSvc.isInvalid()) {
      this.routerFormErrors = this.utilService.validateForm(this.routerForm, this.routerFormValidationMessages, this.routerFormErrors);
      this.routerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => { 
        this.routerFormErrors = this.utilService.validateForm(this.routerForm, this.routerFormValidationMessages, this.routerFormErrors);
        this.caSvc.submit();
      });
    } else {
      let obj = <SwitchCRUDFormData>Object.assign({}, this.routerForm.getRawValue(), { 'custom_attribute_data': this.caSvc.getFormData() });
      this.spinnerService.start('main');
      if (this.routerId) {
        this.crudService.updateRouter(obj, this.routerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.routerModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Router Updated Successfully.'));
          this.onCrud.emit(CRUDActionTypes.UPDATE);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudService.createRouter(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.routerModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Router Created Successfully.'));
          this.onCrud.emit(CRUDActionTypes.ADD);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  confirmRouterDelete() {
    this.crudService.routerDelete(this.routerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmRouterDeleteModalRef.hide();
      this.notification.success(new Notification('Router deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, err => {
      this.confirmRouterDeleteModalRef.hide();
      this.notification.error(new Notification('Router could not be deleted!!'));
    });
  }

}

