import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription, from, interval, throwError } from 'rxjs';
import { catchError, filter, mergeMap, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskError, TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { PROXMOX_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { DevicePopoverData } from '../../devices-popover/device-popover-data';
import { PowerToggleInput } from '../../server-power-toggle/server-power-toggle.service';
import { VmsMgmtCrudService } from '../vms-mgmt-crud/vms-mgmt-crud.service';
import { VmsTagsCrudService } from '../vms-tags-crud/vms-tags-crud.service';
import { VmsService } from '../vms.service';
import { PROXMOX_ACTIONS, ProxmoxAuthType, ProxmoxCloneType, ProxmoxVM, ProxmoxVMViewData, VmsListProxmoxService } from './vms-list-proxmox.service';

@Component({
  selector: 'vms-list-proxmox',
  templateUrl: './vms-list-proxmox.component.html',
  styleUrls: ['./vms-list-proxmox.component.scss'],
  providers: [VmsListProxmoxService]
})
export class VmsListProxmoxComponent implements OnInit, OnDestroy {

  @Input('platform') platformType: PlatFormMapping;
  @Input('deviceMapping') deviceMapping: DeviceMapping;
  popData: DevicePopoverData;
  pcId: string;
  private ngUnsubscribe = new Subject();
  private subscription: Subscription;
  currentCriteria: SearchCriteria;
  count: number;
  @ViewChild('serverinfo') serverinfo: ElementRef;
  modalRef: BsModalRef;
  info: any;
  viewData: ProxmoxVMViewData[] = [];
  inDevicesPage: boolean;
  poll: boolean = false;
  syncInProgress: boolean = false;

  action: PROXMOX_ACTIONS;

  @ViewChild('authenticate') authenticate: ElementRef;
  authModalref: BsModalRef;
  authForm: FormGroup;
  authFormErrors: any;
  authValidationMessages: any;

  cloneForm: FormGroup;
  cloneFormErrors: any;
  cloneValidationMessages: any;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private vmsService: VmsService,
    private spinnerService: AppSpinnerService,
    private ipCrudService: VmsMgmtCrudService,
    private tagsCrudService: VmsTagsCrudService,
    private appService: AppLevelService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private proxmoxService: VmsListProxmoxService,
    private storageService: StorageService,
    private modalService: BsModalService,
    private ticketService: SharedCreateTicketService,
    private termService: FloatingTerminalService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.inDevicesPage = this.pcId ? false : true;
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'cloud_id': this.pcId }] };
    });
    /**
     * This logic is to reuses the component in pvt cloud and devices VMs. 
     */
    this.route.data.subscribe(data => {
      if (data.platformType && data.deviceMapping) {
        this.platformType = data.platformType;
        this.deviceMapping = data.deviceMapping;
      }
    });
  }

  subscribeToTerminal() {
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll && !this.syncInProgress), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => {
        this.createTaskAndPoll()
      });
  }

  ngOnInit() {
    this.loadCriteria();
    this.spinnerService.start('main');
    this.createTaskAndPoll();
    this.getVms();
    this.notification.success(new Notification('Latest data is being updated.'));
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.extractByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.PROXMOX) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.PROXMOX }, StorageType.SESSIONSTORAGE)
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
    this.getVms();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getVms();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getVms();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getVms();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getVms();
    this.createTaskAndPoll();
  }

  onCrud(event: CRUDActionTypes) {
    if (event == CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinnerService.start('main');
      if (event == CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getVms();
    }
  }

  createTaskAndPoll() {
    if (this.syncInProgress) {
      return;
    }
    this.syncInProgress = true;
    this.vmsService.createTaskAndPoll(this.pcId, this.platformType).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(status => {
        if (status.result.data) {
          this.getVms();
        } else {
          this.notification.error(new Notification(status.result.message));
        }
        this.syncInProgress = false;
        this.subscribeToTerminal();
      }, (err: Error) => {
        this.syncInProgress = false;
        this.subscribeToTerminal();
        this.notification.error(new Notification(`Error while fetching ${this.platformType} virtual machines`));
      });
  }

  getVms() {
    this.proxmoxService.getVms(this.platformType, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.proxmoxService.converToViewData(res.results);
      this.spinnerService.stop('main');
      this.getDeviceData(res.results);
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification(`Error while fetching ${this.platformType} virtual machines`));
    });
  }

  getDeviceData(vms: ProxmoxVM[]) {
    from(vms).pipe(filter(e => !e.is_template), mergeMap(e => this.proxmoxService.getDeviceData(this.deviceMapping, e.uuid)), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const index = this.viewData.map(data => data.uuid).indexOf(key);
          if (res.get(key)) {
            const value = res.get(key).device_data;
            this.viewData[index].popOverDetails.uptime = this.utilService.getDeviceUptime(value);
            this.viewData[index].popOverDetails.lastreboot = (Number(value.last_rebooted) * 1000).toString();
            this.viewData[index].popOverDetails.status = value.status;
            this.viewData[index].statsTooltipMessage = `${this.platformType} VM Statistics`;
          } else {
            this.viewData[index].popOverDetails.uptime = '0';
            this.viewData[index].popOverDetails.lastreboot = '0';
            this.viewData[index].statsTooltipMessage = 'Monitoring not enabled';
          }
        },
        err => console.log(err),
        () => {
          //Do anything after everything done
        }
      );
  }

  showInfo(view: ProxmoxVMViewData) {
    this.info = view;
    this.modalRef = this.modalService.show(this.serverinfo, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  consoleSameTab(view: ProxmoxVMViewData) {
    if (!view.isSameTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.proxmoxService.getConsoleAccessInput(this.deviceMapping, view);
    obj.managementIp = view.managementIp;
    this.termService.openTerminal(obj);
  }

  consoleNewTab(view: ProxmoxVMViewData) {
    if (!view.isNewTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.proxmoxService.getConsoleAccessInput(this.deviceMapping, view);
    obj.managementIp = view.managementIp;
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    window.open(view.newTabConsoleAccessUrl);
  }

  goToStats(view: ProxmoxVMViewData) {
    if (view.popOverDetails.uptime == '0' || !view.popOverDetails.uptime) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: this.deviceMapping, ssr_os: view.ssrOS }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.uuid, 'overview'], { relativeTo: this.route });
  }

  createTicket(data: ProxmoxVMViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(this.deviceMapping, data.name), metadata: PROXMOX_TICKET_METADATA(data.vmId, this.deviceMapping, data.name, data.powerStatus, data.osName, data.managementIp, 'N/A')
    }, DeviceMapping.VIRTUAL_MACHINE);
  }

  updateVm(uuid: string, index: number) {
    this.proxmoxService.getVmById(this.platformType, uuid).pipe(take(1), takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData[index] = this.proxmoxService.convertVMtoViewdata(res);
    }, err => {
    });
  }

  powerToggle(view: ProxmoxVMViewData) {
    if (!view.powerIconEnabled) {
      return;
    }
    this.action = view.powerStatusOn ? PROXMOX_ACTIONS.POWER_OFF : PROXMOX_ACTIONS.POWER_ON;
    this.buildAuthForm(view.uuid);
  }

  clone(view: ProxmoxVMViewData) {
    if (!view.cloneIconEnabled) {
      return;
    }
    this.action = PROXMOX_ACTIONS.CLONE;
    this.buildAuthForm(view.uuid);
  }

  delete(view: ProxmoxVMViewData) {
    if (!view.deleteIconEnabled) {
      return;
    }
    this.action = PROXMOX_ACTIONS.DELETE;
    this.buildAuthForm(view.uuid);
  }

  reboot(view: ProxmoxVMViewData) {
    if (!view.rebootIconEnabled) {
      return;
    }
    this.action = PROXMOX_ACTIONS.REBOOT;
    this.buildAuthForm(view.uuid);
  }

  convertToTemplate(view: ProxmoxVMViewData) {
    if (!view.convertIconEnabled) {
      return;
    }
    this.action = PROXMOX_ACTIONS.CONVERT_TO_TEMPLATE;
    this.buildAuthForm(view.uuid);
  }

  buildAuthForm(uuid: string) {
    this.authForm = this.proxmoxService.buildAuthForm(uuid);
    this.authFormErrors = this.proxmoxService.resetAuthFormErrors();
    this.authValidationMessages = this.proxmoxService.authValidationMessages;
    if (this.action == PROXMOX_ACTIONS.CLONE) {
      this.cloneForm = this.proxmoxService.buildCloneForm();
      this.cloneFormErrors = this.proxmoxService.resetCloneFormErrors();
      this.cloneValidationMessages = this.proxmoxService.cloneValidationMessages;
    } else {
      this.cloneForm = null;
      this.cloneFormErrors = null;
    }
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
    this.authModalref = this.modalService.show(this.authenticate, Object.assign({}, { class: '', keyboard: false, ignoreBackdropClick: true }));
  }

  onSubmit() {
    if (this.authForm.invalid || (this.action == PROXMOX_ACTIONS.CLONE && this.cloneForm.invalid)) {
      this.authFormErrors = this.utilService.validateForm(this.authForm, this.authValidationMessages, this.authFormErrors);
      this.subscription = this.authForm.valueChanges
        .subscribe((data: any) => { this.authFormErrors = this.utilService.validateForm(this.authForm, this.authValidationMessages, this.authFormErrors); });
      if (this.action == PROXMOX_ACTIONS.CLONE) {
        this.cloneFormErrors = this.utilService.validateForm(this.cloneForm, this.cloneValidationMessages, this.cloneFormErrors);
        const s = this.cloneForm.valueChanges
          .subscribe((data: any) => {
            this.cloneFormErrors = this.utilService.validateForm(this.cloneForm, this.cloneValidationMessages, this.cloneFormErrors);
          });

        this.subscription.add(s);
      }
      return;
    } else {
      this.spinnerService.start('main');
      this.authFormErrors = this.proxmoxService.resetAuthFormErrors();
      let authData = this.authForm.getRawValue();
      switch (this.action) {
        case PROXMOX_ACTIONS.CONVERT_TO_TEMPLATE:
          this.handleConvertToTemplate(authData);
          break;
        case PROXMOX_ACTIONS.DELETE:
          this.handleDelete(authData);
          break;
        case PROXMOX_ACTIONS.REBOOT:
          this.handleReboot(authData);
          break;
        case PROXMOX_ACTIONS.POWER_ON:
        case PROXMOX_ACTIONS.POWER_OFF:
          this.handlePower(authData);
          break;
        case PROXMOX_ACTIONS.CLONE:
          let cloneData = Object.assign({}, authData, this.cloneForm.getRawValue());
          this.handleClone(cloneData);
          break;
      }
    }
  }

  closeAuthModal() {
    this.authModalref.hide();
  }

  private handleError(error: HttpErrorResponse | TaskError | Error) {
    /**
     * `clone`, `reboot` and `convertToTemplate` 
     * API's server error response will be handled in this condition 
     */
    if (error instanceof HttpErrorResponse) {
      let err = error.error;
      this.authFormErrors = this.proxmoxService.resetAuthFormErrors();
      this.cloneFormErrors = this.proxmoxService.resetCloneFormErrors();
      if (err.detail) {
        this.authFormErrors['nonFieldErr'] = err.detail;
      } else if (err) {
        for (const field in err) {
          if (field in this.authForm.controls) {
            this.authFormErrors[field] = err[field][0];
          } else if (field in this.cloneForm.controls) {
            this.cloneFormErrors[field] = err[field][0];
          }
        }
      } else {
        this.closeAuthModal();
        this.notification.error(new Notification('Something went wrong!! Please try again.'));
      }
    }
    /**
    * `clone`, `reboot` and `convertToTemplate` 
    * API's celery timeout or error will be handled in this condition 
    */
    else if (error instanceof TaskError) {
      this.notification.warning(new Notification('Request is taking longer than usual. Please refresh after sometime'));
    }
    /**
    * If `clone`, `reboot` and `convertToTemplate` API are success but
    * returned API do not have `task_id` will be handled 
    */
    else {
      this.closeAuthModal();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  private pollForTask(res: CeleryTask) {
    if (res.task_id) {
      this.authModalref.hide();
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Request is being processed. Status will be updated shortly'));
      return this.appService.pollForTask(res.task_id, 4).pipe(take(1));
    } else {
      throw new Error('Something went wrong !... Please try again later');
    }
  }

  handleClone(data: ProxmoxCloneType) {
    this.proxmoxService.clone(this.deviceMapping, data).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      const index = this.viewData.map(view => view.uuid).indexOf(data.uuid);
      this.viewData[index].cloneInProgress = true;
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
      if (status.result.data) {
        this.notification.success(new Notification(`VM cloned successfully`));
      } else if (status.result['error']) {
        this.notification.error(new Notification(status.result['error']));
      }
      this.getVms();
    }, (err: HttpErrorResponse | TaskError | Error) => this.handleError(err));
  }

  handleDelete(data: ProxmoxAuthType) {
    this.proxmoxService.delete(this.deviceMapping, data).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      const index = this.viewData.map(view => view.uuid).indexOf(data.uuid);
      this.viewData[index].deleteInProgress = true;
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
      if (status.result.data) {
        this.notification.success(new Notification(`VM deleted successfully`));
      } else if (status.result['error']) {
        this.notification.error(new Notification(status.result['error']));
      }
      this.getVms();
    }, (err: HttpErrorResponse | TaskError | Error) => this.handleError(err));
  }

  handleReboot(data: ProxmoxAuthType) {
    this.proxmoxService.reboot(this.deviceMapping, data).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      const index = this.viewData.map(view => view.uuid).indexOf(data.uuid);
      this.viewData[index].rebootInProgress = true;
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
      if (status.result.data) {
        this.notification.success(new Notification(`VM rebooted successfully`));
      } else if (status.result['error']) {
        this.notification.error(new Notification(status.result['error']));
      }
      this.getVms();
    }, (err: HttpErrorResponse | TaskError | Error) => this.handleError(err));
  }

  handlePower(data: ProxmoxAuthType) {
    const i = this.viewData.map(view => view.uuid).indexOf(data.uuid);
    const input: PowerToggleInput = this.proxmoxService.getToggleInput(this.deviceMapping, this.viewData[i]);
    this.proxmoxService.powerToggle(input, data).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      const index = this.viewData.map(view => view.uuid).indexOf(data.uuid);
      this.viewData[index].setPowerInProgress();
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
      if (status.result.data) {
        let ac = input.currentPowerStatus ? 'off' : 'on'
        this.notification.success(new Notification(`VM powered ${ac} successfully`));
      } else if (status.result['error']) {
        this.notification.error(new Notification(status.result['error']));
      }
      this.getVms();
    }, (err: HttpErrorResponse | TaskError | Error) => this.handleError(err));
  }

  handleConvertToTemplate(data: ProxmoxAuthType) {
    this.proxmoxService.convertToTemplate(this.deviceMapping, data).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      const index = this.viewData.map(view => view.uuid).indexOf(data.uuid);
      this.viewData[index].convertInProgress = true;
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
      if (status.result.data) {
        this.notification.success(new Notification(`VM converted successfully`));
      } else if (status.result['error']) {
        this.notification.error(new Notification(status.result['error']));
      }
      this.getVms();
    }, (err: HttpErrorResponse | TaskError | Error) => this.handleError(err));
  }

  updateIp(view: ProxmoxVMViewData) {
    if (!view.updateIpIconEnabled) {
      return;
    }
    this.ipCrudService.updateMgmtIp({ mgmtIp: view.managementIp, vmId: view.uuid, vmType: this.platformType });
  }

  updateTags(view: ProxmoxVMViewData) {
    this.tagsCrudService.updateTags({ vmId: view.uuid, tags: view.tags, vmType: this.platformType });
  }
}
