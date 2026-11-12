import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
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
import { Switch } from '../entities/switch.type';
import { RoutersCrudService } from './routers-crud/routers-crud.service';
import { SwitchViewData } from '../switches/switches.service';
import { RoutersService } from './routers.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PDUCRUDCabinet, PDUCRUDModel } from 'src/app/app-shared-crud/pdu-crud/pdu-crud.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';

@Component({
  selector: 'routers',
  templateUrl: './routers.component.html',
  styleUrls: ['./routers.component.scss']
})
export class RoutersComponent implements OnInit, OnDestroy {
  deviceLabel = 'Router';
  deviceLabelPlural = 'Routers';
  popData: DevicePopoverData;
  private pcId: string;
  viewData: SwitchViewData[] = [];
  count: number;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  inDevicesPage: boolean;
  poll: boolean = false;
  selectedAll: boolean = false;

  selectedRouterIds: string[] = [];
  modalRef: BsModalRef;
  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  dependencyError: string;
  nonFieldErr: string = '';
  @ViewChild('bulkDeleteModel') bulkDeleteModel: ElementRef;
  @ViewChild('bulkEditModel') bulkEditModel: ElementRef;
  fields: BulkUpdateFieldType[] = [];
  dependentOptions: PDUCRUDCabinet[] | DeviceCRUDPrivateCloudFast[] | PDUCRUDModel[] = [];
  
