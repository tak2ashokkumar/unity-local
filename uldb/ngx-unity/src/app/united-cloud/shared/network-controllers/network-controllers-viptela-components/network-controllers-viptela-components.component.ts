import { Component, OnDestroy, OnInit } from '@angular/core';
import { NetworkControllersViptelaComponentsService, statusList, ViptelaDeviceViewData } from './network-controllers-viptela-components.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { from, Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { NetworkControllerType } from '../network-controllers.service';
import { DeviceTabData } from '../../device-tab/device-tab.component';

@Component({
  selector: 'network-controllers-viptela-components',
  templateUrl: './network-controllers-viptela-components.component.html',
  styleUrls: ['./network-controllers-viptela-components.component.scss'],
  providers: [NetworkControllersViptelaComponentsService]
})
export class NetworkControllersViptelaComponentsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  currentCriteria: SearchCriteria;
  viptelaData: DeviceTabData;
  count: number;
  viewData: ViptelaDeviceViewData[] = [];
  controllerId: string;
  statusList = statusList;
  syncStatus: boolean = false;
  deviceTypeList: string[] = [];

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

  deviceTypeSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  deviceTypeTexts: IMultiSelectTexts = {
    defaultTitle: 'Device Type',
  };

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: NetworkControllersViptelaComponentsService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storageService: StorageService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.controllerId = params.get('controllerId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { 'status': [], 'device_type': [] } };
    })
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.viptelaData = <DeviceTabData>this.storageService.getByKey('viptela', StorageType.SESSIONSTORAGE);
    this.getViptelaDeviceTypes();
    this.getViptelaDevices();
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
    this.getViptelaDevices();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getViptelaDevices();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getViptelaDevices();
  }

  refreshData($event: SearchCriteria) {
    this.spinner.start('main');
    this.getViptelaDevices();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getViptelaDevices();
  }

  getViptelaDeviceTypes() {
    this.svc.getViptelaDeviceTypes(this.controllerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: string[]) => {
      this.deviceTypeList = res;
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }

  getViptelaDevices() {
    this.svc.getViptelaDevices(this.controllerId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
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
      this.getViptelaDevices();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Viptela Devices could not be Synced!!'));
    });
  }

  goToStats(view: ViptelaDeviceViewData) {
    if (!view.monitoring?.configured) {
      return;
    }
    this.storageService.put('device', { name: view.hostname, deviceType: DeviceMapping.VIPTELA_DEVICE, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.deviceId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
  }

  goToDetails(view: ViptelaDeviceViewData) {
    this.storageService.put('device', { name: view.hostname, deviceType: DeviceMapping.VIPTELA_DEVICE, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.deviceId, 'zbx', 'details'], { relativeTo: this.route });
  }

  getProgressClass(resource: number): string {
    return resource < 65 ? 'bg-success' : resource >= 65 && resource < 85 ? 'bg-warning' : 'bg-danger';
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
