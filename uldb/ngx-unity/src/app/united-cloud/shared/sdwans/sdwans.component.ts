import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SdwansService, SdwanViewData } from './sdwans.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppLevelService } from 'src/app/app-level.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { from, Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { SDWAN_ACCOUNT_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'sdwans',
  templateUrl: './sdwans.component.html',
  styleUrls: ['./sdwans.component.scss'],
  providers: [SdwansService]
})
export class SdwansComponent implements OnInit, OnDestroy {
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  viewData: SdwanViewData[] = [];
  count: number;

  @ViewChild('tagsFormRef') tagsFormRef: ElementRef;
  tagsFormModelRef: BsModalRef;
  tagsForm: FormGroup;
  tagsFormErrors: any;
  tagsFormValidationMessages: any;
  nonFieldErr: string = '';
  tagsAutocompleteItems: string[] = [];
  inputView: SdwanViewData;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmSdwanDeleteModalRef: BsModalRef;
  sdwanId: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private sdwanService: SdwansService,
    private spinner: AppSpinnerService,
    private appService: AppLevelService,
    private ticketService: SharedCreateTicketService,
    private storageService: StorageService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getSdWanAccounts();
    this.getTags();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getSdWanAccounts();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getSdWanAccounts();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getSdWanAccounts();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getSdWanAccounts();
  }

  refreshData($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getSdWanAccounts();
  }

  getSdWanAccounts() {
    this.sdwanService.getSdWanAccounts(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.count = data.count;
      this.viewData = this.sdwanService.convertToViewData(data.results);
      this.getDeviceData();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.sdwanService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  viewDeviceDetials(view: SdwanViewData) {
    this.router.navigate([`${view.sdwanId}/details`], { relativeTo: this.route });
  }

  webAccessNewTab(view: SdwanViewData) {
    if (!view.proxyUrl) {
      return;
    }
    window.open(view.proxyUrl);
  }

  editAccount(view: SdwanViewData) {
    return this.router.navigate([view.sdwanId, 'edit'], { relativeTo: this.route });
  }

  goToStats(view: SdwanViewData) {
    this.saveCriteria();
    this.storageService.put('device', {
      name: view.name, deviceType: DeviceMapping.SDWAN_ACCOUNTS, configured: view.monitoring.configured
    }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.configured && view.monitoring.enabled) {
      this.router.navigate([view.sdwanId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
    } else {
      this.router.navigate([view.sdwanId, 'zbx', 'configure'], { relativeTo: this.route });
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.SDWAN_ACCOUNTS }, StorageType.SESSIONSTORAGE)
  }

  getTags() {
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  updateTags(view: SdwanViewData) {
    this.inputView = view;
    this.tagsForm = this.sdwanService.createTagsForm(view.tags);
    this.tagsFormErrors = this.sdwanService.resetTagsFormErrors();
    this.tagsFormValidationMessages = this.sdwanService.tagsFormValidationMessages;
    this.tagsFormModelRef = this.modalService.show(this.tagsFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  submitTags() {
    this.spinner.start('main');
    this.tagsFormModelRef.hide();
    this.sdwanService.updateTags(<{ tags: string[] }>this.tagsForm.getRawValue(), this.inputView).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getSdWanAccounts();
      this.spinner.stop('main');
      this.notification.success(new Notification('Tags updated successfully.'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to update tags. Please try again later.'));
    });
  }

  deleteSdwanAccount(view: SdwanViewData) {
    this.sdwanId = view.sdwanId;
    this.confirmSdwanDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmSdwanDelete() {
    this.spinner.start('main');
    this.sdwanService.sdwanDelete(this.sdwanId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmSdwanDeleteModalRef.hide();
      this.getSdWanAccounts();
      this.notification.success(new Notification('Sdwan Account deleted successfully.'));
    }, err => {
      this.confirmSdwanDeleteModalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification('Sdwan Account could not be deleted!!'));
    });
  }

  createTicket(view: SdwanViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(view.name, view.name), metadata: SDWAN_ACCOUNT_TICKET_METADATA(view.name)
    });
  }

}
