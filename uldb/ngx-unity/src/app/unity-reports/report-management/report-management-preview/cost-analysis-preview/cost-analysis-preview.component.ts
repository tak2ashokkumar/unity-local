import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import {
  IMultiSelectSettings,
  IMultiSelectTexts,
} from 'src/app/shared/multiselect-dropdown/types';
import {
  PAGE_SIZES,
  SearchCriteria,
} from 'src/app/shared/table-functionality/search-criteria';
import {
  PreviewModel,
  ReportManagementCostAnalysisPreviewService,
} from './cost-analysis-preview.service';

/**
 * Coordinates the Report Management Cost Analysis Preview screen state, template bindings, and user actions.
 */
@Component({
  selector: 'report-management-cost-analysis-preview',
  templateUrl: './cost-analysis-preview.component.html',
  styleUrls: ['./cost-analysis-preview.component.scss'],
})
export class ReportManagementCostAnalysisPreviewComponent implements OnInit {
  /**
   * Stores the active table search, sort, and paging criteria.
   */
  currentCriteria: SearchCriteria;
  /**
   * Stores the active report identifier from the current route or row action.
   */
  @Input('reportId') reportId: string = null;
  private ngUnsubscribe = new Subject();
  /**
   * Stores the table data value used by Report Management Cost Analysis Preview Component.
   */
  tableData: PreviewModel[] = [];
  /**
   * Stores the total result count for the active table query.
   */
  count: number;

  /**
   * Stores dynamic table column metadata returned by the preview API.
   */
  tableColumns: any[] = [];
  /**
   * Holds the column selection form used by preview tables.
   */
  columnForm: FormGroup;
  /**
   * Stores the currently selected preview columns.
   */
  columnsSelected: any[] = [];

  /**
   * Configures the column selection UI behavior.
   */
  columnSelectionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'key',
    selectAsObject: true,
    selectionLimit: 15,
    buttonClasses: 'btn btn-default btn-block p-1',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: true,
    showUncheckAll: true,
  };

  /**
   * Defines display text for the column selection UI control.
   */
  columnSelectionTexts: IMultiSelectTexts = {
    checkAll: 'Select all columns',
    uncheckAll: 'Deselect all columns',
    checked: 'column',
    checkedPlural: 'columns',
    defaultTitle: 'Select columns',
    allSelected: 'All columns selected',
  };

  constructor(
    private svc: ReportManagementCostAnalysisPreviewService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService
  ) {
    this.currentCriteria = {
      sortColumn: '',
      sortDirection: '',
      searchValue: '',
      pageNo: 1,
      pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE,
    };
  }

  /**
   * Initializes Report Management Cost Analysis Preview Component data and subscriptions.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.spinner.start('main');
    // Cost preview is table-driven and supports runtime column selection.
    this.getColumns();
    this.getTableData();
  }

  /**
   * Handles the sorted event from the template.
   *
   * @param $event - Event payload emitted by the template control.
   * @returns Nothing.
   */
  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getTableData();
  }

  /**
   * Handles the searched event from the template.
   *
   * @param event - Event payload emitted by the template control.
   * @returns Nothing.
   */
  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getTableData();
  }

  /**
   * Executes the page change workflow for Report Management Cost Analysis Preview Component.
   *
   * @param pageNo - Page No value used by this method.
   * @returns Nothing.
   */
  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getTableData();
    }
  }

  /**
   * Executes the page size change workflow for Report Management Cost Analysis Preview Component.
   *
   * @param pageSize - Page Size value used by this method.
   * @returns Nothing.
   */
  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getTableData();
  }

  /**
   * Executes the refresh data workflow for Report Management Cost Analysis Preview Component.
   *
   * @param pageNo - Page No value used by this method.
   * @returns Nothing.
   */
  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getTableData();
  }

  /**
   * Loads or returns table data for the current workflow.
   *
   * @returns Nothing.
   */
  getTableData() {
    this.svc
      .getData(this.currentCriteria, this.reportId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (data) => {
          this.tableData = data.results;
          this.count = data.count;
          this.spinner.stop('main');
        },
        () => {
          this.notification.error(
            new Notification('Error while fetching report!! Please try again.')
          );
          this.spinner.stop('main');
        }
      );
  }

  /**
   * Loads or returns columns for the current workflow.
   *
   * @returns Nothing.
   */
  getColumns() {
    this.svc
      .getColumnsById(this.reportId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.tableColumns = this.svc.convertFields(res.columns);
          this.columnsSelected = this.tableColumns.slice(0, 8);
          this.buildColumnForm();
        },
        () => {
          this.notification.error(
            new Notification('Error while fetching selected columns')
          );
        }
      );
  }

  /**
   * Builds column form used by the current workflow.
   *
   * @returns Nothing.
   */
  buildColumnForm() {
    this.columnForm = this.svc.buildColumnSelectionForm(this.columnsSelected);
  }

  /**
   * Executes the column change workflow for Report Management Cost Analysis Preview Component.
   *
   * @returns Nothing.
   */
  columnChange() {
    this.spinner.start('main');
    this.columnsSelected = _clone(this.columnForm.getRawValue().columns);
    this.spinner.stop('main');
  }
}
