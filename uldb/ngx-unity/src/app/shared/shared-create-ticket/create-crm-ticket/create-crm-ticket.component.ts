import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from '../../app-notification/app-notification.service';
import { Notification } from '../../app-notification/notification.type';
import { AppSpinnerService } from '../../app-spinner/app-spinner.service';
import { AppUtilityService, DeviceMapping, MS_DYNAMICS_TICKET_TYPE } from '../../app-utility/app-utility.service';
import { DeviceServiceCatalog } from '../../create-ticket/device-service-catalog.type';
import { DeviceServiceCatalogTermView, UnityTicketInput } from '../shared-create-ticket.service';
import { CreateCrmTicketService } from './create-crm-ticket.service';
import { cloneDeep as _clone } from 'lodash-es';
import { DynamicCrmTicketPriorityType, DynamicCrmTicketType } from '../../SharedEntityTypes/crm.type';

@Component({
  selector: 'create-crm-ticket',
  templateUrl: './create-crm-ticket.component.html',
  styleUrls: ['./create-crm-ticket.component.scss'],
  // providers: [CreateCrmTicketService]
})
export class CreateCrmTicketComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  metadata: UnityTicketInput;
  deviceMapping: DeviceMapping;
  ticketTypeList: DynamicCrmTicketType[] = [];
  ticketPriorityList: DynamicCrmTicketPriorityType[] = [];
  instanceId: string;

  ticketForm: FormGroup;
  formErrors: any;
  validationMessages: any;

  svcCategories: string[] = [];
  showSvcCategory: boolean;
  svcCatalog: DeviceServiceCatalog[] = [];
  selectedService: string = '';
  svcCatalogTerms: DeviceServiceCatalogTermView[] = [];
  selectedTerm: DeviceServiceCatalogTermView = new DeviceServiceCatalogTermView();

  constructor(private ticketSvc: CreateCrmTicketService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService) {
    this.ticketSvc.crmTicketAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.metadata = param.input;
      this.instanceId = param.instanceId;
      this.deviceMapping = param.deviceMapping ? param.deviceMapping : null;

      //Category dropdown should be shown only for service request.
      this.showSvcCategory = param.input.type == MS_DYNAMICS_TICKET_TYPE.PROBLEM && !param.input.webaccess && !param.input.aiops;

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

  ngOnInit(): void { }

  ngOnDestroy(): void { }

  buildForm() {
    this.ticketForm = this.ticketSvc.buildForm(this.metadata);
    this.formErrors = this.ticketSvc.resetFormErrors();
    this.validationMessages = this.ticketSvc.validationMessages;
    this.getDropdownData();
  }

  getDropdownData() {
    this.ticketTypeList = [];
    this.ticketPriorityList = [];
    this.ticketSvc.getDropdownData(this.instanceId).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ types, priorities }) => {
        if (types) {
          this.ticketTypeList = _clone(types);
          this.ticketForm.get('type').patchValue(types[0].value);
        } else {
          this.ticketTypeList = [];
          this.notification.error(new Notification("Error while fetching issue types"));
        }

        if (priorities) {
          this.ticketPriorityList = _clone(priorities);
          this.ticketForm.get('priority').patchValue(priorities[0].value);
        } else {
          this.ticketPriorityList = [];
          this.notification.error(new Notification("Error while fetching priorities list"));
        }
      });
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
