import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, from, interval } from 'rxjs';
import { mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { CUSTOM_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { DevicePopoverData } from '../../devices-popover/device-popover-data';
import { VmsTagsCrudService } from '../vms-tags-crud/vms-tags-crud.service';
import { VmsListCustomCrudService } from './vms-list-custom-crud/vms-list-custom-crud.service';
import { CustomVmViewData, VmsListCustomService } from './vms-list-custom.service';

@Component({
  selector: 'vms-list-custom',
  templateUrl: './vms-list-custom.component.html',
  styleUrls: ['./vms-list-custom.component.scss'],
  providers: [VmsListCustomService]
})
export class VmsListCustomComponent implements OnInit, OnDestroy {
  popData: DevicePopoverData;
  pcId: string;
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number;
  viewData: CustomVmViewData[] = [];
  poll: boolean = false;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private utilService: AppUtilityService,
    private customvmService: VmsListCustomService,
    private crudService: VmsListCustomCrudService,
    private storageService: StorageService,
    private ticketService: SharedCreateTicketService,
    private tagsCrudService: VmsTagsCrudService,
    private termService: FloatingTerminalService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'cloud_id': this.pcId }] };
    });

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => {
        this.getVms()
      });
  }

  ngOnInit() {
    this.loadCriteria();
    this.spinnerService.start('main');
    this.getVms();
  }


  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.extractByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.CUSTOM_VIRTUAL_MACHINE) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.CUSTOM_VIRTUAL_MACHINE }, StorageType.SESSIONSTORAGE)
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  get isCrudEnabled() {
    return this.pcId ? true : false;
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
  }

  getVms() {
    this.customvmService.getVms(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.customvmService.converToViewData(res.results);
      this.spinnerService.stop('main');
      this.getDeviceData();
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.customvmService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => { }
      )
  }

  consoleSameTab(view: CustomVmViewData) {
    if (!view.isSameTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.customvmService.getConsoleAccessInput(view);
    obj.managementIp = view.managementIp;
    this.termService.openTerminal(obj);
    // this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    // this.router.navigate([view.vmId, 'console'], { relativeTo: this.route });
  }

  consoleNewTab(view: CustomVmViewData) {
    if (!view.isNewTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.customvmService.getConsoleAccessInput(view);
    obj.newTab = true;
    obj.managementIp = view.managementIp;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    window.open(view.newTabConsoleAccessUrl);
  }

  goToDetails(view: CustomVmViewData) {
    if (view.monitoring.observium) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.CUSTOM_VIRTUAL_MACHINE, configured: view.monitoring.configured, os: view.os, ssr_os: view.platformType }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.vmId, 'zbx', 'details'], { relativeTo: this.route });
  }

  goToStats(view: CustomVmViewData) {
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.CUSTOM_VIRTUAL_MACHINE, configured: view.monitoring.configured, os: view.os, ssr_os: view.platformType }, StorageType.SESSIONSTORAGE);
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

  createTicket(data: CustomVmViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.CUSTOM_VIRTUAL_MACHINE, data.name), metadata: CUSTOM_TICKET_METADATA(DeviceMapping.CUSTOM_VIRTUAL_MACHINE, data.name, data.os, data.managementIp)
    });
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

  updateTags(view: CustomVmViewData) {
    this.tagsCrudService.updateTags({ vmId: view.vmId, tags: view.tags, vmType: PlatFormMapping.CUSTOM });
  }

  addCustomVM() {
    this.crudService.addOrEdit(this.pcId, null);
  }

  editCustomVM(view: CustomVmViewData) {
    this.crudService.addOrEdit(this.pcId, view.vmId);
  }

  deleteCustomVM(view: CustomVmViewData) {
    this.crudService.delete(this.pcId, view.vmId);
  }
}