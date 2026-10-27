import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BaremetalDetailsComponentsService, CpuProcessorsViewData, FileSystemViewData, InterfaceViewData, IpAddressViewData, MacAddressViewData, OSViewData, ProductViewData, SoftwareServerViewData } from './baremetal-details-components.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AppUtilityService, CRUDActionTypes, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { DeviceInterfaceCrudService } from 'src/app/app-shared-crud/device-interface-crud/device-interface-crud.service';
import { RemoteDevicesType } from 'src/app/shared/SharedEntityTypes/device-interface.type';
import { Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'baremetal-details-components',
  templateUrl: './baremetal-details-components.component.html',
  styleUrls: ['./baremetal-details-components.component.scss'],
  providers: [BaremetalDetailsComponentsService]
})
export class BaremetalDetailsComponentsComponent implements OnInit, OnDestroy {
  @Input() activeTabId: string;
  @Input() deviceType: DeviceMapping;
  @Input() deviceId: string;
  private ngUnsubscribe = new Subject();


  currentCriteria: SearchCriteria;
  ipAddressViewData: IpAddressViewData[] = [];
  macAddressCount: number = 0;
  macAddressViewData: MacAddressViewData[] = [];
  cpuProcessorsCount: number = 0;
  cpuProcessorsViewData: CpuProcessorsViewData[] = [];
  interfacesCount: number = 0;
  interfaceViewData: InterfaceViewData[] = [];
  productCount: number = 0;
  productViewData: ProductViewData[] = [];
  fileSystemCount: number = 0;
  fileSystemViewData: FileSystemViewData[] = [];
  operationSystemViewData: OSViewData[] = [];
  softwareServerCount: number = 0;
  softwareServerViewData: SoftwareServerViewData[] = [];

  constructor(private svc: BaremetalDetailsComponentsService,
    private spinner: AppSpinnerService,
    private refreshService: DataRefreshBtnService,
    private interfaceCrudSvc: DeviceInterfaceCrudService,
    private utilSvc: AppUtilityService,
    private router: Router,
    private storage: StorageService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}] };
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
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  manageApiCallBasedOnActiveTabId(activeTabId: string): void {
    switch (activeTabId) {
      case 'ipAddress':
        this.getIpAddressData();
        break;
      case 'macAddress':
        this.getMacAddressData();
        break;
      case 'cpuProcessors':
        this.getCpuProcessorsData();
        break;
      case 'interface':
        this.getInterfaceData();
        break;
      case 'product':
        this.getProductData();
        break;
      case 'fileSystem':
        this.getFileSystemData();
        break;
      case 'os':
        this.getOSData();
        break;
      case 'softwareServer':
        this.getSoftwareServerData();
        break;
      default:
        break;
    }
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.manageApiCallBasedOnActiveTabId(this.activeTabId);
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.currentCriteria.pageNo = pageNo;
      this.manageApiCallBasedOnActiveTabId(this.activeTabId);
    }
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.manageApiCallBasedOnActiveTabId(this.activeTabId);
  }

  getIpAddressData() {
    this.spinner.start('ipaddressSpinner');
    this.svc.getIpAddressData(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ipAddressViewData = this.svc.convertToIPAddressViewData(res);
      this.spinner.stop('ipaddressSpinner');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('ipaddressSpinner');
    })
  }

  getMacAddressData() {
    this.spinner.start('macAddressSpinner');
    this.svc.getMacAddressData(this.currentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.macAddressCount = res.count;
      this.macAddressViewData = this.svc.convertToMacAddressViewData(res.results);
      this.spinner.stop('macAddressSpinner');
    }, (err: HttpErrorResponse) => {
      this.macAddressCount = 0;
      this.macAddressViewData = [];
      this.spinner.stop('macAddressSpinner');
    })
  }

  getCpuProcessorsData() {
    this.spinner.start('cpuProcessorsSpinner');
    this.svc.getCpuProcessorsData(this.currentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cpuProcessorsCount = res.count;
      this.cpuProcessorsViewData = this.svc.convertToCpuProcessorsViewData(res.results);
      this.spinner.stop('cpuProcessorsSpinner');
    }, (err: HttpErrorResponse) => {
      this.cpuProcessorsCount = 0;
      this.cpuProcessorsViewData = [];
      this.spinner.stop('cpuProcessorsSpinner');
    })
  }

  getInterfaceData() {
    this.spinner.start('interfaceSpinner');
    this.svc.getInterfaceData(this.currentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.interfacesCount = res.count;
      this.interfaceViewData = this.svc.convertToInterfaceViewData(res.results);
      this.spinner.stop('interfaceSpinner');
    }, (err: HttpErrorResponse) => {
      this.interfacesCount = 0;
      this.interfaceViewData = [];
      this.spinner.stop('interfaceSpinner');
    })
  }

  getProductData() {
    this.spinner.start('productSpinner');
    this.svc.getProductData(this.currentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.productCount = res.count;
      this.productViewData = this.svc.convertToProductViewData(res.results);
      this.spinner.stop('productSpinner');
    }, (err: HttpErrorResponse) => {
      this.productCount = 0;
      this.productViewData = [];
      this.spinner.stop('productSpinner');
    })
  }

  getFileSystemData() {
    this.spinner.start('fileSystemSpinner');
    this.svc.getFileSystemData(this.currentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.fileSystemCount = res.count;
      this.fileSystemViewData = this.svc.convertToFileSystemViewData(res.results);
      this.spinner.stop('fileSystemSpinner');
    }, (err: HttpErrorResponse) => {
      this.fileSystemCount = 0;
      this.fileSystemViewData = [];
      this.spinner.stop('fileSystemSpinner');
    })
  }

  getSoftwareServerData() {
    this.spinner.start('softwareServerSpinner');
    this.svc.getSoftwareServerData(this.currentCriteria, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.softwareServerCount = res.count;
      this.softwareServerViewData = this.svc.convertToSoftwareServerViewData(res.results);
      this.spinner.stop('softwareServerSpinner');
    }, (err: HttpErrorResponse) => {
      this.softwareServerCount = 0;
      this.softwareServerViewData = [];
      this.spinner.stop('softwareServerSpinner');
    })
  }

  getOSData() {
    this.spinner.start('operationSystemSpinner');
    this.svc.getOSData(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.operationSystemViewData = this.svc.convertToOSViewData(res);
      this.spinner.stop('operationSystemSpinner');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('operationSystemSpinner');
    })
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

  getTooltipMsgForAddTargetDevice(inf: InterfaceViewData): string {
    if (!inf.name && !inf.description) {
      return 'Interface Name and Description are required';
    } else if (!inf.name) {
      return 'Interface Name is required';
    } else if (!inf.description) {
      return 'Interface Description is required';
    }
    return 'Add Target Device';
  }

  addTargetDevice(inf: InterfaceViewData): void {
    this.interfaceCrudSvc.addTargetDeviceForInterface({ uuid: this.deviceId, deviceType: this.deviceType, interfaceUuid: inf.tokenId, name: inf.name, description: inf.description });
  }

  onCrud(event: { type: CRUDActionTypes }): void {
    if (event.type === CRUDActionTypes.ADD) {
      this.getInterfaceData();
    }
  }
}
