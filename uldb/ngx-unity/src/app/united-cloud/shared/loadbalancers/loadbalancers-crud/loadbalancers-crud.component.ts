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
import { LoadBalancerCRUDManufacturer, LoadBalancerCRUDModel } from '../../entities/loadbalancer-crud.type';
import { LoadBalancerCRUDFormData, LoadbalancersCrudService } from './loadbalancers-crud.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UnityDevicesCustomAttributesCrudService } from 'src/app/app-shared-crud/unity-devices-custom-attributes-crud/unity-devices-custom-attributes-crud.service';

@Component({
  selector: 'loadbalancers-crud',
  templateUrl: './loadbalancers-crud.component.html',
  styleUrls: ['./loadbalancers-crud.component.scss']
})
export class LoadbalancersCrudComponent implements OnInit, OnDestroy {

  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  private ngUnsubscribe = new Subject();
  action: 'Add' | 'Edit';
  nonFieldErr: string = '';
  loadBalancerId: string;
  managementEnabled: boolean = false;

  deviceType: DeviceMapping = DeviceMapping.LOAD_BALANCER;
  SNMPVersionPlatFormMappingEnum = SNMPVersionMapping;
  AuthLevelPlatFormMappingEnum = AuthLevelMapping;

  @ViewChild('loadBalancerFormRef') loadBalancerFormRef: ElementRef;
  loadBalancerModelRef: BsModalRef;
  loadBalancerForm: FormGroup;
  loadBalancerErrors: any;
  loadBalancerFormValidationMessages: any;

  manufacturers: Array<LoadBalancerCRUDManufacturer> = [];
  models: Array<LoadBalancerCRUDModel> = [];
  datacenters: Array<DatacenterFast> = [];
  cabinets: Array<CabinetFast> = [];
  privateclouds: Array<DeviceCRUDPrivateCloudFast> = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmLoadBalancerDeleteModalRef: BsModalRef;

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
  tagsAutocompleteItems: string[] = [];
  form: FormGroup;

  constructor(private crudService: LoadbalancersCrudService,
    private caSvc: UnityDevicesCustomAttributesCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private appService: AppLevelService) {
    this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(loadBalancerId => {
      this.loadBalancerId = loadBalancerId;
      this.action = this.loadBalancerId ? 'Edit' : 'Add';
      this.nonFieldErr = '';
      this.loadBalancerModelRef = null;
      this.getTags();
      this.buildAddEditForm(loadBalancerId);
    });
    this.crudService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(loadBalancerId => {
      this.loadBalancerId = loadBalancerId;
      this.confirmLoadBalancerDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
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
        this.loadBalancerForm.patchValue({ model: { id: '' } });
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
        this.loadBalancerForm.patchValue({ cabinet: { id: '' } });
      }
    });
  }

  getCollectors() {
    this.crudService.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  getPrivateClouds(dcId: string, patchValue: boolean) {
    if (!dcId) {
      return;
    }
    this.privateclouds = [];
    this.crudService.getPrivateCloud(dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.privateclouds = res;
      if (patchValue) {
        this.loadBalancerForm.patchValue({ cloud: [] });
      } else {
        let clouds = (<DeviceCRUDPrivateCloudFast[]>this.loadBalancerForm.get('cloud').value).map(c => c.uuid);
        this.loadBalancerForm.get('cloud').setValue(this.privateclouds.filter(pc => clouds.includes(pc.uuid)));
      }
    });
  }

  getTags() {
    this.tagsAutocompleteItems = [];
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  buildAddEditForm(loadBalancerId?: string) {
    this.crudService.createLoadBalancerForm(loadBalancerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.loadBalancerForm = form;
      this.loadBalancerErrors = this.crudService.resetLoadBalancerFormErrors();
      this.loadBalancerFormValidationMessages = this.crudService.loadBalancerValidationMessages;
      if (loadBalancerId) {
        this.getModels(this.loadBalancerForm.get('manufacturer').value, false);
        this.getCabinets(this.loadBalancerForm.get('datacenter.uuid').value, false);
        this.getPrivateClouds(this.loadBalancerForm.get('datacenter.uuid').value, false);
      }
      this.loadBalancerModelRef = this.modalService.show(this.loadBalancerFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
      this.loadBalancerForm.get('manufacturer').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getModels(val, true);
      });
      this.loadBalancerForm.get('datacenter.uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getCabinets(val, true);
        this.getPrivateClouds(val, true);
      });
      this.loadBalancerForm.get('cabinet.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.loadBalancerForm.get('position').setValue('');
        if (val) {
          this.loadBalancerForm.get('position').enable();
        } else {
          this.loadBalancerForm.get('position').disable();
        }
      });

    });
  }

  handleError(err: any) {
    this.loadBalancerErrors = this.crudService.resetLoadBalancerFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.loadBalancerForm.controls) {
          this.loadBalancerErrors[field] = err[field][0];
        }
      }
    } else {
      this.loadBalancerModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  confirmLoadBalancerCreate() {
    this.caSvc.submit();
    if (this.loadBalancerForm.invalid || this.caSvc.isInvalid()) {
      this.loadBalancerErrors = this.utilService.validateForm(this.loadBalancerForm, this.loadBalancerFormValidationMessages, this.loadBalancerErrors);
      this.loadBalancerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.loadBalancerErrors = this.utilService.validateForm(this.loadBalancerForm, this.loadBalancerFormValidationMessages, this.loadBalancerErrors);
        this.caSvc.submit();
      });
    } else {
      let obj = <LoadBalancerCRUDFormData>Object.assign({}, this.loadBalancerForm.getRawValue(), { 'custom_attribute_data': this.caSvc.getFormData() });
      this.spinnerService.start('main');
      if (this.loadBalancerId) {
        this.crudService.updateLoadBalancer(obj, this.loadBalancerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.loadBalancerModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Load Balancer updated successfully.'));
          this.onCrud.emit(CRUDActionTypes.UPDATE);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudService.createLoadBalancer(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.loadBalancerModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Load Balancer Created successfully.'));
          this.onCrud.emit(CRUDActionTypes.ADD);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  confirmLoadBalancerDelete() {
    this.crudService.deleteLoadBalanecer(this.loadBalancerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmLoadBalancerDeleteModalRef.hide();
      this.notification.success(new Notification('Load Balancer deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, err => {
      this.confirmLoadBalancerDeleteModalRef.hide();
      this.notification.error(new Notification('Load Balancer could not be deleted!!'));
    });
  }

}
