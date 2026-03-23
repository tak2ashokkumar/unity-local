import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { GET_SERVICE_CATEGORY, GET_TERMS_BY_SERVICE_CATALOGUE, SERVICE_CATALOG_BY_DEVICE_TYPE } from '../../api-endpoint.const';
import { DeviceMapping, NoWhitespaceValidator } from '../../app-utility/app-utility.service';
import { DeviceServiceCatalog, DeviceServiceCatalogTerms } from '../../create-ticket/device-service-catalog.type';
import { UnityTicketInput } from '../shared-create-ticket.service';
import { catchError } from 'rxjs/operators';
import { JiraInstanceProjects, JiraTicketIssueType, JiraTicketPriorityType, JiraTicketQueueType, JiraTicketRequestType, JiraTicketRequestTypeField } from '../../SharedEntityTypes/jira.type';

@Injectable({
  providedIn: 'root'
})
export class CreateJiraTicketService {
  private jiraTicketAnnouncedSource = new Subject<{ input: UnityTicketInput, instanceId: string, deviceMapping: DeviceMapping }>();
  jiraTicketAnnounced$ = this.jiraTicketAnnouncedSource.asObservable();

  private submitAnnouncedSource = new Subject<string>();
  submitAnnounced$ = this.submitAnnouncedSource.asObservable();

  private errorAnnouncedSource = new Subject<any>();
  errorAnnounced$ = this.errorAnnouncedSource.asObservable();

  ticketForm: FormGroup;
  customFieldsForm: FormGroup;
  formData: FormData;
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  createTicket(input: UnityTicketInput, instanceId: string, deviceMapping?: DeviceMapping,) {
    this.jiraTicketAnnouncedSource.next({ input: input, instanceId: instanceId, deviceMapping: deviceMapping });
  }

  submit() {
    this.submitAnnouncedSource.next();
  }

  handleError(err: any) {
    this.errorAnnouncedSource.next(err);
  }

  getProjects(instanceId: string): Observable<JiraInstanceProjects> {
    return this.http.get<JiraInstanceProjects>(`/customer/jira/instances/${instanceId}/projects_list/`);
  }

  getQueues(instanceId: string, projectId: string, serviceDeskId: string): Observable<JiraTicketQueueType[]> {
    return this.http.get<JiraTicketQueueType[]>(`/customer/jira/instances/${instanceId}/all_queues/?project_id=${projectId}&serviceDeskId=${serviceDeskId}`);
  }

  getIssueTypes(instanceId: string, projectId: string): Observable<JiraTicketIssueType[]> {
    return this.http.get<JiraTicketIssueType[]>(`/customer/jira/instances/${instanceId}/issue_types/?project_id=${projectId}`);
  }

  getPriorityTypes(instanceId: string, projectId: string): Observable<JiraTicketPriorityType[]> {
    return this.http.get<JiraTicketPriorityType[]>(`/customer/jira/instances/${instanceId}/priority/?project_id=${projectId}`);
  }

  getRequestTypes(instanceId: string, serviceDeskId: string) {
    return this.http.get<JiraTicketRequestType[]>(`/customer/jira/instances/${instanceId}/request_types/?serviceDeskId=${serviceDeskId}`);
  }

  getDropdownData(instanceId: string, projectId: string, serviceDeskId: string): Observable<{ issues: JiraTicketIssueType[], priorities: JiraTicketPriorityType[], requestTypes: JiraTicketRequestType[] }> {
    return forkJoin({
      // queues: this.getQueues(instanceId, serviceDeskId).pipe(catchError(error => of(undefined))),
      issues: this.getIssueTypes(instanceId, projectId).pipe(catchError(error => of(undefined))),
      priorities: this.getPriorityTypes(instanceId, projectId).pipe(catchError(error => of(undefined))),
      requestTypes: this.getRequestTypes(instanceId, serviceDeskId).pipe(catchError(error => of(undefined))),
    })
  }

