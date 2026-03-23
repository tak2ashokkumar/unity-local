import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CreateFeedbackTicketService, FEEDBACK_TICKET_PRIORITIES } from './create-feedback-ticket.service';
import { FormGroup } from '@angular/forms';
import { TicketInput } from '../../create-ticket/create-ticket.service';
import { AppUtilityService } from '../../app-utility/app-utility.service';
import { AppNotificationService } from '../../app-notification/app-notification.service';
import { AppSpinnerService } from '../../app-spinner/app-spinner.service';

@Component({
  selector: 'create-feedback-ticket',
  templateUrl: './create-feedback-ticket.component.html',
  styleUrls: ['./create-feedback-ticket.component.scss'],
  providers: [CreateFeedbackTicketService]
})
export class CreateFeedbackTicketComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  metadata: TicketInput;
  ticketPriorityList = FEEDBACK_TICKET_PRIORITIES;

  ticketForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  constructor(private ticketSvc: CreateFeedbackTicketService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,) {
    this.ticketSvc.feedbackTicketAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.metadata = param.input;
      this.buildForm();
    })
    this.ticketSvc.submitAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.submit();
    });
    this.ticketSvc.errorAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.handleError(res);
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  buildForm() {
    this.ticketForm = this.ticketSvc.buildForm(this.metadata);
    this.formErrors = this.ticketSvc.resetFormErrors();
    this.validationMessages = this.ticketSvc.validationMessages;
  }

  getReadableTicketType(type: string) {
    return type.split('_').join(" ");
  }

  handleError(err: any) {
    this.formErrors = this.ticketSvc.resetFormErrors();
    if (err) {
      for (const field in err) {
        if (field in this.ticketForm.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    }
  }

  submit() {
    this.ticketSvc.updateFormValue(this.ticketForm);
    if (this.ticketForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.ticketForm, this.validationMessages, this.formErrors);
      this.ticketForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.ticketForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.formErrors = this.ticketSvc.resetFormErrors();
      const data = this.ticketSvc.toFormData(this.ticketForm.getRawValue());
      this.ticketSvc.updateFormValue(this.ticketForm, data);
    }
  }

}
