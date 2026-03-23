import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, from, interval } from 'rxjs';
import { mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping, TICKET_TYPE } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { DEVICE_WEB_ACCESS_SUBJECT, SWITCH_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { DeviceZabbixEmailNotificationService } from 'src/app/shared/device-zabbix-email-notification/device-zabbix-email-notification.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { DevicePopoverData } from '../devices-popover/device-popover-data';
import { Firewall } from '../entities/firewall.type';
import { FirewallCrudService } from './firewalls-crud/firewalls-crud.service';
import { FirewallViewData, FirewallsService } from './firewalls.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';


@Component({
  selector: 'firewalls',
  templateUrl: './firewalls.component.html',
  styleUrls: ['./firewalls.component.scss']
})
export class FirewallsComponent implements OnInit, OnDestroy {
  popData: DevicePopoverData;
  private pcId: string;
  viewData: FirewallViewData[] = [];
  count: number;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  inDevicesPage: boolean;
  poll: boolean = false;
  selectedFirewallIds: string[] = [];
  modalRef: BsModalRef;
  @ViewChild('bulkDeleteModel') bulkDeleteModel: ElementRef;
  selectedAll: boolean = false;
  @ViewChild('bulkEditModel') bulkEditModel: ElementRef;
  fields: BulkUpdateFieldType[] = [];


  constructor(private router: Router,
    private route: ActivatedRoute,
    private firewallService: FirewallsService,
    private spinnerService: AppSpinnerService,
    private appService: AppLevelService,
    private storageService: StorageService,
    private crudService: FirewallCrudService,
    private zabbixAlertConfig: DeviceZabbixEmailNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService,
    private ticketService: SharedCreateTicketService,
    private termService: FloatingTerminalService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.inDevicesPage = this.pcId ? false : true;
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'uuid': this.pcId }] };
    });

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getFirewalls());
  }

  ngOnInit() {
    this.loadCriteria();
    this.spinnerService.start('main');
    this.getDeviceBulkEditFields();
    this.getFirewalls();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.extractByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.FIREWALL) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.FIREWALL }, StorageType.SESSIONSTORAGE)
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
    this.getFirewalls();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getFirewalls();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getFirewalls();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getFirewalls();
  }

  onCrud(event: CRUDActionTypes) {
    if (event == CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinnerService.start('main');
      if (event == CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getFirewalls();
    }
  }


  getDeviceBulkEditFields() {
    this.firewallService.getDeviceBulkEditFields().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: BulkUpdateFieldType[]) => {
      this.fields = res;
    });
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getFirewalls();
  }

  getFirewalls() {
    this.firewallService.getFirewalls(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<Firewall>) => {
      this.count = data.count;
      this.viewData = this.firewallService.convertToViewData(data.results);
      if (this.selectedFirewallIds?.length) {
        this.viewData.forEach((i) => { i.isSelected = this.selectedFirewallIds.includes(i.deviceId) })
      }
      this.spinnerService.stop('main');
      this.getDeviceData();
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.firewallService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  goToDetails(view: FirewallViewData) {
    if (view.isShared || view.monitoring.observium) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.FIREWALL, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.deviceId, 'zbx', 'details'], { relativeTo: this.route });
  }

  goToStats(view: FirewallViewData) {
    if (view.isShared) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.FIREWALL, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.observium) {
      if (view.monitoring.configured && view.monitoring.enabled) {
        this.router.navigate([view.deviceId, 'obs', 'overview'], { relativeTo: this.route });
      } else {
        this.router.navigate([view.deviceId, 'obs', 'configure'], { relativeTo: this.route });
      }
    } else {
      if (view.monitoring.configured && view.monitoring.enabled) {
        this.router.navigate([view.deviceId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      } else {
        this.router.navigate([view.deviceId, 'zbx', 'configure'], { relativeTo: this.route });
      }
    }
  }

  webAccessSameTab(view: FirewallViewData) {
    if (!view.sameTabWebAccessUrl) {
      return;
    }
    this.storageService.put('url', view.sameTabWebAccessUrl, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.deviceId, 'webaccess'], { relativeTo: this.route });
  }

  consoleSameTab(view: FirewallViewData) {
    if (!view.sameTabConsoleAccessUrl) {
      return;
    }
    let obj: ConsoleAccessInput = this.firewallService.getConsoleAccessInput(view);
    this.termService.openTerminal(obj);
    // this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    // this.router.navigate([view.deviceId, 'console'], { relativeTo: this.route });
  }

  requestWebAccess(view: FirewallViewData) {
    this.ticketService.createTicket({
      subject: DEVICE_WEB_ACCESS_SUBJECT(DeviceMapping.FIREWALL, view.name),
      metadata: SWITCH_TICKET_METADATA(DeviceMapping.FIREWALL, view.name, view.deviceStatus, view.model, view.type, view.managementIp),
      type: TICKET_TYPE.PROBLEM,
      webaccess: true
    }, DeviceMapping.FIREWALL);
  }

  webAccessNewTab(view: FirewallViewData) {
    this.appService.updateActivityLog('firewalls', view.deviceId);
    window.open(view.newTabWebAccessUrl);
  }

  consoleNewTab(view: FirewallViewData) {
    if (!view.newTabConsoleAccessUrl) {
      return;
    }
    let obj: ConsoleAccessInput = this.firewallService.getConsoleAccessInput(view);
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    this.appService.updateActivityLog('firewalls', view.deviceId);
    window.open(view.newTabConsoleAccessUrl);
  }

  createTicket(data: FirewallViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.FIREWALL, data.name),
      metadata: SWITCH_TICKET_METADATA(DeviceMapping.FIREWALL, data.name,
        data.deviceStatus, data.model, data.type, data.managementIp,
      )
    }, DeviceMapping.FIREWALL);
  }

  addFireWall() {
    this.crudService.addOrEditFireWall(null);
  }

  notifyFirewall(view: FirewallViewData) {
    this.zabbixAlertConfig.notify(view.deviceId, DeviceMapping.FIREWALL);
  }

  editFireWall(view: FirewallViewData) {
    if (view.isShared) {
      return;
    }
    this.crudService.addOrEditFireWall(view.deviceId);
  }

  deleteFirewall(view: FirewallViewData) {
    if (view.isShared) {
      return;
    }
    this.crudService.deleteFireWall(view.deviceId);
  }

  select(view: FirewallViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedFirewallIds.splice(this.selectedFirewallIds.indexOf(view.deviceId), 1);
    } else {
      this.selectedFirewallIds.push(view.deviceId);
    }
    this.selectedAll = this.selectedFirewallIds.length == this.viewData.length;
  }

  selectAll() {
    if (!this.viewData.length) {
      this.selectedAll = false;
      return;
    }

    this.selectedAll = !this.selectedAll;
    if (this.selectedAll) {
      this.viewData.forEach(view => {
        view.isSelected = true;
        this.selectedFirewallIds.push(view.deviceId);
      });
    } else {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedFirewallIds = [];
    }
  }


  cancelButton() {
    this.modalRef.hide()
    this.viewData.forEach(view => {
      view.isSelected = false;
    });
    this.selectedFirewallIds = [];
    this.selectedAll = false;


  }

  bulkDelete() {
    this.modalRef = this.modalService.show(this.bulkDeleteModel, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  bulkUpdate() {
    this.modalRef = this.modalService.show(this.bulkEditModel, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmMultipleDelete() {
    this.spinnerService.start('main');
    this.modalRef.hide();
    this.firewallService.deleteMultipleFirewalls(this.selectedFirewallIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedFirewallIds = [];
      this.selectedAll = false;
      this.getFirewalls();
      this.notification.success(new Notification('Firewalls Deleted successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedFirewallIds = [];
      this.selectedAll = false;
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
      this.spinnerService.stop('main');
    });
  }

  submit(obj: Record<string, any>) {
    this.spinnerService.start('main');
    this.modalRef.hide();
    this.firewallService.updateMultipleFirewalls(this.selectedFirewallIds, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedFirewallIds = [];
      this.selectedAll = false;
      this.getFirewalls();
      this.notification.success(new Notification('Firewalls Updated successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedFirewallIds = [];
      this.selectedAll = false;
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
      this.spinnerService.stop('main');
    });
  }
}