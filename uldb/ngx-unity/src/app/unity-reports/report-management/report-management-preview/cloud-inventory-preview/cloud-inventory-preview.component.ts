import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import {
  IMultiSelectSettings,
  IMultiSelectTexts,
} from 'src/app/shared/multiselect-dropdown/types';
import {
  PAGE_SIZES,
  SearchCriteria,
} from 'src/app/shared/table-functionality/search-criteria';
import { ReportManagementCloudInventoryPreviewService } from './cloud-inventory-preview.service';

/**
 * Coordinates the Report Management Cloud Inventory Preview screen state, template bindings, and user actions.
 */
@Component({
  selector: 'report-management-cloud-inventory-preview',
  templateUrl: './cloud-inventory-preview.component.html',
  styleUrls: ['./cloud-inventory-preview.component.scss'],
  providers: [ReportManagementCloudInventoryPreviewService],
})
export class ReportManagementCloudInventoryPreviewComponent implements OnInit {
  /**
   * Stores the active report identifier from the current route or row action.
   */
  @Input('reportId') reportId: string = null;
  private ngUnsubscribe = new Subject();

  // dropdown selection variable
  // selectedDropdownData: ManageReportDCReportFilterData = new ManageReportDCReportFilterData();

  // reportViewdata: ManageReportDCInventoryReportViewData = new ManageReportDCInventoryReportViewData();
  // reportViewdata: any = new ManageReportDCInventoryReportViewData();
  // FaIconMapping = FaIconMapping;
  /**
   * Stores the report loaded for edit or preview workflows.
   */
  selectedReport: any;
  /**
   * Stores the active table search, sort, and paging criteria.
   */
  currentCriteria: SearchCriteria;
  /**
   * Stores the table-ready rows rendered by the template.
   */
  viewData: any;
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
    selectionLimit: 30,
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
    private svc: ReportManagementCloudInventoryPreviewService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private utilSvc: AppUtilityService
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
   * Initializes Report Management Cloud Inventory Preview Component data and subscriptions.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.spinnerService.start('main');
    // Columns and rows are separate calls so column selection can change without rebuilding row criteria.
    this.getColumns();
    this.getReportPreviewById();
  }

  /**
   * Handles the searched event from the template.
   *
   * @param event - Event payload emitted by the template control.
   * @returns Nothing.
   */
  onSearched(event: string) {
    this.spinnerService.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getReportPreviewById();
  }

  /**
   * Executes the page change workflow for Report Management Cloud Inventory Preview Component.
   *
   * @param pageNo - Page No value used by this method.
   * @returns Nothing.
   */
  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getReportPreviewById();
  }

  /**
   * Executes the refresh data workflow for Report Management Cloud Inventory Preview Component.
   *
   * @param pageNo - Page No value used by this method.
   * @returns Nothing.
   */
  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getReportPreviewById();
  }

  /**
   * Executes the page size change workflow for Report Management Cloud Inventory Preview Component.
   *
   * @param pageSize - Page Size value used by this method.
   * @returns Nothing.
   */
  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getReportPreviewById();
  }

  /**
   * Handles the sorted event from the template.
   *
   * @param $event - Event payload emitted by the template control.
   * @returns Nothing.
   */
  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getReportPreviewById();
  }

  /**
   * Releases Report Management Cloud Inventory Preview Component subscriptions and pending UI work.
   *
   * @returns Nothing.
   */
  ngOnDestroy(): void {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Loads or returns report preview by id for the current workflow.
   *
   * @returns The requested API observable or computed data.
   */
  getReportPreviewById() {
    this.svc
      .getReportById(this.reportId, this.currentCriteria)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.count = res.count;
          this.selectedReport = res;
          // this.viewData = this.svc.convertToViewData(res.results);
          // this.viewData = res.results;
          this.viewData = res.results.map((item) => {
            if (item.end_time) {
              item.end_time = this.utilSvc.toUnityOneDateFormat(item.end_time);
            }
            if (item.start_time) {
              item.start_time = this.utilSvc.toUnityOneDateFormat(
                item.start_time
              );
            }
            if (item.created_at) {
              item.created_at = this.utilSvc.toUnityOneDateFormat(
                item.created_at
              );
            }
            return item;
          });
          this.spinnerService.stop('main');
        },
        () => {
          this.notification.error(
            new Notification('Error while fetching report!! Please try again.')
          );
          this.spinnerService.stop('main');
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
   * Executes the column change workflow for Report Management Cloud Inventory Preview Component.
   *
   * @returns Nothing.
   */
  columnChange() {
    this.spinnerService.start('main');
    this.columnsSelected = _clone(this.columnForm.getRawValue().columns);
    this.spinnerService.stop('main');
  }
}
