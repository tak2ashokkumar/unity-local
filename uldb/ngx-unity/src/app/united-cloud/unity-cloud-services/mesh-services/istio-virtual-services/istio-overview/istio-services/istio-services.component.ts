import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, from, interval } from 'rxjs';
import { mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ISTIO_SERVICES_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { IstioServiceViewdata, IstioServicesService } from './istio-services.service';

@Component({
  selector: 'istio-services',
  templateUrl: './istio-services.component.html',
  styleUrls: ['./istio-services.component.scss'],
  providers: [IstioServicesService]
})
export class IstioServicesComponent implements OnInit, OnDestroy {
  meshId: string;
  nameSpace: string;
  fieldsToFilterOn: string[] = ['name', 'clusterIp', 'namespace'];

  viewData: IstioServiceViewdata[] = [];
  filteredViewData: IstioServiceViewdata[] = [];
  pagedviewData: IstioServiceViewdata[] = [];
  poll: boolean = false;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();

  constructor(private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private notification: AppNotificationService,
    private iService: IstioServicesService,
    private router: Router,
    private clientSidePage: ClientSidePage,
    private termService: FloatingTerminalService) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.meshId = params.get('meshId');
    });
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.nameSpace = params.get('namespace');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getServices());
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getServices();
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
    this.getServices();
  }

  getServices() {
    this.iService.getServices(this.meshId, this.nameSpace).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.viewData = this.iService.convertToViewData(res);
        this.filterAndPage();
        this.getServiceStatus();
        this.spinnerService.stop('main');
      }, (err: Error) => {
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Error while fetching virtual services'));
      });
  }

  getServiceStatus() {
    from(this.viewData).pipe(mergeMap(e => this.iService.getServiceStatus(this.meshId, e.name, e.namespace)), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const index = this.viewData.map(data => data.name).indexOf(key);
          if (res.get(key)) {
            const status = res.get(key);
            this.viewData[index].status = status;
            this.viewData[index].statusIcon = this.iService.getStatusIcon(status);
          } else {
            this.viewData[index].status = 'N/A';
            this.viewData[index].statusIcon = this.iService.getStatusIcon(status);
          }
        },
        err => console.log(err),
        () => {
          //Do anything after everything done
        }
      );
  }

  goTo(view: IstioServiceViewdata) {
    this.router.navigate([view.name, 'pods'], { relativeTo: this.route });
  }

  createTicket(data: IstioServiceViewdata) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('Istio Service', data.name),
      metadata: ISTIO_SERVICES_TICKET_METADATA('Istio Service', data.name, data.clusterIp, data.namespace)
    });
  }
}
