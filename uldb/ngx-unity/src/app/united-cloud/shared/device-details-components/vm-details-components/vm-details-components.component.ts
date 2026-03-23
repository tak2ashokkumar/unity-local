import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FileViewData, InterfaceViewData, MacViewData, ProcessorViewData, ProductViewData, ServerViewData, VmDetailsComponentsService } from './vm-details-components.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { DeviceTabData } from '../../device-tab/device-tab.component';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'vm-details-components',
  templateUrl: './vm-details-components.component.html',
  styleUrls: ['./vm-details-components.component.scss'],
  providers: [VmDetailsComponentsService]
})
export class VmDetailsComponentsComponent implements OnInit, OnDestroy {
  @Input() activeTabId: string;
  @Input() deviceType: DeviceMapping;
  @Input() deviceId: string;
  private ngUnsubscribe = new Subject();

  ipAddressForm: FormGroup;
  operatingSystemForm: FormGroup;
  interfaceViewData: InterfaceViewData[] = [];
  macViewData: MacViewData[] = [];
  processorViewData: ProcessorViewData[] = [];
  productViewData: ProductViewData[] = [];
  fileViewData: FileViewData[] = [];
  serverViewData: ServerViewData[] = [];

  interfaceCount: number = 0;
  macAddressCount: number = 0;
  processorCount: number = 0;
  productCount: number = 0;
  fileDetailsCount: number = 0;
  serverDetailsCount: number = 0;


  device: DeviceTabData = { name: '', deviceType: null };

  currentCriteria: SearchCriteria;
  interfaceCurrentCriteria: SearchCriteria;

  viewData: any;

  constructor(private svc: VmDetailsComponentsService,
    private spinner: AppSpinnerService,
    private storageService: StorageService,
    private refreshService: DataRefreshBtnService) {
    this.interfaceCurrentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      setTimeout(() => {
        this.manageApiCallBasedOnActiveTabId(this.activeTabId);
      }, 10);
    });
  }

  ngOnInit(): void {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
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
      case 'ip_address':
        this.getIpAddresses();
        break;
      case 'mac_address':
        this.getMacAddress();
        break;
      case 'cpu_processor':
        this.getCpuProcessor();
        break;
      case 'interface':
        this.getInterfaceDetails();
        break;
      case 'product':
        this.getProductDetails();
        break;
      case 'file_system':
        this.getFileSystemDetails();
        break;
      case 'os':
        this.getOsDetails();
        break;
      case 'software_server':
        this.getServerDetails();
        break;
      // case 'operationSystem':
      //   this.getOperationSystemData();
      //   break;
      default:
        break;
    }
  }

  // switchView(data: TabDirective): void {
  //   // if (this.view == data.id) {
  //   //   return;
  //   // } else {
  //   //   setTimeout(() => {
  //   //     this.view = data.id;
  //   //     this.currentCriteria.pageNo = 1;
  //   //     this.hypervisorCurrentCriteria.pageNo = 1;
  //   //     this.databaseCurrentCriteria.pageNo = 1;
  //   //     if (this.view == 'events' && this.eventsFilterForm.getRawValue().period != this.eventsTimeRange.LAST_24_HOURS) {
  //   //       this.buildEventsFilterForm();
  //   //     } else if (this.view == 'tasks' && this.tasksFilterForm.getRawValue().period != this.tasksTimeRange.LAST_24_HOURS) {
  //   //       this.buildTasksFilterForm();
  //   //     }
  //   //   }, 10)
  //   // }
  //   if (data.id == 'ip_address') {
  //     this.getIpAddresses();
  //   }
  //   if (data.id == 'interface') {
  //     this.getInterfaceDetails();
  //   }
  //   if (data.id == 'mac_address') {
  //     this.getMacAddress();
  //   }
  //   if (data.id == 'cpu_processor') {
  //     this.getCpuProcessor();
  //   }
  //   if (data.id == 'product') {
  //     this.getProductDetails();
  //   }
  //   if (data.id == 'file_system') {
  //     this.getFileSystemDetails();
  //   }
  //   if (data.id == 'os') {
  //     this.getOsDetails();
  //   }
  //   if (data.id == 'software_server') {
  //     this.getServerDetails();
  //   }

  //   // if (data.id == 'Batteries') {
  //   //   this.getBatteries();
  //   // }
  //   // if (data.id == 'databases') {
  //   //   this.getDatabasesList();
  //   //   this.getDeviceBulkEditFields();
  //   // }
  // }

  getIpAddresses() {
    this.spinner.start('ipaddressSpinner');
    this.svc.getIpAddresses(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ipAddressForm = this.svc.buildIPAddressForm(res);
      this.spinner.stop('ipaddressSpinner');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('ipaddressSpinner');
    })
  }

  getOsDetails() {
    this.spinner.start('OsSpinner');
    this.svc.getOsDetails(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.operatingSystemForm = this.svc.buildOSForm(res);
      this.spinner.stop('OsSpinner');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('OsSpinner');
    })
  }

  getInterfaceDetails() {
    this.spinner.start('interfaceSpinner');
    this.svc.getInterfaceDetails(this.deviceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.interfaceCount = res.count;
      this.interfaceViewData = this.svc.convertToInterfaceViewData(res.results);
      this.spinner.stop('interfaceSpinner');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('interfaceSpinner');
    })
  }

  getMacAddress() {
    this.spinner.start('macAddressSpinner');
    this.svc.getMacAddress(this.deviceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.macAddressCount = res.count;
      this.macViewData = this.svc.convertToMacViewData(res.results);
      this.spinner.stop('macAddressSpinner');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('macAddressSpinner');
    })
  }

  getCpuProcessor() {
    this.spinner.start('processorSpinner');
    this.svc.getCpuProcessor(this.deviceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.processorCount = res.count;
      this.processorViewData = this.svc.convertToProcessorViewData(res.results);
      this.spinner.stop('processorSpinner');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('processorSpinner');
    })
  }

  getProductDetails() {
    this.spinner.start('productSpinner');
    this.svc.getProductDetails(this.deviceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.productCount = res.count;
      this.productViewData = this.svc.convertToProductViewData(res.results);
      this.spinner.stop('productSpinner');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('productSpinner');
    })
  }

  getFileSystemDetails() {
    this.spinner.start('fileSystemSpinner');
    this.svc.getFileSystemDetails(this.deviceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.fileDetailsCount = res.count;
      this.fileViewData = this.svc.convertToFileViewData(res.results);
      this.spinner.stop('fileSystemSpinner');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('fileSystemSpinner');
    })
  }

  getServerDetails() {
    this.spinner.start('serverSpinner');
    this.svc.getServerDetails(this.deviceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.serverDetailsCount = res.count;
      this.serverViewData = this.svc.convertToServerViewData(res.results);
      this.spinner.stop('serverSpinner');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('serverSpinner');
    })
  }

}
