import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription, from, interval, throwError } from 'rxjs';
import { catchError, mergeMap, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TaskError, TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, CRUDActionTypes, DeviceMapping, NoWhitespaceValidator, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { TICKET_SUBJECT, VM_WARE_TICKET_METADATA } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { DevicePopoverData } from '../../devices-popover/device-popover-data';
import { PowerToggleInput } from '../../server-power-toggle/server-power-toggle.service';
import { VmsMgmtCrudService } from '../vms-mgmt-crud/vms-mgmt-crud.service';
import { VmsTagsCrudService } from '../vms-tags-crud/vms-tags-crud.service';
import { VmsService } from '../vms.service';
import { VmsListVmwareAddService } from './vms-list-vmware-add/vms-list-vmware-add.service';
import { VcenterVMCreationMetaData } from './vms-list-vmware-add/vms-list-vmware-add.type';
import { VmsListVmwareDeployOvaService } from './vms-list-vmware-deploy-ova/vms-list-vmware-deploy-ova.service';
import { VmsListVmwareDeployOvfService } from './vms-list-vmware-deploy-ovf/vms-list-vmware-deploy-ovf.service';
import { VMWARE_VM_ACTIONS, VMwareVMAuthType, VMwareVMBackupStatusSummary, VMwareVMCloneType, VMwareVMRenameType, VMwareVMSummary, VMwareViewData, VmsListVmwareService } from './vms-list-vmware.service';
import { UnitedCloudSharedService } from '../../united-cloud-shared.service';
import { BulkUpdateFieldType } from '../../entities/bulk-update-field.type';

@Component({
  selector: 'vms-list-vmware',
  templateUrl: './vms-list-vmware.component.html',
  styleUrls: ['./vms-list-vmware.component.scss'],
  providers: [VmsListVmwareService]
})
export class VmsListVmwareComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private subscription: Subscription;
  pcId: string;
  clusterId: string;
  currentCriteria: SearchCriteria;
  popData: DevicePopoverData;
  inDevicesPage: boolean;
  cloudNameForApi: string = '';
  platformType: string = '';
  selectedAll: boolean = false;
  syncInProgress: boolean = false;
  poll: boolean = false;

  vmBackupStatusSummary: VMwareVMBackupStatusSummary = new VMwareVMBackupStatusSummary();

  count: number;
  viewData: VMwareViewData[] = [];
  selectedViewData: VMwareViewData;
  metaData: VcenterVMCreationMetaData[] = [];
  metadataLoaded: boolean = false;
  action: VMWARE_VM_ACTIONS;

  @ViewChild('serverinfo') serverinfo: ElementRef;
  info: VMwareViewData;
  modalRef: BsModalRef;


  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  @ViewChild('authenticate') authenticate: ElementRef;
  authModalref: BsModalRef;
  authForm: FormGroup;
  authFormErrors: any;
  authValidationMessages: any;

  cloneForm: FormGroup;
  cloneFormErrors: any;
  cloneValidationMessages: any;

  renameForm: FormGroup;
  renameFormErrors: any;
  renameValidationMessages: any;
  selectedVmIds: string[] = [];

  @ViewChild('bulkEditModel') bulkEditModel: ElementRef;
  fields: BulkUpdateFieldType[] = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private vmsService: VmsService,
    private spinnerService: AppSpinnerService,
    private appService: AppLevelService,
    private ipCrudService: VmsMgmtCrudService,
    private tagsCrudService: VmsTagsCrudService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private vmwareService: VmsListVmwareService,
    private storageService: StorageService,
    private modalService: BsModalService,
    private ticketService: SharedCreateTicketService,
    private VmsAddService: VmsListVmwareAddService,
    private termService: FloatingTerminalService,
    private ovfService: VmsListVmwareDeployOvfService,
    private ovaService: VmsListVmwareDeployOvaService,
    private ucSharedService: UnitedCloudSharedService) {

    if (this.router.url.includes('vcclusters')) {
      this.route.parent.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
        this.pcId = params.get('pcId');
        this.inDevicesPage = this.pcId ? false : true;
        this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
          this.clusterId = params.get('clusterId');
          this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'cloud_id': this.pcId, 'cluster_uuid': this.clusterId }] };
        })
      });
    } else {
      this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
        this.pcId = params.get('pcId');
        this.inDevicesPage = this.pcId ? false : true;
        this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'cloud_id': this.pcId }] };
      });
    }
  }

  subscribeToTerminal() {
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll && !this.syncInProgress), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => {
        this.getVms();
      });
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getDeviceBulkEditFields();
    this.getVMlistData();
    this.loadCriteria();
    this.getVMCreationMetaData();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.extractByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.VMWARE_VIRTUAL_MACHINE) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  getDeviceBulkEditFields() {
    this.vmwareService.getDeviceBulkEditFields().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: BulkUpdateFieldType[]) => {
      this.fields = res;
    });
  }

  getPrivateClouds() {
    this.vmwareService.getPrivateClouds().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      res.forEach(val => {
        if (val.platform_type === 'VMware') {
          this.platformType = val.platform_type;
          this.currentCriteria.params = [{ 'platform_type': this.platformType }];
        }
      });
      this.getVms();
      this.syncVcenterVms();
    }, error => {
      this.spinnerService.stop('main');
    })
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.VMWARE_VIRTUAL_MACHINE }, StorageType.SESSIONSTORAGE)
  }

  get isCrudEnabled() {
    return this.inDevicesPage;
  }

  get showDevicesColumns() {
    return this.inDevicesPage;
  }

  select(view: VMwareViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedVmIds.splice(this.selectedVmIds.indexOf(view.vmId), 1);
    } else {
      this.selectedVmIds.push(view.vmId);
    }
    this.selectedAll = this.selectedVmIds.length == this.viewData.length;
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
        this.selectedVmIds.push(view.vmId);
      });
    } else {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedVmIds = [];
    }
  }

  cancelButton() {
    this.modalRef.hide()
    this.viewData.forEach(view => {
      view.isSelected = false;
    });
    this.selectedVmIds = [];
    this.selectedAll = false;


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

  getVMlistData(){
    if (this.router.url.includes('vmware')) {
        this.getPrivateClouds();
      } else {
        this.getVms();
        this.getVmsSummary();
        this.syncVcenterVms();
      }
  }

  getVms() {
    this.vmwareService.getVms(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.vmwareService.converToViewData(res.results);
      this.getDeviceData();
      setTimeout(() => {
        this.spinnerService.stop('main');
      }, 100)
    }, err => {
      this.viewData = [];
      this.spinnerService.stop('main');
    });
  }

  syncVcenterVms() {
    this.vmwareService.syncVcenterVms().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.getVms();
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  vmsSummary: VMwareVMSummary;
  operatingSystems: Array<{ key: string, value: number }> = [];
  getVmsSummary() {
    this.vmwareService.getVmsSummary(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.vmsSummary = res;
      let operatingSystems: Array<{ key: string, value: number }> = [];
      Object.keys(res?.operating_system).map(os => {
        operatingSystems.push({ 'key': os, 'value': res?.operating_system[os] })
      })
      this.operatingSystems = operatingSystems.sort((a, b) => b.value - a.value);
      this.vmBackupStatusSummary = this.vmwareService.convertToVMBackupStatusSummary(res.backup_status);
    }, err => {
      this.vmsSummary = null;
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.vmwareService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => { }
      )
  }

  updateIp(view: VMwareViewData) {
    this.ipCrudService.updateMgmtIp({ mgmtIp: view.managementIp, vmId: view.vmId, vmType: PlatFormMapping.VMWARE });
  }

  updateTags(view: VMwareViewData) {
    this.tagsCrudService.updateTags({ vmId: view.vmId, tags: view.tags, vmType: PlatFormMapping.VMWARE });
  }

  showInfo(view: VMwareViewData) {
    this.info = view;
    this.modalRef = this.modalService.show(this.serverinfo, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  consoleSameTab(view: VMwareViewData) {
    if (!view.isSameTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.vmwareService.getConsoleAccessInput(view);
    obj.managementIp = view.managementIp;
    this.termService.openTerminal(obj);
  }

  consoleNewTab(view: VMwareViewData) {
    if (!view.isNewTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.vmwareService.getConsoleAccessInput(view);
    obj.managementIp = view.managementIp;
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    window.open(view.newTabConsoleAccessUrl);
  }

  newWebConsole(view: VMwareViewData) {
    // return;
    if (!view.webConsoleIconEnabled) {
      return;
    }

    if (this.pcId) {
      window.open(`${window.location.origin}/vm-html-console?cloud_uuid=${this.pcId}&vm_name=${view.name}`);
    } else {
      window.open(`${window.location.origin}/vm-html-console?cloud_uuid=${view.cloudId}&vm_name=${view.name}`);
    }
  }

  goToDetails(view: VMwareViewData) {
    if (view.monitoring.observium) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.VMWARE_VIRTUAL_MACHINE, configured: view.monitoring.configured, ssr_os: view.ssrOS }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.vmId, 'zbx', 'details'], { relativeTo: this.route });
  }

  goToStats(view: VMwareViewData) {
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.VMWARE_VIRTUAL_MACHINE, configured: view.monitoring.configured, os: view.osName, ssr_os: view.ssrOS }, StorageType.SESSIONSTORAGE);
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

  goToSnaphots(view: VMwareViewData) {
    if (!view.snapshotIconEnabled) {
      return;
    }
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.VMWARE_VIRTUAL_MACHINE }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.vmId, 'snapshots'], { relativeTo: this.route });
  }

  createTicket(data: VMwareViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.VMWARE_VIRTUAL_MACHINE, data.name), metadata: VM_WARE_TICKET_METADATA(DeviceMapping.VMWARE_VIRTUAL_MACHINE, data.name, data.powerStatus, data.osName, data.managementIp, data.hypervisor)
    }, DeviceMapping.VIRTUAL_MACHINE);
  }

  getVMCreationMetaData() {
    if (!this.pcId) {
      return;
    }
    this.cloudNameForApi = this.ucSharedService.getCloudNameForEndpoint(this.vmsService.platformType);
    this.vmwareService.getVMCreationMetaData(this.pcId, this.cloudNameForApi).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.metaData = res;
      } else {
        this.metaData = [];
        this.notification.error(new Notification('Failed to fetch vm creation metadata'));
      }
      this.metadataLoaded = true;
      this.spinnerService.stop('main');
    }, err => {
      this.metaData = [];
      this.metadataLoaded = true;
      this.spinnerService.stop('main');
      let msg = err?.error?.detail ? err?.error?.detail : 'Failed to fetch vm creation metadata'
      this.notification.error(new Notification(msg));
    });
  }

  powerToggle(view: VMwareViewData) {
    if (!view.powerIconEnabled) {
      return;
    }
    this.action = view.powerStatusOn ? VMWARE_VM_ACTIONS.POWER_OFF : VMWARE_VM_ACTIONS.POWER_ON;
    this.buildAuthForm(view.vmId);
  }

  rename(view: VMwareViewData) {
    if (!view.renameVMwareIconEnabled) {
      return;
    }
    this.action = VMWARE_VM_ACTIONS.RENAME;
    this.buildAuthForm(view.vmId);
  }

  clone(view: VMwareViewData) {
    if (!view.cloneIconEnabled) {
      return;
    }
    this.action = VMWARE_VM_ACTIONS.CLONE;
    this.buildAuthForm(view.vmId);
  }

  reboot(view: VMwareViewData) {
    if (!view.rebootIconEnabled) {
      return;
    }
    this.action = VMWARE_VM_ACTIONS.REBOOT;
    this.buildAuthForm(view.vmId);
  }

  convertToTemplate(view: VMwareViewData) {
    if (!view.convertIconEnabled) {
      return;
    }
    this.action = VMWARE_VM_ACTIONS.CONVERT_TO_TEMPLATE;
    this.buildAuthForm(view.vmId);
  }

  shutdownGuestOS(view: VMwareViewData) {
    if (!view.shutdownGuestOSIconEnabled) {
      return;
    }
    this.action = VMWARE_VM_ACTIONS.SHUTDOWN_GUEST_OS;
    this.buildAuthForm(view.vmId);
  }

  installVMwareTool(view: VMwareViewData) {
    if (!view.installVMwareToolIconEnabled) {
      return;
    }
    this.action = view.toolsMounted ? VMWARE_VM_ACTIONS.UN_INSTALL_VMWARE_TOOL : VMWARE_VM_ACTIONS.INSTALL_VMWARE_TOOL;
    this.buildAuthForm(view.vmId);
  }

  deleteVM(view: VMwareViewData) {
    if (!view.deleteIconEnabled) {
      return;
    }
    this.selectedViewData = view;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.confirmDeleteModalRef.hide();
    this.action = VMWARE_VM_ACTIONS.DELETE;
    this.buildAuthForm(this.selectedViewData.vmId);
  }

  buildAuthForm(uuid: string) {
    this.authForm = this.vmwareService.buildAuthForm(uuid);
    this.authFormErrors = this.vmwareService.resetAuthFormErrors();
    this.authValidationMessages = this.vmwareService.authValidationMessages;
    if (this.action == VMWARE_VM_ACTIONS.CLONE) {
      this.cloneForm = this.vmwareService.buildCloneForm();
      this.cloneFormErrors = this.vmwareService.resetCloneFormErrors();
      this.cloneValidationMessages = this.vmwareService.cloneValidationMessages;
      this.cloneForm.get('clone_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        if (val === 'linked_clone') {
          this.cloneForm.addControl('count', new FormControl('1', [Validators.min(1)]));
          if (this.cloneForm.contains('storage')) {
            this.cloneForm.removeControl('storage');
          }
        } else {
          this.cloneForm.addControl('storage', new FormControl('', [Validators.required, NoWhitespaceValidator,
          RxwebValidators.pattern({ expression: { 'pattern': /[a-zA-Z0-9]*[-]*[a-zA-Z0-9]+$/ } })]));
          if (this.cloneForm.contains('count')) {
            this.cloneForm.removeControl('count');
          }
        }
      });
    } else if (this.action == VMWARE_VM_ACTIONS.RENAME) {
      this.renameForm = this.vmwareService.buildRenameForm();
      this.renameFormErrors = this.vmwareService.resetRenameFormErrors();
      this.renameValidationMessages = this.vmwareService.renameValidationMessages;
    } else {
      this.cloneForm = null;
      this.cloneFormErrors = null;
      this.renameForm = null;
      this.renameFormErrors = null;
    }
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
    this.authModalref = this.modalService.show(this.authenticate, Object.assign({}, { class: '', keyboard: false, ignoreBackdropClick: true }));
  }

  onSubmit() {
    if (this.authForm.invalid || (this.action == VMWARE_VM_ACTIONS.CLONE && this.cloneForm.invalid) || (this.action == VMWARE_VM_ACTIONS.RENAME && this.renameForm.invalid)) {
      this.authFormErrors = this.utilService.validateForm(this.authForm, this.authValidationMessages, this.authFormErrors);
      this.subscription = this.authForm.valueChanges
        .subscribe((data: any) => { this.authFormErrors = this.utilService.validateForm(this.authForm, this.authValidationMessages, this.authFormErrors); });
      if (this.action == VMWARE_VM_ACTIONS.CLONE) {
        this.cloneFormErrors = this.utilService.validateForm(this.cloneForm, this.cloneValidationMessages, this.cloneFormErrors);
        const s = this.cloneForm.valueChanges
          .subscribe((data: any) => {
            this.cloneFormErrors = this.utilService.validateForm(this.cloneForm, this.cloneValidationMessages, this.cloneFormErrors);
          });
        this.subscription.add(s);
      } else if (this.action == VMWARE_VM_ACTIONS.RENAME) {
        this.renameFormErrors = this.utilService.validateForm(this.renameForm, this.renameValidationMessages, this.renameFormErrors);
        const s = this.renameForm.valueChanges
          .subscribe((data: any) => {
            this.renameFormErrors = this.utilService.validateForm(this.renameForm, this.renameValidationMessages, this.renameFormErrors);
          });
        this.subscription.add(s);
      }
      return;
    } else {
      this.spinnerService.start('main');
      this.authFormErrors = this.vmwareService.resetAuthFormErrors();
      let authData = this.authForm.getRawValue();
      switch (this.action) {
        case VMWARE_VM_ACTIONS.CONVERT_TO_TEMPLATE:
          this.handleConvertToTemplate(authData);
          break;
        case VMWARE_VM_ACTIONS.REBOOT:
          this.handleReboot(authData);
          break;
        case VMWARE_VM_ACTIONS.POWER_ON:
        case VMWARE_VM_ACTIONS.POWER_OFF:
          this.handlePower(authData);
          break;
        case VMWARE_VM_ACTIONS.SHUTDOWN_GUEST_OS:
          this.handleShutdownGuestOS(authData);
          break;
        case VMWARE_VM_ACTIONS.DELETE:
          this.handleDelete(authData);
          break;
        case VMWARE_VM_ACTIONS.CLONE:
          let cloneData = Object.assign({}, authData, this.cloneForm.getRawValue());
          this.handleClone(cloneData);
          break;
        case VMWARE_VM_ACTIONS.RENAME:
          let renameData = Object.assign({}, authData, this.renameForm.getRawValue());
          this.handleRename(renameData);
          break;
        case VMWARE_VM_ACTIONS.INSTALL_VMWARE_TOOL:
        case VMWARE_VM_ACTIONS.UN_INSTALL_VMWARE_TOOL:
          this.handleInstallVMwareTool(authData);
          break;
      }
    }
  }

  closeAuthModal() {
    this.authModalref.hide();
  }

  private handleError(error: HttpErrorResponse | TaskError | Error) {
    /**
     * `clone`, `reboot` and `convertToTemplate`
     * API's server error response will be handled in this condition
     */
    if (error instanceof HttpErrorResponse) {
      let err = error.error;
      this.authFormErrors = this.vmwareService.resetAuthFormErrors();
      this.cloneFormErrors = this.vmwareService.resetCloneFormErrors();
      if (err.detail) {
        this.authFormErrors['nonFieldErr'] = err.detail;
      } else if (err) {
        for (const field in err) {
          if (field in this.authForm.controls) {
            this.authFormErrors[field] = err[field][0];
          } else if (field in this.cloneForm.controls) {
            this.cloneFormErrors[field] = err[field][0];
          }
        }
      } else {
        this.closeAuthModal();
        this.notification.error(new Notification('Something went wrong!! Please try again.'));
      }
    }
    /**
    * `clone`, `reboot` and `convertToTemplate`
    * API's celery timeout or error will be handled in this condition
    */
    else if (error instanceof TaskError) {
      this.notification.warning(new Notification('Request is taking longer than usual. Please refresh after sometime'));
    }

    else if (error instanceof Error && error.message) {
      this.notification.error(new Notification(error.message));
    }
    /**
    * If `clone`, `reboot` and `convertToTemplate` API are success but
    * returned API do not have `task_id` will be handled
    */
    else {
      this.closeAuthModal();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  private pollForTask(res: CeleryTask) {
    if (res.task_id) {
      this.authModalref.hide();
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Request is being processed. Status will be updated shortly'));
      return this.appService.pollForTask(res.task_id, 5, 300).pipe(take(1));
    } else {
      throw new Error('Something went wrong !... Please try again later');
    }
  }

  updateVm(vmId: string, index: number) {
    this.vmwareService.getVmById(vmId).pipe(take(1)).subscribe(res => {
      this.viewData[index] = this.vmwareService.convertVMtoViewdata(res);
    }, err => {
    });
  }

  handleRename(data: VMwareVMRenameType) {
    this.vmwareService.rename(data).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      const index = this.viewData.map(view => view.vmId).indexOf(data.uuid);
      this.viewData[index].renameVMwareInProgress = true;
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
      if (status.result.data) {
        this.notification.success(new Notification(`VM renamed successfully`));
      } else if (status.result['error']) {
        this.notification.error(new Notification(status.result['error']));
      }
      this.getVms();
    }, (err: HttpErrorResponse | TaskError | Error) => this.handleError(err));
  }

  handleClone(data: VMwareVMCloneType) {
    this.vmwareService.clone(data).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      const index = this.viewData.map(view => view.vmId).indexOf(data.uuid);
      this.viewData[index].cloneInProgress = true;
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
      if (status.result.data) {
        this.notification.success(new Notification(`VM cloned successfully`));
      } else if (status.result['error']) {
        this.notification.error(new Notification(status.result['error']));
      }
      this.getVms();
    }, (err: HttpErrorResponse | TaskError | Error) => this.handleError(err));
  }

  handleReboot(data: VMwareVMAuthType) {
    this.vmwareService.reboot(data).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      const index = this.viewData.map(view => view.vmId).indexOf(data.uuid);
      this.viewData[index].rebootInProgress = true;
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
      if (status.result.data) {
        this.notification.success(new Notification(`VM rebooted successfully`));
      } else if (status.result['error']) {
        this.notification.error(new Notification(status.result['error']));
      }
      this.getVms();
    }, (err: HttpErrorResponse | TaskError | Error) => this.handleError(err));
  }

  handleShutdownGuestOS(data: VMwareVMAuthType) {
    this.vmwareService.handleShutdownGuestOS(data).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      const index = this.viewData.map(view => view.vmId).indexOf(data.uuid);
      this.viewData[index].shutdownGuestOSInProgress = true;
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
      if (status.result.data) {
        this.notification.success(new Notification(`VM guest OS shutdown successful`));
      } else if (status.result['error']) {
        this.notification.error(new Notification(status.result['error']));
      }
      this.getVms();
    }, (err: HttpErrorResponse | TaskError | Error) => {
      let index = this.viewData.findIndex(vm => vm.vmId == data.uuid);
      if (index !== -1) {
        this.viewData[index].installVMwareToolInProgress = false;
      }
      this.handleError(err)
    });
  }

  handleInstallVMwareTool(data: VMwareVMAuthType) {
    const i = this.viewData.map(view => view.vmId).indexOf(data.uuid);
    this.vmwareService.handleInstallVMwareTool(data, this.viewData[i].toolsMounted).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      const index = this.viewData.map(view => view.vmId).indexOf(data.uuid);
      this.viewData[index].installVMwareToolInProgress = true;
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
      if (status.result.data) {
        this.notification.success(new Notification(`VMware Tools installed successfully.`));
      } else if (status.result['error']) {
        this.notification.error(new Notification(status.result['error']));
      }
      this.getVms();
    }, (err: HttpErrorResponse | TaskError | Error) => {
      let index = this.viewData.findIndex(vm => vm.vmId == data.uuid);
      if (index !== -1) {
        this.viewData[index].installVMwareToolInProgress = false;
      }
      this.handleError(err);
    })
  }

  handlePower(data: VMwareVMAuthType) {
    const i = this.viewData.map(view => view.vmId).indexOf(data.uuid);
    const input: PowerToggleInput = this.vmwareService.getToggleInput(this.viewData[i]);
    for (const field in input.extraParams) {
      data[field] = input.extraParams[field];
    }
    this.vmwareService.powerToggle(input, data).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      const index = this.viewData.map(view => view.vmId).indexOf(data.uuid);
      this.viewData[index].setPowerInProgress();
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
      if (status.result.data) {
        let ac = input.currentPowerStatus ? 'off' : 'on'
        this.notification.success(new Notification(`VM powered ${ac} successfully`));
      } else if (status.result['error']) {
        this.notification.error(new Notification(status.result['error']));
      }
      this.updateVm(this.viewData[i].vmId, i);
    }, (err: HttpErrorResponse | TaskError | Error) => this.handleError(err));
  }

  handleDelete(data: VMwareVMAuthType) {
    this.vmwareService.delete(data).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      const index = this.viewData.map(view => view.vmId).indexOf(data.uuid);
      this.viewData[index].deleteInProgress = true;
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
      if (status.result.data) {
        this.notification.success(new Notification(`VM deleted successfully`));
      } else if (status.result['error']) {
        this.notification.error(new Notification(status.result['error']));
      }
      this.getVms();
    }, (err: HttpErrorResponse | TaskError | Error) => this.handleError(err));
  }

  handleConvertToTemplate(data: VMwareVMAuthType) {
    const i = this.viewData.map(view => view.vmId).indexOf(data.uuid);
    this.vmwareService.convertToTemplate(data).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      const index = this.viewData.map(view => view.vmId).indexOf(data.uuid);
      this.viewData[index].convertInProgress = true;
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
      if (status.result.data) {
        this.notification.success(new Notification(`VM converted successfully`));
      } else if (status.result['error']) {
        this.notification.error(new Notification(status.result['error']));
      }
      this.updateVm(this.viewData[i].vmId, i);
    }, (err: HttpErrorResponse | TaskError | Error) => this.handleError(err));
  }

  addVM() {
    if (!this.metaData.length) {
      return;
    }
    this.VmsAddService.addVM();
  }

  editVM(view: VMwareViewData) {
    if (view.isTemplate || !this.metaData.length) {
      return;
    }
    this.VmsAddService.editVM(view.vmId, view.name);
  }

  deployOVF() {
    if (!this.metaData.length) {
      return;
    }
    this.ovfService.deployOVF();
  }

  deployOVA() {
    if (!this.metaData.length) {
      return;
    }
    this.ovaService.deployOVA();
  }

  createTaskAndPoll() {
    this.vmwareService.syncVMS(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getVms();
    }, err => {
      this.notification.error(new Notification(err.error.detail));
      // this.notification.error(new Notification('Error while updating VM settings. Please try again later!!'));
    })
  }

  goToBackupVMHistory(view: VMwareViewData) {
    if (!view.backupId) {
      return;
    }
    this.router.navigate([view.backupId, 'vm-backup-history'], { relativeTo: this.route });
  }

  bulkUpdate() {
    this.modalRef = this.modalService.show(this.bulkEditModel, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  submit(obj: Record<string, any>) {
    this.spinnerService.start('main');
    this.modalRef.hide();
    this.vmwareService.updateMultipleVm(this.selectedVmIds, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getVMlistData();
      this.selectedVmIds = [];
      this.selectedAll = false;
      this.notification.success(new Notification(`Vmware Vm's Updated successfully`));
      this.spinnerService.stop('main');
    }, err => {
      this.viewData.forEach(view => {
        view.isSelected = false;
      });
      this.getVMlistData();
      this.selectedVmIds = []
      this.selectedAll = false;
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
      this.spinnerService.stop('main');
    });
  }
}
