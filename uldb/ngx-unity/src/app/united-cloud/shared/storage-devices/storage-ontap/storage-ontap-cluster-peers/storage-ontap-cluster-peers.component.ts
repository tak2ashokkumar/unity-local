import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { SUMMARY_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { StorageOntapClusterPeerViewData, StorageOntapClusterPeersService } from './storage-ontap-cluster-peers.service';

@Component({
  selector: 'storage-ontap-cluster-peers',
  templateUrl: './storage-ontap-cluster-peers.component.html',
  styleUrls: ['./storage-ontap-cluster-peers.component.scss'],
  providers: [StorageOntapClusterPeersService]
})
export class StorageOntapClusterPeersComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  clusterId: string;
  currentCriteria: SearchCriteria;

  viewData: StorageOntapClusterPeerViewData[] = [];
  count: number;
  popOverList: string[];

  constructor(private clusterPeerService: StorageOntapClusterPeersService,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private ticketService: SharedCreateTicketService,
    private refreshService: DataRefreshBtnService,) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.clusterId = params.get('deviceid'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.getClusterPeers();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getClusterPeers();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getClusterPeers();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getClusterPeers();
  }

  refreshData() {
    setTimeout(() => {
      this.currentCriteria.pageNo = 1;
      this.getClusterPeers();
    }, 0);
  }

  getClusterPeers() {
    this.spinner.start('main');
    this.clusterPeerService.getClusterPeers(this.clusterId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.clusterPeerService.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get cluster peers.'));
    });
  }

  showIpAddresses(view: StorageOntapClusterPeerViewData) {
    this.popOverList = view.extraIpAddressList;
  }

  createTicket(view: StorageOntapClusterPeerViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('Cluster Peer', view.name),
      metadata: SUMMARY_TICKET_METADATA('Cluster Peer', view.name)
    });
  }
}
