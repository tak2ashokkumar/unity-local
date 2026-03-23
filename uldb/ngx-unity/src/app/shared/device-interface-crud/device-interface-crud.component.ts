import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DeviceInterfaceCrudService, deviceTypesOptions } from './device-interface-crud.service';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppUtilityService, CRUDActionTypes, DeviceMapping } from '../app-utility/app-utility.service';
import { AppSpinnerService } from '../app-spinner/app-spinner.service';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { Notification } from '../app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { DeviceDataType, DeviceTypesOptionsType, InterfaceDetailsType, TargetDeviceFormDataType } from '../SharedEntityTypes/device-interface.type';

@Component({
  selector: 'device-interface-crud',
  templateUrl: './device-interface-crud.component.html',
  styleUrls: ['./device-interface-crud.component.scss']
})
export class DeviceInterfaceCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<string>();

  @Output('onCrud') onCrud = new EventEmitter<{ type: CRUDActionTypes }>();
  deviceTypes: Array<DeviceTypesOptionsType> = deviceTypesOptions;
  targetDeviceForm: FormGroup;
  targetDeviceFormErrors: any;
  targetDeviceFormValidationMessages: any;
  targetDeviceFormData: TargetDeviceFormDataType;

  nonFieldErr: string = '';
  interfaceData: { uuid: string, deviceType: DeviceMapping, name: string, description: string };
  devices: DeviceDataType[] = [];
  interfaceDetails: InterfaceDetailsType[] = [];

  @ViewChild('targetDeviceRef') targetDeviceRef: ElementRef;
  targetDeviceModalRef: BsModalRef;
  constructor(private interfaceCrudSvc: DeviceInterfaceCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notificationService: AppNotificationService) {
    this.interfaceCrudSvc.addTagetDeviceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.interfaceData = data;
      this.buildTargetDeviceForm();
    })
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildTargetDeviceForm() {
    this.nonFieldErr = '';
    this.devices = [];
    this.interfaceDetails = [];
    this.targetDeviceForm = this.interfaceCrudSvc.buildTargetDeviceForm();
    this.targetDeviceFormErrors = this.interfaceCrudSvc.resetTargetDeviceFormErrors();
    this.targetDeviceFormValidationMessages = this.interfaceCrudSvc.targetDeviceFormValidationMessages;
    this.targetDeviceModalRef = this.modalService.show(this.targetDeviceRef, Object.assign({}, { class: '', keyword: false }));
    this.targetDeviceForm.get('source_interface').setValue(this.interfaceData.name);
    this.targetDeviceForm.get('source_des').setValue(this.interfaceData.description);
    this.handleTargetDeviceFormSubscriptions();
  }

  handleTargetDeviceFormSubscriptions() {
    this.targetDeviceForm.get('device_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((deviceType: string) => {
      this.targetDeviceFormData = this.targetDeviceForm.getRawValue();
      this.getDevicesByDeviceType();
    });
    this.targetDeviceForm.get('remote_device').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((remoteDevice: DeviceDataType) => {
      this.targetDeviceFormData = this.targetDeviceForm.getRawValue();
      this.getInterfaceDetails();
    });
  }

  getDevicesByDeviceType() {
    this.devices = [];
    this.interfaceCrudSvc.getDevicesByDeviceType(this.targetDeviceFormData.device_type).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DeviceDataType[]) => {
      this.devices = res;
    });
  }

  getInterfaceDetails() {
    this.interfaceDetails = [];
    this.interfaceCrudSvc.getInterfaceDetails(this.targetDeviceFormData.device_type, this.targetDeviceFormData.remote_device.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: InterfaceDetailsType[]) => {
      this.interfaceDetails = res;
    });
  }

  handleError(err: any) {
    this.targetDeviceFormErrors = this.interfaceCrudSvc.resetTargetDeviceFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.targetDeviceForm) {
          this.targetDeviceForm[field] = err[field][0];
        }
      }
    } else {
      this.targetDeviceModalRef.hide();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  submit() {
    if (this.targetDeviceForm.invalid) {
      this.targetDeviceFormErrors = this.utilService.validateForm(this.targetDeviceForm, this.targetDeviceFormValidationMessages, this.targetDeviceFormErrors);
      this.targetDeviceForm.valueChanges.subscribe((data: any) => {
        this.targetDeviceFormErrors = this.utilService.validateForm(this.targetDeviceForm, this.targetDeviceFormValidationMessages, this.targetDeviceFormErrors);
      });
      return;
    } else {
      this.spinnerService.start('main');
      this.interfaceCrudSvc.addTargetDevice(this.interfaceData, this.targetDeviceForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
        this.targetDeviceModalRef.hide();
        this.notificationService.success(new Notification('Target Device added successfully'));
        this.onCrud.emit({ type: CRUDActionTypes.ADD });
        this.spinnerService.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }
}