import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, from, interval, of } from 'rxjs';
import { mergeMap, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { OPENSTACK_WARE_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { DevicePopoverData } from '../../devices-popover/device-popover-data';
import { PowerToggleInput, ServerPowerToggleService } from '../../server-power-toggle/server-power-toggle.service';
import { VmsTagsCrudService } from '../vms-tags-crud/vms-tags-crud.service';
import { VmsService } from '../vms.service';
import { OpenStackVM, OpenStackViewData, VmsListOpenstackService } from './vms-list-openstack.service';

@Component({
  selector: 'vms-list-openstack',
  templateUrl: './vms-list-openstack.component.html',
  styleUrls: ['./vms-list-openstack.component.scss'],
  providers: [VmsListOpenstackService]
})
export class VmsListOpenstackComponent implements OnInit, OnDestroy {
  popData: DevicePopoverData;
  pcId: string;
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number;
  @ViewChild('serverinfo') serverinfo: ElementRef;
  modalRef: BsModalRef;
  info: OpenStackViewData;
  viewData: OpenStackViewData[] = [];
  inDevicesPage: boolean;
  poll: boolean = false;
  syncInProgress: boolean = false;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private vmsService: VmsService,
    private spinnerService: AppSpinnerService,
    private appService: AppLevelService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private openstackService: VmsListOpenstackService,
    private storageService: StorageService,
    private modalService: BsModalService,
    private ticketService: SharedCreateTicketService,
    private toggleService: ServerPowerToggleService,
    private tagsCrudService: VmsTagsCrudService,
    private termService: FloatingTerminalService,) {
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
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.extractByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.OPENSTACK_VIRTUAL_MACHINE) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.OPENSTACK_VIRTUAL_MACHINE }, StorageType.SESSIONSTORAGE)
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
    this.createTaskAndPoll();
  }

  createTaskAndPoll() {
    if (this.syncInProgress) {
      this.spinnerService.stop('main');
      return;
    }
    this.syncInProgress = true;
    this.vmsService.createTaskAndPoll(this.pcId, PlatFormMapping.OPENSTACK).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(status => {
        this.syncInProgress = false;
        this.getVms();
        //   if (status.result.data) {
        //   this.getVms();
        // } else {
        //   this.notification.error(new Notification(status.result.message));
        //   this.spinnerService.stop('main');
        // }
        this.subscribeToTerminal();
      }, (err: Error) => {
        this.subscribeToTerminal();
        this.syncInProgress = false;
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Error while fetching Openstack virtual machines'));
      });
  }

  getVms() {
    this.openstackService.getVms(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.openstackService.converToViewData(res.results);
      this.spinnerService.stop('main');
      this.getDeviceData();
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  // updateDeviceData(res: Map<string, DeviceData>, index: number) {
  //   const key = res.keys().next().value;
  //   if (res.get(key)) {
  //     const value = res.get(key).device_data;
  //     this.viewData[index].popOverDetails.uptime = this.utilService.getDeviceUptime(value);
  //     this.viewData[index].popOverDetails.lastreboot = (Number(value.last_rebooted) * 1000).toString();
  //     this.viewData[index].popOverDetails.status = value.status;
  //     this.viewData[index].statsTooltipMessage = 'OpenStack Virtual Machine Statistics';
  //   } else {
  //     this.viewData[index].popOverDetails.uptime = '0';
  //     this.viewData[index].popOverDetails.lastreboot = '0';
  //     this.viewData[index].statsTooltipMessage = 'Monitoring not enabled';
  //   }
  // }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.openstackService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => { }
      )
  }

  // getDeviceData(openStack: OpenStackVM[]) {
  //   from(openStack).pipe(mergeMap(e => this.openstackService.getDeviceData(e.uuid)), takeUntil(this.ngUnsubscribe))
  //     .subscribe(
  //       res => {
  //         const key = res.keys().next().value;
  //         const index = this.viewData.map(data => data.vmId).indexOf(key);
  //         this.updateDeviceData(res, index);
  //       },
  //       err => console.log(err),
  //       () => {
  //         //Do anything after everything done
  //       }
  //     );
  // }

  powerToggle(view: OpenStackViewData) {
    if (!view.isPowerButtonEnabled) {
      return;
    }
    const input: PowerToggleInput = this.openstackService.getToggleInput(view);
    const index = this.viewData.map(data => data.instanceId).indexOf(view.instanceId);
    this.viewData[index].powerStatusIcon = 'fa-spinner fa-spin';
    this.toggleService.togglePower(input).pipe(mergeMap((vm: OpenStackVM) => {
      this.viewData[index].powerStatusIcon = 'fa-power-off';
      if (vm) {
        this.notification.success(new Notification(`VM Powered ${vm.last_known_state == 'SHUTOFF' ? 'OFF' : 'ON'}`));
        this.viewData[index] = this.openstackService.convertVMtoViewdata(vm);
        return this.openstackService.getDeviceData(view);
      } else {
        if (vm != null) {
          this.notification.error(new Notification(`Failed to ${view.powerStatus == 'Down' ? 'Power On' : 'Power Off'} VM. Please try agian later.`));
        }
        return of(new Map<string, DeviceData>().set(null, null));
      }
    }), take(1)).subscribe((res) => {
      // if (res.keys().next().value) {
      //   this.updateDeviceData(res, index);
      // }
    });
  }

  showInfo(view: OpenStackViewData) {
    this.info = view;
    this.modalRef = this.modalService.show(this.serverinfo, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  consoleSameTab(view: OpenStackViewData) {
    if (!view.isSameTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.openstackService.getConsoleAccessInput(view);
    obj.managementIp = view.managementIp;
    this.termService.openTerminal(obj);
    // this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    // this.router.navigate([view.instanceId, 'console'], { relativeTo: this.route });
  }

  consoleNewTab(view: OpenStackViewData) {
    if (!view.isNewTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.openstackService.getConsoleAccessInput(view);
    obj.newTab = true;
    obj.managementIp = view.managementIp;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    window.open(view.newTabConsoleAccessUrl);
  }

  goToStats(view: OpenStackViewData) {
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.OPENSTACK_VIRTUAL_MACHINE, configured: view.monitoring.configured, ssr_os: view.ssrOS }, StorageType.SESSIONSTORAGE);
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

  createTicket(data: OpenStackViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.OPENSTACK_VIRTUAL_MACHINE, data.name),
      metadata: OPENSTACK_WARE_TICKET_METADATA(DeviceMapping.OPENSTACK_VIRTUAL_MACHINE, data.name, data.powerStatus, data.image, data.managementIp)
    }, DeviceMapping.VIRTUAL_MACHINE);
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

  updateTags(view: OpenStackViewData) {
    this.tagsCrudService.updateTags({ vmId: view.vmId, tags: view.tags, vmType: PlatFormMapping.OPENSTACK });
  }
}
