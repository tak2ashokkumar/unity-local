import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubscribedCatalogueServicesService } from './subscribed-catalogue-services.service';
import { Subject, interval } from 'rxjs';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { takeUntil, tap, switchMap, takeWhile } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'subscribed-catalogue-services',
  templateUrl: './subscribed-catalogue-services.component.html',
  styleUrls: ['./subscribed-catalogue-services.component.scss'],
  providers: [SubscribedCatalogueServicesService]
})
export class SubscribedCatalogueServicesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  subscribedCatalogueServices: any[] = [];
  filteredCatalogueServices: any[] = [];
  pagedviewData: any[] = [];

  currentCriteria: SearchCriteria;
  fieldsToFilterOn: string[] = ['device_name', 'device_type', 'alert_name'];
  poll: boolean = false;
  constructor(private subscribedCatalogueService: SubscribedCatalogueServicesService,
    private spinnerService: AppSpinnerService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private clientSidePage: ClientSidePage,
    private termService: FloatingTerminalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getSubscribedCatalogueServices());
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getSubscribedCatalogueServices();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private filterAndPage() {
    this.filteredCatalogueServices = this.clientSideSearchPipe.transform(this.subscribedCatalogueServices, this.currentCriteria.searchValue, this.fieldsToFilterOn);
    this.pagedviewData = this.clientSidePage.page(this.filteredCatalogueServices, this.currentCriteria);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.filterAndPage();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.pagedviewData = this.clientSidePage.page(this.filteredCatalogueServices, this.currentCriteria);
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.pagedviewData = this.clientSidePage.page(this.filteredCatalogueServices, this.currentCriteria);
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getSubscribedCatalogueServices();
  }

  getSubscribedCatalogueServices() {
    this.subscribedCatalogueService.getSubscribedCatalogueServices().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinnerService.stop('main');
      // this.subscribedCatalogueServices = this.subscribedCatalogueService.concat(this.subscribedCatalogueService.convertToViewData(res));
    }, (err: HttpErrorResponse) => {

    })
  }

  createTicket() {

  }

}