  buildForm(data: UnityTicketInput): FormGroup {
    this.resetFormErrors();
    let form = this.builder.group({
      'project': [{ value: null, disabled: data.projectId ? true : false }, [Validators.required, NoWhitespaceValidator]],
      'issuetype': [data.type ? data.type : null, [Validators.required, NoWhitespaceValidator]],
      'request_type': [null, [Validators.required, NoWhitespaceValidator]],
      'subject': [data.subject, [Validators.required, NoWhitespaceValidator]],
      'collaborators': ['', NoWhitespaceValidator],
      'priority': [null, [Validators.required, NoWhitespaceValidator]],
      'metadata': [data.metadata, NoWhitespaceValidator],
    });
    if (data.webaccess) {
      form.addControl('weburl', new FormControl('', [Validators.required, NoWhitespaceValidator, Validators.pattern(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?|^((http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)]));
    } else {
      form.addControl('description', new FormControl('', [Validators.required, NoWhitespaceValidator]));
    }
    return form;
  }

  resetFormErrors(): any {
    let formErrors: any = {
      'project': '',
      'issuetype': '',
      'request_type': '',
      'subject': '',
      'collaborators': '',
      'priority': '',
      'description': '',
      'weburl': '',
    };
    return formErrors;
  }

  validationMessages = {
    'project': {
      'required': 'Project is required'
    },
    'issuetype': {
      'required': 'Issue type is required'
    },
    'request_type': {
      'required': 'Request type is required'
    },
    'subject': {
      'required': 'Subject is required'
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

  getServiceCategory(): Observable<Array<string>> {
    return this.http.get<Array<string>>(GET_SERVICE_CATEGORY());
  }

  getServiceCatalog(deviceMapping: DeviceMapping) {
    return this.http.get<DeviceServiceCatalog[]>(SERVICE_CATALOG_BY_DEVICE_TYPE(deviceMapping));
  }

  getTermsByServiceCatalogue(catalogueId: number) {
    return this.http.get<DeviceServiceCatalogTerms[]>(GET_TERMS_BY_SERVICE_CATALOGUE(catalogueId));
  }

  getRequestTypeFields(instanceId: string, serviceDeskId: string, requestTypeId: string): Observable<JiraTicketRequestTypeField[]> {
    return this.http.get<JiraTicketRequestTypeField[]>(`/customer/jira/instances/${instanceId}/request_types_fields/?serviceDeskId=${serviceDeskId}&requestTypeId=${requestTypeId}`);
  }

  buildCustomForm(requestTypeFields: JiraTicketRequestTypeField[]): FormGroup {
    let form: FormGroup = this.builder.group({});
    requestTypeFields.forEach(rf => {
      form.addControl(rf.fieldId, new FormControl('', rf.required ? [Validators.required, NoWhitespaceValidator] : []));
    })
    return form;
  }

  resetCustomFieldFormErrors(requestTypeFields: JiraTicketRequestTypeField[]): any {
    return requestTypeFields.reduce((o, field) => ({ ...o, [field.fieldId]: '' }), {});
  }

  customFieldFormValidationMessages(requestTypeFields: JiraTicketRequestTypeField[]): any {
    return requestTypeFields.reduce((o, field) => ({ ...o, [field.fieldId]: `${field.name} is required` }), {})
  }

  updateForm(ticketForm: FormGroup, customFieldsForm: FormGroup) {
    this.ticketForm = ticketForm;
    this.customFieldsForm = customFieldsForm;
  }

  toFormataValue(requestTypeFields: JiraTicketRequestTypeField[], key: string, val: any) {
    let selected = requestTypeFields.find(rf => rf.fieldId == key);
    if (selected) {
      return JSON.stringify({ 'field_type': selected.fieldType, 'value': val });
    } else {
      return JSON.stringify({ 'field_type': 'string', 'value': val });
    }
  }

  toFormData<T>(formValue: any, formValue1: any, requestTypeFields: JiraTicketRequestTypeField[]) {
    const formData = new FormData();
    for (const key of Object.keys(formValue)) {
      const value = formValue[key];
      formData.append(key, JSON.stringify(value));
      if (key == 'project') {
        formData.append('project_id', value.project_id);
      }
    }
    if (formValue1) {
      for (const key of Object.keys(formValue1)) {
        const value = formValue1[key];
        formData.append(key, this.toFormataValue(requestTypeFields, key, value));
      }
    }
    return formData;
  }

  setFormData(data: FormData) {
    this.formData = data;
  }

  getFormDataObj() {
    return this.formData;
  }

  isInvalid() {
    if (this.customFieldsForm) {
      return this.ticketForm.invalid || this.customFieldsForm.invalid;
    } else {
      return this.ticketForm.invalid;
    }
  }

  getFormValue() {
    if (this.customFieldsForm) {
      return Object.assign({}, this.ticketForm.getRawValue(), this.customFieldsForm.getRawValue());
    } else {
      return Object.assign({}, this.ticketForm.getRawValue());
    }
  }
}
