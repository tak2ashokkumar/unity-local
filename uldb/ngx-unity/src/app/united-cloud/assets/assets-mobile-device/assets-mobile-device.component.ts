import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject, interval } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CRUDActionTypes, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { MOBILE_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { DeviceZabbixEmailNotificationService } from 'src/app/shared/device-zabbix-email-notification/device-zabbix-email-notification.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { AssetsMobileDeviceCrudService } from './assets-mobile-device-crud/assets-mobile-device-crud.service';
import { AssetsMobileDeviceService, MobileViewData } from './assets-mobile-device.service';


@Component({
  selector: 'assets-mobile-device',
  templateUrl: './assets-mobile-device.component.html',
  styleUrls: ['./assets-mobile-device.component.scss'],
  providers: [AssetsMobileDeviceService]
})
export class AssetsMobileDeviceComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  private pcId: string;
  count: number;
  viewData: MobileViewData[] = [];
  currentCriteria: SearchCriteria;
  private inDevicesPage: boolean;
  addMobileEnabled: boolean;
  poll: boolean = false;

  constructor(private mobileService: AssetsMobileDeviceService,
    private crudService: AssetsMobileDeviceCrudService,
    private zabbixAlertConfig: DeviceZabbixEmailNotificationService,
    private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private ticketService: SharedCreateTicketService,
    private termService: FloatingTerminalService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.inDevicesPage = this.pcId ? false : true;
      this.addMobileEnabled = this.pcId ? false : true;
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'uuid': this.pcId }] };
    });

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getMobile());
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getMobile();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  get isCrudEnabled() {
    return this.inDevicesPage;
  }

  get showDevicesColumns() {
    return this.inDevicesPage;
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getMobile();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getMobile();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getMobile();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getMobile();
  }

  onCrud(event: CRUDActionTypes) {
    if (event == CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinnerService.start('main');
      if (event == CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getMobile();
    }
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getMobile();
  }

  getMobile() {
    this.mobileService.getMobiles(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.mobileService.converToViewData(data.results);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  downlaodList() {
    this.spinnerService.start('main');
    this.mobileService.downloadDevicesReport().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      let ele = document.getElementById('file-downloader');
      ele.setAttribute('href', this.mobileService.getDevicesReport(data.data));
      ele.click();
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Devices report downloaded successfully.'));
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Failed to download devices report. Try again later.'));
    });
  }

  createTicket(view: MobileViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.MOBILE_DEVICE, view.name),
      metadata: MOBILE_TICKET_METADATA(DeviceMapping.MOBILE_DEVICE, view.name, view.ipAddress, view.model, view.platform, view.deviceType)
    });
  }

  addMobile() {
    this.crudService.addOrEditMobile(null);
  }

  notifyMobile(deviceId: string) {
    this.zabbixAlertConfig.notify(deviceId, DeviceMapping.MOBILE_DEVICE);
  }

  editMobile(deviceId: string) {
    this.crudService.addOrEditMobile(deviceId);
  }

  deleteMobile(deviceId: string) {
    this.crudService.deleteMobile(deviceId);
  }

  consoleNewTab(deviceId: string, index: number) {
    // if (!this.viewData[index].isNewTabEnabled) {
    //   return;
    // }
    // let obj: ConsoleAccessInput = this.bmService.getConsoleAccessInput(this.viewData[index]);
    // obj.newTab = true;
    // this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    window.open(`http://207.7.135.69:9020/`);
  }
}
