import { Component, OnInit } from '@angular/core';
import { ITSMColumn, UnityoneItsmTicketService } from './unityone-itsm-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { forkJoin, Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'unityone-itsm-ticket',
  templateUrl: './unityone-itsm-ticket.component.html',
  styleUrls: ['./unityone-itsm-ticket.component.scss'],
  providers: [UnityoneItsmTicketService]
})
export class UnityoneItsmTicketComponent implements OnInit {
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();

  viewData: Record<string, any>[] = [];
  count = 0;
  tableId: string;

  columnSelectionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
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

  columnForm: FormGroup;
  tableColumns: ITSMColumn[] = [];
  headers: ITSMColumn[] = [];
  columnsSelected: ITSMColumn[] = [];

  constructor(private svc: UnityoneItsmTicketService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private utilSvc: AppUtilityService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.tableId = params.get('tableUuid');
    });
  }

  ngOnInit(): void {
    // this.spinner.start('main');
    this.getUnityOneITSM();
    this.buildColumnForm();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    // this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getUnityOneITSM();
  }

  onSearched(event: string) {
    // this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getUnityOneITSM();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      // this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getUnityOneITSM();
    }
  }

  pageSizeChange(pageSize: number) {
    // this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getUnityOneITSM();
  }

  refreshData(pageNo: number) {
    // this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getUnityOneITSM();
  }

  getUnityOneITSM() {
    // this.spinner.start('main');
    forkJoin({
      tableMeta: this.svc.getUnityOneITSMTableData(this.tableId),
      records: this.svc.getUnityOneITSMData(this.tableId, this.currentCriteria)
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ tableMeta, records }) => {
      this.count = records.count;
      this.viewData = this.svc.convertToViewData(records.results || []);
      this.buildColumnsFromMeta(tableMeta?.fields || []);
      this.spinner.stop('main');
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load data'));
    });
  }


  buildColumnsFromMeta(fields: any[]) {
    if (!fields?.length) return;

    const dateTimeKeys = fields.filter(f => f.field_type === 'DATETIME' || f.field_type === 'DATE').map(f => f.field_name);

    if (dateTimeKeys.length) {
      this.viewData?.forEach(row => {
        dateTimeKeys.forEach(k => {
          if (row[k]) {
            row[k] = this.utilSvc.toUnityOneDateFormat(row[k]);
          }
        });
      });
    }
    // Map backend fields
    let cols: ITSMColumn[] = fields.filter(f => f.field_type !== 'COMMENTS').map(f => ({
      key: f.field_name,
      label: f.label
    }));

    // ticket_id always first
    cols.unshift({ key: 'ticket_id', label: 'Ticket ID' });
    // Remove uuid completely
    cols = cols.filter(c => c.key !== 'uuid');
    this.tableColumns = cols;
    // Select first 6 initially
    this.columnsSelected = cols.slice(0, 6);
    // Visible headers = selected columns
    this.headers = [...this.columnsSelected];
    this.buildColumnForm(this.columnsSelected);
  }

  trackByFn(i: number) { return i; }

  createUnityOneITSM() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  editUnityOneITSM(row: any) {
    this.router.navigate([row.uuid, 'edit'], { relativeTo: this.route });
  }

  buildColumnForm(selectedColumns: ITSMColumn[] = []) {
    this.columnForm = this.svc.buildColumnSelectionForm(selectedColumns);
  }

  columnChange() {
    this.spinner.start('main');
    this.columnsSelected = _clone(this.columnForm.getRawValue().columns || []);
    // update visible headers
    this.headers = [...this.columnsSelected];
    this.spinner.stop('main');
  }
}
