import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, from, interval } from 'rxjs';
import { mergeMap, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { TICKET_SUBJECT, VM_WARE_TICKET_METADATA } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { DevicePopoverData } from '../../devices-popover/device-popover-data';
import { PowerToggleInput, ServerPowerToggleService } from '../../server-power-toggle/server-power-toggle.service';
import { VmsMgmtCrudService } from '../vms-mgmt-crud/vms-mgmt-crud.service';
import { VmsTagsCrudService } from '../vms-tags-crud/vms-tags-crud.service';
import { VmsService } from '../vms.service';
import { VCloudVMViewData, VmsListVcloudService } from './vms-list-vcloud.service';

@Component({
  selector: 'vms-list-vcloud',
  templateUrl: './vms-list-vcloud.component.html',
  styleUrls: ['./vms-list-vcloud.component.scss'],
  providers: [VmsListVcloudService]
})
export class VmsListVcloudComponent implements OnInit, OnDestroy {
  popData: DevicePopoverData;
  pcId: string;
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number;
  @ViewChild('serverinfo') serverinfo: ElementRef;
  modalRef: BsModalRef;
  info: VCloudVMViewData;
  viewData: VCloudVMViewData[] = [];
  inDevicesPage: boolean;
  poll: boolean = false;
  syncInProgress: boolean = false;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private vmsService: VmsService,
    private spinnerService: AppSpinnerService,
    private ipCrudService: VmsMgmtCrudService,
    private tagsCrudService: VmsTagsCrudService,
    private appService: AppLevelService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private vCloudService: VmsListVcloudService,
    private storageService: StorageService,
    private modalService: BsModalService,
    private ticketService: SharedCreateTicketService,
    private toggleService: ServerPowerToggleService,
    private termService: FloatingTerminalService) {
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
        this.getVms();
        this.createTaskAndPoll();
      });
  }

  ngOnInit() {
    this.loadCriteria();
    this.spinnerService.start('main');
    this.getVms();
    this.createTaskAndPoll();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.extractByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.VCLOUD) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.VCLOUD }, StorageType.SESSIONSTORAGE)
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
    this.vmsService.createTaskAndPoll(this.pcId, PlatFormMapping.VCLOUD).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(status => {
        this.getVms();
        // if (status.result.data) {
        // } else {
        //   this.spinnerService.stop('main');
        //   this.notification.error(new Notification(status.result.message));
        // }
        this.syncInProgress = false;
        this.subscribeToTerminal();
      }, (err: Error) => {
        this.syncInProgress = false;
        this.subscribeToTerminal();
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Error while fetching VCloud virtual machines'));
      });
  }

  getVms() {
    this.vCloudService.getVms(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.vCloudService.converToViewData(res.results);
      this.spinnerService.stop('main');
      this.getDeviceData();
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.vCloudService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => { }
      )
  }

  updateVmPower(vmId: string, index: number) {
    this.vCloudService.getVmById(vmId).pipe(take(1)).subscribe(res => {
      this.viewData[index] = this.vCloudService.convertVMtoViewdata(res);
    }, err => {
    });
  }

  powerToggle(view: VCloudVMViewData) {
    if (!view.isPowerButtonEnabled) {
      return;
    }
    const input: PowerToggleInput = this.vCloudService.getToggleInput(view);
    view.powerStatusIcon = 'fa-spinner fa-spin';
    this.toggleService.togglePower(input).pipe(take(1)).subscribe(res => {
      if (res) {
        const index = this.viewData.map(data => data.instanceId).indexOf(view.instanceId);
        this.viewData[index].powerStatus = null;
        this.notification.success(new Notification('Request is being processed. Status will be updated shortly'));
        this.appService.pollForTask(res['task_id']).pipe(take(1)).subscribe(status => {
          view.powerStatusIcon = 'fa-power-off';
          if (status.result['success']) {
            this.notification.success(new Notification(`VM Powered ${this.viewData[index].powerStatusOn ? 'OFF' : 'ON'}`));
          } else if (status.result['error']) {
            this.notification.error(new Notification(status.result['error']));
          }
          this.updateVmPower(this.viewData[index].vmId, index);
        }, err => { });
      } else {
        view.powerStatusIcon = 'fa-power-off';
      }
    });
  }

  updateIp(view: VCloudVMViewData) {
    this.ipCrudService.updateMgmtIp({ mgmtIp: view.managementIp, vmId: view.vmId, vmType: PlatFormMapping.VCLOUD });
  }

  updateTags(view: VCloudVMViewData) {
    this.tagsCrudService.updateTags({ vmId: view.vmId, tags: view.tags, vmType: PlatFormMapping.VCLOUD });
  }

  showInfo(view: VCloudVMViewData) {
    this.info = view;
    this.modalRef = this.modalService.show(this.serverinfo, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  consoleSameTab(view: VCloudVMViewData) {
    if (!view.isSameTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.vCloudService.getConsoleAccessInput(view);
    obj.managementIp = view.managementIp;
    this.termService.openTerminal(obj);
    // this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    // this.router.navigate([view.vmId, 'console'], { relativeTo: this.route });
  }

  consoleNewTab(view: VCloudVMViewData) {
    if (!view.isNewTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.vCloudService.getConsoleAccessInput(view);
    obj.managementIp = view.managementIp;
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    window.open(view.newTabConsoleAccessUrl);
  }

  goToStats(view: VCloudVMViewData) {
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.VCLOUD, configured: view.monitoring.configured, os: view.osName, ssr_os: view.ssrOS }, StorageType.SESSIONSTORAGE);
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

  createTicket(data: VCloudVMViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.VCLOUD, data.name), metadata: VM_WARE_TICKET_METADATA(DeviceMapping.VCLOUD, data.name, data.powerStatus, data.osName, data.managementIp, 'N/A')
    }, DeviceMapping.VIRTUAL_MACHINE);
  }
}
