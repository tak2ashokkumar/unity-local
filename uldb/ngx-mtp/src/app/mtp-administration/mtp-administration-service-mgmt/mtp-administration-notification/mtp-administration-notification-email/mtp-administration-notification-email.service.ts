import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserType } from 'src/app/mtp-administration/mtp-administration-user-mgmt/mtp-administration-users/mtp-administration-users-crud/mtp-administration-users-crud.type';
import { GET_USERS, NOTIFICATION_CUSTOMIZE_EMAIL, NOTIFICATION_UPDATE_EMAIL } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { NotificationEmailType } from './mtp-administration-notification-email.type';

@Injectable()
export class MtpAdministrationNotificationEmailService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  addUserName(users: UserType[]): UserType[] {
    users.map(user => {
      user['full_name'] = `${user.first_name} ${user.last_name}(${user.email})`;
    })
    return users;
  }

  getUsers(): Observable<UserType[]> {
    return this.http.get<UserType[]>(GET_USERS(), { params: new HttpParams().set('page_size', 0) }).pipe(map((res) => this.addUserName(res)));;
  }

  getEmailData(eventId: string, instanceId: string): Observable<NotificationEmailType> {
    return this.http.get<NotificationEmailType>(NOTIFICATION_CUSTOMIZE_EMAIL(instanceId), { params: new HttpParams().set('event_uuid', eventId) });
  }

  buildForm(data: NotificationEmailType, eventId: string): FormGroup {
    if (data) {
      let form = this.builder.group({
        'event_uuid': [eventId],
        'email_list': [[], [Validators.required, NoWhitespaceValidator]],
        'subject_list': [data.subject_list, [Validators.required]],
        'email_content': [data.email_content, [Validators.required]],
        'custom_message': [data.custom_message, [NoWhitespaceValidator]],
        'customer': [data.customer],
        'tenant': [data.tenant],
        'flag': [false]
      });
      return form;
    }
  }

  resetFormErrors() {
    return {
      'event_uuid': '',
      'email_list': '',
      'subject_list': '',
      'email_content': '',
      'custom_message': '',
      'flag': ''
    }
  }

  validationMessages = {
    'event_uuid': {},
    'email_list': {
      'required': 'Email is required.'
    },
    'subject_list': {
      'required': 'Subject is required.'
    },
    'email_content': {
      'required': 'Email body is required.'
    },
    'custom_message': {}
  }

  customizeEmail(data: any, eventId: string, instanceId: string) {
    return this.http.post(NOTIFICATION_UPDATE_EMAIL(eventId, instanceId), data);
  }

  updateEmail(data: any, eventId: string, instanceId: string) {
    return this.http.put(NOTIFICATION_UPDATE_EMAIL(eventId, instanceId), data);
  }
}

export class EmailBodyViewData {
  constructor() { }
  name: string;
  isSelected: boolean;
  value: string;
}

export const attributeList = [
  { name: 'Assignee', isSelected: false, value: '${Assignee}' },
  { name: 'Created On', isSelected: false, value: '${Created On}' },
  { name: 'Priority', isSelected: false, value: '${Priority}' },
  // { name: 'Response SLA', isSelected: false, value: '${Response SLA}' },
  // { name: 'Resolution SLA', isSelected: false, value: '${Resolution SLA}' },
  { name: 'Status', isSelected: false, value: '${Status}' },
  { name: 'Ticket Number', isSelected: false, value: '${Ticket Number}' },
  { name: 'Tenant Name', isSelected: false, value: '${Tenant Name}' },
  { name: 'Type', isSelected: false, value: '${Type}' },
  { name: 'Updated On', isSelected: false, value: '${Updated On}' }
];