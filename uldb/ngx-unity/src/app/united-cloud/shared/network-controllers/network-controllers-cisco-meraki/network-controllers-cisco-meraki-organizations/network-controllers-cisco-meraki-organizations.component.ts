import { Component, OnDestroy, OnInit } from '@angular/core';
import { NetworkControllersCiscoMerakiOrganizationsService, OrganizationViewData } from './network-controllers-cisco-meraki-organizations.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppLevelService } from 'src/app/app-level.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { OrganizationType } from './network-controllers-cisco-meraki-organizations.type';
import { takeUntil } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DeviceTabData } from '../../../device-tab/device-tab.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'network-controllers-cisco-meraki-organizations',
  templateUrl: './network-controllers-cisco-meraki-organizations.component.html',
  styleUrls: ['./network-controllers-cisco-meraki-organizations.component.scss'],
  providers: [NetworkControllersCiscoMerakiOrganizationsService]
})
export class NetworkControllersCiscoMerakiOrganizationsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  controllerId: string;
  viewData: OrganizationViewData[] = [];
  count: number;
  currentCriteria: SearchCriteria;
  merakiData: DeviceTabData;
  regionList: string[] = [];
  licenseList: string[] = [];
  syncStatus: boolean = false;

  regionSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  regionTexts: IMultiSelectTexts = {
    defaultTitle: 'Region',
  };

  licenseSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  licenseTexts: IMultiSelectTexts = {
    defaultTitle: 'License',
  };

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: NetworkControllersCiscoMerakiOrganizationsService,
    private modalService: BsModalService,
    private spinnerService: AppSpinnerService,
    private appService: AppLevelService,
    private storageService: StorageService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.controllerId = params.get('controllerId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { 'region': [], 'licence_model': [] } };
    });
  }

  ngOnInit(): void {
    this.spinnerService.start('main');
    this.merakiData = <DeviceTabData>this.storageService.getByKey('meraki', StorageType.SESSIONSTORAGE);
    this.getMetadata();
    this.getMerakiOrgaizations();
    this.callSyncApi();
  }

  ngOnDestroy(): void {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getMerakiOrgaizations();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getMerakiOrgaizations();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getMerakiOrgaizations();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getMerakiOrgaizations();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getMerakiOrgaizations();
  }

  onFilterChange() {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = 1;
    this.getMerakiOrgaizations();
  }


  getMetadata() {
    this.svc.getRegions().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.regionList = data;
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
    this.svc.getLisenceModels().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.licenseList = data;
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  getMerakiOrgaizations() {
    this.svc.getMerakiOrganizations(this.currentCriteria, this.controllerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  goToDetails(view: OrganizationViewData) {
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.MERAKI_ORG, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.uuid, 'zbx', 'details'], { relativeTo: this.route });
  }

  goToDevice(view: OrganizationViewData) {
    this.storageService.put('merakiOrganization', { name: view.name, deviceType: DeviceMapping.MERAKI_ORG }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.uuid, 'devices'], { relativeTo: this.route });
  }

  goToStats(view: OrganizationViewData) {
    if (!view.monitoring?.configured) {
      return;
    }
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.MERAKI_ORG, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.uuid, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
  }

  callSyncApi() {
    this.syncStatus = true;
    this.svc.syncDevices().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.syncStatus = false;
      this.getMerakiOrgaizations();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Meraki Organizations could not be Synced!!'));
    });
  }


  goBack() {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }
}
