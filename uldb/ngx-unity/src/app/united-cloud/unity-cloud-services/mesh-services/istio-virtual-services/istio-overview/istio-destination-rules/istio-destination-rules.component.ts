import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject, interval } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ISTIO_DESTINATION_RULES_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { IstioDestRulesViewData, IstioDestinationRulesService } from './istio-destination-rules.service';

@Component({
  selector: 'istio-destination-rules',
  templateUrl: './istio-destination-rules.component.html',
  styleUrls: ['./istio-destination-rules.component.scss'],
  providers: [IstioDestinationRulesService]
})
export class IstioDestinationRulesComponent implements OnInit, OnDestroy {
  meshId: string;
  nameSpace: string;
  fieldsToFilterOn: string[] = ['name', 'host', 'versions', 'labels', 'namespace'];

  viewData: IstioDestRulesViewData[] = [];
  filteredViewData: IstioDestRulesViewData[] = [];
  pagedviewData: IstioDestRulesViewData[] = [];
  poll: boolean = false;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();

  constructor(private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private notification: AppNotificationService,
    private dRulesService: IstioDestinationRulesService,
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
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getDestinationRules());
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getDestinationRules();
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
    this.getDestinationRules();
  }

  getDestinationRules() {
    this.dRulesService.getDestinationRules(this.meshId, this.nameSpace).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.viewData = this.dRulesService.convertToViewData(res);
        this.filterAndPage();
        this.spinnerService.stop('main');
      }, (err: Error) => {
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Error while fetching virtual services'));
      });
  }

  createTicket(data: IstioDestRulesViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('Istio Destination Rules', data.name),
      metadata: ISTIO_DESTINATION_RULES_TICKET_METADATA('Istio Destination Rules', data.name, data.versions, data.host, data.namespace)
    });
  }
}
