import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, from, interval } from 'rxjs';
import { mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { CRUDActionTypes, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { DATABASE_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { DeviceZabbixEmailNotificationService } from 'src/app/shared/device-zabbix-email-notification/device-zabbix-email-notification.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment.prod';
import { DevicePopoverData } from '../devices-popover/device-popover-data';
import { DatabaseServerCrudService } from './database-server-crud/database-server-crud.service';
import { DBServerViewData, DatabaseServersService } from './database-servers.service';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'database-servers',
  templateUrl: './database-servers.component.html',
  styleUrls: ['./database-servers.component.scss']
})
export class DatabaseServersComponent implements OnInit, OnDestroy {
  popData: DevicePopoverData;
  private pcId: string;
  viewData: DBServerViewData[] = [];
  count: number;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  inDevicesPage: boolean;
  poll: boolean = false;

  selectedAll: boolean = false;
  selectedDbIds: string[] = [];

  modalRef: BsModalRef;
  @ViewChild('bulkDeleteModel') bulkDeleteModel: ElementRef;
  @ViewChild('bulkEditModel') bulkEditModel: ElementRef;
  fields: BulkUpdateFieldType[] = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private dbService: DatabaseServersService,
    private spinnerService: AppSpinnerService,
    private storageService: StorageService,
    private crudService: DatabaseServerCrudService,
    private zabbixAlertConfig: DeviceZabbixEmailNotificationService,
    private ticketService: SharedCreateTicketService,
    private termService: FloatingTerminalService,
    private modalService: BsModalService,
    private notification: AppNotificationService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.inDevicesPage = this.pcId ? false : true;
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'uuid': this.pcId }] };
    });

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getDBServers());
  }

  ngOnInit() {
    this.loadCriteria();
    this.spinnerService.start('main');
    this.getDeviceBulkEditFields();
    this.getDBServers();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.extractByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.DB_SERVER) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.DB_SERVER }, StorageType.SESSIONSTORAGE)
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
    this.getDBServers();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getDBServers();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDBServers();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getDBServers();
  }

  onCrud(event: CRUDActionTypes) {
    if (event == CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinnerService.start('main');
      if (event == CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getDBServers();
    }
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDBServers();
  }
  
  getDeviceBulkEditFields() {
    this.dbService.getDeviceBulkEditFields().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: BulkUpdateFieldType[]) => {
      this.fields = res;
    });
  }

  getDBServers() {
    this.dbService.getDBServers(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.dbService.convertToViewData(data.results);
      if (this.selectedDbIds?.length) {
        this.viewData.forEach((i) => { i.isSelected = this.selectedDbIds.includes(i.instanceId) })
      }
      this.spinnerService.stop('main');
      this.getDeviceData();
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.dbService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  consoleSameTab(view: DBServerViewData) {
    if (!view.sshOptions.isSameTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.dbService.getConsoleAccessInput(view);
    this.termService.openTerminal(obj);
  }

  consoleNewTab(view: DBServerViewData) {
    if (!view.sshOptions.isNewTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.dbService.getConsoleAccessInput(view);
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    window.open(view.sshOptions.newTabConsoleAccessUrl);
  }

  goToStats(view: DBServerViewData) {
    this.saveCriteria();
    this.storageService.put('device', { name: view.instanceName, deviceType: DeviceMapping.DB_SERVER, configured: view.monitoring.configured, monitoringEnabled: view.monitoring.enabled }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.configured && view.monitoring.enabled) {
      this.router.navigate([view.instanceId, 'monitoring-graphs'], { relativeTo: this.route });
    } else {
      this.router.navigate([view.instanceId, 'configure'], { relativeTo: this.route });
    }
  }

  createTicket(data: DBServerViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.DB_SERVER, data.instanceName),
      metadata: DATABASE_TICKET_METADATA(DeviceMapping.DB_SERVER, data.instanceName,
        data.deviceStatus, data.serverName, data.os, data.managementIP,
      )
    }, DeviceMapping.DB_SERVER);
  }

  addDBServer() {
    this.crudService.addOrEditDBServer(null);
  }

  notifyDBServer(view: DBServerViewData) {
    this.zabbixAlertConfig.notify(view.instanceId, DeviceMapping.DB_SERVER);
  }

  editDBServer(view: DBServerViewData) {
    this.crudService.addOrEditDBServer(view.instanceId);
  }

  deleteDBServer(view: DBServerViewData) {
    this.crudService.deleteDBServer(view.instanceId);
  }


  goToDetails(view: DBServerViewData) {
    this.saveCriteria();
    this.storageService.put('device', { name: view.instanceName, deviceType: DeviceMapping.DB_SERVER, configured: view.monitoring.configured}, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.instanceId, 'details'], { relativeTo: this.route });
  }

  select(view: DBServerViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedDbIds.splice(this.selectedDbIds.indexOf(view.instanceId), 1);
    } else {
      this.selectedDbIds.push(view.instanceId);
    }
    this.selectedAll = this.selectedDbIds.length == this.viewData.length;
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
        this.selectedDbIds.push(view.instanceId);
      });
    } else {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedDbIds = [];
    }
  }

  bulkDelete() {
    this.modalRef = this.modalService.show(this.bulkDeleteModel, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmMultipleDelete() {
    this.spinnerService.start('main');
    this.modalRef.hide();
    this.dbService.deleteMultipleDbServers(this.selectedDbIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedDbIds = [];
      this.selectedAll = false;
      this.getDBServers();
      this.notification.success(new Notification('Device Deleted successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedDbIds = [];
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
    this.selectedDbIds = [];
    this.selectedAll = false;
  }

  bulkUpdate() {
    this.modalRef = this.modalService.show(this.bulkEditModel, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  submit(obj: Record<string, any>) {
    this.spinnerService.start('main');
    this.modalRef.hide();
    this.dbService.updateMultipleDbServers(this.selectedDbIds, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedDbIds = [];
      this.selectedAll = false;
      this.getDBServers();
      this.notification.success(new Notification('Database server Updated successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedDbIds = [];
      this.selectedAll = false;
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
      this.spinnerService.stop('main');
    });
  }
  
}
