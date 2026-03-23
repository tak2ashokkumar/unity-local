import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { switchMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { SERVICE_CATALOGUE_TICKET_METADATA, SERVICE_CATELOGUE_TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment.prod';
import { AllCatalogueServicesService, ServiceCatalogueViewData, TermData } from './all-catalogue-services.service';

@Component({
  selector: 'all-catalogue-services',
  templateUrl: './all-catalogue-services.component.html',
  styleUrls: ['./all-catalogue-services.component.scss'],
  providers: [AllCatalogueServicesService]
})
export class AllCatalogueServicesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  terms: TermData[] = [];
  selectedTerm: TermData = new TermData();
  viewData: ServiceCatalogueViewData[] = [];

  currentCriteria: SearchCriteria;
  fieldsToFilterOn: string[] = ['device_type', 'provider'];
  poll: boolean = false;
  svcCategories: string[] = [];
  selectedSvcCategories: string[] = [];

  svcProviders: string[] = [];
  selectedSvcProviders: string[] = [];

  constructor(private catalogueService: AllCatalogueServicesService,
    private ticketService: SharedCreateTicketService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private termService: FloatingTerminalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: 0, multiValueParam: { 'category': [], 'provider': [] } };
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getTerms());
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getTerms();
    this.getServiceCategory();
    this.getServiceProviders();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  changeTerm(term: TermData) {
    this.selectedTerm = term;
    this.getAllCatalogueServices();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getAllCatalogueServices();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAllCatalogueServices();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getAllCatalogueServices();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getTerms();
  }

  getServiceCategory() {
    this.catalogueService.getServiceCategory().pipe(take(1)).subscribe(res => {
      this.svcCategories = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching service category.'));
    });
  }

  getServiceProviders() {
    this.catalogueService.getServiceProviders().pipe(take(1)).subscribe(res => {
      this.svcProviders = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching service providers.'));
    });
  }

  getTerms() {
    this.catalogueService.getTerms().pipe(takeUntil(this.ngUnsubscribe)).subscribe(terms => {
      this.terms = this.catalogueService.convertToTermViewData(terms);
      if (this.terms.length) {
        this.selectedTerm = this.terms[0];
        this.getAllCatalogueServices();
      } else {
        this.spinnerService.stop('main');
      }
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification("Failed to load service catalogues. Please tryagain later."));
      this.spinnerService.stop('main');
    })
  }

  getAllCatalogueServices() {
    this.catalogueService.getCatalogueByTerm(this.selectedTerm.name, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinnerService.stop('main');
      this.viewData = this.catalogueService.convertToViewData(res, this.selectedTerm);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification("Failed to load service catalogues. Please tryagain later."));
      this.spinnerService.stop('main');
    })
  }

  toggleCategoryCheck(serviceCategory: string, isChecked: boolean) {
    if (isChecked) {
      if (serviceCategory == 'all') {
        this.selectedSvcCategories = this.svcCategories;
      } else {
        this.selectedSvcCategories.push(serviceCategory);
      }
    } else {
      if (serviceCategory == 'all') {
        this.selectedSvcCategories = [];
      } else {
        let index = this.selectedSvcCategories.findIndex(x => x == serviceCategory);
        this.selectedSvcCategories.splice(index, 1);
      }
    }
  }

  isCategoryChecked(serviceCategory: string) {
    return this.selectedSvcCategories.includes(serviceCategory);
  }

  toggleProviderCheck(serviceProvider: string, isChecked: boolean) {
    if (isChecked) {
      if (serviceProvider == 'all') {
        this.selectedSvcProviders = this.svcProviders;
      } else {
        this.selectedSvcProviders.push(serviceProvider);
      }
    } else {
      if (serviceProvider == 'all') {
        this.selectedSvcProviders = [];
      } else {
        let index = this.selectedSvcProviders.findIndex(x => x == serviceProvider);
        this.selectedSvcProviders.splice(index, 1);
      }
    }
  }

  isProviderChecked(serviceProvider: string) {
    return this.selectedSvcProviders.includes(serviceProvider);
  }

  onOpenChange(data: boolean): void {
    //on closed data will be false
    if (!data) {
      //Get data
      this.currentCriteria.multiValueParam['category'] = this.selectedSvcCategories;
      this.currentCriteria.multiValueParam['provider'] = this.selectedSvcProviders;
      this.getAllCatalogueServices();
    }
  }

  createTicket(view: ServiceCatalogueViewData) {
    this.ticketService.createTicket({
      subject: SERVICE_CATELOGUE_TICKET_SUBJECT(view.serviceCategory), metadata: SERVICE_CATALOGUE_TICKET_METADATA(view.serviceCategory, view.provider, view.serviceName, view.term.displayName)
    });
  }

}
