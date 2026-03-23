import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { TicketMgmtList } from '../SharedEntityTypes/ticket-mgmt-list.type';
import { CREATE_REPORT_AN_ISSUE, CREATE_SERVICE_NOW_TICKET, CREATE_TICKET, DYNAMICCRM_TICKETS_BY_TYPE, GET_SERVICE_CATEGORY, GET_TERMS_BY_SERVICE_CATALOGUE, GET_TICKET_MGMT_LIST, SERVICE_CATALOG_BY_DEVICE_TYPE } from '../api-endpoint.const';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { Notification } from '../app-notification/notification.type';
import { DeviceMapping, MS_DYNAMICS_TICKET_TYPE, SERVICE_NOW_TICKET_TYPE, TICKET_MGMT_TYPE } from '../app-utility/app-utility.service';
import { DeviceServiceCatalog, DeviceServiceCatalogTerms } from '../create-ticket/device-service-catalog.type';

@Injectable({
  providedIn: 'root'
})
export class SharedCreateTicketService {
  @Output() ticketCreated$ = new EventEmitter<string>();

  private ticketAnnouncedSource = new Subject<{ input: UnityTicketInput, deviceMapping: DeviceMapping, instanceUUID: string }>();
  ticketAnnounced$ = this.ticketAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private appService: AppLevelService,
    private http: HttpClient,
    private notification: AppNotificationService,) { }

  createTicket(input: UnityTicketInput, deviceMapping?: DeviceMapping, instanceUUID?: string) {
    this.ticketAnnouncedSource.next({ input: input, deviceMapping: deviceMapping, instanceUUID: instanceUUID });
  }

  getServiceCategory(): Observable<Array<string>> {
    return this.http.get<Array<string>>(GET_SERVICE_CATEGORY());
  }

  getServiceCatalog(deviceMapping: DeviceMapping) {
    return this.http.get<DeviceServiceCatalog[]>(SERVICE_CATALOG_BY_DEVICE_TYPE(deviceMapping));
  }

  getTermsByServiceCatalogue(catalogueId: number) {
    return this.http.get<DeviceServiceCatalogTerms[]>(GET_TERMS_BY_SERVICE_CATALOGUE(catalogueId));
  }

  convertToTermData(terms: DeviceServiceCatalogTerms[]): DeviceServiceCatalogTermView[] {
    let viewData: DeviceServiceCatalogTermView[] = [];
    terms.map(t => {
      let a: DeviceServiceCatalogTermView = new DeviceServiceCatalogTermView();
      a.id = t.id;
      a.name = t.term;
      a.charge = t.charge;
      viewData.push(a);
    })
    return viewData;
  }

  buildAttachmentForm() {
    return this.builder.group({});
  }

  getTicketMgmgtList() {
    return this.http.get<TicketMgmtList[]>(GET_TICKET_MGMT_LIST());
  }

  toFormData<T>(formData: FormData, formValue: T) {
    for (const key of Object.keys(formValue)) {
      const value = formValue[key];
      formData.append(key, this.appService.convertToBinary(value));
    }
    return formData;
  }

  /**
   * Header, Report an Issue, Feedback & Service Req(Problem) is PROBLEM
   * Manage by support ticket & change mgmt is CHANGE(task in zendesk)
   * Incident mgmt is INCIDENT
   * @param data
   * @param create `input.feedback ? false : true`
   * Initially formdata was built for `Zendesk` and then modified the function `saveTicket` to make it compatible
   * with `servicenow`. So when `data.get('type)` is `task` then it is considered as `change` in
   * `servicenow`. Rest remains same.
   * When `create` is `false` then ticket should be created in unity as type `problem`
   */
  saveTicket(data: FormData, selected: TicketMgmtList, feedback: boolean): Observable<any> {
    if (feedback) {
      return this.saveFeedbackTicket(data);
    } else {
      switch (selected.type) {
        case TICKET_MGMT_TYPE.CRM: return this.saveCRMTicket(data, selected);
        case TICKET_MGMT_TYPE.JIRA: return this.saveJiraTciket(data, selected);
        case TICKET_MGMT_TYPE.SERVICENOW: return this.saveServiceNowTicket(data, selected);
        case TICKET_MGMT_TYPE.ZENDESK: return this.saveZendeskTicket(data, selected);
        default: return this.saveCRMTicket(data, selected);
      }
    }
  }

  saveCRMTicket(data: FormData, selected: TicketMgmtList) {
    let desc = '';
    if (data.has('weburl')) {
      desc = data.get('weburl').toString().concat('\n').concat(data.get('metadata').toString());
    } else {
      desc = data.get('description').toString().concat('\n').concat(data.get('metadata').toString());
    }
    data.set('description', desc);
    data.delete('metadata');

    if (data.get('type').toString() == 'task') {
      data.set('type', MS_DYNAMICS_TICKET_TYPE.REQUEST);
    }
    return this.http.post(DYNAMICCRM_TICKETS_BY_TYPE(selected.uuid, data.get('type').toString()), data);
  }

  saveJiraTciket(data: FormData, selected: TicketMgmtList) {
    let desc = '';
    if (data.has('weburl')) {
      desc = data.get('weburl').toString().concat('\n').concat(data.get('metadata').toString());
    } else {
      desc = data.get('description').toString().concat('\n').concat(data.get('metadata').toString());
    }
    data.set('description', desc);
    data.delete('metadata');
    return this.http.post(`customer/jira/instances/${selected.uuid}/create_ticket/`, data);
  }

  saveServiceNowTicket(data: FormData, selected: TicketMgmtList) {
    let desc = '';
    if (data.has('weburl')) {
      desc = data.get('weburl').toString().concat('\n').concat(data.get('metadata').toString());
    } else {
      desc = data.get('description').toString().concat('\n').concat(data.get('metadata').toString());
    }
    data.set('description', desc);
    data.delete('metadata');

    const type = data.get('type').toString() == 'task' ? SERVICE_NOW_TICKET_TYPE.CHANGE_REQUEST : data.get('type').toString();
    return this.http.post(CREATE_SERVICE_NOW_TICKET(selected.uuid, type), data);
  }

  saveZendeskTicket(data: FormData, selected: TicketMgmtList) {
    let desc = '';
    if (data.has('weburl')) {
      desc = data.get('weburl').toString().concat('\n').concat(data.get('metadata').toString());
    } else {
      desc = data.get('description').toString().concat('\n').concat(data.get('metadata').toString());
    }
    data.set('description', desc);
    data.delete('metadata');
    return this.http.post(CREATE_TICKET(), data);
  }

  /**
   * Header, Report an Issue, is considered as Feedback ticket
   * if feedback, then ticket should be created in unity as type `problem`
   * @param data
   */
  saveFeedbackTicket(data: FormData) {
    data.set('type', MS_DYNAMICS_TICKET_TYPE.PROBLEM);
    let desc = data.get('description').toString().concat('\n').concat(data.get('metadata').toString());
    data.set('description', desc);
    data.delete('metadata');
    return this.http.post(CREATE_REPORT_AN_ISSUE(), data);
  }

  ticketCreated(data: FormData) {
    if (data.has('weburl')) {
      this.notification.success(new Notification('Web access request has been submitted successfully. UNITYOneCloud Team will notify you once this is enabled.'));
    } else {
      this.notification.success(new Notification('Ticket submitted successfully, it will be visible in Unity in few minutes. Our Support team will soon contact you.'));
      const type = data.get('type') || data.get('issuetype');
      if (type) {
        this.ticketCreated$.emit(type.toString());
      }
    }
  }
}

export interface UnityTicketType {
  subject: string;
  collaborators: string[];
  type: string;
  priority: string;
  description: string;
}

export interface UnityTicketFormType extends UnityTicketType {
  metadata: string;
  cc: string;
}

export interface UnityTicketInput {
  subject: string;
  metadata: string;

  type?: string;
  staticType?: boolean;
  aiops?: boolean;
  feedback?: boolean;
  webaccess?: boolean;

  //only for JIRA
  projectId?: string;
  queueId?: string;
}

export class DeviceServiceCatalogTermView {
  id: number;
  name: string;
  charge: string = '';
  get displayName() {
    return this.name.concat(Number(this.name) > 1 ? ' Years' : ' Year');
  }
}
