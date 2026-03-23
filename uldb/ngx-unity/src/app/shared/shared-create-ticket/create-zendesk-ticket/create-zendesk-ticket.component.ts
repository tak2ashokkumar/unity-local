import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { DeviceServiceCatalogTermView, UnityTicketInput } from '../shared-create-ticket.service';
import { AppUtilityService, DeviceMapping, ZENDESK_TICKET_TYPE } from '../../app-utility/app-utility.service';
import { CreateZendeskTicketService, ZENDESK_TICKET_PRIORITIES, ZENDESK_TICKET_TYPES } from './create-zendesk-ticket.service';
import { FormGroup } from '@angular/forms';
import { DeviceServiceCatalog } from '../../create-ticket/device-service-catalog.type';
import { AppNotificationService } from '../../app-notification/app-notification.service';
import { AppSpinnerService } from '../../app-spinner/app-spinner.service';
import { take, takeUntil } from 'rxjs/operators';
import { Notification } from '../../app-notification/notification.type';

@Component({
  selector: 'create-zendesk-ticket',
  templateUrl: './create-zendesk-ticket.component.html',
  styleUrls: ['./create-zendesk-ticket.component.scss']
})
export class CreateZendeskTicketComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  metadata: UnityTicketInput;
  deviceMapping: DeviceMapping;
  ticketTypeList = ZENDESK_TICKET_TYPES;
  ticketPriorityList = ZENDESK_TICKET_PRIORITIES;

  ticketForm: FormGroup;
  formErrors: any;
  validationMessages: any;

  svcCategories: string[] = [];
  showSvcCategory: boolean;
  svcCatalog: DeviceServiceCatalog[] = [];
  selectedService: string = '';
  svcCatalogTerms: DeviceServiceCatalogTermView[] = [];
  selectedTerm: DeviceServiceCatalogTermView = new DeviceServiceCatalogTermView();

  constructor(private ticketSvc: CreateZendeskTicketService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService) { 
      this.ticketSvc.crmTicketAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
        this.metadata = param.input;
        this.deviceMapping = param.deviceMapping ? param.deviceMapping : null;
  
        //Category dropdown should be shown only for service request.
        this.showSvcCategory = param.input.type == ZENDESK_TICKET_TYPE.PROBLEM && !param.input.webaccess && !param.input.aiops;
  
        //check for device web access ticketvf
        if (!param.input.webaccess) {
          this.svcCatalog = [];
          this.selectedService = '';
          this.getServiceCatalog();
        }
        this.buildForm();
      });

      this.ticketSvc.submitAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.submit();
      });
      this.ticketSvc.errorAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.handleError(res);
      });
    }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {}

  buildForm() {
    this.ticketForm = this.ticketSvc.buildForm(this.metadata);
    this.formErrors = this.ticketSvc.resetFormErrors();
    this.validationMessages = this.ticketSvc.validationMessages;
  }

  getReadableTicketType(type: string) {
    return type.split('_').join(" ");
  }

  getServiceCategory() {
    this.ticketSvc.getServiceCategory().pipe(take(1)).subscribe(res => {
      this.svcCategories = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching service category.'));
    });
  }

  getServiceCatalog() {
    if (this.deviceMapping) {
      this.ticketSvc.getServiceCatalog(this.deviceMapping).pipe(take(1)).subscribe(res => {
        this.svcCatalog = res;
      }, err => {
        this.notification.error(new Notification('Error while fetching service catalog.'));
      });
    }
  }

  handleError(err: any) {
    this.formErrors = this.ticketSvc.resetFormErrors();
    if (err) {
      for (const field in err) {
        if (field in this.ticketForm.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    }
  }

  submit() {
    this.ticketSvc.updateFormValue(this.ticketForm);
    if (this.ticketForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.ticketForm, this.validationMessages, this.formErrors);
      this.ticketForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.ticketForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.formErrors = this.ticketSvc.resetFormErrors();
      const data = this.ticketSvc.toFormData(this.ticketForm.getRawValue());
      if (this.selectedService) {
        let metadata = data.get('metadata').toString().concat('\n').concat(`Service : ${this.selectedService}`);
        if (this.selectedTerm) {
          metadata = metadata.concat(` - Term : ${this.selectedTerm.displayName} - Charge : ${this.selectedTerm.charge}`);
        }
        data.set('metadata', metadata);
      }
      this.ticketSvc.updateFormValue(this.ticketForm, data);
    }
  }
}
