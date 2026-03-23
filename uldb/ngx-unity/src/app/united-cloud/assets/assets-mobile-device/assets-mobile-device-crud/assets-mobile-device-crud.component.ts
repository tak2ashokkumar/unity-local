import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/public_api';
import { Observable, of, Subject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { AssetsMobileDeviceCrudService, TagDevice } from './assets-mobile-device-crud.service';
import { AppLevelService } from 'src/app/app-level.service';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UnityDevicesCustomAttributesCrudService } from 'src/app/shared/unity-devices-custom-attributes-crud/unity-devices-custom-attributes-crud.service';

@Component({
  selector: 'assets-mobile-device-crud',
  templateUrl: './assets-mobile-device-crud.component.html',
  styleUrls: ['./assets-mobile-device-crud.component.scss'],
})
export class AssetsMobileDeviceCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();
  private ngUnsubscribe = new Subject();
  deviceType: DeviceMapping = DeviceMapping.MOBILE_DEVICE;
  mobileDeviceId: string;
  nonFieldErr: string = '';
  action: 'Add' | 'Edit';
  managementEnabled: boolean = false;
  tagsAutocompleteItems: string[] = [];

  @ViewChild('mobileFormRef') mobileFormRef: ElementRef;
  mobileModelRef: BsModalRef;
  mobileForm: FormGroup;
  mobileFormErrors: any;
  mobileFormValidationMessages: any;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmMobileDeleteModalRef: BsModalRef;

  datacenters: Array<DatacenterFast> = [];
  tagDevices: TagDevice[] = [];
  asyncSelected: string;
  typeaheadNoResults: boolean;
  dataSource: Observable<TagDevice[]>;
  tagDeviceErr: boolean;
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  constructor(private crudService: AssetsMobileDeviceCrudService,
    private caSvc: UnityDevicesCustomAttributesCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private appService: AppLevelService,) {
    this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(deviceId => {
      this.mobileDeviceId = deviceId;
      this.action = this.mobileDeviceId ? 'Edit' : 'Add';
      this.nonFieldErr = '';
      this.mobileModelRef = null;
      this.asyncSelected = '';
      this.tagDeviceErr = false;
      this.getTags();
      this.buildAddEditForm(deviceId);
    });

    this.crudService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(deviceId => {
      this.mobileDeviceId = deviceId;
      this.confirmMobileDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });

    this.dataSource = Observable.create((observer: any) => {
      // Runs on every search
      observer.next(this.asyncSelected);
    }).pipe(
      mergeMap((token: string) => this.getStatesAsObservable(token))
    );
  }

  ngOnInit() {
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

  getStatesAsObservable(search: string): Observable<TagDevice[]> {
    if (!search) {
      return of([]);
    }
    if (!this.mobileForm.get('platform').value) {
      this.tagDeviceErr = true;
      return of([]);
    } else {
      return this.crudService.getTagDevices(this.mobileForm.get('platform').value, search).pipe(takeUntil(this.ngUnsubscribe));
    }
  }

  typeaheadOnSelect(e: TypeaheadMatch): void {
    this.mobileForm.get('device_tagged').setValue(e.item.id);
  }

  buildAddEditForm(mobileDeviceId?: string) {
    this.crudService.createMobileDeviceForm(mobileDeviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.mobileForm = form;
      this.managementEnabled = this.mobileForm.controls.backend_url ? true : false;
      this.mobileFormErrors = this.crudService.resetMobileDeviceFormErrors();
      this.mobileFormValidationMessages = this.crudService.mobileDeviceFormValidationMessages;
      let dt = this.mobileForm.get('device_tagged').value;
      if (dt) {
        this.asyncSelected = dt.name;
        this.mobileForm.get('device_tagged').setValue(dt.id);
      }
      this.mobileForm.get('platform').valueChanges.subscribe(r => {
        this.asyncSelected = '';
        this.mobileForm.get('device_tagged').setValue(null);
        this.tagDeviceErr = false;
      });
      this.mobileModelRef = this.modalService.show(this.mobileFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  handleError(err: any) {
    this.mobileFormErrors = this.crudService.resetMobileDeviceFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.mobileForm.controls) {
          this.mobileFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.mobileModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  onSubmitCreate() {
    this.caSvc.submit();
    if (this.mobileForm.invalid || this.caSvc.isInvalid()) {
      this.mobileFormErrors = this.utilService.validateForm(this.mobileForm, this.mobileFormValidationMessages, this.mobileFormErrors);
      this.mobileForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.mobileFormErrors = this.utilService.validateForm(this.mobileForm, this.mobileFormValidationMessages, this.mobileFormErrors);
        this.caSvc.submit();
      });
    } else {
      let obj = Object.assign({}, this.mobileForm.getRawValue(), { 'custom_attribute_data': this.caSvc.getFormData() });
      this.spinnerService.start('main');
      if (this.mobileDeviceId) {
        this.crudService.updateMobileDevice(obj, this.mobileDeviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.mobileModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Mobile Device updated successfully.'));
          this.onCrud.emit(CRUDActionTypes.UPDATE);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudService.createMobileDevice(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.mobileModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Mobile Device Created successfully.'));
          this.onCrud.emit(CRUDActionTypes.ADD);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  onSubmitDelete() {
    this.crudService.deleteMobileDevice(this.mobileDeviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmMobileDeleteModalRef.hide();
      this.notification.success(new Notification('Mobile Device deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, err => {
      this.confirmMobileDeleteModalRef.hide();
      this.notification.error(new Notification('Mobile Device could not be deleted!!'));
    });
  }

}
