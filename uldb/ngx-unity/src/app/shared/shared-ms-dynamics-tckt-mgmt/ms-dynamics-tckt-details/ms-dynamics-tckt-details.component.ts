import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal/';
import { from, Subject } from 'rxjs';
import { filter, mergeMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from '../../app-notification/app-notification.service';
import { Notification } from '../../app-notification/notification.type';
import { AppSpinnerService } from '../../app-spinner/app-spinner.service';
import { AppUtilityService } from '../../app-utility/app-utility.service';
import { MsDynamicsTcktDetailsService, MSDynamicsTicketCommentsViewdata, MSDynamicsTicketDetailsViewData, MSDynamicsTicketStatesName, MSDynamicsTicketTimelineTypes, MSDynamicsTicketTimelineViewData } from './ms-dynamics-tckt-details.service';
import { DynamicCrmFeedbackTicketResolutionType, DynamicCrmFeedbackTicketStateType, DynamicCrmFeedbackTicketStatusType, DynamicCrmTicketResolutionType, DynamicCrmTicketStateType, DynamicCrmTicketStatusType } from '../../SharedEntityTypes/crm.type';

@Component({
  selector: 'ms-dynamics-tckt-details',
  templateUrl: './ms-dynamics-tckt-details.component.html',
  styleUrls: ['./ms-dynamics-tckt-details.component.scss'],
  providers: [MsDynamicsTcktDetailsService]
})
export class MsDynamicsTcktDetailsComponent implements OnInit, OnDestroy {
  ticketId: string;
  ticketType: string;
  public ngUnsubscribe = new Subject();
  details: MSDynamicsTicketDetailsViewData = new MSDynamicsTicketDetailsViewData();
  comments: MSDynamicsTicketCommentsViewdata[] = [];
  instanceId: string;
  commentPostedLoader: boolean = true;

  statesList: DynamicCrmTicketStateType[] | DynamicCrmFeedbackTicketStateType[] = [];
  resolutionTypeList: DynamicCrmTicketResolutionType[] | DynamicCrmFeedbackTicketResolutionType[] = [];
  statusList: DynamicCrmTicketStatusType[] | DynamicCrmFeedbackTicketStatusType[] = [];
  resolvedStateValue: number;
  cancelledStateValue: number;
  activeStateValue: number;

  timeline: MSDynamicsTicketTimelineViewData[] = [];
  timelineTypes = MSDynamicsTicketTimelineTypes;

  noteForm: FormGroup;
  noteFormErrors: any;
  noteFormValidationMessages: any;
  attachmentForm: FormGroup;
  nonFieldErr: string

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  resolveForm: FormGroup;
  resolveFormErrors: any;
  resolveFormValidationMessages: any;

  cancelForm: FormGroup;
  cancelFormErrors: any;
  cancelFormValidationMessages: any;

  @ViewChild('resolveRef') resolveRef: ElementRef;
  @ViewChild('cancelRef') cancelRef: ElementRef;
  @ViewChild('confirmReactivate') confirmReactivate: ElementRef;
  modalRef: BsModalRef;

  isAuthorised: boolean = true;
  currentPriority: string;


  constructor(private detailsService: MsDynamicsTcktDetailsService,
    private router: Router,
    private utilService: AppUtilityService,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private notificationService: AppNotificationService,
    private spinner: AppSpinnerService,
    private sanitizer: DomSanitizer) {
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
    this.getStates();
    this.getTicketTimeline();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getTicketDetails() {
    this.detailsService.getTicketData(this.instanceId, this.ticketId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.details = this.detailsService.converToViewData(res);
      this.currentPriority = this.details.priority;
      this.spinner.stop('main');
    }, (err: Error) => {
      this.isAuthorised = false;
      this.notificationService.error(new Notification(err.message));
      this.spinner.stop('main');
    });
  }

  getStates() {
    this.statesList = [];
    this.detailsService.getStates(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.statesList = res;
      this.getStateValue();
      this.getResolutionTypes();
      this.getStatus();
    });
  }

  getStateValue() {
    this.statesList.forEach(state => {
      if (state.display_name == MSDynamicsTicketStatesName.ACTIVE) {
        this.activeStateValue = state.value;
      } else if (state.display_name == MSDynamicsTicketStatesName.RESOLVED) {
        this.resolvedStateValue = state.value;
      } else if (state.display_name == MSDynamicsTicketStatesName.CANCELLED) {
        this.cancelledStateValue = state.value;
      }
    });
  }

  getResolutionTypes() {
    this.resolutionTypeList = [];
    this.detailsService.getResolutionTypes(this.instanceId, this.resolvedStateValue).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.resolutionTypeList = res;
    });
  }

  getStatus() {
    this.statusList = [];
    this.detailsService.getStatus(this.instanceId, this.cancelledStateValue).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.statusList = res;
    });
  }

  getTicketTimeline() {
    setTimeout(() => {
      this.spinner.start('timeline');
    }, 0)
    this.detailsService.getTicketTimeline(this.instanceId, this.ticketId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.timeline = this.detailsService.convertToTimelineViewData(res);
      this.getNoteAttachments();
      this.spinner.stop('timeline');
    }, (err: Error) => {
      this.spinner.stop('timeline');
    });
  }

  getNoteAttachments() {
    from(this.timeline).pipe(filter(t => t.isDocument),
      mergeMap(t => this.detailsService.getAttachments(this.instanceId, t.uuid).pipe(takeUntil(this.ngUnsubscribe))))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          let index = this.timeline.map(t => t.uuid).indexOf(key);
          const file = res.get(key);
          if (file) {
            this.timeline[index].fileUrl = `data:image/png;base64,${file.document_body}`;
          }
        }
      )
  }

  changePriority(priority: string) {
    if (`${priority}` != this.currentPriority) {
      this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    }
  }

  cancelConfirm() {
    this.details.priority = this.currentPriority;
    this.confirmModalRef.hide();
  }

  confirmChange() {
    this.spinner.start('main');
    this.confirmModalRef.hide();
    this.detailsService.changePriority(this.instanceId, this.details.ticketId, { priority: this.details.priority }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getTicketDetails();
      this.spinner.stop('main');
    }, err => {
      this.details.priority = this.currentPriority;
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Error while changing ticket priority.'));
    });
  }

  downloadAttachment(note: MSDynamicsTicketTimelineViewData) {
    const a: any = document.createElement('a');
    a.href = note.fileUrl;
    a.download = note.fileName;
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();
  }

  refreshData() {
    this.spinner.start('main');
    this.getTicketDetails();
    this.getTicketTimeline();
    this.details = new MSDynamicsTicketDetailsViewData();
    this.timeline = [];
    this.cancelComment();
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  resolve() {
    this.resolveForm = this.detailsService.buildResolveForm();
    this.resolveFormErrors = this.detailsService.resetResolveFormErrors();
    this.resolveFormValidationMessages = this.detailsService.resolveFormValidationMessages;
    this.modalRef = this.modalService.show(this.resolveRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  onResolveSubmit() {
    if (this.resolveForm.invalid) {
      this.resolveFormErrors = this.utilService.validateForm(this.resolveForm, this.resolveFormValidationMessages, this.resolveFormErrors);
      this.resolveForm.valueChanges
        .subscribe((data: any) => { this.resolveFormErrors = this.utilService.validateForm(this.resolveForm, this.resolveFormValidationMessages, this.resolveFormErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.resolveFormErrors = this.detailsService.resetResolveFormErrors();
      this.detailsService.resolve(this.instanceId, this.details.ticketId, this.resolveForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.modalRef.hide();
        this.getTicketDetails();
        this.spinner.stop('main');
      }, err => {
        this.notificationService.error(new Notification('Failed to resolve tickets. Please try again!!'));
        this.spinner.stop('main');
      });
    }
  }

  cancel() {
    this.cancelForm = this.detailsService.buildCancelForm();
    this.cancelFormErrors = this.detailsService.resetCancelFormErrors();
    this.cancelFormValidationMessages = this.detailsService.cancelFormValidationMessages;
    this.modalRef = this.modalService.show(this.cancelRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  onCancelSubmit() {
    if (this.cancelForm.invalid) {
      this.cancelFormErrors = this.utilService.validateForm(this.cancelForm, this.cancelFormValidationMessages, this.cancelFormErrors);
      this.cancelForm.valueChanges
        .subscribe((data: any) => { this.cancelFormErrors = this.utilService.validateForm(this.cancelForm, this.cancelFormValidationMessages, this.cancelFormErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.cancelFormErrors = this.detailsService.resetCancelFormErrors();
      this.detailsService.cancel(this.instanceId, this.details.ticketId, this.cancelledStateValue, this.cancelForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.modalRef.hide();
        this.getTicketDetails();
        this.spinner.stop('main');
      }, err => {
        this.notificationService.error(new Notification('Failed to cancel ticket. Please try again!!'));
        this.spinner.stop('main');
      });
    }
  }

  reactivate() {
    this.confirmModalRef = this.modalService.show(this.confirmReactivate, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmReactivateSubmit() {
    this.spinner.start('main');
    this.detailsService.reactivate(this.instanceId, this.details.ticketId, this.activeStateValue).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmModalRef.hide();
      this.getTicketDetails();
      this.spinner.stop('main');
    }, err => {
      this.notificationService.error(new Notification('Failed to reactivate ticket. Please try again!!'));
      this.spinner.stop('main');
    });
  }

  reply() {
    this.attachmentForm = this.detailsService.buildAttachmentForm();
    this.noteForm = this.detailsService.buildNoteForm(this.details.ticketId);
    this.noteFormErrors = this.detailsService.resetNoteFormErrors();
    this.noteFormValidationMessages = this.detailsService.noteFormValidationMessages;
  }

  cancelComment() {
    this.noteForm = null;
    this.noteFormErrors = null;
    this.noteFormValidationMessages = null;
  }

  get attachments() {
    return Object.keys(this.attachmentForm.controls);
  }

  detectFiles(files: FileList) {
    for (let index = 0; index < files.length; index++) {
      if (this.attachments.includes(files.item(index).name)) {
        continue;
      } else {
        let reader = new FileReader();
        reader.onload = (e: any) => {
          this.attachmentForm.addControl(files.item(index).name, new FormControl(e.target.result));
        }
        reader.readAsDataURL(files.item(index));
      }
    }
  }

  removeFiles(attachment: string) {
    this.attachmentForm.removeControl(attachment);
  }

  onSubmit() {
    if (this.noteForm.invalid) {
      this.noteFormErrors = this.utilService.validateForm(this.noteForm, this.noteFormValidationMessages, this.noteFormErrors);
      this.noteForm.valueChanges
        .subscribe((data: any) => { this.noteFormErrors = this.utilService.validateForm(this.noteForm, this.noteFormValidationMessages, this.noteFormErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.noteFormErrors = this.detailsService.resetNoteFormErrors();
      const data = this.detailsService.toFormData(this.noteForm.getRawValue(), this.attachmentForm.getRawValue());
      this.detailsService.addNote(this.instanceId, data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.commentPostedLoader = true;
        this.cancelComment();
        this.getTicketTimeline();
        this.spinner.stop('main');
      }, err => {
        this.notificationService.error(new Notification('Failed to add ticket notes.'));
        this.spinner.stop('main');
      });
    }
  }

}
