import { Component, OnDestroy, OnInit } from '@angular/core';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { environment } from 'src/environments/environment';
import { CostSummaryResourceLevelService, ResourceLevelCostSummaryViewData, ResourceCostItemViewData } from './cost-summary-resource-level.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountFilterItem } from '../cost-summary.type';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'cost-summary-resource-level',
  templateUrl: './cost-summary-resource-level.component.html',
  styleUrls: ['./cost-summary-resource-level.component.scss'],
  providers: [CostSummaryResourceLevelService]
})
export class CostSummaryResourceLevelComponent implements OnInit, OnDestroy {


  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  cloudData: string[]
  accountData: AccountFilterItem[] = [];
  servicesData: string[] = [];
  summaryData: ResourceLevelCostSummaryViewData;
  resourceTableData: ResourceCostItemViewData[] = [];
  count: number;
  downloadUrl: string = 'customer/cloud_cost_summary/download_resources_cost/';

  userSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Cloud',
  };
  accountSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Account',
  };
  serviceSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Service',
  };

  cloudSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    autoUnselect: true,
    // showCheckAll: true,
    // showUncheckAll: true,
    appendToBody: true,
    selectionLimit: 1
  };
  serviceSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
    selectionLimit: 10
  };
  accountSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'account_name',
    selectAsObject: false,
    keyToSelect: 'account_name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    showCheckAll: false,
    showUncheckAll: true,
    appendToBody: true,
    selectionLimit: 10

  };

  constructor(private svc: CostSummaryResourceLevelService,
    private spinner: AppSpinnerService,
    private storageService: StorageService,
    private notification: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, searchValue: '', params: [{}], multiValueParam: {} };
  }


  ngOnInit(): void {
    this.spinner.start('main');
    this.loadData()

    setTimeout(() => {
      this.getCloudFilter();
      this.getSummaryData();
      this.getAccountFilter()
      this.getServicesFilter()
      this.getResourcesTableData();
    }, 100);
    // this.spinner.stop('main');

  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  loadData() {
    const filter = this.storageService.getByKey('filter', StorageType.SESSIONSTORAGE);
    if (!filter) {
      this.currentCriteria.params[0].cloud_type = '';
      return;
    }
    this.currentCriteria.params[0].cloud_type = [];
    this.currentCriteria.multiValueParam.account_name = [];
    this.currentCriteria.params[0].cloud_type.push(filter.cloud);
    this.currentCriteria.multiValueParam.account_name.push(filter.account);
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}], multiValueParam: {} };
    this.currentCriteria.params[0].cloud_type = '';
    setTimeout(() => {
      this.getCloudFilter();
      this.getSummaryData();
      this.getAccountFilter()
      this.getServicesFilter()
      this.getResourcesTableData();
    }, 100);
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getResourcesTableData();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getResourcesTableData();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getResourcesTableData();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getResourcesTableData();
  }

  onFilterChange() {
    this.spinner.start('main');
    // this.currentCriteria.pageNo = 1;
    this.currentCriteria.multiValueParam.uuid = this.filterUUIDsByCloudTypes(this.currentCriteria.multiValueParam.account_name)
    this.getServicesFilter();
    this.getResourcesTableData();
  }

  onServicesFilterChange() {
    this.spinner.start('main');
    // this.currentCriteria.pageNo = 1;
    this.getResourcesTableData();
  }
  onSummaryFilterChange(event: string) {
    console.log(this.currentCriteria.params[0].cloud_type)
    this.spinner.start('main'); console.log()
    this.currentCriteria.multiValueParam.account_name = [];
    this.currentCriteria.multiValueParam.uuid = [];
    // this.getServicesFilter(event);
    this.getAccountFilter()
    this.getSummaryData();
    this.getResourcesTableData();
  }

  getCloudFilter() {
    this.svc.getCloudFilter().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.cloudData = data.cloud_accounts;
      // this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      // this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching  clouds list'));
    });
  };

  getAccountFilter() {
    this.svc.getAccountFilter(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.accountData = data
      // this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      // this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching  clouds list'));
    });
  };

  getServicesFilter() {
    this.svc.getServicesFilter(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.servicesData = data
      // this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      // this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching  clouds list'));
    });
  };

  getSummaryData() {
    this.svc.getSummaryData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.summaryData = this.svc.convertToSummaryViewData(data);
      // this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      // this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching  summary data'));
    });
  }

  getResourcesTableData() {
    this.svc.getResourcesTableData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.resourceTableData = this.svc.convertToResourceTableViewData(data.results);
      this.count = data.count;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching  summary data'));
    });
  }

  filterUUIDsByCloudTypes(cloudTypes: string[]): string[] {
    return this.accountData
      .filter(item => cloudTypes.includes(item.account_name))
      .map(item => item.uuid);
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }


}
