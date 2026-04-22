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
import { SwitchesCrudService } from './switches-crud/switches-crud.service';
import { SwitchViewData, SwitchesService } from './switches.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PDUCRUDCabinet, PDUCRUDModel } from 'src/app/app-shared-crud/pdu-crud/pdu-crud.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';

@Component({
  selector: 'switches',
  templateUrl: './switches.component.html',
  styleUrls: ['./switches.component.scss']
})
export class SwitchesComponent implements OnInit, OnDestroy {
  popData: DevicePopoverData;
  private pcId: string;
  viewData: SwitchViewData[] = [];
  count: number;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  inDevicesPage: boolean;
  poll: boolean = false;
  selectedAll: boolean = false;

  selectedSwitchIds: string[] = [];
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
  
  // fileToUpload: File = null;
  // invalidFileSize: string = null;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private builder: FormBuilder,
    private switchService: SwitchesService,
    private modalService: BsModalService,
    private spinnerService: AppSpinnerService,
    private appService: AppLevelService,
    private storageService: StorageService,
    private crudService: SwitchesCrudService,
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
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getSwitches());
  }

  ngOnInit() {
    this.loadCriteria();
    this.spinnerService.start('main');
    this.getDeviceBulkEditFields();
    this.getSwitches();
    console.log("in on init")
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.extractByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.SWITCHES) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.SWITCHES }, StorageType.SESSIONSTORAGE)
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
    this.getSwitches();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getSwitches();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getSwitches();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getSwitches();
  }

  onCrud(event: CRUDActionTypes) {
    if (event == CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinnerService.start('main');
      if (event == CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getSwitches();
    }
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getSwitches();
  }

  getSwitches() {
    this.switchService.getSwitches(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<Switch>) => {
      this.count = data.count;
      this.viewData = this.switchService.convertToViewData(data.results);
      if (this.selectedSwitchIds?.length) {
        this.viewData.forEach((i) => { i.isSelected = this.selectedSwitchIds.includes(i.deviceId) })
      }
      this.spinnerService.stop('main');
      this.getDeviceData();
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  getDeviceBulkEditFields() {
    this.switchService.getDeviceBulkEditFields().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: BulkUpdateFieldType[]) => {
      this.fields = res;
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.switchService.getDeviceData(e)),
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
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.SWITCHES, configured: view.monitoring.configured, redfish: view.redfish }, StorageType.SESSIONSTORAGE);
    // this.router.navigate([view.deviceId, 'zbx', 'details'], { relativeTo: this.route });
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
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.SWITCHES, configured: view.monitoring.configured, redfish: view.redfish }, StorageType.SESSIONSTORAGE);
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
    let obj: ConsoleAccessInput = this.switchService.getConsoleAccessInput(view);
    this.termService.openTerminal(obj);
    // this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    // this.router.navigate([view.deviceId, 'console'], { relativeTo: this.route });
  }

  requestWebAccess(view: SwitchViewData) {
    this.ticketService.createTicket({
      subject: DEVICE_WEB_ACCESS_SUBJECT(DeviceMapping.SWITCHES, view.name),
      metadata: SWITCH_TICKET_METADATA(DeviceMapping.SWITCHES, view.name, view.deviceStatus, view.model, view.type, view.managementIp),
      type: TICKET_TYPE.PROBLEM,
      webaccess: true
    }, DeviceMapping.SWITCHES);
  }

  webAccessNewTab(view: SwitchViewData) {
    this.appService.updateActivityLog('switches', view.deviceId);
    window.open(view.newTabWebAccessUrl);
  }

  consoleNewTab(view: SwitchViewData) {
    if (!view.newTabConsoleAccessUrl) {
      return;
    }
    let obj: ConsoleAccessInput = this.switchService.getConsoleAccessInput(view);
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    this.appService.updateActivityLog('switches', view.deviceId);
    window.open(view.newTabConsoleAccessUrl);
  }

  createTicket(data: SwitchViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.SWITCHES, data.name), metadata: SWITCH_TICKET_METADATA(DeviceMapping.SWITCHES, data.name, data.deviceStatus, data.model, data.type, data.managementIp)
    }, DeviceMapping.SWITCHES);
  }

  addSwitch() {
    this.crudService.addOrEditSwitch(null);
  }

  notifySwitch(view: SwitchViewData) {
    this.zabbixAlertConfig.notify(view.deviceId, DeviceMapping.SWITCHES);
  }

  editSwitch(view: SwitchViewData) {
    if (view.isShared) {
      return;
    }
    this.crudService.addOrEditSwitch(view.deviceId);
  }

  deleteSwitch(view: SwitchViewData) {
    if (view.isShared) {
      return;
    }
    this.crudService.deleteSwitch(view.deviceId)
  }

  select(view: SwitchViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedSwitchIds.splice(this.selectedSwitchIds.indexOf(view.deviceId), 1);
    } else {
      this.selectedSwitchIds.push(view.deviceId);
    }
    this.selectedAll = this.selectedSwitchIds.length == this.viewData.length;
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
        this.selectedSwitchIds.push(view.deviceId);
      });
    } else {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedSwitchIds = [];
    }
  }

  bulkDelete() {
    this.modalRef = this.modalService.show(this.bulkDeleteModel, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmMultipleDelete() {
    this.spinnerService.start('main');
    this.modalRef.hide();
    this.switchService.deleteMultipleSwitches(this.selectedSwitchIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedSwitchIds = [];
      this.selectedAll = false;
      this.getSwitches();
      this.notification.success(new Notification('Device Deleted successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedSwitchIds = [];
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
    this.selectedSwitchIds = [];
    this.selectedAll = false;
  }

  bulkUpdate() {
    this.modalRef = this.modalService.show(this.bulkEditModel, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  // downlaodCSV() {  
  // this.switchService.downloadCSV(DeviceMapping.SWITCHES , this.selectedSwitchIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //     let ele = document.getElementById('file-downloader');
  //     ele.setAttribute('href', res?.file_path);
  //     ele.click();
  //   }, err => {
  //     this.notification.error(new Notification('Error while downloading the excel file.'));
  //   });
  // }

  // detectFiles(files: FileList) {
  //   if (!files.length) {
  //     return;
  //   }
  //   this.fileToUpload = files.item(0);
  //   // this.validateFileSize();
  // }

  // removeFile() {
  //   this.fileToUpload = null;
  // }

  // // formatBytes(bytes: number, decimals: number) {
  // //   if (bytes === 0) {
  // //     return '0 Bytes';
  // //   }
  // //   const k = 1024;
  // //   const dm = decimals <= 0 ? 0 : decimals || 2;
  // //   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  // //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  // //   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  // // }

  // // validateFileSize() {
  // //   const size = this.fileToUpload.size / 1000000;
  // //   if (size > 1) {
  // //     this.invalidFileSize = `File too large (Uploaded ${size}MB : Max allowed 1MB)`;
  // //     return;
  // //   }
  // //   this.invalidFileSize = null;
  // // }

  // uploadFile() {
  //   if (this.fileToUpload) {
  //     return;
  //   }
  //   this.spinnerService.start('main');
  //   this.switchService.uploadFile(this.fileToUpload, DeviceMapping.SWITCHES , 'device_bulkupdate_file').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //     this.spinnerService.stop('main');
  //     this.fileToUpload = null;
  //     this.notification.success(new Notification('Device details has been successfully updated.'));
  //   }, err => {
  //     this.spinnerService.stop('main');
  //     this.notification.error(new Notification('Error occured while updating devices. Please check the excel file.'));
  //   });
  // }

  submit(obj: Record<string, any>) {
    this.spinnerService.start('main');
    this.modalRef.hide();
    this.switchService.updateMultipleSwitches(this.selectedSwitchIds, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedSwitchIds = [];
      this.selectedAll = false;
      this.getSwitches();
      this.notification.success(new Notification('Switches Updated successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedSwitchIds = [];
      this.selectedAll = false;
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
      this.spinnerService.stop('main');
    });
  }
}




