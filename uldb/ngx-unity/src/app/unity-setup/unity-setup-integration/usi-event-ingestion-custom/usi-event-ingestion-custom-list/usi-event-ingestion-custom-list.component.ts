import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { UsiAccountViewData, UsiEventIngestionTableColumnsModel, UsiEventIngestionTablleActionsModel } from '../../unity-setup-integration.service';
import { UsiEventIngestionCustomListService } from './usi-event-ingestion-custom-list.service';

@Component({
  selector: 'usi-event-ingestion-custom-list',
  templateUrl: './usi-event-ingestion-custom-list.component.html',
  styleUrls: ['./usi-event-ingestion-custom-list.component.scss']
})
export class UsiEventIngestionCustomListComponent implements OnInit {

  private ngUnsubscribe = new Subject();

  currentCriteria: SearchCriteria;
  count: number;
  viewData: UsiAccountViewData[] = [];
  selectedView: UsiAccountViewData;

  payloadForm: FormGroup;
  payloadFormErrors: any;
  payloadValidationMessages: any;

  @ViewChild('confirm') confirm: ElementRef;
  deleteModalRef: BsModalRef;
  @ViewChild('payload') payload: ElementRef;
  payloadModalRef: BsModalRef;
  @ViewChild('scheduleHistory') scheduleHistory: ElementRef;
  scheduleHistoryRef: BsModalRef
  columnFlags: UsiEventIngestionTableColumnsModel;
  actionFlags: UsiEventIngestionTablleActionsModel;

  constructor(private service: UsiEventIngestionCustomListService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.columnFlags = {
      discoverReourcesFlag: false,
      discoverTopologyFlag: false,
      manageAccountFlag: false,
      eventIngestionFlag: true
    };
    this.actionFlags = {
      syncFlag: false,
      scheduleHistoryFlag: false,
      testPayloadFlag: true,
      copyKeyFlag: true,
      copyUrlFlag: true,
      editFlag: true,
      deleteFlaag: true
    }
    this.getAccounts();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAccounts();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getAccounts();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getAccounts();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getAccounts();
  }

  getAccounts() {
    this.viewData = [];
    this.spinner.start('main');
    this.service.getAccounts(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.service.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get VMware vCenter accounts'));
    })
  }

  editAccount(view: UsiAccountViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
  }

  deleteAccount(view: UsiAccountViewData) {
    this.selectedView = view;
    this.confirmDelete();
  }

  confirmDelete() {
    this.service.deleteAccount(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.refreshData(this.currentCriteria.pageNo);
      this.notification.success(new Notification('Account deleted successfully.'));
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to delete Account. Please try again.'));
    });
  }

  copyKey(value: string, displayName: string) {
    console.log(value)
    try {
      navigator.clipboard.writeText(value)
        .then(() => {
          this.notification.success(new Notification(`${displayName} copied to clipboard.`));
        })
    } catch (err) {
      this.notification.error(new Notification(`Failed to copy ${displayName}. Please try again later.`));
    }
  }

  submitPayload(payLoadFormDetails) {
    this.selectedView = payLoadFormDetails.view;
    this.payloadForm = payLoadFormDetails.form;
    this.payloadFormErrors = payLoadFormDetails.payloadFormErrors;
    this.payloadValidationMessages = payLoadFormDetails.payloadFormValidationMessages;
    let obj = Object.assign({}, this.payloadForm.getRawValue());
    this.service.getPayloadResponse(obj.payload, this.selectedView.uuid)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.payloadForm.get('response').setValue(JSON.stringify(res, null, 2));
      }, (err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get response. Please try again.'));
      });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
