import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ZabbixOtherdeviceMonitoringConfigService } from './zabbix-otherdevice-monitoring-config.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLevelService } from 'src/app/app-level.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

@Component({
  selector: 'zabbix-otherdevice-monitoring-config',
  templateUrl: './zabbix-otherdevice-monitoring-config.component.html',
  styleUrls: ['./zabbix-otherdevice-monitoring-config.component.scss'],
  providers: [ZabbixOtherdeviceMonitoringConfigService]
})
export class ZabbixOtherdeviceMonitoringConfigComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceId: string;

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  nonFieldErr: string = '';
  instanceData: any;
  tagsAutocompleteItems: string[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  constructor(private svc: ZabbixOtherdeviceMonitoringConfigService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private builder: FormBuilder,
    private appService: AppLevelService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceid');
      this.getTags();
    });
  }

  ngOnInit(): void {
    this.getInstanceDetails()
    this.buildForm();
    this.getCollectors();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getInstanceDetails() {
    this.svc.getInstanceDetails(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.instanceData = res;
    }, err => {
      this.instanceData = null;
    });
  }

  getCollectors() {
    this.svc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  getTags() {
    this.tagsAutocompleteItems = [];
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  buildForm() {
    this.spinner.start('main');
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.formValidationMessages;
    this.svc.buildForm(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.get('urls') && res.get('urls').value && res.get('urls').value.length > 1) {
        for (var i = 1; i < res.get('urls').value.length; i++) {
          this.formErrors.urls.push(this.svc.resetUrlFormErrors());
        }
      }
      this.form = res;
      this.form.get('is_monitoring').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: boolean) => {
        if (val) {
          let fg = this.svc.buildUrlForm();
          this.formErrors.urls = [this.svc.resetUrlFormErrors()];
          this.form.addControl('urls', this.builder.array([fg]));
          this.handleSubscriptions(fg);
        } else {
          this.form.removeControl('urls');
        }
      });
      if (res.value.is_monitoring) {
        for (let i = 0; i < this.urls.length; i++) {
          let formGroup = <FormGroup>this.urls.at(i);
          this.handleSubscriptions(formGroup);
        }
      }
      this.spinner.stop('main');
    }, err => {
      this.form = null;
      this.spinner.stop('main');
    });
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
    return this.form.get("urls") as FormArray;
  }

  addURL() {
    const index = this.urls.length - 1;
    let formGroup = <FormGroup>this.urls.at(this.urls.length - 1);
    if (formGroup.invalid) {
      this.formErrors.urls[index] = this.utilService.validateForm(formGroup, this.formValidationMessages.urls, this.formErrors.urls[index]);
      formGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.formErrors.urls[index] = this.utilService.validateForm(formGroup, this.formValidationMessages.urls, this.formErrors.urls[index]);
        });
    } else {
      let fg = this.svc.buildUrlForm();
      this.formErrors.urls.push(this.svc.resetUrlFormErrors());
      this.handleSubscriptions(fg);
      this.urls.push(fg);
    }
  }

  removeURL(index: number) {
    this.urls.removeAt(index);
    this.formErrors.urls.splice(index, 1);
  }

  monitoringStatus(status: boolean) {
    this.spinner.start('main');
    let obj = Object.assign({}, this.form.getRawValue());
    this.svc.updateStatus(this.deviceId, status, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getInstanceDetails();
      this.spinner.stop('main');
      this.notification.success(new Notification('Status updated successfully.'));
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }

  statusChange(status: boolean) {
    this.spinner.start('main');
    let obj = Object.assign({}, this.form.getRawValue());
    this.svc.changeStatus(this.deviceId, status, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getInstanceDetails();
      this.spinner.stop('main');
      this.notification.success(new Notification('Status updated successfully.'));
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }

  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
        });
    } else {
      this.spinner.start('main');
      if (this.deviceId) {
        let obj = this.form.getRawValue();
        const fd = Object.assign({}, obj, { polling_interval_min: obj.polling_interval_min ? obj.polling_interval_min : 0 }, { polling_interval_sec: obj.polling_interval_sec ? obj.polling_interval_sec : 0 });
        this.svc.updateDevice(fd, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Other Device updated successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        let obj = this.form.getRawValue();
        const fd = Object.assign({}, obj, { polling_interval_min: obj.polling_interval_min ? obj.polling_interval_min : 0 }, { polling_interval_sec: obj.polling_interval_sec ? obj.polling_interval_sec : 0 });
        this.svc.createDevice(fd).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Other Device Created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route.parent });
  }

}