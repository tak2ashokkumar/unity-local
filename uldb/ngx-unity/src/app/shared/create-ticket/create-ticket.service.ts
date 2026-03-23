import { HttpClient } from '@angular/common/http';
import { Injectable, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { CREATE_REPORT_AN_ISSUE, CREATE_SERVICE_NOW_TICKET, CREATE_TICKET, DYNAMICCRM_TICKETS_BY_TYPE, GET_SERVICE_CATEGORY, GET_TERMS_BY_SERVICE_CATALOGUE, GET_TICKET_MGMT_LIST, SERVICE_CATALOG_BY_DEVICE_TYPE } from '../api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator, SERVICE_NOW_TICKET_TYPE, MS_DYNAMICS_TICKET_TYPE, TICKET_TYPE } from '../app-utility/app-utility.service';
import { TicketMgmtList } from '../SharedEntityTypes/ticket-mgmt-list.type';
import { UserInfoService } from '../user-info.service';
import { DeviceServiceCatalog, DeviceServiceCatalogTerms } from './device-service-catalog.type';

@Injectable({
  providedIn: 'root'
})
export class CreateTicketService {
  @Output() ticketCreated$ = new EventEmitter<string>();

  private ticketAnnouncedSource = new Subject<{ input: TicketInput, deviceMapping: DeviceMapping, instanceUUID: string }>();
  // Observable string streams
  ticketAnnounced$ = this.ticketAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private appService: AppLevelService,
    private user: UserInfoService,
    private http: HttpClient) { }

  createTicket(input: TicketInput, deviceMapping?: DeviceMapping, instanceUUID?: string) {
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

  resetFormErrors(): any {
    let formErrors: any = {
      'subject': '',
      'priority': '',
      'type': '',
      'description': '',
      'weburl': '',
    };
    return formErrors;
  }

  validationMessages = {
    'subject': {
      'required': 'Subject is required'
    },
    'type': {
      'required': 'Ticket type is required'
    },
    'priority': {
      'required': 'Priority is required'
    },
    'description': {
      'required': 'Description is required'
    },
    'weburl': {
      'required': 'Web URL is required',
      'pattern': 'Please enter valid Web URL'

    },
  };

  buildForm(data: TicketInput): FormGroup {
    this.resetFormErrors();
    let form = this.builder.group({
      'subject': [data.subject, [Validators.required, NoWhitespaceValidator]],
      'collaborators': ['', NoWhitespaceValidator],
      'metadata': [data.metadata, NoWhitespaceValidator],
      'type': [data.type ? data.type : 'task']
    });
    if (data.webaccess) {
      form.addControl('weburl', new FormControl('', [Validators.required, NoWhitespaceValidator, Validators.pattern(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?|^((http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)]));
    } else {
      form.addControl('description', new FormControl('', [Validators.required, NoWhitespaceValidator]));
    }
    return form;
  }

  getTicketMgmgtList() {
    return this.http.get<TicketMgmtList[]>(GET_TICKET_MGMT_LIST());
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
  saveTicket(data: FormData, selected: TicketMgmtList, create?: boolean) {
    if (!create) {
      data.append('type', MS_DYNAMICS_TICKET_TYPE.PROBLEM);
    }

    let desc = '';
    if (data.has('weburl')) {
      desc = data.get('weburl').toString().concat('\n').concat(data.get('metadata').toString());
    } else {
      desc = data.get('description').toString().concat('\n').concat(data.get('metadata').toString());
    }
    data.set('description', desc);
    data.delete('metadata');
    if (selected.type == 'Zendesk') {
      return this.http.post(create ? CREATE_TICKET() : CREATE_REPORT_AN_ISSUE(), data);
    } else if (selected.type == 'ServiceNow') {
      const type = data.get('type').toString() == 'task' ? SERVICE_NOW_TICKET_TYPE.CHANGE_REQUEST : data.get('type').toString();
      return this.http.post(create ? CREATE_SERVICE_NOW_TICKET(selected.uuid, type) : CREATE_REPORT_AN_ISSUE(), data);
    } else if (selected.type == 'DynamicsCrm') {
      if (data.get('type').toString() == 'task') {
        data.set('type', MS_DYNAMICS_TICKET_TYPE.REQUEST);
      }
      return this.http.post(create ? DYNAMICCRM_TICKETS_BY_TYPE(selected.uuid, data.get('type').toString()) : CREATE_REPORT_AN_ISSUE(), data);
    }
  }

  toFormData<T>(formValue: T, formValue1: T) {
    const formData = new FormData();
    for (const key of Object.keys(formValue)) {
      const value = formValue[key];
      formData.append(key, value);
    }
    for (const key of Object.keys(formValue1)) {
      const value = formValue1[key];
      formData.append(key, this.appService.convertToBinary(value));
    }
    return formData;
  }

  ticketCreated(data: TicketInput) {
    if (data.type) {
      this.ticketCreated$.emit(data.type);
    }
  }
}

export interface TicketType {
  subject: string;
  description: string;
  priority: string;
  collaborators: string[];
  type: string;
}

export interface TicketFormType extends TicketType {
  metadata: string;
  cc: string;
}

export interface TicketInput {
  subject: string;
  metadata: string;
  type?: string;
  staticType?: boolean;
  aiops?: boolean;
  feedback?: boolean;
  webaccess?: boolean;
}

export class DeviceServiceCatalogTermView {
  id: number;
  name: string;
  charge: string = '';
  get displayName() {
    return this.name.concat(Number(this.name) > 1 ? ' Years' : ' Year');
  }
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRM_CRITICAL = 'Critical',
  CRM_HIGH = 'High',
  CRM_NORMAL = 'Normal',
  CRM_LOW = 'Low'
}

export const ZENDESK_TICKET_PRIORITIES = [
  Priority.LOW, Priority.NORMAL, Priority.HIGH, Priority.URGENT,
];

export const ZENDESK_TICKET_TYPES = [
  TICKET_TYPE.ALL, TICKET_TYPE.TASK, TICKET_TYPE.PROBLEM, TICKET_TYPE.INCIDENT, TICKET_TYPE.QUESTION,
];

export const SERVICE_NOW_TICKET_TYPES = [
  SERVICE_NOW_TICKET_TYPE.INCIDENT, SERVICE_NOW_TICKET_TYPE.CHANGE_REQUEST, SERVICE_NOW_TICKET_TYPE.PROBLEM,
];

export const DYNAMIC_CRM_TICKET_PRIORITIES = [
  Priority.CRM_NORMAL, Priority.CRM_HIGH, Priority.CRM_CRITICAL, Priority.CRM_LOW
];

export const DYNAMIC_CRM_TICKET_TYPES = [
  MS_DYNAMICS_TICKET_TYPE.INCIDENT, MS_DYNAMICS_TICKET_TYPE.CHANGE, MS_DYNAMICS_TICKET_TYPE.PROBLEM, MS_DYNAMICS_TICKET_TYPE.QUESTION, MS_DYNAMICS_TICKET_TYPE.REQUEST,
];
