import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { UsiVaultsCrudService } from './usi-vaults-crud.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { CyberarcItem } from '../usi-vaults-cyberarc.type';

@Component({
  selector: 'usi-vaults-crud',
  templateUrl: './usi-vaults-crud.component.html',
  styleUrls: ['./usi-vaults-crud.component.scss'],
  providers: [UsiVaultsCrudService]
})
export class UsiVaultsCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  instanceId: string;
  viewData: CyberarcItem = null;

  actionMessage: 'Create' | 'Edit';
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  activeForm: string = 'vaultsConfigForm';
  nonFieldErr: string = '';
  vaultsConfigForm: FormGroup;
  vaultsConfigFormErrors: any;
  vaultsConfigFormValidationMessages: any;

  constructor(private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private router: Router,
    private route: ActivatedRoute,
    private crudSvc: UsiVaultsCrudService, private scheduleSvc: UnityScheduleService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.instanceId = params.get('vaultId');
      this.actionMessage = this.instanceId ? 'Edit' : 'Create';
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getDropdownData()
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDropdownData() {
    this.crudSvc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.collectors = res;
      } else {
        this.collectors = [];
        this.notification.error(new Notification('Failed to fetch Collectors'));
      }

      if (this.instanceId) {
        this.getVaultDetails();
      } else {
        this.manageActiveForm('vaultsConfigForm');
      }
    }, (err: HttpErrorResponse) => {
      this.notification.success(new Notification('Unable to fetch Dropdowns data'));
    })
  }

  getVaultDetails() {
    this.crudSvc.getVaultDetails(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = res;
      this.manageActiveForm('vaultsConfigForm');
    }, (err: HttpErrorResponse) => {
      this.viewData = null;
    })
  }

  manageActiveForm(formName?: string) {
    switch (formName) {
      case 'vaultsConfigForm':
        this.buildVaultConfigForm();
        this.activeForm = formName;
        break;
      default:
        if (!this.vaultsConfigForm) {
          this.notification.warning(new Notification('Please fill in the Vault Config Details and move to Rotate Password'));
          return;
        }
        if (this.vaultsConfigForm.valid) {
          this.buildScheduleForm();
          this.activeForm = formName;
        } else {
          this.onSubmitAccountDetailsForm();
        }
        break;
    }
    this.spinner.stop('main');
  }

  buildVaultConfigForm() {
    this.vaultsConfigForm = this.crudSvc.buildVaultConfigurationForm(this.viewData);
    this.vaultsConfigFormErrors = this.crudSvc.resetVaultConfigurationFormErrors();
    this.vaultsConfigFormValidationMessages = this.crudSvc.vaultConfigurationValidationMessages;
  }

  onSubmitAccountDetailsForm() {
    if (this.vaultsConfigForm.invalid) {
      this.vaultsConfigFormErrors = this.utilService.validateForm(this.vaultsConfigForm, this.vaultsConfigFormValidationMessages, this.vaultsConfigFormErrors);
      this.vaultsConfigForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.vaultsConfigFormErrors = this.utilService.validateForm(this.vaultsConfigForm, this.vaultsConfigFormValidationMessages, this.vaultsConfigFormErrors);
      });
    } else {
      this.spinner.start('main');
      let obj = Object.assign({}, this.vaultsConfigForm.getRawValue());
      this.nonFieldErr = '';
      if (this.instanceId) {
        this.crudSvc.saveVaultConfig(obj, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.viewData = res;
          this.notification.success(new Notification('CyberArk Vault updated successfully.'));
          this.spinner.stop('main');
          this.manageActiveForm('rotatePasswordForm');
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        })
      } else {
        this.crudSvc.saveVaultConfig(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.viewData = res;
          this.notification.success(new Notification('CyberArk Vault created successfully.'));
          this.manageActiveForm('rotatePasswordForm');
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        })
      }
    }
  }

  buildScheduleForm() {
    if (this.instanceId) {
      this.scheduleSvc.addOrEdit(this.viewData.schedule_meta);
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

  onSubmit(runNowFlag: boolean) {
    this.spinner.start('main');
    let obj = Object.assign({}, this.scheduleSvc.getFormValue(runNowFlag));
    if (this.instanceId) {
      this.crudSvc.editRotatePassword(obj, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        // this.notification.success(new Notification('Rotate Password updated successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    } else {
      this.crudSvc.saveRotatePassword(obj, this.viewData.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        // this.notification.success(new Notification('Schredule Rotate Password created successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  handleError(err: any) {
    this.vaultsConfigFormErrors = this.crudSvc.resetVaultConfigurationFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.vaultsConfigForm.controls) {
          this.activeForm = 'vaultsConfigForm';
          this.vaultsConfigFormErrors[field] = err[field][0];
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
    if (this.instanceId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
