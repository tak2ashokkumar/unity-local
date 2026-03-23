import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AutoRemediationService, AutoRemediationViewData, nodesColumnMapping, SummaryViewData, ZabbixGraphTimeRange } from './auto-remediation.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { FormGroup } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';
import { AppUtilityService, DateRange } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'auto-remediation',
  templateUrl: './auto-remediation.component.html',
  styleUrls: ['./auto-remediation.component.scss'],
  providers: [AutoRemediationService]
})
export class AutoRemediationComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number = 0;
  viewData: AutoRemediationViewData[] = [];
  viewDataSummary: SummaryViewData = new SummaryViewData();
  popOverList: string[] = [];
  popOverListTrigger: string[] = [];
  autoRemUuid: string;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  autoRemDeleteModalRef: BsModalRef;

  columnSelectionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    selectAsObject: true,
    selectionLimit: 8,
    buttonClasses: 'btn btn-default btn-block p-1',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody:true
  };
  columnSelectionTexts: IMultiSelectTexts = {
    checkAll: 'Select all columns',
    uncheckAll: 'Deselect all columns',
    checked: 'column',
    checkedPlural: 'columns',
    defaultTitle: 'Select columns',
    allSelected: 'All columns selected',
  };
  tableColumns: TableColumnMapping[] = nodesColumnMapping;
  columnForm: FormGroup;
  columnsSelected: TableColumnMapping[] = [];

  dateRange: DateRange;
  filterForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  graphRange = ZabbixGraphTimeRange;

  constructor(private svc: AutoRemediationService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
  ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.columnsSelected = this.tableColumns.filter(col => col.default);
    this.buildForm();
    this.getAutoRemediationList();
    this.getAutoRemediationSummary();
    this.buildColumnForm();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getAutoRemediationList();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getAutoRemediationList();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAutoRemediationList();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getAutoRemediationList();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getAutoRemediationList();
  }

  getAutoRemediationList() {
    this.svc.getAutoRemediation(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.svc.convertToViewData(data.results);
      this.count = data.count;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Auto Remediation list'));
    });
  }

  getAutoRemediationSummary() {
    this.svc.getAutoRemSummary(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewDataSummary = this.svc.convertToViewDataSummary(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Auto Remediation summary'));
    });
  }

  buildForm() {
    this.dateRange = this.svc.getDateRangeByPeriod(this.graphRange.LAST_24_HOURS);
    this.filterForm = this.svc.buildForm(this.dateRange);
    this.formErrors = this.svc.resetFormErrors();
    this.validationMessages = this.svc.validationMessages;

    this.filterForm.get('period').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: ZabbixGraphTimeRange) => {
      if (val == this.graphRange.CUSTOM) {
        this.filterForm.get('from').enable({ emitEvent: false });
        this.filterForm.get('to').enable({ emitEvent: false });
      } else {
        this.dateRange = this.svc.getDateRangeByPeriod(val);
        if (this.dateRange) {
          this.filterForm.get('from').patchValue(new Date(this.dateRange.from))
          this.filterForm.get('to').patchValue(new Date(this.dateRange.to))
        }
        this.filterForm.get('from').disable({ emitEvent: false });
        this.filterForm.get('to').disable({ emitEvent: false });
      }
    });
  }

  filterDate() {
    if (this.filterForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.filterForm, this.validationMessages, this.formErrors);
      this.filterForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.filterForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.getAutoRemediationSummary();
    }
  }

  toggleStatus(index: number, status: boolean) {
    // this.spinner.start('main');
    // if (status === true) {
    //   this.viewData[index]['workflowStatus'] = 'Enabled';
    // } else {
    //   this.viewData[index]['workflowStatus'] = 'Disabled';
    // }
    this.svc.toggleStatus(this.viewData[index].uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getAutoRemediationList();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      // if (status === true) {
      //   this.viewData[index]['workflowStatus'] = 'Disabled';
      // } else {
      //   this.viewData[index]['workflowStatus'] = 'Enabled';
      // }
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to change workflow status'));
    });
  }

  buildColumnForm() {
    this.columnForm = this.svc.buildColumnSelectionForm(this.columnsSelected);
  }

  columnChange() {
    this.spinner.start('main');
    this.columnsSelected = _clone(this.columnForm.getRawValue().columns);
    this.spinner.stop('main');
  }

  showUsers(view: AutoRemediationViewData) {
    this.popOverList = view.extraUsersList;
  }

  showTriggers(view: AutoRemediationViewData) {
    this.popOverListTrigger = view.extraTriggersList;
  }

  addAutoRemediation() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  editAutoRemediation(task: AutoRemediationViewData) {
    this.router.navigate([task.uuid, 'edit'], { relativeTo: this.route });
  }

  viewHistory(task: AutoRemediationViewData) {
    this.router.navigate([task.uuid, 'history'], { relativeTo: this.route });
  }

  deleteAutoRemediation(ARuuid: string) {
    this.autoRemUuid = ARuuid;
    this.autoRemDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.autoRemDeleteModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteAutoRem(this.autoRemUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getAutoRemediationList();
      this.spinner.stop('main');
      this.notification.success(new Notification('Auto remediation deleted successfully.'));
    }, err => {
      this.notification.error(new Notification('Auto remediation can not be deleted!! Please try again.'));
    });
  }
}
