import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, from, interval } from 'rxjs';
import { mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { NEG_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { NegService, NegViewDataType } from './neg.service';

@Component({
  selector: 'neg',
  templateUrl: './neg.component.html',
  styleUrls: ['./neg.component.scss'],
  providers: [NegService]
})
export class NegComponent implements OnInit, OnDestroy {
  meshId: string;
  serviceName: string;
  fieldsToFilterOn: string[] = ['name', 'networkEndpointType', 'zone', 'maxRps', 'capacity', 'health'];
  currentCriteria: SearchCriteria;

  viewData: NegViewDataType[] = [];
  filteredViewData: NegViewDataType[] = [];
  pagedviewData: NegViewDataType[] = [];
  poll: boolean = false;
  syncInProgress: boolean = false;
  private ngUnsubscribe = new Subject();

  constructor(private route: ActivatedRoute,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private router: Router,
    private negService: NegService,
    private ticketService: SharedCreateTicketService,
    private notification: AppNotificationService,
    private spinnerService: AppSpinnerService,
    private clientSidePage: ClientSidePage,
    private termService: FloatingTerminalService) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.meshId = params.get('meshId');
    });
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.serviceName = params.get('serviceName');
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
    this.getNegList();
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
    this.negService.syncNegList(this.meshId, this.serviceName).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(status => {
        if (status.result.data) {
          this.viewData = this.negService.convertToViewData(status.result.data);
          this.filterAndPage();
          this.getNEGServiceStatus();
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
        this.notification.error(new Notification('Error while fetching NEGs'));
      });
  }

  getNegList() {
    this.spinnerService.start('main');
    this.negService.getNegList(this.meshId, this.serviceName).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this.viewData = this.negService.convertToViewData(data.results);
        this.filterAndPage();
        this.getNEGServiceStatus();
        this.spinnerService.stop('main');
      }, (err: Error) => {
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Error while fetching NEGs'));
      });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  goTo(view: NegViewDataType) {
    this.router.navigate([view.name, view.zone, 'backend'], { relativeTo: this.route });
  }

  createTicket(data: NegViewDataType) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('Network Endpoint Group', data.name), metadata: NEG_TICKET_METADATA('Network Endpoint Group', data.capacity, data.name, data.zone, data.networkEndpointType, data.health, data.maxRps)
    });
  }

  getNEGServiceStatus() {
    from(this.viewData).pipe(mergeMap(e => this.negService.getNEGServiceStatus(e.uuid, this.meshId, this.serviceName)), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const index = this.viewData.map(data => data.uuid).indexOf(key);
          if (res.get(key)) {
            const status = res.get(key);
            this.viewData[index].health = status;
            this.viewData[index].statusIcon = this.negService.getStatusIcon(status);
          } else {
            this.viewData[index].health = 'N/A';
            this.viewData[index].statusIcon = this.negService.getStatusIcon(status);
          }
        },
        err => {
          console.log(err)
        }
      );
  }
}

