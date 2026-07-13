import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { NetworkDeviceHWComponentsViewData, NetworkDeviceIPAddressViewData, NetworkDeviceInterfacesViewData, NetworkDeviceMacAddressViewData, NetworkDeviceOSViewData, NetworkDevicesDetailsComponentsService } from './network-devices-details-components.service';
import { NetworkDevicesDetailsComponents } from './network-devices-details-components.type';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'network-devices-details-components',
  templateUrl: './network-devices-details-components.component.html',
  styleUrls: ['./network-devices-details-components.component.scss'],
  providers: [NetworkDevicesDetailsComponentsService]
})
export class NetworkDevicesDetailsComponentsComponent implements OnInit, OnDestroy {
  @Input() activeTabId: string;
  @Input() deviceType: DeviceMapping;
  @Input() deviceId: string;
  private ngUnsubscribe = new Subject();

  currentCriteria: SearchCriteria;
  viewData: NetworkDevicesDetailsComponents;

  count: number = 0;
  ipAddressViewData: NetworkDeviceIPAddressViewData[] = [];
  macAddressViewData: NetworkDeviceMacAddressViewData[] = [];
  interfaceViewData: NetworkDeviceInterfacesViewData[] = [];
  hardwareViewData: NetworkDeviceHWComponentsViewData[] = [];
  osViewData: NetworkDeviceOSViewData[] = [];

  constructor(private svc: NetworkDevicesDetailsComponentsService,
    private spinner: AppSpinnerService,
    private refreshService: DataRefreshBtnService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      setTimeout(() => {
        this.manageApiCallBasedOnActiveTabId(this.activeTabId);
      }, 10);
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.manageApiCallBasedOnActiveTabId(this.activeTabId);
    }, 10);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  reset() {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  getIpAddressData() {
    this.spinner.start('ipAddressSpinner');
    this.svc.getIpAddressData(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.ipAddressViewData = this.svc.convertToIPAddressViewData(data);
      this.spinner.stop('ipAddressSpinner');
    }, err => {
      this.spinner.stop('ipAddressSpinner');
    })
  }

  getMacAddressData() {
    this.spinner.start('macAddressSpinner');
    this.macAddressViewData = [];
    this.count = 0;
    this.svc.getMacAddressData(this.deviceType, this.deviceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count ? data.count : 0;
      this.macAddressViewData = this.svc.convertToMacAddressViewData(data.results);
      this.spinner.stop('macAddressSpinner');
    }, err => {
      this.spinner.stop('macAddressSpinner');
    })
  }

  getInterfaceData() {
    this.spinner.start('interfaceSpinner');
    this.interfaceViewData = [];
    this.count = 0;
    this.svc.getInterfaceData(this.deviceType, this.deviceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count ? data.count : 0;
      this.interfaceViewData = this.svc.convertToInterfaceViewData(data.results);
      this.spinner.stop('interfaceSpinner');
    }, err => {
      this.spinner.stop('interfaceSpinner');
    })
  }

  getOSData() {
    this.spinner.start('osSpinner');
    this.svc.getOSData(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.osViewData = this.svc.convertToOSViewData(data);
      this.spinner.stop('osSpinner');
    }, err => {
      this.spinner.stop('osSpinner');
    })
  }

  getHardwareComponentsData() {
    this.spinner.start('hardwareSpinner');
    this.hardwareViewData = [];
    this.svc.getHardwareComponentsData(this.deviceType, this.deviceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count ? data.count : 0;
      this.hardwareViewData = this.svc.convertToHWComponentsViewData(data.results)
      this.spinner.stop('hardwareSpinner');
    }, err => {
      this.spinner.stop('hardwareSpinner');
    })
  }

  manageApiCallBasedOnActiveTabId(activeTabId: string): void {
    switch (activeTabId) {
      case 'ipAddress':
        this.getIpAddressData();
        break;
      case 'macAddress':
        this.getMacAddressData();
        break;
      case 'interface':
        this.getInterfaceData();
        break;
      case 'os':
        this.getOSData();
        break;
      case 'hardwareComponents':
        this.getHardwareComponentsData();
        break;
      default:
        this.getIpAddressData();
        break;
    }
  }
}
