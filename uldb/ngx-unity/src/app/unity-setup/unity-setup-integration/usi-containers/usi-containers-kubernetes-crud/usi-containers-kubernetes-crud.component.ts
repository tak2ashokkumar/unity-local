import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { ContainerCloudOption, KubernetesIntegrationAccountType } from '../usi-containers.type';
import { UsiContainersKubernetesCrudService } from './usi-containers-kubernetes-crud.service';

@Component({
  selector: 'usi-containers-kubernetes-crud',
  templateUrl: './usi-containers-kubernetes-crud.component.html',
  styleUrls: ['./usi-containers-kubernetes-crud.component.scss'],
  providers: [UsiContainersKubernetesCrudService]
})
export class UsiContainersKubernetesCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  controllerId: string;
  kubernetesData: KubernetesIntegrationAccountType;
  nonFieldErr: string;

  accountDetailsForm: FormGroup;
  accountDetailsFormErrors: any;
  accountDetailsFormValidationMessages: any;
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  clouds: ContainerCloudOption[] = [];
  activeForm: string = 'accountDetailsForm';

  constructor(private svc: UsiContainersKubernetesCrudService,
    private scheduleSvc: UnityScheduleService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService,
    private utilService: AppUtilityService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.controllerId = params.get('controllerId');
    });
  }

  ngOnInit(): void {
    this.spinnerSvc.start('main');
    this.getDropdownData();
  }

  ngOnDestroy(): void {
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDropdownData() {
    forkJoin({
      collectors: this.svc.getCollectors(),
      clouds: this.svc.getClouds()
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res.collectors ? res.collectors : [];
      this.clouds = res.clouds ? res.clouds : [];
      if (this.controllerId) {
        this.getKubernetesDetails();
      } else {
        this.manageActiveForm('accountDetailsForm');
      }
    }, (err: HttpErrorResponse) => {
      this.spinnerSvc.stop('main');
      this.notificationSvc.error(new Notification('Unable to fetch dropdown data'));
    });
  }

  getKubernetesDetails() {
    this.svc.getKubernetesDetails(this.controllerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.kubernetesData = res;
      this.manageActiveForm('accountDetailsForm');
    }, (err: HttpErrorResponse) => {
      this.spinnerSvc.stop('main');
      this.notificationSvc.error(new Notification('Unable to fetch Kubernetes Details'));
    });
  }

  manageActiveForm(formName?: string) {
    switch (formName) {
      case 'accountDetailsForm':
        this.buildAccountDetailsForm();
        this.activeForm = formName;
        if (this.controllerId) {
          this.buildScheduleForm();
        }
        break;
      default:
        if (!this.accountDetailsForm) {
          this.notificationSvc.warning(new Notification('Please fill in the Account Details and move to Schedule'));
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
    this.spinnerSvc.stop('main');
  }

  buildAccountDetailsForm() {
    this.accountDetailsForm = this.svc.buildAccountDetailsForm(this.kubernetesData);
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
      this.spinnerSvc.start('main');
      this.nonFieldErr = '';
      this.manageActiveForm('scheduleForm');
    }
  }

  buildScheduleForm() {
    if (this.kubernetesData) {
      this.scheduleSvc.addOrEdit(this.kubernetesData?.schedule_meta);
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
    this.spinnerSvc.start('main');
    let obj = Object.assign({}, this.accountDetailsForm.getRawValue(), this.scheduleSvc.getFormValue(runNowFlag));
    this.svc.saveInstance(obj, this.controllerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinnerSvc.stop('main');
      if (this.controllerId) {
        this.notificationSvc.success(new Notification('Kubernetes account updated successfully'));
      } else {
        this.notificationSvc.success(new Notification('Kubernetes account added successfully.'));
      }
      this.goBack();
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }

  handleError(err: any) {
    this.accountDetailsFormErrors = this.svc.resetAccountDetailsFormErrors();
    if (!err) {
      this.notificationSvc.error(new Notification('Something went wrong!! Please try again.'));
      this.spinnerSvc.stop('main');
      return;
    }
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else {
      for (const field in err) {
        if (field in this.accountDetailsForm.controls) {
          this.activeForm = 'accountDetailsForm';
          this.accountDetailsFormErrors[field] = err[field][0];
        } else {
          this.scheduleSvc.handleError(err);
        }
      }
    }
    this.spinnerSvc.stop('main');
  }

  goBack() {
    if (this.controllerId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
