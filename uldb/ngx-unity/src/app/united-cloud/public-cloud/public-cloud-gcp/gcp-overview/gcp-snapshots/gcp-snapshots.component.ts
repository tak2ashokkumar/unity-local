import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject, interval } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { GCP_SNAPSHOT_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { GCPSnapshotViewData, PublicCloudGCPSnapshotService } from './gcp-snapshots.service';

@Component({
  selector: 'gcp-snapshots',
  templateUrl: './gcp-snapshots.component.html',
  styleUrls: ['./gcp-snapshots.component.scss'],
  providers: [PublicCloudGCPSnapshotService]
})
export class GcpSnapshotsComponent implements OnInit, OnDestroy {
  fieldsToFilterOn: string[] = ['name', 'email'];

  viewData: GCPSnapshotViewData[] = [];
  private ngUnsubscribe = new Subject();
  accountId: string;
  regionId: string;
  count: number;
  currentCriteria: SearchCriteria;
  poll: boolean = false;
  syncInProgress: boolean = false;

  constructor(private notification: AppNotificationService,
    private spinnerService: AppSpinnerService,
    private route: ActivatedRoute,
    private ticketService: SharedCreateTicketService,
    private snapshotService: PublicCloudGCPSnapshotService,
    private termService: FloatingTerminalService) {}

  subscribeToTerminal() {
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll && !this.syncInProgress), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => {
        this.createTaskAndPoll()
      });
  }

  ngOnInit() {
    this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.accountId = params.get('accountId');
      this.regionId = params.get('regionId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'account_id': this.accountId, 'region': this.regionId }] };
      setTimeout(() => {
        this.spinnerService.start('main');
        this.getSnapshots();
        this.createTaskAndPoll();
      }, 0);
    });
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getSnapshots();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getSnapshots();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getSnapshots();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getSnapshots();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.createTaskAndPoll();
  }

  getSnapshots() {
    this.snapshotService.getGCPSnapshots(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.snapshotService.convertToViewData(res.results);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  createTaskAndPoll() {
    if (this.syncInProgress) {
      this.spinnerService.stop('main');
      return;
    }
    this.syncInProgress = true;
    this.snapshotService.createTaskAndPoll(this.accountId, this.regionId).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(status => {
        if (status.result.data) {
          this.getSnapshots();
        } else {
          this.spinnerService.stop('main');
          this.notification.error(new Notification(status.result.message));
        }
        this.syncInProgress = false;
        this.subscribeToTerminal();
      }, (err: Error) => {
        this.syncInProgress = false;
        this.subscribeToTerminal();
        this.notification.error(new Notification('Error while fetching Google Cloud Snapshots'));
      });
  }

  createTicket(view: GCPSnapshotViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT("GCP Snapshots", view.name), metadata: GCP_SNAPSHOT_TICKET_METADATA("GCP Snapshots", view.name,
        view.sourceVmDisk, view.storageLocation, view.creationTimestamp)
    });
  }

}
