import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AWSAccountType } from 'src/app/shared/SharedEntityTypes/aws.type';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { AWS_ACCOUNT_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PublicCloudAwsCrudService } from 'src/app/app-shared-crud/public-cloud-aws-crud/public-cloud-aws-crud.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { AccountDetailsViewData, AccountsDetailListViewData, AwsAccountScheduleHistoryViewData, PublicCloudAwsSummaryService, ResourceCountAndNames, ResourceDetailsViewData } from './public-cloud-aws-summary.service';

@Component({
  selector: 'public-cloud-aws-summary',
  templateUrl: './public-cloud-aws-summary.component.html',
  styleUrls: ['./public-cloud-aws-summary.component.scss'],
  providers: [PublicCloudAwsSummaryService]
})
export class PublicCloudAwsSummaryComponent implements OnInit {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();
  private ngUnsubscribe = new Subject();
  imageUrl: string = `${environment.assetsUrl}external-brand/aws.svg`;

  serviceAndResourceViewData: ResourceDetailsViewData = new ResourceDetailsViewData();
  currentCriteria: SearchCriteria;
  CustomerListViewData: AccountsDetailListViewData = new AccountsDetailListViewData();
  accountId: string;
  awsAccountData: AWSAccountType[] = [];

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  deleteAwsModalRef: BsModalRef;

  @ViewChild('accessKey') accessKey: ElementRef;
  accessKeyModalRef: BsModalRef;
  accessKeyFormErrors: any;
  accessKeyValidationMessages: any;
  accessKeyForm: FormGroup;

  modalRef: BsModalRef;
  @ViewChild('scheduleHistoryRef') scheduleHistoryRef: ElementRef;
  scheduleHistory: AwsAccountScheduleHistoryViewData[] = [];
  scheduleHistoryCount: number;
  scheduleHistoryCurrentCriteria: SearchCriteria;
  scheduleHistoryView: AccountDetailsViewData;

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
    private svc: PublicCloudAwsSummaryService,
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
      this.awsAccountData = data;
      this.CustomerListViewData = this.svc.convertAwsCustomerListDetailsViewData(data);
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
      subject: TICKET_SUBJECT(view.accountName, view.accountName), metadata: AWS_ACCOUNT_TICKET_METADATA(view.accountName)
    });
  }

  goToStats(view: AccountDetailsViewData) {
    this.saveCriteria();
    this.storageService.put('device', {
      name: view.accountName, deviceType: DeviceMapping.AWS_ACCOUNTS,
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

  deleteAwsAccount(view: AccountDetailsViewData) {
    this.deleteAwsModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    this.accountId = view.uuid;
  }

  confirmDeleteAwsAccount() {
    this.deleteAwsModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteAwsAccount(this.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.onCrud.emit(CRUDActionTypes.DELETE);
      this.notification.success(new Notification('AWS Account deleted successfully'));
      this.getAccountDetails();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to Delete AWS Account'));
      this.spinner.stop('main');
    });
  }

  changeAPIKeys(view: AccountDetailsViewData) {
    this.accountId = view.uuid;
    this.accessKeyFormErrors = this.svc.resetAccessKeyFormErrors();
    this.accessKeyValidationMessages = this.svc.accessKeyValidationMessages;
    this.accessKeyForm = this.svc.createAccessKeyForm(view);
    this.accessKeyModalRef = this.modalService.show(this.accessKey, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  updateAPIKeys() {
    if (this.accessKeyForm.invalid) {
      this.accessKeyFormErrors = this.utilService.validateForm(this.accessKeyForm, this.accessKeyValidationMessages, this.accessKeyFormErrors);
      this.accessKeyForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.accessKeyFormErrors = this.utilService.validateForm(this.accessKeyForm, this.accessKeyValidationMessages, this.accessKeyFormErrors); });
    } else {
      this.spinner.start('main');
      const data = this.accessKeyForm.getRawValue();
      this.svc.updateAPIKeys(this.accountId, data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.getAccountDetails();
        this.accessKeyModalRef.hide();
        this.spinner.stop('main');
        this.notification.success(new Notification('API Keys updated successfully'));
      }, (err: HttpErrorResponse) => {
        this.accessKeyFormErrors.error = err.error;
        this.spinner.stop('main');
      });
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.AWS_ACCOUNTS }, StorageType.SESSIONSTORAGE)
  }

  redirectToResourceDetails(view?: ResourceCountAndNames) {
    this.storageService.put('awsAccounts', { uuid: this.currentCriteria.multiValueParam.uuid }, StorageType.SESSIONSTORAGE);
    if (view) {
      this.router.navigate(['services', view.id], { relativeTo: this.route });
    } else {
      this.router.navigate(['services/allresources'], { relativeTo: this.route });
    }
  }

  redirectToResourceDetailsFromAccount(view: AccountDetailsViewData) {
    this.storageService.put('awsAccounts', { uuid: [view.uuid] }, StorageType.SESSIONSTORAGE);
    this.router.navigate(['services/allresources'], { relativeTo: this.route });
  }

  edit(view: AccountDetailsViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route.parent });
  }

  goToCostAnalysis(view: AccountDetailsViewData) {
    if (view?.costAnalysis) {
      this.router.navigate(['/cost-analysis/public-cloud/aws'], { queryParams: { accountId: view.uuid } });
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
      if (view) {
        this.modalRef = this.modalService.show(this.scheduleHistoryRef, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true });
      }
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while getting history. Please try again!!'));
    });
  }

}
