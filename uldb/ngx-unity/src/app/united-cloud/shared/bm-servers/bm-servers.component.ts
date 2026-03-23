import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, from, interval, of } from 'rxjs';
import { mergeMap, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { MANAGEMENT_NOT_ENABLED_MESSAGE } from 'src/app/app-constants';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
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
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { DevicePopoverData } from '../devices-popover/device-popover-data';
import { BMServer, BMServerPowerStatus } from '../entities/bm-server.type';
import { PowerToggleInput, ServerPowerToggleService } from '../server-power-toggle/server-power-toggle.service';
import { BmServersCrudService } from './bm-servers-crud/bm-servers-crud.service';
import { BMServerViewData, BmServersService } from './bm-servers.service';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';

@Component({
  selector: 'bm-servers',
  templateUrl: './bm-servers.component.html',
  styleUrls: ['./bm-servers.component.scss']
})
export class BmServersComponent implements OnInit {
  popData: DevicePopoverData;
  @ViewChild('serverinfo') serverinfo: ElementRef;
  modalRef: BsModalRef;
  private pcId: string;
  count: number;
  info: BMServerViewData;
  viewData: BMServerViewData[] = [];
  @ViewChild('authFormRef') authFormRef: ElementRef;
  authForm: FormGroup;
  authFormErrors: any;
  authFormValidationMessages: any;
  @ViewChild('resetPasswordFormRef') resetPasswordFormRef: ElementRef;
  resetPasswordForm: FormGroup;
  resetPasswordFormErrors: any;
  resetPasswordFormValidationMessages: any;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  private inDevicesPage: boolean;
  addBMServerEnabled: boolean;
  poll: boolean = false;
  selectedBMServerIds: string[] = [];
  @ViewChild('bulkDeleteModel') bulkDeleteModel: ElementRef;
  selectedAll: boolean = false;
  @ViewChild('bulkEditModel') bulkEditModel: ElementRef;
  fields: BulkUpdateFieldType[] = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private storageService: StorageService,
    private utilService: AppUtilityService,
    private bmService: BmServersService,
    private ticketService: SharedCreateTicketService,
    private modalService: BsModalService,
    private user: UserInfoService,
    private toggleService: ServerPowerToggleService,
    private notification: AppNotificationService,
    private crudService: BmServersCrudService,
    private zabbixAlertConfig: DeviceZabbixEmailNotificationService,
    private termService: FloatingTerminalService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.inDevicesPage = this.pcId ? false : true;
      this.addBMServerEnabled = this.pcId ? false : true;
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'uuid': this.pcId }] };
    });

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getBMServers());
  }

  ngOnInit() {
    this.loadCriteria();
    this.spinnerService.start('main');
    this.getDeviceBulkEditFields();
    this.getBMServers();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.extractByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.BARE_METAL_SERVER) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  getDeviceBulkEditFields() {
    this.bmService.getDeviceBulkEditFields().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: BulkUpdateFieldType[]) => {
      this.fields = res;
    });
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
    this.getBMServers();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getBMServers();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getBMServers();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getBMServers();
  }

  onCrud(event: CRUDActionTypes) {
    if (event == CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinnerService.start('main');
      if (event == CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getBMServers();
    }
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getBMServers();
  }

  getBMServers() {
    this.bmService.getBMServers(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<BMServer>) => {
      this.count = data.count;
      this.viewData = this.bmService.converToViewData(data.results);
      if (this.selectedBMServerIds?.length) {
        this.viewData.forEach((i) => { i.isSelected = this.selectedBMServerIds.includes(i.bmServerId) })
      }
      this.spinnerService.stop('main');
      this.getServersPowerStatus(data.results);
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  getServersPowerStatus(servers: BMServer[]) {
    from(servers).pipe(mergeMap(e => this.bmService.getPowerStatus(e.uuid)), takeUntil(this.ngUnsubscribe))
      .subscribe((res: Map<string, BMServerPowerStatus>) => {
        this.convertPowerStatusViewData(res);
      }, err => {
        //Doesnt come to err block since error handling done in service
      });
  }

  getServerPowerStatus(view: BMServerViewData) {
    of(view).pipe(mergeMap(e => this.bmService.getPowerStatus(e.bmServerId)), takeUntil(this.ngUnsubscribe))
      .subscribe((res: Map<string, BMServerPowerStatus>) => {
        this.convertPowerStatusViewData(res);
      }, err => {
        //Doesnt come to err block since error handling done in service
      });
  }

  convertPowerStatusViewData(res: Map<string, BMServerPowerStatus>) {
    const key = res.keys().next().value;
    const index = this.viewData.map(data => data.bmServerId).indexOf(key);
    if (res.get(key)) {
      const value = res.get(key).power_status;
      this.viewData[index].deviceStatus = value ? 'Up' : 'Down';
      this.viewData[index].powerTooltipMessage = value ? 'Stop Server' : 'Start Server';
      this.viewData[index].powerStatusOn = value;
      this.viewData[index].isPowerButtonEnabled = true;
      this.viewData[index].isBmStatsButtonEnabled = value;
      const rackType = this.viewData[index].rackType != 'None' ? this.viewData[index].rackType : '';
      this.viewData[index].bmStatsTooltipMessage = value ? rackType + ' Stats' : 'Server Powered off';
      this.viewData[index].resetPasswordTooltipMessage = value ? `Reset ${this.viewData[index].rackType} password` : 'Server Powered off';
    } else {
      this.viewData[index].isPowerButtonEnabled = false;
      this.viewData[index].isBmStatsButtonEnabled = false;
      this.viewData[index].isBlinkerEnabled = false;
      this.viewData[index].powerStatusOn = false;
      this.viewData[index].blinkerTooltipMessage = this.viewData[index].bmStatsTooltipMessage;
      if (this.viewData[index].bmcIP) {
        this.viewData[index].powerTooltipMessage = 'Controller is not reachable';
        this.viewData[index].bmStatsTooltipMessage = 'Controller is not reachable';
        this.viewData[index].resetPasswordTooltipMessage = 'Controller is not reachable';
      } else {
        this.viewData[index].powerTooltipMessage = 'Device not Configured with IPMI/DRAC';
        this.viewData[index].bmStatsTooltipMessage = 'Device not Configured with IPMI/DRAC';
        this.viewData[index].resetPasswordTooltipMessage = 'Device not Configured with IPMI/DRAC';
      }
    }
    if (!this.user.isManagementEnabled) {
      this.viewData[index].powerStatusOn = false;
      this.viewData[index].isPowerButtonEnabled = false;
      this.viewData[index].powerTooltipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
      this.viewData[index].isBlinkerEnabled = false;
      this.viewData[index].blinkerTooltipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
      this.viewData[index].isSameTabEnabled = false;
      this.viewData[index].sameTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
      this.viewData[index].isNewTabEnabled = false;
      this.viewData[index].newTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
    }
    this.getDeviceData(this.viewData[index]);
  }

  getDeviceData(view: BMServerViewData) {
    of(view).pipe(
      mergeMap((e) => this.bmService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  powerToggle(view: BMServerViewData) {
    if (!view.isPowerButtonEnabled) {
      return;
    }
    const input: PowerToggleInput = this.bmService.getToggleInput(view);
    view.powerStatusIcon = 'fa-spinner fa-spin';
    this.toggleService.togglePower(input).pipe(take(1)).subscribe(res => {
      view.powerStatusIcon = 'fa-power-off';
      if (res) {
        const index = this.viewData.map(data => data.bmServerId).indexOf(res);
        this.viewData[index].deviceStatus = null;
        this.getServerPowerStatus(view);
      }
    });
  }

  blinkServer(view: BMServerViewData) {
    if (!view.isBlinkerEnabled) {
      return;
    }
    this.info = view;
    this.authForm = this.bmService.buildIPMIAuthenticationForm(view);
    this.authFormErrors = this.bmService.resetIPMIAuthenticationFormErrors();
    this.authFormValidationMessages = this.bmService.IPMIAuthenticationFormValidationMessages;
    this.modalRef = this.modalService.show(this.authFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  blinkServerInDatacenter() {
    this.bmService.blinkServer(this.info).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      let index = this.viewData.findIndex(view => view.serverId == this.info.serverId);
      this.viewData[index].isBlinking = true;
      this.viewData[index].blinkerTooltipMessage = 'Server blinking';
      setTimeout(() => {
        this.viewData[index].isBlinking = false;
        this.viewData[index].blinkerTooltipMessage = 'blink server in datacenter';
      }, 30000);
      this.notification.success(new Notification('Server blinking! Please contact datacenter technician to verify.'))
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to blink server. Please try again later.'))
    }, () => {
      this.spinnerService.stop('main');
    })
  }

  onSubmitAuthForm() {
    if (this.authForm.invalid) {
      this.authFormErrors = this.utilService.validateForm(this.authForm, this.authFormValidationMessages, this.authFormErrors);
      this.authForm.valueChanges
        .subscribe((data: any) => { this.authFormErrors = this.utilService.validateForm(this.authForm, this.authFormValidationMessages, this.authFormErrors); });
      return;
    } else {
      this.modalRef.hide();
      this.spinnerService.start('main');
      this.bmService.checkPassword(this.info, this.authForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.blinkServerInDatacenter();
      }, (err: HttpErrorResponse) => {
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Invalid Credentials provided.'))
      });
    }
  }

  showInfo(view: BMServerViewData) {
    this.info = view;
    this.modalRef = this.modalService.show(this.serverinfo, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.BARE_METAL_SERVER }, StorageType.SESSIONSTORAGE)
  }

  goToDetails(view: BMServerViewData) {
    if (view.monitoring.observium) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.BARE_METAL_SERVER, configured: view.monitoring.configured, uuid: view.bmServerId, os: view.os, ssr_os: view.platformType, redfish: view.redfish }, StorageType.SESSIONSTORAGE);
    // this.router.navigate([view.bmServerId, 'zbx', 'details'], { relativeTo: this.route });
    if (view.redfish) {
      this.router.navigate([view.bmServerId, 'zbx', 'overview'], { relativeTo: this.route });
    } else {
      this.router.navigate([view.bmServerId, 'zbx', 'details'], { relativeTo: this.route });
    }
  }

  goToStats(view: BMServerViewData) {
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.BARE_METAL_SERVER, configured: view.monitoring.configured, uuid: view.bmServerId, os: view.os, ssr_os: view.platformType, redfish: view.redfish }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.observium) {
      if (view.monitoring.configured && view.monitoring.enabled) {
        this.router.navigate([view.serverId, 'obs', 'overview'], { relativeTo: this.route });
      } else {
        this.router.navigate([view.serverId, 'obs', 'configure'], { relativeTo: this.route });
      }
    } else {
      if (view.monitoring.configured && view.monitoring.enabled) {
        this.router.navigate([view.bmServerId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      } else {
        this.router.navigate([view.bmServerId, 'zbx', 'configure'], { relativeTo: this.route });
      }
    }
  }

  goToBmStats(view: BMServerViewData) {
    if (!view.isBmStatsButtonEnabled) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('statsurl', view.statsUrl, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.bmServerId, 'stats'], { relativeTo: this.route });
  }

  consoleSameTab(index: number, deviceId: string) {
    if (!this.viewData[index].isSameTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.bmService.getConsoleAccessInput(this.viewData[index]);
    this.termService.openTerminal(obj);
    // this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    // this.router.navigate([deviceId, 'console'], { relativeTo: this.route });
  }

  consoleNewTab(deviceId: string, accessUrl: string, index: number) {
    if (!this.viewData[index].isNewTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.bmService.getConsoleAccessInput(this.viewData[index]);
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    window.open(accessUrl);
  }

  createTicket(data: BMServerViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.BARE_METAL_SERVER, data.name), metadata: BM_SERVER_TICKET_METADATA(DeviceMapping.BARE_METAL_SERVER, data.name, data.deviceStatus, data.os, data.managementIP)
    }, DeviceMapping.BARE_METAL_SERVER);
  }

  addBareMetalServer() {
    this.crudService.addOrEditBaremetalServer(null);
  }

  notifyBareMetalServer(view: BMServerViewData) {
    this.zabbixAlertConfig.notify(view.bmServerId, DeviceMapping.BARE_METAL_SERVER);
  }

  editBareMetalServer(bmServerId: string) {
    this.crudService.addOrEditBaremetalServer(bmServerId)
  }

  deleteBareMetalServer(bmServerId: string) {
    this.crudService.deleteBaremetalServer(bmServerId)
  }

  resetPassword(view: BMServerViewData) {
    if (!view.isBmStatsButtonEnabled) {
      return;
    }
    this.resetPasswordForm = this.bmService.buildResetPasswordForm(view);
    this.resetPasswordFormErrors = this.bmService.resetPasswordFormErrors();
    this.resetPasswordFormValidationMessages = this.bmService.resetPasswordFormValidationMessages;
    this.modalRef = this.modalService.show(this.resetPasswordFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  onSubmitresetPasswordForm() {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordFormErrors = this.utilService.validateForm(this.resetPasswordForm, this.resetPasswordFormValidationMessages, this.resetPasswordFormErrors);
      this.resetPasswordForm.valueChanges
        .subscribe((data: any) => { this.resetPasswordFormErrors = this.utilService.validateForm(this.resetPasswordForm, this.resetPasswordFormValidationMessages, this.resetPasswordFormErrors); });
      return;
    } else {
      this.modalRef.hide();
      this.spinnerService.start('main');
      this.bmService.resetPassword(this.resetPasswordForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinnerService.stop('main');
        this.notification.success(new Notification('Password reset successful.'));
      }, (err: HttpErrorResponse) => {
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Failed to reset password. Tryagain later.'));
      });
    }
  }

  select(view: BMServerViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedBMServerIds.splice(this.selectedBMServerIds.indexOf(view.bmServerId), 1);
    } else {
      this.selectedBMServerIds.push(view.bmServerId);
    }
    this.selectedAll = this.selectedBMServerIds.length == this.viewData.length;
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
        this.selectedBMServerIds.push(view.bmServerId);
      });
    } else {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedBMServerIds = [];
    }
  }

  cancelButton() {
    this.modalRef.hide()
    this.viewData.forEach(view => {
      view.isSelected = false;
    });
    this.selectedBMServerIds = [];
    this.selectedAll = false;
  }

  bulkDelete() {
    this.modalRef = this.modalService.show(this.bulkDeleteModel, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmMultipleDelete() {
    this.spinnerService.start('main');
    this.modalRef.hide();
    this.bmService.deleteMultipleBMServers(this.selectedBMServerIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedBMServerIds = [];
      this.selectedAll = false;
      this.getBMServers();
      this.notification.success(new Notification('Bare Metal Servers Deleted successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedBMServerIds = [];
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

    if ('cloud' in obj) {
      obj['private_cloud'] = obj.cloud;
      delete obj.cloud;
    }

    this.bmService.updateMultipleBMServers(this.selectedBMServerIds, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedBMServerIds = [];
      this.selectedAll = false;
      this.getBMServers();
      this.notification.success(new Notification('Bare Metal Servers Updated successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedBMServerIds = [];
      this.selectedAll = false;
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
      this.spinnerService.stop('main');
    });
  }
}
