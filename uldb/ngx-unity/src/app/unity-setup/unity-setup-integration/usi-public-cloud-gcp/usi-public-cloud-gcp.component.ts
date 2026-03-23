import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GCPAccountScheduleHistoryViewData, GCPAccountViewData, UsiPublicCloudGcpService } from './usi-public-cloud-gcp.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TabData } from 'src/app/shared/tabdata';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { FormGroup } from '@angular/forms';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { GCP_ACCOUNT_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';

@Component({
  selector: 'usi-public-cloud-gcp',
  templateUrl: './usi-public-cloud-gcp.component.html',
  styleUrls: ['./usi-public-cloud-gcp.component.scss'],
  providers: [UsiPublicCloudGcpService]
})
export class UsiPublicCloudGcpComponent implements OnInit, OnDestroy {

  public tabItems: TabData[] = [{
    name: 'Gcp',
    url: '/setup/integration/gcp/instances'
  }];

  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  viewData: GCPAccountViewData[] = [];
  selectedView: GCPAccountViewData;
  count: number;

  @ViewChild('confirm') confirm: ElementRef;
  deleteModalRef: BsModalRef;
  @ViewChild('accessKey') accessKey: ElementRef;
  accessKeyModalRef: BsModalRef;

  accessKeyFormErrors: any;
  accessKeyValidationMessages: any;
  accessKeyForm: FormGroup;

  modalRef: BsModalRef;
  @ViewChild('scheduleHistoryRef') scheduleHistoryRef: ElementRef;
  scheduleHistory: GCPAccountScheduleHistoryViewData[] = [];
  scheduleHistoryCount: number;
  scheduleHistoryCurrentCriteria: SearchCriteria;

  @ViewChild('billing') billing: ElementRef;
  billingFormModalRef: BsModalRef;
  billingFormErrors: any;
  billingFormValidationMessages: any;
  billingForm: FormGroup;

  @ViewChild('sustainability') sustainability: ElementRef;
  sustainabilityFormModalRef: BsModalRef;
  sustainabilityFormErrors: any;
  sustainabilityFormValidationMessages: any;
  sustainabilityForm: FormGroup;

  billingAccounts: string[] = [];
  billingDataSets: string[] = [];

  constructor(private svc: UsiPublicCloudGcpService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private ticketService: SharedCreateTicketService,
    private storageService: StorageService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.scheduleHistoryCurrentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }


  ngOnInit() {
    this.spinner.start('main');
    this.getInstances();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getInstances();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getInstances();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  onSearchedScheduleHistory(event: string) {
    this.scheduleHistoryCurrentCriteria.searchValue = event;
    this.scheduleHistoryCurrentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }

  pageChangeScheduleHistory(pageNo: number) {
    this.scheduleHistoryCurrentCriteria.pageNo = pageNo;
    this.getScheduleHistory();
  }

  pageSizeChangeScheduleHistory(pageSize: number) {
    this.scheduleHistoryCurrentCriteria.pageSize = pageSize;
    this.scheduleHistoryCurrentCriteria.pageNo = 1;
    this.getScheduleHistory();
  }

  getInstances() {
    this.svc.getInstances(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
    })
  }

  add() {
    this.router.navigate(['gcp/add'], { relativeTo: this.route.parent });
  }

  edit(view: GCPAccountViewData) {
    this.router.navigate(['gcp', 'instances', view.uuid, 'edit'], { relativeTo: this.route.parent });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  deleteInstance(view: GCPAccountViewData) {
    this.selectedView = view;
    this.deleteModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.deleteModalRef.hide();
    this.svc.deleteInstance(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.refreshData(this.currentCriteria.pageNo);
      this.notification.success(new Notification('Instance deleted successfully.'));
    }, err => {
      this.notification.error(new Notification('Failed to delete Instance!! Please try again.'));
    });
  }

  loadResources(view: GCPAccountViewData) {
    this.router.navigate(['gcp', 'instances', view.uuid, 'resources'], { relativeTo: this.route.parent });
  }

