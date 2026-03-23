import { Component, OnDestroy, OnInit } from '@angular/core';
import { CostByCloudTypeItemViewData, CostByServicesItemViewData, CostSummaryService, CostSummaryViewData, months, TrailingTwelveMonthsViewData } from './cost-summary.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'cost-summary',
  templateUrl: './cost-summary.component.html',
  styleUrls: ['./cost-summary.component.scss'],
  providers: [CostSummaryService]
})
export class CostSummaryComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  currentServiceCriteria: SearchCriteria;
  cloudData: string[]
  regionData: string[]
  monthData = months;
  showFilter: boolean = false;

  // costByServicesClouds: string[] = []; // ['AWS','Azure','GCP','Oracle'];
  costByServicesFilter: string = 'All';
  TMTFilter: string = 'All';

  viewSummaryData: CostSummaryViewData;
  costByCloudTypeViewData: CostByCloudTypeItemViewData[] = [];
  trailingTwelveMonthsViewData: TrailingTwelveMonthsViewData;
  costByServiceViewData: CostByServicesItemViewData[] = [];
  popOverList: string[];
  ttmError: boolean = false;
  count: number;
  costBycloudChartViewData: UnityChartDetails;
  costBySubscriptionChartViewData: UnityChartDetails;
  trailingTwelveMonthsBarChartData: UnityChartDetails;
  trailingTwelveMonthsPieChartData: UnityChartDetails;

  cloudSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,

  };

  userSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Region',
  };

  userSelectionCloudTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Cloud',
  };

  constructor(private svc: CostSummaryService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private router: Router,
    private storageService: StorageService,
    private route: ActivatedRoute) {
    this.currentCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ cloud: '', month: '' }], multiValueParam: { region: [], cloud_type: [] } };
    this.currentServiceCriteria = { multiValueParam: { cloud_type: [] } };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getCloudFilter();
    setTimeout(() => {
      this.getCostSummary();
      this.getCostBycloudChartData();
      this.getCostBySubscriptionChartData();
      this.getCostByService();
      this.getTrailingTwelveMonthData();
      this.getCostByCloudTypeSummaryData();
    }, 100);
  }

  onSearched(event: string) {
    this.currentCriteria.pageNo = 1;
    this.currentCriteria.searchValue = event;
    this.getCostByCloudTypeSummaryData();
  }

  onFilterChange() {
    this.getCostSummary();
    this.getCostBycloudChartData();
    this.getCostBySubscriptionChartData();
    this.getCostByCloudTypeSummaryData();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete()
  }

  refreshData() {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ cloud: '', month: '' }], multiValueParam: { region: [] } };
    this.getCostSummary();
    this.getCostBycloudChartData();
    this.getCostBySubscriptionChartData();
    this.getCostByService();
    this.getTrailingTwelveMonthData();
    this.getCostByCloudTypeSummaryData();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    // this.currentCriteria.pageNo = 1;
    this.getCostByCloudTypeSummaryData();
  }

  pageChange(pageNo: number) {
    // this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getCostByCloudTypeSummaryData();
  }

  pageSizeChange(pageSize: number) {
    // this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getCostByCloudTypeSummaryData();
  }

  getCostSummary() {
    this.spinner.start('SummaryDataLoader');
    this.spinner.start('SummaryDataTableLoader');
    this.svc.getCostSummary(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewSummaryData = this.svc.convertToCostSummaryViewData(data);
      this.spinner.stop('SummaryDataLoader');
      this.spinner.stop('SummaryDataTableLoader');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('SummaryDataLoader');
      this.spinner.stop('SummaryDataTableLoader');
      this.notification.error(new Notification('Failed to get cost summary data'));
    });
  };

  getCostBycloudChartData() {
    this.spinner.start('CostByCloudTypeChartLoader');
    this.svc.getCostBycloudTypeChartData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.costBycloudChartViewData = this.svc.convertToCostBycloudChartData(res);
      this.spinner.stop('CostByCloudTypeChartLoader');
    }, err => {
      this.spinner.stop('CostByCloudTypeChartLoader');
      this.notification.error(new Notification('Failed to get cost by cloud type data'));
    });
  }

  getCostBySubscriptionChartData() {
    this.spinner.start('CostBySubscriptionChartLoader');
    this.svc.getCostBySubscriptionChartData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.costBySubscriptionChartViewData = this.svc.convertToCostBySubscriptionChartData(res);
      this.spinner.stop('CostBySubscriptionChartLoader');
    }, err => {
      this.spinner.stop('CostBySubscriptionChartLoader');
      this.notification.error(new Notification('Failed to get cost by cloud subscription data'));
    });
  }

  getCostByService() {
    this.spinner.start('CostByServicesTableLoader');
    this.svc.getCostByService(this.costByServicesFilter).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.costByServiceViewData = this.svc.convertToCostByServicesViewData(data);
      this.spinner.stop('CostByServicesTableLoader');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('CostByServicesTableLoader');
      this.notification.error(new Notification('Failed to get cost by cloud services data'));
    });
  };

  getTrailingTwelveMonthData() {
    this.spinner.start('TrailingTwelveMonths');
    this.svc.getTrailingTwelveMonthData(this.TMTFilter).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.trailingTwelveMonthsViewData = this.svc.convertToTrailingTwelveMonthsViewData(data?.top_usage_data);
      this.trailingTwelveMonthsBarChartData = this.svc.convertToTrailingTwelveMonthsChartData(data?.trailing_month_data, data?.months_order);
      this.trailingTwelveMonthsPieChartData = this.svc.convertToCostBycloudChartData(data?.cost_cloud_type_data);
      this.ttmError = false;
      this.spinner.stop('TrailingTwelveMonths');
    }, (err: HttpErrorResponse) => {
      this.ttmError = true;
      this.spinner.stop('TrailingTwelveMonths');
      this.notification.error(new Notification('Failed to get trailing twelve months data'));
    });
  };

  getCostByCloudTypeSummaryData() {
    this.spinner.start('CostByCloudLoader');
    this.svc.getCostByCloudTypeSummaryData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      // console.log(data.results);
      this.count = data.count;
      this.costByCloudTypeViewData = this.svc.convertToCostByCloudTypeViewData(data.results);
      this.spinner.stop('CostByCloudLoader');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('CostByCloudLoader');
      this.notification.error(new Notification('Failed to get cost by cloud-type summary data'));
    });
  };

  getCloudFilter() {
    this.svc.getCloudFilter().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.cloudData = data.cloud_accounts;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching  clouds list'));
    });
  };

  getRegionFilter(selectedCloud: string) {
    this.spinner.start('main');
    this.svc.getRegionFilter(selectedCloud).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.regionData = data;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching regions list'));
    });
  };

  onCloudChange(selectedCloud: string) {
    this.getRegionFilter(selectedCloud);
    this.currentCriteria.multiValueParam.region = [];
    this.currentCriteria.params[0].month = '';
    this.onFilterChange();
  }

  onTMTFilterChange() {
    this.getTrailingTwelveMonthData();
  }

  onServiceFilterChange() {
    this.getCostByService();
  }

  filterData() {
    this.showFilter = !this.showFilter;
  }

  showPlanCost(view: CostByCloudTypeItemViewData) {
    this.popOverList = view.extraRegions;
  }

  openRow(view: CostByServicesItemViewData) {
    view.isOpen = !view.isOpen;
  }

  navigateToResourceLevelPage() {
    this.router.navigate(['resource-level'], { relativeTo: this.route });

  }



  redirectWithFilters(data: any) {
    console.log(data);
    this.storageService.put('filter', {
      account: data.accountName,
      cloud: data.cloud,
    }, StorageType.SESSIONSTORAGE);
    this.navigateToResourceLevelPage()
  }
}
