import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, from, interval } from 'rxjs';
import { mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ISTIO_VIRTUAL_SERVICE_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { IstioVirtualServiceViewData, IstioVirtualServicesService } from './istio-virtual-services.service';

@Component({
  selector: 'istio-virtual-services',
  templateUrl: './istio-virtual-services.component.html',
  styleUrls: ['./istio-virtual-services.component.scss'],
  providers: [IstioVirtualServicesService]
})
export class IstioVirtualServicesComponent implements OnInit, OnDestroy {
  meshId: string;
  fieldsToFilterOn: string[] = ['name', 'destinationHost', 'gateways', 'namespace'];
  
  viewData: IstioVirtualServiceViewData[] = [];
  filteredViewData: IstioVirtualServiceViewData[] = [];
  pagedviewData: IstioVirtualServiceViewData[] = [];
  poll: boolean = false;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();

  constructor(private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private notification: AppNotificationService,
    private istioService: IstioVirtualServicesService,
    private router: Router,
    private clientSidePage: ClientSidePage,
    private termService: FloatingTerminalService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.meshId = params.get('meshId');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getVirtualServices());
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getVirtualServices();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
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
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getVirtualServices();
  }

  getVirtualServices() {
    this.istioService.getServices(this.meshId).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.viewData = this.istioService.convertToViewData(res);
        this.filterAndPage();
        this.getVirtualServiceStatus();
        this.spinnerService.stop('main');
      }, (err: Error) => {
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Error while fetching virtual services'));
      });
  }

  getVirtualServiceStatus() {
    from(this.viewData).pipe(mergeMap(e => this.istioService.getVirtualServiceStatus(this.meshId, e.name, e.namespace)), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const index = this.viewData.map(data => data.name).indexOf(key);
          if (res.get(key)) {
            const status = res.get(key);
            this.viewData[index].status = status;
            this.viewData[index].statusIcon = this.istioService.getStatusIcon(status);
          } else {
            this.viewData[index].status = 'N/A';
            this.viewData[index].statusIcon = this.istioService.getStatusIcon(status);
          }
        },
        err => console.log(err),
        () => {
          //Do anything after everything done
        }
      );
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  goTo(view: IstioVirtualServiceViewData) {
    this.router.navigate([view.namespace, 'iservices'], { relativeTo: this.route });
  }

  goToGraph(view: IstioVirtualServiceViewData) {
    this.router.navigate([view.namespace, view.gateways, 'tree'], { relativeTo: this.route });
  }

  createTicket(data: IstioVirtualServiceViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('Istio Virtual Service', data.name),
      metadata: ISTIO_VIRTUAL_SERVICE_TICKET_METADATA('Istio Virtual Service', data.name, data.gateways, data.destinationHost, data.namespace)
    });
  }

}