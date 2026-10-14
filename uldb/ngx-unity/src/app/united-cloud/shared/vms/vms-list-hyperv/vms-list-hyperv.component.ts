import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable, Subject, Subscription, from, interval } from 'rxjs';
import { switchMap, mergeMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { HYPERV_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskError, TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { DevicePopoverData } from '../../devices-popover/device-popover-data';
import { VmsTagsCrudService } from '../vms-tags-crud/vms-tags-crud.service';
import { VmsService } from '../vms.service';
import { HypervVMPowerAuthFormErrors, HypervVMPowerTogglePayload, HypervVMViewData, VmsListHypervService } from './vms-list-hyperv.service';

enum HypervPowerAction {
  POWER_ON = 'Power on',
  POWER_OFF = 'Power off'
}

@Component({
  selector: 'vms-list-hyperv',
  templateUrl: './vms-list-hyperv.component.html',
  styleUrls: ['./vms-list-hyperv.component.scss'],
  providers: [VmsListHypervService]
})
export class VmsListHypervComponent implements OnInit {
  @Input('platform') platformType: PlatFormMapping;
  @Input('deviceMapping') deviceMapping: DeviceMapping;
  popData: DevicePopoverData;
  pcId: string;
  private ngUnsubscribe = new Subject();
  private subscription: Subscription;
  currentCriteria: SearchCriteria;
  count: number;
  inDevicesPage: boolean;
  poll: boolean = false;
  syncInProgress: boolean = false;
  viewData: HypervVMViewData[] = [];
  info: HypervVMViewData;
  @ViewChild('serverinfo') serverinfo: ElementRef;
  modalRef: BsModalRef;
  @ViewChild('authenticate') authenticate: ElementRef;
  authModalRef: BsModalRef;
  authForm: FormGroup;
  authFormErrors: HypervVMPowerAuthFormErrors;
  authValidationMessages: Record<string, Record<string, string>>;
  action: HypervPowerAction;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private appService: AppLevelService,
    private vmsService: VmsService,
    private ticketService: SharedCreateTicketService,
    private hyperVService: VmsListHypervService,
    private termService: FloatingTerminalService,
    private modalService: BsModalService,
    private storageService: StorageService,
    private spinnerService: AppSpinnerService,
    private utilService: AppUtilityService,
    private tagsCrudService: VmsTagsCrudService,
    private notification: AppNotificationService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.inDevicesPage = this.pcId ? false : true;
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'cloud_id': this.pcId }] };
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
    if (this.modalRef) {
      this.modalRef.hide();
      this.modalRef = null;
    }
    if (this.authModalRef) {
      this.authModalRef.hide();
      this.authModalRef = null;
    }
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.extractByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.HYPER_V) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.HYPER_V }, StorageType.SESSIONSTORAGE)
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
    this.vmsService.createTaskAndPoll(this.pcId, PlatFormMapping.HYPER_V).pipe(takeUntil(this.ngUnsubscribe))
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
        this.notification.error(new Notification(`Error while fetching ${PlatFormMapping.HYPER_V} virtual machines`));
      });
  }

  getVms() {
    this.hyperVService.getVms(PlatFormMapping.HYPER_V, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.hyperVService.converToViewData(res.results);
      this.spinnerService.stop('main');
      this.getDeviceData();
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification(`Error while fetching Hyper-V virtual machines`));
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.hyperVService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => { }
      )
  }

  goToDetails(view: HypervVMViewData) {
    if (view.monitoring.observium) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.HYPER_V, configured: view.monitoring.configured, os: view.osName, ssr_os: view.ssrOS }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.uuid, 'zbx', 'details'], { relativeTo: this.route });
  }

  goToStats(view: HypervVMViewData) {
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.HYPER_V, configured: view.monitoring.configured, os: view.osName, ssr_os: view.ssrOS }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.observium) {
      if (view.monitoring.configured && view.monitoring.enabled) {
        this.router.navigate([view.uuid, 'obs', 'overview'], { relativeTo: this.route });
      } else {
        this.router.navigate([view.uuid, 'obs', 'configure'], { relativeTo: this.route });
      }
    } else {
      if (view.monitoring.configured && view.monitoring.enabled) {
        this.router.navigate([view.uuid, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      } else {
        this.router.navigate([view.uuid, 'zbx', 'configure'], { relativeTo: this.route });
      }
    }
  }

  showInfo(view: HypervVMViewData) {
    this.info = view;
    this.modalRef = this.modalService.show(this.serverinfo, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  powerToggle(view: HypervVMViewData): void {
    if (!view.powerIconEnabled) {
      return;
    }
    this.action = view.powerStatusOn ? HypervPowerAction.POWER_OFF : HypervPowerAction.POWER_ON;
    this.buildAuthForm(view);
  }

  consoleSameTab(view: HypervVMViewData) {
    if (!view.isSameTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.hyperVService.getConsoleAccessInput(this.deviceMapping, view);
    obj.managementIp = view.managementIp;
    this.termService.openTerminal(obj);
  }

  consoleNewTab(view: HypervVMViewData) {
    if (!view.isNewTabEnabled) {
      return;
    }
    if (view.isCollectorZtc) {
      window.open(view.newTabConsoleAccessUrl);
    } else {
      let obj: ConsoleAccessInput = this.hyperVService.getConsoleAccessInput(this.deviceMapping, view);
      obj.managementIp = view.managementIp;
      obj.newTab = true;
      this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
      window.open(view.newTabConsoleAccessUrl);
    }
  }

  createTicket(data: HypervVMViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.HYPER_V, data.name), metadata: HYPERV_TICKET_METADATA(data.vmId, DeviceMapping.HYPER_V, data.name, data.powerStatus, data.osName, data.managementIp, 'N/A')
    }, DeviceMapping.VIRTUAL_MACHINE);
  }

  updateTags(view: HypervVMViewData) {
    this.tagsCrudService.updateTags({ vmId: view.uuid, tags: view.tags, vmType: PlatFormMapping.HYPER_V });
  }

  private buildAuthForm(view: HypervVMViewData): void {
    this.authForm = this.hyperVService.buildPowerAuthForm(view);
    this.authFormErrors = this.hyperVService.resetPowerAuthFormErrors();
    this.authValidationMessages = this.hyperVService.powerAuthValidationMessages;
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
    this.authModalRef = this.modalService.show(this.authenticate, Object.assign({}, { class: '', keyboard: false, ignoreBackdropClick: true }));
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      this.authFormErrors = this.hyperVService.resetPowerAuthFormErrors();
      this.authFormErrors = this.utilService.validateForm(this.authForm, this.authValidationMessages, this.authFormErrors);
      if (this.subscription && !this.subscription.closed) {
        this.subscription.unsubscribe();
      }
      this.subscription = this.authForm.valueChanges.subscribe(() => {
        this.authFormErrors = this.utilService.validateForm(this.authForm, this.authValidationMessages, this.authFormErrors);
      });
      return;
    }
    this.spinnerService.start('main');
    this.authFormErrors = this.hyperVService.resetPowerAuthFormErrors();
    this.handlePower(this.authForm.getRawValue());
  }

  closeAuthModal(): void {
    this.authModalRef?.hide();
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
  }

  private handlePower(data: HypervVMPowerTogglePayload): void {
    const index = this.viewData.map(view => view.uuid).indexOf(data.uuid);
    if (index == -1) {
      this.closeAuthModal();
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
      return;
    }
    const powerStatusOn = this.viewData[index].powerStatusOn;
    this.hyperVService.toggleHypervVMPower(data, powerStatusOn).pipe(
      switchMap((res: CeleryTask) => {
        this.viewData[index].setPowerInProgress();
        return this.pollForTask(res);
      }),
      take(1),
      takeUntil(this.ngUnsubscribe)
    ).subscribe((status: TaskStatus) => {
      if (status.result['error']) {
        this.notification.error(new Notification(status.result['error']));
      } else {
        const action = powerStatusOn ? 'off' : 'on';
        this.notification.success(new Notification(`VM powered ${action} successfully`));
      }
      this.getVms();
    }, (err: HttpErrorResponse | TaskError | Error) => {
      this.clearPowerInProgress(data.uuid);
      this.handlePowerError(err);
    });
  }

  private pollForTask(res: CeleryTask): Observable<TaskStatus> {
    if (res.task_id) {
      this.closeAuthModal();
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Request is being processed. Status will be updated shortly'));
      return this.appService.pollForTask(res.task_id, 3, 200).pipe(take(1));
    }
    throw new Error('Something went wrong !... Please try again later');
  }

  private clearPowerInProgress(uuid: string): void {
    const index = this.viewData.map(view => view.uuid).indexOf(uuid);
    if (index != -1) {
      this.viewData[index].clearPowerInProgress();
    }
  }

  private handlePowerError(error: HttpErrorResponse | TaskError | Error): void {
    if (error instanceof HttpErrorResponse) {
      const err = error.error;
      this.authFormErrors = this.hyperVService.resetPowerAuthFormErrors();
      if (err?.detail) {
        this.authFormErrors.nonFieldErr = err.detail;
      } else if (err && typeof err == 'object') {
        for (const field in err) {
          if (field in this.authForm.controls) {
            const fieldError = err[field];
            this.authFormErrors[field] = Array.isArray(fieldError) ? fieldError[0] : fieldError;
          }
        }
      } else {
        this.closeAuthModal();
        this.notification.error(new Notification('Something went wrong!! Please try again.'));
      }
    } else if (error instanceof TaskError) {
      this.notification.warning(new Notification('Request is taking longer than usual. Please refresh after sometime'));
    } else if (error instanceof Error && error.message) {
      this.closeAuthModal();
      this.notification.error(new Notification(error.message));
    } else {
      this.closeAuthModal();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }
}
