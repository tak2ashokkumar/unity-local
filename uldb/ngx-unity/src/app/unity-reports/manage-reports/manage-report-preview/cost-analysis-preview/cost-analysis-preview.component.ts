import { Component, Input, OnInit } from '@angular/core';
import { CostAnalysisPreviewColumns, CostAnalysisPreviewService, PreviewModel } from './cost-analysis-preview.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { FormGroup } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'cost-analysis-preview',
  templateUrl: './cost-analysis-preview.component.html',
  styleUrls: ['./cost-analysis-preview.component.scss']
})
export class CostAnalysisPreviewComponent implements OnInit {

  currentCriteria: SearchCriteria;
  @Input('reportId') reportId: string = null;
  private ngUnsubscribe = new Subject();
  tableData: PreviewModel[] = [];
  count: number;
  
  tableColumns: any[] = [];
  columnForm: FormGroup;
  columnsSelected: any[] = [];
  
  columnSelectionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "key",
    selectAsObject: true,
    selectionLimit: 15,
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

  constructor(private svc: CostAnalysisPreviewService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
  ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE};
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getColumns();
    this.getTableData();
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getTableData();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getTableData();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getTableData();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getTableData();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getTableData();
  }

  getTableData() {
    this.svc.getData(this.currentCriteria,this.reportId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.tableData = data.results;
      this.count = data.count;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Error while fetching report!! Please try again.'));
      this.spinner.stop('main');
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
    this.spinner.start('main');
    this.columnsSelected = _clone(this.columnForm.getRawValue().columns);
    this.spinner.stop('main');
  }

}