  constructor(private router: Router,
    private route: ActivatedRoute,
    private builder: FormBuilder,
    private routerService: RoutersService,
    private modalService: BsModalService,
    private spinnerService: AppSpinnerService,
    private appService: AppLevelService,
    private storageService: StorageService,
    private crudService: RoutersCrudService,
    private zabbixAlertConfig: DeviceZabbixEmailNotificationService,
    private notification: AppNotificationService,
    private ticketService: SharedCreateTicketService,
    private termService: FloatingTerminalService,
    private utilService: AppUtilityService,
  ) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.inDevicesPage = this.pcId ? false : true;
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'uuid': this.pcId }] };
    });

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getRouters());
  }

  ngOnInit() {
    this.loadCriteria();
    this.spinnerService.start('main');
    this.getDeviceBulkEditFields();
    this.getRouters();
  }

  ngOnDestroy() {
    this.modalRef?.hide();
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.extractByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.ROUTERS) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.ROUTERS }, StorageType.SESSIONSTORAGE)
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
    this.getRouters();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getRouters();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getRouters();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getRouters();
  }

  onCrud(event: CRUDActionTypes) {
    if (event == CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinnerService.start('main');
      if (event == CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getRouters();
    }
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getRouters();
  }

  getRouters() {
    this.routerService.getRouters(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<Switch>) => {
      this.count = data.count;
      this.viewData = this.routerService.convertToViewData(data.results);
      if (this.selectedRouterIds?.length) {
        this.viewData.forEach((i) => { i.isSelected = this.selectedRouterIds.includes(i.deviceId) })
      }
      this.spinnerService.stop('main');
      this.getDeviceData();
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  getDeviceBulkEditFields() {
    this.routerService.getDeviceBulkEditFields().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: BulkUpdateFieldType[]) => {
      this.fields = res;
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.routerService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => { }
      )
  }

  goToDetails(view: SwitchViewData) {
    if (view.isShared || view.monitoring.observium) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.ROUTERS, configured: view.monitoring.configured, redfish: view.redfish }, StorageType.SESSIONSTORAGE);
    if (view.redfish) {
      this.router.navigate([view.deviceId, 'zbx', 'overview'], { relativeTo: this.route });
    } else {
      this.router.navigate([view.deviceId, 'zbx', 'details'], { relativeTo: this.route });
    }
  }

  goToStats(view: SwitchViewData) {
    if (view.isShared) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.ROUTERS, configured: view.monitoring.configured, redfish: view.redfish }, StorageType.SESSIONSTORAGE);
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

  webAccessSameTab(view: SwitchViewData) {
    if (!view.sameTabWebAccessUrl) {
      return;
    }
    this.storageService.put('url', view.sameTabWebAccessUrl, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.deviceId, 'webaccess'], { relativeTo: this.route });
  }

  consoleSameTab(view: SwitchViewData) {
    if (!view.sameTabConsoleAccessUrl) {
      return;
    }
    let obj: ConsoleAccessInput = this.routerService.getConsoleAccessInput(view);
    this.termService.openTerminal(obj);
  }

  requestWebAccess(view: SwitchViewData) {
    this.ticketService.createTicket({
      subject: DEVICE_WEB_ACCESS_SUBJECT(DeviceMapping.ROUTERS, view.name),
      metadata: SWITCH_TICKET_METADATA(DeviceMapping.ROUTERS, view.name, view.deviceStatus, view.model, view.type, view.managementIp),
      type: TICKET_TYPE.PROBLEM,
      webaccess: true
    }, DeviceMapping.ROUTERS);
  }

  webAccessNewTab(view: SwitchViewData) {
    this.appService.updateActivityLog('routers', view.deviceId);
    window.open(view.newTabWebAccessUrl);
  }

  consoleNewTab(view: SwitchViewData) {
    if (!view.newTabConsoleAccessUrl) {
      return;
    }
    let obj: ConsoleAccessInput = this.routerService.getConsoleAccessInput(view);
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    this.appService.updateActivityLog('routers', view.deviceId);
    window.open(view.newTabConsoleAccessUrl);
  }

  createTicket(data: SwitchViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.ROUTERS, data.name), metadata: SWITCH_TICKET_METADATA(DeviceMapping.ROUTERS, data.name, data.deviceStatus, data.model, data.type, data.managementIp)
    }, DeviceMapping.ROUTERS);
  }

  addRouter() {
    this.crudService.addOrEditRouter(null);
  }

  notifyRouter(view: SwitchViewData) {
    this.zabbixAlertConfig.notify(view.deviceId, DeviceMapping.ROUTERS);
  }

  editRouter(view: SwitchViewData) {
    if (view.isShared) {
      return;
    }
    this.crudService.addOrEditRouter(view.deviceId);
  }

  deleteRouter(view: SwitchViewData) {
    if (view.isShared) {
      return;
    }
    this.crudService.deleteRouter(view.deviceId)
  }

  select(view: SwitchViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedRouterIds.splice(this.selectedRouterIds.indexOf(view.deviceId), 1);
    } else {
      this.selectedRouterIds.push(view.deviceId);
    }
    this.selectedAll = this.selectedRouterIds.length == this.viewData.length;
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
        this.selectedRouterIds.push(view.deviceId);
      });
    } else {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedRouterIds = [];
    }
  }

  bulkDelete() {
    this.modalRef = this.modalService.show(this.bulkDeleteModel, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmMultipleDelete() {
    this.spinnerService.start('main');
    this.modalRef.hide();
    this.routerService.deleteMultipleRouters(this.selectedRouterIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedRouterIds = [];
      this.selectedAll = false;
      this.getRouters();
      this.notification.success(new Notification('Device Deleted successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedRouterIds = [];
      this.selectedAll = false;
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
      this.spinnerService.stop('main');
    });
  }

  cancelButton() {
    this.modalRef.hide()
    this.viewData.forEach(view => {
      view.isSelected = false;
    });
    this.selectedRouterIds = [];
    this.selectedAll = false;
  }

  bulkUpdate() {
    this.modalRef = this.modalService.show(this.bulkEditModel, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  submit(obj: Record<string, any>) {
    this.spinnerService.start('main');
    this.modalRef.hide();
    this.routerService.updateMultipleRouters(this.selectedRouterIds, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedRouterIds = [];
      this.selectedAll = false;
      this.getRouters();
      this.notification.success(new Notification('Routers Updated successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedRouterIds = [];
      this.selectedAll = false;
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
      this.spinnerService.stop('main');
    });
  }

}