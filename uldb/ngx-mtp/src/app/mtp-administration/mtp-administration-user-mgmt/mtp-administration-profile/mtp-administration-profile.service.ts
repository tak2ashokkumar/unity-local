import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { UserProfileType } from 'src/app/shared/SharedEntityTypes/user.type';
import { GET_MTP_USER_PROFILE_DATA, GET_USER_PROFILE_ACTIVITY_LOG, POST_MTP_USER_PROFILE_DATA, USER_PROFILE_RESET_PASSWORD } from 'src/app/shared/api-endpoint.const';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { UserProfileActivityLog } from './mtp-administration-profile.type';

@Injectable()
export class UserAdministrationProfileService {
  constructor(private http: HttpClient,
    private userInfo: UserInfoService,
    private tableService: TableApiServiceService,
    private builder: FormBuilder) { }

  getUserProfileData(): Observable<PaginatedResult<UserProfileType>> {
    return this.http.get<PaginatedResult<UserProfileType>>(GET_MTP_USER_PROFILE_DATA());
  }

  convertUserProfileToViewData(d: UserProfileType): MtpAdministrationProfileViewData {
    let a: MtpAdministrationProfileViewData = new MtpAdministrationProfileViewData();
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    a.firstName = d.first_name;
    a.lastName = d.last_name;
    a.uuid = d.uuid;
    a.email = d.email;
    a.phoneNumber = d.phone_number;
    a.isEnabled = d.is_active ? "Enabled" : "Disabled";
    a.isActive = d.is_active ? 'text-success' : 'text-danger';
    a.groups = d.groups.map(group => group.name);
    a.lastLogin = d.last_login ? datePipe.transform(d.last_login.replace(/\s/g, "T"), environment.unityDateFormat) : 'N/A';
    return a;
  }

  buildBasicDetailsForm(d: MtpAdministrationProfileViewData): FormGroup {
    return this.builder.group({
      'uuid': [d.uuid, [Validators.required]],
      'first_name': [d.firstName, [Validators.required]],
      'last_name': [d.lastName, [Validators.required]],
      'email': [d.email, [Validators.required, Validators.email]],
      'phone_number': [d.phoneNumber, [Validators.required, Validators.pattern('^[0-9]*$')]],
    });
  }

  resetBasicDetailsFormErrors() {
    return {
      'first_name': '',
      'last_name': '',
      'email': '',
      'phone_number': '',
    };
  }

  basicDetailsValidationMessages = {
    'first_name': {
      'required': 'First Name is required'
    },
    'last_name': {
      'required': 'Last Name is required'
    },
    'email': {
      'required': 'Email is required'
    },
    'phone_number': {
      'required': 'Phone Number is required'
    }
  }

  resetPassword() {
    return this.http.post(USER_PROFILE_RESET_PASSWORD(), '')
  }

  updateBasicDetails(data: basicDetailsFormData): Observable<any> {
    return this.http.patch<any>(POST_MTP_USER_PROFILE_DATA(data.uuid), data)
  }

  getActivityLogData(criteria: SearchCriteria): Observable<PaginatedResult<UserProfileActivityLog>> {
    return this.tableService.getData<PaginatedResult<UserProfileActivityLog>>(GET_USER_PROFILE_ACTIVITY_LOG(), criteria);
  }

  convertActivityLogToViewData(data: UserProfileActivityLog[]): UserProfileActivityLogViewData[] {
    let view: UserProfileActivityLogViewData[] = [];
    let datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
    data.map(s => {
      let a: UserProfileActivityLogViewData = new UserProfileActivityLogViewData();
      a.action = s.action;
      a.actor = s.actor;
      a.changes = s.changes;
      a.content_type = s.content_type;
      a.hijacker = s.hijacker;
      a.object_repr = s.object_repr;
      a.remote_addr = s.remote_addr;
      a.timestamp = datePipe.transform(s.timestamp.replace(/\s/g, "T"), environment.unityDateFormat);

      if (a.remote_addr == null) {
        a.remote_addr = 'N/A';
      }
      if (a.actor === null) {
        if (a.content_type.app_label == 'user2') {
          a.actor_email = a.object_repr;
        } else {
          a.actor_email = 'System';
        }
      } else {
        a.actor_email = a.actor.email;
      }
      // a.additional_data = s.additional_data ? s.additional_data.action : null;
      let changes = JSON.parse(s.changes);
      a.changes_log_keys = Object.keys(changes)
      for (let value of Object.values(changes)) {
        if (a.action == 'Created') {
          value[0] = value[1];
        }
      }
      a.changes_log = changes;
      view.push(a);
    });
    return view;
  }
}

export class basicDetailsFormData {
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: number;
}

export class MtpAdministrationProfileViewData {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: string;
  isEnabled: string;
  groups: string[] = [];
  phoneNumber: string;
  lastLogin: string;
  constructor() { }
}

export class UserProfileGroupViewData {
  name: string;
}

interface groupTypes {
  url: string;
  id: number;
  name: string;
}


//Activity Log
export class UserProfileActivityLogViewData {
  action: string;
  actor: Actor;
  actor_email: string;
  user_value: string;
  changes: string;
  changes_log: string;
  changes_log_keys: Array<string>;
  content_type: ContentType;
  hijacker: string;
  id: string;
  object_id: string;
  object_repr: string;
  remote_addr: string;
  timestamp: string;
  additional_data: Array<string>;
}

export class ContentType {
  app_label: string;
  readable_model_name: string;
}
export class Actor {
  email: string;
}
