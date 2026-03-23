import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, from, interval } from 'rxjs';
import { mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
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
import { HypervisorViewData, HypervisorsService } from './hypervisors.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';

@Component({
  selector: 'hypervisors',
  templateUrl: './hypervisors.component.html',
  styleUrls: ['./hypervisors.component.scss']
})
export class HypervisorsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
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

  @ViewChild('bulkEditModel') bulkEditModel: ElementRef;
  fields: BulkUpdateFieldType[] = [];

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
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
    if (!view.newTabWebAccessUrl) {
      return;
    }
    this.appService.updateActivityLog('servers', view.deviceId);
    window.open(view.newTabWebAccessUrl);
  }

  consoleNewTab(view: HypervisorViewData) {
    if (!view.newTabConsoleAccessUrl) {
      return;
    }
    let obj: ConsoleAccessInput = this.hypervisorsService.getConsoleAccessInput(view);
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    this.appService.updateActivityLog('servers', view.deviceId);
    window.open(view.newTabConsoleAccessUrl);
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