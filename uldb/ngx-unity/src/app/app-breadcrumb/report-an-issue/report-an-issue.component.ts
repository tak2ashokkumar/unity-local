import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AppBreadcrumbService } from '../app-breadcrumb.service';
import { Subject } from 'rxjs';
import { ReportAnIssueService, REPORT_AN_ISSUE_METADATA } from './report-an-issue.service';
import { takeUntil } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup, FormControl } from '@angular/forms';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { Priority } from 'src/app/shared/create-ticket/create-ticket.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DynamicCrmFeedbackTicketPriorityType, DynamicCrmFeedbackTicketType } from 'src/app/shared/SharedEntityTypes/crm.type';

@Component({
  selector: 'report-an-issue',
  templateUrl: './report-an-issue.component.html',
  styleUrls: ['./report-an-issue.component.scss']
})
export class ReportAnIssueComponent implements OnInit, OnDestroy {
  public breadcrumbs: string[] = [];
  private ngUnsubscribe = new Subject();
  PriorityEnum = Priority;
  @ViewChild('template') elementView: ElementRef;
  modalRef: BsModalRef;
  issueForm: FormGroup;
  attachmentForm: FormGroup;
  formErrors: any;
  validationMessages: any;

  ticketTypeList: DynamicCrmFeedbackTicketType[] = [];
  ticketPriorityList: DynamicCrmFeedbackTicketPriorityType[] = [];

  constructor(public service: AppBreadcrumbService,
    private issueService: ReportAnIssueService,
    private utilService: AppUtilityService,
    public user: UserInfoService,
    private notificationService: AppNotificationService,
    private modalService: BsModalService,
    private spinner: AppSpinnerService) { }

  public ngOnInit(): void {
    this.service.breadcrumbs.pipe(takeUntil(this.ngUnsubscribe)).subscribe((param) => {
      this.breadcrumbs = (<{ label: string, url: string }[]>param).map(p => p.label);
    });
    this.issueService.reportIssueToggled$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.opneModal();
    });
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildForm() {
    this.attachmentForm = this.issueService.buildAttachmentForm();
    this.issueForm = this.issueService.buildReportIssueForm(this.breadcrumbs, REPORT_AN_ISSUE_METADATA(this.user.userEmail, this.user.userTimeZoneAbbr));
    this.formErrors = this.issueService.resetFormErrors();
    this.validationMessages = this.issueService.validationMessages;
  }


  get attachments() {
    return Object.keys(this.attachmentForm.controls);
  }

  get emailLink() {
    return 'mailto:support@unityonecloud.com?subject=' +
      encodeURIComponent(this.issueForm.get('subject').value) +
      '&body=' + encodeURIComponent(this.issueForm.get('description').value + '\n' + this.issueForm.get('metadata').value);
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

  opneModal() {
    this.buildForm();
    this.modalRef = this.modalService.show(this.elementView, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    this.getTicketTypes();
    this.getPriorities();
  }

  getTicketTypes() {
    this.ticketTypeList = [];
    this.issueService.getTicketTypes().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ticketTypeList = res;
    });
  }

  getPriorities() {
    this.ticketPriorityList = [];
    this.issueService.getPriorities().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ticketPriorityList = res;
    });
  }

  onSubmit() {
    if (this.issueForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.issueForm, this.validationMessages, this.formErrors);
      this.issueForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.issueForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.formErrors = this.issueService.resetFormErrors();
      let issueFormObj = this.issueForm.getRawValue();
      issueFormObj.type = this.ticketTypeList.find(type => type.display_name == 'Incident')?.value;
      const data = this.issueService.toFormData(issueFormObj, this.attachmentForm.getRawValue());
      this.issueService.submitIssue(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.modalRef.hide();
        this.spinner.stop('main');
        this.notificationService.success(new Notification('Thank you for your feedback. Ticket submitted successfully, it will be visible in Unity in few minutes. Our Support team will soon contact you.'));
        this.issueService.ticketCreated(data);
      }, err => {
        this.modalRef.hide();
        this.spinner.stop('main');
        this.notificationService.error(new Notification('Error while creating ticket.'));
      });
    }
  }
}
