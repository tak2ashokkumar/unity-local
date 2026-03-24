import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CREATE_NOTIFICATION_GROUP, DELETE_NOTIFICATION_GROUP, GET_ALL_NOTIFICATION_GROUP, LIST_USER, TOGGLE_ALL_NOTIFICATION_GROUP, TOGGLE_NOTIFICATION_GROUP, UPDATE_NOTIFICATION_GROUP } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { UnitySetupUser } from 'src/app/shared/SharedEntityTypes/user.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class UnitySetupNotificationGroupService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService) { }

  getNotificationGroup(criteria: SearchCriteria): Observable<PaginatedResult<UnitySetupNotificationGroupType>> {
    let params = this.tableService.getWithParam(criteria);
    return this.http.get<PaginatedResult<UnitySetupNotificationGroupType>>(GET_ALL_NOTIFICATION_GROUP(), { params: params });
  }

  addUserName(users: UnitySetupUser[]): UnitySetupUser[] {
    users.map(user => {
      user['full_name'] = `${user.first_name} ${user.last_name}(${user.email})`;
    })
    return users;
  }

  getUserList(): Observable<UnitySetupUser[]> {
    return this.http.get<UnitySetupUser[]>(`${LIST_USER()}?page_size=0`)
      .pipe(map((res) => this.addUserName(res)));
  }

  convertToViewdata(data: UnitySetupNotificationGroupType[]) {
    let viewData: UnitySetupNotificationViewdata[] = [];
    let enabledCount = 0;
    data.forEach(group => {
      let view = new UnitySetupNotificationViewdata();
      view.uuid = group.uuid;
      view.groupName = group.group_name;
      view.users = group.users.length ? group.users : [];
      view.user = group.users.length ? group.users.getFirst() : '';
      view.extraUsersList = group.users.length ? group.users.slice(1) : [];
      view.usersBadgeCount = group.users.length ? group.users.length - 1 : 0;
      view.alertType = group.alert_type;
      view.mode = group.mode == 'sms' ? 'SMS' : group.mode == 'email' ? 'Email' : group.mode == 'ms_teams' ? 'MS Teams' : 'N/A';
      view.statusText = group.is_enabled ? 'Enabled' : 'Disabled';
      view.status = group.is_enabled;
      view.statusIcon = group.is_enabled ? 'fa-toggle-on' : 'fa-toggle-off';
      view.statusTooltip = group.is_enabled ? 'Disable' : 'Enable';
      enabledCount = group.is_enabled ? enabledCount + 1 : enabledCount;
      view.module = group.module == 'aiml' ? 'AIML' : group.module == 'devops_automation' ? 'Devops Automation' : group.module == 'deprecation' ? 'Deprecation' : 'N/A';
      viewData.push(view);
    });
    return { viewData: viewData, enabledCount: enabledCount };
  }

  resetFormErrors() {
    return {
      'group_name': '',
      'alert_type': '',
      'users': '',
      'mode': ''
    };
  }

  validationMessages = {
    'group_name': {
      'required': 'Group name is required'
    },
    'alert_type': {
      'required': 'Alert type is required'
    },
    'users': {
      'required': 'Users is required'
    },
    'mode': {
      'required': 'Mode is required'
    }
  }

  createForm(data?: UnitySetupNotificationViewdata): FormGroup {
    return this.builder.group({
      'group_name': [data ? data.groupName : '', [Validators.required, NoWhitespaceValidator]],
      'alert_type': [data ? data.alertType : [], [Validators.required]],
      'users': ['', [Validators.required, NoWhitespaceValidator]],
      'mode': [data ? data.mode : ['email'], [Validators.required]],
      'is_enabled': [data ? data.status : true]
    });
  }

  createGroup(data: UnitySetupNotificationGroupType) {
    return this.http.post(CREATE_NOTIFICATION_GROUP(), data);
  }

  updateGroup(uuid: string, data: UnitySetupNotificationGroupType) {
    return this.http.put(UPDATE_NOTIFICATION_GROUP(uuid), data);
  }

  deleteGroup(uuid: string) {
    return this.http.delete(DELETE_NOTIFICATION_GROUP(uuid));
  }

  toggleGroup(uuid: string, data?: { disable: boolean }) {
    return this.http.get(TOGGLE_NOTIFICATION_GROUP(uuid));
  }

  toggleAllGroup(data?: { disable: boolean }) {
    return this.http.get(TOGGLE_ALL_NOTIFICATION_GROUP());
  }
}

export class UnitySetupNotificationViewdata {
  constructor() { }
  uuid: string;
  groupName: string;
  user: string;
  users: string[];
  extraUsersList: string[];
  usersBadgeCount: number;
  alertType: string[];
  mode: string;
  statusText: string;
  status: boolean;
  statusIcon: string;
  statusTooltip: string;
  module: string;
}

export interface UnitySetupNotificationGroupType {
  uuid: string;
  group_name: string;
  mode: string;
  alert_type: string[];
  notify: number;
  users: string[];
  webhook_url: string;
  filter_type: string;
  is_enabled: boolean;
  filter_rule_meta: FilterRuleMeta;
  description: string;
  custom_filter_meta: CustomFilterMeta;
  module: string;
  devops_type: string[];
}

interface FilterRuleMeta {
  condition: string;
  rules: RulesDataType[];
}
interface RulesDataType {
  field?: string;
  operator?: string;
  value?: number | string | string[];
  condition?: string;
  rules?: RulesDataType[];
  validationMessage?: string;
}
interface CustomFilterMeta {
  device_types: string[];
  device_list: DevicesListDataType[];
  triggers: TriggersListDataType[];
  execution_type: string;
  scope: string;
  tasks: string[];
  workflows: string[];
}

export interface DevicesListDataType {
  uuid: string;
  name: string;
  device_type: string;
}
export interface TriggersListDataType {
  trigger_id: number;
  name: string;
  expression: string;
  state: string;
  severity: string;
  disabled: boolean;
  mode: number;
  can_update: boolean;
  can_delete: boolean;
  device_name: string;
  device_type: string;
  device_uuid: string;
}

export interface AlertTypeListDataType {
  label: string;
  value: string;

  //added for UI purpose
  type: string;
  isDisabled: boolean;
}