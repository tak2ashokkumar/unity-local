import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsincCiscoMerakiCrudService } from './usinc-cisco-meraki-crud.service';
import { Subject } from 'rxjs';
import { MerakiAccountType } from '../usinc-cisco-meraki.type';
import { FormGroup } from '@angular/forms';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UnityScheduleType } from 'src/app/shared/SharedEntityTypes/schedule.type';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'usinc-cisco-meraki-crud',
  templateUrl: './usinc-cisco-meraki-crud.component.html',
  styleUrls: ['./usinc-cisco-meraki-crud.component.scss'],
  providers: [UsincCiscoMerakiCrudService]
})
export class UsincCiscoMerakiCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  merakiId: string;
  merakiData: MerakiAccountType;
  nonFieldErr: string;

  accountDetailsForm: FormGroup;
  accountDetailsFormErrors: any;
  accountDetailsFormValidationMessages: any;
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  activeForm: string = 'accountDetailsForm';
  scheduleData: UnityScheduleType;
  isDevicesPage: boolean = false;

  constructor(private svc: UsincCiscoMerakiCrudService,
    private scheduleSvc: UnityScheduleService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.merakiId = params.get('merakiId');
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

  getDropdownData() {
    this.svc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
      if (this.merakiId) {
        this.getMerakiDetails();
      } else {
        this.manageActiveForm('accountDetailsForm');
      }
    }, (err: HttpErrorResponse) => {
      this.notification.success(new Notification('Unable to fetch Collector List'));
    })
  }

  getMerakiDetails() {
    this.svc.getMerakiDetails(this.merakiId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.merakiData = res;
      this.manageActiveForm('accountDetailsForm');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Unable to fetch Meraki Details'));
    })
  }

  manageActiveForm(formName?: string) {
    switch (formName) {
      case 'accountDetailsForm':
        this.buildAccountDetailsForm();
        this.activeForm = formName;
        if (this.merakiId) {
          this.buildScheduleForm();
        }
        break;
      default:
        if (!this.accountDetailsForm) {
          this.notification.warning(new Notification('Please fill in the Credentials and move to Schedule'));
          return;
        }
        if (this.accountDetailsForm.valid) {
          this.buildScheduleForm();
          this.activeForm = formName;
        } else {
          this.onSubmitAccountDetailsForm();
        }
        break;
    }
    this.spinner.stop('main');
  }

  buildAccountDetailsForm() {
    this.accountDetailsForm = this.svc.buildAccountDetailsForm(this.merakiData);
    this.accountDetailsFormErrors = this.svc.resetAccountDetailsFormErrors();
    this.accountDetailsFormValidationMessages = this.svc.accountDetailsValidationMessages;
  }

  onSubmitAccountDetailsForm() {
    if (this.accountDetailsForm.invalid) {
      this.accountDetailsFormErrors = this.utilService.validateForm(this.accountDetailsForm, this.accountDetailsFormValidationMessages, this.accountDetailsFormErrors);
      this.accountDetailsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.accountDetailsFormErrors = this.utilService.validateForm(this.accountDetailsForm, this.accountDetailsFormValidationMessages, this.accountDetailsFormErrors);
        });
    } else {
      this.spinner.start('main');
      this.nonFieldErr = '';
      this.manageActiveForm('scheduleForm');
    }
  }

  buildScheduleForm() {
    if (this.merakiData) {
      this.scheduleSvc.addOrEdit(this.merakiData?.schedule_meta);
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
    let obj = Object.assign({}, this.accountDetailsForm.getRawValue(), this.scheduleSvc.getFormValue(runNowFlag));
    this.svc.saveInstance(obj, this.merakiId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      if (this.merakiId) {
        this.notification.success(new Notification('Meraki account updated successfully'));
      } else {
        this.notification.success(new Notification('Meraki account added successfully.'));
      }
      this.goBack();
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    })
  }

  handleError(err: any) {
    this.accountDetailsFormErrors = this.svc.resetAccountDetailsFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.accountDetailsForm.controls) {
          this.activeForm = 'accountDetailsForm';
          this.accountDetailsFormErrors[field] = err[field][0];
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
    if (this.merakiId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }


}
