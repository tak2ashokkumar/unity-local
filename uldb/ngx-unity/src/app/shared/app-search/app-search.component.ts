import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal/';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StorageService, StorageType } from '../app-storage/storage.service';
import { AppUtilityService, DeviceMapping } from '../app-utility/app-utility.service';
import { AppSearchService, GlobalSearchResultViewData } from './app-search.service';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { Notification } from '../app-notification/notification.type';
import { SharedDOMObjectType, GlobalAdvancedSearchFormData } from 'src/app/global-search/global-search.service';
import { UnityOS } from 'src/app/united-cloud/shared/entities/common-entities.type';

@Component({
  selector: 'app-search',
  templateUrl: './app-search.component.html',
  styleUrls: ['./app-search.component.scss']
})
export class AppSearchComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  @ViewChild('searchRef') searchRef: ElementRef;
  searchModelRef: BsModalRef;
  searchForm: FormGroup;
  searchFormErrors: any;
  searchFormValidationMessages: any;

  isSearched: boolean = false;
  searchResults: GlobalSearchResultViewData[] = [];

  filterForm: FormGroup;
  deviceTypes: SharedDOMObjectType[] = [];
  operatingSystems: UnityOS[] = [];
  tagsAutocompleteItems: string[] = [];
  hasChange: boolean = false;

  constructor(private searchService: AppSearchService,
    private router: Router,
    private storageService: StorageService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService) {
    this.searchService.searchToggled$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      if (this.searchModelRef) {
        this.closeGlobalSearch();
      } else {
        this.buildSearchForm();
        this.getDropdownData();
      }
    })
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  closeGlobalSearch() {
    this.searchModelRef.hide();
    this.searchModelRef = null;
    this.resetSearchForm();
    this.filterForm = null;
  }

  resetSearchForm() {
    this.isSearched = false;
    this.searchResults = [];
    this.searchForm = null;
    this.searchFormErrors = null;
    this.searchFormValidationMessages = null;
  }

  buildSearchForm() {
    this.resetSearchForm();
    this.searchForm = this.searchService.buildSearchForm();
    this.searchFormErrors = this.searchService.resetSearchFormErrors();
    this.searchFormValidationMessages = this.searchService.searchFormValidationMessages;
    this.searchModelRef = this.modalService.show(this.searchRef, Object.assign({}, { class: 'modal-lg global-search-modal', keyboard: true, ignoreBackdropClick: true }));
  }

  searchByKeyword() {
    if (this.searchForm.invalid) {
      this.searchFormErrors = this.utilService.validateForm(this.searchForm, this.searchFormValidationMessages, this.searchFormErrors);
      this.searchForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.searchFormErrors = this.utilService.validateForm(this.searchForm, this.searchFormValidationMessages, this.searchFormErrors); });
    } else {
      const key = this.searchForm.get('keyword').value;
      this.searchService.getSearchResults(key).pipe(takeUntil(this.ngUnsubscribe)).subscribe(results => {
        this.isSearched = true;
        this.searchResults = this.searchService.convertToViewdata(results);
      }, (err: HttpErrorResponse) => {
        this.isSearched = true;
      });
    }
  }

  goToSelectedRecord(view: GlobalSearchResultViewData) {
    this.closeGlobalSearch();
    let url = this.searchService.getMonitoringPath(view);
    if (url) {
      this.router.navigateByUrl(view.url, { skipLocationChange: true }).then(() => {
        if (view.url.includes('devices') || view.url.includes('datacenter')) {
          if (view.deviceMapping == DeviceMapping.DB_SERVER) {
            this.storageService.put('device', { name: view.name, deviceType: view.deviceMapping, configured: view.monitoring.configured, monitoringEnabled: view.monitoring.enabled }, StorageType.SESSIONSTORAGE);
          } else if (view.deviceMapping == DeviceMapping.BARE_METAL_SERVER) {
            this.storageService.put('device', { name: view.name, deviceType: view.deviceMapping, configured: view.monitoring.configured, uuid: view.id }, StorageType.SESSIONSTORAGE);
          } else {
            this.storageService.put('device', { name: view.name, deviceType: view.deviceMapping, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
          }
        }
        this.router.navigate([`${view.url}${url}`]);
      });
    } else {
      this.router.navigate([view.url]);
    }
  }

  manageFormView(view: string) {
    if (view == 'search') {
      this.filterForm = null;
      this.buildSearchForm();
    } else {
      this.resetSearchForm();
      this.buildFilterForm();
    }
  }

  getDropdownData() {
    this.searchService.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deviceTypes = res[0];
      this.operatingSystems = res[1];
      this.tagsAutocompleteItems = res[2];
    }, (err: HttpErrorResponse) => {
    });
  }

  buildFilterForm() {
    this.filterForm = this.searchService.buildFilterForm();

    const initialValue = this.filterForm.value
    this.filterForm.valueChanges.subscribe(value => {
      this.hasChange = Object.keys(initialValue).some(key => this.filterForm.value[key] != initialValue[key])
    });
  }

  resetFilterForm() {
    this.filterForm = this.searchService.buildFilterForm();
  }

  advancedSearchView() {
    this.storageService.put('unity-search-data', <GlobalAdvancedSearchFormData>this.filterForm.getRawValue(), StorageType.SESSIONSTORAGE);
    this.closeGlobalSearch();
    this.router.navigate(['unity-search']);
  }
}
