import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, interval } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { GCP_ACCOUNT_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { PublicCloudGcpCrudService } from 'src/app/app-shared-crud/public-cloud-gcp-crud/public-cloud-gcp-crud.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { GCPAccountViewData, PublicCloudGCPDashboardService } from './gcp-dashboard.service';

@Component({
  selector: 'gcp-dashboard',
  templateUrl: './gcp-dashboard.component.html',
  styleUrls: ['./gcp-dashboard.component.scss'],
  providers: [PublicCloudGCPDashboardService]
})
export class GcpDashboardComponent implements OnInit, OnDestroy {
  fieldsToFilterOn: string[] = ['name', 'email'];
  private ngUnsubscribe = new Subject();

  viewData: GCPAccountViewData[] = [];
  regions: Region[] = [];
  filteredViewData: GCPAccountViewData[] = [];
  pagedviewData: GCPAccountViewData[] = [];
  currentCriteria: SearchCriteria;
  count: number = 0;
  poll: boolean = false;

  uuid: string;
  selectedAccountIndex: number;


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

  constructor(private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private notificationService: AppNotificationService,
    private utilService: AppUtilityService,
    private route: ActivatedRoute,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private ticketService: SharedCreateTicketService,
    private router: Router,
    private dashboardService: PublicCloudGCPDashboardService,
    private clientSidePage: ClientSidePage,
    private termService: FloatingTerminalService,
    private crudSvc: PublicCloudGcpCrudService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getAccounts());
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getRegions();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private filterAndPage() {
    this.filteredViewData = this.clientSideSearchPipe.transform(this.viewData, this.currentCriteria.searchValue, this.fieldsToFilterOn);
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.filterAndPage();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getAccounts();
  }

  onCrud(event: CRUDActionTypes) {
    this.getAccounts();
  }

  getAccounts() {
    this.dashboardService.getGCPAcccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.dashboardService.convertToViewData(res.results);
      this.filterAndPage();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Problem in getting AWS accounts. Please tryagain later.'));
    });
  }

  getRegions() {
    this.dashboardService.getRegions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.regions = res;
      this.getAccounts();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    });
  }

  isRegionSelected(selectedRegion: string): boolean {
    if (selectedRegion) {
      return true;
    } else {
      this.notificationService.error(new Notification('Please select a region'));
      return false;
    }
  }

  goToInventory(view: GCPAccountViewData) {
    if (this.isRegionSelected(view.selectedRegion)) {
      this.router.navigate(['../overview', view.uuid, view.selectedRegion, 'vms'], { relativeTo: this.route });
    }
  }

  addAccount() {
    this.crudSvc.addOrEdit(null);
  }

  editAccount(index: number) {
    this.crudSvc.addOrEdit(this.viewData[index]);
  }

  deleteAccount(view: GCPAccountViewData) {
    this.crudSvc.delete(view.uuid);
  }

  createTicket(view: GCPAccountViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT("GCP Accounts", view.name), metadata: GCP_ACCOUNT_TICKET_METADATA("GCP Accounts",
        view.name, view.projectId)
    });
  }

  getGCPBillingDatasets(view: GCPAccountViewData) {
    this.dashboardService.getGCPBillingDatasets(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(datasets => {
      this.billingDataSets = datasets;
    })
  }

  getGCPBillingAccounts(view: GCPAccountViewData) {
    this.dashboardService.getGCPBillingAccounts(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((account: GCPBillingInfo) => {
      this.billingAccounts.push(account.billing_account_name.split('/').getLast());
    })
  }

  addBillngDetails(view: GCPAccountViewData) {
    if (!view.isBillingExists) {
      return;
    }
    this.getGCPBillingDatasets(view);
    this.getGCPBillingAccounts(view)
    this.billingForm = this.dashboardService.buildBillingForm(view);
    this.billingFormErrors = this.dashboardService.resetBillingFormErrors();
    this.billingFormValidationMessages = this.dashboardService.billingFormValidationMessages;
    this.billingFormModalRef = this.modalService.show(this.billing, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  addSustanabilityDetails(view: GCPAccountViewData) {
    this.getGCPBillingDatasets(view);
    this.getGCPBillingAccounts(view);
    this.sustainabilityForm = this.dashboardService.buildSustainabilityForm(view);
    this.sustainabilityFormErrors = this.dashboardService.resetSustainabilityFormErrors();
    this.sustainabilityFormValidationMessages = this.dashboardService.sustainabilityFormValidationMessages;
    this.sustainabilityFormModalRef = this.modalService.show(this.sustainability, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  onSubmitBillingForm() {
    if (this.billingForm.invalid) {
      this.billingFormErrors = this.utilService.validateForm(this.billingForm, this.billingFormValidationMessages, this.billingFormErrors);
      this.billingForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.billingFormErrors = this.utilService.validateForm(this.billingForm, this.billingFormValidationMessages, this.billingFormErrors); });
    } else {
      this.spinner.start('main');
      this.dashboardService.updateBillingDetails(this.billingForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.getAccounts();
          this.billingFormModalRef.hide();
          this.spinner.stop('main');
          this.notificationService.success(new Notification('Billing details updated successfully'));
        }, (err: HttpErrorResponse) => {
          this.notificationService.error(new Notification('Failed to update billing details'));
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
      this.dashboardService.updateSustanabilityDetails(this.sustainabilityForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.getAccounts();
          this.sustainabilityFormModalRef.hide();
          this.spinner.stop('main');
          this.notificationService.success(new Notification('Sustainability details updated successfully'));
        }, (err: HttpErrorResponse) => {
          this.notificationService.error(new Notification('Failed to update sustainability details'));
        });
    }
  }
}