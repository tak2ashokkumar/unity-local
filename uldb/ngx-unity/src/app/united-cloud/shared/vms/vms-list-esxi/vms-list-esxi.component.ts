import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription, from, interval, throwError } from 'rxjs';
import { catchError, mergeMap, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskError, TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { TICKET_SUBJECT, VM_WARE_TICKET_METADATA } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { DevicePopoverData } from '../../devices-popover/device-popover-data';
import { PowerToggleInput } from '../../server-power-toggle/server-power-toggle.service';
import { VmsMgmtCrudService } from '../vms-mgmt-crud/vms-mgmt-crud.service';
import { VmsTagsCrudService } from '../vms-tags-crud/vms-tags-crud.service';
import { VmsService } from '../vms.service';
import { ESXI_VM_ACTIONS, EsxiVMAuthType, EsxiViewData, VmsListEsxiService } from './vms-list-esxi.service';
@Component({
  selector: 'vms-list-esxi',
  templateUrl: './vms-list-esxi.component.html',
  styleUrls: ['./vms-list-esxi.component.scss'],
  providers: [VmsListEsxiService]
})
export class VmsListEsxiComponent implements OnInit, OnDestroy {
  popData: DevicePopoverData;
  pcId: string;
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number;
  @ViewChild('serverinfo') serverinfo: ElementRef;
  modalRef: BsModalRef;
  info: EsxiViewData;
  viewData: EsxiViewData[] = [];
  inDevicesPage: boolean;
  poll: boolean = false;
  syncInProgress: boolean = false;

  action: ESXI_VM_ACTIONS;
  private subscription: Subscription;

  @ViewChild('authenticate') authenticate: ElementRef;
  authModalref: BsModalRef;
  authForm: FormGroup;
  authFormErrors: any;
  authValidationMessages: any;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private vmsService: VmsService,
    private spinnerService: AppSpinnerService,
    private appService: AppLevelService,
    private ipCrudService: VmsMgmtCrudService,
    private tagsCrudService: VmsTagsCrudService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private VmsEsxiService: VmsListEsxiService,
    private storageService: StorageService,
    private modalService: BsModalService,
    private ticketService: SharedCreateTicketService,
    private termService: FloatingTerminalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}] };
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.inDevicesPage = this.pcId ? false : true;
      this.currentCriteria.params[0]['cloud_id'] = this.pcId;
    });
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.currentCriteria.params[0]['server_uuid'] = params.get('deviceId');
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
    if (filter && filter.deviceType == DeviceMapping.ESXI) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.ESXI }, StorageType.SESSIONSTORAGE)
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
      this.spinnerService.stop('main');
      return;
    }
    this.syncInProgress = true;
    this.vmsService.createTaskAndPoll(this.pcId, PlatFormMapping.ESXI).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(status => {
        this.getVms();
        this.syncInProgress = false;
        this.subscribeToTerminal();
      }, (err: Error) => {
        this.syncInProgress = false;
        this.subscribeToTerminal();
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Error while fetching Esxi virtual machines'));
      });
  }

  getVms() {
    this.VmsEsxiService.getVms(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.VmsEsxiService.converToViewData(res.results);
      this.spinnerService.stop('main');
      this.getDeviceData();
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.VmsEsxiService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => { }
      )
  }

  updateIp(view: EsxiViewData) {
    this.ipCrudService.updateMgmtIp({ mgmtIp: view.managementIp, vmId: view.vmId, vmType: PlatFormMapping.ESXI });
  }

  updateTags(view: EsxiViewData) {
    this.tagsCrudService.updateTags({ vmId: view.vmId, tags: view.tags, vmType: PlatFormMapping.ESXI });
  }

  showInfo(view: EsxiViewData) {
    this.info = view;
    this.modalRef = this.modalService.show(this.serverinfo, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  consoleSameTab(view: EsxiViewData) {
    if (!view.isSameTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.VmsEsxiService.getConsoleAccessInput(view);
    obj.managementIp = view.managementIp;
    this.termService.openTerminal(obj);
    // this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    // this.router.navigate([view.vmId, 'console'], { relativeTo: this.route });
  }

  consoleNewTab(view: EsxiViewData) {
    if (!view.isNewTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.VmsEsxiService.getConsoleAccessInput(view);
    obj.managementIp = view.managementIp;
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    window.open(view.newTabConsoleAccessUrl);
  }

  goToDetails(view: EsxiViewData) {
    if (view.monitoring.observium) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.ESXI, configured: view.monitoring.configured, os: view.osName, ssr_os: view.ssrOS }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.vmId, 'zbx', 'details'], { relativeTo: this.route });
  }

  goToStats(view: EsxiViewData) {
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.ESXI, configured: view.monitoring.configured, os: view.osName, ssr_os: view.ssrOS }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.observium) {
      if (view.monitoring.configured && view.monitoring.enabled) {
        this.router.navigate([view.vmId, 'obs', 'overview'], { relativeTo: this.route });
      } else {
        this.router.navigate([view.vmId, 'obs', 'configure'], { relativeTo: this.route });
      }
    } else {
      if (view.monitoring.configured && view.monitoring.enabled) {
        this.router.navigate([view.vmId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      } else {
        this.router.navigate([view.vmId, 'zbx', 'configure'], { relativeTo: this.route });
      }
    }
  }

  createTicket(data: EsxiViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.ESXI, data.name), metadata: VM_WARE_TICKET_METADATA(DeviceMapping.ESXI, data.name, data.powerStatus, data.osName, data.managementIp, data.hypervisor)
    }, DeviceMapping.VIRTUAL_MACHINE);
  }

  powerToggle(view: EsxiViewData) {
    if (!view.powerIconEnabled) {
      return;
    }
    this.action = view.powerStatusOn ? ESXI_VM_ACTIONS.POWER_OFF : ESXI_VM_ACTIONS.POWER_ON;
    this.buildAuthForm(view.vmId);
  }

  buildAuthForm(uuid: string) {
    this.authForm = this.VmsEsxiService.buildAuthForm(uuid);
    this.authFormErrors = this.VmsEsxiService.resetAuthFormErrors();
    this.authValidationMessages = this.VmsEsxiService.authValidationMessages;
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
    this.authModalref = this.modalService.show(this.authenticate, Object.assign({}, { class: '', keyboard: false, ignoreBackdropClick: true }));
  }

  onSubmit() {
    if (this.authForm.invalid) {
      this.authFormErrors = this.utilService.validateForm(this.authForm, this.authValidationMessages, this.authFormErrors);
      this.subscription = this.authForm.valueChanges
        .subscribe((data: any) => { this.authFormErrors = this.utilService.validateForm(this.authForm, this.authValidationMessages, this.authFormErrors); });
      return;
    } else {
      this.spinnerService.start('main');
      this.authFormErrors = this.VmsEsxiService.resetAuthFormErrors();
      let authData = this.authForm.getRawValue();
      switch (this.action) {
        case ESXI_VM_ACTIONS.POWER_ON:
        case ESXI_VM_ACTIONS.POWER_OFF:
          this.handlePower(authData);
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
      this.authFormErrors = this.VmsEsxiService.resetAuthFormErrors();
      if (err.detail) {
        this.authFormErrors['nonFieldErr'] = err.detail;
      } else if (err) {
        for (const field in err) {
          if (field in this.authForm.controls) {
            this.authFormErrors[field] = err[field][0];
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
      return this.appService.pollForTask(res.task_id, 5, 300).pipe(take(1));
    } else {
      throw new Error('Something went wrong !... Please try again later');
    }
  }

  updateVm(vmId: string, index: number) {
    this.VmsEsxiService.getVmById(vmId).pipe(take(1)).subscribe(res => {
      this.viewData[index] = this.VmsEsxiService.convertVMtoViewdata(res);
    }, err => {
    });
  }

  handlePower(data: EsxiVMAuthType) {
    const i = this.viewData.map(view => view.vmId).indexOf(data.uuid);
    const input: PowerToggleInput = this.VmsEsxiService.getToggleInput(this.viewData[i]);
    for (const field in input.extraParams) {
      data[field] = input.extraParams[field];
    }
    this.VmsEsxiService.powerToggle(input, data).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      const index = this.viewData.map(view => view.vmId).indexOf(data.uuid);
      this.viewData[index].setPowerInProgress();
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
      if (status.result.data) {
        let ac = input.currentPowerStatus ? 'off' : 'on'
        this.notification.success(new Notification(`VM powered ${ac} successfully`));
      } else if (status.result['error']) {
        this.notification.error(new Notification(status.result['error']));
      }
      this.updateVm(this.viewData[i].vmId, i);
    }, (err: HttpErrorResponse | TaskError | Error) => this.handleError(err));
  }
}