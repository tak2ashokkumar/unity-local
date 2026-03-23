import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { UsiEventIngestionCustomCrudService } from './usi-event-ingestion-custom-crud.service';
import { takeUntil } from 'rxjs/operators';
import { UsiAccount, UsiEventIngestionParams } from '../../unity-setup-integration.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'usi-event-ingestion-custom-crud',
  templateUrl: './usi-event-ingestion-custom-crud.component.html',
  styleUrls: ['./usi-event-ingestion-custom-crud.component.scss']
})
export class UsiEventIngestionCustomCrudComponent implements OnInit {

  private ngUnsubscribe = new Subject();
  instanceId: string;

  credentialForm: FormGroup;
  credentialFormErrors: any;
  credentialFormValidationMessages: any;

  instance: UsiAccount;
  paramList: Array<UsiEventIngestionParams> = [];

  eventIngestionForm: FormGroup;
  eventIngestionFormErrors: any;
  eventIngestionFormValidationMessages: any;
  nonFieldErr: string = '';

  constructor(
    private svc: UsiEventIngestionCustomCrudService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService
  ) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => { this.instanceId = params.get('instanceId') });
  }

  ngOnInit(): void {
    this.manageActiveForm();
    if (this.instanceId) {
      this.getDetails();
    } else {
      this.getParams();
    }
  }

  get additionalAttribute() {
    return (this.eventIngestionForm.get('event_inbound_webhook.additional_attribute') as FormGroup);
  }

  getDetails() {
    this.svc.getDetails(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.instance = res;
      if (this.instance.event_inbound_webhook) {
        this.getParams();
      } else {
        this.manageActiveForm();
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get instace details.'));
    })
  }

  getParams() {
    this.paramList = [];
    this.svc.getEventIngestionParams().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.paramList = data.meta_data;
      this.manageActiveForm();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get instance details. Please try again.'));
      this.spinner.stop('main');
    })
  }

  manageActiveForm() {
    this.buildCredentialsForm();
  }

  buildCredentialsForm() {
    this.credentialForm = this.svc.buildCredentialForm(this.instance);
    this.credentialFormErrors = this.svc.resetCredentialFormErrors();
    this.credentialFormValidationMessages = this.svc.credentialFormValidationMessages;
  }

  onFormUpdate(event: { form: FormGroup, formErrors: any, formValidationMessages: any }) {
    this.eventIngestionForm = event.form;
    this.eventIngestionFormErrors = event.formErrors;
    this.eventIngestionFormValidationMessages = event.formValidationMessages;
    // Now you have the updated form in the parent component
  }

  onSubmit() {
    let isValid: boolean = true;
    if (this.credentialForm.invalid) {
      this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
      this.credentialForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
      });
      isValid = false;
    }
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
    } else {
      this.notification.warning(new Notification('Please fill in the details and then move to Schedule'));
    }
  }

  submitData() {
    this.spinner.start('main');
    let obj = Object.assign({}, this.credentialForm.getRawValue());
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
      obj = Object.assign({}, obj, { 'event_inbound_webhook': null, 'event_inbound_api': null })
    }

    if (this.instanceId) {
      this.svc.updateDetails(obj, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('Custom event ingestion account updated successfully.'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.handleError(err.error);
      })
    } else {
      this.svc.saveDetails(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('Custom event ingestion account created successfully.'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.handleError(err.error);
      })
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
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
          this.credentialFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

}
