import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, interval } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ISTIO_POD_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { IstioPodViewdata, IstioPodsService } from './istio-pods.service';

@Component({
  selector: 'istio-pods',
  templateUrl: './istio-pods.component.html',
  styleUrls: ['./istio-pods.component.scss'],
  providers: [IstioPodsService]
})
export class IstioPodsComponent implements OnInit, OnDestroy {
  meshId: string;
  nameSpace: string;
  serviceName: string;
  fieldsToFilterOn: string[] = ['name', 'podIp', 'namespace', 'startTime', 'hostIp', 'nodeName', 'phase'];

  viewData: IstioPodViewdata[] = [];
  filteredViewData: IstioPodViewdata[] = [];
  pagedviewData: IstioPodViewdata[] = [];
  poll: boolean = false;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();

  constructor(private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private notification: AppNotificationService,
    private podService: IstioPodsService,
    private router: Router,
    private clientSidePage: ClientSidePage,
    private termService: FloatingTerminalService) {
    this.route.parent.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.meshId = params.get('meshId');
    });
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.nameSpace = params.get('namespace');
    });
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.serviceName = params.get('serviceName');
    });

    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getPods());
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getPods();
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
    this.getPods();
  }

  getPods() {
    this.podService.getpods(this.meshId, this.nameSpace, this.serviceName).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.viewData = this.podService.convertToViewdata(res);
        this.filterAndPage();
        this.spinnerService.stop('main');
      }, (err: Error) => {
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Error while fetching pods'));
      });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  goTo(view: IstioPodViewdata) {
    this.router.navigate([view.name, 'containers'], { relativeTo: this.route });
  }

  createTicket(data: IstioPodViewdata) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('Istio Pods', data.name),
      metadata: ISTIO_POD_TICKET_METADATA('Istio Pods', data.name, data.podIp, data.namespace, data.hostIp, data.phase, data.startTime)
    });
  }
}
