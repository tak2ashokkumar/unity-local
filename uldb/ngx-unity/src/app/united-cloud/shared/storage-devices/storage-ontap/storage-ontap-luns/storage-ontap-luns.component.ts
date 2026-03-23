import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { SUMMARY_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { StorageOntapClusterLUNViewData, StorageOntapLunsService, lunsColumnMapping } from './storage-ontap-luns.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { StorageOntapService } from '../storage-ontap.service';
import { SyncResult } from 'src/app/shared/SharedEntityTypes/paginated.type';

@Component({
  selector: 'storage-ontap-luns',
  templateUrl: './storage-ontap-luns.component.html',
  styleUrls: ['./storage-ontap-luns.component.scss'],
  providers: [StorageOntapService, StorageOntapLunsService]
})
export class StorageOntapLunsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  clusterId: string;
  currentCriteria: SearchCriteria;
  count: number;
  sync: SyncResult = new SyncResult();
  tableColumns: TableColumnMapping[] = lunsColumnMapping;
  columnForm: FormGroup;
  columnsSelected: TableColumnMapping[] = [];
  viewData: StorageOntapClusterLUNViewData[] = [];

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
  constructor(private svc: StorageOntapLunsService,
    private ontapSvc: StorageOntapService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
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
      this.getLUNs();
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
    this.getLUNs();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getLUNs();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getLUNs();
  }

  refreshData() {
    setTimeout(() => {
      this.columnsSelected = this.tableColumns.filter(col => col.default);
      this.getLUNs();
      this.buildColumnForm();
    }, 0);
  }

  getLUNs() {
    this.spinner.start('main');
    this.svc.getLUNs(this.clusterId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.sync = this.ontapSvc.convertToSyncData(res);
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
      // this.notification.error(new Notification('Failed to fetch LUNs.'));
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

  loadCharts(view: StorageOntapClusterLUNViewData) {
    this.storageService.put('ontap-entity', { name: view.name }, StorageType.SESSIONSTORAGE);
    this.router.navigate(['details'], { relativeTo: this.route });
  }

  loadDetails(view: StorageOntapClusterLUNViewData) {
    this.storageService.put('ontap-entity', { name: view.name,type: 'lun', state: view.state}, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.id, 'overview'], { relativeTo: this.route });
  }

  createTicket(view: StorageOntapClusterLUNViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('LUN', view.name),
      metadata: SUMMARY_TICKET_METADATA('LUN', view.name)
    });
  }

}
