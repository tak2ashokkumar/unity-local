import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { isString } from 'lodash-es';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { BMCHelixInstance } from '../usi-bmc-helix.type';
import { UsiBmcHelixCrudService } from './usi-bmc-helix-crud.service';

@Component({
  selector: 'usi-bmc-helix-crud',
  templateUrl: './usi-bmc-helix-crud.component.html',
  styleUrls: ['./usi-bmc-helix-crud.component.scss']
})
export class UsiBmcHelixCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  subscr: Subscription;
  instanceId: string;
  instanceData: BMCHelixInstance;

  integrationForm: FormGroup;
  integrationFormErrors: any;
  integrationFormValidationMessages: any;
  activeForm: string = 'integrationForm';
  nonFieldErr: string = '';

  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  constructor(private svc: UsiBmcHelixCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private builder: FormBuilder,
    private scheduleSvc: UnityScheduleService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.instanceId = params.get('id');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    if (this.instanceId) {
      this.getInstanceDetails();
    } else {
      this.manageActiveForm('integrationForm');
    }
    this.getCollectors();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // Metadata
  getInstanceDetails() {
    this.svc.getInstanceDetails(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.instanceData = res;
      this.manageActiveForm('integrationForm');
    }, err => {
      this.instanceData = null;
      this.manageActiveForm('integrationForm');
    });
  }

  getCollectors() {
    this.svc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    }, err => {
      this.collectors = [];
    });
  }

  //---------------------------------Manage Active Form-------------------------------------
  manageActiveForm(formName: string) {
    switch (formName) {
      case 'integrationForm':
        if (this.instanceId && this.instanceData) {
          this.buildIntegrationForm(this.instanceData);
        } else {
          this.buildIntegrationForm();
        }
        this.activeForm = formName;
        break;
      case 'scheduleForm':
        if ((this.instanceId || this.instanceData?.uuid) && this.integrationForm.value.is_inbound) {
          this.activeForm = formName;
          this.buildScheduleForm();
        } else {
          // if (!this.configurationForm) {
          //   this.notification.warning(new Notification('Please fill in the Integration, Configuration and move to Inbound Schedule'));
          //   return;
          // }
          // if (this.configurationForm.invalid) {
          //   this.buildConfigurationForm();
          // }
        }
        break;
      default:
        this.activeForm = formName;
        this.spinner.stop('main');
        break;
    }
    this.spinner.stop('main');
  }

  manageForm(formName: string) {
    const integrationFormObj = this.integrationForm.getRawValue();
    if ((formName == 'configurationForm' && integrationFormObj.is_cmdb) || (formName == 'scheduleForm' && integrationFormObj.is_inbound)) {
      this.manageActiveForm(formName);
    }
    return;
  }

  //---------------------------------Manage Active Form End-------------------------------------


  //---------------------------------Integration Form-------------------------------------
  buildIntegrationForm(instance?: any) {
    this.nonFieldErr = '';
    this.integrationForm = this.svc.buildIntegrationForm(instance);
    this.integrationFormErrors = this.svc.resetIntegrationFormErrors();
    this.integrationFormValidationMessages = this.svc.integrationFormValidationMessages;
    this.integrationForm.get('is_itsm').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val) {
        this.integrationForm.addControl('itsm_url', new FormControl('', [Validators.required, RxwebValidators.url()]));
      } else {
        this.integrationForm.removeControl('itsm_url');
      }
    });
    this.integrationForm.get('is_workflow').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val) {
        this.integrationForm.addControl('workflow_url', new FormControl('', [Validators.required, RxwebValidators.url()]));
      } else {
        this.integrationForm.removeControl('workflow_url');
      }
    });
    this.integrationForm.get('is_cmdb').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val) {
        this.integrationForm.addControl('is_inbound', new FormControl(false));
        this.integrationForm.addControl('is_outbound', new FormControl(true));
        this.integrationForm.addControl('cmdb_url', new FormControl('', [Validators.required, RxwebValidators.url()]));
        this.integrationForm.addControl('url_type', new FormControl('public'))
        this.integrationForm.addControl('collector_proxy', new FormControl(false))
        this.integrationForm.addControl('collector', this.builder.group({
          uuid: [null]
        }));
        this.integrationForm.get('url_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
          if (value === 'public') {
            this.integrationForm.get('collector')?.get('uuid')?.setValue(null);
            this.integrationForm.get('collector')?.get('uuid')?.clearValidators();
            this.integrationForm.get('collector')?.get('uuid')?.updateValueAndValidity();
          } else if (value === 'private') {
            this.integrationForm.get('collector')?.get('uuid')?.setValue('');
            this.integrationForm.get('collector')?.get('uuid')?.setValidators([Validators.required]);
            this.integrationForm.get('collector')?.get('uuid')?.updateValueAndValidity();
          }
          this.integrationForm.get('collector_proxy')?.setValue(value === 'private');
        });
      } else {
        this.integrationForm.removeControl('is_inbound');
        this.integrationForm.removeControl('is_outbound');
        this.integrationForm.removeControl('cmdb_url');
        this.integrationForm.removeControl('url_type');
        this.integrationForm.removeControl('collector_proxy');
        this.integrationForm.removeControl('collector');
        this.integrationForm.get('allow_cmdb_delete').setValue(false);
      }
    });
    if (instance?.is_cmdb) {
      this.integrationForm.get('url_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
        if (value === 'public') {
          this.integrationForm.get('collector')?.get('uuid')?.setValue(null);
          this.integrationForm.get('collector')?.get('uuid')?.clearValidators();
          this.integrationForm.get('collector')?.get('uuid')?.updateValueAndValidity();
        } else if (value === 'private') {
          this.integrationForm.get('collector')?.get('uuid')?.setValue('');
          this.integrationForm.get('collector')?.get('uuid')?.setValidators([Validators.required]);
          this.integrationForm.get('collector')?.get('uuid')?.updateValueAndValidity();
        }
        this.integrationForm.get('collector_proxy')?.setValue(value === 'private');
      });
    }
  }

  onSubmitIntegrationForm() {
    if (this.integrationForm.invalid) {
      this.integrationFormErrors = this.utilService.validateForm(this.integrationForm, this.integrationFormValidationMessages, this.integrationFormErrors);
      if (this.integrationForm.errors && this.integrationForm.errors.atLeastOneRequired) {
        this.integrationFormErrors.account_for = 'Atleast one of ITSM, Workflow or CMDB should be selected';
      }
      this.integrationForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.integrationFormErrors = this.utilService.validateForm(this.integrationForm, this.integrationFormValidationMessages, this.integrationFormErrors);
        if (this.integrationForm.errors && this.integrationForm.errors.atLeastOneRequired) {
          this.integrationFormErrors.account_for = 'Atleast one of ITSM, Workflow or CMDB should be selected';
        }
      });
      return;
    } else {
      this.spinner.start('main');
      let obj = Object.assign({}, <any>this.integrationForm.getRawValue());
      if (this.instanceId) {
        this.svc.saveIntegrationForm(obj, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.notification.success(new Notification('BMC Helix account updated successfully.'));
          this.instanceData = res;
          if (obj.is_cmdb) {
            // this.getRelationshipTypes(this.instanceData.uuid);
            this.manageActiveForm('configurationForm');
          } else {
            this.goBack();
            this.spinner.stop('main');
          }
        }, (err: HttpErrorResponse) => {
          this.handleIntegrtionFormErrors(err.error);
        });
      } else {
        this.svc.saveIntegrationForm(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.notification.success(new Notification('BMC Helix account added successfully.'));
          this.instanceData = res;
          if (obj.is_cmdb) {
            // this.getRelationshipTypes(this.instanceData.uuid);
            this.manageActiveForm('configurationForm');
          } else {
            this.goBack();
            this.spinner.stop('main');
          }
        }, (err: HttpErrorResponse) => {
          this.handleIntegrtionFormErrors(err.error);
        });
      }
    }
  }

  handleIntegrtionFormErrors(err: any) {
    this.integrationFormErrors = this.svc.resetIntegrationFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.integrationForm.controls) {
          this.integrationFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }
  //---------------------------------Integration form end -------------------------------------

  // --------------------------------ConfigForm Start ---------------------------------------

  onSubmitConfigurationForm() {
    if (<BMCHelixInstance>this.integrationForm.getRawValue().is_inbound) {
      this.manageActiveForm('scheduleForm');
    } else {
      this.goBack();
    }
  }

  // --------------------------------ConfigForm End ---------------------------------------

  //---------------------------------Schedule Form-----------------------------------------------

  buildScheduleForm() {
    this.nonFieldErr = '';
    if (this.instanceId) {
      this.scheduleSvc.addOrEdit(this.instanceData.schedule_meta);
    } else {
      this.scheduleSvc.addOrEdit(null);
    }
  }

  onSubmitScheduleForm(runNowFlag: boolean) {
    this.scheduleSvc.submit();
    if (this.scheduleSvc.form.invalid) {
      return;
    } else {
      this.saveScheduleForm(runNowFlag);
    }
  }

  saveScheduleForm(runNowFlag: boolean) {
    this.spinner.start('main');
    const obj = Object.assign({}, this.scheduleSvc.getFormValue(runNowFlag));
    const instanceId = this.instanceId ? this.instanceId : this.instanceData ? this.instanceData.uuid : null;
    this.svc.saveScheduleForm(obj, instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notification.success(new Notification('BMC Helix account inbound schedule successfully'));
      this.spinner.stop('main');
      this.goBack();
    }, (err: HttpErrorResponse) => {
      this.handleScheduleFormErrors(err.error);
    })
  }

  handleScheduleFormErrors(err: any) {
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      this.scheduleSvc.handleError(err);
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  //---------------------------------Schedule Form end-----------------------------------------------

  goBack() {
    if (this.instanceId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  /*
  * This is a test method to move to config page without validating Integration form.
  * This will be used only while debugging of CMDB config form
  */
  moveToConfigForm() {
    this.activeForm = 'configurationForm';
  }

}
