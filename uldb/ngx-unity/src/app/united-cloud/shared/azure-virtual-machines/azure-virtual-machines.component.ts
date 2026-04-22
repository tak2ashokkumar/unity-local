import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { interval, Subject } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { AzurePowerToggleInput } from '../../assets/assets-vms/assets-vms-azure/assets-vms-azure.service';
import { AzureVirtualMachinesService, AzureVMSViewData } from './azure-virtual-machines.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { AZURE_VM_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';

@Component({
  selector: 'azure-virtual-machines',
  templateUrl: './azure-virtual-machines.component.html',
  styleUrls: ['./azure-virtual-machines.component.scss'],
  providers: [AzureVirtualMachinesService]
})
export class AzureVirtualMachinesComponent implements OnInit, OnDestroy {
  @Input() accountId: number;
  @Input() resourceGroup: string;

  fieldsToFilterOn: string[] = ['name', 'instanceType', 'location', 'provisionState', 'availabilitySet'];
  private ngUnsubscribe = new Subject();
  viewData: AzureVMSViewData[] = [];
  filteredViewData: AzureVMSViewData[] = [];
  pagedviewData: AzureVMSViewData[] = [];
  actionInput: AzureVMSViewData;
  currentCriteria: SearchCriteria;
  poll: boolean = false;
  syncInProgress: boolean = false;

  @ViewChild('deleteAzureVm') deleteAzureVm: ElementRef;
  deleteVmModalRef: BsModalRef;

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;
  confirmInput: AzurePowerToggleInput;

  @ViewChild('createAzureVm') createAzureVm: ElementRef;
  createVmModalRef: BsModalRef;
  createVMFormValidationMessages: any;
  createVMFormErrors: any
  createVMForm: FormGroup;

  @ViewChild('tagsRef') tagsRef: ElementRef;
  tagsModalRef: BsModalRef;
  tagForm: FormGroup;
  tagFormErrors: any;
  tagFormValidationMessages: any;
  tags: { [key: string]: string };

  OSTypes: AzureVMOS[] = [];
  azureLocations: AzureLocationData[] = [];
  availabilitySets: AzureResourceGroupAvailabilitySets[] = [];
  filteredAvailablitySets: AzureResourceGroupAvailabilitySets[] = [];
  nics: AzureResourceGroupNIC[] = [];
  filteredNics: AzureResourceGroupNIC[] = [];
  storageAccounts: AzureResourceGroupStorageAccounts[] = [];
  filteredStorageAccounts: AzureResourceGroupStorageAccounts[] = [];
  account_uuid: string;
  loadingOS: boolean = false;

