import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { NetworkDeviceHWComponentsViewData, NetworkDeviceIPAddressViewData, NetworkDeviceInterfacesViewData, NetworkDeviceMacAddressViewData, NetworkDeviceOSViewData, NetworkDevicesDetailsComponentsService } from './network-devices-details-components.service';
import { NetworkDevicesDetailsComponents } from './network-devices-details-components.type';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { DeviceInterfaceCrudService } from 'src/app/app-shared-crud/device-interface-crud/device-interface-crud.service';
import { RemoteDevicesType } from 'src/app/shared/SharedEntityTypes/device-interface.type';
import { Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

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
    private refreshService: DataRefreshBtnService,
    private interfaceCrudSvc: DeviceInterfaceCrudService,
    private utilSvc: AppUtilityService,
    private router: Router,
    private storage: StorageService) {
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

  goToTargetDeviceDetails(remoteDevice: RemoteDevicesType): void {
    if (!remoteDevice.target_device_type || !remoteDevice.target_device_uuid) {
      return;
    }
    const deviceMapping = this.utilSvc.getDeviceMappingByDeviceType(remoteDevice.target_device_type);
    const isMonitoringConfigured: boolean = remoteDevice.target_device_monitoring?.configured;
    const baseURL = this.utilSvc.getDeviceBaseURL(remoteDevice);
    const url = `/${remoteDevice.target_device_uuid}/zbx/details/`;

    this.router.navigateByUrl(baseURL, { skipLocationChange: true }).then(() => {
      if (baseURL.includes('devices') || baseURL.includes('datacenter')) {
        if (deviceMapping === DeviceMapping.DB_SERVER) {
          this.storage.put('device', { name: remoteDevice.target_device, deviceType: deviceMapping, configured: isMonitoringConfigured, monitoringEnabled: remoteDevice.target_device_monitoring.enabled }, StorageType.SESSIONSTORAGE);
        } else if (deviceMapping === DeviceMapping.BARE_METAL_SERVER) {
          this.storage.put('device', { name: remoteDevice.target_device, deviceType: deviceMapping, configured: isMonitoringConfigured, uuid: remoteDevice.target_device_uuid }, StorageType.SESSIONSTORAGE);
        } else {
          this.storage.put('device', { name: remoteDevice.target_device, deviceType: deviceMapping, configured: isMonitoringConfigured }, StorageType.SESSIONSTORAGE);
          if (deviceMapping === DeviceMapping.MERAKI_DEVICE) {
            this.storage.put('meraki', { name: remoteDevice.target_account_name, deviceType: DeviceMapping.MERAKI_ACCOUNT }, StorageType.SESSIONSTORAGE);
            this.storage.put('merakiOrganization', { name: remoteDevice.target_organization_name, deviceType: DeviceMapping.MERAKI_ORG }, StorageType.SESSIONSTORAGE);
          } else if (deviceMapping === DeviceMapping.VIPTELA_DEVICE) {
            this.storage.put('viptela', { name: remoteDevice.target_account_name, deviceType: DeviceMapping.VIPTELA_ACCOUNT }, StorageType.SESSIONSTORAGE);
          }
        }
      }
      this.router.navigate([`${baseURL}${url}`]);
    });
  }

  getTooltipMsgForAddTargetDevice(inf: NetworkDeviceInterfacesViewData): string {
    if (!inf.name && !inf.description) {
      return 'Interface Name and Description are required';
    } else if (!inf.name) {
      return 'Interface Name is required';
    } else if (!inf.description) {
      return 'Interface Description is required';
    }
    return 'Add Target Device';
  }

  addTargetDevice(inf: NetworkDeviceInterfacesViewData): void {
    this.interfaceCrudSvc.addTargetDeviceForInterface({ uuid: this.deviceId, deviceType: this.deviceType, interfaceUuid: inf.tokenId, name: inf.name, description: inf.description });
  }

  onCrud(event: { type: CRUDActionTypes }): void {
    if (event.type === CRUDActionTypes.ADD) {
      this.getInterfaceData();
    }
  }
}
