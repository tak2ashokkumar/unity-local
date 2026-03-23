import { Component, OnDestroy, OnInit } from '@angular/core';
import { privateCloudPlatformType, privateCloudPlatformTypes, UsioVeeamCrudService } from './usio-veeam-crud.service';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

@Component({
  selector: 'usio-veeam-crud',
  templateUrl: './usio-veeam-crud.component.html',
  styleUrls: ['./usio-veeam-crud.component.scss'],
  providers: [UsioVeeamCrudService]
})
export class UsioVeeamCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  actionMessage: 'Create' | 'Edit';
  veeamId: string;
  veeamData: any;
  privateCloudPlatFormTypes = privateCloudPlatformTypes;
  privateCloudList = [];
  platformTypeEditValue: privateCloudPlatformType;

  credentialForm: FormGroup;
  credentialFormErrors: any;
  credentialFormValidationMessages: any;
  credentialFormData: any;

  activeForm: string = 'credentialForm';
  nonFieldErr: string = '';
  scheduleFormData: any;

  isNotifactionRequired: boolean = false;
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];  

  constructor(private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private router: Router,
    private route: ActivatedRoute,
    private scheduleSvc: UnityScheduleService,
    private crudSvc: UsioVeeamCrudService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.veeamId = params.get('veeamId');
      this.actionMessage = this.veeamId ? 'Edit' : 'Create';
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getCollectors();
    if (this.veeamId) {
      this.getVeeamDetails();
    } else {
      this.manageActiveForm();
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getPrivateClouds(platformType: string) {
    this.crudSvc.getPrivateClouds(platformType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.privateCloudList = res;
    }, (err: HttpErrorResponse) => {
      this.privateCloudList = [];
    })
  }

  getVeeamDetails() {
    this.crudSvc.getVeeamDetails(this.veeamId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.veeamData = res;
      this.getPrivateCloudsInEditCase();
    }, (err: HttpErrorResponse) => {
      this.veeamData = null;
    })
  }

  getPrivateCloudsInEditCase() {
    this.crudSvc.getPrivateClouds(this.veeamData.platform_type).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.privateCloudList = res;
      this.manageActiveForm();
    }, (err: HttpErrorResponse) => {
      this.privateCloudList = [];
      this.manageActiveForm();
    })
  }

  getCollectors() {
    this.crudSvc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  manageActiveForm(formName?: string) {
    switch (formName) {
      case 'credentialForm':
        this.activeForm = formName;
        break;
      case 'scheduleForm':
        if (this.credentialForm && this.credentialForm.valid) {
          this.activeForm = formName;
          this.buildScheduleForm();
        } else {
          this.onSubmitCredentialForm();
        }
        break;
      default:
        this.activeForm = 'credentialForm';
        this.buildCredentialsForm();
        if (this.veeamId) {
          this.buildScheduleForm();
        }
    }
    this.spinner.stop('main');
  }

  buildCredentialsForm() {
    this.credentialForm = this.crudSvc.buildCredentialForm(this.veeamData);
    this.credentialFormErrors = this.crudSvc.resetCredentialFormErrors();
    this.credentialFormValidationMessages = this.crudSvc.credentialFormValidationMessages;
    this.credentialFormData = this.credentialForm.getRawValue();
    if (this.veeamData) {
      this.platformTypeEditValue = this.privateCloudPlatFormTypes.find(pc => pc.text == this.veeamData.platform_type);
    }
  }

  getDropdownValue(event: privateCloudPlatformType) {
    this.credentialForm.get('platform_type').setValue(event.text);
    this.privateCloudList = [];
    this.credentialForm.get('private_cloud').setValue('');
    this.getPrivateClouds(event.text);
  }

  onSubmitCredentialForm() {
    if (this.credentialForm.invalid) {
      this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
      this.credentialForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
      });
    } else {
      this.manageActiveForm('scheduleForm');
    }
  }

  buildScheduleForm() {
    if (this.veeamId) {
      this.scheduleSvc.addOrEdit(this.veeamData.schedule_meta);
    } else {
      this.scheduleSvc.addOrEdit(null);
    }
  }

  onSubmitScheduleForm(runNowFlag: boolean) {
    this.scheduleSvc.submit();
    if (this.scheduleSvc.form.invalid) {
      return;
    } else {
      this.onSubmit(runNowFlag);
    }
  }

  handleError(err: any) {
    this.credentialFormErrors = this.crudSvc.resetCredentialFormErrors();
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

  onSubmit(runNowFlag: boolean) {
    this.spinner.start('main');
    let obj = Object.assign({}, this.credentialForm.getRawValue(), this.scheduleSvc.getFormValue(runNowFlag));
    if (this.veeamId) {
      this.crudSvc.editVeeam(this.veeamId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('Veeam updated successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    } else {
      this.crudSvc.createVeeam(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('Veeam created successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  goBack() {
    if (this.veeamId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
