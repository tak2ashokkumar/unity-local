import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { InterfaceViewData, MacAddressViewData, StorageDetailsComponentsService } from './storage-details-components.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'storage-details-components',
  templateUrl: './storage-details-components.component.html',
  styleUrls: ['./storage-details-components.component.scss'],
  providers: [StorageDetailsComponentsService]
})
export class StorageDetailsComponentsComponent implements OnInit, OnDestroy {
  @Input() activeTabId: string;
  @Input() deviceType: DeviceMapping;
  @Input() deviceId: string;
  private ngUnsubscribe = new Subject();

  ipAddressForm: FormGroup;
  operationSystemForm: FormGroup;

  currentCriteria: SearchCriteria;
  interfacesCount: number = 0;
  interfaceViewData: InterfaceViewData[] = [];
  macAddressCount: number = 0;
  macAddressViewData: MacAddressViewData[] = [];

  constructor(private svc: StorageDetailsComponentsService,
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
      case 'interface':
        this.getInterfaceData();
        break;
      case 'operationSystem':
        this.getOperationSystemData();
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
