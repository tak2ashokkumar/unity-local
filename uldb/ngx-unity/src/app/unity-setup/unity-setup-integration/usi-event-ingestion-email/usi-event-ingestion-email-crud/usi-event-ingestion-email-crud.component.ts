import { Component, OnDestroy, OnInit } from '@angular/core';
import { AccountTypesList, UsiEventIngestionEmailCrudService } from './usi-event-ingestion-email-crud.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { UsiEventIngestionParams } from '../../unity-setup-integration.service';
import { EmailType } from '../usi-event-ingestion-email.type';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'usi-event-ingestion-email-crud',
  templateUrl: './usi-event-ingestion-email-crud.component.html',
  styleUrls: ['./usi-event-ingestion-email-crud.component.scss'],
  providers: [UsiEventIngestionEmailCrudService]
})
export class UsiEventIngestionEmailCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  instanceId: string;
  actionMessage: 'Create' | 'Edit';

  accountTypesList: LabelValueType[] = AccountTypesList;
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  paramList: Array<UsiEventIngestionParams> = [];
  emailData: EmailType;

  activeForm: string = 'accountDetailsForm';

  nonFieldErr: string = '';
  accountDetailsForm: FormGroup;
  accountDetailsFormErrors: any;
  accountDetailsFormValidationMessages: any;

  eventIngestionForm: FormGroup;
  eventIngestionFormErrors: any;
  eventIngestionFormValidationMessages: any;

  constructor(private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private router: Router,
    private route: ActivatedRoute,
    private crudSvc: UsiEventIngestionEmailCrudService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.instanceId = params.get('instanceId');
      this.actionMessage = this.instanceId ? 'Edit' : 'Create';
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getDropdownData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getEmailDetails() {
    this.crudSvc.getEmailDetails(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.emailData = res;
      this.manageActiveForm('accountDetailsForm');
    }, (err: HttpErrorResponse) => {
      this.emailData = null;
    })
  }

  getDropdownData() {
    this.crudSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.colletorsList) {
        this.collectors = res.colletorsList;
      } else {
        this.collectors = [];
        // this.notification.error(new Notification('Failed to fetch Collectors'));
      }

      if (res.paramsList) {
        this.paramList = res.paramsList.meta_data;
      } else {
        this.paramList = [];
        // this.notification.error(new Notification('Failed to fetch Param List'));
      }

      if (this.instanceId) {
        this.getEmailDetails();
      } else {
        this.manageActiveForm('accountDetailsForm');
      }
    }, (err: HttpErrorResponse) => {
      this.notification.success(new Notification('Unable to fetch Dropdowns data'));
    })
  }

  manageActiveForm(formName?: string) {
    switch (formName) {
      case 'accountDetailsForm':
        this.buildAccountDetailsForm();
        this.activeForm = formName;
        break;
      default:
        if (!this.accountDetailsForm) {
          this.notification.warning(new Notification('Please fill in the Account Details and move to Configuration'));
          return;
        }
        if (this.accountDetailsForm.valid) {
          this.activeForm = formName;
        } else {
          this.onSubmitAccountDetailsForm();
        }
        break;
    }
    this.spinner.stop('main');
  }

  buildAccountDetailsForm() {
    this.accountDetailsForm = this.crudSvc.buildAccountDetailsForm(this.emailData);
    this.accountDetailsFormErrors = this.crudSvc.resetAccountDetailsFormErrors();
    this.accountDetailsFormValidationMessages = this.crudSvc.accountDetailsValidationMessages;
    this.accountDetailsForm.get('account_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((type) => {
      this.manageAccountTypeChanges(type);
    })
  }

  manageAccountTypeChanges(type: string) {
    if (type == 'Gmail') {
      this.accountDetailsForm.get('tenant_id') ? this.accountDetailsForm.removeControl('tenant_id') : null;
      this.accountDetailsForm.get('client_id') ? this.accountDetailsForm.get('client_id').setValue('') : this.accountDetailsForm.addControl('client_id', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      this.accountDetailsForm.get('client_secret') ? this.accountDetailsForm.get('client_secret').setValue('') : this.accountDetailsForm.addControl('client_secret', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      this.accountDetailsForm.get('topic_name') ? null : this.accountDetailsForm.addControl('topic_name', new FormControl('', [Validators.required, NoWhitespaceValidator]));
    } else {
      this.accountDetailsForm.get('topic_name') ? this.accountDetailsForm.removeControl('topic_name') : null;
      this.accountDetailsForm.get('client_id') ? this.accountDetailsForm.get('client_id').setValue('') : this.accountDetailsForm.addControl('client_id', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      this.accountDetailsForm.get('client_secret') ? this.accountDetailsForm.get('client_secret').setValue('') : this.accountDetailsForm.addControl('client_secret', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      this.accountDetailsForm.get('tenant_id') ? null : this.accountDetailsForm.addControl('tenant_id', new FormControl('', [Validators.required, NoWhitespaceValidator]));
    }
  }

  onSubmitAccountDetailsForm() {
    if (this.accountDetailsForm.invalid) {
      this.accountDetailsFormErrors = this.utilService.validateForm(this.accountDetailsForm, this.accountDetailsFormValidationMessages, this.accountDetailsFormErrors);
      this.accountDetailsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.accountDetailsFormErrors = this.utilService.validateForm(this.accountDetailsForm, this.accountDetailsFormValidationMessages, this.accountDetailsFormErrors);
      });
    } else {
      this.spinner.start('main');
      this.nonFieldErr = '';
      this.manageActiveForm('configurationForm');
    }
  }

  get additionalAttribute() {
    return (this.eventIngestionForm.get('event_inbound_webhook.additional_attribute') as FormGroup);
  }

  onFormUpdate(event: { form: FormGroup, formErrors: any, formValidationMessages: any }) {
    this.eventIngestionForm = event.form;
    this.eventIngestionFormErrors = event.formErrors;
    this.eventIngestionFormValidationMessages = event.formValidationMessages;
    // Now you have the updated form in the parent component
  }

  onSubmit() {
    let isValid: boolean = true;
    // if (this.accountDetailsForm.invalid) {
    //   this.accountDetailsFormErrors = this.utilService.validateForm(this.accountDetailsForm, this.accountDetailsFormValidationMessages, this.accountDetailsFormErrors);
    //   this.accountDetailsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
    //     this.accountDetailsFormErrors = this.utilService.validateForm(this.accountDetailsForm, this.accountDetailsFormValidationMessages, this.accountDetailsFormErrors);
    //   });
    //   isValid = false;
    // }
    if (this.eventIngestionForm) {
      this.additionalAttribute.get('unity_attribute').removeValidators([Validators.required]);
      this.additionalAttribute.get('unity_attribute').updateValueAndValidity();
      if (this.additionalAttribute.get('unity_attribute').value) {
        this.additionalAttribute.get('mapped_attribute_expression').removeValidators([Validators.required]);
        this.additionalAttribute.get('mapped_attribute_expression').updateValueAndValidity();
      }
      if (this.eventIngestionForm.invalid) {
        this.eventIngestionFormErrors = this.utilService.validateForm(this.eventIngestionForm, this.eventIngestionFormValidationMessages, this.eventIngestionFormErrors)
        this.eventIngestionForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.eventIngestionFormErrors = this.utilService.validateForm(this.eventIngestionForm, this.eventIngestionFormValidationMessages, this.eventIngestionFormErrors)
        });
        isValid = false;
      }
    }
    if (isValid) {
      this.submitData();
    }
    //  else {
    //   this.notification.warning(new Notification('Please fill in the Account details and then move to Configuration'));
    // }
  }

  handleError(err: any) {
    this.accountDetailsFormErrors = this.crudSvc.resetAccountDetailsFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.accountDetailsForm.controls) {
          this.activeForm = 'accountDetailsForm';
          this.accountDetailsFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  submitData() {
    this.spinner.start('main');
    let obj = Object.assign({}, this.accountDetailsForm.getRawValue());
    if (this.eventIngestionForm) {
      let eventIngestionFormData = Object.assign({}, this.eventIngestionForm.getRawValue());
      eventIngestionFormData.event_inbound_webhook.attribute_map = eventIngestionFormData.event_inbound_webhook.attribute_map.concat(eventIngestionFormData.event_inbound_webhook.additional_attribute_map);
      delete eventIngestionFormData.event_inbound_webhook.additional_attribute;
      delete eventIngestionFormData.event_inbound_webhook.additional_attribute_map;
      eventIngestionFormData.event_inbound_webhook.attribute_map.forEach((att, index) => {
        eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression = eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression ? eventIngestionFormData.event_inbound_webhook.attribute_map[index].regular_expression : null;
        delete eventIngestionFormData.event_inbound_webhook.attribute_map[index].display_name;
        eventIngestionFormData.event_inbound_webhook.attribute_map[index].choice_map.forEach((ch, choiceIndex) => {
          delete eventIngestionFormData.event_inbound_webhook.attribute_map[index].choice_map[choiceIndex].display_value;
        })
      });
      obj = Object.assign({}, obj, eventIngestionFormData);
    } else {
      obj = Object.assign({}, obj, { 'event_inbound_webhook': null, 'event_inbound_api': null });
    }

    /** opening the returned auth url in create/update in same tab is only for Account type Gmail */
    if (obj.account_type == 'Gmail') {
      this.saveGmailInstance(obj);
    } else {
      this.saveO365Instance(obj);
    }
  }

  saveGmailInstance(obj: EmailType) {
    if (this.instanceId) {
      this.crudSvc.saveGmailInstance(obj, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        /** to open the returned auth url(res.auth_url) in same tab.
         * client_id,topic_name,client_secret,email -> in edit case when these fields values changes,then only auth_url will be coming in res to get authenticated.
        */
        if ('auth_url' in res) {
          window.location.href = res.auth_url;
        } else {
          this.goBack();
          this.notification.success(new Notification('Email account updated successfully.'));
        }
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.handleError(err.error);
      })
    } else {
      this.crudSvc.saveGmailInstance(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        /** to open the returned auth url(res.auth_url) in same tab */
        if ('auth_url' in res) {
          window.location.href = res.auth_url;
        }
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.handleError(err.error);
      })
    }
  }

  saveO365Instance(obj: EmailType) {
    if (this.instanceId) {
      this.crudSvc.saveO365Instance(obj, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('Email account updated successfully.'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.handleError(err.error);
      })
    } else {
      this.crudSvc.saveO365Instance(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('Email account created successfully.'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.handleError(err.error);
      })
    }
  }

  goBack() {
    if (this.instanceId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
