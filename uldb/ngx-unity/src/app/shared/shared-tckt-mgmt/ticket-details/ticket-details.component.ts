import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TabData } from '../../tabdata';
import { TicketDetailsService, TicketDetailsViewData, UserMap, TicketCommentViewData } from './ticket-details.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { takeUntil, first, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppSpinnerService } from '../../app-spinner/app-spinner.service';
import { Priority } from '../../create-ticket/create-ticket.service';
import { FormGroup } from '@angular/forms';
import { AppUtilityService } from '../../app-utility/app-utility.service';
import { AppNotificationService } from '../../app-notification/app-notification.service';
import { Notification } from '../../app-notification/notification.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.scss'],
  providers: [TicketDetailsService]
})
export class TicketDetailsComponent implements OnInit {
  ticketId: string;
  PriorityEnum = Priority;
  userMap: UserMap;
  public ngUnsubscribe = new Subject();
  details: TicketDetailsViewData = new TicketDetailsViewData();
  commentViewData: TicketCommentViewData[] = [];
  commentPostedLoader: boolean = false;
  commentForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  currentPriority: string;
  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  isAuthorised: boolean = true;

  constructor(private detailsService: TicketDetailsService,
    private router: Router,
    private utilService: AppUtilityService,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private notificationService: AppNotificationService,
    private spinner: AppSpinnerService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.ticketId = params.get('ticketId');
    });
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getTicketDetails();
    this.getComments();
  }

  getTicketDetails() {
    this.detailsService.getTicketData(this.ticketId).pipe(take(1)).subscribe(res => {
      this.details = this.detailsService.convertToDetailsViewData(res.result.request);
      this.currentPriority = this.details.priority;
      this.spinner.stop('main');
    }, (err: Error) => {
      this.isAuthorised = false;
      this.notificationService.error(new Notification(err.message));
      this.spinner.stop('main');
    });
  }

  getComments() {
    this.detailsService.getCommentsData(this.ticketId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.userMap = this.detailsService.getUserMap(res.result.users);
      this.commentViewData = this.detailsService.convertToCommentViewData(res.result.comments, this.userMap);
      if (this.commentViewData.length) {
        this.details.attachments = this.commentViewData[this.commentViewData.length - 1].attachments;
      }
      if (this.commentPostedLoader) {
        this.commentPostedLoader = false;
      }
    }, err => {

    });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  changePriority(priority: string) {
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  cancelConfirm() {
    this.details.priority = this.currentPriority;
    this.confirmModalRef.hide();
  }

  confirmChange() {
    this.spinner.start('main');
    this.confirmModalRef.hide();
    this.detailsService.changePriority({ priority: this.details.priority, ticket_id: this.ticketId }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getTicketDetails();
    }, err => {
      this.notificationService.error(new Notification('Error while changing ticket priority.'));
    }, () => {
      this.spinner.stop('main');
    });
  }

  reply() {
    this.commentForm = this.detailsService.buildForm(this.ticketId);
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
      this.detailsService.postComment(this.commentForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.commentPostedLoader = true;
        this.cancelComment();
        this.getComments();
      }, err => {
        this.cancelComment();
        this.notificationService.error(new Notification('Error while posting ticket comment.'));
      }, () => {
        this.spinner.stop('main');
      });
    }
  }
}