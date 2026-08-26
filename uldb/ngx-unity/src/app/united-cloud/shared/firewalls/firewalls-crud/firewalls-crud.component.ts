import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, AuthLevelMapping, CRUDActionTypes, DeviceMapping, SNMPVersionMapping } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { UnityDevicesCustomAttributesCrudService } from 'src/app/app-shared-crud/unity-devices-custom-attributes-crud/unity-devices-custom-attributes-crud.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { FirewallCRUDManufacturer, FirewallCRUDModel } from '../../entities/firewall-crud.type';
import { FirewallCRUDFormData, FirewallCrudService } from './firewalls-crud.service';
import { CONFIRM_MODAL_CONFIG } from 'src/app/shared/shared.const';

@Component({
  selector: 'firewalls-crud',
  templateUrl: './firewalls-crud.component.html',
  styleUrls: ['./firewalls-crud.component.scss']
})
export class FirewallsCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  private readonly ngUnsubscribe = new Subject<void>();
  private revalidateBound = false;
  fireWallId: string;
  nonFieldErr = '';
  action: 'Add' | 'Edit';
  managementEnabled = false;

  deviceType: DeviceMapping = DeviceMapping.FIREWALL;
  SNMPVersionPlatFormMappingEnum = SNMPVersionMapping;
  AuthLevelPlatFormMappingEnum = AuthLevelMapping;

  @ViewChild('firewallFormRef') firewallFormRef: TemplateRef<void>;
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
  @ViewChild('confirmdelete') confirmdelete: TemplateRef<void>;
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

  constructor(private svc: FirewallCrudService,
    private caSvc: UnityDevicesCustomAttributesCrudService,
    private modalSvc: BsModalService,
    private utilSvc: AppUtilityService,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService,
    private appSvc: AppLevelService) { }

  ngOnInit(): void {
    this.getManufacturers();
    this.getDatacenters();
    this.getCollectors();
    this.svc.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(fireWallId => {
      this.fireWallId = fireWallId;
      this.action = this.fireWallId ? 'Edit' : 'Add';
      this.nonFieldErr = '';
      this.firewallModelRef = null;
      this.getTags();
      this.buildAddEditForm(fireWallId);
    });
    this.svc.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(fireWallId => {
      this.fireWallId = fireWallId;
      this.confirmFirewallDeleteModalRef = this.modalSvc.show(this.confirmdelete, CONFIRM_MODAL_CONFIG);
    });
  }

  ngOnDestroy(): void {
    this.confirmFirewallDeleteModalRef?.hide();
    this.firewallModelRef?.hide();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getManufacturers(): void {
    this.manufacturers = [];
    this.svc.getManufacturers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.manufacturers = res;
    });
  }

  getModels(manufacturer: string, patchValue: boolean): void {
    this.models = [];
    this.svc.getModels(manufacturer).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.models = res;
      if (patchValue) {
        this.firewallForm.patchValue({ model: { id: '' } });
      }
    });
  }

  getDatacenters(): void {
    this.datacenters = [];
    this.svc.getDatacenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenters = res;
    });
  }

  getCollectors(): void {
    this.svc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  getCabinets(dcId: string, patchValue: boolean): void {
    if (!dcId) {
      return;
    }
    this.cabinets = [];
    this.svc.getCabinets(dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cabinets = res;
      if (patchValue) {
        this.firewallForm.patchValue({ cabinet: { id: '' } });
      }
    });
  }

  getPrivateClouds(dcId: string, patchValue: boolean): void {
    if (!dcId) {
      return;
    }
    this.privateclouds = [];
    this.svc.getPrivateClouds(dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.privateclouds = res;
      if (patchValue) {
        this.firewallForm.patchValue({ cloud: [] });
      } else {
        const clouds = (this.firewallForm.get('cloud').value as DeviceCRUDPrivateCloudFast[]).map(c => c.uuid);
        this.firewallForm.get('cloud').setValue(this.privateclouds.filter(pc => clouds.includes(pc.uuid)));
      }
    });
  }

  getTags(): void {
    this.tagsAutocompleteItems = [];
    this.appSvc.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  buildAddEditForm(fireWallId?: string): void {
    this.svc.createFirewallForm(fireWallId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.firewallForm = form;
      this.firewallFormErrors = this.svc.resetFirewallFormErrors();
      this.firewallFormValidationMessages = this.svc.firewallValidationMessages;
      if (fireWallId) {
        this.getModels(this.firewallForm.get('manufacturer').value, false);
        this.getCabinets(this.firewallForm.get('datacenter.uuid').value, false);
        this.getPrivateClouds(this.firewallForm.get('datacenter.uuid').value, false);
      }
      this.firewallModelRef = this.modalSvc.show(this.firewallFormRef, { ...CONFIRM_MODAL_CONFIG, class: 'modal-lg' });
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

  handleError(err: any): void {
    this.firewallFormErrors = this.svc.resetFirewallFormErrors();
    if (!err) {
      this.firewallModelRef.hide();
      this.notificationSvc.error(new Notification('Something went wrong!! Please try again.'));
      return;
    }
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else {
      for (const field in err) {
        if (field in this.firewallForm.controls) {
          this.firewallFormErrors[field] = err[field][0];
        }
      }
    }
  }

  confirmFirewallCreate(): void {
    this.caSvc.submit();
    if (this.firewallForm.invalid || this.caSvc.isInvalid()) {
      this.firewallFormErrors = this.utilSvc.validateForm(this.firewallForm, this.firewallFormValidationMessages, this.firewallFormErrors);
      this.bindRevalidationOnChanges();
      return;
    }
    const obj = Object.assign({}, this.firewallForm.getRawValue(), { 'custom_attribute_data': this.caSvc.getFormData() }) as FirewallCRUDFormData;
    this.spinnerSvc.start('main');
    if (this.fireWallId) {
      this.svc.updateFirewall(obj, this.fireWallId)
        .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
        .subscribe(() => {
          this.firewallModelRef.hide();
          this.notificationSvc.success(new Notification('Firewall updated successfully.'));
          this.onCrud.emit(CRUDActionTypes.UPDATE);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
    } else {
      this.svc.createFirewall(obj)
        .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
        .subscribe(() => {
          this.firewallModelRef.hide();
          this.notificationSvc.success(new Notification('Firewall Created successfully.'));
          this.onCrud.emit(CRUDActionTypes.ADD);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
    }
  }

  // Re-validate (and re-run custom-attribute validation) on every change once the
  // user has attempted submit. Bound once so repeated invalid submits do not stack.
  private bindRevalidationOnChanges(): void {
    if (this.revalidateBound) {
      return;
    }
    this.revalidateBound = true;
    this.firewallForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.firewallFormErrors = this.utilSvc.validateForm(this.firewallForm, this.firewallFormValidationMessages, this.firewallFormErrors);
      this.caSvc.submit();
    });
  }

  confirmFirewallDelete(): void {
    this.svc.deleteFirewall(this.fireWallId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.confirmFirewallDeleteModalRef.hide();
      this.notificationSvc.success(new Notification('Firewall deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, () => {
      this.confirmFirewallDeleteModalRef.hide();
      this.notificationSvc.error(new Notification('Firewall could not be deleted!!'));
    });
  }
}