  syncNow(view: GCPAccountViewData) {
    if (view.syncInProgress) {
      return;
    }
    view.syncInProgress = true;
    this.svc.syncNow(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      view.syncInProgress = false;
      this.getInstances();
    }, (err: HttpErrorResponse) => {
      view.syncInProgress = false;
    })
  }

  changeAPIKeys(view: GCPAccountViewData) {
    this.selectedView = view;
    this.accessKeyForm = this.svc.createAccessKeyForm(view);
    this.accessKeyFormErrors = this.svc.resetAccessKeyFormErrors();
    this.accessKeyValidationMessages = this.svc.accessKeyValidationMessages;
    this.accessKeyModalRef = this.modalService.show(this.accessKey, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  getScheduleHistory(view?: GCPAccountViewData) {
    this.spinner.start('main');
    if(view){
      this.selectedView = view;
      this.scheduleHistoryCurrentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    }
    this.svc.getScheduleHistory(this.selectedView.uuid, this.scheduleHistoryCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.scheduleHistoryCount = res.count; 
      this.scheduleHistory = this.svc.convertToHistoryViewData(res.results);
      this.spinner.stop('main');
      if(view){
        this.modalRef = this.modalService.show(this.scheduleHistoryRef, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true });        
      }
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while getting history. Please try again!!'));
    });
  }

  updateAPIKeys() {
    if (this.accessKeyForm.invalid) {
      this.accessKeyFormErrors = this.utilService.validateForm(this.accessKeyForm, this.accessKeyValidationMessages, this.accessKeyFormErrors);
      this.accessKeyForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.accessKeyFormErrors = this.utilService.validateForm(this.accessKeyForm, this.accessKeyValidationMessages, this.accessKeyFormErrors); });
    } else {
      this.spinner.start('main');
      const data = this.accessKeyForm.getRawValue();
      this.svc.updateAPIKeys(this.selectedView.uuid, data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.getInstances();
        this.accessKeyModalRef.hide();
        this.spinner.stop('main');
        this.notification.success(new Notification('API Keys updated successfully'));
      }, (err: HttpErrorResponse) => {
        this.accessKeyFormErrors.error = err.error;
        this.spinner.stop('main');
      });
    }
  }

  getGCPBillingDatasets(view: GCPAccountViewData) {
    this.svc.getGCPBillingDatasets(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(datasets => {
      this.billingDataSets = datasets;
    })
  }

  getGCPBillingAccounts(view: GCPAccountViewData) {
    this.svc.getGCPBillingAccounts(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((account: GCPBillingInfo) => {
      this.billingAccounts = [];
      this.billingAccounts.push(account.billing_account_name.split('/').getLast());
    })
  }

  addBillngDetails(view: GCPAccountViewData) {
    if (!view.isBillingExists) {
      return;
    }
    this.getGCPBillingDatasets(view);
    this.getGCPBillingAccounts(view)
    this.billingForm = this.svc.buildBillingForm(view);
    this.billingFormErrors = this.svc.resetBillingFormErrors();
    this.billingFormValidationMessages = this.svc.billingFormValidationMessages;
    this.billingFormModalRef = this.modalService.show(this.billing, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  addSustanabilityDetails(view: GCPAccountViewData) {
    // if (!view.co2EmissionEnabled) {
    //   return;
    // }
    this.getGCPBillingDatasets(view);
    this.getGCPBillingAccounts(view);
    this.sustainabilityForm = this.svc.buildSustainabilityForm(view);
    this.sustainabilityFormErrors = this.svc.resetSustainabilityFormErrors();
    this.sustainabilityFormValidationMessages = this.svc.sustainabilityFormValidationMessages;
    this.sustainabilityFormModalRef = this.modalService.show(this.sustainability, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  onSubmitBillingForm() {
    if (this.billingForm.invalid) {
      this.billingFormErrors = this.utilService.validateForm(this.billingForm, this.billingFormValidationMessages, this.billingFormErrors);
      this.billingForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.billingFormErrors = this.utilService.validateForm(this.billingForm, this.billingFormValidationMessages, this.billingFormErrors); });
    } else {
      this.spinner.start('main');
      this.svc.updateBillingDetails(this.billingForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.getInstances();
          this.billingFormModalRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Billing details updated successfully'));
        }, (err: HttpErrorResponse) => {
          this.notification.error(new Notification('Failed to update billing details'));
        });
    }
  }

  onSubmitSustainabilityForm() {
    if (this.sustainabilityForm.invalid) {
      this.sustainabilityFormErrors = this.utilService.validateForm(this.sustainabilityForm, this.sustainabilityFormValidationMessages, this.sustainabilityFormErrors);
      this.sustainabilityForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.sustainabilityFormErrors = this.utilService.validateForm(this.sustainabilityForm, this.sustainabilityFormValidationMessages, this.sustainabilityFormErrors); });
    } else {
      this.spinner.start('main');
      this.svc.updateSustanabilityDetails(this.sustainabilityForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.getInstances();
          this.sustainabilityFormModalRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Sustainability details updated successfully'));
        }, (err: HttpErrorResponse) => {
          this.notification.error(new Notification('Failed to update sustainability details'));
        });
    }
  }


  createTicket(view: GCPAccountViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT("GCP Accounts", view.userName), metadata: GCP_ACCOUNT_TICKET_METADATA("GCP Accounts",
        view.userName, view.projectId)
    });
  }
}
