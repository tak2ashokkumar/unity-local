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

  ControllerTypeMapping = CONTROLLER_TYPE_MAPPING;

  kubernetesViewData: ContainerControllerViewdata[] = [];
  kubernetesCriteria: SearchCriteria;
  kubernetesCount: number = 0;

  dockerViewData: ContainerControllerViewdata[] = [];
  dockerCriteria: SearchCriteria;
  dockerCount: number = 0;

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
      takeUntil(this.ngUnsubscribe)).subscribe(x => { this.getKubernetesControllers(); this.getDockerControllers(); });
  }

  ngOnInit() {
    this.spinnerService.start('main');
    if (!this.accountId) {
      this.route.parent.paramMap.subscribe((params: ParamMap) => {
        this.accountId = params.get('pcId');
      });
    }
    if (this.accountId && !this.urlParam) {
      this.urlParam = 'cloud_uuid';
    }

    this.kubernetesCriteria = this.buildCriteria();
    this.dockerCriteria = this.buildCriteria();
    this.getKubernetesControllers();
    this.getDockerControllers();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private buildCriteria(): SearchCriteria {
    let paramObj: { [k: string]: string } = {};
    paramObj[this.urlParam] = this.accountId;
    return { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [paramObj] };
  }

  private getCriteria(type: CONTROLLER_TYPE_MAPPING): SearchCriteria {
    return type == CONTROLLER_TYPE_MAPPING.KUBERNETES ? this.kubernetesCriteria : this.dockerCriteria;
  }

  private load(type: CONTROLLER_TYPE_MAPPING) {
    if (type == CONTROLLER_TYPE_MAPPING.KUBERNETES) {
      this.getKubernetesControllers();
    } else {
      this.getDockerControllers();
    }
  }

  onSorted(type: CONTROLLER_TYPE_MAPPING, $event: SearchCriteria) {
    let criteria = this.getCriteria(type);
    criteria.sortColumn = $event.sortColumn;
    criteria.sortDirection = $event.sortDirection;
    criteria.pageNo = 1;
    this.load(type);
  }

  onSearched(type: CONTROLLER_TYPE_MAPPING, event: string) {
    let criteria = this.getCriteria(type);
    criteria.searchValue = event;
    criteria.pageNo = 1;
    this.load(type);
  }

  pageChange(type: CONTROLLER_TYPE_MAPPING, pageNo: number) {
    this.spinnerService.start('main');
    this.getCriteria(type).pageNo = pageNo;
    this.load(type);
  }

  pageSizeChange(type: CONTROLLER_TYPE_MAPPING, pageSize: number) {
    this.spinnerService.start('main');
    let criteria = this.getCriteria(type);
    criteria.pageSize = pageSize;
    criteria.pageNo = 1;
    this.load(type);
  }

  refreshData(type: CONTROLLER_TYPE_MAPPING, pageNo: number) {
    this.spinnerService.start('main');
    this.getCriteria(type).pageNo = pageNo;
    this.load(type);
  }

  trackByControllerId(index: number, item: ContainerControllerViewdata): string {
    return item.controllerId;
  }

  getKubernetesControllers() {
    this.svc.getKubernetesControllers(this.kubernetesCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      let list = Array.isArray(res) ? res : (res && res.results ? res.results : []);
      this.kubernetesCount = Array.isArray(res) ? list.length : (res && res.count != null ? res.count : list.length);
      this.kubernetesViewData = this.svc.convertToViewdata(list);
      this.kubernetesViewData.forEach(v => v.controllerType = CONTROLLER_TYPE_MAPPING.KUBERNETES);
      this.spinnerService.stop('main');
      this.getDeviceData(this.kubernetesViewData);
    }, (err: HttpErrorResponse) => {
      this.notificationService.error(new Notification('Problem in getting Kubernetes controllers. Please try again later.'));
      this.spinnerService.stop('main');
    });
  }

  getDockerControllers() {
    this.svc.getDockerControllers(this.dockerCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      let list = Array.isArray(res) ? res : (res && res.results ? res.results : []);
      this.dockerCount = Array.isArray(res) ? list.length : (res && res.count != null ? res.count : list.length);
      this.dockerViewData = this.svc.convertToViewdata(list);
      this.dockerViewData.forEach(v => v.controllerType = CONTROLLER_TYPE_MAPPING.DOCKER);
      this.spinnerService.stop('main');
      this.getDeviceData(this.dockerViewData);
    }, (err: HttpErrorResponse) => {
      this.notificationService.error(new Notification('Problem in getting Docker controllers. Please try again later.'));
      this.spinnerService.stop('main');
    });
  }

  getDeviceData(viewData: ContainerControllerViewdata[]) {
    from(viewData).pipe(
      mergeMap((e) => this.svc.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      );
  }

  goTo(view: ContainerControllerViewdata) {
    if (view.controllerType == CONTROLLER_TYPE_MAPPING.DOCKER) {
      this.router.navigate(['docker', view.controllerId, 'dockernodes'], { relativeTo: this.route });
    } else {
      this.router.navigate(['kubernetes', view.controllerId, 'nodes'], { relativeTo: this.route });
    }
  }

  goToStats(view: ContainerControllerViewdata) {
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.CONTAINER_CONTROLLER, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.configured && view.monitoring.enabled) {
      this.router.navigate([view.controllerId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
    } else {
      this.router.navigate([view.controllerId, 'zbx', 'configure'], { relativeTo: this.route });
    }
  }

  onCrud(uuid: string) {
    this.spinnerService.start('main');
    this.getKubernetesControllers();
    this.getDockerControllers();
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
