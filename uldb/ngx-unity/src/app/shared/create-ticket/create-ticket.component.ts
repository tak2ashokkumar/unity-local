import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CreateTicketService, Priority, TicketInput, DeviceServiceCatalogTermView, ZENDESK_TICKET_PRIORITIES, DYNAMIC_CRM_TICKET_PRIORITIES, DYNAMIC_CRM_TICKET_TYPES, SERVICE_NOW_TICKET_TYPES, ZENDESK_TICKET_TYPES } from './create-ticket.service';
import { Subscription, Subject } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AppSpinnerService } from '../app-spinner/app-spinner.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AppUtilityService, DeviceMapping, TICKET_TYPE, NoWhitespaceValidator, MS_DYNAMICS_TICKET_TYPE, SERVICE_NOW_TICKET_TYPE } from '../app-utility/app-utility.service';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { Notification } from '../app-notification/notification.type';
import { takeUntil, take } from 'rxjs/operators';
import { DeviceServiceCatalog } from './device-service-catalog.type';
import { UserInfoService } from '../user-info.service';
import { TicketMgmtList } from '../SharedEntityTypes/ticket-mgmt-list.type';

@Component({
  selector: 'create-ticket',
  templateUrl: './create-ticket.component.html',
  styleUrls: ['./create-ticket.component.scss']
})
export class CreateTicketComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  ticketSubscr: Subscription;
  metadata: TicketInput;
  @ViewChild('template') elementView: ElementRef;
  modalRef: BsModalRef;
  attachmentForm: FormGroup;
  ticketForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  PriorityEnum = Priority;
  deviceMapping: DeviceMapping;
  svcCategories: string[] = [];
  showSvcCategory: boolean;
  svcCatalog: DeviceServiceCatalog[] = [];
  selectedService: string = '';
  svcCatalogTerms: DeviceServiceCatalogTermView[] = [];
  selectedTerm: DeviceServiceCatalogTermView = new DeviceServiceCatalogTermView();
  ticketMgmtList: TicketMgmtList[] = [];
  selectedTcktMgmt: TicketMgmtList;
  showPriority: boolean;
  instanceUUID: string;
  isFeedback: boolean;
  ticketPriorityList: string[] = [];
  showTicketType: boolean;
  ticketTypeList: string[] = [];
  constructor(private ticketService: CreateTicketService,
    private modalService: BsModalService,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private notificationService: AppNotificationService,
    private user: UserInfoService) {
    this.ticketService.ticketAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      console.log('metadata : ', param.input);
      this.metadata = param.input;
      //Category dropdown should be shown only for service request.
      this.showSvcCategory = param.input.type == TICKET_TYPE.PROBLEM && !param.input.feedback && !param.input.webaccess && !param.input.aiops;
      this.deviceMapping = param.deviceMapping ? param.deviceMapping : null;

      //check for device web access ticket
      if (!param.input.webaccess) {
        this.svcCatalog = [];
        this.selectedService = '';
        this.getServiceCatalog();
      }

      if (param.input.feedback) {
        this.isFeedback = true;
      }
      this.getTicketMgmtList();
      this.buildForm();
      this.instanceUUID = param.instanceUUID;
    });
  }

  ngOnInit() {
    this.getServiceCategory();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildForm() {
    this.attachmentForm = this.ticketService.buildAttachmentForm();
    this.ticketForm = this.ticketService.buildForm(this.metadata);
    this.formErrors = this.ticketService.resetFormErrors();
    this.validationMessages = this.ticketService.validationMessages;
  }

  tcktMgmtSelected(event: string) {
    this.selectedTcktMgmt = JSON.parse(event);
    this.ticketPriorityList = this.selectedTcktMgmt.type == 'Zendesk' ? ZENDESK_TICKET_PRIORITIES : this.selectedTcktMgmt.type == 'DynamicsCrm' ? DYNAMIC_CRM_TICKET_PRIORITIES : [];
    this.showPriority = this.isFeedback || this.selectedTcktMgmt.type == 'Zendesk' || this.selectedTcktMgmt.type == 'DynamicsCrm';
    if (this.showPriority) {
      if (this.selectedTcktMgmt.type == 'Zendesk') {
        this.ticketForm.setControl('priority', new FormControl(Priority.NORMAL, [Validators.required, NoWhitespaceValidator]));
      } else if (this.selectedTcktMgmt.type == 'DynamicsCrm') {
        this.ticketForm.setControl('priority', new FormControl(Priority.CRM_NORMAL, [Validators.required, NoWhitespaceValidator]));
      } else {
        this.ticketForm.setControl('priority', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      }
    }

    this.showTicketType = (this.metadata && !this.metadata.type) ? true : false;
    if (this.showTicketType) {
      if (this.selectedTcktMgmt.type == 'DynamicsCrm') {
        this.ticketTypeList = DYNAMIC_CRM_TICKET_TYPES;
        this.ticketForm.setControl('type', new FormControl(DYNAMIC_CRM_TICKET_TYPES[0], [Validators.required, NoWhitespaceValidator]));
      } else if (this.selectedTcktMgmt.type == 'ServiceNow') {
        this.ticketTypeList = SERVICE_NOW_TICKET_TYPES;
        this.ticketForm.setControl('type', new FormControl(SERVICE_NOW_TICKET_TYPES[0], [Validators.required, NoWhitespaceValidator]));
      } else{
        this.ticketTypeList = ZENDESK_TICKET_TYPES;
        this.ticketForm.setControl('type', new FormControl(ZENDESK_TICKET_TYPES[0], [Validators.required, NoWhitespaceValidator]));
      }
    } else if (this.metadata && this.metadata.type) {
      if (this.selectedTcktMgmt.type == 'DynamicsCrm') {
        this.ticketTypeList = DYNAMIC_CRM_TICKET_TYPES;
        switch (this.metadata.type) {
          case TICKET_TYPE.PROBLEM:
            this.ticketForm.setControl('type', new FormControl(MS_DYNAMICS_TICKET_TYPE.PROBLEM, [Validators.required, NoWhitespaceValidator]));
            break;
          default:
            this.ticketForm.setControl('type', new FormControl(MS_DYNAMICS_TICKET_TYPE.INCIDENT, [Validators.required, NoWhitespaceValidator]));
            break;
        }
      } else if (this.selectedTcktMgmt.type == 'ServiceNow') {
        this.ticketTypeList = SERVICE_NOW_TICKET_TYPES;
        switch (this.metadata.type) {
          case TICKET_TYPE.PROBLEM:
            this.ticketForm.setControl('type', new FormControl(SERVICE_NOW_TICKET_TYPE.PROBLEM, [Validators.required, NoWhitespaceValidator]));
            break;
          default:
            this.ticketForm.setControl('type', new FormControl(SERVICE_NOW_TICKET_TYPE.INCIDENT, [Validators.required, NoWhitespaceValidator]));
            break;
        }
      }
    }
  }

  getReadableTicketType(type: string) {
    return type.split('_').join(" ");
  }

  getTicketMgmtList() {
    this.ticketService.getTicketMgmgtList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ticketMgmtList = res;
      if (this.instanceUUID) {
        this.tcktMgmtSelected(JSON.stringify(this.ticketMgmtList.find(inst => inst.uuid == this.instanceUUID)));
      } else if (this.isFeedback) {
        this.tcktMgmtSelected(JSON.stringify(this.ticketMgmtList.find(inst => inst.type == 'Zendesk')));
      } else {
        this.tcktMgmtSelected(JSON.stringify(this.ticketMgmtList.find(inst => inst.default == true)));
      }
      this.modalRef = this.modalService.show(this.elementView, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    }, err => {
    });
  }

  getServiceCategory() {
    this.ticketService.getServiceCategory().pipe(take(1)).subscribe(res => {
      this.svcCategories = res;
    }, err => {
      this.notificationService.error(new Notification('Error while fetching service category.'));
    });
  }

  getServiceCatalog() {
    if (this.deviceMapping) {
      this.ticketService.getServiceCatalog(this.deviceMapping).pipe(take(1)).subscribe(res => {
        this.svcCatalog = res;
      }, err => {
        this.notificationService.error(new Notification('Error while fetching service catalog.'));
      });
    }
  }

  getTermsByServiceCatalogue(catalogueId: number) {
    this.ticketService.getTermsByServiceCatalogue(catalogueId).pipe(take(1)).subscribe(res => {
      this.svcCatalogTerms = this.ticketService.convertToTermData(res);
      this.selectedTerm = this.svcCatalogTerms[0];
    }, err => {
      this.svcCatalogTerms = [];
      this.selectedTerm = null;
      this.notificationService.error(new Notification('Error while fetching service catalog terms.'));
    })
  }

  serviceCategorySelected(event: any) {
    this.deviceMapping = event.target.value;
    this.getServiceCatalog();
    this.svcCatalogTerms = [];
    this.selectedTerm = null;
  }

  serviceCatalogSelected(event: any) {
    this.selectedService = event.target.value;
    this.getTermsByServiceCatalogue(this.svcCatalog.find(svc => svc.description == event.target.value).id);
  }

  serviceCatalogTermSelected(event: any) {
    this.selectedTerm = this.svcCatalogTerms.find(svct => svct.name == event.target.value);
  }

  get attachments() {
    return Object.keys(this.attachmentForm.controls);
  }

  detectFiles(files: FileList) {
    for (let index = 0; index < files.length; index++) {
      if (this.attachments.includes(files.item(index).name)) {
        continue;
      } else {
        let reader = new FileReader();
        reader.onload = (e: any) => {
          this.attachmentForm.addControl(files.item(index).name, new FormControl(e.target.result));
        }
        reader.readAsDataURL(files.item(index));
      }
    }
  }

  removeFiles(attachment: string) {
    this.attachmentForm.removeControl(attachment);
  }

  onSubmit() {
    if (this.ticketForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.ticketForm, this.validationMessages, this.formErrors);
      this.ticketForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.ticketForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.formErrors = this.ticketService.resetFormErrors();
      const create: boolean = this.metadata.feedback ? false : true;
      const data = this.ticketService.toFormData(this.ticketForm.getRawValue(), this.attachmentForm.getRawValue());
      if (this.selectedService) {
        let metadata = data.get('metadata').toString().concat('\n').concat(`Service : ${this.selectedService}`);
        if (this.selectedTerm) {
          metadata = metadata.concat(` - Term : ${this.selectedTerm.displayName} - Charge : ${this.selectedTerm.charge}`);
        }
        data.set('metadata', metadata);
      }
      this.ticketService.saveTicket(data, this.selectedTcktMgmt, create).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
        this.modalRef.hide();
        if (data.has('weburl')) {
          this.notificationService.success(new Notification('Web access request has been submitted successfully. UNITYOneCloud Team will notify you once this is enabled.'));
        } else {
          this.notificationService.success(new Notification('Ticket submitted successfully, it will be visible in Unity in few minutes. Our Support team will soon contact you.'));
          if (this.showTicketType) {
            this.metadata.type = <string>data.get('type');
          }
          this.ticketService.ticketCreated(this.metadata);
        }
      }, err => {
        this.spinner.stop('main');
        this.modalRef.hide();
        if (data.has('weburl')) {
          this.notificationService.error(new Notification('Failed to request web access. Tryagain later.'));
        } else {
          this.notificationService.error(new Notification('Error while creating ticket.'));
        }
      });
    }
  }
}