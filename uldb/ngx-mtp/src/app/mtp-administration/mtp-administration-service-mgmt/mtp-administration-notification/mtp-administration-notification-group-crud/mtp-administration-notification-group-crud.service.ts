import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AlertNotificationSettings } from 'src/app/shared/SharedEntityTypes/mtp-settings.type';
import { Tenant } from 'src/app/shared/SharedEntityTypes/tenants.type';
import { MTPUserGroupType } from 'src/app/shared/SharedEntityTypes/user.type';
import { GET_GROUPS } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class MtpAdministrationNotificationGroupCrudService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getTenants() {
    return this.http.get<Tenant[]>(`/customer/mtp/tenant/?page_size=0`);
  }

  getUserGroups(): Observable<MTPUserGroupType[]> {
    return this.http.get<MTPUserGroupType[]>(GET_GROUPS(), { params: new HttpParams().set('page_size', 0) });
  }

  getDropdownData(): Observable<{ tenants: Tenant[], userGroups: MTPUserGroupType[] }> {
    return forkJoin({
      tenants: this.getTenants().pipe(catchError(error => of(undefined))),
      userGroups: this.getUserGroups().pipe(catchError(error => of(undefined))),
    });
  }

  createForm(groupId?: string): Observable<FormGroup> {
    if (groupId) {
      return this.http.get<AlertNotificationSettings>(`/customer/mtp/mtp_alert_notification_grp/${groupId}/`).pipe(
        map(group => {
          let tenants : string[] = group.tenants.map(t => t.uuid);
          let userGroups: number[] = group.mtp_groups.map(g => g.id);
          let form = this.builder.group({
            'group_name': [group.group_name, [Validators.required, NoWhitespaceValidator]],
            'tenants': [tenants, [Validators.required]],
            'mtp_groups': [userGroups, [Validators.required]],
            'alert_type': [group.alert_type, [Validators.required]],
            'mode': [group.mode, [Validators.required]],
            'is_enabled': [group.is_enabled]
          });
          return form;
        }));
    } else {
      return of(this.builder.group({
        'group_name': ['', [Validators.required, NoWhitespaceValidator]],
        'tenants': [[], [Validators.required]],
        'mtp_groups': [[], [Validators.required]],
        'alert_type': [[], [Validators.required]],
        'mode': [[], [Validators.required]],
        'is_enabled': [true]
      })).pipe(map(form => {
        return form;
      }));
    }
  }

  resetFormErrors() {
    return {
      'group_name': '',
      'tenants': '',
      'mtp_groups': '',
      'alert_type': '',
      'mode': '',
    };
  }

  validationMessages = {
    'group_name': {
      'required': 'Group name is required'
    },
    'tenants': {
      'required': 'Tenant is required'
    },
    'mtp_groups': {
      'required': 'User Group is required'
    },
    'alert_type': {
      'required': 'Alert types is required'
    },
    'mode': {
      'required': 'Mode is required'
    },
  }

  createGroup(obj: any) {
    return this.http.post<any>(`/customer/mtp/mtp_alert_notification_grp/`, obj);
  }

  updateGroup(groupId: string, obj: any) {
    return this.http.put<any>(`/customer/mtp/mtp_alert_notification_grp/${groupId}/`, obj);
  }
}

export const severityOptions = [
  {
    label: 'Critical',
    value: 'critical'
  },
  {
    label: 'Warning',
    value: 'warning'
  },
  {
    label: 'Information',
    value: 'information'
  },
]

export const modes = [
  {
    label: 'Email',
    value: 'email'
  },
  {
    label: 'SMS',
    value: 'sms'
  },
]
