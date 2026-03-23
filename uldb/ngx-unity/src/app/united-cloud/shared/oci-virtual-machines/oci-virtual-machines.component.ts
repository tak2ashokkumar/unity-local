import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription, interval, throwError } from 'rxjs';
import { catchError, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskError, TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { OCI_VM_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { OCIVMViewData, OCI_VM_ACTIONS, OciVirtualMachinesService } from './oci-virtual-machines.service';
import { OCIAvailabilityDomainType, OCICompartmentType, OCIImageType, OCIRegionType, OCIShapeType, OCISubnetType } from './oci-vm-type';

@Component({
  selector: 'oci-virtual-machines',
  templateUrl: './oci-virtual-machines.component.html',
  styleUrls: ['./oci-virtual-machines.component.scss'],
  providers: [OciVirtualMachinesService]
})
export class OciVirtualMachinesComponent implements OnInit, OnDestroy {
  @Input() accountId: string;
  private ngUnsubscribe = new Subject();
  private ngUnsubscribeOnchange = new Subject();
  currentCriteria: SearchCriteria;
  count: number;
  @ViewChild('vminfo') vminfo: ElementRef;
  modalRef: BsModalRef;
  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;
  info: OCIVMViewData;
  viewData: OCIVMViewData[] = [];
  selectedViewData: OCIVMViewData;
  inDevicesPage: boolean;
  poll: boolean = false;
  syncInProgress: boolean = false;

  @ViewChild('vmCreateRef') vmCreateRef: ElementRef;
  vmCreateModelRef: BsModalRef;
  vmCreateForm: FormGroup;
  vmCreateFormErrors: any;
  vmCreateFormValidationMessages: any;
  nonFieldErr: string = '';
  compartments: OCICompartmentType[] = [];
  availabiltyDomains: OCIAvailabilityDomainType[] = [];
  shapes: OCIShapeType[] = [];
  subnets: OCISubnetType[] = [];
  images: OCIImageType[] = [];
  regions: OCIRegionType[] = [];

  @ViewChild('tagsRef') tagsRef: ElementRef;
  tagsModalRef: BsModalRef;
  tagForm: FormGroup;
  tagFormErrors: any;
  tagFormValidationMessages: any;
  tags: { [key: string]: string };

  action: OCI_VM_ACTIONS;
  private subscription: Subscription;
  constructor(
    private vmsService: OciVirtualMachinesService,
    private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private appService: AppLevelService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private modalService: BsModalService,
    private ticketService: SharedCreateTicketService,
    private termService: FloatingTerminalService
  ) { }

  subscribeToTerminal() {
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll && !this.syncInProgress), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => {
      });
  }

  ngOnInit() {
    this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.accountId = params.get('accountId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'account_uuid': this.accountId }] };
      setTimeout(() => {
        this.spinnerService.start('main');
        this.notification.success(new Notification("Latest data is being updated"));
        this.getVms();
        if (this.accountId) {
          this.getRegions();
          this.getCompartments();
        }
      }, 0);
    });
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
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
    // this.createTaskAndPoll();
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

  getVms() {
    this.vmsService.getVms(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.vmsService.converToViewData(res.results);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  getRegions() {
    this.vmsService.getSubscribedRegions(this.accountId).pipe(takeUntil(this.ngUnsubscribeOnchange)).subscribe(res => {
      this.regions = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching compartments.'));
    });
  }

  getCompartments() {
    this.vmsService.getCompartments(this.accountId).pipe(takeUntil(this.ngUnsubscribeOnchange)).subscribe(res => {
      this.compartments = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching compartments.'));
    });
  }

  getAvailabiltyDomain(compartmentId: string) {
    this.vmsService.getAvailabiltyDomain(this.accountId, compartmentId).pipe(takeUntil(this.ngUnsubscribeOnchange)).subscribe(res => {
      this.availabiltyDomains = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching Availabilty Domain.'));
    });
  }

  getSubnet(compartmentId: string) {
    this.vmsService.getSubnet(this.accountId, compartmentId).pipe(takeUntil(this.ngUnsubscribeOnchange)).subscribe(res => {
      this.subnets = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching Subnets.'));
    });
  }

  getShape(compartmentId: string) {
    this.vmsService.getShape(this.accountId, compartmentId).pipe(takeUntil(this.ngUnsubscribeOnchange)).subscribe(res => {
      this.shapes = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching Shapes.'));
    });
  }

  getImages(compartmentId: string, shape: string) {
    this.vmsService.getImages(this.accountId, compartmentId, shape).pipe(takeUntil(this.ngUnsubscribeOnchange)).subscribe(res => {
      this.images = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching Images.'));
    });
  }

  unScubscribeOnChange() {
    this.ngUnsubscribeOnchange.next();
    this.ngUnsubscribeOnchange.unsubscribe();
    this.ngUnsubscribeOnchange = new Subject();
  }

  createVm() {
    this.nonFieldErr = '';
    this.vmCreateForm = this.vmsService.createVMForm(this.accountId);
    this.vmCreateFormErrors = this.vmsService.resetVmCreateFormErrors();
    this.vmCreateFormValidationMessages = this.vmsService.vmCreateValidationMessages;
    this.vmCreateModelRef = this.modalService.show(this.vmCreateRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    this.vmCreateForm.get('compartment_id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.unScubscribeOnChange();
      this.vmCreateForm.get('availability_domain').enable();
      this.getAvailabiltyDomain(val);
      this.vmCreateForm.get('shape').enable();
      this.getShape(val);
      this.vmCreateForm.get('subnet_id').enable();
      this.getSubnet(val);
    });
    this.vmCreateForm.get('shape').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val) {
        this.unScubscribeOnChange();
        this.vmCreateForm.get('image_id').enable();
        this.getImages(this.vmCreateForm.get('compartment_id').value, val);
      }
    });
  }

  handleCreateFormError(err: any) {
    if (err instanceof HttpErrorResponse) {
      this.vmCreateFormErrors = this.vmsService.resetVmCreateFormErrors();
      if (err['non_field_errors']) {
        this.nonFieldErr = err['non_field_errors'][0];
      } else if (err) {
        for (const field in err) {
          if (field in this.vmCreateForm.controls) {
            this.vmCreateFormErrors[field] = err[field][0];
          }
        }
      } else {
        this.vmCreateModelRef.hide();
        this.notification.error(new Notification('Something went wrong!! Please try again.'));
      }
      this.spinnerService.stop('main');
    } else if (err instanceof TaskError) {
      this.notification.error(new Notification(err.error));
    } else {
      this.notification.error(new Notification(err));
    }
  }

  confirmVmCreate() {
    if (this.vmCreateForm.invalid) {
      this.vmCreateFormErrors = this.utilService.validateForm(this.vmCreateForm, this.vmCreateFormValidationMessages, this.vmCreateFormErrors);
      this.vmCreateForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.vmCreateFormErrors = this.utilService.validateForm(this.vmCreateForm, this.vmCreateFormValidationMessages, this.vmCreateFormErrors); });
    } else {
      this.spinnerService.start('main');
      this.vmsService.createVM(this.vmCreateForm.getRawValue()).pipe(catchError((e: HttpErrorResponse) => {
        return throwError(e);
      }), switchMap(res => {
        if (res.task_id) {
          this.vmCreateModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Request is being processed. Status will be updated shortly'));
          return this.appService.pollForTask(res.task_id, 5, 300).pipe(take(1));
        } else {
          this.spinnerService.stop('main');
          throw new Error('Something went wrong !... Please try again later');
        }
      }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
        if (status.result.data) {
          this.notification.success(new Notification(`VM create request accepted successfully. Please refresh after sometime.`));
        } else if (status.result['error']) {
          this.notification.error(new Notification(status.result['error']));
        } else {
        }
      }, (err: HttpErrorResponse | TaskError | Error) => this.handleCreateFormError(err));
    }
  }


  powerToggle(view: OCIVMViewData) {
    if (!view.powerIconEnabled) {
      return;
    }
    this.action = view.powerStatusOn ? OCI_VM_ACTIONS.STOP : OCI_VM_ACTIONS.START;
    this.selectedViewData = view;
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: false, ignoreBackdropClick: true }));
  }

  terminateInstance(view: OCIVMViewData) {
    if (!view.terminateIconEnabled) {
      return;
    }
    this.action = OCI_VM_ACTIONS.TERMINATE;
    this.selectedViewData = view;
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: false, ignoreBackdropClick: true }));
  }

  confirmAction() {
    switch (this.action) {
      case OCI_VM_ACTIONS.STOP:
      case OCI_VM_ACTIONS.START:
        this.handlePower();
        break;
      case OCI_VM_ACTIONS.TERMINATE:
        this.handleTerminate();
        break;
    }
  }

  updateVm(vmId: string) {
    this.vmsService.getVmById(vmId).pipe(take(1)).subscribe(res => {
      const i = this.viewData.map(view => view.uuid).indexOf(vmId);
      this.viewData[i] = this.vmsService.convertVMtoViewdata(res);
    }, err => {
    });
  }

  private pollForTask(res: CeleryTask) {
    if (res.task_id) {
      this.confirmModalRef.hide();
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Request is being processed. Status will be updated shortly'));
      return this.appService.pollForTask(res.task_id, 5, 300).pipe(take(1));
    } else {
      throw new Error('Something went wrong !... Please try again later');
    }
  }

  handleError(error: HttpErrorResponse | TaskError | Error) {
    if (error instanceof TaskError) {
      this.notification.warning(new Notification('Request is taking longer than usual. Please refresh after sometime'));
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
  }

  handlePower() {
    let action = this.selectedViewData.powerStatusOn ? 'STOP' : 'START'
      ; this.vmsService.powerToggle(this.selectedViewData.uuid, { account: this.accountId, action: action }).pipe(catchError((e: HttpErrorResponse) => {
        return throwError(e);
      }), switchMap(res => {
        this.selectedViewData.setPowerInProgress();
        return this.pollForTask(res);
      }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
        if (status.result.data) {
          let ac = !this.selectedViewData.powerStatusOn ? 'on' : 'off';
          this.notification.success(new Notification(`VM powered ${ac} request accepted successfully. Please refresh after sometime.`));
        } else if (status.result['error']) {
          this.notification.error(new Notification(status.result['error']));
        }
        this.updateVm(this.selectedViewData.uuid);
      }, (err: HttpErrorResponse | TaskError | Error) => this.handleError(err));
  }

  handleTerminate() {
    this.vmsService.vmTerminate(this.selectedViewData.uuid, { account: this.accountId }).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      this.selectedViewData.setTerminateInProgress();
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
      if (status.result.data) {
        this.notification.success(new Notification(`VM powered termination request accepted successfully. Please refresh after sometime.`));
      } else if (status.result['error']) {
        this.notification.error(new Notification(status.result['error']));
      }
      this.updateVm(this.selectedViewData.uuid);
    }, (err: HttpErrorResponse | TaskError | Error) => this.handleError(err));
  }

  buildTagForm(key?: string) {
    this.tagFormErrors = this.vmsService.resetTagFormErrors();
    this.tagFormValidationMessages = this.vmsService.tagValidationMessages;
    this.tagForm = this.vmsService.buildTagForm(key ? { key: key, value: this.tags[key] } : null);
  }

  manageTags(view: OCIVMViewData) {
    console.log('this.accountId : ', this.accountId);
    this.selectedViewData = view;
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
    this.vmsService.updateTags(this.selectedViewData.uuid, this.tags).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getVms();
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Failed to update tags. Please try again later.'));
    });
  }
}
