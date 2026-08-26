import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CostPlannerViewData, DcCostAnalysisCostPlannerService } from './dc-cost-analysis-cost-planner.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { DatacenterViewData } from './dc-cost-analysis-cost-planner-crud/dc-cost-analysis-cost-planner-crud.service';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'dc-cost-analysis-cost-planner',
  templateUrl: './dc-cost-analysis-cost-planner.component.html',
  styleUrls: ['./dc-cost-analysis-cost-planner.component.scss'],
  providers: [DcCostAnalysisCostPlannerService]
})
export class DcCostAnalysisCostPlannerComponent implements OnInit, OnDestroy {


  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  datacenters: DatacenterFast[] = [];

  viewData: CostPlannerViewData[] = [];
  selectedView: CostPlannerViewData;

  datacenterListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "id",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  plannerDeleteModalRef: BsModalRef;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private plannerSvc: DcCostAnalysisCostPlannerService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getDataCenters();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getCostPlanners();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getCostPlanners();
  }

  getDataCenters() {
    this.plannerSvc.getDataCenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.datacenters = data;
      this.getCostPlanners();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
      this.spinner.stop('main');
    })
  }

  getCostPlanners() {
    this.plannerSvc.getCostPlanners(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.plannerSvc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Cost Planners'));
    });
  }

  onDcChange(index: number) {
    let existing = _clone(this.viewData[index].datacenters);
    let selected = _clone(this.viewData[index].dcForm.getRawValue());
    if (selected && !selected.datacenter.length) {
      this.notification.error(new Notification('Datacenter cannot be empty.'));
      this.viewData[index].dcForm = this.plannerSvc.buildForm(existing);
      return;
    }
    if (existing == selected.datacenter) {
      return;
    }
    this.plannerSvc.updateDatacenterForPlanner(this.viewData[index].uuid, selected).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notification.success(new Notification('Planner updated successfully.'));
    }, (err: HttpErrorResponse) => {
      if (err.error.non_field_errors){
        let nonFieldErr = err.error.non_field_errors[0];
        this.notification.error(new Notification(nonFieldErr));
        this.viewData[index].dcForm = this.plannerSvc.buildForm(existing);
        return;
      }
      this.notification.error(new Notification('Failed to update planner.Try again later.'));
    })
  }

  addCostPlanner() {
    this.router.navigate(['datacenter/cost-planner'], { relativeTo: this.route.parent });
  }

  editCostPlanner(view: CostPlannerViewData) {
    this.router.navigate(['datacenter/cost-planner/', view.uuid], { relativeTo: this.route.parent });
  }

  deleteCostPlanner(view: CostPlannerViewData) {
    this.selectedView = view;
    this.plannerDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmPlannerDelete() {
    this.plannerDeleteModalRef.hide();
    this.spinner.start('main');
    this.plannerSvc.deleteCostPlanner(this.selectedView.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Cost Planner deleted successfully.'));
      this.getCostPlanners();
    }, err => {
      this.notification.error(new Notification(' Cost Planner has more than one reference so it can not be deleted!! Please try again.'));
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
