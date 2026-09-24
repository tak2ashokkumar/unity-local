import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { combineLatest, from, Subject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { DatacenterDeviceActionsService } from './datacenter-device-actions.service';
import { DatacenterDevicesService } from './datacenter-devices.service';
import { DatacenterDeviceAction, DatacenterDeviceListingColumn, DatacenterDeviceListingConfig, DatacenterDeviceListingResponse } from './datacenter-devices.type';

@Component({
  selector: 'datacenter-devices',
  templateUrl: './datacenter-devices.component.html',
  styleUrls: ['./datacenter-devices.component.scss'],
  providers: [DatacenterDevicesService, DatacenterDeviceActionsService]
})
export class DatacenterDevicesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private dcId: string;
  private currentConfig: DatacenterDeviceListingConfig;
  deviceType: string;
  title: string = 'Devices';
  viewData: any[] = [];
  columns: DatacenterDeviceListingColumn[] = [];
  actions: DatacenterDeviceAction[] = [];
  count: number = 0;
  currentCriteria: SearchCriteria = {
    sortColumn: '',
    sortDirection: '',
    searchValue: '',
    pageNo: 1,
    pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE
  };

  constructor(private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private utilService: AppUtilityService,
    private datacenterDevicesService: DatacenterDevicesService,
    private deviceActionsService: DatacenterDeviceActionsService) { }

  ngOnInit() {
    combineLatest([this.route.parent.paramMap, this.route.paramMap]).pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap[]) => {
      this.dcId = params[0].get('dcId');
      this.deviceType = params[1].get('deviceType');
      this.currentCriteria.pageNo = 1;
      this.loadDevices();
    });
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.loadDevices();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.loadDevices();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.loadDevices();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.loadDevices();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.loadDevices();
  }

  loadDevices() {
    if (!this.dcId || !this.deviceType) {
      return;
    }
    const config: DatacenterDeviceListingConfig = this.datacenterDevicesService.getConfig(this.deviceType);
    if (!config) {
      this.title = 'Devices';
      this.viewData = [];
      this.columns = [];
      this.actions = [];
      this.count = 0;
      return;
    }
    this.currentConfig = config;
    this.title = config.title;
    this.columns = config.columns;
    this.actions = config.actions;
    this.spinnerService.start('main');
    this.datacenterDevicesService.getDevices(this.dcId, this.deviceType, this.currentCriteria)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res: DatacenterDeviceListingResponse | any[]) => {
        this.setViewData(res);
        this.spinnerService.stop('main');
        this.getDeviceData();
      }, err => {
        this.viewData = [];
        this.columns = [];
        this.count = 0;
        this.spinnerService.stop('main');
      });
  }

  private setViewData(res: DatacenterDeviceListingResponse | any[]) {
    if (Array.isArray(res)) {
      this.viewData = this.datacenterDevicesService.convertToViewData(this.deviceType, res);
      this.count = res.length;
    } else {
      const data = res as PaginatedResult<any>;
      this.viewData = this.datacenterDevicesService.convertToViewData(this.deviceType, data.results ? data.results : []);
      this.count = data.count || this.viewData.length;
    }
  }

  private getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((row: any) => this.datacenterDevicesService.getDeviceData(this.deviceType, row)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { }, err => { });
  }

  getColumnValue(row: any, column: DatacenterDeviceListingColumn): string {
    const value = this.getValueByKeys(row, column.keys);
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    if (Array.isArray(value)) {
      return this.getArrayValue(value);
    }
    if (typeof value === 'object') {
      return value.name || value.display_name || value.uuid || JSON.stringify(value);
    }
    return value.toString();
  }

  onAction(action: DatacenterDeviceAction, row: any) {
    if (this.isActionDisabled(action, row)) {
      return;
    }
    this.deviceActionsService.run(action.type, this.dcId, this.deviceType, row, this.currentConfig);
  }

  onCrud(event: CRUDActionTypes) {
    this.currentCriteria.pageNo = event == CRUDActionTypes.ADD ? 1 : this.currentCriteria.pageNo;
    this.loadDevices();
  }

  isActionDisabled(action: DatacenterDeviceAction, row: any): boolean {
    return this.deviceActionsService.isDisabled(action.type, row);
  }

  getActionTooltip(action: DatacenterDeviceAction, row: any): string {
    return this.deviceActionsService.getTooltip(action.type, row, action.tooltip);
  }

  getTags(row: any, column: DatacenterDeviceListingColumn): any[] {
    const value = this.getValueByKeys(row, column.keys);
    return Array.isArray(value) ? value.filter((item: any) => item) : [];
  }

  getStatusValue(row: any, column: DatacenterDeviceListingColumn): string {
    const value = this.getValueByKeys(row, column.keys);
    if (value === null || value === undefined || value === '') {
      return 'Not Configured';
    }
    if (value === 'Up' || value === 'Down' || value === 'Unknown' || value === 'Monitoring Disabled' || value === 'Not Configured') {
      return value;
    }
    return this.utilService.getDeviceStatus(value) || value.toString();
  }

  getTagLabel(tag: any): string {
    if (tag === null || tag === undefined || tag === '') {
      return 'N/A';
    }
    if (typeof tag === 'object') {
      return tag.name || tag.display_name || tag.uuid || JSON.stringify(tag);
    }
    return tag.toString();
  }

  private getValueByKeys(row: any, keys: string[]): any {
    for (let i = 0; i < keys.length; i++) {
      const value = this.getValueByPath(row, keys[i]);
      if (value !== null && value !== undefined && value !== '') {
        return value;
      }
    }
    return null;
  }

  private getValueByPath(row: any, path: string): any {
    return path.split('.').reduce((value: any, key: string) => value ? value[key] : null, row);
  }

  private getArrayValue(value: any[]): string {
    if (!value.length) {
      return 'N/A';
    }
    if (typeof value[0] === 'object') {
      return value.map((item: any) => item.name || item.display_name || item.uuid).filter((item: any) => item).join(', ') || `${value.length}`;
    }
    return value.join(', ');
  }
}
