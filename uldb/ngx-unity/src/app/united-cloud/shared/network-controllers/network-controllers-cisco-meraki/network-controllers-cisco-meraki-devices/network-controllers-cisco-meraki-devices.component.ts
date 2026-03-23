import { Component, OnDestroy, OnInit } from '@angular/core';
import { MerakiDeviceViewData, NetworkControllersCiscoMerakiDevicesService, statusList } from './network-controllers-cisco-meraki-devices.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { from, Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { NetworkControllersCiscoMerakiService } from '../network-controllers-cisco-meraki.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceTabData } from '../../../device-tab/device-tab.component';

@Component({
  selector: 'network-controllers-cisco-meraki-devices',
  templateUrl: './network-controllers-cisco-meraki-devices.component.html',
  styleUrls: ['./network-controllers-cisco-meraki-devices.component.scss'],
  providers: [NetworkControllersCiscoMerakiDevicesService]
})
export class NetworkControllersCiscoMerakiDevicesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  currentCriteria: SearchCriteria;
  count: number;
  viewData: MerakiDeviceViewData[] = [];
  view: MerakiDeviceViewData;
  controllerId: string;
  organizationId: string;
  merakiOrganizationData: DeviceTabData;
  statusList = statusList;
  syncStatus: boolean = false;

  statusSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  statusTypeTexts: IMultiSelectTexts = {
    defaultTitle: 'Status',
  };

  constructor(private svc: NetworkControllersCiscoMerakiDevicesService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private storageService: StorageService,
    private notification: AppNotificationService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.controllerId = params.get('controllerId');
      this.organizationId = params.get('organizationId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { 'status': [] } };
    })
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.merakiOrganizationData = <DeviceTabData>this.storageService.getByKey('merakiOrganization', StorageType.SESSIONSTORAGE);
    this.getMerakiDevices();
    this.callSyncApi();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getMerakiDevices();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getMerakiDevices();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getMerakiDevices();
  }

  refreshData($event: SearchCriteria) {
    this.spinner.start('main');
    this.getMerakiDevices();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getMerakiDevices();
  }

  getMerakiDevices() {
    this.svc.getMerakiDevices(this.organizationId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.getDeviceData();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.svc.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => { }
      )
  }

  callSyncApi() {
    this.syncStatus = true;
    this.svc.syncDevices().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.syncStatus = false;
      this.getMerakiDevices();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Meraki Devices could not be Synced!!'));
    });
  }

  goToStats(view: MerakiDeviceViewData) {
    if (!view.monitoring?.configured) {
      return;
    }
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.MERAKI_DEVICE, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.deviceId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
  }

  goToDetails(view?: MerakiDeviceViewData) {
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.MERAKI_DEVICE, configured: true }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.deviceId, 'zbx', 'details'], { relativeTo: this.route });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
