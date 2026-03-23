import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { AZURE_ACCOUNT_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PublicCloudAwsCrudService } from 'src/app/shared/public-cloud-aws-crud/public-cloud-aws-crud.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { AzureAccountsType } from '../entities/azure-accounts.type';
import { AccountDetailsViewData, AccountsDetailListViewData, AzureAccountScheduleHistoryViewData, AzureCustomerSummaryViewData, PublicCloudAzureSummaryService, ResourceCountAndNames, ResourceDetailsViewData } from './public-cloud-azure-summary.service';

@Component({
  selector: 'public-cloud-azure-summary',
  templateUrl: './public-cloud-azure-summary.component.html',
  styleUrls: ['./public-cloud-azure-summary.component.scss'],
  providers: [PublicCloudAzureSummaryService]
})
export class PublicCloudAzureSummaryComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();
  private ngUnsubscribe = new Subject();
  imageUrl: string = `${environment.assetsUrl}external-brand/azure.svg`;

  serviceAndResourceViewData: ResourceDetailsViewData = new ResourceDetailsViewData();
  azureAccountDetails: AzureCustomerSummaryViewData = new AzureCustomerSummaryViewData();
  currentCriteria: SearchCriteria;
  CustomerListViewData: AccountsDetailListViewData = new AccountsDetailListViewData();
  accountId: string;
  azureAccountData: AzureAccountsType[] = [];

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  deleteAzureModalRef: BsModalRef;

  @ViewChild('updateCredentialsRef') updateCredentialsRef: ElementRef;
  updateCredentialsModalRef: BsModalRef;

  modalRef: BsModalRef;
  @ViewChild('scheduleHistoryRef') scheduleHistoryRef: ElementRef;
  scheduleHistory: AzureAccountScheduleHistoryViewData[] = [];
  scheduleHistoryCount: number;
  scheduleHistoryCurrentCriteria: SearchCriteria;
  scheduleHistoryView: AccountDetailsViewData;

  updateCredentialsForm: FormGroup;
  updateCredentialsFormErrors: any;
  updateCredentialsFormValidationMessages: any;
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

  constructor(private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private svc: PublicCloudAzureSummaryService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private ticketService: SharedCreateTicketService,
    private crudSvc: PublicCloudAwsCrudService,
    private storageService: StorageService,
    private utilService: AppUtilityService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { uuid: [] } };
    this.scheduleHistoryCurrentCriteria = {
      sortColumn: '', sortDirection: '', searchQuery: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE
    };
  }

  ngOnInit() {
    this.getAccountDetails();
    // this.getAzureCustomerDetails();
    // this.getAzureCustomerListDetails();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.scheduleHistoryCurrentCriteria.searchQuery = event;
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
      this.azureAccountData = data;
      this.CustomerListViewData = this.svc.convertAzureCustomerListDetailsViewData(data);
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

  getAzureCustomerDetails() {
    this.spinner.start('main');
    this.svc.getAzureAccountDetails().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.azureAccountDetails = this.svc.convertAzureAccountDetailsViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to Load Azure Customer Details"));
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
      subject: TICKET_SUBJECT(view.accountName, view.accountName), metadata: AZURE_ACCOUNT_TICKET_METADATA(view.accountName)
    });
  }

  goToStats(view: AccountDetailsViewData) {
    this.saveCriteria();
    this.storageService.put('device', {
      name: view.accountName, deviceType: DeviceMapping.AZURE_ACCOUNTS,
      configured: view.monitoring.configured, uuid: `${view.uuid}`
    }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.zabbix) {
      if (view.monitoring.configured && view.monitoring.enabled) {
        this.router.navigate([view.uuid, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      } else {
        this.router.navigate([view.uuid, 'zbx', 'configure'], { relativeTo: this.route });
      }
    }
  }

  deleteAzureAccount(view: AccountDetailsViewData) {
    this.deleteAzureModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    this.accountId = view.uuid;
  }

  confirmDeleteAzureAccount() {
    this.deleteAzureModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteAzureAccount(this.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.onCrud.emit(CRUDActionTypes.DELETE);
      this.notification.success(new Notification('Azure Account deleted successfully'));
      this.getAccountDetails();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to Delete Azure Account'));
      this.spinner.stop('main');
    });
  }

  updateCredentials(view: AccountDetailsViewData) {
    this.accountId = view.uuid;
    this.updateCredentialsForm = this.svc.buildUpdateCredentialsForm();
    this.updateCredentialsFormErrors = this.svc.resetUpdateCredentialsFormErrors();
    this.updateCredentialsFormValidationMessages = this.svc.updateCredentialsFormValidationMessages;
    this.updateCredentialsModalRef = this.modalService.show(this.updateCredentialsRef, Object.assign({}, { class: '', keyword: false }));
  }

  confirmUpdateCredentials() {
    if (this.updateCredentialsForm.invalid) {
      this.updateCredentialsFormErrors = this.utilService.validateForm(this.updateCredentialsForm, this.updateCredentialsFormValidationMessages, this.updateCredentialsFormErrors);
      this.updateCredentialsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.updateCredentialsFormErrors = this.utilService.validateForm(this.updateCredentialsForm, this.updateCredentialsFormValidationMessages, this.updateCredentialsFormErrors); });
    } else {
      this.spinner.start('main');
      this.updateCredentialsModalRef.hide();
      this.svc.updateCredentials(this.accountId, this.updateCredentialsForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Updated Credentials Successfully'));
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification(err.error));
      });
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.AZURE_ACCOUNTS }, StorageType.SESSIONSTORAGE)
  }

  redirectToResourceDetails(view?: ResourceCountAndNames) {
    this.storageService.put('azureAccounts', { uuid: this.currentCriteria.multiValueParam.uuid }, StorageType.SESSIONSTORAGE);
    if (view) {
      this.router.navigate(['services', view.id], { relativeTo: this.route });
    } else {
      this.router.navigate(['services/allresources'], { relativeTo: this.route });
    }
  }

  redirectToResourceDetailsFromAccount(view: AccountDetailsViewData) {
    this.storageService.put('azureAccounts', { uuid: [view.uuid] }, StorageType.SESSIONSTORAGE);
    this.router.navigate(['services/allresources'], { relativeTo: this.route });
  }

  edit(view: AccountDetailsViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route.parent });
  }

  goToCostAnalysis(view: AccountDetailsViewData) {
    if (view?.costAnalysis) {
      this.router.navigate(['/cost-analysis/public-cloud/azure'], { queryParams: { accountId: view.uuid } });
    } else {
      return;
    }
  }

  gotToAIMLPage() {
    this.router.navigate(['/services/aiml-event-mgmt/alerts']);
  }

  showServices(view: AccountDetailsViewData) {
    this.currentCriteria.multiValueParam.uuid = [];
    this.currentCriteria.multiValueParam.uuid.push(view.uuid);
    this.getServiceAndResourceDetails();
  }

  getScheduleHistory(view?: AccountDetailsViewData) {
    this.spinner.start('main');
    if (view) {
      this.scheduleHistoryView = view;
    }
    this.svc.getScheduleHistory(this.scheduleHistoryCurrentCriteria, this.scheduleHistoryView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.scheduleHistoryCount = res.count; 
      this.scheduleHistory = this.svc.convertToHistoryViewData(res.results);
      this.spinner.stop('main');
      if(view) {
        this.modalRef = this.modalService.show(this.scheduleHistoryRef, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true });
      }
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while getting history. Please try again!!'));
    });
  }
}