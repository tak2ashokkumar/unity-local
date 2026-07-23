import { Component, OnDestroy, OnInit } from '@angular/core';
import { DiscoveryDashboardService } from './discovery-dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { forkJoin, Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { goBackFromDefaultDashboard } from '../app-default-dashboards.service';
import { CiDistributionByDeviceSortColumn, CiDistributionByDeviceTableRowViewData, CiDistributionByDiscoverySortColumn, CiDistributionByDiscoveryTableRowViewData, CiDistributionSortColumn, CiDistributionTableRowViewData, CmdbSyncInsightsViewData, CmdbSyncTrendSortColumn, CmdbSyncTrendTableRowViewData, DiscoveryDashboardFilterCriteria, DiscoveryDashboardFilterFormValue, DiscoveryDashboardFilterOption, DiscoverySuccessFailureSortColumn, DiscoverySuccessFailureTableRowViewData, DiscoveryTrendAnalyticsSortColumn, DiscoveryTrendAnalyticsTableRowViewData, ExecutiveKpiViewData, NewlyDiscoveredDeviceItemViewData, NewlyDiscoveredDevicesSortColumn, OperatingSystemsItemViewData, OperatingSystemsSortColumn, OrphanedDeviceByTypeItemViewData, OrphanedDeviceByTypeSortColumn, OrphanedDevicesBreakdownItem, TopDiscoveryFailuresItemViewData, TopDiscoveryFailuresSortColumn } from './discovery-dashboard.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { HttpErrorResponse } from '@angular/common/http';
import { EChartsOption } from 'echarts';
import { ColumnSortedEvent } from 'src/app/shared/table-functionality/sortable-column/sort.service';
import { Location } from '@angular/common';

