import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaginatedResult, SyncResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { SUMMARY_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { StorageOntapClusterNode } from '../storage-ontap.type';
import { StorageOntapClusterNodeViewData, StorageOntapNodesService, nodesColumnMapping } from './storage-ontap-nodes.service';
import { StorageOntapService } from '../storage-ontap.service';

@Component({
  selector: 'storage-ontap-nodes',
  templateUrl: './storage-ontap-nodes.component.html',
  styleUrls: ['./storage-ontap-nodes.component.scss'],
  providers: [StorageOntapService, StorageOntapNodesService]
})
export class StorageOntapNodesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  clusterId: string;
  currentCriteria: SearchCriteria;
  count: number = 0;
  sync: SyncResult = new SyncResult();
  nodeData: PaginatedResult<StorageOntapClusterNode>;

  tableColumns: TableColumnMapping[] = nodesColumnMapping;
  columnForm: FormGroup;
  columnsSelected: TableColumnMapping[] = [];
  viewData: StorageOntapClusterNodeViewData[] = [];

  columnSelectionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    selectAsObject: true,
    selectionLimit: 10,
    buttonClasses: 'btn btn-default btn-block p-1',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false
  };

  columnSelectionTexts: IMultiSelectTexts = {
    checkAll: 'Select all columns',
    uncheckAll: 'Deselect all columns',
    checked: 'column',
    checkedPlural: 'columns',
    defaultTitle: 'Select columns',
    allSelected: 'All columns selected',
  };

  constructor(private svc: StorageOntapNodesService,
    private ontapSvc: StorageOntapService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private refreshService: DataRefreshBtnService,
    private storageService: StorageService,) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.clusterId = params.get('deviceid'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.columnsSelected = this.tableColumns.filter(col => col.default);
      this.getNodes();
      this.buildColumnForm();
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
    this.getNodes();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getNodes();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getNodes();
  }

  refreshData() {
    setTimeout(() => {
      this.currentCriteria.pageNo = 1;
      this.columnsSelected = this.tableColumns.filter(col => col.default);
      this.getNodes();
      this.buildColumnForm();
    }, 0);
  }

  getNodes() {
    this.spinner.start('main');
    this.svc.getNodes(this.clusterId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.sync = this.ontapSvc.convertToSyncData(res);
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
      // this.notification.error(new Notification('Failed to fetch nodes.'));
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

  buildColumnForm() {
    this.columnForm = this.svc.buildColumnSelectionForm(this.columnsSelected);
  }

  columnChange() {
    this.spinner.start('main');
    this.columnsSelected = _clone(this.columnForm.getRawValue().columns);
    this.spinner.stop('main');
  }

  loadCharts(view: StorageOntapClusterNodeViewData) {
    this.storageService.put('ontap-entity', { name: view.name }, StorageType.SESSIONSTORAGE);
    this.router.navigate(['details'], { relativeTo: this.route });
  }

  loadDetails(view: StorageOntapClusterNodeViewData, path: string) {
    this.storageService.put('ontap-entity', { name: view.name, type: 'node', state: view.state }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.id, path], { relativeTo: this.route });
  }

  createTicket(view: StorageOntapClusterNodeViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('Node', view.name),
      metadata: SUMMARY_TICKET_METADATA('Node', view.name)
    });
  }
}
