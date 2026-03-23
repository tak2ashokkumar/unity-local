import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NowTicketDetailsService, ServiceNowTicketDetailsViewData, ServiceNowAttachmentViewdata, ServiceNowCommentViewdata } from './now-ticket-details.service';
import { AppUtilityService } from '../../app-utility/app-utility.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from '../../app-notification/app-notification.service';
import { AppSpinnerService } from '../../app-spinner/app-spinner.service';
import { take, takeUntil } from 'rxjs/operators';
import { Notification } from '../../app-notification/notification.type';
import { TabData } from '../../tabdata';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'now-ticket-details',
  templateUrl: './now-ticket-details.component.html',
  styleUrls: ['./now-ticket-details.component.scss'],
  providers: [NowTicketDetailsService]
})
export class NowTicketDetailsComponent implements OnInit {
  ticketId: string;
  ticketType: string;
  public ngUnsubscribe = new Subject();
  details: ServiceNowTicketDetailsViewData = new ServiceNowTicketDetailsViewData();
  attachments: ServiceNowAttachmentViewdata[] = [];
  comments: ServiceNowCommentViewdata[] = [];
  instanceId: string;
  commentPostedLoader: boolean = true;
  commentForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  constructor(private detailsService: NowTicketDetailsService,
    private router: Router,
    private utilService: AppUtilityService,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private notificationService: AppNotificationService,
    private spinner: AppSpinnerService) {
    this.ticketType = this.route.snapshot.data.type;
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.instanceId = params.get('tmId');
    });
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.ticketId = params.get('ticketId');
    });
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getTicketDetails();
    this.getAttachments();
    this.getComments();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getTicketDetails() {
    this.detailsService.getTicketData(this.instanceId, this.ticketId, this.ticketType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.details = this.detailsService.converToViewData(res);
      // this.currentPriority = this.details.priority;
      this.spinner.stop('main');
    }, (err: Error) => {
      this.notificationService.error(new Notification(err.message));
      this.spinner.stop('main');
    });
  }

  getAttachments() {
    this.detailsService.getAttachments(this.instanceId, this.ticketId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.attachments = this.detailsService.converToAttachementViewdata(res);
    }, (err: Error) => {
      this.notificationService.error(new Notification('Error while loading attachments'));
    });
  }

  getComments() {
    this.detailsService.getComments(this.instanceId, this.ticketId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.comments = this.detailsService.convertToCommentViewData(res);
      if (this.commentPostedLoader) {
        this.commentPostedLoader = false;
      }
    }, (err: Error) => {
      this.notificationService.error(new Notification('Error while loading attachments'));
    });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
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

  onSubmit() {
    if (this.commentForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.commentForm, this.validationMessages, this.formErrors);
      this.commentForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.commentForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.formErrors = this.detailsService.resetFormErrors();
      this.detailsService.postComment(this.instanceId, this.ticketId, this.details.type, this.commentForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.commentPostedLoader = true;
        this.cancelComment();
        this.getComments();
        this.spinner.stop('main');
      }, err => {
        this.cancelComment();
        this.notificationService.error(new Notification('Error while posting ticket comment.'));
        this.spinner.stop('main');
      });
    }
  }

}