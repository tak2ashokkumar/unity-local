import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsioSdwanCrudService } from './usio-sdwan-crud.service';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { UnityScheduleType } from 'src/app/shared/SharedEntityTypes/schedule.type';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { SdWanAccountDetails } from './usio-sdwan.type';

@Component({
  selector: 'usio-sdwan-crud',
  templateUrl: './usio-sdwan-crud.component.html',
  styleUrls: ['./usio-sdwan-crud.component.scss'],
  providers: [UsioSdwanCrudService]
})
export class UsioSdwanCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  sdwanId: string;
  sdwanData: SdWanAccountDetails;
  nonFieldErr: string;

  credentialForm: FormGroup;
  credentialFormErrors: any;
  credentialFormValidationMessages: any;
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  activeForm: string = 'credentialForm';
  scheduleData: UnityScheduleType;

  isDevicesPage: boolean = false;

  constructor(private svc: UsioSdwanCrudService,
    private scheduleSvc: UnityScheduleService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.sdwanId = params.get('sdwanId');
    })
  }

  ngOnInit(): void {
    this.spinner.start('main');
    if (this.router.url.includes('devices')) {
      this.isDevicesPage = true;
    }
    this.getDropdownData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getSdwanDetails() {
    this.svc.getSdWanDetails(this.sdwanId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.sdwanData = res;
      this.manageActiveForm('credentialForm');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Unable to fetch SdWan Details'));
    })
  }

  getDropdownData() {
    this.svc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
      if (this.sdwanId) {
        this.getSdwanDetails();
      } else {
        this.manageActiveForm('credentialForm');
      }
    }, (err: HttpErrorResponse) => {
      this.notification.success(new Notification('Unable to fetch Collector List'));
    })
  }

  manageActiveForm(formName?: string) {
    switch (formName) {
      case 'credentialForm':
        this.buildCredentialsForm();
        this.activeForm = formName;
        if (this.sdwanId) {
          this.buildScheduleForm();
        }
        break;
      default:
        if (!this.credentialForm) {
          this.notification.warning(new Notification('Please fill in the Credentials and move to Schedule'));
          return;
        }
        if (this.credentialForm.valid) {
          this.buildScheduleForm();
          this.activeForm = formName;
        } else {
          this.onSubmitCredentialForm();
        }
        break;
    }
    this.spinner.stop('main');
  }

  buildCredentialsForm() {
    this.credentialForm = this.svc.buildCredentialForm(this.sdwanData);
    this.credentialFormErrors = this.svc.resetCredentialFormErrors();
    this.credentialFormValidationMessages = this.svc.credentialFormValidationMessages;
  }

  onSubmitCredentialForm() {
    if (this.credentialForm.invalid) {
      this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
      this.credentialForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
        });
    } else {
      this.spinner.start('main');
      this.nonFieldErr = '';
      this.manageActiveForm('scheduleForm');
    }
  }

  buildScheduleForm() {
    if (this.sdwanData) {
      this.scheduleSvc.addOrEdit(this.sdwanData?.schedule_meta);
    } else {
      this.scheduleSvc.addOrEdit(null);
    }
  }

  onSubmitScheduleForm(runNowFlag: boolean) {
    this.scheduleSvc.submit();
    if (this.scheduleSvc.form.invalid) {
      return;
    } else {
      this.saveInstance(runNowFlag);
    }
  }

  saveInstance(runNowFlag: boolean) {
    this.spinner.start('main');
    let obj = Object.assign({}, this.credentialForm.getRawValue(), this.scheduleSvc.getFormValue(runNowFlag));
    this.svc.saveInstance(obj, this.sdwanId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      if (this.sdwanId) {
        this.notification.success(new Notification('SdWan account details updated successfully'));
      } else {
        this.notification.success(new Notification('SdWan account added successfully.'));
      }
      this.goBack();
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    })
  }

  handleError(err: any) {
    this.credentialFormErrors = this.svc.resetCredentialFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.credentialForm.controls) {
          this.activeForm = 'credentialForm';
          this.credentialFormErrors[field] = err[field][0];
        } else {
          this.scheduleSvc.handleError(err);
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  goBack() {
    if (this.sdwanId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
