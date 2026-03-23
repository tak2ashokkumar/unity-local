import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AccountDetailListViewData, AccountDetailsViewData, GcpAccountScheduleHistoryViewData, PublicCloudGcpSummaryService, ResourceDetailsViewData } from './public-cloud-gcp-summary.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { GCP_ACCOUNT_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { GcpAccountType } from './public-cloud-gcp-summary.type';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'public-cloud-gcp-summary',
  templateUrl: './public-cloud-gcp-summary.component.html',
  styleUrls: ['./public-cloud-gcp-summary.component.scss'],
  providers: [PublicCloudGcpSummaryService]
})
export class PublicCloudGcpSummaryComponent implements OnInit {

  // @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();
  private ngUnsubscribe = new Subject();
  imageUrl: string = `${environment.assetsUrl}external-brand/gcp.svg`;
  gcpAccountData: GcpAccountType[] = [];
  accountListViewData: AccountDetailListViewData = new AccountDetailListViewData();
  currentCriteria: SearchCriteria;
  serviceAndResourceViewData: ResourceDetailsViewData = new ResourceDetailsViewData();
  accountId: string;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  deleteGcpModalRef: BsModalRef;
  @ViewChild('scheduleHistoryRef') scheduleHistoryRef: ElementRef;
  historymodalRef: BsModalRef;
  scheduleHistory: GcpAccountScheduleHistoryViewData[] = [];
  scheduleHistoryCount: number;
  scheduleHistoryCurrentCriteria: SearchCriteria;

  accountDetailsSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "uuid",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-sm w-100',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };
  accountDetailsTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Subscriptions',
  };

  // @ViewChild('billing') billing: ElementRef;
  // billingFormModalRef: BsModalRef;
  // billingFormErrors: any;
  // billingFormValidationMessages: any;
  // billingForm: FormGroup;

  // @ViewChild('sustainability') sustainability: ElementRef;
  // sustainabilityFormModalRef: BsModalRef;
  // sustainabilityFormErrors: any;
  // sustainabilityFormValidationMessages: any;
  // sustainabilityForm: FormGroup;

  // billingAccounts: string[] = [];
  // billingDataSets: string[] = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private svc: PublicCloudGcpSummaryService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private ticketService: SharedCreateTicketService,
    private storageService: StorageService,
    private utilService: AppUtilityService,
  ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { uuid: [] } };
    this.scheduleHistoryCurrentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    this.getAccountDetails();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.scheduleHistoryCurrentCriteria.searchValue = event;
    this.scheduleHistoryCurrentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }

  pageChange(pageNo: number) {
    this.scheduleHistoryCurrentCriteria.pageNo = pageNo;
    this.getScheduleHistory();
  }

  pageSizeChange(pageSize: number) {
    this.scheduleHistoryCurrentCriteria.pageSize = pageSize;
    this.scheduleHistoryCurrentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }

  onFilterChange() {
    this.getServiceAndResourceDetails();
  }

  getServiceAndResourceDetails() {
    this.spinner.start('main');
    this.svc.getServiceAndResourceDetails(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.serviceAndResourceViewData = this.svc.convertServiceAndResourceViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to Load Service and Resource Details"));
    });
  }

  getAccountDetails() {
    this.spinner.start('main');
    this.currentCriteria.multiValueParam.uuid = [];
    this.svc.getAccountDetails().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.gcpAccountData = data;
      this.accountListViewData = this.svc.convertAccountDetailsViewData(data);
      data.forEach(s => {
        this.currentCriteria.multiValueParam.uuid.push(s.uuid);
      })
      this.getServiceAndResourceDetails();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to Load Account Details"));
    });
  }

  syncNow(view: AccountDetailsViewData) {
    if (view.syncInProgress) {
      return;
    }
    view.syncInProgress = true;
    this.svc.syncNow(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      view.syncInProgress = false;
      this.getAccountDetails();
    }, (err: HttpErrorResponse) => {
      view.syncInProgress = false;
    })
  }

  createTicket(view: AccountDetailsViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT("GCP Accounts", view.accountName), metadata: GCP_ACCOUNT_TICKET_METADATA("GCP Accounts",
        view.accountName, view.id.toString())
    });
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.GCP_ACCOUNTS }, StorageType.SESSIONSTORAGE)
  }

  goToStats(view: AccountDetailsViewData) {
    this.saveCriteria();
    this.storageService.put('device', {
      name: view.accountName, deviceType: DeviceMapping.GCP_ACCOUNTS,
      configured: view.monitoring.configured, uuid: `${view.uuid}`
    }, StorageType.SESSIONSTORAGE);
    if (view.monitoring?.zabbix) {
      if (view.monitoring.configured && view.monitoring.enabled) {
        this.router.navigate([view.uuid, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      } else {
        this.router.navigate([view.uuid, 'zbx', 'configure'], { relativeTo: this.route });
      }
    }
  }

  deleteGcpAccount(view: AccountDetailsViewData) {
    this.accountId = view.uuid;
    this.deleteGcpModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDeleteGcpAccount() {
    this.deleteGcpModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteGcpAccount(this.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      // this.onCrud.emit(CRUDActionTypes.DELETE);
      this.notification.success(new Notification('GCP Account deleted successfully'));
      this.getAccountDetails();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to Delete GCP Account'));
      this.spinner.stop('main');
    });
  }

  redirectToResourceDetails(view?: AccountDetailsViewData) {
    this.storageService.put('GcpAccounts', { uuid: this.currentCriteria.multiValueParam.uuid }, StorageType.SESSIONSTORAGE);
    if (view) {
      this.router.navigate(['services', 'resource', view.id], { relativeTo: this.route });
    } else {
      this.router.navigate(['services/resource/allresources'], { relativeTo: this.route });
    }
  }

  showServices(view: AccountDetailsViewData) {
    this.currentCriteria.multiValueParam.uuid = [];
    this.currentCriteria.multiValueParam.uuid.push(view.uuid);
    this.getServiceAndResourceDetails();
  }

  redirectToResourceDetailsFromAccount(view: AccountDetailsViewData) {
    this.storageService.put('GcpAccounts', { uuid: [view.uuid] }, StorageType.SESSIONSTORAGE);
    this.router.navigate(['services/resource/allresources'], { relativeTo: this.route });
  }

  edit(view: AccountDetailsViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route.parent });
  }

  goToCostAnalysis(view: AccountDetailsViewData) {
    if (!view.isCostAnalysis) {
      return;
    }
    this.router.navigate(['/cost-analysis/public-cloud/gcp'], { queryParams: { accountId: view.uuid } });
  }

  gotToAIMLPage() {
    this.router.navigate(['/services/aiml-event-mgmt/alerts']);
  }

  getScheduleHistory(view?: AccountDetailsViewData) {
    this.spinner.start('main');
    if (view) {
      this.accountId = view.uuid;
      this.scheduleHistoryCurrentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    }
    this.svc.getScheduleHistory(this.accountId, this.scheduleHistoryCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.scheduleHistoryCount = res.count;
      this.scheduleHistory = this.svc.convertToHistoryViewData(res.results);
      this.spinner.stop('main');
      if (view) {
        this.historymodalRef = this.modalService.show(this.scheduleHistoryRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
      }
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while getting history. Please try again!!'));
    });
  }

  // getGCPBillingDatasets(uuid: string) {
  //   this.svc.getGCPBillingDatasets(uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(datasets => {
  //     this.billingDataSets = datasets;
  //   })
  // }

  // getGCPBillingAccounts(uuid: string) {
  //   this.svc.getGCPBillingAccounts(uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((account: GCPBillingInfo) => {
  //     this.billingAccounts = [];
  //     this.billingAccounts.push(account.billing_account_name.split('/').getLast());
  //   })
  // }

  // addBillngDetails(view: AccountDetailsViewData) {
  //   if (!view.isBillingExists) {
  //     return;
  //   }
  //   this.getGCPBillingDatasets(view.uuid);
  //   this.getGCPBillingAccounts(view.uuid)
  //   this.billingForm = this.svc.buildBillingForm(view);
  //   this.billingFormErrors = this.svc.resetBillingFormErrors();
  //   this.billingFormValidationMessages = this.svc.billingFormValidationMessages;
  //   this.billingFormModalRef = this.modalService.show(this.billing, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  // }

  // addSustanabilityDetails(view: AccountDetailsViewData) {
  //   // if (!view.co2EmissionEnabled) {
  //   //   return;
  //   // }
  //   this.getGCPBillingDatasets(view.uuid);
  //   this.getGCPBillingAccounts(view.uuid);
  //   this.sustainabilityForm = this.svc.buildSustainabilityForm(view);
  //   this.sustainabilityFormErrors = this.svc.resetSustainabilityFormErrors();
  //   this.sustainabilityFormValidationMessages = this.svc.sustainabilityFormValidationMessages;
  //   this.sustainabilityFormModalRef = this.modalService.show(this.sustainability, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  // }

  // onSubmitBillingForm() {
  //   if (this.billingForm.invalid) {
  //     this.billingFormErrors = this.utilService.validateForm(this.billingForm, this.billingFormValidationMessages, this.billingFormErrors);
  //     this.billingForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
  //       .subscribe((data: any) => { this.billingFormErrors = this.utilService.validateForm(this.billingForm, this.billingFormValidationMessages, this.billingFormErrors); });
  //   } else {
  //     this.spinner.start('main');
  //     this.svc.updateBillingDetails(this.billingForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
  //       .subscribe(res => {
  //         this.getAccountDetails();
  //         this.billingFormModalRef.hide();
  //         this.spinner.stop('main');
  //         this.notification.success(new Notification('Billing details updated successfully'));
  //       }, (err: HttpErrorResponse) => {
  //         this.notification.error(new Notification('Failed to update billing details'));
  //       });
  //   }
  // }

  // onSubmitSustainabilityForm() {
  //   if (this.sustainabilityForm.invalid) {
  //     this.sustainabilityFormErrors = this.utilService.validateForm(this.sustainabilityForm, this.sustainabilityFormValidationMessages, this.sustainabilityFormErrors);
  //     this.sustainabilityForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
  //       .subscribe((data: any) => { this.sustainabilityFormErrors = this.utilService.validateForm(this.sustainabilityForm, this.sustainabilityFormValidationMessages, this.sustainabilityFormErrors); });
  //   } else {
  //     this.spinner.start('main');
  //     this.svc.updateSustanabilityDetails(this.sustainabilityForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
  //       .subscribe(res => {
  //         this.getAccountDetails();
  //         this.sustainabilityFormModalRef.hide();
  //         this.spinner.stop('main');
  //         this.notification.success(new Notification('Sustainability details updated successfully'));
  //       }, (err: HttpErrorResponse) => {
  //         this.notification.error(new Notification('Failed to update sustainability details'));
  //       });
  //   }
  // }

}