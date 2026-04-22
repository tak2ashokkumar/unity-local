import { Component, OnDestroy, OnInit } from '@angular/core';
import { OtherdevicesCrudService } from './otherdevices-crud.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService, DeviceMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLevelService } from 'src/app/app-level.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { OtherDevice } from '../../entities/other-device.type';
import { cloneDeep as _clone } from 'lodash-es'
import { UnityDevicesCustomAttributesCrudService } from 'src/app/app-shared-crud/unity-devices-custom-attributes-crud/unity-devices-custom-attributes-crud.service';

@Component({
  selector: 'otherdevices-crud',
  templateUrl: './otherdevices-crud.component.html',
  styleUrls: ['./otherdevices-crud.component.scss'],
  providers: [OtherdevicesCrudService]
})
export class OtherdevicesCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceId: string;
  instanceData: OtherDevice;

  deviceType: DeviceMapping = DeviceMapping.OTHER_DEVICES;
  otherDevicesForm: FormGroup;
  otherDevicesFormErrors: any;
  otherDevicesValidationMessages: any;
  nonFieldErr: string = '';
  tagsAutocompleteItems: string[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  constructor(private svc: OtherdevicesCrudService,
    private caSvc: UnityDevicesCustomAttributesCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private spinnerService: AppSpinnerService,
    private appService: AppLevelService,
    private builder: FormBuilder) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceid');
    });
    this.getTags();
    this.getCollectors();
  }

  ngOnInit(): void {
    this.spinner.start('main');
    if (this.deviceId) {
      this.getInstanceDetails();
    } else {
      this.buildForm();
    }
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getTags() {
    this.tagsAutocompleteItems = [];
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    }, err => {
      this.tagsAutocompleteItems = [];
    });
  }

  getCollectors() {
    this.svc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    }, err => {
      this.collectors = [];
    });
  }

  getInstanceDetails() {
    this.svc.getInstanceDetails(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.instanceData = res;
      this.buildForm();
    }, err => {
      this.instanceData = null;
      this.buildForm();
    });
  }

  buildForm() {
    this.otherDevicesFormErrors = this.svc.resetOtherDevicesFormErrors();
    this.otherDevicesValidationMessages = this.svc.otherDevicesFormValidationMessages;
    let form = this.svc.buildForm(this.instanceData);
    if (form.get('urls') && form.get('urls').value && form.get('urls').value.length > 1) {
      for (var i = 1; i < form.get('urls').value.length; i++) {
        this.otherDevicesFormErrors.urls.push(this.svc.getUrlFormErrors());
      }
    }
    this.otherDevicesForm = _clone(form);
    this.otherDevicesForm.get('is_monitoring').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: boolean) => {
      if (val) {
        let fg = this.svc.buildUrls();
        this.otherDevicesFormErrors.urls = [this.svc.getUrlFormErrors()];
        this.otherDevicesForm.addControl('urls', this.builder.array([fg]));
        this.handleSubscriptions(fg);
      } else {
        this.otherDevicesForm.removeControl('urls');
      }
    });
    if (form.value.is_monitoring) {
      for (let i = 0; i < this.urls.length; i++) {
        let formGroup = <FormGroup>this.urls.at(i);
        this.handleSubscriptions(formGroup);
      }
    }
    this.spinner.stop('main');
  }

  handleSubscriptions(formGroup: FormGroup) {
    formGroup.get('login_availability').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: boolean) => {
      if (val) {
        formGroup.addControl('login_username', new FormControl('', [Validators.required, NoWhitespaceValidator]));
        formGroup.addControl('login_password', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      } else {
        formGroup.removeControl('login_username');
        formGroup.removeControl('login_password');
      }
    })
    formGroup.get('response_availability').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: boolean) => {
      if (val) {
        formGroup.addControl('response_status', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      } else {
        formGroup.removeControl('response_status');
      }
    })
    formGroup.get('string_availabilty').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: boolean) => {
      if (val) {
        formGroup.addControl('string_pattern', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      } else {
        formGroup.removeControl('string_pattern');
      }
    })
  }

  get urls(): FormArray {
    return this.otherDevicesForm.get('urls') as FormArray;
  }

  addMonitoringConfiguration() {
    const index = this.urls.length - 1;
    let formGroup = <FormGroup>this.urls.at(this.urls.length - 1);
    if (formGroup.invalid) {
      this.otherDevicesFormErrors.urls[index] = this.utilService.validateForm(formGroup, this.otherDevicesValidationMessages.urls, this.otherDevicesFormErrors.urls[index]);
      formGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.otherDevicesFormErrors.urls[index] = this.utilService.validateForm(formGroup, this.otherDevicesValidationMessages.urls, this.otherDevicesFormErrors.urls[index]);
        });
    } else {
      let fg = this.svc.buildUrls();
      this.otherDevicesFormErrors.urls.push(this.svc.getUrlFormErrors());
      this.handleSubscriptions(fg);
      this.urls.push(fg);
    }
  }

  removeUrl(index: number) {
    this.urls.removeAt(index);
    this.otherDevicesFormErrors.urls.splice(index, 1);
  }

  handleError(err: any) {
    this.otherDevicesFormErrors = this.svc.resetOtherDevicesFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.otherDevicesForm.controls) {
          this.otherDevicesFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmit() {
    this.caSvc.submit();
    if (this.otherDevicesForm.invalid || this.caSvc.isInvalid()) {
      this.otherDevicesFormErrors = this.utilService.validateForm(this.otherDevicesForm, this.otherDevicesValidationMessages, this.otherDevicesFormErrors);
      this.otherDevicesForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.otherDevicesFormErrors = this.utilService.validateForm(this.otherDevicesForm, this.otherDevicesValidationMessages, this.otherDevicesFormErrors);
        this.caSvc.submit();
      });
    } else {
      this.spinner.start('main');
      let obj = this.otherDevicesForm.getRawValue();
      const fd = Object.assign({}, obj, { polling_interval_min: obj.polling_interval_min ? obj.polling_interval_min : 0 }, { polling_interval_sec: obj.polling_interval_sec ? obj.polling_interval_sec : 0 }, { 'custom_attribute_data': this.caSvc.getFormData() });

      if (this.deviceId) {
        this.svc.updateDevice(fd, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Device updated successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.svc.add(fd).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Device created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        });
      }
    }
  }

  onDelete() {
    this.svc.deleteDevice(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Monitoring Device deleted successfully.'));
      this.goBack();
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }

  goBack() {
    if (this.deviceId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}