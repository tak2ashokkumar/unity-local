import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UscpCostModelService } from '../uscp-cost-model/uscp-cost-model.service';
import { ResourceCostItemViewData, UscpResourceModelService } from './uscp-resource-model.service';
import { CostModelInstance } from '../uscp-cost-model/uscp-cost-model.type';

@Component({
  selector: 'uscp-resource-model',
  templateUrl: './uscp-resource-model.component.html',
  styleUrls: ['./uscp-resource-model.component.scss'],
  providers: [UscpResourceModelService, UscpCostModelService]
})
export class UscpResourceModelComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  count: number = 0;
  currentCriteria: SearchCriteria;
  viewData: ResourceCostItemViewData[] = [];
  selectedView: ResourceCostItemViewData;
  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;
  // tableColumns = TableColumnSelections;
  selectedReportIds: string[] = [];
  selectedAll: boolean = false;
  isSelected: boolean = false;
  privateCloudsList: string[] = [];
  @ViewChild('multiconfirm') multiconfirm: ElementRef;
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

  costModelOptions: CostModelInstance[];
  regionData: string[];
  popOverList: any[];
  popOverRegionList: any[];
  popOverDcList: any[];

  constructor(private spinner: AppSpinnerService, private router: Router,
    private uscpCostModelService: UscpCostModelService,
    private route: ActivatedRoute,
    private notification: AppNotificationService,
    private svc: UscpResourceModelService,
    private modalService: BsModalService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ cloud_type: '', cost_plan: '', is_active: '', region: '' }] };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getResourcePlans();
    this.getCostModel();
    this.getPrivateClouds();
    this.getRegions();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ cloud_type: '', cost_plan: '', is_active: '', region: '' }] };
    this.getResourcePlans();
    this.getCostModel();
    this.getPrivateClouds();
    this.getRegions();
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getResourcePlans();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getResourcePlans();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getResourcePlans();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getResourcePlans();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getResourcePlans();
  }

  getResourcePlans() {
    this.svc.getResourcePlans(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Resource models'));
    });
  }

  getCostModel() {
    this.svc.getCostModel().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.costModelOptions = data;
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Cost Models'));
    });
  }

  getPrivateClouds() {
    this.svc.getPrivateClouds().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.privateCloudsList = this.svc.convertCloudsDropdownData(res);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification("Failed to get private clouds"));
    });
  }

  getRegions() {
    this.uscpCostModelService.getRegions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.regionData = this.uscpCostModelService.convertRegionData(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get regions data'));
    });
  }

  addInstance() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }
  
  showPlanCost(view: ResourceCostItemViewData) {
    this.popOverList = view.extraResourcePlanCost;
  }

  showRegions(view: ResourceCostItemViewData) {
    this.popOverRegionList = view.extraRegions;
  }

  showDcs(view: ResourceCostItemViewData) {
    this.popOverDcList = view.extraDatacenters;
  }

  toggleSettings(view: ResourceCostItemViewData, status: boolean) {
    if (view.isActive == status) {
      return;
    }
    this.selectedView = view;
    this.status = status;
    this.modalRef = this.modalService.show(this.confirmstatus, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  updateStatus() {
    this.modalRef.hide();
    let uuid = this.selectedView.uuid;
    let status = this.status ? 'true' : 'false';
    this.svc.toggleStatus(uuid, status).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getResourcePlans();
      this.notification.success(new Notification(`Status settings updated successfully`));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(`Failed to update status settings`));
    });
  }

  goToAssignedClouds(view: ResourceCostItemViewData) {
    this.router.navigate(['setup/cost-plan/resource-mapping', view.uuid]);
  }

  goToHistory(view: ResourceCostItemViewData) {
    this.router.navigate(['setup/cost-plan/resource-model/', view.uuid, 'history']);
  }

  // assignCloud(view: ResourceCostItemViewData){
  //   this.router.navigate(['setup/cost-plan/resource-mapping',view.uuid,'create']);
  // }

  edit(view: ResourceCostItemViewData) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
  }

  delete(view: ResourceCostItemViewData) {
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.modalRef.hide();
    this.spinner.start('main');
    this.svc.delete(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.notification.success(new Notification('Resource model deleted successfully'));
      // this.getResourcePlans();
      this.viewData = this.viewData.filter((data: ResourceCostItemViewData) => { return data.uuid !== this.selectedView.uuid });
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      if (err?.status != 500) {
        let msg = err.error?.msg ? err.error.msg : err.error;
        this.notification.error(new Notification(msg));
      }
      else {
        this.notification.error(new Notification('Failed to delete resource model'));
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

  select(view: ResourceCostItemViewData) {
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

  confirmMultipleDelete() {
    this.spinner.start('main');
    this.modalRef.hide();
    this.svc.multipleReportDelete(this.selectedReportIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getResourcePlans();
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedReportIds = [];
      this.selectedAll = false;
      this.notification.success(new Notification('Resource models deleted successfully'));
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
        this.notification.error(new Notification('Failed to delete resource models'));
      }
      this.spinner.stop('main');
    });
  }
}
