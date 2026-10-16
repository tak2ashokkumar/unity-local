import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MTPServiceNowTicketContext } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { MTPServiceNowAttachmentViewdata, MTPServiceNowCommentViewdata, MTPServiceNowTicketDetailsViewData, MTPServiceNowWorklogViewdata, MtpServicenowTicketDetailsService } from './mtp-servicenow-ticket-details.service';

@Component({
  selector: 'mtp-servicenow-ticket-details',
  templateUrl: './mtp-servicenow-ticket-details.component.html',
  styleUrls: ['./mtp-servicenow-ticket-details.component.scss'],
  providers: [MtpServicenowTicketDetailsService]
})
export class MtpServicenowTicketDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private readonly serviceNowTicketSessionKey = 'mtpServiceNowTicketContext';

  ticketContext: MTPServiceNowTicketContext = null;
  details: MTPServiceNowTicketDetailsViewData = new MTPServiceNowTicketDetailsViewData();
  attachments: MTPServiceNowAttachmentViewdata[] = [];
  comments: MTPServiceNowCommentViewdata[] = [];
  worklogs: MTPServiceNowWorklogViewdata[] = [];
  commentPostedLoader = true;
  worklogPostedLoader = true;
  commentForm: FormGroup;
  worklogForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  worklogFormErrors: any;
  worklogValidationMessages: any;

  constructor(private detailsService: MtpServicenowTicketDetailsService,
    private router: Router,
    private utilService: AppUtilityService,
    private notificationService: AppNotificationService,
    private spinner: AppSpinnerService) {
    this.ticketContext = this.getTicketContextFromSessionStorage();
  }

  ngOnInit(): void {
    if (!this.ticketContext || !this.ticketContext.tenantId || !this.ticketContext.sysId || !this.ticketContext.ticketType) {
      this.notificationService.error(new Notification('ServiceNow ticket context is missing.'));
      return;
    }

    this.spinner.start('main');
    this.getTicketDetails();
    this.getAttachments();
    this.getComments();
    this.getWorklogs();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(): void {    
    if (!this.ticketContext || !this.ticketContext.tenantId || !this.ticketContext.sysId || !this.ticketContext.ticketType) {
      this.notificationService.error(new Notification('ServiceNow ticket context is missing.'));
      return;
    }

    this.spinner.start('main');
    this.commentPostedLoader = true;
    this.worklogPostedLoader = true;
    this.getTicketDetails();
    this.getAttachments();
    this.getComments();
    this.getWorklogs();
  }

  getTicketDetails() {
    this.detailsService.getTicketData(this.ticketContext.tenantId, this.ticketContext.sysId, this.ticketContext.ticketType)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.details = this.detailsService.converToViewData(res);
        this.spinner.stop('main');
      }, (err: Error) => {
        this.notificationService.error(new Notification(err.message));
        this.spinner.stop('main');
      });
  }

  getAttachments() {
    this.detailsService.getAttachments(this.ticketContext.tenantId, this.ticketContext.sysId)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.attachments = this.detailsService.converToAttachementViewdata(res);
      }, () => {
        this.notificationService.error(new Notification('Error while loading attachments'));
      });
  }

  getComments() {
    this.detailsService.getComments(this.ticketContext.tenantId, this.ticketContext.sysId)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.comments = this.detailsService.convertToCommentViewData(res);
        if (this.commentPostedLoader) {
          this.commentPostedLoader = false;
        }
      }, () => {
        this.commentPostedLoader = false;
        this.notificationService.error(new Notification('Error while loading comments'));
      });
  }

  getWorklogs() {
    this.detailsService.getWorklogs(this.ticketContext.tenantId, this.ticketContext.sysId)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.worklogs = this.detailsService.convertToWorklogViewData(res);
        if (this.worklogPostedLoader) {
          this.worklogPostedLoader = false;
        }
      }, () => {
        this.worklogPostedLoader = false;
        this.notificationService.error(new Notification('Error while loading worklogs'));
      });
  }

  goBack() {
    this.router.navigate(['ticketmgmt']);
  }

  reply() {
    this.commentForm = this.detailsService.buildForm();
    this.formErrors = this.detailsService.resetFormErrors();
    this.validationMessages = this.detailsService.validationMessages;
  }

  cancelComment() {
    this.commentForm = null;
    this.formErrors = null;
    this.validationMessages = null;
  }

  addWorklog() {
    this.worklogForm = this.detailsService.buildWorklogForm();
    this.worklogFormErrors = this.detailsService.resetWorklogFormErrors();
    this.worklogValidationMessages = this.detailsService.worklogValidationMessages;
  }

  cancelWorklog() {
    this.worklogForm = null;
    this.worklogFormErrors = null;
    this.worklogValidationMessages = null;
  }

  onSubmit() {
    if (this.commentForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.commentForm, this.validationMessages, this.formErrors);
      this.commentForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        this.formErrors = this.utilService.validateForm(this.commentForm, this.validationMessages, this.formErrors);
      });
      return;
    }

    this.spinner.start('main');
    this.formErrors = this.detailsService.resetFormErrors();
    this.detailsService.postComment(this.ticketContext.tenantId, this.ticketContext.sysId, this.ticketContext.ticketType, this.commentForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        this.commentPostedLoader = true;
        this.cancelComment();
        this.getComments();
        this.spinner.stop('main');
      }, () => {
        this.cancelComment();
        this.notificationService.error(new Notification('Error while posting ticket comment.'));
        this.spinner.stop('main');
      });
  }

  onSubmitWorklog() {
    if (this.worklogForm.invalid) {
      this.worklogFormErrors = this.utilService.validateForm(this.worklogForm, this.worklogValidationMessages, this.worklogFormErrors);
      this.worklogForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        this.worklogFormErrors = this.utilService.validateForm(this.worklogForm, this.worklogValidationMessages, this.worklogFormErrors);
      });
      return;
    }

    this.spinner.start('main');
    this.worklogFormErrors = this.detailsService.resetWorklogFormErrors();
    this.detailsService.postWorklog(this.ticketContext.tenantId, this.ticketContext.sysId, this.ticketContext.ticketType, this.worklogForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        this.worklogPostedLoader = true;
        this.cancelWorklog();
        this.getWorklogs();
        this.spinner.stop('main');
      }, () => {
        this.cancelWorklog();
        this.notificationService.error(new Notification('Error while posting ticket worklog.'));
        this.spinner.stop('main');
      });
  }

  private getTicketContextFromSessionStorage(): MTPServiceNowTicketContext {
    const storedTicketContext = sessionStorage.getItem(this.serviceNowTicketSessionKey);

    if (!storedTicketContext) {
      return null;
    }

    try {
      return JSON.parse(storedTicketContext);
    } catch (error) {
      return null;
    }
  }
}
