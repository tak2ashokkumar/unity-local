import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService, NoWhitespaceValidator } from '../../app-utility/app-utility.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from '../../app-notification/app-notification.service';
import { AppSpinnerService } from '../../app-spinner/app-spinner.service';
import { AttachmentViewdata, CommentViewdata, NowEnhancedTicketDetailsService, similarTicketsViewData, TicketDetailsViewData } from './now-enhanced-ticket-details.service';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Notification } from '../../app-notification/notification.type';
import { environment } from 'src/environments/environment';
import { StorageService, StorageType } from '../../app-storage/storage.service';

@Component({
  selector: 'now-enhanced-ticket-details',
  templateUrl: './now-enhanced-ticket-details.component.html',
  styleUrls: ['./now-enhanced-ticket-details.component.scss'],
  providers: [NowEnhancedTicketDetailsService]
})
export class NowEnhancedTicketDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  instanceId: string;
  ticketId: string;
  selectedTicketSysId: string;
  isAllTicketsTabActive: boolean = false;
  viewData: TicketDetailsViewData = new TicketDetailsViewData();

  attachments: AttachmentViewdata[] = [];

  nonFieldErr: string = '';
  sopForm: FormGroup;
  sopFormErrors: any;
  sopFormValidationMessages: any;

  @ViewChild('sopFormFormRef') sopFormFormRef: ElementRef;
  modalRef: BsModalRef;

  comments: CommentViewdata[] = [];
  commentPostedLoader: boolean = false;

  commentForm: FormGroup;
  commentFormErrors: any;
  commentValidationMessages: any;

  aiRecomendationImg: string = `${environment.assetsUrl}stars.svg`;
  constructor(private svc: NowEnhancedTicketDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private modalService: BsModalService,
    private notificationSvc: AppNotificationService,
    private spinner: AppSpinnerService,
    private storage: StorageService) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.instanceId = params.get('tmId');
    });
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.ticketId = params.get('ticketId');
      this.spinner.start('main');
      this.isAllTicketsTabActive = this.router.url.split('/').includes('nowtickets');
      this.selectedTicketSysId = this.storage.getByKey('selectedTicketSysId', StorageType.SESSIONSTORAGE);
      this.getTicketDetails();
      this.getAttachments();
      this.getComments();
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.router.url.split('/').pop() != 'enhanced-details') {
      this.storage.removeByKey('selectedTicketSysId', StorageType.SESSIONSTORAGE);
    }
  }

  getTicketDetails() {
    this.svc.getTicketDetails(this.ticketId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.svc.convertToViewData(res, this.instanceId, this.isAllTicketsTabActive);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = new TicketDetailsViewData();
      this.notificationSvc.error(new Notification('Failed to get Ticket Details.'));
      this.spinner.stop('main');
    })
  }

  goToSimilarTicketsDetails(st: similarTicketsViewData) {
    this.storage.put('selectedTicketSysId', st.sysId, StorageType.SESSIONSTORAGE);
    this.router.navigateByUrl(st.ticketDetailsPageUrl);
  }

  getAttachments() {
    this.svc.getAttachments(this.instanceId, this.selectedTicketSysId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.attachments = this.svc.convertToAttachemntsViewData(res);
    }, (err: Error) => {
      this.attachments = [];
      this.notificationSvc.error(new Notification('Error while loading attachments'));
    });
  }

  buildSopForm() {
    this.sopForm = this.svc.buildSopForm(this.viewData.sopSteps, this.viewData.isUserVerified);
    this.sopFormErrors = this.svc.resetSopFormFormErrors();
    this.sopFormValidationMessages = this.svc.sopFormFormValidationMessages;
    for (let i = 0; i < this.sopSteps?.length; i++) {
      this.sopFormErrors.sop_steps.push('')
      this.sopFormValidationMessages.sop_steps.push({ 'required': 'Enter SOP data' })
    }
    this.modalRef = this.modalService.show(this.sopFormFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  get sopSteps(): FormArray {
    return this.sopForm.get('sop_steps') as FormArray;
  }

  addSopStep(index: number) {
    let ctrl = <FormControl>this.sopSteps.at(index);
    if (ctrl && ctrl.invalid) {
      this.sopFormErrors.sop_steps[index] = ctrl.invalid ? 'Enter SOP data' : '';
      return;
    } else {
      this.sopFormErrors.sop_steps[index] = '';
      this.sopFormValidationMessages.sop_steps.splice(index + 1, 0, { 'required': 'Enter SOP data' });
      this.sopFormErrors.sop_steps.splice(index + 1, 0, '');
      setTimeout(() => {
        this.sopSteps.insert(index + 1, new FormControl('', [Validators.required, NoWhitespaceValidator]));
      }, 0)
    }
  }

  removeSopStep(index: number) {
    this.sopSteps.removeAt(index);
    this.sopFormErrors.sop_steps.splice(index, 1);
    this.sopFormValidationMessages.sop_steps.splice(index, 1);
  }

  handleError(err: any) {
    this.sopFormErrors = this.svc.resetSopFormFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        this.sopFormErrors[field] = err[field][0];
      }
    } else {
      this.modalRef.hide();
      this.notificationSvc.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  editAndVerfiySop() {
    if (this.sopForm.invalid) {
      this.sopFormErrors = this.utilService.validateForm(this.sopForm, this.sopFormValidationMessages, this.sopFormErrors);
      this.sopForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.sopFormErrors = this.utilService.validateForm(this.sopForm, this.sopFormValidationMessages, this.sopFormErrors); });
    } else {
      this.spinner.start('main');
      const convertedSteps = JSON.stringify(this.sopForm.getRawValue()?.sop_steps);
      let obj = Object.assign({}, this.sopForm.getRawValue(), { 'sop_steps': convertedSteps });
      this.svc.sopUpate(this.ticketId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.getTicketDetails();
        this.modalRef.hide();
        this.notificationSvc.success(new Notification('SOP Updated Successfully.'));
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  getComments() {
    this.svc.getComments(this.instanceId, this.selectedTicketSysId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.comments = this.svc.convertToCommentsViewData(res);
      if (this.commentPostedLoader) {
        this.commentPostedLoader = false;
      }
    }, (err: Error) => {
      this.comments = [];
      this.notificationSvc.error(new Notification('Error while loading attachments'));
    });
  }

  reply() {
    this.commentForm = this.svc.buildForm();
    this.commentFormErrors = this.svc.resetCommentFormErrors();
    this.commentValidationMessages = this.svc.commentFormValidationMessages;
  }

  cancelComment() {
    this.commentForm = null;
    this.commentFormErrors = null;
    this.commentValidationMessages = null;
  }

  onCommentSubmit() {
    if (this.commentForm.invalid) {
      this.commentFormErrors = this.utilService.validateForm(this.commentForm, this.commentValidationMessages, this.commentFormErrors);
      this.commentForm.valueChanges
        .subscribe((data: any) => { this.commentFormErrors = this.utilService.validateForm(this.commentForm, this.commentValidationMessages, this.commentFormErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.commentFormErrors = this.svc.resetCommentFormErrors();
      this.svc.postComment(this.instanceId, this.viewData.sysId, this.viewData.ticketType, this.commentForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.commentPostedLoader = true;
        this.cancelComment();
        this.getComments();
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.cancelComment();
        this.notificationSvc.error(new Notification('Error while posting ticket comment.'));
        this.spinner.stop('main');
      });
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
