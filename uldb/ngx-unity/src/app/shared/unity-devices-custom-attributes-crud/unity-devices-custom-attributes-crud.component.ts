import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { AppUtilityService, DeviceMapping } from '../app-utility/app-utility.service';
import { DeviceCustomAttribute } from '../SharedEntityTypes/device-custom-attributes.type';
import { UnityDevicesCustomAttributesCrudService } from './unity-devices-custom-attributes-crud.service';
import { Notification } from '../app-notification/notification.type';

@Component({
  selector: 'unity-devices-custom-attributes-crud',
  templateUrl: './unity-devices-custom-attributes-crud.component.html',
  styleUrls: ['./unity-devices-custom-attributes-crud.component.scss']
})
export class UnityDevicesCustomAttributesCrudComponent implements OnInit, OnDestroy {
  @Input() deviceType: DeviceMapping;
  @Input() deviceAttrs?: { [key: string]: any };
  @Input() deviceId?: string;
  @Input() isOutBound?: boolean = false;
  @Input() showLoader?: boolean = false;

  private ngUnsubscribe = new Subject();
  private subscr: Subscription;

  attrsByDeviceType: DeviceCustomAttribute[] = [];
  caForm: FormGroup;
  caFormErrors: any;
  caFormValidationMessages: any;
  constructor(private caSvc: UnityDevicesCustomAttributesCrudService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService,) {
    this.caSvc.submitAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.submit();
    });
    this.caSvc.errorAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.handleError(res);
    });
  }

  ngOnInit(): void {
    this.getCustomAttributes();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.subscr && !this.subscr.closed) {
      this.subscr.unsubscribe();
    }
  }

  getCustomAttributes() {
    this.attrsByDeviceType = [];
    this.caSvc.getCustomAttributes(this.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.attrsByDeviceType = res;
      if (res.length) {
        this.buildForm();
      } else {
        this.caForm = null;
        this.caFormErrors = null;
        this.caFormValidationMessages = null;
      }
    });
  }

  buildForm() {
    let form = this.caSvc.buildForm(this.attrsByDeviceType, this.deviceAttrs);
    if (this.isOutBound) {
      form.disable({ emitEvent: false });
    }
    this.caForm = form;
    this.caFormErrors = this.caSvc.resetFormErrors(this.attrsByDeviceType);
    this.caFormValidationMessages = this.caSvc.formValidationMsgs(this.attrsByDeviceType);
  }

  manageCAForm() {
    if (this.caForm) {
      if (this.caForm.disabled) {
        this.caForm.enable({ emitEvent: false });
      } else {
        this.caForm = this.caSvc.buildForm(this.attrsByDeviceType, this.deviceAttrs);
        this.caFormErrors = this.caSvc.resetFormErrors(this.attrsByDeviceType);
        this.caFormValidationMessages = this.caSvc.formValidationMsgs(this.attrsByDeviceType);
        setTimeout(() => {
          this.caForm.disable({ emitEvent: false });
        }, 0)
      }
    }
  }

  submit() {
    this.caSvc.setForm(this.caForm);
    if (!this.caForm) {
      return;
    }
    if (this.caForm.invalid) {
      this.caFormErrors = this.utilService.validateForm(this.caForm, this.caFormValidationMessages, this.caFormErrors);
      this.caForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.caFormErrors = this.utilService.validateForm(this.caForm, this.caFormValidationMessages, this.caFormErrors);
        this.caSvc.setForm(this.caForm);
      });
    } else {
      if (this.isOutBound && this.deviceId) {
        let obj = Object.assign({}, this.caForm.getRawValue());
        this.caSvc.saveAttributes(this.deviceType, this.deviceId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.deviceAttrs = res;
          this.caForm.markAsPristine();
          this.caForm.disable({ emitEvent: false });
          this.notification.success(new Notification('Device Updated Successfully.'));
        }, err => {
          this.notification.error(new Notification('Failed to update device attributes.'));
        })
      }
    }
  }

  handleError(err: any) {
    this.caFormErrors = this.caSvc.resetFormErrors(this.attrsByDeviceType);
    if (err) {
      for (const field in err) {
        if (field in this.caForm.controls) {
          this.caFormErrors[field] = err[field][0];
        }
      }
    }
  }

}
