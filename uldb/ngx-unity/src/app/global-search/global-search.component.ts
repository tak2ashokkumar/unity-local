import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from '../shared/app-notification/app-notification.service';
import { Notification } from '../shared/app-notification/notification.type';
import { AppSpinnerService } from '../shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from '../shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping } from '../shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from '../shared/multiselect-dropdown/types';
import { UnityOS } from '../united-cloud/shared/entities/common-entities.type';
import { GlobalAdvancedSearchFormData, GlobalAdvancedSearchViewData, GlobalSearchService, SharedDOMObjectType } from './global-search.service';

@Component({
  selector: 'global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss'],
})
export class GlobalSearchComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceTypes: SharedDOMObjectType[] = [];
  operatingSystems: UnityOS[] = [];
  tagsAutocompleteItems: string[] = [];
  isFiltersOpen: boolean = false;
  subscr: Subscription;

  filterForm: FormGroup;
  filterFormErrors: any;
  filterFormValidationMessages: any;
  filterFormData: GlobalAdvancedSearchFormData;
  viewData: GlobalAdvancedSearchViewData[] = [];

  deviceTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'displayName',
    keyToSelect: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  osSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "cabinet_name",
    keyToSelect: "cabinet_uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  constructor(private searchService: GlobalSearchService,
    private router: Router,
    private storageService: StorageService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    // override the route reuse strategy
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    }

    this.subscr = this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        // trick the Router into believing it's last link wasn't previously loaded
        this.router.navigated = false;
        // if you need to scroll back to top, here is the right place
        window.scrollTo(0, 0);
      }
    });
  }

  ngOnInit() {
    // this.spinner.start('main');
    this.filterFormData = <GlobalAdvancedSearchFormData>this.storageService.extractByKey('unity-search-data', StorageType.SESSIONSTORAGE);
    this.getDropdownData();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    if (this.subscr) {
      this.subscr.unsubscribe();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(event: any) {
    // this.spinner.start('main');
    this.getDropdownData();
  }

  getDropdownData() {
    this.searchService.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deviceTypes = res[0];
      this.operatingSystems = res[1];
      this.tagsAutocompleteItems = res[2];
      this.buildForm();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to get dropdown data"));
    })
  }

  buildForm() {
    if (this.filterFormData) {
      this.filterForm = this.searchService.buildFilterForm(this.filterFormData);
    } else {
      this.filterForm = this.searchService.buildFilterForm();
    }
    this.getSearchResults();
  }

  resetFilterForm() {
    this.filterForm = this.searchService.buildFilterForm();
  }

  getSearchResults() {
    this.spinner.start('main');
    this.searchService.getSearchResults(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.viewData = this.searchService.convertToViewData(res);
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to get search results"));
    })
  }

  goToSelectedRecord(view: GlobalAdvancedSearchViewData) {
    this.resetFilterForm();
    let url = this.searchService.getMonitoringPath(view);
    if (url) {
      this.router.navigateByUrl(view.url, { skipLocationChange: true }).then(() => {
        if (view.url.includes('devices') || view.url.includes('datacenter')) {
          if (view.deviceMapping == DeviceMapping.DB_SERVER) {
            this.storageService.put('device', { name: view.deviceName, deviceType: view.deviceMapping, configured: view.monitoring.configured, monitoringEnabled: view.monitoring.enabled }, StorageType.SESSIONSTORAGE);
          } else if (view.deviceMapping == DeviceMapping.BARE_METAL_SERVER) {
            this.storageService.put('device', { name: view.deviceName, deviceType: view.deviceMapping, configured: view.monitoring.configured, uuid: view.deviceId }, StorageType.SESSIONSTORAGE);
          } else {
            this.storageService.put('device', { name: view.deviceName, deviceType: view.deviceMapping, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
          }
        }
        this.router.navigate([`${view.url}${url}`]);
      });
    } else {
      this.router.navigate([view.url]);
    }
  }
}
