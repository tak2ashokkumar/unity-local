import { Component, OnDestroy, OnInit } from '@angular/core';
import { StorageOntapFcPortsService, StorageOntapFcPortsServiceViewData, fcColumnMapping } from './storage-ontap-fc-ports.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableColumnMapping } from 'src/app/unity-services/green-it/green-it-usage/green-it-usage.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { SUMMARY_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { StorageOntapService } from '../storage-ontap.service';
import { SyncResult } from 'src/app/shared/SharedEntityTypes/paginated.type';

@Component({
  selector: 'storage-ontap-fc-ports',
  templateUrl: './storage-ontap-fc-ports.component.html',
  styleUrls: ['./storage-ontap-fc-ports.component.scss'],
  providers: [StorageOntapService, StorageOntapFcPortsService]
})
export class StorageOntapFcPortsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  clusterId: string;
  itemId: string;
  count: number;
  sync: SyncResult = new SyncResult();
  tableColumns: TableColumnMapping[] = fcColumnMapping;
  columnsSelected: TableColumnMapping[] = [];
  viewData: StorageOntapFcPortsServiceViewData[] = [];

  constructor(private svc: StorageOntapFcPortsService,
    private ontapSvc: StorageOntapService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private refreshService: DataRefreshBtnService,
  ) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.itemId = params.get('id'));
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.clusterId = params.get('deviceid'));

    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.columnsSelected = this.tableColumns.filter(col => col.default);
      this.getFcPorts();
    }, 0);
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getFcPorts();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getFcPorts();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getFcPorts();
  }

  refreshData() {
    setTimeout(() => {
      this.currentCriteria.pageNo = 1;
      this.getFcPorts();
    }, 0);
  }

  getFcPorts() {
    this.spinner.start('main');
    this.svc.getFcPorts(this.currentCriteria, this.clusterId, this.itemId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.sync = this.ontapSvc.convertToSyncData(res);
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      // this.notification.error(new Notification('Failed to fetch node details.'));
    })
  }

  syncData() {
    this.sync.inProgress = true;
    this.ontapSvc.syncData(this.sync.url).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.sync.inProgress = false;
    }, (err: HttpErrorResponse) => {
      this.sync.inProgress = false;
    })
  }

  createTicket(view: StorageOntapFcPortsServiceViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('Fc', view.name),
      metadata: SUMMARY_TICKET_METADATA('Fc', view.name)
    });
  }
}