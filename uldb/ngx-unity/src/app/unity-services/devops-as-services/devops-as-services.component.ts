import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, interval } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { MANAGEMENT_NOT_ENABLED_MESSAGE } from 'src/app/app-constants';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { DEVOPS_CONTROLLER_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { TabData } from 'src/app/shared/tabdata';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { DevopsAsServicesService, DevopsControllerViewData } from './devops-as-services.service';

const tabData: TabData[] = [
  {
    name: 'Devops Controller',
    url: '/services/devopscontroller'
  }
];

@Component({
  selector: 'devops-as-services',
  templateUrl: './devops-as-services.component.html',
  styleUrls: ['./devops-as-services.component.scss'],
  providers: [DevopsAsServicesService]
})
export class DevopsAsServicesComponent implements OnInit {
  tabItems: TabData[] = tabData;
  viewData: DevopsControllerViewData[] = [];
  count: number;
  controllerUUID: string;
  controller: DevopsControllerViewData;
  action: string;
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  managementEnabled: boolean;
  addServerTooltipMessage: string;

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  @ViewChild('create') create: ElementRef;
  createModalRef: BsModalRef;
  createFormErrors: any;
  createValidationMessages: any;
  createForm: FormGroup;
  poll: boolean = false;

  constructor(
    private devopsControllerService: DevopsAsServicesService,
    private spinnerService: AppSpinnerService,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private ticketService: SharedCreateTicketService,
    private modalService: BsModalService,
    private user: UserInfoService,
    private notificationService: AppNotificationService,
    private storageService: StorageService,
    private termService: FloatingTerminalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.action = this.controllerUUID ? 'Edit' : 'Add';
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getDevopsControllers());
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.setManagementEnabled();
    this.getDevopsControllers();
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
    this.getDevopsControllers();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getDevopsControllers();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDevopsControllers();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getDevopsControllers();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDevopsControllers();
  }

  getDevopsControllers() {
    this.devopsControllerService.getControllers(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<DevopsController>) => {
      this.count = data.count;
      this.viewData = this.devopsControllerService.convertToViewData(data.results);
      this.spinnerService.stop('main');
    }, er => {
      this.spinnerService.stop('main');
    });
  }

  setManagementEnabled() {
    this.managementEnabled = this.user.isManagementEnabled;
    this.addServerTooltipMessage = this.managementEnabled ? 'Add Server' : MANAGEMENT_NOT_ENABLED_MESSAGE();
  }

  consoleAccessSameTab(view: DevopsControllerViewData) {
    if (!view.isSameTabEnabled) {
      return;
    }
    this.termService.openTerminal({
      label: DeviceMapping.DEVOPS_CONTROLLER, deviceType: DeviceMapping.DEVOPS_CONTROLLER,
      newTab: false,
      deviceName: view.serverName, deviceId: view.deviceId, port: view.port ? Number(view.port) : null, managementIp: view.managementIP
    });
  }

  consoleAccessNewTab(view: DevopsControllerViewData) {
    if (!view.isNewTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.devopsControllerService.getConsoleAccessInput(view);
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    window.open(view.newTabAccessUrl);
  }

  editController(data: DevopsControllerViewData) {
    this.controller = data;
    this.createForm = this.devopsControllerService.createForm(this.controller);
    this.openModal();
  }

  addController() {
    if (!this.managementEnabled) {
      return;
    }
    this.controller = null;
    this.createForm = this.devopsControllerService.createForm();
    this.openModal();
  }

  openModal() {
    this.createFormErrors = this.devopsControllerService.resetFormErrors();
    this.createValidationMessages = this.devopsControllerService.validationMessages;
    this.createModalRef = this.modalService.show(this.create, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  deleteController(UUID: string) {
    this.controllerUUID = UUID;
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.confirmModalRef.hide();
    this.spinner.start('main');
    this.devopsControllerService.deleteController(this.controllerUUID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.spinner.stop('main');
      this.notificationService.success(new Notification('Server deleted successfully'));
      this.getDevopsControllers();
    }, (err: HttpErrorResponse) => {
      this.confirmModalRef.hide();
    });
  }

  confirmCreate() {
    if (this.createForm.invalid) {
      this.createFormErrors = this.utilService.validateForm(this.createForm, this.createValidationMessages, this.createFormErrors);
      this.createForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.createFormErrors = this.utilService.validateForm(this.createForm, this.createValidationMessages, this.createFormErrors); });
    } else {
      if (this.controller) {
        let data = this.createForm.getRawValue();
        this.devopsControllerService.editController(this.controller.deviceId, data).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<DevopsController>) => {
          this.createModalRef.hide();
          this.spinnerService.stop('main');
          this.notificationService.success(new Notification('DevOps Controller updated successfully'));
          this.getDevopsControllers();
        }, (err: HttpErrorResponse) => {
          this.spinnerService.stop('main');
          this.getDevopsControllers();
        });
      }
      else {
        let data = this.createForm.getRawValue();
        this.devopsControllerService.createController(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<DevopsController>) => {
          this.createModalRef.hide();
          this.spinnerService.stop('main');
          this.notificationService.success(new Notification('DevOps Controller added successfully'));
          this.getDevopsControllers();
        }, (err: HttpErrorResponse) => {
          this.spinnerService.stop('main');
          this.getDevopsControllers();
        });
      }
    }
  }

  createTicket(data: DevopsControllerViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.DEVOPS_CONTROLLER, data.serverName), metadata: DEVOPS_CONTROLLER_TICKET_METADATA(data.serverName, data.os, data.managementIP, data.port)
    });
  }
}
