import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, from, interval } from 'rxjs';
import { mergeMap, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CONTAINER_CONTROLLER_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
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

  count: number = 0;
  currentCriteria: SearchCriteria;

  addControllerEnabled: boolean;
  viewData: ContainerControllerViewdata[] = [];
  selectedControllerIndex: number;

  @ViewChild('addEditController') create: ElementRef;
  actionMessage: 'Add' | 'Edit';
  createModalRef: BsModalRef;
  controllerForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';

  @ViewChild('confirm') confirm: ElementRef;
  deleteModalRef: BsModalRef;

  @ViewChild('passwordChange') passwordChange: ElementRef;
  passwordChangeRef: BsModalRef;
  passwordForm: FormGroup;
  passwordFormErrors: any;
  passwordFormValidationMessages: any;

  private ngUnsubscribe = new Subject();
  poll: boolean = false;

  constructor(private svc: ContainerControllersService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private notificationService: AppNotificationService,
    private modalService: BsModalService,
    private crudService: ContainerControllerCrudService,
    private ticketService: SharedCreateTicketService,
    private utilService: AppUtilityService,
    private termService: FloatingTerminalService,
    private storageService: StorageService,) {
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getControllers());
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
    this.addControllerEnabled = this.accountId ? true : false;

    let paramObj: { [k: string]: string } = {};
    paramObj[this.urlParam] = this.accountId;
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [paramObj] };
    this.getControllers();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getControllers();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getControllers();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getControllers();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getControllers();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getControllers();
  }

  getControllers() {
    this.svc.getControllers(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.svc.convertToViewdata(res);
      this.spinnerService.stop('main');
      this.getDeviceData();
    }, (err: HttpErrorResponse) => {
      this.notificationService.error(new Notification('Problem in getting controllers. Please try again later.'));
      this.spinnerService.stop('main');
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.svc.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  goTo(view: ContainerControllerViewdata) {
    if (view.controllerType == 'docker') {
      this.router.navigate(['docker', view.controllerId, 'dockernodes'], { relativeTo: this.route });
    } else {
      this.router.navigate(['kubernetes', view.controllerId, 'nodes'], { relativeTo: this.route });
    }
  }

  goToStats(view: ContainerControllerViewdata) {
    // this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.CONTAINER_CONTROLLER, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.configured && view.monitoring.enabled) {
      this.router.navigate([view.controllerId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
    } else {
      this.router.navigate([view.controllerId, 'zbx', 'configure'], { relativeTo: this.route });
    }
  }

  onCrud(uuid: string) {
    this.spinnerService.start('main');
    this.getControllers();
  }

  addController() {
    this.crudService.addOrEdit(this.accountId, this.urlParam, null, null);
  }

  editController(data: ContainerControllerViewdata) {
    this.crudService.addOrEdit(this.accountId, this.urlParam, data.controllerId, data.controllerType);
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
