import { Component, OnDestroy, OnInit } from '@angular/core';
import { SdwanDeviceDetailsViewData, SdwansDetailsService, statusList } from './sdwans-details.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { from, Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppLevelService } from 'src/app/app-level.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'sdwans-details',
  templateUrl: './sdwans-details.component.html',
  styleUrls: ['./sdwans-details.component.scss'],
  providers: [SdwansDetailsService]
})
export class SdwansDetailsComponent implements OnInit, OnDestroy {
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  viewData: SdwanDeviceDetailsViewData[] = [];
  count: number;
  sdwanId: string;
  statusList = statusList;
  syncStatus: boolean = false;

  StatusSettings: IMultiSelectSettings = {
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

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: SdwansDetailsService,
    private spinner: AppSpinnerService,
    private appService: AppLevelService,
    private notification: AppNotificationService,
    private ticketService: SharedCreateTicketService,
    private termService: FloatingTerminalService,
    private storageService: StorageService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { 'status': [] } };
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.sdwanId = params.get('sdwanId');
    })
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getSdWanDevices();
    this.callSyncApi();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getSdWanDevices();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getSdWanDevices();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getSdWanDevices();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getSdWanDevices();
  }

  refreshData($event: SearchCriteria) {
    this.spinner.start('main');
    this.getSdWanDevices();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getSdWanDevices();
  }

  getSdWanDevices() {
    this.svc.getSdWanDeviceDetails(this.sdwanId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.getDeviceData();
      this.spinner.stop('main');
    }, err => {
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
      this.spinner.start('main');
      this.getSdWanDevices();
    }, err => {
      this.notification.error(new Notification('Sdwan Devices could not be Synced!!'));
    });
  }

  goToStats(view: SdwanDeviceDetailsViewData) {
    if (!view.monitoring.configured) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', {
      name: view.hostname, deviceType: DeviceMapping.SDWAN_DEVICES,
      configured: view.monitoring.configured
    }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.uuid, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.SDWAN_DEVICES }, StorageType.SESSIONSTORAGE)
  }

  viewDeviceDetials(view?: SdwanDeviceDetailsViewData) {
    this.storageService.put('device', {
      name: view.hostname, deviceType: DeviceMapping.SDWAN_DEVICES,
      configured: view.monitoring.configured
    }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.uuid, 'zbx', 'details'], { relativeTo: this.route });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  getProgressClass(resource: number): string {
    return resource < 65 ? 'bg-success' : resource >= 65 && resource < 85 ? 'bg-warning' : 'bg-danger';
  }

}
