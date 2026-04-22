import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, from, interval } from 'rxjs';
import { mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { CRUDActionTypes, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { SUMMARY_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { DeviceZabbixEmailNotificationService } from 'src/app/shared/device-zabbix-email-notification/device-zabbix-email-notification.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UsiOntapCrudService } from 'src/app/app-shared-crud/usi-ontap-crud/usi-ontap-crud.service';
import { environment } from 'src/environments/environment';
import { DevicePopoverData } from '../devices-popover/device-popover-data';
import { StorageDevice } from '../entities/storage-device.type';
import { StorageCrudService } from './storage-crud/storage-crud.service';
import { StorageDeviceViewData, StorageDevicesService } from './storage-devices.service';
import { UsiPureStorageCrudService } from 'src/app/app-shared-crud/usi-pure-storage-crud/usi-pure-storage-crud.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';

@Component({
  selector: 'storage-devices',
  templateUrl: './storage-devices.component.html',
  styleUrls: ['./storage-devices.component.scss']
})
export class StorageDevicesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  popData: DevicePopoverData;
  private pcId: string;
  currentCriteria: SearchCriteria;

  count: number;
  viewData: StorageDeviceViewData[] = [];
  inDevicesPage: boolean;
  poll: boolean = false;

  modalRef: BsModalRef;
  @ViewChild('bulkDeleteModel') bulkDeleteModel: ElementRef;
  selectedStorageDevicesIds: string[] = [];
  selectedAll: boolean = false;
  @ViewChild('bulkEditModel') bulkEditModel: ElementRef;
  fields: BulkUpdateFieldType[] = [];

  constructor(private storageDevicesService: StorageDevicesService,
    private usiOntapCrudSvc: UsiOntapCrudService,
    private usiPureStorageCrudSvc: UsiPureStorageCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private crudService: StorageCrudService,
    private zabbixAlertConfig: DeviceZabbixEmailNotificationService,
    private spinnerService: AppSpinnerService,
    private appService: AppLevelService,
    private storageService: StorageService,
    private ticketService: SharedCreateTicketService,
    private termService: FloatingTerminalService,
    private modalService: BsModalService,
    private notificationService: AppNotificationService,) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.inDevicesPage = this.pcId ? false : true;
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'uuid': this.pcId }] };
    });

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getStorageDevices());
  }

  ngOnInit() {
    this.loadCriteria();
    this.spinnerService.start('main');
    this.getDeviceBulkEditFields();
    this.getStorageDevices();
  }

  ngOnDestroy() {
    this.storageService.removeByKey('urlState', StorageType.SESSIONSTORAGE);
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDeviceBulkEditFields() {
    this.storageDevicesService.getDeviceBulkEditFields().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: BulkUpdateFieldType[]) => {
      this.fields = res;
    });
  }


  loadCriteria() {
    this.storageService.removeByKey('urlState', StorageType.SESSIONSTORAGE);
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.extractByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.STORAGE_DEVICES) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.STORAGE_DEVICES }, StorageType.SESSIONSTORAGE)
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
    this.getStorageDevices();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getStorageDevices();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getStorageDevices();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getStorageDevices();
  }

  onCrud(event: CRUDActionTypes) {
    if (event == CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinnerService.start('main');
      if (event == CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getStorageDevices();
    }
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getStorageDevices();
  }

  getStorageDevices() {
    this.storageDevicesService.getStorageDevices(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<StorageDevice>) => {
      this.count = data.count;
      this.viewData = this.storageDevicesService.convertToViewData(data.results);
      if (this.selectedStorageDevicesIds?.length) {
        this.viewData.forEach((i) => { i.isSelected = this.selectedStorageDevicesIds.includes(i.deviceId) })
      }
      this.getDeviceData();
      this.getStorageData();
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.storageDevicesService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => { }
      )
  }

  getStorageData() {
    from(this.viewData).pipe(mergeMap(e => this.storageDevicesService.getStorageData(e)), takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => {
        }
      );
  }

  goToDetails(view: StorageDeviceViewData) {
    if (view.monitoring.observium) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.STORAGE_DEVICES, configured: view.monitoring.configured, isCluster: view.isCluster, hasPureOs: view.hasPureOs, redfish: view.redfish }, StorageType.SESSIONSTORAGE);
    // this.router.navigate([view.deviceId, 'zbx', 'details'], { relativeTo: this.route });
    if (view.redfish) {
      this.router.navigate([view.deviceId, 'zbx', 'overview'], { relativeTo: this.route });
    } else {
      this.router.navigate([view.deviceId, 'zbx', 'details'], { relativeTo: this.route });
    }
  }

  goToStats(view: StorageDeviceViewData) {
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.STORAGE_DEVICES, configured: view.monitoring.configured, isCluster: view.isCluster, hasPureOs: view.hasPureOs, redfish: view.redfish }, StorageType.SESSIONSTORAGE);
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

  goTo(view: StorageDeviceViewData) {
    if (view.isCluster) {
      this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.STORAGE_DEVICES, configured: view.monitoring.configured, isCluster: view.isCluster }, StorageType.SESSIONSTORAGE);
      this.router.navigate([view.deviceId, 'ontap', 'summary'], { relativeTo: this.route });
    } else if (view.hasPureOs) {
      this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.STORAGE_DEVICES, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
      this.router.navigate([view.deviceId, 'arrays'], { relativeTo: this.route });
    }
  }

  // webAccessSameTab(view: StorageDeviceViewData) {
  //   if (!view.sameTabWebAccessUrl) {
  //     return;
  //   }
  //   this.storageService.put('url', view.sameTabWebAccessUrl, StorageType.SESSIONSTORAGE);
  //   this.router.navigate([view.deviceId, 'webaccess'], { relativeTo: this.route });
  // }

  consoleSameTab(view: StorageDeviceViewData) {
    if (!view.sameTabConsoleAccessUrl) {
      return;
    }
    let obj: ConsoleAccessInput = this.storageDevicesService.getConsoleAccessInput(view);
    this.termService.openTerminal(obj);
  }


  webAccessNewTab(view: StorageDeviceViewData) {
    if (!view.newTabWebAccessUrl) {
      return;
    }
    this.appService.updateActivityLog('storage', view.deviceId);
    window.open(view.newTabWebAccessUrl);
  }

  consoleNewTab(view: StorageDeviceViewData) {
    if (!view.newTabConsoleAccessUrl) {
      return;
    }
    let obj: ConsoleAccessInput = this.storageDevicesService.getConsoleAccessInput(view);
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    this.appService.updateActivityLog('storage', view.deviceId);
    window.open(view.newTabConsoleAccessUrl);
  }

  createTicket(data: StorageDeviceViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.STORAGE_DEVICES, data.name),
      metadata: SUMMARY_TICKET_METADATA(DeviceMapping.STORAGE_DEVICES, data.name)
    }, DeviceMapping.STORAGE_DEVICES);
  }

  addStorageDevice() {
    this.crudService.addOrEditStorage(null);
  }

  notifyStorageDevice(view: StorageDeviceViewData) {
    this.zabbixAlertConfig.notify(view.deviceId, DeviceMapping.STORAGE_DEVICES);
  }

  editStorageDevice(view: StorageDeviceViewData) {
    if (view.isShared) {
      return;
    }
    if (view.hasPureOs) {
      this.usiPureStorageCrudSvc.addOrEdit(view.deviceId);
    } else if (view.isCluster) {
      this.usiOntapCrudSvc.addOrEdit(view.deviceId);
    } else {
      this.crudService.addOrEditStorage(view.deviceId);
    }
  }

  deleteStorageDevice(view: StorageDeviceViewData) {
    if (view.isShared) {
      return;
    }
    this.crudService.deleteStorage(view.deviceId)
  }

  select(view: StorageDeviceViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedStorageDevicesIds.splice(this.selectedStorageDevicesIds.indexOf(view.deviceId), 1);
    } else {
      this.selectedStorageDevicesIds.push(view.deviceId);
    }
    this.selectedAll = this.selectedStorageDevicesIds.length == this.viewData.length;
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
        this.selectedStorageDevicesIds.push(view.deviceId);
      });
    } else {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedStorageDevicesIds = [];
    }
  }

  cancelButton() {
    this.modalRef.hide()
    this.viewData.forEach(view => {
      view.isSelected = false;
    });
    this.selectedStorageDevicesIds = [];
    this.selectedAll = false;
  }

  bulkDelete() {
    this.modalRef = this.modalService.show(this.bulkDeleteModel, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmMultipleDelete() {
    this.spinnerService.start('main');
    this.modalRef.hide();
    this.storageDevicesService.deleteMulitpleStorageDevices(this.selectedStorageDevicesIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedStorageDevicesIds = [];
      this.selectedAll = false;
      this.getStorageDevices();
      this.notificationService.success(new Notification('Storage Devices Deleted successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedStorageDevicesIds = [];
      this.selectedAll = false;
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
      this.spinnerService.stop('main');
    });
  }

  bulkUpdate() {
    this.modalRef = this.modalService.show(this.bulkEditModel, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  submit(obj: Record<string, any>) {
    this.spinnerService.start('main');
    this.modalRef.hide();

    if ('cloud' in obj) {
      obj['private_cloud'] = obj.cloud;
      delete obj.cloud;
    }

    this.storageDevicesService.updateMultipleStorageDevices(this.selectedStorageDevicesIds, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedStorageDevicesIds = [];
      this.selectedAll = false;
      this.getStorageDevices();
      this.notificationService.success(new Notification('Storage Devices Updated successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedStorageDevicesIds = [];
      this.selectedAll = false;
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
      this.spinnerService.stop('main');
    });
  }

}
