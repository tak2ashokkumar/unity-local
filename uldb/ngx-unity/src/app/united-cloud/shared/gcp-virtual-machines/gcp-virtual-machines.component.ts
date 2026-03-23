import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, interval } from 'rxjs';
import { switchMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { GCP_VM_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { PowerToggleInput } from 'src/app/united-cloud/shared/server-power-toggle/server-power-toggle.service';
import { environment } from 'src/environments/environment';
import { GCPImageType, GCPMachineType, GCPVirtualMachineViewData, GcpVirtualMachinesService } from './gcp-virtual-machines.service';

@Component({
  selector: 'gcp-virtual-machines',
  templateUrl: './gcp-virtual-machines.component.html',
  styleUrls: ['./gcp-virtual-machines.component.scss'],
  providers: [GcpVirtualMachinesService]
})
export class GcpVirtualMachinesComponent implements OnInit, OnDestroy {
  viewData: GCPVirtualMachineViewData[] = [];
  actionInput: GCPVirtualMachineViewData;
  confirmInput: PowerToggleInput;
  private ngUnsubscribe = new Subject();
  accountId: string;
  regionId: string;
  count: number = 0;
  currentCriteria: SearchCriteria;
  poll: boolean = false;
  syncInProgress: boolean = false;

  images: GCPImageType[] = [];
  zones: string[] = [];
  machineTypes: GCPMachineType[] = [];

  @ViewChild('addAccount') addAccount: ElementRef;
  addAccountModalRef: BsModalRef;
  addAccountFormErrors: any;
  addAccountValidationMessages: any;
  addAccountForm: FormGroup;

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  @ViewChild('tagsRef') tagsRef: ElementRef;
  tagsModalRef: BsModalRef;
  tagForm: FormGroup;
  tagFormErrors: any;
  tagFormValidationMessages: any;
  tags: { [key: string]: string };
  nonFieldErr: string = '';

  constructor(private notification: AppNotificationService,
    private spinnerService: AppSpinnerService,
    private route: ActivatedRoute,
    private ticketService: SharedCreateTicketService,
    private modalService: BsModalService,
    private notificationService: AppNotificationService,
    private utilService: AppUtilityService,
    private appService: AppLevelService,
    private vmsService: GcpVirtualMachinesService,
    private termService: FloatingTerminalService) {

  }

  subscribeToTerminal() {
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll && !this.syncInProgress), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => {
        // this.createTaskAndPoll()
      });
  }

  ngOnInit() {
    this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.accountId = params.get('accountId');
      this.regionId = params.get('regionId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'account_id': this.accountId, 'region': this.regionId }] };
      setTimeout(() => {
        this.spinnerService.start('main');
        if (this.accountId && this.regionId) {
          this.getGCPVmMetadata();
        }
        this.notificationService.success(new Notification("Latest data is being updated"));
        this.getGCPVms();
        // this.createTaskAndPoll();
      }, 0);
    });
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
    this.getGCPVms();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getGCPVms();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getGCPVms();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getGCPVms();
  }


  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getGCPVms();
  }

  getGCPVmMetadata() {
    this.vmsService.getGCPVmMetadata(this.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.zones = res.result.zones;
      this.images = res.result.images;
    }, err => { });
  }

  getGCPVms() {
    this.vmsService.getGCPVms(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.vmsService.convertToViewData(res.results);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  addGCPVM() {
    this.addAccountFormErrors = this.vmsService.resetAddAccountFormErrors();
    this.addAccountValidationMessages = this.vmsService.addAccountValidationMessages;
    this.addAccountForm = this.vmsService.createAddAccountForm();
    this.addAccountModalRef = this.modalService.show(this.addAccount, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    this.addAccountForm.get('zone').valueChanges.subscribe(res => {
      this.getMachineTypes(res);
    });
  }

  getMachineTypes(zone: string) {
    this.vmsService.getMachineTypes(this.accountId, zone).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.machineTypes = res.result.data;
    }, (err: HttpErrorResponse) => {
    });
  }

  createAccount() {
    if (this.addAccountForm.invalid) {
      this.addAccountFormErrors = this.utilService.validateForm(this.addAccountForm, this.addAccountValidationMessages, this.addAccountFormErrors);
      this.addAccountForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.addAccountFormErrors = this.utilService.validateForm(this.addAccountForm, this.addAccountValidationMessages, this.addAccountFormErrors); });
    } else {
      this.spinnerService.start('main');
      const data = this.addAccountForm.getRawValue();
      this.vmsService.addAccount(this.accountId, data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.addAccountModalRef.hide();
        this.spinnerService.stop('main');
        this.notificationService.success(new Notification('Instance added successfully. It will take sometime to get the latest Instance.'));
      }, (err: HttpErrorResponse) => {
        if (err.error && err.error.data) {
          this.notificationService.error(new Notification(err.error.data));
        } else {
          this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
        }
        this.addAccountModalRef.hide();
        this.spinnerService.stop('main');
      });
    }
  }

  powerToggle(view: GCPVirtualMachineViewData) {
    if (!view.isPowerIconEnabled) {
      return;
    }
    this.actionInput = view;
    this.confirmInput = this.vmsService.getToggleInput(view);
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmToggle() {
    this.confirmModalRef.hide();
    const index = this.viewData.map(data => data.instanceId).indexOf(this.actionInput.instanceId);
    this.viewData[index].isPowerIconEnabled = !this.viewData[index].isPowerIconEnabled;
    this.viewData[index].powerStatusIcon = 'fa-spinner fa-spin';
    this.vmsService.togglePowerStatus(this.confirmInput).pipe(switchMap(res => {
      if (res.task_id) {
        const msg = this.confirmInput.currentPowerStatus ? 'power off ' : 'power on ';
        this.viewData[index].status = this.confirmInput.currentPowerStatus ? 'Stopping' : 'Starting';
        this.notification.success(new Notification('Request for ' + msg + ' submitted'));
        return this.appService.pollForTask(res.task_id, 2, 20).pipe(take(1));
      } else {
        throw new Error('Something went wrong');
      }
    }), takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.viewData[index].powerStatusIcon = 'fa-power-off';
      this.viewData[index].status = status.result.data === 'RUNNING' ? 'Up' : 'Down';
      this.viewData[index].powerStatusOn = this.viewData[index].status === 'Up' ? true : false;
      this.viewData[index].isPowerIconEnabled = !this.viewData[index].isPowerIconEnabled;
      this.viewData[index].powerTooltipMessage = this.viewData[index].status === 'Up' ? 'Power Off' : 'Power On';
    }, (err: Error) => {
      this.viewData[index].powerStatusIcon = 'fa-power-off';
      this.viewData[index].isPowerIconEnabled = !this.viewData[index].isPowerIconEnabled;
      const msg = this.confirmInput.currentPowerStatus ? 'Stopping ' : 'Starting ';
      this.viewData[index].status = this.confirmInput.currentPowerStatus ? 'Up' : 'Down';
      this.notification.error(new Notification(msg + this.confirmInput.deviceName + ' Failed. Please try again later.'));
    });
  }

  createTicket(view: GCPVirtualMachineViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT("GCP Virtual Machine", view.name), metadata: GCP_VM_TICKET_METADATA("GCP Virtual Machine",
        view.name, view.operatingSystem, view.cpuPlatform, view.machineType, view.status)
    });
  }

  buildTagForm(key?: string) {
    this.tagFormErrors = this.vmsService.resetTagFormErrors();
    this.tagFormValidationMessages = this.vmsService.tagValidationMessages;
    this.tagForm = this.vmsService.buildTagForm(key ? { key: key, value: this.tags[key] } : null);
  }

  manageTags(view: GCPVirtualMachineViewData) {
    this.actionInput = view;
    this.tags = view.tags ? Object.assign({}, view.tags) : {};
    this.buildTagForm();
    this.tagsModalRef = this.modalService.show(this.tagsRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  addTag(): void {
    if (this.tagForm.invalid) {
      this.tagFormErrors = this.utilService.validateForm(this.tagForm, this.tagFormValidationMessages, this.tagFormErrors);
      this.tagForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.tagFormErrors = this.utilService.validateForm(this.tagForm, this.tagFormValidationMessages, this.tagFormErrors); });
    } else {
      let obj = this.tagForm.getRawValue();
      this.tags[obj.key] = obj.value;
      this.buildTagForm();
    }
  }

  editTag(key: string) {
    this.buildTagForm(key);
    this.removeTag(key);
  }

  removeTag(key: string): void {
    delete this.tags[key];
  }

  confirmVMTagsUpdate() {
    this.tagsModalRef.hide();
    this.spinnerService.start('main');
    this.vmsService.updateTags(this.accountId, this.actionInput, this.tags).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getGCPVms();
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Failed to update tags. Please try again later.'));
    });
  }
}