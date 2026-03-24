import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TicketMgmtList } from 'src/app/shared/SharedEntityTypes/ticket-mgmt-list.type';
import { GET_TICKET_MGMT_LIST, GET_USER_PROFILE, GET_ZENDESK_STATUS, LIST_USER, UNITY_ORG_SETTINGS, UNITY_ORG_SETTINGS_DETAILS, UPDATE_PASSWORD, UPDATE_TIMEZONE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { LLMConfig, UnityOrganizationSettings } from './user-profile-settings.type';
import { AppDashboardListType } from 'src/app/app-dashboard/app-dashboard.type';
import { AILLMModel } from 'src/app/shared/SharedEntityTypes/ai-chatbot/llm-model.type';

@Injectable()
export class UserProfileSettingsService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService,
    private builder: FormBuilder) { }

  getUserProfile(): Observable<ProfileSettingsUser> {
    return this.http.get<PaginatedResult<ProfileSettingsUser>>(GET_USER_PROFILE()).pipe(map(res => res.results[0]));
  }

  convertToViewData(user: ProfileSettingsUser): UserProfileViewData {
    let viewData: UserProfileViewData = new UserProfileViewData();
    viewData.fullName = user.first_name + ' ' + user.last_name;
    viewData.email = user.email;
    viewData.lastLogin = user.last_login ? this.utilSvc.toUnityOneDateFormat(user.last_login) : 'N/A';
    viewData.userTimeZone = user.timezone;
    viewData.twoFactorAuth = user.has_two_factor ? 'Enabled' : 'Disabled';
    viewData.activeRbacRoles = user.active_rbac_roles[0];
    viewData.roles = user.active_rbac_roles;
    user.groups.forEach(group => viewData.groups.push({ name: group.name }));
    viewData.accessTypes = user.access_types;
    viewData.userId = user.uuid;
    return viewData;
  }

  getOrganizationSettings(): Observable<UnityOrganizationSettings[]> {
    return this.http.get<UnityOrganizationSettings[]>(UNITY_ORG_SETTINGS());
  }

  updateOrgSettings(settings: UnityOrganizationSettings): Observable<UnityOrganizationSettings> {
    return this.http.put<UnityOrganizationSettings>(UNITY_ORG_SETTINGS_DETAILS(settings.uuid), settings);
  }

  getTcktMgmtList() {
    return this.http.get<TicketMgmtList[]>(GET_TICKET_MGMT_LIST());
  }

  buildAutoTicketingForm(settings: UnityOrganizationSettings): FormGroup {
    return this.builder.group({
      'ticketing_instance': [settings.ticketing_instance, [Validators.required]],
      'auto_ticketing_severity': [settings.auto_ticketing_severity ? settings.auto_ticketing_severity : ["critical", "warning", "information"], [Validators.required]],
      'auto_ticketing_delay': [settings.auto_ticketing_delay, [Validators.required, Validators.pattern('^[0-9]*$')]],
      'ticket_subject_format': [settings.ticket_subject_format ? settings.ticket_subject_format : null],
    });
  }

  resetAutoTicketingFormErrors() {
    return {
      'ticketing_instance': '',
      'auto_ticketing_severity': '',
      'auto_ticketing_delay': '',
      'ticket_subject_format': '',
    }
  }

  autoTicketingFormValidationMessages = {
    'ticketing_instance': {
      'required': 'ITSM Instance is required'
    },
    'auto_ticketing_severity': {
      'required': 'Severity is required',
    },
    'auto_ticketing_delay': {
      'pattern': 'Only a positive number is allowed',
      'required': 'Delay is required'
    }
  }

  saveSettings(obj: UnityOrganizationSettings): Observable<any> {
    return this.http.put<any>(UNITY_ORG_SETTINGS_DETAILS(obj.uuid), obj);
  }

  getZendeskStatus(): Observable<string> {
    return this.http.get<string>(GET_ZENDESK_STATUS());
  }

  addUserName(users: User[]) {
    users.map(user => {
      user['full_name'] = `${user.first_name} ${user.last_name}(${user.email})`;
    })
    return users;
  }

  getUserList(): Observable<User[]> {
    return this.http.get<User[]>(`${LIST_USER()}?page_size=0`)
      .pipe(map(res => this.addUserName(res)));
  }

  buildchangePasswordForm(): FormGroup {
    return this.builder.group({
      'old_pass': ['', [Validators.required, NoWhitespaceValidator]],
      'pass1': ['', [Validators.required, Validators.minLength(8), NoWhitespaceValidator]],
      'pass2': ['', [Validators.required, Validators.minLength(8), NoWhitespaceValidator, RxwebValidators.compare({ fieldName: 'pass1' })]],
    });
  }

  resetChangePasswordFormErrors(): any {
    let formErrors = {
      'old_pass': '',
      'pass1': '',
      'pass2': ''
    };
    return formErrors;
  }

  changePasswordValidationMessages = {
    'old_pass': {
      'required': 'Old Password is required'
    },
    'pass1': {
      'required': 'New Password is required',
      'minlength': 'Must be at least 8 characters long'
    },
    'pass2': {
      'required': 'Confirm Password is required',
      'minlength': 'Must be at least 8 characters long',
      'compare': 'Passwords must match'
    }
  };

  updatePassword(data: UpdatePasswordType) {
    return this.http.post(UPDATE_PASSWORD(), data, { responseType: 'text' });
  }

  buildChangeTZForm(user: UserProfileViewData) {
    return this.builder.group({
      'timezone': [user.userTimeZone],
      'uuid': [user.userId],
    });
  }

  updateTimezone(data: UpdateTimeZoneType) {
    return this.http.post(UPDATE_TIMEZONE(), data);
  }

  getDashboardList(): Observable<AppDashboardListType[]> {
    return this.http.get<AppDashboardListType[]>('/customer/persona/dashboards/?page_size=0');
  }

  setDefaultDashboard(dashboardId: string): Observable<any> {
    let dashboard = { 'dashboard_uuid': dashboardId };
    return this.http.put(`customer/uldbusers/set_default_dashboard/`, dashboard);
  }

  getLLMList(): Observable<PaginatedResult<AILLMModel>> {
    return this.http.get<PaginatedResult<AILLMModel>>(`/mcp/user-llm-config/`);
  }

  enableModel(modelId: string): Observable<any> {
    let obj = { active_model: modelId }
    return this.http.post(`mcp/user-session-config/`, obj);
  }

  deleteModel(modelId: string): Observable<any> {
    return this.http.delete(`mcp/user-llm-config/${modelId}`)
  }

  convertToLLMListViewData(data: AILLMModel[]) {
    let viewData: LlmConfigViewData[] = [];
    data.forEach(a => {
      let td: LlmConfigViewData = new LlmConfigViewData();
      td.id = a.id;
      td.provider = a.provider;
      td.modelName = a.model_name;
      td.activeFor = a.active_for_applications?.length ? a.active_for_applications.map(app =>
        app.replace(/_/g, ' ').replace(/\b./g, m => m.toUpperCase())
      ): [];
      td.description = a.description;
      td.endpointUrl = a.endpoint_url ? a.endpoint_url : 'NA';
      viewData.push(td);
    });
    return viewData;
  }

}

export class UserProfileViewData {
  fullName: string;
  userId: string;
  email: string;
  lastLogin: string;
  activeRbacRoles: string;
  userTimeZone: string;
  twoFactorAuth: string;
  zendeskStatus: string;
  roles: string[] = [];
  groups: UserProfileGroupViewData[] = [];
  accessTypes: { name: string; description: string }[] = [];
  constructor() { }
}
export class UserProfileGroupViewData {
  name: string;
}

interface UpdatePasswordType {
  old_pass: string;
  pass1: string;
  pass2: string;
}

interface UpdateTimeZoneType {
  uuid: string;
  timezone: string;
}

export class LlmConfigViewData {
  constructor() { };
  id: number;
  provider: string;
  modelName: string;
  description: string;
  endpointUrl: string;
  activeFor: string[];
}

export const providerImages = {
  openai: 'static/assets/images/external-brand/ai-models/openai.svg',
  anthropic: 'static/assets/images/external-brand/ai-models/claude-color.svg',
  google: 'static/assets/images/external-brand/ai-models/gemini.svg',
  groq: 'static/assets/images/external-brand/ai-models/grok.svg'
};