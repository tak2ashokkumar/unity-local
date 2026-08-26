import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, Subject, Subscription, from, interval } from 'rxjs';
import { finalize, mergeMap, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { TaskError, TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { HYPERVISOR_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { DeviceZabbixEmailNotificationService } from 'src/app/shared/device-zabbix-email-notification/device-zabbix-email-notification.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { DevicePopoverData } from '../devices-popover/device-popover-data';
import { Hypervisor } from '../entities/hypervisor.type';
import { HypervisorsCrudService } from './hypervisors-crud/hypervisors-crud.service';
import { HypervisorPowerAuthFormErrors, HypervisorPowerTogglePayload, HypervisorViewData, HypervisorsService } from './hypervisors.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';
import { RemoteAccessService } from 'src/app/shared/remote-access/remote-access.service';

enum HypervisorPowerAction {
  POWER_ON = 'Power on',
  POWER_OFF = 'Power off'
}

@Component({
  selector: 'hypervisors',
  templateUrl: './hypervisors.component.html',
  styleUrls: ['./hypervisors.component.scss']
})
export class HypervisorsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private authFormSubscription: Subscription;
  private pcId: string;
  private clusterId: string;
  currentCriteria: SearchCriteria;
  activeCloud: PrivateCLoudFast;
  platformType: PlatFormMapping;
  platFormMapping = PlatFormMapping;
  deviceType: string = 'Hypervisors';

  count: number;
  viewData: HypervisorViewData[] = [];

  popData: DevicePopoverData;
  poll: boolean = false;

  modalRef: BsModalRef;
  @ViewChild('bulkDeleteModel') bulkDeleteModel: ElementRef;
  selectedHypervisorsIds: string[] = [];
  selectedAll: boolean = false;
  remoteWebLaunching: boolean = false;

  @ViewChild('bulkEditModel') bulkEditModel: ElementRef;
  fields: BulkUpdateFieldType[] = [];

  @ViewChild('powerAuthenticate') powerAuthenticate: ElementRef;
  powerAuthModalRef: BsModalRef;
  powerAuthForm: FormGroup;
  powerAuthFormErrors: HypervisorPowerAuthFormErrors;
  powerAuthValidationMessages: Record<string, Record<string, string>>;
  powerAction: HypervisorPowerAction;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private hypervisorsService: HypervisorsService,
    private spinnerService: AppSpinnerService,
    private appService: AppLevelService,
    private storageService: StorageService,
    private ticketService: SharedCreateTicketService,
    private crudService: HypervisorsCrudService,
    private utilSvc: AppUtilityService,
    private zabbixAlertConfig: DeviceZabbixEmailNotificationService,
    private termService: FloatingTerminalService,
    private modalService: BsModalService,
    private remoteAccess: RemoteAccessService,
    private notificationService: AppNotificationService) {

    this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      if (params.has('pcId')) {
        this.pcId = params.get('pcId');
        this.deviceType = 'Hypervisors';
        this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'uuid': this.pcId }] };
        this.route.parent.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
          if (this.pcId) {
            this.activeCloud = data.tabItems.find((ti: PrivateCLoudFast) => ti.uuid == this.pcId);
            if (this.activeCloud) {
              this.platformType = this.utilSvc.getCloudTypeByPlatformType(this.activeCloud.platform_type);
            }
          }
        });
      } else if (params.has('clusterId')) {
        this.clusterId = params.get('clusterId');
        this.deviceType = 'Hosts';
        this.route.parent.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((pms: ParamMap) => {
          if (pms.has('pcId')) {
            this.pcId = pms.get('pcId');
            this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'uuid': this.pcId, 'cluster_uuid': this.clusterId }] };
            this.route.parent.parent.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
              if (this.pcId) {
                this.activeCloud = data.tabItems.find((ti: PrivateCLoudFast) => ti.uuid == this.pcId);
                if (this.activeCloud) {
                  this.platformType = this.utilSvc.getCloudTypeByPlatformType(this.activeCloud.platform_type);
                }
              }
            });
          }
        })
      } else {
        this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
      }
    });

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getHypervisors());
  }

  ngOnInit() {
    this.loadCriteria();
    this.spinnerService.start('main');
    this.getDeviceBulkEditFields();
    this.getHypervisors();
    this.syncVcenterHypervisors();
  }

  ngOnDestroy() {
    this.modalRef?.hide();
    this.powerAuthModalRef?.hide();
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.authFormSubscription && !this.authFormSubscription.closed) {
      this.authFormSubscription.unsubscribe();
    }
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.extractByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.HYPERVISOR) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.HYPERVISOR }, StorageType.SESSIONSTORAGE)
  }

  get isCrudEnabled() {
    return this.pcId ? false : true;
  }

  get showDevicesColumns() {
    return this.pcId ? false : true;
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getHypervisors();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getHypervisors();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getHypervisors();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getHypervisors();
  }

  onCrud(event: CRUDActionTypes) {
    if (event == CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinnerService.start('main');
      if (event == CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getHypervisors();
    }
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getHypervisors();
  }

  syncVcenterHypervisors() {
    this.hypervisorsService.syncVcenterHypervisors().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.getHypervisors();
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  getHypervisors() {
    this.hypervisorsService.getHypervisors(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<Hypervisor>) => {
      this.count = data.count;
      this.viewData = this.hypervisorsService.convertToViewData(data.results, this.clusterId);
      if (this.selectedHypervisorsIds?.length) {
        this.viewData.forEach((i) => { i.isSelected = this.selectedHypervisorsIds.includes(i.deviceId) })
      }
      this.spinnerService.stop('main');
      this.getDeviceData();
    }, err => {
      this.spinnerService.stop('main');
    });
  }


  getDeviceBulkEditFields() {
    this.hypervisorsService.getDeviceBulkEditFields().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: BulkUpdateFieldType[]) => {
      this.fields = res;
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.hypervisorsService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  goToDetails(view: HypervisorViewData) {
    if (view.monitoring.observium) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.HYPERVISOR, configured: view.monitoring.configured, os: view.os, ssr_os: view.platformType }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.deviceId, 'zbx', 'details'], { relativeTo: this.route });
  }

  goToStats(view: HypervisorViewData) {
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.HYPERVISOR, configured: view.monitoring.configured, os: view.os, ssr_os: view.platformType }, StorageType.SESSIONSTORAGE);
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

  goToVMS(view: HypervisorViewData) {
    if (!view.isESXIHypervisor) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', { name: view.name }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.deviceId, 'vms'], { relativeTo: this.route });
  }

  webAccessSameTab(view: HypervisorViewData) {
    if (!view.sameTabWebAccessUrl) {
      return;
    }
    this.storageService.put('url', view.sameTabWebAccessUrl, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.deviceId, 'webaccess'], { relativeTo: this.route });
  }

  consoleSameTab(view: HypervisorViewData) {
    if (!view.sameTabConsoleAccessUrl) {
      return;
    }
    let obj: ConsoleAccessInput = this.hypervisorsService.getConsoleAccessInput(view);
    this.termService.openTerminal(obj);
    // this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    // this.router.navigate([view.deviceId, 'console'], { relativeTo: this.route });
  }

  webAccessNewTab(view: HypervisorViewData) {
    if (!view?.newTabWebAccessUrl) {
      return;
    }
    this.appService.updateActivityLog('servers', view.deviceId);
    window.open(view.newTabWebAccessUrl);
  }

  remoteWebAccessNewTab(view: HypervisorViewData): void {
    if (!view?.showRemoteWebAccessButton || this.remoteWebLaunching) {
      return;
    }
    const resourceId = view.remoteWebAccess?.resource_id || view.deviceId;
    if (!resourceId) {
      this.notificationService.error(new Notification('Unable to open hypervisor web console. Resource identifier is missing.'));
      return;
    }
    const viewerWindow = this.openIsolatedViewerTab();
    if (!viewerWindow) {
      this.notificationService.error(new Notification('Popup blocked. Allow popups for UnityOne and try opening the web console again.'));
      return;
    }

    this.remoteWebLaunching = true;
    this.remoteAccess.createVCenterWebLaunch(resourceId)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => this.remoteWebLaunching = false)
      )
      .subscribe(launch => {
        if (!launch.viewerUrl) {
          viewerWindow.close();
          this.notificationService.error(new Notification('Remote web viewer URL was not returned by UnityOne.'));
          return;
        }
        this.appService.updateActivityLog('servers', view.deviceId);
        viewerWindow.location.replace(launch.viewerUrl);
      }, err => {
        viewerWindow.close();
        this.notificationService.error(new Notification(this.remoteWebErrorMessage(err)));
      });
  }

  private openIsolatedViewerTab(): Window | null {
    const viewerWindow = window.open('about:blank', '_blank');
    if (viewerWindow) {
      viewerWindow.opener = null;
      try {
        viewerWindow.document.title = 'Opening UnityOne Remote Web Viewer';
        viewerWindow.document.body.innerHTML = '<div style="font-family:Arial,sans-serif;padding:24px;">Opening UnityOne Remote Web Viewer...</div>';
      } catch (e) { }
    }
    return viewerWindow;
  }

  private remoteWebErrorMessage(err: any): string {
    return err?.error?.error || err?.error?.detail || err?.message || 'Unable to create remote web session. Please try again or contact support.';
  }

  consoleNewTab(view: HypervisorViewData) {
    if (!view.newTabConsoleAccessUrl) {
      return;
    }
    if (view.isCollectorZtc) {
      window.open(view.newTabConsoleAccessUrl);
    } else {
      let obj: ConsoleAccessInput = this.hypervisorsService.getConsoleAccessInput(view);
      obj.newTab = true;
      this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
      this.appService.updateActivityLog('servers', view.deviceId);
      window.open(view.newTabConsoleAccessUrl);
    }
  }

  createTicket(data: HypervisorViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.HYPERVISOR, data.name), metadata: HYPERVISOR_TICKET_METADATA(DeviceMapping.HYPERVISOR, data.name, data.virtualizationType, data.os, data.managementIP)
    }, DeviceMapping.HYPERVISOR);
  }

  addHypervisor() {
    this.crudService.addOrEditHypervisor(null);
  }

  notifyHypervisor(view: HypervisorViewData) {
    this.zabbixAlertConfig.notify(view.deviceId, DeviceMapping.HYPERVISOR);
  }

  editHypervisor(deviceId: string) {
    this.crudService.addOrEditHypervisor(deviceId);
  }

  resetHypervisorPassword(view: HypervisorViewData) {
    if (!view.isESXIHypervisor) {
      return;
    }
    this.crudService.resetPassword(view.deviceId);
  }

  powerToggle(view: HypervisorViewData): void {
    if (!view.powerIconEnabled) {
      return;
    }
    this.powerAction = view.powerStatusOn ? HypervisorPowerAction.POWER_OFF : HypervisorPowerAction.POWER_ON;
    this.buildPowerAuthForm(view.deviceId);
  }

  private buildPowerAuthForm(uuid: string): void {
    this.powerAuthForm = this.hypervisorsService.buildPowerAuthForm(uuid);
    this.powerAuthFormErrors = this.hypervisorsService.resetPowerAuthFormErrors();
    this.powerAuthValidationMessages = this.hypervisorsService.powerAuthValidationMessages;
    if (this.authFormSubscription && !this.authFormSubscription.closed) {
      this.authFormSubscription.unsubscribe();
    }
    this.powerAuthModalRef = this.modalService.show(this.powerAuthenticate, Object.assign({}, { class: '', keyboard: false, ignoreBackdropClick: true }));
  }

  onPowerSubmit(): void {
    if (this.powerAuthForm.invalid) {
      this.powerAuthFormErrors = this.utilSvc.validateForm(this.powerAuthForm, this.powerAuthValidationMessages, this.powerAuthFormErrors);
      if (this.authFormSubscription && !this.authFormSubscription.closed) {
        this.authFormSubscription.unsubscribe();
      }
      this.authFormSubscription = this.powerAuthForm.valueChanges
        .subscribe((data: any) => {
          this.powerAuthFormErrors = this.utilSvc.validateForm(this.powerAuthForm, this.powerAuthValidationMessages, this.powerAuthFormErrors);
        });
      return;
    }
    this.spinnerService.start('main');
    this.powerAuthFormErrors = this.hypervisorsService.resetPowerAuthFormErrors();
    this.handlePower(this.powerAuthForm.getRawValue());
  }

  closePowerAuthModal(): void {
    this.powerAuthModalRef?.hide();
    if (this.authFormSubscription && !this.authFormSubscription.closed) {
      this.authFormSubscription.unsubscribe();
    }
  }

  private handlePower(data: HypervisorPowerTogglePayload): void {
    const index = this.viewData.map(view => view.deviceId).indexOf(data.uuid);
    if (index == -1) {
      this.closePowerAuthModal();
      this.spinnerService.stop('main');
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
      return;
    }
    const powerStatusOn = this.viewData[index].powerStatusOn;
    this.hypervisorsService.toggleHyperVHypervisorPower(data, powerStatusOn).pipe(switchMap((res: CeleryTask) => {
      this.viewData[index].setPowerInProgress();
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
      if (status.result['error']) {
        this.notificationService.error(new Notification(status.result['error']));
      } else {
        const action = powerStatusOn ? 'off' : 'on';
        this.notificationService.success(new Notification(`Hypervisor powered ${action} successfully`));
      }
      this.getHypervisors();
    }, (err: HttpErrorResponse | TaskError | Error) => {
      this.clearPowerInProgress(data.uuid);
      this.handlePowerError(err);
    });
  }

  private pollForTask(res: CeleryTask): Observable<TaskStatus> {
    if (res.task_id) {
      this.closePowerAuthModal();
      this.spinnerService.stop('main');
      this.notificationService.success(new Notification('Request is being processed. Status will be updated shortly'));
      return this.appService.pollForTask(res.task_id, 3, 200).pipe(take(1));
    } else {
      throw new Error('Something went wrong !... Please try again later');
    }
  }

  private clearPowerInProgress(uuid: string): void {
    const index = this.viewData.map(view => view.deviceId).indexOf(uuid);
    if (index != -1) {
      this.viewData[index].clearPowerInProgress();
    }
  }

  private handlePowerError(error: HttpErrorResponse | TaskError | Error): void {
    if (error instanceof HttpErrorResponse) {
      const err = error.error;
      this.powerAuthFormErrors = this.hypervisorsService.resetPowerAuthFormErrors();
      if (err?.detail) {
        this.powerAuthFormErrors.nonFieldErr = err.detail;
      } else if (err && typeof err == 'object') {
        for (const field in err) {
          if (field in this.powerAuthForm.controls) {
            const fieldError = err[field];
            this.powerAuthFormErrors[field] = Array.isArray(fieldError) ? fieldError[0] : fieldError;
          }
        }
      } else {
        this.closePowerAuthModal();
        this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
      }
    } else if (error instanceof TaskError) {
      this.notificationService.warning(new Notification('Request is taking longer than usual. Please refresh after sometime'));
    } else if (error instanceof Error && error.message) {
      this.notificationService.error(new Notification(error.message));
    } else {
      this.closePowerAuthModal();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  deleteHypervisor(deviceId: string) {
    this.crudService.deleteHypervisor(deviceId);
  }

  select(view: HypervisorViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedHypervisorsIds.splice(this.selectedHypervisorsIds.indexOf(view.deviceId), 1);
    } else {
      this.selectedHypervisorsIds.push(view.deviceId);
    }
    this.selectedAll = this.selectedHypervisorsIds.length == this.viewData.length;
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
        this.selectedHypervisorsIds.push(view.deviceId);
      });
    } else {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedHypervisorsIds = [];
    }
  }


  cancelButton() {
    this.modalRef.hide()
    this.viewData.forEach(view => {
      view.isSelected = false;
    });
    this.selectedHypervisorsIds = [];
    this.selectedAll = false;
  }

  bulkDelete() {
    this.modalRef = this.modalService.show(this.bulkDeleteModel, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmMultipleDelete() {
    this.spinnerService.start('main');
    this.modalRef.hide();
    this.hypervisorsService.deleteMulitpleHypervisors(this.selectedHypervisorsIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedHypervisorsIds = [];
      this.selectedAll = false;
      this.getHypervisors();
      this.notificationService.success(new Notification('Hypervisors Deleted successfully'));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedHypervisorsIds = [];
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

    this.hypervisorsService.updateMultipleSwitches(this.selectedHypervisorsIds, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.selectedHypervisorsIds = [];
      this.selectedAll = false;
      this.getHypervisors();
      this.notificationService.success(new Notification('Hypervisors Updated successfully'));
      this.spinnerService.stop('main');
    },
      err => {
        this.viewData.forEach(view => {
          view.isSelected = false;
        });
        this.selectedHypervisorsIds = [];
        this.selectedAll = false;
        this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
        this.spinnerService.stop('main');
      }
    );
  }
}
