import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { SNAP_MIRRORS_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableColumnMapping } from 'src/app/unity-services/green-it/green-it-usage/green-it-usage.service';
import { StorageOntapClusterSnapMirrorsViewData, StorageOntapSnapMirrorsService, snapMirrorsColumnMapping } from './storage-ontap-snap-mirrors.service';
import { StorageOntapService } from '../storage-ontap.service';
import { SyncResult } from 'src/app/shared/SharedEntityTypes/paginated.type';

@Component({
  selector: 'storage-ontap-snap-mirrors',
  templateUrl: './storage-ontap-snap-mirrors.component.html',
  styleUrls: ['./storage-ontap-snap-mirrors.component.scss'],
  providers: [StorageOntapService, StorageOntapSnapMirrorsService]
})
export class StorageOntapSnapMirrorsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  clusterId: string;
  currentCriteria: SearchCriteria;

  count: number;
  sync: SyncResult = new SyncResult();
  viewData: StorageOntapClusterSnapMirrorsViewData[] = [];
  tableColumns: TableColumnMapping[] = snapMirrorsColumnMapping;
  columnForm: FormGroup;
  columnsSelected: TableColumnMapping[] = [];

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

  constructor(private svc: StorageOntapSnapMirrorsService,
    private ontapSvc: StorageOntapService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private refreshService: DataRefreshBtnService,
    private storageService: StorageService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.clusterId = params.get('deviceid'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.columnsSelected = this.tableColumns.filter(col => col.default);
      this.getSnapMirrors();
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
    this.getSnapMirrors();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getSnapMirrors();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getSnapMirrors();
  }

  refreshData() {
    setTimeout(() => {
      this.currentCriteria.pageNo = 1;
      this.getSnapMirrors();
      this.buildColumnForm();
    }, 0);
  }

  getSnapMirrors() {
    this.spinner.start('main');
    this.svc.getSnapMirrors(this.clusterId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
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

  buildColumnForm() {
    this.columnForm = this.svc.buildColumnSelectionForm(this.columnsSelected);
  }

  columnChange() {
    this.spinner.start('main');
    this.columnsSelected = _clone(this.columnForm.getRawValue().columns);
    this.spinner.stop('main');
  }

  syncData() {
    this.sync.inProgress = true;
    this.ontapSvc.syncData(this.sync.url).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.sync.inProgress = false;
    }, (err: HttpErrorResponse) => {
      this.sync.inProgress = false;
    })
  }

  createTicket(view: StorageOntapClusterSnapMirrorsViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('Snap Mirror', view.healthy),
      metadata: SNAP_MIRRORS_TICKET_METADATA('Snap Mirror', view.healthy)
    });
  }
}