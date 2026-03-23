import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { accountTypesList, EmailViewData, statusList, UsiEventIngestionEmailService } from './usi-event-ingestion-email.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { isString } from 'lodash-es';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';

@Component({
  selector: 'usi-event-ingestion-email',
  templateUrl: './usi-event-ingestion-email.component.html',
  styleUrls: ['./usi-event-ingestion-email.component.scss'],
  providers: [UsiEventIngestionEmailService]
})
export class UsiEventIngestionEmailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  count: number = 0;
  viewData: EmailViewData[] = [];
  selectedView: EmailViewData;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  modalRef: BsModalRef;

  @ViewChild('payload') payload: ElementRef;
  payloadModalRef: BsModalRef;
  nonFieldErr: string = '';
  payloadForm: FormGroup;
  payloadFormErrors: any;
  payloadValidationMessages: any;
  isSubmit: boolean = true;

  accountTypesList: LabelValueType[] = accountTypesList;
  statusList: LabelValueType[] = statusList;

  accountTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  accountTypeTexts: IMultiSelectTexts = {
    defaultTitle: 'Account Type',
  };

  statusSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  statusTypeTexts: IMultiSelectTexts = {
    defaultTitle: 'Status',
  };

  constructor(private svc: UsiEventIngestionEmailService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private modalSvc: BsModalService,
    private notification: AppNotificationService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { 'account_type': [], 'status': [] } };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getEmails();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getEmails();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getEmails();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getEmails();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.currentCriteria.multiValueParam.account_type = [];
    this.currentCriteria.multiValueParam.status = [];
    this.getEmails();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getEmails();
  }

  getEmails() {
    this.svc.getEmails(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Emails. Try again later.'))
    })
  }

  goToAddAccount() {
    this.router.navigate(['crud'], { relativeTo: this.route });
  }

  toggleStatus(view: EmailViewData, status: boolean) {
    if (view.isEnabled == status) {
      return;
    }
    this.spinner.start('main');
    this.svc.toggleStatus(view.emailId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.notification.success(new Notification(`Email ${view.isEnabled ? 'disabled' : 'enabled'} successfully.`));
      this.getEmails();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to change Email status'));
    });
  }

  goToHistory(view: EmailViewData) {
    this.router.navigate([view.emailId, 'history'], { relativeTo: this.route });
  }

  goToEditAccount(view: EmailViewData) {
    this.router.navigate([view.emailId, 'edit'], { relativeTo: this.route });
  }

  deleteAccount(view: EmailViewData) {
    this.selectedView = view;
    this.modalRef = this.modalSvc.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.svc.deleteEmail(this.selectedView.emailId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.modalRef.hide();
      this.getEmails();
    }, (err: HttpErrorResponse) => {
      this.modalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to delete Email. Tryagain later."))
    })
  }

  // copyKeyOrUrl(value: string, displayName: string) {
  //   try {
  //     navigator.clipboard.writeText(value)
  //       .then(() => {
  //         this.notification.success(new Notification(`${displayName} copied to clipboard.`));
  //       })
  //   } catch (err) {
  //     this.notification.error(new Notification(`Failed to copy ${displayName}. Please try again later.`));
  //   }
  // }

  testPayloadModal(view: EmailViewData) {
    this.isSubmit = true;
    this.selectedView = view;
    this.buildPayloadForm();
    this.payloadModalRef = this.modalSvc.show(this.payload, Object.assign({}, { class: 'modal-md', keyboard: true, ignoreBackdropClick: true }));
  }

  buildPayloadForm() {
    this.nonFieldErr = '';
    this.payloadForm = this.svc.buildPayloadForm();
    this.payloadFormErrors = this.svc.resetPaylodFormErrors();
    this.payloadValidationMessages = this.svc.payloadValidationMessages;
  }

  handlePayloadFormError(err: any) {
    this.payloadFormErrors = this.svc.resetPaylodFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.payloadForm.controls) {
          this.payloadFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.modalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  submitPayload() {
    this.spinner.start('main');
    this.isSubmit = false;
    let obj = Object.assign({}, this.payloadForm.getRawValue());
    this.svc.getPayloadResponse(obj.payload, this.selectedView.emailId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.payloadForm.get('response').setValue(JSON.stringify(res, null, 2));
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.handlePayloadFormError(err.error);
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
