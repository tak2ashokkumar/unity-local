import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { DCInventoryPreviewColumns, DcInventoryPreviewService } from './dc-inventory-preview.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { FormGroup } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'dc-inventory-preview',
  templateUrl: './dc-inventory-preview.component.html',
  styleUrls: ['./dc-inventory-preview.component.scss'],
  providers:[DcInventoryPreviewService]
})
export class DcInventoryPreviewComponent implements OnInit {

  @Input('reportId') reportId: string = null;
  private ngUnsubscribe = new Subject();
  selectedReport: any;
  currentCriteria: SearchCriteria;
  viewData: any;
  count: number;

  tableColumns: any[] = [];
  columnForm: FormGroup;
  columnsSelected: any[] = [];
  
  columnSelectionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "key",
    selectAsObject: true,
    selectionLimit: 30,
    buttonClasses: 'btn btn-default btn-block p-1',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: true,
    showUncheckAll: true
  };

  columnSelectionTexts: IMultiSelectTexts = {
    checkAll: 'Select all columns',
    uncheckAll: 'Deselect all columns',
    checked: 'column',
    checkedPlural: 'columns',
    defaultTitle: 'Select columns',
    allSelected: 'All columns selected',
  };

  constructor(private svc: DcInventoryPreviewService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
  ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };

  }

  ngOnInit(): void {
    this.spinnerService.start('main');
    this.getColumns();
    this.getReportPreviewById();
  }

  onSearched(event: string) {
    this.spinnerService.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getReportPreviewById();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getReportPreviewById();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getReportPreviewById();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getReportPreviewById();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getReportPreviewById();
  }


  ngOnDestroy(): void {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  getReportPreviewById() {
    this.svc.getReportById(this.reportId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.selectedReport = res;
      // this.viewData = this.svc.convertToViewData(res.results);
      this.viewData = res.results;
      this.spinnerService.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching report!! Please try again.'));
      this.spinnerService.stop('main');
    })
  }

  getColumns() {
    this.svc.getColumnsById(this.reportId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tableColumns = this.svc.convertFields(res.columns);
      this.columnsSelected = this.tableColumns.slice(0,8)
      this.buildColumnForm();
    }, err => {
      this.notification.error(new Notification('Error while fetching selected columns'));
    })
  }

  buildColumnForm() {
    this.columnForm = this.svc.buildColumnSelectionForm(this.columnsSelected);
  }

  columnChange() {
    this.spinnerService.start('main');
    this.columnsSelected = _clone(this.columnForm.getRawValue().columns);
    this.spinnerService.stop('main');
  }
}
