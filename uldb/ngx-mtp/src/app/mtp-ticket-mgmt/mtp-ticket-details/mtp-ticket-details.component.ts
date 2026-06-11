import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription, from, interval } from 'rxjs';
import { filter, mergeMap, takeUntil } from 'rxjs/operators';
import { MTPTicketDetail, MTPTicketPriorityType, MTPTicketResolutionType, MTPTicketStage, MTPTicketStateType, MTPTicketStatusType, MTPTicketType } from 'src/app/shared/SharedEntityTypes/ticket-mgmt.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, MS_DYNAMICS_TICKET_TYPE, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { MTPTicketDetailsViewData, MTPTicketNoteDetailsViewData, MtpTicketDetailsService, MtpTicketStatesName, MtpTicketStatusValue } from './mtp-ticket-details.service';
import * as moment from 'moment';
import { MtpCrmContactsType } from 'src/app/mtp-administration/mtp-administration-service-mgmt/mtp-administration-service-level-agreement/mtp-administration-sla-crud/mtp-administration-sla-crud.type';
import { HttpErrorResponse } from '@angular/common/http';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'mtp-ticket-details',
  templateUrl: './mtp-ticket-details.component.html',
  styleUrls: ['./mtp-ticket-details.component.scss'],
  providers: [MtpTicketDetailsService]
})
export class MtpTicketDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private responseSLASubscr: Subscription;
  private resolutionSLASubscr: Subscription;

  ticketId: string;
  ticketForm: FormGroup;
  ticketFormErrors: any;
  ticketFormValidationMessages: any;
  ticketTypeOptions = MS_DYNAMICS_TICKET_TYPE;
  contacts: MtpCrmContactsType[] = [];

  details: MTPTicketDetailsViewData = new MTPTicketDetailsViewData();
  ticketDetails: MTPTicketDetail;
  responseDonutStyle: SafeStyle;
  resolutionDonutStyle: SafeStyle;

  attachmentForm: FormGroup;
  nonFieldErr: string;
  noteForm: FormGroup;
  noteFormErrors: any;
  noteFormValidationMessages: any;

  resolveForm: FormGroup;
  resolveFormErrors: any;
  resolveFormValidationMessages: any;

  cancelForm: FormGroup;
  cancelFormErrors: any;
  cancelFormValidationMessages: any;

  @ViewChild('assigneeChangeRef') assigneeChangeRef: ElementRef;
  @ViewChild('stageChangeRef') stageChangeRef: ElementRef;
  @ViewChild('statusChangeRef') statusChangeRef: ElementRef;
  @ViewChild('priorityChangeRef') priorityChangeRef: ElementRef;

  @ViewChild('resolveRef') resolveRef: ElementRef;
  @ViewChild('cancelRef') cancelRef: ElementRef;
  @ViewChild('confirmReactivate') confirmReactivate: ElementRef;
  modalRef: BsModalRef;

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;
  invalidStatusReason: string;

  ticketTypeList: MTPTicketType[] = [];
  ticketStages: MTPTicketStage[] = [];
  ticketStatusList: MTPTicketStatusType[] = [];
  ticketPriorityList: MTPTicketPriorityType[] = [];

  statesList: MTPTicketStateType[] = [];
  resolutionTypeList: MTPTicketResolutionType[] = [];
  cancelStatusList: MTPTicketStatusType[] = [];
  resolvedStateValue: number;
  cancelledStateValue: number;
  activeStateValue: number;
  constructor(private svc: MtpTicketDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private user: UserInfoService,
    private sanitizer: DomSanitizer) {
    this.route.paramMap.subscribe(params => this.ticketId = params.get('id'));
  }

  ngOnInit(): void {
    this.spinner.start('main');
    setTimeout(() => {
      this.getDropdownData();
    })
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.unSubscribeSLACharts();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getDropdownData();
  }

  getDropdownData() {
    this.svc.getDropdownData(this.user.crmInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ types, status, priorities }) => {
      if (types) {
        this.ticketTypeList = _clone(types);
      } else {
        this.ticketTypeList = [];
        this.notification.error(new Notification("Error while fetching issue type list"));
      }

      if (status) {
        this.ticketStatusList = _clone(status);
      } else {
        this.ticketStatusList = [];
        this.notification.error(new Notification("Error while fetching status list"));
      }

      if (priorities) {
        this.ticketPriorityList = _clone(priorities);
      } else {
        this.ticketPriorityList = [];
        this.notification.error(new Notification("Error while fetching priorities list"));
      }

      this.getTicketDetails();
      this.getStates();
    });
  }

  getTicketDetails() {
    this.details = new MTPTicketDetailsViewData();
    this.ticketForm = null;
    this.unSubscribeSLACharts();
    this.svc.getTicketDetails(this.user.crmInstanceId, this.ticketId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ticketDetails = res;
      this.details = this.svc.converToViewData(res);
      if (res.change_stage) {
        this.getTicketStages();
      }
      this.getContacts();
      this.getNoteAttachments();
      this.subscribeToSLACharts(res);
      this.invalidStatusReason = '';
    }, err => {
      this.unSubscribeSLACharts();
      this.invalidStatusReason = '';
      this.details = new MTPTicketDetailsViewData();
      this.spinner.stop('main');
    });
  }

  getTicketStages() {
    this.ticketStages = [];
    this.svc.getTicketStages(this.user.crmInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ticketStages = res;
    });
  }

  getStates() {
    this.statesList = [];
    this.svc.getStates(this.user.crmInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.statesList = res;
      this.getStateValue();
      this.getResolutionTypes();
      this.getCancelStatus();
    });
  }

  getStateValue() {
    this.statesList.forEach(state => {
      if (state.display_name == MtpTicketStatesName.ACTIVE) {
        this.activeStateValue = state.value;
      } else if (state.display_name == MtpTicketStatesName.RESOLVED) {
        this.resolvedStateValue = state.value;
      } else if (state.display_name == MtpTicketStatesName.CANCELLED) {
        this.cancelledStateValue = state.value;
      }
    });
  }

  getResolutionTypes() {
    this.resolutionTypeList = [];
    this.svc.getResolutionTypes(this.user.crmInstanceId, this.resolvedStateValue).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.resolutionTypeList = res;
    });
  }

  getCancelStatus() {
    this.cancelStatusList = [];
    this.svc.getCancelStatus(this.user.crmInstanceId, this.cancelledStateValue).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cancelStatusList = res;
    });
  }

  subscribeToSLACharts(res: MTPTicketDetail) {
    this.updateResponseSLAChart(res);
    this.updateResolutionSLAChart(res);
    if (this.details.statusReasonName == 'New' || this.details.statusReasonName == 'Assigned' || this.details.statusReasonName == 'In Progress') {
      if (!this.details.responseSucceededOn) {
        this.responseSLASubscr = interval(1000).subscribe(x => {
          this.updateResponseSLAChart(res);
        });
      }
      if (!this.details.resolutionSucceededOn) {
        this.resolutionSLASubscr = interval(1000).subscribe(x => {
          this.updateResolutionSLAChart(res);
        });
      }
    } else {
      this.unSubscribeSLACharts();
    }
  }

  unSubscribeSLACharts() {
    this.responseDonutStyle = null;
    if (this.responseSLASubscr) {
      this.responseSLASubscr.unsubscribe();
    }
    this.resolutionDonutStyle = null;
    if (this.resolutionSLASubscr) {
      this.resolutionSLASubscr.unsubscribe();
    }
  }

  updateResponseSLAChart(res: MTPTicketDetail) {
    if (res.response_time) {
      let remainingTime = this.svc.getRemainingTime(res.response_failure_time, res.response_succeeded_on);
      if (remainingTime > 0) {
        if (res.response_succeeded_on) {
          this.details.responseTime = this.svc.secToTime(moment(this.ticketDetails.response_failure_time).diff(moment(res.response_succeeded_on), 's'));
          this.details.isResponseSLASucceeded = true;
        } else {
          this.details.responseTime = this.svc.secToTime(moment(this.ticketDetails.response_failure_time).diff(moment(), 's'));
          this.details.isResponseSLASucceeded = false;
        }
        this.details.isResponseSLABreached = false;
      } else {
        if (res.response_succeeded_on) {
          this.details.responseTime = `-${this.svc.secToTime(moment(this.ticketDetails.response_failure_time).diff(moment(res.response_succeeded_on), 's'))}`;
        } else {
          this.details.responseTime = `-${this.svc.secToTime(Math.abs(remainingTime))}`;
        }
        this.details.isResponseSLASucceeded = false;
        this.details.isResponseSLABreached = true;
      }
      this.responseDonutStyle = this.sanitizer.bypassSecurityTrustStyle(`background: ${this.svc.getGradientDonut(res.created_on, res.response_failure_time, res.response_succeeded_on)}`);
    }
  }

  updateResolutionSLAChart(res: MTPTicketDetail) {
    if (res.resolution_time) {
      let remainingTime = this.svc.getRemainingTime(res.resolution_failure_time, res.resolution_succeeded_on);
      if (remainingTime > 0) {
        if (res.resolution_succeeded_on) {
          this.details.resolutionTime = this.svc.secToTime(moment(this.ticketDetails.resolution_failure_time).diff(moment(res.resolution_succeeded_on), 's'));
          this.details.isResolutionSLASucceeded = true;
          this.details.isResolutionSLAPaused = false;
        } else {
          if (res.status_reason_name == 'Pending' && res.status_change_time) {
            this.details.resolutionTime = this.svc.secToTime(moment(this.ticketDetails.resolution_failure_time).diff(moment(res.status_change_time), 's'));
            this.details.isResolutionSLAPaused = true;
          } else {
            this.details.resolutionTime = this.svc.secToTime(moment(this.ticketDetails.resolution_failure_time).diff(moment(), 's'));
          }
          this.details.isResolutionSLASucceeded = false;
        }
        this.details.isResolutionSLABreached = false;
      } else {
        if (res.resolution_succeeded_on) {
          this.details.resolutionTime = `-${this.svc.secToTime(moment(this.ticketDetails.resolution_failure_time).diff(moment(res.resolution_succeeded_on), 's'))}`;
        } else {
          if (res.status_reason_name == 'Pending' && res.status_change_time) {
            this.details.resolutionTime = this.svc.secToTime(moment(this.ticketDetails.resolution_failure_time).diff(moment(res.status_change_time), 's'));
            this.details.isResolutionSLAPaused = true;
          } else {
            this.details.resolutionTime = `-${this.svc.secToTime(Math.abs(remainingTime))}`;
          }
        }
        this.details.isResolutionSLASucceeded = false;
        this.details.isResolutionSLABreached = true;
      }
      this.resolutionDonutStyle = this.sanitizer.bypassSecurityTrustStyle(`background: ${this.svc.getGradientDonut(res.created_on, res.resolution_failure_time, res.resolution_succeeded_on)}`);
    }
  }

  getNoteAttachments() {
    from(this.details.notes).pipe(filter(n => n.isDocument),
      mergeMap(n => this.svc.getAttachments(this.user.crmInstanceId, n.uuid).pipe(takeUntil(this.ngUnsubscribe))))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          let index = this.details.notes.map(n => n.uuid).indexOf(key);
          const file = res.get(key);
          if (file) {
            this.details.notes[index].fileUrl = `data:image/png;base64,${file.document_body}`;
          }
        }
      )
  }

  getContacts() {
    this.svc.getContacts(this.user.crmInstanceId, this.details.customerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.contacts = res;
      this.buildForm();
      this.spinner.stop('main');
    }, err => {
      this.contacts = [];
      this.buildForm();
      this.spinner.stop('main');
    });
  }

  buildForm() {
    this.ticketForm = this.svc.buildForm(this.ticketDetails);
    this.ticketFormErrors = this.svc.resetFormErrors();
    this.ticketFormValidationMessages = this.svc.formValidationMessages;
    this.ticketForm.updateValueAndValidity();

    this.attachmentForm = this.svc.buildAttachmentForm();

    this.ticketForm.get('assignee').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
      this.invalidStatusReason = '';
      this.ticketForm.get('assignee').disable({ emitEvent: false });
      this.modalRef = this.modalService.show(this.assigneeChangeRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    });

    if (this.ticketForm.get('change_stage')) {
      this.ticketForm.get('change_stage').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
        this.invalidStatusReason = '';
        this.ticketForm.get('change_stage').disable({ emitEvent: false });
        this.modalRef = this.modalService.show(this.stageChangeRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
      });
    }

    this.ticketForm.get('status_reason').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
      if (this.details.statusReasonName == 'New' && value != MtpTicketStatusValue.NEW) {
        if (!this.details.assignee) {
          this.ticketForm.get('assignee').setValidators([Validators.required, NoWhitespaceValidator]);
          this.ticketForm.get('status_reason').setValue(this.details.statusReason, { emitEvent: false });
          this.invalidStatusReason = 'Ticket must be assigned to change status';
        } else {
          this.ticketForm.get('assignee').setValidators([]);
          this.ticketForm.get('status_reason').disable({ emitEvent: false });
          this.invalidStatusReason = '';
          this.modalRef = this.modalService.show(this.statusChangeRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
        }
      } else {
        this.ticketForm.get('assignee').setValidators([]);
        this.ticketForm.get('status_reason').disable({ emitEvent: false });
        this.invalidStatusReason = '';
        this.modalRef = this.modalService.show(this.statusChangeRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
      }
    });

    this.ticketForm.get('priority').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
      this.invalidStatusReason = '';
      this.ticketForm.get('priority').disable({ emitEvent: false });
      this.modalRef = this.modalService.show(this.priorityChangeRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  getResponseSLAClass() {
    if (this.details.isResponseSLASucceeded) {
      return `font-xs-sm text-success`;
    } else if (this.details.isResponseSLABreached) {
      return `font-xs-sm text-danger`;
    } else {
      return `font-sm text-muted`;
    }
  }

  getResolutionSLAClass() {
    if (this.details.isResolutionSLASucceeded) {
      return `font-xs-sm text-success`;
    } else if (this.details.isResolutionSLABreached) {
      return `font-xs-sm text-danger`;
    } else if (this.details.isResolutionSLAPaused) {
      return `font-xs-sm text-muted`;
    } else {
      return `font-sm text-muted`;
    }
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

  updateTicket() {
    this.spinner.start('main');
    this.svc.updateTicket(this.user.crmInstanceId, this.ticketId, this.ticketForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getTicketDetails();
    }, err => {
      this.buildForm();
      this.spinner.stop('main');
    });
  }

  downloadAttachment(note: MTPTicketNoteDetailsViewData) {
    const a: any = document.createElement('a');
    a.href = note.fileUrl;
    a.download = note.fileName;
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();
  }

  handleError(err: any) {
    this.ticketFormErrors = this.svc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.ticketForm.controls) {
          this.ticketFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.buildForm();
    this.spinner.stop('main');
  }

  onAssigneeChangeSubmit() {
    if (this.ticketForm.invalid) {
      this.ticketFormErrors = this.utilService.validateForm(this.ticketForm, this.ticketFormValidationMessages, this.ticketFormErrors);
      this.ticketForm.valueChanges
        .subscribe((data: any) => { this.ticketFormErrors = this.utilService.validateForm(this.ticketForm, this.ticketFormValidationMessages, this.ticketFormErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.ticketFormErrors = this.svc.resetFormErrors();
      let obj = Object.assign({}, this.ticketForm.getRawValue());
      delete obj.ticket_type;
      delete obj.status_reason;
      delete obj.priority;
      delete obj.change_stage;
      this.svc.updateTicket(this.user.crmInstanceId, this.ticketId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.modalRef.hide();
        this.getTicketDetails();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  onStageChangeSubmit() {
    if (this.ticketForm.invalid) {
      this.ticketFormErrors = this.utilService.validateForm(this.ticketForm, this.ticketFormValidationMessages, this.ticketFormErrors);
      this.ticketForm.valueChanges
        .subscribe((data: any) => { this.ticketFormErrors = this.utilService.validateForm(this.ticketForm, this.ticketFormValidationMessages, this.ticketFormErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.ticketFormErrors = this.svc.resetFormErrors();
      let obj = Object.assign({}, this.ticketForm.getRawValue());
      delete obj.assignee;
      delete obj.ticket_type;
      delete obj.status_reason;
      delete obj.priority;
      this.svc.updateTicket(this.user.crmInstanceId, this.ticketId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.modalRef.hide();
        this.getTicketDetails();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  onStatusChangeSubmit() {
    if (this.ticketForm.invalid) {
      this.ticketFormErrors = this.utilService.validateForm(this.ticketForm, this.ticketFormValidationMessages, this.ticketFormErrors);
      this.ticketForm.valueChanges
        .subscribe((data: any) => { this.ticketFormErrors = this.utilService.validateForm(this.ticketForm, this.ticketFormValidationMessages, this.ticketFormErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.ticketFormErrors = this.svc.resetFormErrors();
      let obj = Object.assign({}, this.ticketForm.getRawValue());
      delete obj.ticket_type;
      delete obj.assignee;
      delete obj.priority;
      delete obj.change_stage;
      this.svc.updateTicket(this.user.crmInstanceId, this.ticketId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.modalRef.hide();
        this.getTicketDetails();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  onPriorityChangeSubmit() {
    if (this.ticketForm.invalid) {
      this.ticketFormErrors = this.utilService.validateForm(this.ticketForm, this.ticketFormValidationMessages, this.ticketFormErrors);
      this.ticketForm.valueChanges
        .subscribe((data: any) => { this.ticketFormErrors = this.utilService.validateForm(this.ticketForm, this.ticketFormValidationMessages, this.ticketFormErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.ticketFormErrors = this.svc.resetFormErrors();
      let obj = Object.assign({}, this.ticketForm.getRawValue());
      delete obj.ticket_type;
      delete obj.status_reason;
      delete obj.assignee;
      delete obj.change_stage;
      this.svc.updateTicket(this.user.crmInstanceId, this.ticketId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.modalRef.hide();
        this.getTicketDetails();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  closeModal() {
    this.ticketForm.get('status_reason').enable({ emitEvent: false });
    this.ticketForm.get('assignee').enable({ emitEvent: false });
    this.ticketForm.get('priority').enable({ emitEvent: false });
    this.ticketForm.get('status_reason').setValue(this.svc.getInputControlValue(this.details.statusReasonName, this.details.statusReason), { emitEvent: false })
    this.buildForm();
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  resolve() {
    this.resolveForm = this.svc.buildResolveForm(this.details.customerId);
    this.resolveFormErrors = this.svc.resetResolveFormErrors();
    this.resolveFormValidationMessages = this.svc.resolveFormValidationMessages;
    this.modalRef = this.modalService.show(this.resolveRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  onResolveSubmit() {
    if (this.resolveForm.invalid) {
      this.resolveFormErrors = this.utilService.validateForm(this.resolveForm, this.resolveFormValidationMessages, this.resolveFormErrors);
      this.resolveForm.valueChanges
        .subscribe((data: any) => { this.resolveFormErrors = this.utilService.validateForm(this.resolveForm, this.resolveFormValidationMessages, this.resolveFormErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.resolveFormErrors = this.svc.resetResolveFormErrors();
      this.svc.resolve(this.user.crmInstanceId, this.ticketId, this.resolveForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.modalRef.hide();
        this.getTicketDetails();
        // this.spinner.stop('main');
      }, err => {
        this.buildForm();
        this.notification.error(new Notification('Failed to resolve tickets. Please try again!!'));
        this.spinner.stop('main');
      });
    }
  }

  cancel() {
    this.cancelForm = this.svc.buildCancelForm();
    this.cancelFormErrors = this.svc.resetCancelFormErrors();
    this.cancelFormValidationMessages = this.svc.cancelFormValidationMessages;
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
      this.cancelFormErrors = this.svc.resetCancelFormErrors();
      this.svc.cancel(this.user.crmInstanceId, this.ticketId, this.cancelledStateValue, this.cancelForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.modalRef.hide();
        this.getTicketDetails();
        // this.spinner.stop('main');
      }, err => {
        this.notification.error(new Notification('Failed to cancel ticket. Please try again!!'));
        this.spinner.stop('main');
      });
    }
  }

  reactivate() {
    this.confirmModalRef = this.modalService.show(this.confirmReactivate, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmReactivateSubmit() {
    this.spinner.start('main');
    this.svc.reactivate(this.user.crmInstanceId, this.ticketId, this.activeStateValue, this.details.customerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmModalRef.hide();
      this.getTicketDetails();
      // this.spinner.stop('main');
    }, err => {
      this.buildForm();
      this.notification.error(new Notification('Failed to reactivate ticket. Please try again!!'));
      this.spinner.stop('main');
    });
  }

  addNote() {
    this.noteForm = this.svc.buildNoteForm(this.details);
    this.noteFormErrors = this.svc.resetNoteFormErrors();
    this.noteFormValidationMessages = this.svc.noteFormValidationMessages;
  }

  cancelComment() {
    this.noteForm = null;
    this.noteFormErrors = null;
    this.noteFormValidationMessages = null;
  }

  onSubmitNote() {
    if (this.noteForm.invalid) {
      this.noteFormErrors = this.utilService.validateForm(this.noteForm, this.noteFormValidationMessages, this.noteFormErrors);
      this.noteForm.valueChanges
        .subscribe((data: any) => { this.noteFormErrors = this.utilService.validateForm(this.noteForm, this.noteFormValidationMessages, this.noteFormErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.noteFormErrors = this.svc.resetNoteFormErrors();
      const data = this.svc.toFormData(this.noteForm.getRawValue(), this.attachmentForm.getRawValue());
      this.svc.addNote(this.user.crmInstanceId, data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.cancelComment();
        this.getTicketDetails();
        // this.spinner.stop('main');
      }, err => {
        this.notification.error(new Notification('Failed to add ticket notes.'));
        this.spinner.stop('main');
      });
    }
  }

  goBack() {
    this.router.navigate(['ticketmgmt']);
  }

}
