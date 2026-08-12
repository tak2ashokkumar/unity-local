import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, from, interval } from 'rxjs';
import { mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CONTAINER_CONTROLLER_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { CONTROLLER_TYPE_MAPPING } from 'src/app/shared/SharedEntityTypes/container-contoller.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { ContainerControllerCrudService } from './container-controller-crud/container-controller-crud.service';
import { ContainerControllerViewdata, ContainerControllersService } from './container-controllers.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'container-controllers',
  templateUrl: './container-controllers.component.html',
  styleUrls: ['./container-controllers.component.scss'],
  providers: [ContainerControllersService]
})
export class ContainerControllersComponent implements OnInit, OnDestroy {
  @Input() accountId: string;
  @Input() urlParam: string;

  viewData: ContainerControllerViewdata[] = [];
  currentCriteria: SearchCriteria;
  count: number = 0;

  private ngUnsubscribe = new Subject();
  poll: boolean = false;

  constructor(private svc: ContainerControllersService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private notificationService: AppNotificationService,
    private crudService: ContainerControllerCrudService,
    private ticketService: SharedCreateTicketService,
    private utilService: AppUtilityService,
    private termService: FloatingTerminalService,
    private storageService: StorageService,) {
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => { this.getContainers(); });
  }

  ngOnInit() {
    this.spinnerService.start('main');
    if (!this.accountId && this.route.parent) {
      this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
        this.accountId = params.get('pcId');
      });
    }
    if (this.accountId && !this.urlParam) {
      this.urlParam = 'cloud_uuid';
    }

    this.currentCriteria = this.buildCriteria();
    this.discoverResources();
    this.getContainers();
  }

  // Best-effort, non-blocking. The list still loads regardless of the outcome.
  private discoverResources() {
    this.svc.discoverResources().pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => { }, () => { });
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private buildCriteria(): SearchCriteria {
    let criteria: SearchCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    if (this.urlParam && this.accountId) {
      let paramObj: { [k: string]: string } = {};
      paramObj[this.urlParam] = this.accountId;
      criteria.params = [paramObj];
    }
    return criteria;
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getContainers();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getContainers();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getContainers();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getContainers();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getContainers();
  }

  trackByControllerId(index: number, item: ContainerControllerViewdata): string {
    return item.controllerId;
  }

  getContainers() {
    this.svc.getContainers(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      let list = Array.isArray(res) ? res : (res && res.results ? res.results : []);
      this.count = Array.isArray(res) ? list.length : (res && res.count != null ? res.count : list.length);
      this.viewData = this.svc.convertToViewdata(list);
      this.spinnerService.stop('main');
      this.getDeviceData(this.viewData);
    }, (err: HttpErrorResponse) => {
      this.notificationService.error(new Notification('Problem in getting container accounts. Please try again later.'));
      this.spinnerService.stop('main');
    });
  }

  getDeviceData(viewData: ContainerControllerViewdata[]) {
    // Status shown first from the list object, then refreshed per row: Docker accounts via the zabbix
    // device_data call, Kubernetes accounts via their monitoring/status/ endpoint.
    from(viewData).pipe(
      mergeMap((e) => e.controllerType === CONTROLLER_TYPE_MAPPING.KUBERNETES
        ? this.svc.getKubernetesAccountStatus(e)
        : this.svc.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      );
  }

  goToDetails(view: ContainerControllerViewdata) {
    let type = view.controllerType == CONTROLLER_TYPE_MAPPING.DOCKER ? 'docker' : 'kubernetes';
    this.router.navigate([type, view.controllerId, 'nodes'], { relativeTo: this.route });
  }

  goToStats(view: ContainerControllerViewdata) {
    let deviceType = view.controllerType == CONTROLLER_TYPE_MAPPING.KUBERNETES ? DeviceMapping.KUBERNETES_ACCOUNT : DeviceMapping.CONTAINER_CONTROLLER;
    this.storageService.put('device', { name: view.name, deviceType, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.configured && view.monitoring.enabled) {
      this.router.navigate([view.controllerId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
    } else {
      this.router.navigate([view.controllerId, 'zbx', 'configure'], { relativeTo: this.route });
    }
  }

  onCrud(uuid: string) {
    this.spinnerService.start('main');
    this.getContainers();
  }

  deleteController(data: ContainerControllerViewdata) {
    this.crudService.deleteController(data.controllerId, data.controllerType);
  }

  changePassword(data: ContainerControllerViewdata) {
    this.crudService.changePassword(data.controllerId, data.controllerType);
  }

  createTicket(data: ContainerControllerViewdata) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.CONTAINER_CONTROLLER, data.name), metadata: CONTAINER_CONTROLLER_TICKET_METADATA(DeviceMapping.CONTAINER_CONTROLLER, data.name, data.hostname)
    });
  }
}
