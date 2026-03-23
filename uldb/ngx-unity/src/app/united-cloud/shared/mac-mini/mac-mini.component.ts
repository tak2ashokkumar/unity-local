import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, from, interval } from 'rxjs';
import { mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { StatusState } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { BM_SERVER_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { DeviceZabbixEmailNotificationService } from 'src/app/shared/device-zabbix-email-notification/device-zabbix-email-notification.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { DevicePopoverData } from '../devices-popover/device-popover-data';
import { MacMiniPDU } from '../entities/mac-mini.type';
import { PDUSocketAuthType } from '../pdu-recycle/pdu-recycle.service';
import { MacMiniCrudService } from './mac-mini-crud/mac-mini-crud.service';
import { MacMiniService, MacMiniViewData } from './mac-mini.service';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';

@Component({
  selector: 'mac-mini',
  templateUrl: './mac-mini.component.html',
  styleUrls: ['./mac-mini.component.scss']
})
export class MacMiniComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  popData: DevicePopoverData;
  private pcId: string;

  @ViewChild('deviceInfo') deviceInfo: ElementRef;
  modalRef: BsModalRef;

  @ViewChild('macRecycle') macRecycleRef: ElementRef;
  macRecycleAuthModelRef: BsModalRef;
  macRecycleAuthForm: FormGroup;
  macRecycleAuthFormErrors: any;
  macRecycleAuthFormValidationMessages: any;

  count: number;
  info: MacMiniViewData;
  viewData: MacMiniViewData[] = [];
  currentCriteria: SearchCriteria;
  private inDevicesPage: boolean;
  addMacMiniEnabled: boolean;
  pduToRecycle: MacMiniPDU;
  poll: boolean = false;
  syncInProgress: boolean = false;

  @ViewChild('bulkDeleteModel') bulkDeleteModel: ElementRef;
  selectedMacMiniIds: string[] = [];
  selectedAll: boolean = false;

  @ViewChild('bulkEditModel') bulkEditModel: ElementRef;
  fields: BulkUpdateFieldType[] = [];

  constructor(private macMiniService: MacMiniService,
    private crudService: MacMiniCrudService,
    private zabbixAlertConfig: DeviceZabbixEmailNotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private storageService: StorageService,
    private utilService: AppUtilityService,
    private notificationService: AppNotificationService,
    private modalService: BsModalService,
    private ticketService: SharedCreateTicketService,
    private termService: FloatingTerminalService,
    private appService: AppLevelService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.inDevicesPage = this.pcId ? false : true;
      this.addMacMiniEnabled = this.pcId ? false : true;
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'uuid': this.pcId }] };
    });
  }

  subscribeToTerminal() {
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll && !this.syncInProgress), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => {
        this.getMacMinis();
        this.syncMacMinis();
      });
  }

  ngOnInit() {
    this.loadCriteria();
    this.spinnerService.start('main');
    this.getDeviceBulkEditFields();
    this.getMacMinis();
    this.syncMacMinis();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.extractByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.MAC_MINI) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.MAC_MINI }, StorageType.SESSIONSTORAGE)
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
    this.getMacMinis();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getMacMinis();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getMacMinis();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getMacMinis();
  }

  onCrud(event: CRUDActionTypes) {
    if (event == CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinnerService.start('main');
      if (event == CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getMacMinis();
    }
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getMacMinis();
    this.syncMacMinis();
  }

  syncMacMinis() {
    if (this.syncInProgress) {
      this.spinnerService.stop('main');
      return;
    }
    this.syncInProgress = true;
    this.macMiniService.syncMacMinis().pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.spinnerService.stop('main');
      this.getMacMinis();
      this.syncInProgress = false;
      this.subscribeToTerminal();

      // if (status.result.data) {
      //   this.getMacMinis();
      // } else {
      //   this.spinnerService.stop('main');
      //   this.notificationService.error(new Notification(status.result.data));
      //   this.getMacMinis();
      // }
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.syncInProgress = false;
      this.subscribeToTerminal();
      this.notificationService.error(new Notification(err.error));
    });
  }

  getDeviceBulkEditFields() {
    this.macMiniService.getDeviceBulkEditFields().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: BulkUpdateFieldType[]) => {
      this.fields = res;
    });
  }

  getMacMinis() {
    this.macMiniService.getMacMinis(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.macMiniService.converToViewData(data.results);
      if (this.selectedMacMiniIds?.length) {
        this.viewData.forEach((i) => { i.isSelected = this.selectedMacMiniIds.includes(i.id) })
      }
      this.getDeviceData();
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  recycle(pdu: MacMiniPDU) {
    if (!pdu) {
      return;
    }
    this.pduToRecycle = pdu;
    this.macRecycleAuthForm = this.macMiniService.buildMacAuthForm(this.pduToRecycle);
    this.macRecycleAuthFormErrors = this.macMiniService.macRecycleAuthFormErrors();
    this.macRecycleAuthFormValidationMessages = this.macMiniService.macRecycleAuthFormValidationMessages;
    this.macRecycleAuthModelRef = this.modalService.show(this.macRecycleRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    this.spinnerService.stop('main');
  }

  onRecycleRequest() {
    if (this.macRecycleAuthForm.invalid) {
      this.macRecycleAuthFormErrors = this.utilService.validateForm(this.macRecycleAuthForm, this.macRecycleAuthFormValidationMessages, this.macRecycleAuthFormErrors);
      this.macRecycleAuthForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.macRecycleAuthFormErrors = this.utilService.validateForm(this.macRecycleAuthForm, this.macRecycleAuthFormValidationMessages, this.macRecycleAuthFormErrors); });
      return;
    } else {
      this.macRecycleAuthModelRef.hide();
      this.spinnerService.start('main');
      this.checkPduRecycleAuth();
    }
  }

  checkPduRecycleAuth() {
    this.macMiniService.checkPDUAuth(this.pduToRecycle, <PDUSocketAuthType>this.macRecycleAuthForm.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe((status: string) => {
        if (status == StatusState.SUCCESS) {
          this.recycleConfirm();
        } else {
          this.spinnerService.stop('main');
          this.notificationService.error(new Notification('Authentication Failed. Please try again'));
        }
      }, (err: HttpErrorResponse) => {
        this.spinnerService.stop('main');
        // this.recycleConfirm();
        this.notificationService.error(new Notification(err.error));
      })
  }

  recycleConfirm() {
    let obj = Object.assign({}, this.macRecycleAuthForm.getRawValue(),
      { 'outlets': [this.pduToRecycle.socket] });
    this.macMiniService.recyclePDU(this.pduToRecycle, obj)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
        if (status.result.status) {
          this.notificationService.success(new Notification(status.result.data));
        } else {
          this.notificationService.error(new Notification(status.result.data));
        }
      }, (err: HttpErrorResponse) => {
        this.notificationService.error(new Notification(err.error));
      }, () => {
        this.spinnerService.stop('main');
      });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.macMiniService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  showInfo(view: MacMiniViewData) {
    this.info = view;
    this.modalRef = this.modalService.show(this.deviceInfo, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  webAccessNewTab(view: MacMiniViewData) {
    if (!view.newTabWebAccessUrl) {
      return;
    }
    this.appService.updateActivityLog('macdevices', view.id);
    window.open(view.newTabWebAccessUrl);
  }

  consoleSameTab(view: MacMiniViewData) {
    if (!view.sameTabConsoleAccessUrl) {
      return;
    }
    let obj: ConsoleAccessInput = this.macMiniService.getConsoleAccessInput(view);
    this.termService.openTerminal(obj);
    // this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    // this.router.navigate([view.deviceId, 'console'], { relativeTo: this.route });
  }

  consoleNewTab(view: MacMiniViewData) {
    if (!view.newTabConsoleAccessUrl) {
      return;
    }
    let obj: ConsoleAccessInput = this.macMiniService.getConsoleAccessInput(view);
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    this.appService.updateActivityLog('macdevices', view.id);
    window.open(view.newTabConsoleAccessUrl);
  }

  goToDetails(view: MacMiniViewData) {
    if (view.monitoring.observium) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.MAC_MINI, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.id, 'zbx', 'details'], { relativeTo: this.route });
  }

  goToStats(view: MacMiniViewData) {
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.MAC_MINI, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.observium) {
      if (view.monitoring.configured && view.monitoring.enabled) {
        this.router.navigate([view.id, 'obs', 'overview'], { relativeTo: this.route });
      } else {
        this.router.navigate([view.id, 'obs', 'configure'], { relativeTo: this.route });
      }
    } else {
      if (view.monitoring.configured && view.monitoring.enabled) {
        this.router.navigate([view.id, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      } else {
        this.router.navigate([view.id, 'zbx', 'configure'], { relativeTo: this.route });
      }
    }
  }

  createTicket(view: MacMiniViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.MAC_MINI, view.name), metadata: BM_SERVER_TICKET_METADATA(DeviceMapping.MAC_MINI, view.name, view.deviceStatus, view.os, view.managementIP)
    }, DeviceMapping.MAC_MINI);
  }

  addMacMini() {
    this.crudService.addOrEdit(null);
  }

  notifyMacMini(view: MacMiniViewData) {
    this.zabbixAlertConfig.notify(view.id, DeviceMapping.MAC_MINI);
  }

  editMacMini(deviceId: string) {
    this.crudService.addOrEdit(deviceId);
  }

  deleteMacMini(deviceId: string) {
    this.crudService.delete(deviceId);
  }

  downlaodList() {
    this.spinnerService.start('main');
    this.macMiniService.downloadDevicesReport().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      let ele = document.getElementById('file-downloader');
      ele.setAttribute('href', this.macMiniService.getDevicesReport(data.data));
      ele.click();
      this.spinnerService.stop('main');
      this.notificationService.success(new Notification('MAC devices report downloaded successfully.'));
    }, err => {
      this.spinnerService.stop('main');
      this.notificationService.error(new Notification('Failed to downloaded MAC devices report. Try again later.'));
    });
  }

  select(view: MacMiniViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedMacMiniIds.splice(this.selectedMacMiniIds.indexOf(view.id), 1);
    } else {
      this.selectedMacMiniIds.push(view.id);
    }
    this.selectedAll = this.selectedMacMiniIds.length == this.viewData.length;
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
        this.selectedMacMiniIds.push(view.id);
      });
    } else {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedMacMiniIds = [];
    }
  }

  cancelButton() {
    this.modalRef.hide()
    this.viewData.forEach(view => {
      view.isSelected = false;
    });
    this.selectedMacMiniIds = [];
    this.selectedAll = false;
  }

  bulkDelete() {
    this.modalRef = this.modalService.show(this.bulkDeleteModel, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmMultipleDelete() {
    this.spinnerService.start('main');
    this.modalRef.hide();
    this.macMiniService.deleteMultipleMacDevices(this.selectedMacMiniIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedMacMiniIds = [];
      this.selectedAll = false;
      this.getMacMinis();
      this.syncMacMinis();
      this.notificationService.success(new Notification('Device Deleted successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedMacMiniIds = [];
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

    this.macMiniService.updateMultipleMacDevices(this.selectedMacMiniIds, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedMacMiniIds = [];
      this.selectedAll = false;        
      this.getMacMinis();
      this.syncMacMinis();
      this.notificationService.success(new Notification('MAC Devices Updated successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedMacMiniIds = [];
      this.selectedAll = false;
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
      this.spinnerService.stop('main');
    });
  }

}