@Component({
  selector: 'discovery-dashboard',
  templateUrl: './discovery-dashboard.component.html',
  styleUrls: ['./discovery-dashboard.component.scss'],
  providers: [DiscoveryDashboardService]
})
export class DiscoveryDashboardComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject<void>();
  private filterFormUnsubscribe = new Subject<void>();
  filterForm: FormGroup;
  filterLoadFailed = false;
  timeRangeOptions: DiscoveryDashboardFilterOption[] = [];
  regionOptions: DiscoveryDashboardFilterOption[] = [];
  executiveKpiViewData: ExecutiveKpiViewData = new ExecutiveKpiViewData();
  cmdbSyncInsights: CmdbSyncInsightsViewData = new CmdbSyncInsightsViewData();
  ciDistributionByDeviceChartData: EChartsOption = null;
  ciDistributionByDeviceViewMode: 'table' | 'chart' = 'chart';
  ciDistributionByDeviceTableRows: CiDistributionByDeviceTableRowViewData[] = [];
  ciDistributionByDeviceSortState: { sortColumn: CiDistributionByDeviceSortColumn | ''; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  ciDistributionChartData: EChartsOption = null;
  ciDistributionViewMode: 'table' | 'chart' = 'chart';
  ciDistributionTableRows: CiDistributionTableRowViewData[] = [];
  ciDistributionSortState: { sortColumn: CiDistributionSortColumn | ''; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  ciDistributionLegendItems: Array<{ label: string; color: string; redirectUrl: string }> = [];
  ciDistributionByDiscoveryChartData: EChartsOption = null;
  ciDistributionByDiscoveryViewMode: 'table' | 'chart' = 'chart';
  ciDistributionByDiscoveryTableRows: CiDistributionByDiscoveryTableRowViewData[] = [];
  ciDistributionByDiscoverySortState: { sortColumn: CiDistributionByDiscoverySortColumn | ''; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  newlyDiscoveredDevices: NewlyDiscoveredDeviceItemViewData[] = [];
  newlyDiscoveredDevicesViewMode: 'table' | 'chart' = 'chart';
  newlyDiscoveredDevicesManufacturerModelChart: EChartsOption = null;
  newlyDiscoveredDevicesManufacturerLegendItems: Array<{ label: string; color: string }> = [];
  newlyDiscoveredDevicesManufacturerLegendPage = 0;
  newlyDiscoveredDevicesManufacturerLegendPageSize = 5;
  newlyDiscoveredDevicesAvailabilityTrendChart: EChartsOption = null;
  newlyDiscoveredDevicesDatacenterChart: EChartsOption = null;
  newlyDiscoveredDevicesStatusByDatacenterChart: EChartsOption = null;
  newlyDiscoveredDevicesSortState: { sortColumn: NewlyDiscoveredDevicesSortColumn | ''; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  orphanedDeviceByTypeRows: OrphanedDeviceByTypeItemViewData[] = [];
  orphanedDeviceByTypeSortState: { sortColumn: OrphanedDeviceByTypeSortColumn | ''; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  orphanedDevicesBreakdownChartData: EChartsOption = null;
  orphanedDevicesBreakdown: OrphanedDevicesBreakdownItem[] = [];
  orphanedDevicesBreakdownColors = ['#3949ab', '#1ab34f', '#ff8b1f', '#28b8cf', '#7c57e8', '#ef6f8f'];
  topDiscoveryFailuresChartData: EChartsOption = null;
  topDiscoveryFailuresViewMode: 'table' | 'chart' = 'chart';
  topDiscoveryFailures: TopDiscoveryFailuresItemViewData[] = [];
  topDiscoveryFailuresSortState: { sortColumn: TopDiscoveryFailuresSortColumn | ''; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  operatingSystemsChartData: EChartsOption = null;
  operatingSystemsViewMode: 'table' | 'chart' = 'chart';
  operatingSystems: OperatingSystemsItemViewData[] = [];
  operatingSystemsLegendItems: Array<{ label: string; color: string }> = [];
  operatingSystemsLegendPage = 0;
  operatingSystemsLegendPageSize = 8;
  operatingSystemsSortState: { sortColumn: OperatingSystemsSortColumn | ''; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  newlyDiscoveredDevicesSearch: string = '';
  cmdbSyncTrend: EChartsOption = null;
  cmdbSyncTrendViewMode: 'table' | 'chart' = 'chart';
  cmdbSyncTrendTableRows: CmdbSyncTrendTableRowViewData[] = [];
  cmdbSyncTrendSortState: { sortColumn: CmdbSyncTrendSortColumn | ''; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  trendAnalyticsChartOptions: EChartsOption = null;
  trendAnalyticsViewMode: 'table' | 'chart' = 'chart';
  trendAnalyticsTableRows: DiscoveryTrendAnalyticsTableRowViewData[] = [];
  trendAnalyticsSortState: { sortColumn: DiscoveryTrendAnalyticsSortColumn | ''; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  successAndFailureViewMode: 'table' | 'chart' = 'chart';
  successAndFailureTableRows: DiscoverySuccessFailureTableRowViewData[] = [];
  successAndFailureSortState: { sortColumn: DiscoverySuccessFailureSortColumn | ''; sortDirection: string } = { sortColumn: '', sortDirection: '' };
  sucessAndFailureChartOptions: EChartsOption = null;

  appliedFilters: DiscoveryDashboardFilterCriteria = {
    region: [],
    timeRange: 'last_30_days'
  };
  loaderNames = {
    filters: 'dashboardFiltersLoader',
    executiveKpis: 'executiveKpisLoader',
    trendAnalytics: 'trendAnalyticsLoader',
    successAndFailure: 'successAndFailureLoader',
    cmdbSyncTrend: 'cmdbSyncTrendLoader',
    cmdbSyncInsights: 'cmdbSyncInsightsLoader',
    ciDistributionByDevice: 'ciDistributionByDeviceLoader',
    ciDistribution: 'ciDistributionLoader',
    ciDistributionByDiscovery: 'ciDistributionByDiscoveryLoader',
    newlyDiscoveredDevices: 'newlyDiscoveredDeviesLoader',
    orphanedDeviceByType: 'orphanedDeviceByTypeLoader',
    orphanedDevicesBreakdown: 'orphanedDevicesBreakdownLoader',
    topDiscoveryFailures: 'topDiscoveryFailures',
    operatingSystems: 'operatingSystemsLoader'

  };
  regionMultiselectSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: true,
    maxHeight: '240px'
  };
  regionMultiselectTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select regions',
    allSelected: 'All Selected'
  };

  constructor(private svc: DiscoveryDashboardService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService, private location: Location,
    private notification: AppNotificationService) { }

  ngOnInit(): void {
    setTimeout(() => this.loadFilterOptionsAndDashboard(), 0);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.filterFormUnsubscribe.next();
    this.filterFormUnsubscribe.complete();
  }

  loadFilterOptionsAndDashboard() {
    this.resetFilterState();
    this.spinner.start(this.loaderNames.filters);
    this.svc.getFilterOptions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.timeRangeOptions = this.normalizeFilterOptions(res?.time_range);
      this.regionOptions = this.convertRegionOptions(res?.regions || []);
      this.appliedFilters.region = this.getDefaultRegionSelectionValues();
      this.appliedFilters.timeRange = this.getDefaultTimeRangeSelection();
      this.buildFilterForm();
      this.applyFilters();
      this.stopFilterLoader();
      this.loadData();
    }, () => {
      this.filterLoadFailed = true;
      this.notification.error(new Notification('Failed to load discovery dashboard filters. Try again later.'));
      this.stopFilterLoader();
    });
  }

  private hasFilterFormData(): boolean {
    return !!this.filterForm;
  }

  loadData() {
    if (!this.hasFilterFormData()) {
      return;
    }
    setTimeout(() => {
      this.getExecutiveKpiData();
      this.getDiscoveryTrendAnalyticsData();
      this.getDiscoverySuccessandFailureData();
      this.getCmdbSyncTrend();
      this.getCmdbInsightsData();
      this.getCiDistributionByDevice();
      this.getCiDistributionByDiscovery();
      this.getNewlyDiscoveredDevices();
      this.getOrphanedDeviceByType();
      this.getOrphanedDevicesBreakdown();
      this.getTopDiscoveryFailures();
      this.getTOperatingSystems();
      this.getCiDistribution();
    }, 0);
  }

  getExecutiveKpiData() {
    this.spinner.start(this.loaderNames.executiveKpis);
    this.svc.getExecutiveKpisData(this.appliedFilters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.executiveKpiViewData = this.svc.convertToExecutiveKpiViewData(res);
        this.spinner.stop(this.loaderNames.executiveKpis);
      }
    }, (_err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
    });
  }

  getDiscoveryTrendAnalyticsData() {
    this.trendAnalyticsChartOptions = null;
    this.trendAnalyticsTableRows = [];
    this.spinner.start(this.loaderNames.trendAnalytics);
    this.svc.getDiscoveryTrendAnalyticsData(this.appliedFilters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.trendAnalyticsChartOptions = this.svc.convertToDiscoveryTrendAnalyticsChartView(res);
          this.trendAnalyticsTableRows = this.svc.convertToDiscoveryTrendAnalyticsTableView(res);
          this.initializeTrendAnalyticsSortState();
          this.spinner.stop(this.loaderNames.trendAnalytics);

        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }

  getDiscoverySuccessandFailureData() {
    this.sucessAndFailureChartOptions = null;
    this.successAndFailureTableRows = [];
    this.spinner.start(this.loaderNames.successAndFailure);
    this.svc.getDiscoverySuccessandFailureData(this.appliedFilters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.sucessAndFailureChartOptions = this.svc.convertToDiscoverySuccessFailureChartView(res);
        this.successAndFailureTableRows = this.svc.convertToDiscoverySuccessFailureTableView(res);
        this.initializeSuccessAndFailureSortState();
        this.spinner.stop(this.loaderNames.successAndFailure);
      }
    }, (_err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
    });
  }

  getCmdbInsightsData() {
    this.spinner.start(this.loaderNames.cmdbSyncInsights);
    this.svc.getCmdbInsightsData(this.appliedFilters).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.cmdbSyncInsights = this.svc.convertToCmdbSyncInsightsViewData(res);
        this.spinner.stop(this.loaderNames.cmdbSyncInsights);
      }
    }, (_err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
    });
  }

  getCiDistributionByDevice() {
    this.ciDistributionByDeviceChartData = null;
    this.ciDistributionByDeviceTableRows = [];
    this.spinner.start(this.loaderNames.ciDistributionByDevice);
    this.svc.getCiDistributionByDevice(this.appliedFilters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.ciDistributionByDeviceChartData = this.svc.convertToCiDistributionByDeviceChartView(res);
          this.ciDistributionByDeviceTableRows = this.svc.convertToCiDistributionByDeviceTableView(res);
          this.initializeCiDistributionByDeviceSortState();
          this.spinner.stop(this.loaderNames.ciDistributionByDevice);

        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }

  getCiDistributionByDiscovery() {
    this.ciDistributionByDiscoveryChartData = null;
    this.ciDistributionByDiscoveryTableRows = [];
    this.spinner.start(this.loaderNames.ciDistributionByDiscovery);
    this.svc.getCiDistributionByDicovery(this.appliedFilters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.ciDistributionByDiscoveryChartData = this.svc.convertToCiDistributionByDiscoveryChartView(res);
          this.ciDistributionByDiscoveryTableRows = this.svc.convertToCiDistributionByDiscoveryTableView(res);
          this.initializeCiDistributionByDiscoverySortState();
          this.spinner.stop(this.loaderNames.ciDistributionByDiscovery);

        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }

  newlyDiscoveredDevicesCount: number
  newlyDiscoveredDevicesPageNo = 1;
  newlyDiscoveredDevicesPageSize = 10;
  newlyDiscoveredDevicesTotal = 0;
  orphanedDeviceByTypeCount = 0;
  orphanedDeviceByTypePageNo = 1;
  orphanedDeviceByTypePageSize = 10;
  orphanedDevicesBreakdownTotal = 0;
  topDiscoveryFailuresCount: number;
  operatingSystemsCount: number;

  getNewlyDiscoveredDevices() {
    this.newlyDiscoveredDevices = [];
    this.newlyDiscoveredDevicesManufacturerModelChart = null;
    this.newlyDiscoveredDevicesAvailabilityTrendChart = null;
    this.newlyDiscoveredDevicesDatacenterChart = null;
    this.newlyDiscoveredDevicesStatusByDatacenterChart = null;
    this.spinner.start(this.loaderNames.newlyDiscoveredDevices);
    forkJoin({
      tableData: this.svc.getNewlyDiscoveredDevices(
        this.newlyDiscoveredDevicesPageNo,
        this.newlyDiscoveredDevicesPageSize,
        this.newlyDiscoveredDevicesSearch,
        this.appliedFilters
      ),
      manufacturerModelData: this.svc.getNewlyDiscoveredManufacturerModelDistribution(this.appliedFilters),
      datacenterDistributionData: this.svc.getNewlyDiscoveredDatacenterDistribution(this.appliedFilters),
      statusByDatacenterData: this.svc.getNewlyDiscoveredStatusByDatacenterDistribution(this.appliedFilters)
    })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res?.tableData) {
          this.newlyDiscoveredDevicesCount = res.tableData.count;
          this.newlyDiscoveredDevicesTotal = res.tableData.count;
          this.newlyDiscoveredDevices = this.svc.convertToNewlyDiscoveredDeviceViewData(res.tableData.results);
          this.newlyDiscoveredDevicesManufacturerModelChart = this.svc.convertToNewlyDiscoveredManufacturerModelChartView(res.manufacturerModelData);
          this.newlyDiscoveredDevicesManufacturerLegendItems = this.buildNewlyDiscoveredManufacturerLegendItems(this.newlyDiscoveredDevicesManufacturerModelChart);
          this.newlyDiscoveredDevicesManufacturerLegendPage = 0;
          this.newlyDiscoveredDevicesAvailabilityTrendChart = this.svc.convertToNewlyDiscoveredAvailabilityTrendChartView(this.newlyDiscoveredDevices);
          this.newlyDiscoveredDevicesDatacenterChart = this.svc.convertToNewlyDiscoveredDatacenterChartView(res.datacenterDistributionData);
          this.newlyDiscoveredDevicesStatusByDatacenterChart = this.svc.convertToNewlyDiscoveredStatusByDatacenterChartView(res.statusByDatacenterData);
          this.initializeNewlyDiscoveredDevicesSortState();
          this.spinner.stop(this.loaderNames.newlyDiscoveredDevices);
        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }

  setNewlyDiscoveredDevicesViewMode(mode: 'table' | 'chart') {
    this.newlyDiscoveredDevicesViewMode = mode;
  }

  previousNewlyDiscoveredManufacturerLegendPage() {
    if (this.newlyDiscoveredDevicesManufacturerLegendPage <= 0) {
      return;
    }

    this.newlyDiscoveredDevicesManufacturerLegendPage -= 1;
  }

  nextNewlyDiscoveredManufacturerLegendPage() {
    if (this.newlyDiscoveredDevicesManufacturerLegendPage >= this.getNewlyDiscoveredManufacturerLegendPageCount() - 1) {
      return;
    }

    this.newlyDiscoveredDevicesManufacturerLegendPage += 1;
  }

  getVisibleNewlyDiscoveredManufacturerLegendItems(): Array<{ label: string; color: string }> {
    const start = this.newlyDiscoveredDevicesManufacturerLegendPage * this.newlyDiscoveredDevicesManufacturerLegendPageSize;
    return this.newlyDiscoveredDevicesManufacturerLegendItems.slice(start, start + this.newlyDiscoveredDevicesManufacturerLegendPageSize);
  }

  getNewlyDiscoveredManufacturerLegendPageCount(): number {
    if (!this.newlyDiscoveredDevicesManufacturerLegendItems.length) {
      return 1;
    }

    return Math.ceil(this.newlyDiscoveredDevicesManufacturerLegendItems.length / this.newlyDiscoveredDevicesManufacturerLegendPageSize);
  }

  onNewlyDiscoveredDevicesSearched(event: string) {
    this.newlyDiscoveredDevicesSearch = event;
    this.newlyDiscoveredDevicesPageNo = 1;
    this.getNewlyDiscoveredDevices();
  }

  newlyDiscoveredDevicesPageChange(pageNo: number) {
    if (this.newlyDiscoveredDevicesPageNo === pageNo) {
      return;
    }
    this.newlyDiscoveredDevicesPageNo = pageNo;
    this.getNewlyDiscoveredDevices();
  }

  newlyDiscoveredDevicesPageSizeChange(event: Event) {
    this.newlyDiscoveredDevicesPageSize = Number((event.target as HTMLSelectElement).value || 10);
    this.newlyDiscoveredDevicesPageNo = 1;
    this.getNewlyDiscoveredDevices();
  }

  onNewlyDiscoveredDevicesTableSorted(event: ColumnSortedEvent) {
    if (!this.newlyDiscoveredDevices?.length || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    const sortColumn = event.sortColumn as NewlyDiscoveredDevicesSortColumn;

    this.newlyDiscoveredDevicesSortState = {
      sortColumn,
      sortDirection: event.sortDirection
    };
    this.newlyDiscoveredDevices = this.svc.sortNewlyDiscoveredDeviceRows(
      this.newlyDiscoveredDevices,
      sortColumn,
      event.sortDirection
    );
  }

  getNewlyDiscoveredDevicesSortDirection(sortColumn: NewlyDiscoveredDevicesSortColumn): string {
    if (this.newlyDiscoveredDevicesSortState.sortColumn !== sortColumn) {
      return '';
    }

    return this.newlyDiscoveredDevicesSortState.sortDirection;
  }

  getNewlyDiscoveredDevicesHeaderClass(sortColumn: NewlyDiscoveredDevicesSortColumn): string {
    return this.newlyDiscoveredDevicesSortState.sortColumn === sortColumn
      ? 'discovery-new-ci-table-head-cell--active'
      : '';
  }

  trackByNewlyDiscoveredDevice(_index: number, row: NewlyDiscoveredDeviceItemViewData): string {
    return `${row.serialNumber}-${row.ciName}`;
  }

  getNewlyDiscoveredDevicesPageSummary(): string {
    if (!this.newlyDiscoveredDevicesCount || !this.newlyDiscoveredDevices.length) {
      return 'Showing 0 to 0 of 0 items';
    }

    const start = ((this.newlyDiscoveredDevicesPageNo - 1) * this.newlyDiscoveredDevicesPageSize) + 1;
    const end = start + this.newlyDiscoveredDevices.length - 1;
    return `Showing ${start} to ${end} of ${this.newlyDiscoveredDevicesCount} items`;
  }

  getOrphanedDeviceByType() {
    this.orphanedDeviceByTypeRows = [];
    this.spinner.start(this.loaderNames.orphanedDeviceByType);
    this.svc.getOrphanedDeviceByType(
      this.orphanedDeviceByTypePageNo,
      this.orphanedDeviceByTypePageSize,
      this.appliedFilters
    )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.orphanedDeviceByTypeCount = res.count || 0;
          this.orphanedDeviceByTypeRows = this.svc.convertToOrphanedDeviceByTypeViewData(res.results);
          this.initializeOrphanedDeviceByTypeSortState();
        }
        this.spinner.stop(this.loaderNames.orphanedDeviceByType);
      }, (_err: HttpErrorResponse) => {
        this.orphanedDeviceByTypeRows = [];
        this.orphanedDeviceByTypeCount = 0;
        this.spinner.stop(this.loaderNames.orphanedDeviceByType);
        this.notification.error(new Notification('Failed to get orphaned device list data. Try again later'));
      });
  }

  getOrphanedDevicesBreakdown() {
    this.orphanedDevicesBreakdown = [];
    this.orphanedDevicesBreakdownChartData = null;
    this.spinner.start(this.loaderNames.orphanedDevicesBreakdown);
    this.svc.getOrphanedDevicesBreakdown(this.appliedFilters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.orphanedDevicesBreakdownTotal = res.total_count || 0;
          this.orphanedDevicesBreakdown = this.svc.convertToOrphanedDevicesBreakdownViewData(res)
            .filter(item => Number(item?.count) > 0);
          this.orphanedDevicesBreakdownChartData = this.svc.convertToOrphanedDevicesBreakdownChartView(this.orphanedDevicesBreakdown);
        }
        this.spinner.stop(this.loaderNames.orphanedDevicesBreakdown);
      }, (_err: HttpErrorResponse) => {
        this.orphanedDevicesBreakdown = [];
        this.orphanedDevicesBreakdownChartData = null;
        this.orphanedDevicesBreakdownTotal = 0;
        this.spinner.stop(this.loaderNames.orphanedDevicesBreakdown);
        this.notification.error(new Notification('Failed to get orphaned devices category data. Try again later'));
      });
  }

  orphanedDeviceByTypePageChange(pageNo: number) {
    if (this.orphanedDeviceByTypePageNo === pageNo) {
      return;
    }

    this.orphanedDeviceByTypePageNo = pageNo;
    this.getOrphanedDeviceByType();
  }

  onOrphanedDeviceByTypeTableSorted(event: ColumnSortedEvent) {
    if (!this.orphanedDeviceByTypeRows?.length || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    const sortColumn = event.sortColumn as OrphanedDeviceByTypeSortColumn;
    this.orphanedDeviceByTypeSortState = {
      sortColumn,
      sortDirection: event.sortDirection
    };
    this.orphanedDeviceByTypeRows = this.svc.sortOrphanedDeviceByTypeRows(
      this.orphanedDeviceByTypeRows,
      sortColumn,
      event.sortDirection
    );
  }

  getOrphanedDeviceByTypeSortDirection(sortColumn: OrphanedDeviceByTypeSortColumn): string {
    if (this.orphanedDeviceByTypeSortState.sortColumn !== sortColumn) {
      return '';
    }

    return this.orphanedDeviceByTypeSortState.sortDirection;
  }

  getOrphanedDeviceByTypeHeaderClass(sortColumn: OrphanedDeviceByTypeSortColumn): string {
    return this.orphanedDeviceByTypeSortState.sortColumn === sortColumn
      ? 'discovery-orphan-table-head-cell--active'
      : '';
  }

  canOpenOrphanedDeviceDetails(row: OrphanedDeviceByTypeItemViewData): boolean {
    return !!this.getOrphanedDeviceDetailsPath(row);
  }

  openOrphanedDeviceDetails(row: OrphanedDeviceByTypeItemViewData): void {
    const detailsPath = this.getOrphanedDeviceDetailsPath(row);
    if (!detailsPath) {
      return;
    }

    const routeUrl = this.router.serializeUrl(this.router.parseUrl(detailsPath));
    const externalUrl = this.location.prepareExternalUrl(routeUrl);
    window.open(externalUrl, '_blank', 'noopener');
  }

  trackByOrphanedDeviceByType(_index: number, row: OrphanedDeviceByTypeItemViewData): string {
    return row.uuid || row.deviceName;
  }

  private getOrphanedDeviceDetailsPath(row: OrphanedDeviceByTypeItemViewData): string {
    const uuid = row?.uuid;
    if (!uuid) {
      return '';
    }

    const device = (row?.device || '').toLowerCase();
    const deviceType = (row?.deviceType || '').toLowerCase();
    const deviceTypeKey = (row?.deviceTypeKey || '').toLowerCase();
    const vmSubType = (row?.vmSubType || '').toLowerCase();

    if (device === 'switch' || deviceType === 'switch') {
      return `/unitycloud/devices/switches/${uuid}/zbx/details`;
    }

    if (device === 'firewall' || deviceType === 'firewall') {
      return `/unitycloud/devices/firewalls/${uuid}/zbx/details`;
    }

    if (device === 'load balancer' || deviceType === 'load balancer') {
      return `/unitycloud/devices/loadbalancers/${uuid}/zbx/details`;
    }

    if (device === 'hypervisor' || deviceTypeKey === 'hypervisor') {
      return `/unitycloud/devices/hypervisors/${uuid}/zbx/details`;
    }

    if (device === 'bms' || deviceTypeKey === 'bm server') {
      return `/unitycloud/devices/bmservers/${uuid}/zbx/details`;
    }

    if (device === 'mac' || deviceType === 'mac device' || deviceTypeKey === 'mac device') {
      return `/unitycloud/devices/macdevices/${uuid}/zbx/details`;
    }

    if (device === 'storage' || deviceType === 'storage' || deviceTypeKey === 'storage') {
      return `/unitycloud/devices/storagedevices/${uuid}/zbx/details`;
    }

    if (device === 'database' || deviceType === 'database server') {
      return `/unitycloud/devices/databases/${uuid}/details`;
    }

    if (device === 'smart_pdu' || deviceType === 'smart pdu' || deviceTypeKey === 'smart pdu') {
      return `/unitycloud/devices/iot-devices/${uuid}/zbx/smart-pdu-details`;
    }

    if (device === 'sensor' || deviceType === 'sensor' || deviceTypeKey === 'sensor') {
      return `/unitycloud/devices/iot-devices/${uuid}/zbx/sensor-overview`;
    }

    if (device === 'rfid_reader' || deviceType === 'rfid reader' || deviceTypeKey === 'rfid reader') {
      return `/unitycloud/devices/iot-devices/${uuid}/zbx/rfid-reader-details`;
    }

    if (device === 'virtual machine') {
      if (vmSubType === 'vmware' || deviceType === 'vmware vm') {
        return `/unitycloud/devices/vms/vmware/${uuid}/zbx/details`;
      }

      if (vmSubType === 'custom' || deviceType === 'custom vm') {
        return `/unitycloud/devices/vms/custom/${uuid}/zbx/details`;
      }
    }

    return '';
  }

  getTopDiscoveryFailures() {
    this.topDiscoveryFailuresChartData = null;
    this.topDiscoveryFailures = [];
    this.spinner.start(this.loaderNames.topDiscoveryFailures);
    this.svc.getTopDiscoveryFailures(this.appliedFilters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.topDiscoveryFailuresCount = res.length;
          this.topDiscoveryFailuresChartData = this.svc.convertToTopDiscoveryFailuresChartView(res);
          this.topDiscoveryFailures = this.svc.convertToTopDiscoveryFailuresViewData(res);
          this.initializeTopDiscoveryFailuresSortState();
          this.spinner.stop(this.loaderNames.topDiscoveryFailures);

        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }

  setTopDiscoveryFailuresViewMode(mode: 'table' | 'chart') {
    this.topDiscoveryFailuresViewMode = mode;
  }

  onTopDiscoveryFailuresTableSorted(event: ColumnSortedEvent) {
    if (!this.topDiscoveryFailures?.length || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    const sortColumn = event.sortColumn as TopDiscoveryFailuresSortColumn;

    this.topDiscoveryFailuresSortState = {
      sortColumn,
      sortDirection: event.sortDirection
    };
    this.topDiscoveryFailures = this.svc.sortTopDiscoveryFailuresRows(
      this.topDiscoveryFailures,
      sortColumn,
      event.sortDirection
    );
  }

  getTopDiscoveryFailuresSortDirection(sortColumn: TopDiscoveryFailuresSortColumn): string {
    if (this.topDiscoveryFailuresSortState.sortColumn !== sortColumn) {
      return '';
    }

    return this.topDiscoveryFailuresSortState.sortDirection;
  }

  getTopDiscoveryFailuresHeaderClass(sortColumn: TopDiscoveryFailuresSortColumn): string {
    return this.topDiscoveryFailuresSortState.sortColumn === sortColumn
      ? 'discovery-failures-table-head-cell--active'
      : '';
  }

  trackByTopDiscoveryFailure(_index: number, row: TopDiscoveryFailuresItemViewData): string {
    return `${row.policyName}-${row.lastFailure}`;
  }

  getTOperatingSystems() {
    this.operatingSystemsChartData = null;
    this.operatingSystems = [];
    this.spinner.start(this.loaderNames.operatingSystems);
    this.svc.getTOperatingSystems(this.appliedFilters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.operatingSystemsCount = res.length;
          this.operatingSystemsChartData = this.svc.convertToOperatingSystemsChartView(res);
          this.operatingSystems = this.svc.convertToOperatingSystemsViewData(res);
          this.operatingSystemsLegendItems = this.buildOperatingSystemsLegendItems(this.operatingSystemsChartData);
          this.operatingSystemsLegendPage = 0;
          this.initializeOperatingSystemsSortState();
          this.spinner.stop(this.loaderNames.operatingSystems);

        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }

  setOperatingSystemsViewMode(mode: 'table' | 'chart') {
    this.operatingSystemsViewMode = mode;
  }

  previousOperatingSystemsLegendPage() {
    if (this.operatingSystemsLegendPage <= 0) {
      return;
    }

    this.operatingSystemsLegendPage -= 1;
  }

  nextOperatingSystemsLegendPage() {
    if (this.operatingSystemsLegendPage >= this.getOperatingSystemsLegendPageCount() - 1) {
      return;
    }

    this.operatingSystemsLegendPage += 1;
  }

  getVisibleOperatingSystemsLegendItems(): Array<{ label: string; color: string }> {
    const start = this.operatingSystemsLegendPage * this.operatingSystemsLegendPageSize;
    return this.operatingSystemsLegendItems.slice(start, start + this.operatingSystemsLegendPageSize);
  }

  getOperatingSystemsLegendPageCount(): number {
    if (!this.operatingSystemsLegendItems.length) {
      return 1;
    }

    return Math.ceil(this.operatingSystemsLegendItems.length / this.operatingSystemsLegendPageSize);
  }

  onOperatingSystemsTableSorted(event: ColumnSortedEvent) {
    if (!this.operatingSystems?.length || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    const sortColumn = event.sortColumn as OperatingSystemsSortColumn;

    this.operatingSystemsSortState = {
      sortColumn,
      sortDirection: event.sortDirection
    };
    this.operatingSystems = this.svc.sortOperatingSystemsRows(
      this.operatingSystems,
      sortColumn,
      event.sortDirection
    );
  }

  getOperatingSystemsSortDirection(sortColumn: OperatingSystemsSortColumn): string {
    if (this.operatingSystemsSortState.sortColumn !== sortColumn) {
      return '';
    }

    return this.operatingSystemsSortState.sortDirection;
  }

  getOperatingSystemsHeaderClass(sortColumn: OperatingSystemsSortColumn): string {
    return this.operatingSystemsSortState.sortColumn === sortColumn
      ? 'discovery-os-table-head-cell--active'
      : '';
  }

  trackByOperatingSystem(_index: number, row: OperatingSystemsItemViewData): string {
    return `${row.osType}-${row.osVersion}`;
  }

  getCmdbSyncTrend() {
    this.cmdbSyncTrend = null;
    this.cmdbSyncTrendTableRows = [];
    this.spinner.start(this.loaderNames.cmdbSyncTrend);
    this.svc.getCmdbSyncTrend(this.appliedFilters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.cmdbSyncTrend = this.svc.convertToCmdbSyncTrendChartView(res);
          this.cmdbSyncTrendTableRows = this.svc.convertToCmdbSyncTrendTableView(res);
          this.initializeCmdbSyncTrendSortState();
          this.spinner.stop(this.loaderNames.cmdbSyncTrend);

        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }

  getCiDistribution() {
    this.ciDistributionChartData = null;
    this.ciDistributionTableRows = [];
    this.ciDistributionLegendItems = [];
    this.spinner.start(this.loaderNames.ciDistribution);
    this.svc.getCiDistribution(this.appliedFilters)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.ciDistributionChartData = this.svc.convertToCiDistributionChartView(res);
          this.ciDistributionTableRows = this.svc.convertToCiDistributionTableView(res);
          this.initializeCiDistributionSortState();
          this.ciDistributionLegendItems = this.buildCiDistributionLegendItems(this.ciDistributionChartData);
          this.spinner.stop(this.loaderNames.ciDistribution);
        }
      }, (_err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to get Cluster Capacity Util Trend Widget data. Try again later'));
      });
  }

  applyFilters() {
    this.appliedFilters = this.getFilterFormOutput();
  }

  refreshFilters() {
    this.loadFilterOptionsAndDashboard();
  }

  goBack() {
    goBackFromDefaultDashboard(this.router, this.route);
  }

  setTrendAnalyticsViewMode(mode: 'table' | 'chart') {
    this.trendAnalyticsViewMode = mode;
  }

  setSuccessAndFailureViewMode(mode: 'table' | 'chart') {
    this.successAndFailureViewMode = mode;
  }

  setCiDistributionByDeviceViewMode(mode: 'table' | 'chart') {
    this.ciDistributionByDeviceViewMode = mode;
  }

  setCiDistributionByDiscoveryViewMode(mode: 'table' | 'chart') {
    this.ciDistributionByDiscoveryViewMode = mode;
  }

  setCiDistributionViewMode(mode: 'table' | 'chart') {
    this.ciDistributionViewMode = mode;
  }

  setCmdbSyncTrendViewMode(mode: 'table' | 'chart') {
    this.cmdbSyncTrendViewMode = mode;
  }

  onCiDistributionByDeviceTableSorted(event: ColumnSortedEvent) {
    if (!this.ciDistributionByDeviceTableRows?.length || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    const sortColumn = event.sortColumn as CiDistributionByDeviceSortColumn;

    this.ciDistributionByDeviceSortState = {
      sortColumn,
      sortDirection: event.sortDirection
    };
    this.ciDistributionByDeviceTableRows = this.svc.sortCiDistributionByDeviceRows(
      this.ciDistributionByDeviceTableRows,
      sortColumn,
      event.sortDirection
    );
  }

  getCiDistributionByDeviceSortDirection(sortColumn: CiDistributionByDeviceSortColumn): string {
    if (this.ciDistributionByDeviceSortState.sortColumn !== sortColumn) {
      return '';
    }

    return this.ciDistributionByDeviceSortState.sortDirection;
  }

  getCiDistributionByDeviceHeaderClass(sortColumn: CiDistributionByDeviceSortColumn): string {
    return this.ciDistributionByDeviceSortState.sortColumn === sortColumn
      ? 'discovery-device-distribution-table-head-cell--active'
      : '';
  }

  trackByCiDistributionByDeviceRow(_index: number, row: CiDistributionByDeviceTableRowViewData): string {
    return row.deviceTypeKey || row.deviceType;
  }

  onCiDistributionChartInit(chartInstance: any) {
    this.bindChartClick(chartInstance, params => {
      const category = params?.data?.name || params?.name;
      this.openCiDistributionRedirect(category);
    });
  }

  openCiDistributionLegend(category: string) {
    this.openCiDistributionRedirect(category);
  }

  onTrendAnalyticsTableSorted(event: ColumnSortedEvent) {
    if (!this.trendAnalyticsTableRows?.length || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    const sortColumn = event.sortColumn as DiscoveryTrendAnalyticsSortColumn;

    this.trendAnalyticsSortState = {
      sortColumn,
      sortDirection: event.sortDirection
    };
    this.trendAnalyticsTableRows = this.svc.sortDiscoveryTrendAnalyticsRows(
      this.trendAnalyticsTableRows,
      sortColumn,
      event.sortDirection
    );
  }

  getTrendAnalyticsSortDirection(sortColumn: DiscoveryTrendAnalyticsSortColumn): string {
    if (this.trendAnalyticsSortState.sortColumn !== sortColumn) {
      return '';
    }

    return this.trendAnalyticsSortState.sortDirection;
  }

  getTrendAnalyticsHeaderClass(sortColumn: DiscoveryTrendAnalyticsSortColumn): string {
    return this.trendAnalyticsSortState.sortColumn === sortColumn
      ? 'discovery-trend-table-head-cell--active'
      : '';
  }

  trackByTrendAnalyticsRow(_index: number, row: DiscoveryTrendAnalyticsTableRowViewData): string {
    return row.week;
  }

  onSuccessAndFailureTableSorted(event: ColumnSortedEvent) {
    if (!this.successAndFailureTableRows?.length || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    const sortColumn = event.sortColumn as DiscoverySuccessFailureSortColumn;

    this.successAndFailureSortState = {
      sortColumn,
      sortDirection: event.sortDirection
    };
    this.successAndFailureTableRows = this.svc.sortDiscoverySuccessFailureRows(
      this.successAndFailureTableRows,
      sortColumn,
      event.sortDirection
    );
  }

  getSuccessAndFailureSortDirection(sortColumn: DiscoverySuccessFailureSortColumn): string {
    if (this.successAndFailureSortState.sortColumn !== sortColumn) {
      return '';
    }

    return this.successAndFailureSortState.sortDirection;
  }

  getSuccessAndFailureHeaderClass(sortColumn: DiscoverySuccessFailureSortColumn): string {
    return this.successAndFailureSortState.sortColumn === sortColumn
      ? 'discovery-success-table-head-cell--active'
      : '';
  }

  trackBySuccessAndFailureRow(_index: number, row: DiscoverySuccessFailureTableRowViewData): string {
    return row.week;
  }

  onCiDistributionByDiscoveryTableSorted(event: ColumnSortedEvent) {
    if (!this.ciDistributionByDiscoveryTableRows?.length || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    const sortColumn = event.sortColumn as CiDistributionByDiscoverySortColumn;

    this.ciDistributionByDiscoverySortState = {
      sortColumn,
      sortDirection: event.sortDirection
    };
    this.ciDistributionByDiscoveryTableRows = this.svc.sortCiDistributionByDiscoveryRows(
      this.ciDistributionByDiscoveryTableRows,
      sortColumn,
      event.sortDirection
    );
  }

  getCiDistributionByDiscoverySortDirection(sortColumn: CiDistributionByDiscoverySortColumn): string {
    if (this.ciDistributionByDiscoverySortState.sortColumn !== sortColumn) {
      return '';
    }

    return this.ciDistributionByDiscoverySortState.sortDirection;
  }

  getCiDistributionByDiscoveryHeaderClass(sortColumn: CiDistributionByDiscoverySortColumn): string {
    return this.ciDistributionByDiscoverySortState.sortColumn === sortColumn
      ? 'discovery-distribution-table-head-cell--active'
      : '';
  }

  trackByCiDistributionByDiscoveryRow(_index: number, row: CiDistributionByDiscoveryTableRowViewData): string {
    return `${row.discoveryMethod}-${row.protocol}-${row.lastRun}`;
  }

  onCiDistributionTableSorted(event: ColumnSortedEvent) {
    if (!this.ciDistributionTableRows?.length || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    const sortColumn = event.sortColumn as CiDistributionSortColumn;

    this.ciDistributionSortState = {
      sortColumn,
      sortDirection: event.sortDirection
    };
    this.ciDistributionTableRows = this.svc.sortCiDistributionRows(
      this.ciDistributionTableRows,
      sortColumn,
      event.sortDirection
    );
  }

  getCiDistributionSortDirection(sortColumn: CiDistributionSortColumn): string {
    if (this.ciDistributionSortState.sortColumn !== sortColumn) {
      return '';
    }

    return this.ciDistributionSortState.sortDirection;
  }

  getCiDistributionHeaderClass(sortColumn: CiDistributionSortColumn): string {
    return this.ciDistributionSortState.sortColumn === sortColumn
      ? 'discovery-distribution-table-head-cell--active'
      : '';
  }

  trackByCiDistributionRow(_index: number, row: CiDistributionTableRowViewData): string {
    return row.categoryKey || row.category;
  }

  onCmdbSyncTrendTableSorted(event: ColumnSortedEvent) {
    if (!this.cmdbSyncTrendTableRows?.length || !event?.sortColumn || !event?.sortDirection) {
      return;
    }

    const sortColumn = event.sortColumn as CmdbSyncTrendSortColumn;

    this.cmdbSyncTrendSortState = {
      sortColumn,
      sortDirection: event.sortDirection
    };
    this.cmdbSyncTrendTableRows = this.svc.sortCmdbSyncTrendRows(
      this.cmdbSyncTrendTableRows,
      sortColumn,
      event.sortDirection
    );
  }

  getCmdbSyncTrendSortDirection(sortColumn: CmdbSyncTrendSortColumn): string {
    if (this.cmdbSyncTrendSortState.sortColumn !== sortColumn) {
      return '';
    }

    return this.cmdbSyncTrendSortState.sortDirection;
  }

  getCmdbSyncTrendHeaderClass(sortColumn: CmdbSyncTrendSortColumn): string {
    return this.cmdbSyncTrendSortState.sortColumn === sortColumn
      ? 'discovery-trend-table-head-cell--active'
      : '';
  }

  trackByCmdbSyncTrendRow(_index: number, row: CmdbSyncTrendTableRowViewData): string {
    return row.week;
  }

  private buildFilterForm() {
    this.filterFormUnsubscribe.next();
    this.filterForm = this.svc.buildFilterForm(this.getFilterFormDefaults());
    this.watchFilterChanges();
  }

  private resetFilterState() {
    this.filterFormUnsubscribe.next();
    this.filterForm = null;
    this.filterLoadFailed = false;
    this.timeRangeOptions = [];
    this.regionOptions = [];
    this.executiveKpiViewData = new ExecutiveKpiViewData();
    this.cmdbSyncInsights = new CmdbSyncInsightsViewData();
    this.ciDistributionChartData = null;
    this.ciDistributionViewMode = 'chart';
    this.ciDistributionTableRows = [];
    this.ciDistributionSortState = { sortColumn: '', sortDirection: '' };
    this.ciDistributionLegendItems = [];
    this.ciDistributionByDeviceChartData = null;
    this.ciDistributionByDeviceViewMode = 'chart';
    this.ciDistributionByDeviceTableRows = [];
    this.ciDistributionByDeviceSortState = { sortColumn: '', sortDirection: '' };
    this.ciDistributionByDiscoveryChartData = null;
    this.ciDistributionByDiscoveryViewMode = 'chart';
    this.ciDistributionByDiscoveryTableRows = [];
    this.ciDistributionByDiscoverySortState = { sortColumn: '', sortDirection: '' };
    this.newlyDiscoveredDevices = [];
    this.newlyDiscoveredDevicesViewMode = 'chart';
    this.newlyDiscoveredDevicesManufacturerModelChart = null;
    this.newlyDiscoveredDevicesManufacturerLegendItems = [];
    this.newlyDiscoveredDevicesManufacturerLegendPage = 0;
    this.newlyDiscoveredDevicesAvailabilityTrendChart = null;
    this.newlyDiscoveredDevicesDatacenterChart = null;
    this.newlyDiscoveredDevicesStatusByDatacenterChart = null;
    this.newlyDiscoveredDevicesSortState = { sortColumn: '', sortDirection: '' };
    this.orphanedDeviceByTypeRows = [];
    this.orphanedDeviceByTypeSortState = { sortColumn: '', sortDirection: '' };
    this.orphanedDevicesBreakdownChartData = null;
    this.orphanedDevicesBreakdown = [];
    this.topDiscoveryFailuresChartData = null;
    this.topDiscoveryFailuresViewMode = 'chart';
    this.topDiscoveryFailures = [];
    this.topDiscoveryFailuresSortState = { sortColumn: '', sortDirection: '' };
    this.operatingSystemsChartData = null;
    this.operatingSystemsViewMode = 'chart';
    this.operatingSystems = [];
    this.operatingSystemsLegendItems = [];
    this.operatingSystemsLegendPage = 0;
    this.operatingSystemsSortState = { sortColumn: '', sortDirection: '' };
    this.newlyDiscoveredDevicesCount = 0;
    this.newlyDiscoveredDevicesTotal = 0;
    this.orphanedDeviceByTypeCount = 0;
    this.orphanedDeviceByTypePageNo = 1;
    this.orphanedDevicesBreakdownTotal = 0;
    this.topDiscoveryFailuresCount = 0;
    this.operatingSystemsCount = 0;
    this.cmdbSyncTrend = null;
    this.cmdbSyncTrendViewMode = 'chart';
    this.cmdbSyncTrendTableRows = [];
    this.cmdbSyncTrendSortState = { sortColumn: '', sortDirection: '' };
    this.trendAnalyticsChartOptions = null;
    this.trendAnalyticsViewMode = 'chart';
    this.trendAnalyticsTableRows = [];
    this.trendAnalyticsSortState = { sortColumn: '', sortDirection: '' };
    this.successAndFailureViewMode = 'chart';
    this.successAndFailureTableRows = [];
    this.successAndFailureSortState = { sortColumn: '', sortDirection: '' };
    this.sucessAndFailureChartOptions = null;
    this.appliedFilters = {
      region: [],
      timeRange: 'last_30_days'
    };
    this.newlyDiscoveredDevicesSearch = '';
    this.newlyDiscoveredDevicesPageNo = 1;
  }

  private getFilterFormOutput(): DiscoveryDashboardFilterCriteria {
    const rawValue = this.filterForm?.getRawValue() || {};
    return {
      region: this.getSelectedRegionValues(rawValue.region),
      timeRange: rawValue.timeRange || this.getDefaultTimeRangeSelection()
    };
  }

  private convertRegionOptions(regions: string[]): DiscoveryDashboardFilterOption[] {
    return (regions || [])
      .filter((region, index, list) => !!region && list.indexOf(region) === index)
      .map(region => ({
        label: this.formatRegionLabel(region),
        value: region
      }));
  }

  private normalizeFilterOptions(
    options?: string | string[] | DiscoveryDashboardFilterOption[]
  ): DiscoveryDashboardFilterOption[] {
    const normalizedOptions = Array.isArray(options)
      ? options
      : options
        ? [options]
        : [];

    return normalizedOptions
      .map(option => {
        if (typeof option === 'string') {
          return {
            label: this.formatFilterOptionLabel(option),
            value: option
          };
        }

        if (option?.value) {
          return {
            label: option.label || this.formatFilterOptionLabel(option.value),
            value: option.value
          };
        }

        return null;
      })
      .filter((option): option is DiscoveryDashboardFilterOption => !!option);
  }

  private formatFilterOptionLabel(value: string): string {
    return String(value || '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, match => match.toUpperCase());
  }

  private formatRegionLabel(region: string): string {
    return String(region || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, match => match.toUpperCase());
  }

  private watchFilterChanges() {
    this.filterForm.get('region').valueChanges
      .pipe(takeUntil(this.ngUnsubscribe), takeUntil(this.filterFormUnsubscribe))
      .subscribe(() => this.applyFilters());
  }

  private getFilterFormDefaults(): DiscoveryDashboardFilterFormValue {
    return {
      region: this.getSelectedRegionOptions(this.appliedFilters.region),
      timeRange: this.appliedFilters.timeRange
    };
  }

  private getDefaultRegionSelection(): DiscoveryDashboardFilterOption[] {
    return this.regionOptions;
  }

  private getDefaultRegionSelectionValues(): string[] {
    return ['all'];
  }

  private getSelectedRegionOptions(selectedValues: string[]): DiscoveryDashboardFilterOption[] {
    if (this.isAllSelection(selectedValues)) {
      return this.getDefaultRegionSelection();
    }

    const nextOptions = this.regionOptions.filter(option => (selectedValues || []).includes(option.value));
    return nextOptions.length ? nextOptions : this.getDefaultRegionSelection();
  }

  private getSelectedRegionValues(selectedOptions: DiscoveryDashboardFilterOption[]): string[] {
    const selectedValues = (selectedOptions || [])
      .map(option => option?.value)
      .filter(value => !!value);

    if (!selectedValues.length || selectedValues.length === this.regionOptions.length) {
      return this.getDefaultRegionSelectionValues();
    }

    return selectedValues;
  }

  private isAllSelection(selectedValues: string[]): boolean {
    return !selectedValues?.length || selectedValues.includes('all');
  }

  private getDefaultTimeRangeSelection(): string {
    return this.timeRangeOptions[0]?.value || 'last_30_days';
  }

  private stopFilterLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.filters), 4);
  }

  private stopTrendAnalyticsLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.trendAnalytics), 4);
  }

  private stopSuccessAndFailureLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.successAndFailure), 4);
  }

  private stopCmdbSyncTrendLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.cmdbSyncTrend), 4);
  }

  private stopCmdbSyncInsightsLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.cmdbSyncInsights), 4);
  }

  private stopCiDistributionByDeviceLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.ciDistributionByDevice), 4);
  }

  private stopCiDistributionLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.ciDistribution), 4);
  }

  private stopCiDistributionByDiscoveryLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.ciDistributionByDiscovery), 4);
  }

  private stopNewlyDiscoveredDevicesLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.newlyDiscoveredDevices), 4);
  }

  private buildNewlyDiscoveredManufacturerLegendItems(chartData: EChartsOption): Array<{ label: string; color: string }> {
    const series = Array.isArray(chartData?.series) ? chartData.series : [];
    return series.map((item: any) => ({
      label: item?.name || '',
      color: item?.itemStyle?.color || '#5d7cf6'
    })).filter(item => !!item.label);
  }

  private stopOrphanedDeviceByTypeLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.orphanedDeviceByType), 4);
  }

  private stopOrphanedDevicesBreakdownLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.orphanedDevicesBreakdown), 4);
  }

  private stopTopDiscoveryFailuresLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.topDiscoveryFailures), 4);
  }

  private stopOperatingSystemsLoader() {
    setTimeout(() => this.spinner.stop(this.loaderNames.operatingSystems), 4);
  }

  private bindChartClick(chartInstance: any, handler: (params: any) => void) {
    if (!chartInstance?.on) {
      return;
    }

    if (chartInstance.off) {
      chartInstance.off('click');
    }

    chartInstance.on('click', handler);
  }

  private openCiDistributionRedirect(category: string) {
    const matchedRow = this.ciDistributionTableRows.find(row => row.category === category);
    const redirectUrl = matchedRow?.redirectUrl;
    if (!redirectUrl) {
      return;
    }

    window.open(redirectUrl, '_blank', 'noopener');
  }

  private initializeTrendAnalyticsSortState() {
    if (!this.trendAnalyticsTableRows?.length) {
      this.trendAnalyticsSortState = { sortColumn: '', sortDirection: '' };
      return;
    }

    const sortColumn: DiscoveryTrendAnalyticsSortColumn = 'totalDevices';
    const sortDirection = 'desc';
    this.trendAnalyticsSortState = {
      sortColumn,
      sortDirection
    };
    this.trendAnalyticsTableRows = this.svc.sortDiscoveryTrendAnalyticsRows(
      this.trendAnalyticsTableRows,
      sortColumn,
      sortDirection
    );
  }

  private initializeNewlyDiscoveredDevicesSortState() {
    if (!this.newlyDiscoveredDevices?.length) {
      this.newlyDiscoveredDevicesSortState = { sortColumn: '', sortDirection: '' };
      return;
    }

    const sortColumn: NewlyDiscoveredDevicesSortColumn = 'lastDiscoveredTimestamp';
    const sortDirection = 'desc';
    this.newlyDiscoveredDevicesSortState = {
      sortColumn,
      sortDirection
    };
    this.newlyDiscoveredDevices = this.svc.sortNewlyDiscoveredDeviceRows(
      this.newlyDiscoveredDevices,
      sortColumn,
      sortDirection
    );
  }

  private initializeOrphanedDeviceByTypeSortState() {
    if (!this.orphanedDeviceByTypeRows?.length) {
      this.orphanedDeviceByTypeSortState = { sortColumn: '', sortDirection: '' };
      return;
    }

    const sortColumn: OrphanedDeviceByTypeSortColumn = 'lastSeenTimestamp';
    const sortDirection = 'desc';
    this.orphanedDeviceByTypeSortState = {
      sortColumn,
      sortDirection
    };
    this.orphanedDeviceByTypeRows = this.svc.sortOrphanedDeviceByTypeRows(
      this.orphanedDeviceByTypeRows,
      sortColumn,
      sortDirection
    );
  }

  private initializeCmdbSyncTrendSortState() {
    if (!this.cmdbSyncTrendTableRows?.length) {
      this.cmdbSyncTrendSortState = { sortColumn: '', sortDirection: '' };
      return;
    }

    const sortColumn: CmdbSyncTrendSortColumn = 'discoveredCis';
    const sortDirection = 'desc';
    this.cmdbSyncTrendSortState = {
      sortColumn,
      sortDirection
    };
    this.cmdbSyncTrendTableRows = this.svc.sortCmdbSyncTrendRows(
      this.cmdbSyncTrendTableRows,
      sortColumn,
      sortDirection
    );
  }

  private initializeSuccessAndFailureSortState() {
    if (!this.successAndFailureTableRows?.length) {
      this.successAndFailureSortState = { sortColumn: '', sortDirection: '' };
      return;
    }

    const sortColumn: DiscoverySuccessFailureSortColumn = 'success';
    const sortDirection = 'desc';
    this.successAndFailureSortState = {
      sortColumn,
      sortDirection
    };
    this.successAndFailureTableRows = this.svc.sortDiscoverySuccessFailureRows(
      this.successAndFailureTableRows,
      sortColumn,
      sortDirection
    );
  }

  private initializeCiDistributionByDeviceSortState() {
    if (!this.ciDistributionByDeviceTableRows?.length) {
      this.ciDistributionByDeviceSortState = { sortColumn: '', sortDirection: '' };
      return;
    }

    const sortColumn: CiDistributionByDeviceSortColumn = 'count';
    const sortDirection = 'asc';
    this.ciDistributionByDeviceSortState = {
      sortColumn,
      sortDirection
    };
    this.ciDistributionByDeviceTableRows = this.svc.sortCiDistributionByDeviceRows(
      this.ciDistributionByDeviceTableRows,
      sortColumn,
      sortDirection
    );
  }

  private initializeCiDistributionByDiscoverySortState() {
    if (!this.ciDistributionByDiscoveryTableRows?.length) {
      this.ciDistributionByDiscoverySortState = { sortColumn: '', sortDirection: '' };
      return;
    }

    const sortColumn: CiDistributionByDiscoverySortColumn = 'resourcesDiscovered';
    const sortDirection = 'desc';
    this.ciDistributionByDiscoverySortState = {
      sortColumn,
      sortDirection
    };
    this.ciDistributionByDiscoveryTableRows = this.svc.sortCiDistributionByDiscoveryRows(
      this.ciDistributionByDiscoveryTableRows,
      sortColumn,
      sortDirection
    );
  }

  private initializeCiDistributionSortState() {
    if (!this.ciDistributionTableRows?.length) {
      this.ciDistributionSortState = { sortColumn: '', sortDirection: '' };
      return;
    }

    const sortColumn: CiDistributionSortColumn = 'share';
    const sortDirection = 'desc';
    this.ciDistributionSortState = {
      sortColumn,
      sortDirection
    };
    this.ciDistributionTableRows = this.svc.sortCiDistributionRows(
      this.ciDistributionTableRows,
      sortColumn,
      sortDirection
    );
  }

  private initializeTopDiscoveryFailuresSortState() {
    if (!this.topDiscoveryFailures?.length) {
      this.topDiscoveryFailuresSortState = { sortColumn: '', sortDirection: '' };
      return;
    }

    const sortColumn: TopDiscoveryFailuresSortColumn = 'failureCount';
    const sortDirection = 'desc';
    this.topDiscoveryFailuresSortState = {
      sortColumn,
      sortDirection
    };
    this.topDiscoveryFailures = this.svc.sortTopDiscoveryFailuresRows(
      this.topDiscoveryFailures,
      sortColumn,
      sortDirection
    );
  }

  private initializeOperatingSystemsSortState() {
    if (!this.operatingSystems?.length) {
      this.operatingSystemsSortState = { sortColumn: '', sortDirection: '' };
      return;
    }

    const sortColumn: OperatingSystemsSortColumn = 'osVersion';
    const sortDirection = 'asc';
    this.operatingSystemsSortState = {
      sortColumn,
      sortDirection
    };
    this.operatingSystems = this.svc.sortOperatingSystemsRows(
      this.operatingSystems,
      sortColumn,
      sortDirection
    );
  }

  private buildCiDistributionLegendItems(chartOptions: EChartsOption): Array<{ label: string; color: string; redirectUrl: string }> {
    const palette = Array.isArray(chartOptions?.color) ? chartOptions.color as string[] : [];
    const series = Array.isArray(chartOptions?.series) ? chartOptions.series[0] as { data?: Array<{ name: string; itemStyle?: { color?: string }; redirectUrl?: string }> } : null;
    const data = series?.data || [];

    return data.map((item, index) => ({
      label: item?.name || '',
      color: item?.itemStyle?.color || palette[index % palette.length] || '#3b82f6',
      redirectUrl: item?.redirectUrl || ''
    }));
  }

  private buildOperatingSystemsLegendItems(chartOptions: EChartsOption): Array<{ label: string; color: string }> {
    const palette = Array.isArray(chartOptions?.color) ? chartOptions.color as string[] : [];
    const series = Array.isArray(chartOptions?.series) ? chartOptions.series as Array<{ name?: string; itemStyle?: { color?: string } }> : [];

    return series.map((item, index) => ({
      label: item?.name || '',
      color: item?.itemStyle?.color || palette[index % palette.length] || '#3b82f6'
    }));
  }

}
