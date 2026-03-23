import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, from, interval } from 'rxjs';
import { mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { CRUDActionTypes, DeviceMapping, TICKET_TYPE } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { DEVICE_WEB_ACCESS_SUBJECT, SWITCH_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { DeviceZabbixEmailNotificationService } from 'src/app/shared/device-zabbix-email-notification/device-zabbix-email-notification.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { DevicePopoverData } from '../devices-popover/device-popover-data';
import { LoadBalancer } from '../entities/loadbalancer.type';
import { LoadbalancersCrudService } from './loadbalancers-crud/loadbalancers-crud.service';
import { LoadbalancerViewData, LoadbalancersService } from './loadbalancers.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';
@Component({
  selector: 'loadbalancers',
  templateUrl: './loadbalancers.component.html',
  styleUrls: ['./loadbalancers.component.scss']
})
export class LoadbalancersComponent implements OnInit, OnDestroy {
  popData: DevicePopoverData;
  private pcId: string;
  viewData: LoadbalancerViewData[] = [];
  count: number;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  inDevicesPage: boolean;
  poll: boolean = false;

  modalRef: BsModalRef;
  @ViewChild('bulkDeleteModel') bulkDeleteModel: ElementRef;
  selectedLoadBalancerIds: string[] = [];
  selectedAll: boolean = false;
  @ViewChild('bulkEditModel') bulkEditModel: ElementRef;
  fields: BulkUpdateFieldType[] = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private loadbalancerService: LoadbalancersService,
    private spinnerService: AppSpinnerService,
    private appService: AppLevelService,
    private storageService: StorageService,
    private ticketService: SharedCreateTicketService,
    private crudService: LoadbalancersCrudService,
    private zabbixAlertConfig: DeviceZabbixEmailNotificationService,
    private termService: FloatingTerminalService,
    private modalService: BsModalService,
    private notification: AppNotificationService
  ) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.inDevicesPage = this.pcId ? false : true;
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'uuid': this.pcId }] };
    });

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getLoadBalancers());
  }

  ngOnInit() {
    this.loadCriteria();
    this.spinnerService.start('main');
    this.getDeviceBulkEditFields();
    this.getLoadBalancers();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.extractByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.LOAD_BALANCER) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  getDeviceBulkEditFields() {
    this.loadbalancerService.getDeviceBulkEditFields().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: BulkUpdateFieldType[]) => {
      this.fields = res;
    });
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.LOAD_BALANCER }, StorageType.SESSIONSTORAGE)
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
    this.getLoadBalancers();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getLoadBalancers();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getLoadBalancers();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getLoadBalancers();
  }

  onCrud(event: CRUDActionTypes) {
    if (event == CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinnerService.start('main');
      if (event == CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getLoadBalancers();
    }
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getLoadBalancers();
  }

  getLoadBalancers() {
    this.loadbalancerService.getLoadBalancers(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<LoadBalancer>) => {
      this.count = data.count;
      this.viewData = this.loadbalancerService.convertToViewData(data.results);
      if (this.selectedLoadBalancerIds?.length) {
        this.viewData.forEach((i) => { i.isSelected = this.selectedLoadBalancerIds.includes(i.deviceId) })
      }
      this.spinnerService.stop('main');
      this.getDeviceData();
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.loadbalancerService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  goToDetails(view: LoadbalancerViewData) {
    if (view.isShared || view.monitoring.observium) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.LOAD_BALANCER, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.deviceId, 'zbx', 'details'], { relativeTo: this.route });
  }

  goToStats(view: LoadbalancerViewData) {
    if (view.isShared) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.LOAD_BALANCER, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
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

  webAccessSameTab(view: LoadbalancerViewData) {
    if (!view.sameTabWebAccessUrl) {
      return;
    }
    this.storageService.put('url', view.sameTabWebAccessUrl, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.deviceId, 'webaccess'], { relativeTo: this.route });
  }

  consoleSameTab(view: LoadbalancerViewData) {
    if (!view.sameTabConsoleAccessUrl) {
      return;
    }
    let obj: ConsoleAccessInput = this.loadbalancerService.getConsoleAccessInput(view);
    this.termService.openTerminal(obj);
    // this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    // this.router.navigate([view.deviceId, 'console'], { relativeTo: this.route });
  }

  requestWebAccess(view: LoadbalancerViewData) {
    this.ticketService.createTicket({
      subject: DEVICE_WEB_ACCESS_SUBJECT(DeviceMapping.LOAD_BALANCER, view.name),
      metadata: SWITCH_TICKET_METADATA(DeviceMapping.LOAD_BALANCER, view.name, view.deviceStatus, view.model, view.type, view.managementIp),
      type: TICKET_TYPE.PROBLEM,
      webaccess: true
    }, DeviceMapping.LOAD_BALANCER);
  }

  webAccessNewTab(view: LoadbalancerViewData) {
    if (!view.newTabWebAccessUrl) {
      return;
    }
    this.appService.updateActivityLog('load_balancers', view.deviceId);
    window.open(view.newTabWebAccessUrl);
  }

  consoleNewTab(view: LoadbalancerViewData) {
    if (!view.newTabConsoleAccessUrl) {
      return;
    }
    let obj: ConsoleAccessInput = this.loadbalancerService.getConsoleAccessInput(view);
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    this.appService.updateActivityLog('load_balancers', view.deviceId);
    window.open(view.newTabConsoleAccessUrl);
  }

  createTicket(data: LoadbalancerViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.LOAD_BALANCER, data.name), metadata: SWITCH_TICKET_METADATA(DeviceMapping.LOAD_BALANCER, data.name, data.deviceStatus, data.model, data.type, data.managementIp)
    }, DeviceMapping.LOAD_BALANCER);
  }

  addLoadBalancer() {
    this.crudService.addOrEditLoadbalancer(null);
  }

  notifyLoadBalancer(view: LoadbalancerViewData) {
    this.zabbixAlertConfig.notify(view.deviceId, DeviceMapping.LOAD_BALANCER);
  }

  editLoadBalancer(view: LoadbalancerViewData) {
    if (view.isShared) {
      return;
    }
    this.crudService.addOrEditLoadbalancer(view.deviceId);
  }

  deleteLoadBalancer(view: LoadbalancerViewData) {
    if (view.isShared) {
      return;
    }
    this.crudService.deleteLoadbalancer(view.deviceId);
  }

  select(view: LoadbalancerViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedLoadBalancerIds.splice(this.selectedLoadBalancerIds.indexOf(view.deviceId), 1);
    } else {
      this.selectedLoadBalancerIds.push(view.deviceId);
    }
    this.selectedAll = this.selectedLoadBalancerIds.length == this.viewData.length;
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
        this.selectedLoadBalancerIds.push(view.deviceId);
      });
    } else {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedLoadBalancerIds = [];
    }
  }

  cancelButton() {
    this.modalRef.hide()
    this.viewData.forEach(view => {
      view.isSelected = false;
    });
    this.selectedLoadBalancerIds = [];
    this.selectedAll = false;
  }

  bulkDelete() {
    this.modalRef = this.modalService.show(this.bulkDeleteModel, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmMultipleDelete() {
    this.spinnerService.start('main');
    this.modalRef.hide();
    this.loadbalancerService.deleteMultipleDevices(this.selectedLoadBalancerIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedLoadBalancerIds = [];
      this.selectedAll = false;
      this.getLoadBalancers();
      this.notification.success(new Notification('Load Balancers Deleted successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedLoadBalancerIds = [];
      this.selectedAll = false;
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
      this.spinnerService.stop('main');
    });
  }

  bulkUpdate() {
    this.modalRef = this.modalService.show(this.bulkEditModel, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  submit(obj: Record<string, any>) {
    this.spinnerService.start('main');
    this.modalRef.hide();
    this.loadbalancerService.updateMultipleLoadBalancers(this.selectedLoadBalancerIds, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedLoadBalancerIds = [];
      this.selectedAll = false;
      this.getLoadBalancers();
      this.notification.success(new Notification('Load Balancers Updated successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedLoadBalancerIds = [];
      this.selectedAll = false;
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
      this.spinnerService.stop('main');
    });
  }
}
