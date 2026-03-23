import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CostModelInstanceViewData, TableColumnSelections, UscpCostModelService } from './uscp-cost-model.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';

@Component({
  selector: 'uscp-cost-model',
  templateUrl: './uscp-cost-model.component.html',
  styleUrls: ['./uscp-cost-model.component.scss'],
  providers: [UscpCostModelService]
})
export class UscpCostModelComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  count: number = 0;
  currentCriteria: SearchCriteria;
  viewData: CostModelInstanceViewData[] = [];
  selectedView: CostModelInstanceViewData;
  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;
  tableColumns = TableColumnSelections;
  selectedReportIds: string[] = [];
  selectedAll: boolean = false;
  isSelected: boolean = false;
  @ViewChild('multiconfirm') multiconfirm: ElementRef;
  regionData: string[];
  @ViewChild('confirmstatus') confirmstatus: ElementRef;
  status: boolean;

  columnSelectionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    selectAsObject: true,
    selectionLimit: 30,
    buttonClasses: 'btn btn-default btn-block p-1',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  columnSelectionTexts: IMultiSelectTexts = {
    checkAll: 'Select all columns',
    uncheckAll: 'Deselect all columns',
    checked: 'column',
    checkedPlural: 'columns',
    defaultTitle: 'Select columns',
    allSelected: 'All columns selected',
  };
  popOverList: any;
  popOverDCList: any;

  constructor(private spinner: AppSpinnerService, private router: Router,
    private route: ActivatedRoute,
    private notification: AppNotificationService,
    private svc: UscpCostModelService,
    private modalService: BsModalService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ is_active: '', plan_type: '', price_allocation: '', region: '' }] };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getRegions();
    this.getInstances();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ is_active: '', plan_type: '', price_allocation: '', region: '' }] };
    this.getInstances();
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getInstances();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  getInstances() {
    this.svc.getInstances(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      console.log(this.viewData)
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get cost models'));
    });
  }

  getRegions() {
    this.svc.getRegions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.regionData = this.svc.convertRegionData(data);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get regions data'));
    });
  }

  addCostModel() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  toggleStatus(view: CostModelInstanceViewData, status: boolean) {
    if (view.isActive == status) {
      return;
    }
    this.selectedView = view;
    this.status = status;
    this.modalRef = this.modalService.show(this.confirmstatus, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  showRegionList(view: any) {
    this.popOverList = view.extraRegions;
  }
  showDcList(view: any) {
    this.popOverDCList = view.extraDatacenters;
  }


  updateStatus() {
    this.modalRef.hide();
    let uuid = this.selectedView.uuid;
    let status = this.status ? 'true' : 'false';
    this.svc.saveSettings(uuid, status).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getInstances();
      this.notification.success(new Notification(`Status settings updated successfully`));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(`Failed to update status settings`));
    });
  }

  edit(view: CostModelInstanceViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
  }

  delete(view: CostModelInstanceViewData) {
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.modalRef.hide();
    this.spinner.start('main');
    this.svc.delete(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Cost model deleted successfully'));
      this.getInstances();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      if (err?.status != 500) {
        let msg = err.error?.msg ? err.error.msg : err.error;
        this.notification.error(new Notification(msg));
      } else {
        this.notification.error(new Notification('Failed to delete cost model'));
      }
    })
  }

  selectAll() {
    if (!this.viewData.length) {
      this.selectedAll = false;
      return;
    }
    this.selectedAll = !this.selectedAll;
    if (this.selectedAll) {
      this.viewData.forEach(view => {
        view.isSelected = true;
        this.selectedReportIds.push(view.uuid);
      });
    } else {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedReportIds = [];
    }
  }

  select(view: CostModelInstanceViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedReportIds.splice(this.selectedReportIds.indexOf(view.uuid), 1);
    } else {
      this.selectedReportIds.push(view.uuid);
    }
    this.selectedAll = this.selectedReportIds.length == this.viewData.length;
  }

  multipleDelete() {
    this.modalRef = this.modalService.show(this.multiconfirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  goToHistory(view: CostModelInstanceViewData) {
    this.router.navigate(['setup/cost-plan/cost-model', view.uuid, 'history']);

  }

  confirmMultipleDelete() {
    this.spinner.start('main');
    this.modalRef.hide();
    this.svc.multipleReportDelete(this.selectedReportIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getInstances();
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedReportIds = [];
      this.selectedAll = false;
      this.notification.success(new Notification('Cost models Deleted successfully'));
      this.spinner.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedReportIds = [];
      this.selectedAll = false;
      if (err?.status != 500) {
        let msg = err.error?.msg ? err.error.msg : err.error;
        this.notification.error(new Notification(msg));
      }
      else {
        this.notification.error(new Notification('Failed to delete cost models'));
      }
      this.spinner.stop('main');
    });
  }
}
