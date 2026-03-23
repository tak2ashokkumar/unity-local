import { Component, OnInit } from '@angular/core';
import { UsincViptelaCrudService } from './usinc-viptela-crud.service';
import { Subject } from 'rxjs';
import { ViptelaAccountType } from '../usinc-viptela.type';
import { FormGroup } from '@angular/forms';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UnityScheduleType } from 'src/app/shared/SharedEntityTypes/schedule.type';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'usinc-viptela-crud',
  templateUrl: './usinc-viptela-crud.component.html',
  styleUrls: ['./usinc-viptela-crud.component.scss'],
  providers: [UsincViptelaCrudService]
})
export class UsincViptelaCrudComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  viptelaId: string;
  viptelaData: ViptelaAccountType;
  nonFieldErr: string;

  accountDetailsForm: FormGroup;
  accountDetailsFormErrors: any;
  accountDetailsFormValidationMessages: any;
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  activeForm: string = 'accountDetailsForm';
  scheduleData: UnityScheduleType;

  isDevicesPage: boolean = false;
  constructor(private svc: UsincViptelaCrudService,
    private scheduleSvc: UnityScheduleService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.viptelaId = params.get('viptelaId');
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

  getViptelaDetails() {
    this.svc.getViptelaDetails(this.viptelaId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viptelaData = res;
      this.manageActiveForm('accountDetailsForm');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Unable to fetch Viptela Details'));
    })
  }

  getDropdownData() {
    this.svc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
      if (this.viptelaId) {
        this.getViptelaDetails();
      } else {
        this.manageActiveForm('accountDetailsForm');
      }
    }, (err: HttpErrorResponse) => {
      this.notification.success(new Notification('Unable to fetch Collector List'));
    })
  }

  manageActiveForm(formName?: string) {
    switch (formName) {
      case 'accountDetailsForm':
        this.buildAccountDetailsForm();
        this.activeForm = formName;
        if (this.viptelaId) {
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
    this.accountDetailsForm = this.svc.buildAccountDetailsForm(this.viptelaData);
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
    if (this.viptelaData) {
      this.scheduleSvc.addOrEdit(this.viptelaData?.schedule_meta);
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
    this.svc.saveInstance(obj, this.viptelaId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      if (this.viptelaId) {
        this.notification.success(new Notification('Viptela account updated successfully'));
      } else {
        this.notification.success(new Notification('Viptela account added successfully.'));
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
    if (this.viptelaId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
