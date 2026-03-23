import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { TOOL_NAME_MAP, UsiEventIngestionCommonService } from './usi-event-ingestion-common.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup, Validators } from '@angular/forms';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UsiEventIngestionAttribute, UsiEventIngestionParams, UsiEventIntestionAccountType } from '../unity-setup-integration.service';

@Component({
  selector: 'usi-event-ingestion-common',
  templateUrl: './usi-event-ingestion-common.component.html',
  styleUrls: ['./usi-event-ingestion-common.component.scss'],
})
export class UsiEventIngestionCommonComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  modalRef: BsModalRef;
  @ViewChild('confirm') confirm: ElementRef;

  instanceId: string | null;

  tool: string;
  actionMessage: 'Add' | 'Edit';

  paramList: Array<UsiEventIngestionParams> = [];
  defaultEventIngestionValues: UsiEventIngestionAttribute[] = [];

  instance: UsiEventIntestionAccountType;

  nonFieldErr: string = '';
  basicDetailsForm: FormGroup;
  basicDetailsFormErrors: any;
  basicDetailsFormValidationMessages: any;

  eventIngestionForm: FormGroup;
  eventIngestionFormErrors: any;
  eventIngestionFormValidationMessages: any;

  eventSourceForApiUrl: string;
  eventSourceForDisplay: string;
  isAddorEditEnabled: boolean;

  constructor(private crudService: UsiEventIngestionCommonService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,) {
    this.route.paramMap.subscribe(params => {
      const segments = this.router.url.split('/');
      const last = segments[segments.length - 1];
      const secondLast = segments[segments.length - 2];
      const thirdLast = segments[segments.length - 3];
      if (last == 'add') {
        this.tool = secondLast;
      } else if (last == 'edit') {
        this.tool = thirdLast;
      } else {
        this.tool = last;
      }
      this.eventSourceForApiUrl = TOOL_NAME_MAP[this.tool];
      this.eventSourceForDisplay = this.eventSourceForApiUrl == 'NewRelic' ? 'New Relic' : this.eventSourceForApiUrl;
      this.instanceId = params.get('integrationId');
      this.actionMessage = this.instanceId ? 'Edit' : 'Add';
    });
    this.isAddorEditEnabled = this.router.url.includes('add') || this.router.url.includes('edit');
    this.crudService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(uuid => {
      this.delete(uuid);
    });
  }

  ngOnInit(): void {
    if (!this.isAddorEditEnabled) return;
    this.spinner.start('main');
    if (this.instanceId) {
      this.getInstanceDetails();
    } else {
      this.getEventIngestionParams();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getInstanceDetails() {
    this.crudService.getInstanceDetails(this.eventSourceForApiUrl, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.instance = res;
      this.getEventIngestionParams();
    }, (err: HttpErrorResponse) => {
      this.instance = null;
      this.buildBasicDetailsForm();
      this.spinner.stop('main');
    })
  }

  getEventIngestionParams() {
    this.paramList = [];
    this.defaultEventIngestionValues = [];
    this.crudService.getEventIngestionParams(this.eventSourceForApiUrl).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.paramList = data.meta_data;
      this.defaultEventIngestionValues = data.attribute_map;
      this.buildBasicDetailsForm();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Params list. Please try again.'));
      this.spinner.stop('main');
    })
  }

  buildBasicDetailsForm() {
    this.basicDetailsForm = this.crudService.buildBasicDetailsForm(this.instance);
    this.basicDetailsFormErrors = this.crudService.resetBasicDetailsFormErrors();
    this.basicDetailsFormValidationMessages = this.crudService.basicDetailsFormValidationMessages;
    this.spinner.stop('main');
  }

  get additionalAttribute() {
    return (this.eventIngestionForm.get('event_inbound_webhook.additional_attribute') as FormGroup);
  }

  onFormUpdate(event: { form: FormGroup, formErrors: any, formValidationMessages: any }) {
    this.eventIngestionForm = event.form;
    this.eventIngestionFormErrors = event.formErrors;
    this.eventIngestionFormValidationMessages = event.formValidationMessages;
  }

  onSubmit() {
    let isValid: boolean = true;
    if (this.basicDetailsForm.invalid) {
      this.basicDetailsFormErrors = this.utilService.validateForm(this.basicDetailsForm, this.basicDetailsFormValidationMessages, this.basicDetailsFormErrors);
      this.basicDetailsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.basicDetailsFormErrors = this.utilService.validateForm(this.basicDetailsForm, this.basicDetailsFormValidationMessages, this.basicDetailsFormErrors);
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
    }
  }

  submitData() {
    this.spinner.start('main');
    let obj = Object.assign({}, this.basicDetailsForm.getRawValue());
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

    if (this.instanceId) {
      this.crudService.updateDetails(this.eventSourceForApiUrl, obj, this.instanceId,).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification(`${this.eventSourceForDisplay} account updated successfully.`));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.handleError(err.error);
      })
    } else {
      this.crudService.saveDetails(this.eventSourceForApiUrl, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification(`${this.eventSourceForDisplay} account added successfully.`));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.handleError(err.error);
      })
    }
  }

  handleError(err: any) {
    this.basicDetailsFormErrors = this.crudService.resetBasicDetailsFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.basicDetailsForm.controls) {
          this.basicDetailsFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  delete(uuid: string) {
    this.instanceId = uuid;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.modalRef.hide();
    this.crudService.deleteAccount(this.eventSourceForApiUrl, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notification.success(new Notification('Account deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, err => {
      this.notification.error(new Notification('Failed to delete Account. Please try again.'));
    });
  }

  goBack() {
    if (this.instanceId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
