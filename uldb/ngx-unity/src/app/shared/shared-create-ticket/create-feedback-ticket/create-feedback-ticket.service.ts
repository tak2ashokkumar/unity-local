import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MS_DYNAMICS_TICKET_TYPE, NoWhitespaceValidator } from '../../app-utility/app-utility.service';
import { UnityTicketInput } from '../shared-create-ticket.service';

@Injectable({
  providedIn: 'root'
})
export class CreateFeedbackTicketService {
  private feedbackTicketAnnouncedSource = new Subject<{ input: UnityTicketInput }>();
  feedbackTicketAnnounced$ = this.feedbackTicketAnnouncedSource.asObservable();

  private crmSubmitAnnouncedSource = new Subject<string>();
  submitAnnounced$ = this.crmSubmitAnnouncedSource.asObservable();

  private crmErrorAnnouncedSource = new Subject<any>();
  errorAnnounced$ = this.crmErrorAnnouncedSource.asObservable();

  form: FormGroup;
  formData: FormData;
  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  createTicket(input: UnityTicketInput) {
    this.feedbackTicketAnnouncedSource.next({ input: input });
  }

  submit() {
    this.crmSubmitAnnouncedSource.next();
  }

  handleError(err: any) {
    this.crmErrorAnnouncedSource.next(err);
  }

  buildForm(data: UnityTicketInput): FormGroup {
    this.resetFormErrors();
    let form = this.builder.group({
      'subject': [data.subject, [Validators.required, NoWhitespaceValidator]],
      'collaborators': ['', [NoWhitespaceValidator]],
      'priority': ['', [Validators.required, NoWhitespaceValidator]],
      'metadata': [data.metadata, [NoWhitespaceValidator]],
      'description': ['', [Validators.required, NoWhitespaceValidator]],
    });
    return form;
  }

  resetFormErrors(): any {
    let formErrors: any = {
      'subject': '',
      'collaborators': '',
      'priority': '',
      'description': '',
    };
    return formErrors;
  }

  validationMessages = {
    'subject': {
      'required': 'Subject is required'
    },
    'priority': {
      'required': 'Priority is required'
    },
    'description': {
      'required': 'Description is required'
    },
  };

  toFormData<T>(formValue: T) {
    const formData = new FormData();
    for (const key of Object.keys(formValue)) {
      const value = formValue[key];
      formData.append(key, value);
    }
    return formData;
  }

  updateFormValue(form: FormGroup, data?: FormData) {
    this.form = form;
    if (data) {
      this.formData = data;
    }
  }

  isInvalid() {
    return this.form.invalid;
  }

  getFormValue() {
    return this.form.getRawValue();
  }

  getFormDataObj() {
    return this.formData;
  }
}

export enum FeedbackTicketPriorityType {
  CRITICAL = 'Critical',
  HIGH = 'High',
  NORMAL = 'Normal',
  LOW = 'Low'
}

export const FEEDBACK_TICKET_PRIORITIES = [
  FeedbackTicketPriorityType.CRITICAL, FeedbackTicketPriorityType.HIGH, FeedbackTicketPriorityType.CRITICAL, FeedbackTicketPriorityType.LOW
];


