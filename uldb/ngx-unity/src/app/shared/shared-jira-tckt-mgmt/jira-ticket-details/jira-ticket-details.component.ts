import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from '../../app-notification/app-notification.service';
import { Notification } from '../../app-notification/notification.type';
import { AppSpinnerService } from '../../app-spinner/app-spinner.service';
import { JiraTicketDetailsService, JiraTicketDetailsViewData } from './jira-ticket-details.service';
import { FormGroup } from '@angular/forms';
import { AppUtilityService } from '../../app-utility/app-utility.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'jira-ticket-details',
  templateUrl: './jira-ticket-details.component.html',
  styleUrls: ['./jira-ticket-details.component.scss'],
  providers: [JiraTicketDetailsService]
})
export class JiraTicketDetailsComponent implements OnInit, OnDestroy {
  instanceId: string;
  ticketId: string;

  public ngUnsubscribe = new Subject();
  details: JiraTicketDetailsViewData = new JiraTicketDetailsViewData();
  detailsCopy: JiraTicketDetailsViewData = new JiraTicketDetailsViewData();
  @ViewChild('transitionConfirmRef') transitionConfirmRef: ElementRef;
  transitionConfirmModalRef: BsModalRef;

  commentForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  commentPostedLoader: boolean = true;
  isAuthorised: boolean = true;
  constructor(private detailsService: JiraTicketDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private modalService: BsModalService,) {
    this.route.parent.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.instanceId = params.get('tmId');
    });
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.ticketId = params.get('ticketId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getTicketDetails();
    this.getTransitions();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getTicketDetails();
    this.getTransitions();
  }


  getTicketDetails() {
    this.detailsService.getTicketDetails(this.instanceId, this.ticketId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.details = this.detailsService.converToViewData(this.instanceId, res);
      this.detailsCopy = _clone(this.details);
      this.spinner.stop('main');
    }, (err: Error) => {
      this.isAuthorised = false;
      this.notification.error(new Notification(err.message));
      this.spinner.stop('main');
    });
  }

  transitions: any[] = [];
  getTransitions() {
    this.detailsService.getTransitions(this.instanceId, this.ticketId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.transitions = res;
    });
  }

  changeTransition(priority: string) {
    this.transitionConfirmModalRef = this.modalService.show(this.transitionConfirmRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  cancelTransition() {
    this.details.transitionId = this.detailsCopy.transitionId;
    this.transitionConfirmModalRef.hide();
  }

  confirmTransition() {
    this.spinner.start('main');
    this.transitionConfirmModalRef.hide();
    this.detailsService.changeTransition(this.instanceId, this.ticketId, this.details.transitionId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getTicketDetails();
      this.getTransitions();
    }, err => {
      this.details.transitionId = this.detailsCopy.transitionId;
      this.notification.error(new Notification('Failed to update the state of ticket.'));
    }, () => {
      this.spinner.stop('main');
    });
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
      this.detailsService.addComment(this.instanceId, this.ticketId, this.commentForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.commentPostedLoader = true;
        this.cancelComment();
        this.details.comments.unshift(this.detailsService.converToCommentViewData(res));
        this.spinner.stop('main');
      }, err => {
        this.cancelComment();
        this.notification.error(new Notification('Error while posting ticket comment.'));
        this.spinner.stop('main');
      });
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
