import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, from, interval } from 'rxjs';
import { finalize, mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { CRUDActionTypes, DeviceMapping, TICKET_TYPE } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { DEVICE_WEB_ACCESS_SUBJECT, SWITCH_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { DeviceZabbixEmailNotificationService } from 'src/app/shared/device-zabbix-email-notification/device-zabbix-email-notification.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { Firewall } from '../entities/firewall.type';
import { FirewallCrudService } from './firewalls-crud/firewalls-crud.service';
import { FirewallViewData, FirewallsService } from './firewalls.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';
import { CONFIRM_MODAL_CONFIG } from 'src/app/shared/shared.const';


@Component({
  selector: 'firewalls',
  templateUrl: './firewalls.component.html',
  styleUrls: ['./firewalls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FirewallsComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();
  currentCriteria: SearchCriteria;
  private pcId: string;
  poll = false;
  inDevicesPage: boolean;

  count: number;
  viewData: FirewallViewData[] = [];
  selectedFirewallIds: string[] = [];
  selectedAll = false;
  modalRef: BsModalRef;
  fields: BulkUpdateFieldType[] = [];
  @ViewChild('bulkDeleteModel') bulkDeleteModel: TemplateRef<void>;
  @ViewChild('bulkEditModel') bulkEditModel: TemplateRef<void>;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: FirewallsService,
    private spinnerSvc: AppSpinnerService,
    private appSvc: AppLevelService,
    private storageSvc: StorageService,
    private crudSvc: FirewallCrudService,
    private zabbixAlertConfigSvc: DeviceZabbixEmailNotificationService,
    private modalSvc: BsModalService,
    private notificationSvc: AppNotificationService,
    private ticketSvc: SharedCreateTicketService,
    private termSvc: FloatingTerminalService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.inDevicesPage = !this.pcId;
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'uuid': this.pcId }] };
    });

    this.termSvc.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(() => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(() => this.getFirewalls());

    this.loadCriteria();
    this.spinnerSvc.start('main');
    this.getDeviceBulkEditFields();
    this.getFirewalls();
  }

  ngOnDestroy(): void {
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadCriteria(): void {
    const filter = this.storageSvc.extractByKey('criteria', StorageType.SESSIONSTORAGE) as { criteria: SearchCriteria, deviceType: DeviceMapping };
    if (filter && filter.deviceType === DeviceMapping.FIREWALL) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  saveCriteria(): void {
    this.storageSvc.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.FIREWALL }, StorageType.SESSIONSTORAGE)
  }

  get isCrudEnabled(): boolean {
    return this.inDevicesPage;
  }

  get showDevicesColumns(): boolean {
    return this.inDevicesPage;
  }

  onSorted($event: SearchCriteria): void {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getFirewalls();
  }

  onSearched(event: string): void {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getFirewalls();
  }

  pageChange(pageNo: number): void {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getFirewalls();
  }

  pageSizeChange(pageSize: number): void {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getFirewalls();
  }

  onCrud(event: CRUDActionTypes): void {
    if (event === CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinnerSvc.start('main');
      if (event === CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getFirewalls();
    }
  }


  getDeviceBulkEditFields(): void {
    this.svc.getDeviceBulkEditFields().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: BulkUpdateFieldType[]) => {
      this.fields = res;
      this.cdr.markForCheck();
    });
  }

  refreshData(pageNo: number): void {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getFirewalls();
  }

  getFirewalls(): void {
    this.svc.getFirewalls(this.currentCriteria)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe((data: PaginatedResult<Firewall>) => {
        this.count = data.count;
        this.viewData = this.svc.convertToViewData(data.results);
        if (this.selectedFirewallIds?.length) {
          this.viewData.forEach((i) => { i.isSelected = this.selectedFirewallIds.includes(i.deviceId); });
        }
        this.getDeviceData();
      }, () => { });
  }

  getDeviceData(): void {
    from(this.viewData).pipe(
      mergeMap((e) => this.svc.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.cdr.markForCheck(), () => this.cdr.markForCheck());
  }

  goToDetails(view: FirewallViewData): void {
    if (view.isShared || view.monitoring.observium) {
      return;
    }
    this.saveCriteria();
    this.storageSvc.put('device', { name: view.name, deviceType: DeviceMapping.FIREWALL, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.deviceId, 'zbx', 'details'], { relativeTo: this.route });
  }

  goToStats(view: FirewallViewData): void {
    if (view.isShared) {
      return;
    }
    this.saveCriteria();
    this.storageSvc.put('device', { name: view.name, deviceType: DeviceMapping.FIREWALL, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
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

  consoleSameTab(view: FirewallViewData): void {
    if (!view.sameTabConsoleAccessUrl) {
      return;
    }
    const obj: ConsoleAccessInput = this.svc.getConsoleAccessInput(view);
    this.termSvc.openTerminal(obj);
  }

  requestWebAccess(view: FirewallViewData): void {
    this.ticketSvc.createTicket({
      subject: DEVICE_WEB_ACCESS_SUBJECT(DeviceMapping.FIREWALL, view.name),
      metadata: SWITCH_TICKET_METADATA(DeviceMapping.FIREWALL, view.name, view.deviceStatus, view.model, view.type, view.managementIp),
      type: TICKET_TYPE.PROBLEM,
      webaccess: true
    }, DeviceMapping.FIREWALL);
  }

  webAccessNewTab(view: FirewallViewData): void {
    this.appSvc.updateActivityLog('firewalls', view.deviceId);
    window.open(view.newTabWebAccessUrl);
  }

  consoleNewTab(view: FirewallViewData): void {
    if (!view.newTabConsoleAccessUrl) {
      return;
    }
    const obj: ConsoleAccessInput = this.svc.getConsoleAccessInput(view);
    obj.newTab = true;
    this.storageSvc.put('console', obj, StorageType.LOCALSTORAGE);
    this.appSvc.updateActivityLog('firewalls', view.deviceId);
    window.open(view.newTabConsoleAccessUrl);
  }

  createTicket(data: FirewallViewData): void {
    this.ticketSvc.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.FIREWALL, data.name),
      metadata: SWITCH_TICKET_METADATA(DeviceMapping.FIREWALL, data.name,
        data.deviceStatus, data.model, data.type, data.managementIp,
      )
    }, DeviceMapping.FIREWALL);
  }

  addFireWall(): void {
    this.crudSvc.addOrEditFireWall(null);
  }

  notifyFirewall(view: FirewallViewData): void {
    this.zabbixAlertConfigSvc.notify(view.deviceId, DeviceMapping.FIREWALL);
  }

  editFireWall(view: FirewallViewData): void {
    if (view.isShared) {
      return;
    }
    this.crudSvc.addOrEditFireWall(view.deviceId);
  }

  deleteFirewall(view: FirewallViewData): void {
    if (view.isShared) {
      return;
    }
    this.crudSvc.deleteFireWall(view.deviceId);
  }

  select(view: FirewallViewData): void {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedFirewallIds.splice(this.selectedFirewallIds.indexOf(view.deviceId), 1);
    } else {
      this.selectedFirewallIds.push(view.deviceId);
    }
    this.selectedAll = this.selectedFirewallIds.length === this.viewData.length;
  }

  selectAll(): void {
    if (!this.viewData.length) {
      this.selectedAll = false;
      return;
    }

    this.selectedAll = !this.selectedAll;
    if (this.selectedAll) {
      this.viewData.forEach(view => {
        view.isSelected = true;
        this.selectedFirewallIds.push(view.deviceId);
      });
    } else {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedFirewallIds = [];
    }
  }


  cancelButton(): void {
    this.modalRef.hide();
    this.clearSelection();
  }

  bulkDelete(): void {
    this.modalRef = this.modalSvc.show(this.bulkDeleteModel, CONFIRM_MODAL_CONFIG);
  }

  bulkUpdate(): void {
    this.modalRef = this.modalSvc.show(this.bulkEditModel, { ...CONFIRM_MODAL_CONFIG, class: 'modal-lg' });
  }

  confirmMultipleDelete(): void {
    this.spinnerSvc.start('main');
    this.modalRef.hide();
    this.svc.deleteMultipleFirewalls(this.selectedFirewallIds)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe(() => {
        this.clearSelection();
        this.getFirewalls();
        this.notificationSvc.success(new Notification('Firewalls Deleted successfully'));
      }, () => {
        this.clearSelection();
        this.notificationSvc.error(new Notification('Something went wrong!! Please try again.'));
      });
  }

  submit(obj: Record<string, unknown>): void {
    this.spinnerSvc.start('main');
    this.modalRef.hide();
    this.svc.updateMultipleFirewalls(this.selectedFirewallIds, obj)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe(() => {
        this.clearSelection();
        this.getFirewalls();
        this.notificationSvc.success(new Notification('Firewalls Updated successfully'));
      }, () => {
        this.clearSelection();
        this.notificationSvc.error(new Notification('Something went wrong!! Please try again.'));
      });
  }

  trackByFirewall(_index: number, view: FirewallViewData): string {
    return view.deviceId;
  }

  private clearSelection(): void {
    this.viewData.forEach(view => view.isSelected = false);
    this.selectedFirewallIds = [];
    this.selectedAll = false;
  }

  private stopSpinnerAndMarkForCheck(): void {
    this.spinnerSvc.stop('main');
    this.cdr.markForCheck();
  }
}