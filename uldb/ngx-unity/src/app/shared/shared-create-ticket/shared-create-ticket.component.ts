import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TicketMgmtList } from '../SharedEntityTypes/ticket-mgmt-list.type';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { Notification } from '../app-notification/notification.type';
import { AppSpinnerService } from '../app-spinner/app-spinner.service';
import { AppUtilityService, DeviceMapping, TICKET_MGMT_TYPE } from '../app-utility/app-utility.service';
import { CreateCrmTicketService } from './create-crm-ticket/create-crm-ticket.service';
import { CreateFeedbackTicketService } from './create-feedback-ticket/create-feedback-ticket.service';
import { CreateJiraTicketService } from './create-jira-ticket/create-jira-ticket.service';
import { CreateServiceNowTicketService } from './create-service-now-ticket/create-service-now-ticket.service';
import { CreateZendeskTicketService } from './create-zendesk-ticket/create-zendesk-ticket.service';
import { SharedCreateTicketService, UnityTicketInput } from './shared-create-ticket.service';

@Component({
  selector: 'shared-create-ticket',
  templateUrl: './shared-create-ticket.component.html',
  styleUrls: ['./shared-create-ticket.component.scss'],
})
export class SharedCreateTicketComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  params: { input: UnityTicketInput, deviceMapping?: DeviceMapping, instanceUUID?: string };

  ticketMgmtType: TICKET_MGMT_TYPE;
  ticketMgmtList: TicketMgmtList[] = [];
  selectedTcktMgmt: TicketMgmtList;
  instanceId: string;
  isFeedback: boolean;

  @ViewChild('createTicketRef') createTicketRef: ElementRef;
  modalRef: BsModalRef;
  attachmentForm: FormGroup;

  ticketFormSvc: CreateCrmTicketService | CreateJiraTicketService | CreateServiceNowTicketService | CreateZendeskTicketService | CreateFeedbackTicketService;
  constructor(private ticketSvc: SharedCreateTicketService,
    private modalService: BsModalService,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private notificationService: AppNotificationService,
    private crmSvc: CreateCrmTicketService,
    private jiraSvc: CreateJiraTicketService,
    private serviceNowSvc: CreateServiceNowTicketService,
    private zendeskSvc: CreateZendeskTicketService,
    private feedbackSvc: CreateFeedbackTicketService) {
    this.ticketSvc.ticketAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.params = param;
      this.instanceId = param.instanceUUID;
      this.isFeedback = param.input.feedback;
      this.buildForm();
      if (!this.isFeedback) {
        this.getTicketMgmtList();
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getTicketFormSvcInstance() {
    return this.crmSvc;
    // if (this.isFeedback) {
    //   return this.feedbackSvc;
    // } else {
    //   switch (this.selectedTcktMgmt.type) {
    //     case TICKET_MGMT_TYPE.CRM: return this.crmSvc;
    //     case TICKET_MGMT_TYPE.JIRA: return this.jiraSvc;
    //     case TICKET_MGMT_TYPE.SERVICENOW: this.serviceNowSvc;
    //     case TICKET_MGMT_TYPE.ZENDESK: return this.zendeskSvc;
    //     default: return this.crmSvc;
    //   }
    // }
  }

  getTicketMgmtList() {
    this.ticketSvc.getTicketMgmgtList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ticketMgmtList = res;
      if (this.instanceId) {
        this.tcktMgmtSelected(JSON.stringify(this.ticketMgmtList.find(inst => inst.uuid == this.instanceId)));
      } else if (this.isFeedback) {
        this.tcktMgmtSelected(JSON.stringify(this.ticketMgmtList.find(inst => inst.type == 'Zendesk')));
      } else {
        this.tcktMgmtSelected(JSON.stringify(this.ticketMgmtList.find(inst => inst.default == true)));
      }
      this.modalRef = this.modalService.show(this.createTicketRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    }, err => {
    });
  }

  tcktMgmtSelected(event: string) {
    this.selectedTcktMgmt = JSON.parse(event);
    if (this.isFeedback) {
      this.ticketFormSvc = this.feedbackSvc;
    } else {
      switch (this.selectedTcktMgmt.type) {
        case TICKET_MGMT_TYPE.CRM: this.ticketFormSvc = this.crmSvc; break;
        case TICKET_MGMT_TYPE.JIRA: this.ticketFormSvc = this.jiraSvc; break;
        case TICKET_MGMT_TYPE.SERVICENOW: this.ticketFormSvc = this.serviceNowSvc; break;
        case TICKET_MGMT_TYPE.ZENDESK: this.ticketFormSvc = this.zendeskSvc; break;
        default: this.ticketFormSvc = this.crmSvc; break;
      }
    }
    setTimeout(() => {
      this.ticketFormSvc.createTicket(this.params.input, this.selectedTcktMgmt.uuid,  this.params.deviceMapping);
    }, 0)
  }

  buildForm() {
    this.attachmentForm = this.ticketSvc.buildAttachmentForm();
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

  handleError(err: any) {}

  onSubmit() {
    this.ticketFormSvc.submit();
    if (this.ticketFormSvc.isInvalid()) {
      return;
    } else {
      this.spinner.start('main');
      const data = this.ticketSvc.toFormData(this.ticketFormSvc.getFormDataObj(), this.attachmentForm.getRawValue());
      this.ticketSvc.saveTicket(data, this.selectedTcktMgmt, this.isFeedback).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.ticketSvc.ticketCreated(data);
        this.modalRef.hide();
        this.spinner.stop('main');
      }, err => {
        this.modalRef.hide();
        this.spinner.stop('main');
        if (data.has('weburl')) {
          this.notificationService.error(new Notification('Failed to request web access. Tryagain later.'));
        } else {
          this.notificationService.error(new Notification('Error while creating ticket.'));
        }
      });
    }
  }

}
