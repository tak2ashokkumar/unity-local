import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { goBackFromDefaultDashboard } from '../app-default-dashboards.service';
import { NetworkDashboardService, NetworkOverviewViewData } from './network-dashboard.service';

@Component({
  selector: 'network-dashboard',
  templateUrl: './network-dashboard.component.html',
  styleUrls: ['./network-dashboard.component.scss'],
  providers: [NetworkDashboardService]
})
export class NetworkDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  filterForm: FormGroup;
  filterLoadFailed = false;
  datacenterOptions: DatacenterFast[] = [];
  timeRangeOptions: string[] = [];
  appliedDatacenters: DatacenterFast[] = [];
  appliedTimeRange = '';
  networkOverviewViewData: NetworkOverviewViewData;
  datacenterMultiselectSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: true,
    maxHeight: '240px'
  };
  datacenterMultiselectTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'All Datacenter',
    allSelected: 'All Datacenter'
  };

  constructor(
    private svc: NetworkDashboardService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    setTimeout(() => this.loadFilterOptionsAndDashboard(), 0);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadFilterOptionsAndDashboard() {
    this.resetFilterState();
    this.svc.getFilterOptions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenterOptions = res?.datacenters || [];
      this.timeRangeOptions = res?.time_range || [];
      this.buildFilterForm();
      this.applyFilters();
      this.loadData();
    }, () => {
      this.filterLoadFailed = true;
    });
  }

  private hasFilterFormData(): boolean {
    return !!this.datacenterOptions.length || !!this.timeRangeOptions.length;
  }

  loadData() {
    if (!this.hasFilterFormData()) {
      return;
    }
    setTimeout(() => {
      this.getNetworkOverview();
    }, 0);
  }

  getNetworkOverview() {
    this.svc.getNetworkOverview().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.networkOverviewViewData = this.svc.convertToNetworkOverviewViewData(res);
    });
  }

  applyFilters() {
    if (!this.filterForm) {
      return;
    }
    this.appliedDatacenters = this.filterForm.get('datacenters')?.value || [];
    this.appliedTimeRange = this.filterForm.get('timeRange')?.value || '';
  }

  refreshFilters() {
    this.loadFilterOptionsAndDashboard();
  }

  goBack() {
    goBackFromDefaultDashboard(this.router, this.route);
  }

  getTimeRangeLabel(value: string): string {
    switch (value) {
      case 'last_24_hours':
        return '24 Hours';
      case 'last_week':
        return '7 Days';
      case 'last_month':
        return '30 Days';
      case 'last_90_days':
        return '90 Days';
      default:
        return value;
    }
  }

  private buildFilterForm() {
    this.filterForm = new FormGroup({
      datacenters: new FormControl(this.datacenterOptions.slice()),
      timeRange: new FormControl(this.timeRangeOptions[0] || 'last_month')
    });
  }

  private resetFilterState() {
    this.filterForm = null;
    this.filterLoadFailed = false;
    this.datacenterOptions = [];
    this.timeRangeOptions = [];
  }


}