  constructor(private azureVMService: AzureVirtualMachinesService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private modalService: BsModalService,
    private clientSidePage: ClientSidePage,
    private termService: FloatingTerminalService,
    private ticketService: SharedCreateTicketService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE }
  }

  subscribeToTerminal() {
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll && !this.syncInProgress), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => {
        this.loadVms(true);
      });
  }

  ngOnInit() {
    this.spinner.start('main');
    this.loadVms(false);
    this.loadVms(true);
    this.getAzureLocations();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private filterAndPage() {
    this.filteredViewData = this.clientSideSearchPipe.transform(this.viewData, this.currentCriteria.searchValue, this.fieldsToFilterOn);
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.filterAndPage();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.loadVms(true);
    this.azureVMService.syncDiscoverdVms();
  }

  loadVms(update: boolean) {
    // if (`${this.accountId}` && this.resourceGroup) {
    //   this.getVmbyAccountIdAndResourceGroup();
    // } else {
    // }
    this.getVms(update);
  }

  // getVmbyAccountIdAndResourceGroup() {
  //   if (this.syncInProgress) {
  //     this.spinner.stop('main');
  //     return;
  //   }
  //   this.syncInProgress = true;
  //   this.azureVMService.getVmbyAccountIdAndResourceGroup(`${this.accountId}`, this.resourceGroup).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //     this.viewData = this.azureVMService.convertToViewData(res.data);
  //     this.filterAndPage();
  //     this.spinner.stop('main');
  //     this.syncInProgress = false;
  //     this.subscribeToTerminal();
  //   }, (err: HttpErrorResponse) => {
  //     this.syncInProgress = false;
  //     this.subscribeToTerminal();
  //     this.notification.error(new Notification('Something went wrong. Please try again!!'));
  //     this.spinner.stop('main');
  //   });
  // }

  getVms(update: boolean) {
    if (this.syncInProgress) {
      this.spinner.stop('main');
      return;
    }
    if (update) {
      this.syncInProgress = true;
    }
    this.azureVMService.getVms(`${this.accountId}`, this.resourceGroup, update).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.azureVMService.convertToViewData(res);
      this.filterAndPage();
      this.spinner.stop('main');
      this.syncInProgress = false;
      this.subscribeToTerminal();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong. Please try again!!'));
      this.spinner.stop('main');
      this.syncInProgress = false;
      this.subscribeToTerminal();
    });
  }

  filterDetailsByIndex(view: AzureVMSViewData) {
    const index = this.viewData.map(data => data.name).indexOf(this.actionInput.name);
    this.resourceGroup = this.resourceGroup ? this.resourceGroup : this.viewData[index].resourceGroup;
    this.account_uuid = this.account_uuid ? this.account_uuid : this.viewData[index].account_uuid;
  }

  powerToggle(view: AzureVMSViewData) {
    if (!view.isPowerIconEnabled) {
      return;
    }
    this.actionInput = view;
    this.filterDetailsByIndex(this.actionInput);
    this.confirmInput = this.azureVMService.getToggleInput(view, `${this.accountId}`, this.resourceGroup, this.account_uuid);
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmToggle() {
    this.confirmModalRef.hide();
    const index = this.viewData.map(data => data.name).indexOf(this.actionInput.name);
    this.viewData[index].isPowerIconEnabled = !this.viewData[index].isPowerIconEnabled;
    this.viewData[index].powerStatusIcon = 'fa-spinner fa-spin';
    this.viewData[index].powerStatus = this.confirmInput.currentPowerStatus ? 'Stopping' : 'Starting';
    this.azureVMService.togglePower(this.confirmInput).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.viewData[index].powerStatusIcon = 'fa-power-off';
      if (status.result.data) {
        this.viewData[index].powerStatus = this.confirmInput.currentPowerStatus ? 'Down' : 'Up';
        this.viewData[index].powerStatusOn = this.confirmInput.currentPowerStatus ? false : true;
        this.viewData[index].isPowerIconEnabled = true;
        this.viewData[index].powerTooltipMessage = this.confirmInput.currentPowerStatus ? 'Power On' : 'Power Off';

        const msg = this.confirmInput.currentPowerStatus ? 'Stopped ' : 'Started ';
        this.notification.success(new Notification(msg + this.confirmInput.deviceName + ' Successfully'));
      } else {
        this.viewData[index].powerStatus = this.confirmInput.currentPowerStatus ? 'Up' : 'Down';
        const msg = this.confirmInput.currentPowerStatus ? 'Stopping ' : 'Starting ';
        this.notification.error(new Notification(msg + this.confirmInput.deviceName + ' Failed. Please try again later.'));
      }
    }, (err: Error) => {
      this.viewData[index].powerStatus = this.confirmInput.currentPowerStatus ? 'Up' : 'Down';
      this.viewData[index].powerStatusIcon = 'fa-power-off';
      const msg = this.confirmInput.currentPowerStatus ? 'Stopping ' : 'Starting ';
      this.notification.error(new Notification(msg + this.confirmInput.deviceName + ' Failed. Please try again later.'));
    });
  }

  deleteVM(view: AzureVMSViewData) {
    this.actionInput = view;
    this.deleteVmModalRef = this.modalService.show(this.deleteAzureVm, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmVMDelete() {
    this.deleteVmModalRef.hide();
    this.filterDetailsByIndex(this.actionInput);
    this.azureVMService.deleteVM(this.actionInput.name, this.resourceGroup, this.account_uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data.result.data) {
        this.notification.success(new Notification(data.result.data));
        this.loadVms(true);
      } else {
        this.notification.error(new Notification(data.result.error));
      }
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification(err.error));
    })
  }

  getAzureLocations() {
    this.azureVMService.getAzureLocations().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.azureLocations = data.results;
    })
  }

  getAvailabilitySets() {
    this.azureVMService.getAvailablitySets(this.accountId, this.resourceGroup).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.availabilitySets = data;
      this.filteredAvailablitySets = data;
    })
  }

  getNICs() {
    this.azureVMService.getNICs(this.accountId, this.resourceGroup).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.nics = data;
      this.filteredNics = data;
    })
  }

  getStorageAccounts() {
    this.azureVMService.getStorageAccounts(this.accountId, this.resourceGroup).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.storageAccounts = data;
      this.filteredStorageAccounts = data;
    })
  }

  getAzureVMImages(location: string) {
    this.loadingOS = true;
    this.OSTypes = [];
    this.azureVMService.getAzureVMImages(location).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.loadingOS = false;
      this.OSTypes = data;
    })
  }

  buildTagForm(key?: string) {
    this.tagFormErrors = this.azureVMService.resetTagFormErrors();
    this.tagFormValidationMessages = this.azureVMService.tagValidationMessages;
    this.tagForm = this.azureVMService.buildTagForm(key ? { key: key, value: this.tags[key] } : null);
  }

  manageTags(view: AzureVMSViewData) {
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
    this.spinner.start('main');
    this.filterDetailsByIndex(this.actionInput);
    this.azureVMService.updateTags(this.resourceGroup, this.actionInput, this.tags, this.account_uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.loadVms(true);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to update tags. Please try again later.'));
    });
  }

  createVM() {
    this.getAvailabilitySets();
    this.getNICs();
    this.getStorageAccounts();

    this.createVMFormErrors = this.azureVMService.resetVMCreateFormErrors();
    this.createVMFormValidationMessages = this.azureVMService.createVMValidationMessages;
    this.createVMForm = this.azureVMService.buildVMCreateForm(this.accountId, this.resourceGroup);
    this.tags = {};
    this.buildTagForm();
    this.createVmModalRef = this.modalService.show(this.createAzureVm, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));

    this.createVMForm.get('location').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: AzureLocationData) => {
      this.filteredAvailablitySets = this.availabilitySets.filter(set => (set.location == val.short_name));
      this.filteredNics = this.nics.filter(nic => (nic.location == val.short_name));
      this.filteredStorageAccounts = this.storageAccounts.filter(account => (account.primary_location == val.short_name));
      this.createVMForm.get('os_type').setValue('');
      this.getAzureVMImages(val.short_name);
    });
  }

  confirmVMCreate() {
    if (this.createVMForm.invalid) {
      this.createVMFormErrors = this.utilService.validateForm(this.createVMForm, this.createVMFormValidationMessages, this.createVMFormErrors);
      this.createVMForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.createVMFormErrors = this.utilService.validateForm(this.createVMForm, this.createVMFormValidationMessages, this.createVMFormErrors); });
    } else {
      this.createVmModalRef.hide();
      this.spinner.start('main');
      this.azureVMService.createVM(this.createVMForm.getRawValue(), this.tags).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
        if (res.result.data) {
          this.notification.success(new Notification('Virtual Machine Created Successfully'));
          this.loadVms(true);
        } else {
          this.notification.error(new Notification(res.result.error));
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Instance Creation Failed. Please try again later.'));
      });
    }
  }

  consoleSameTab(view: AzureVMSViewData) {
    if (!view.isSameTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.azureVMService.getConsoleAccessInput(view);
    obj.managementIp = view.managementIp;
    this.termService.openTerminal(obj);
    // this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    // this.router.navigate([view.vmId, 'console'], { relativeTo: this.route });
  }

  consoleNewTab(view: AzureVMSViewData) {
    if (!view.isNewTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.azureVMService.getConsoleAccessInput(view);
    obj.managementIp = view.managementIp;
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    window.open(view.newTabConsoleAccessUrl);
  }

  // newWebConsole(view: AzureVMSViewData) {
  //   // return;
  //   if (!view.webConsoleIconEnabled) {
  //     return;
  //   }

  //   if (this.pcId) {
  //     window.open(`${window.location.origin}/vm-html-console?cloud_uuid=${this.pcId}&vm_name=${view.name}`);
  //   } else {
  //     window.open(`${window.location.origin}/vm-html-console?cloud_uuid=${view.cloudId}&vm_name=${view.name}`);
  //   }
  // }

  goToStats(view: AzureVMSViewData) {
    if (!view.isStatsEnabled) {
      return;
    }
    // this.saveCriteria();
    this.storageService.put('device', {
      name: view.name, deviceType: DeviceMapping.AZURE_VIRTUAL_MACHINE,
      configured: view.monitoring.configured, uuid: `${view.uuid}`
    }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.zabbix) {
      if (view.monitoring.configured) {
        this.router.navigate([view.uuid, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      }
    }
  }

  createTicket(view: AzureVMSViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT("Azure Virtual Machine", view.name), metadata: AZURE_VM_TICKET_METADATA(view.name,
        view.accountName, view.region, view.osType, view.ipType, view.osName, view.managementIp)
    });
  }
}
