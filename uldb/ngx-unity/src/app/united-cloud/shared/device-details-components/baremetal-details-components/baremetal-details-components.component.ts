import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BaremetalDetailsComponentsService, CpuProcessorsViewData, FileSystemViewData, InterfaceViewData, MacAddressViewData, ProductViewData, SoftwareServerViewData } from './baremetal-details-components.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

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

  ipAddressForm: FormGroup;
  operationSystemForm: FormGroup;

  currentCriteria: SearchCriteria;
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
  softwareServerCount: number = 0;
  softwareServerViewData: SoftwareServerViewData[] = [];

  constructor(private svc: BaremetalDetailsComponentsService,
    private spinner: AppSpinnerService,
    private refreshService: DataRefreshBtnService) {
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
      case 'operationSystem':
        this.getOperationSystemData();
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
      this.ipAddressForm = this.svc.buildIpAddressForm(res);
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

  getOperationSystemData() {
    this.spinner.start('operationSystemSpinner');
    this.svc.getOperationSystemData(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.operationSystemForm = this.svc.buildOperationSystemForm(res);
      this.spinner.stop('operationSystemSpinner');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('operationSystemSpinner');
    })
  }
}
