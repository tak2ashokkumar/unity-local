import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, interval } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { TDS_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { TdsService, TdsViewData } from './tds.service';

@Component({
  selector: 'tds',
  templateUrl: './tds.component.html',
  styleUrls: ['./tds.component.scss'],
  providers: [TdsService]
})
export class TdsComponent implements OnInit, OnDestroy {
  meshId: string;
  fieldsToFilterOn: string[] = ['name', 'networks', 'negCount', 'regions', 'associatedUrlMap'];
  currentCriteria: SearchCriteria;

  viewData: TdsViewData[] = [];
  filteredViewData: TdsViewData[] = [];
  pagedviewData: TdsViewData[] = [];
  poll: boolean = false;
  syncInProgress: boolean = false;
  private ngUnsubscribe = new Subject();

  constructor(private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private notification: AppNotificationService,
    private tdsService: TdsService,
    private router: Router,
    private clientSidePage: ClientSidePage,
    private termService: FloatingTerminalService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.meshId = params.get('meshId');
    });

    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  subscribeToTerminal() {
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll && !this.syncInProgress), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => {
        this.createTaskAndPoll()
      });
  }

  ngOnInit() {
    this.createTaskAndPoll();
    this.getTds();
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
    this.createTaskAndPoll();
  }

  createTaskAndPoll() {
    if (this.syncInProgress) {
      this.spinnerService.stop('main');
      return;
    }
    this.syncInProgress = true;
    this.notification.success(new Notification("Latest data is being updated."));
    this.tdsService.syncTds(this.meshId).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(status => {
        if (status.result.data) {
          this.viewData = this.tdsService.convertToViewData(status.result.data);
          this.filterAndPage();
        } else {
          this.notification.error(new Notification(status.result.message));
        }
        this.spinnerService.stop('main');
        this.syncInProgress = false;
        this.subscribeToTerminal();
      }, (err: Error) => {
        this.spinnerService.stop('main');
        this.syncInProgress = false;
        this.subscribeToTerminal();
        this.notification.error(new Notification('Error while fetching traffic directors'));
      });
  }

  getTds() {
    this.spinnerService.start('main');
    this.tdsService.getTds(this.meshId).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this.viewData = this.tdsService.convertToViewData(data.results);
        this.filterAndPage();
        this.spinnerService.stop('main');
      }, (err: Error) => {
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Error while fetching traffic directors'));
      });
  }

  goTo(view: TdsViewData) {
    this.router.navigate([view.name, 'neg'], { relativeTo: this.route });
  }

  goToGraph(view: TdsViewData) {
    this.router.navigate([view.name, 'tree'], { relativeTo: this.route });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  createTicket(data: TdsViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('Traffice Director', data.name), metadata: TDS_TICKET_METADATA('Traffice Director', data.name, data.associatedUrlMap, data.regions, data.negCount)
    });
  }
}
