import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AccountsDetailListViewData, AzureResourcesViewData, PublicCloudAzureSummaryDetailsService, ResourceDetailsViewData } from './public-cloud-azure-summary-details.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject, interval } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { environment } from 'src/environments/environment';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { AzurePowerToggleInputVM } from 'src/app/united-cloud/assets/assets-vms/assets-vms-azure/assets-vms-azure.service';
import { AzureAccountsType, AzureVirtalNetwork, AzureVirtalNetworkSubnet } from '../../entities/azure-accounts.type';

@Component({
  selector: 'public-cloud-azure-summary-details',
  templateUrl: './public-cloud-azure-summary-details.component.html',
  styleUrls: ['./public-cloud-azure-summary-details.component.scss'],
  providers: [PublicCloudAzureSummaryDetailsService]
})
export class PublicCloudAzureSummaryDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  @Input() accountId: string;

  count: number;
  viewData: AzureResourcesViewData[] = [];
  resourcesDetailViewData: ResourceDetailsViewData = new ResourceDetailsViewData();
  azureAccountViewData: AzureAccountsType[] = [];

  location: any;
  resourceGroups: string[];
  allResource: string;
  azureSummary: AccountsDetailListViewData = new AccountsDetailListViewData();

  selectedResourceName: string = "Resources";
  resourceId: number | string;

  @ViewChild('createAzureVm') createAzureVm: ElementRef;
  createVmModalRef: BsModalRef;
  createVMFormValidationMessages: any;
  createVMFormErrors: any;
  createVMForm: FormGroup;

  @ViewChild('deleteAzureVm') deleteAzureVm: ElementRef;
  @ViewChild('switchAzureVmPowerRef') switchAzureVmPowerRef: ElementRef;
  vmActionForm: FormGroup;
  vmActionFormErrors: any;
  vmActionFormValidationMessages: any;
  switchAzureVmPowerModalRef: BsModalRef;
  deleteVmModalRef: BsModalRef;

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;
  confirmInput: AzurePowerToggleInputVM;

  @ViewChild('tagsRef') tagsRef: ElementRef;
  tagsModalRef: BsModalRef;
  tagForm: FormGroup;
  tagFormErrors: any;
  tagFormValidationMessages: any;
  tags: { [key: string]: string };

  poll: boolean = false;
  syncInProgress: boolean = false;

  OSTypes: AzureVMOS[] = [];
  azureLocations: AzureLocationData[] = [];
  availabilitySets: AzureResourceGroupAvailabilitySets[] = [];
  filteredAvailablitySets: AzureResourceGroupAvailabilitySets[] = [];
  nics: AzureResourceGroupNIC[] = [];
  filteredNics: AzureResourceGroupNIC[] = [];
  storageAccounts: AzureResourceGroupStorageAccounts[] = [];
  filteredStorageAccounts: AzureResourceGroupStorageAccounts[] = [];

  loadingOS: boolean = false;
  actionInput: AzureResourcesViewData;
  vmCreationResourceGroups: string[] = [];
  vmCreationResourceGroup: string;

  @ViewChild('createnic') createnic: ElementRef;
  createNICModalRef: BsModalRef;
  createNICFormErrors: any;
  createNICValidationMessages: any;
  createNICForm: FormGroup;
  virtualNetworks: AzureVirtalNetwork[] = [];
  virtualNetworkSubnets: AzureVirtalNetworkSubnet[] = [];
  vnet: string;
  allowedStatsResources = ['Virtual Machines', 'Storage Accounts', 'Flexible Servers', 'Servers/Databases', 'Database Accounts'];


  accountDetailsSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "uuid",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  accountDetailsTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Subscriptions',
  };

  resourceGroupSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  userSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Resource Group',
  };

  locationSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "short_name",
    keyToSelect: "short_name",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  userSelectionLocationTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Location',
  };

  constructor(private svc: PublicCloudAzureSummaryDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private storageService: StorageService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private modalService: BsModalService,
    private termService: FloatingTerminalService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.resourceId = params.get('serviceId');
      this.getResourceDetails();
    });
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { account_uuid: [], resource_group: [], region: [] }
    };
  }

  subscribeToTerminal() {
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll && !this.syncInProgress), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => {
        this.getAzureResourceDetails();
      });
  }

  ngOnInit(): void {
    this.getResourceGroup();
    this.loadData();
    this.getAzureSubscriptionDetails();
    this.getAzureLocations();
    this.svc.syncDiscoverdVms();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    // this.storageService.removeByKey('azureAccounts', StorageType.SESSIONSTORAGE);
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { account_uuid: [], resource_group: [], location: [] }
    };
    this.filterResource();
    this.svc.syncDiscoverdVms();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getAzureResourceDetails();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAzureResourceDetails();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getAzureResourceDetails();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getAzureResourceDetails();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getAzureResourceDetails();
  }

  loadData() {
    const azureUuid = this.storageService.getByKey('azureAccounts', StorageType.SESSIONSTORAGE);
    this.currentCriteria.multiValueParam.account_uuid = [];
    azureUuid.uuid.forEach(s => {
      this.currentCriteria.multiValueParam.account_uuid.push(s);
    });
  }

  getAzureResourceDetails() {
    this.svc.getAzureResourceDetails(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewdata(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.notification.error(new Notification('Failed to load resource details. Please try again!!'));
      this.spinner.stop('main');
    })
  }

  filterByResourceType(id?: number, resourceName?: string) {
    this.currentCriteria.pageNo = 1;
    if (resourceName) {
      this.resourceId = id;
      this.allResource = '';
      const selectedResource = this.resourcesDetailViewData.resourceCounts.find(resource => resource.id == id);
      if (selectedResource) {
        this.selectedResourceName = selectedResource.displayName;
        this.currentCriteria.params = [{ resource_type: id }];
        this.router.navigate(['../', this.resourceId], { relativeTo: this.route });
      }
    } else {
      this.selectedResourceName = 'Resources';
      this.currentCriteria.params = [{}];
      this.allResource = 'Resources';
      this.router.navigate(['../', 'allresources'], { relativeTo: this.route });
    }
    this.getAzureResourceDetails();
    if (resourceName == 'Storage Accounts' || resourceName == 'Flexible Servers') {
      this.svc.syncDiscoverdVms();
    }
  }


  filterResource() {
    const source = this.resourcesDetailViewData.resourceCounts.find(resource => resource.id == this.resourceId);
    if (source) {
      this.selectedResourceName = source.displayName;
      this.currentCriteria.params = [{ resource_type: source.id }];
    } else {
      this.selectedResourceName = 'Resources';
      this.allResource = 'Resources';
      this.router.navigate(['../', 'allresources'], { relativeTo: this.route });
    }
    this.loadData();
    this.getAzureResourceDetails();
  }

  getResourceGroup() {
    this.svc.getResourceGroups().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.resourceGroups = res;
    })
  }

  getLocation() {
    this.svc.getLocation().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.location = res;
    })
  }

  getAzureSubscriptionDetails() {
    this.svc.getAzureSubscriptionDetails().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.azureAccountViewData = data;
      this.azureSummary = this.svc.convertAzureCustomerListDetailsViewData(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to load subscription detail. Please try again!!'));
      this.spinner.stop('main');
    });
  }

  getResourceDetails() {
    this.spinner.start('main');
    this.svc.getResourceDetails().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.resourcesDetailViewData = this.svc.convertToResourceViewData(res);
      this.filterResource();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to load service details. Please try again!!'));
      this.spinner.stop('main');
    })
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  goToCost() {
    this.router.navigate(['/cost-analysis/public-cloud/azure']);
  }

  goToResource(view: AzureResourcesViewData) {
    this.router.navigate(['services', this.resourceId, view.accountUuid, 'resources', view.uuid], { relativeTo: this.route.parent });
  }

  getAzureLocations() {
    this.svc.getAzureLocations().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.azureLocations = data.results;
    })
  }

  createVM() {
    this.createVMFormErrors = this.svc.resetVMCreateFormErrors();
    this.createVMFormValidationMessages = this.svc.createVMValidationMessages;
    this.createVMForm = this.svc.buildVMCreateForm();

    this.createVMForm.get('account_uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: any) => {
      this.accountId = val;
      const result = this.azureAccountViewData.find(result => result.uuid == val);
      this.svc.getResourceGroups(result.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.vmCreationResourceGroups = [];
        this.vmCreationResourceGroups = data;
        this.createVMForm.get('resource_group').enable({ emitEvent: false });
      })
    });

    this.createVMForm.get('resource_group').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: any) => {
      this.vmCreationResourceGroup = val;
      this.createVMForm.get('resource_name').setValue(this.vmCreationResourceGroup);

      this.nics = [];
      this.filteredNics = [];
      this.createVMForm.get('nic').setValue('');
      this.createVMForm.get('nic').disable({ emitEvent: false });
      this.svc.getNICs(this.accountId, this.vmCreationResourceGroup).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.nics = data;
        this.filteredNics = data;
        this.createVMForm.get('nic').enable({ emitEvent: false });
      });

      this.storageAccounts = [];
      this.filteredStorageAccounts = [];
      this.createVMForm.get('storage_account').reset();
      this.createVMForm.get('storage_account').disable({ emitEvent: false });
      this.svc.getStorageAccounts(this.accountId, this.vmCreationResourceGroup).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.storageAccounts = data;
        this.filteredStorageAccounts = data;
        this.createVMForm.get('storage_account').enable({ emitEvent: false });
      });

      this.availabilitySets = [];
      this.filteredAvailablitySets = [];
      this.createVMForm.get('availability_set').reset();
      this.createVMForm.get('availability_set').disable({ emitEvent: false });
      this.svc.getAvailablitySets(this.accountId, this.vmCreationResourceGroup).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.availabilitySets = data;
        this.filteredAvailablitySets = data;
        this.createVMForm.get('availability_set').enable({ emitEvent: false });
      });
    });

    this.createVMForm.get('location').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: AzureLocationData) => {
      this.filteredAvailablitySets = this.availabilitySets.filter(set => (set.location == val.short_name));
      this.filteredNics = this.nics.filter(nic => (nic.location == val.short_name));
      this.filteredStorageAccounts = this.storageAccounts.filter(account => (account.primary_location == val.short_name));

      this.loadingOS = true;
      this.OSTypes = [];
      this.createVMForm.get('os_type').setValue('');
      this.createVMForm.get('os_type').disable({ emitEvent: false });
      this.svc.getAzureVMImages(val.short_name).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.OSTypes = data;
        this.loadingOS = false;
        this.createVMForm.get('os_type').enable({ emitEvent: false });
      }, (err: HttpErrorResponse) => {
        this.loadingOS = false;
      })
    });

    this.tags = {};
    this.buildTagForm();
    this.createVmModalRef = this.modalService.show(this.createAzureVm, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  buildTagForm(key?: string) {
    this.tagFormErrors = this.svc.resetTagFormErrors();
    this.tagFormValidationMessages = this.svc.tagValidationMessages;
    this.tagForm = this.svc.buildTagForm(key ? { key: key, value: this.tags[key] } : null);
  }

  manageTags(view: AzureResourcesViewData) {
    this.actionInput = view;
    this.vmActionForm = this.svc.buildVMActionForm();
    this.vmActionFormErrors = this.svc.resetVMActionFormErrors();
    this.vmActionFormValidationMessages = this.svc.vmActionFormValidationMessages;

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
    if (this.vmActionForm.invalid) {
      this.vmActionFormErrors = this.utilService.validateForm(this.vmActionForm, this.vmActionFormValidationMessages, this.vmActionFormErrors);
      this.vmActionForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.vmActionFormErrors = this.utilService.validateForm(this.vmActionForm, this.vmActionFormValidationMessages, this.vmActionFormErrors); });
    } else {
      let obj = Object.assign({}, this.vmActionForm.getRawValue());
      this.tagsModalRef.hide();
      this.spinner.start('main');
      this.svc.updateTags(this.actionInput.accountUuid, this.actionInput.resourceGroup, this.actionInput, this.tags, obj.username, obj.password).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.notification.success(new Notification('Tags are updated.'));
        this.getAzureResourceDetails();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        if (err.error.detail) {
          this.notification.error(new Notification(err.error.detail));
        } else {
          this.notification.error(new Notification('Failed to update tags. Please try again later.'));
        }
      });
    }
  }

  confirmVMCreate() {
    if (this.createVMForm.invalid) {
      this.createVMFormErrors = this.utilService.validateForm(this.createVMForm, this.createVMFormValidationMessages, this.createVMFormErrors);
      this.createVMForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.createVMFormErrors = this.utilService.validateForm(this.createVMForm, this.createVMFormValidationMessages, this.createVMFormErrors); });
    } else {
      this.spinner.start('main');
      this.createVmModalRef.hide();
      this.svc.createVM(this.createVMForm.getRawValue(), this.tags).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
        if (res.result.data) {
          this.notification.success(new Notification('Virtual Machine Created Successfully'));
          this.syncInProgress = true;
          this.getAzureResourceDetails();
        } else {
          this.notification.error(new Notification(res.result.error));
        }
      }, (err: HttpErrorResponse) => {
        this.notification.error(new Notification('Instance Creation Failed. Please try again later.'));
        this.spinner.stop('main');
        this.syncInProgress = false;
        this.subscribeToTerminal();
      });
    }
  }

  powerToggle(view: AzureResourcesViewData) {
    if (!view.isPowerIconEnabled) {
      return;
    }
    this.actionInput = view;
    this.vmActionForm = this.svc.buildVMActionForm();
    this.vmActionFormErrors = this.svc.resetVMActionFormErrors();
    this.vmActionFormValidationMessages = this.svc.vmActionFormValidationMessages;
    this.confirmInput = this.svc.getToggleInput(view, `${view.accountUuid}`, view.resourceGroup);
    this.switchAzureVmPowerModalRef = this.modalService.show(this.switchAzureVmPowerRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmToggle() {
    if (this.vmActionForm.invalid) {
      this.vmActionFormErrors = this.utilService.validateForm(this.vmActionForm, this.vmActionFormValidationMessages, this.vmActionFormErrors);
      this.vmActionForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.vmActionFormErrors = this.utilService.validateForm(this.vmActionForm, this.vmActionFormValidationMessages, this.vmActionFormErrors); });
    } else {
      this.switchAzureVmPowerModalRef.hide();
      let obj = Object.assign({}, this.confirmInput, this.vmActionForm.getRawValue());
      const index = this.viewData.map(data => data.name).indexOf(this.actionInput.name);
      this.viewData[index].isPowerIconEnabled = !this.viewData[index].isPowerIconEnabled;
      this.viewData[index].powerStatusIcon = 'fa-spinner fa-spin';
      this.viewData[index].powerStatus = this.confirmInput.currentPowerStatus ? 'Stopping' : 'Starting';
      this.svc.togglePower(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
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
  }

  consoleSameTab(view: AzureResourcesViewData) {
    if (!view.isSameTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.svc.getConsoleAccessInput(view);
    this.termService.openTerminal(obj);
  }

  consoleNewTab(view: AzureResourcesViewData) {
    if (!view.isNewTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.svc.getConsoleAccessInput(view);
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    window.open(view.newTabConsoleAccessUrl);
  }

  goToStats(view: AzureResourcesViewData) {
    // if (!view.isStatsEnabled) {
    //   return;
    // }
    if (this.selectedResourceName == 'Virtual Machines') {
      this.storageService.put('device', {
        name: view.name, deviceType: DeviceMapping.AZURE_VIRTUAL_MACHINE,
        configured: view.monitoring.configured, uuid: `${view.vmId}`
      }, StorageType.SESSIONSTORAGE);
      this.router.navigate([view.uuid, 'zbx', 'configureAzure'], { relativeTo: this.route });
      if (view.monitoring.zabbix) {
        if (view.monitoring.configured) {
          this.router.navigate([view.uuid, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
        } else {
          this.router.navigate([view.uuid, 'zbx', 'configureAzure'], { relativeTo: this.route });
        }
      }
    } else {
      if (!view.isStatsEnabled) {
        return;
      }
      this.storageService.put('device', {
        name: view.name, deviceType: DeviceMapping.AZURE_SERVICES,
        configured: view.monitoring.configured, uuid: `${view.vmId}`
      }, StorageType.SESSIONSTORAGE);
      if (view.monitoring.zabbix) {
        if (view.monitoring.configured) {
          this.router.navigate([view.uuid, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
        }
      }
    }
    // if (view.monitoring.zabbix) {
    //   if (view.monitoring.configured) {
    //     this.router.navigate([view.uuid, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
    //   }
    // }
  }

  deleteVM(view: AzureResourcesViewData) {
    this.actionInput = view;
    this.vmActionForm = this.svc.buildVMActionForm();
    this.vmActionFormErrors = this.svc.resetVMActionFormErrors();
    this.vmActionFormValidationMessages = this.svc.vmActionFormValidationMessages;
    this.deleteVmModalRef = this.modalService.show(this.deleteAzureVm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmVMDelete() {
    if (this.vmActionForm.invalid) {
      this.vmActionFormErrors = this.utilService.validateForm(this.vmActionForm, this.vmActionFormValidationMessages, this.vmActionFormErrors);
      this.vmActionForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.vmActionFormErrors = this.utilService.validateForm(this.vmActionForm, this.vmActionFormValidationMessages, this.vmActionFormErrors); });
    } else {
      let obj = Object.assign({}, this.vmActionForm.getRawValue());
      this.deleteVmModalRef.hide();
      this.svc.deleteVM(this.actionInput.name, this.actionInput.resourceGroup, this.actionInput.accountUuid, obj.username, obj.password).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        if (data.result.data) {
          this.notification.success(new Notification(data.result.data));
          this.getAzureResourceDetails();
        } else {
          this.notification.error(new Notification(data.result.error));
        }
      }, (err: HttpErrorResponse) => {
        if (err.error.detail) {
          this.notification.error(new Notification(err.error.detail));
        } else {
          this.notification.error(new Notification(err.error));
        }
      })
    }
  }

  createNic() {
    this.createNICFormErrors = this.svc.resetNICFormErrors();
    this.createNICValidationMessages = this.svc.createNICFormValidationMessages;
    this.createNICForm = this.svc.createAzureResourceGroupNIC();

    this.createNICModalRef = this.modalService.show(this.createnic, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    this.createNICForm.get('account_uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: any) => {
      this.accountId = val;
      const result = this.azureAccountViewData.find(result => result.uuid == val);
      this.svc.getResourceGroups(result.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.vmCreationResourceGroups = [];
        this.vmCreationResourceGroups = data;
        this.createNICForm.get('resource_group').enable({ emitEvent: false });
      })
    });

    this.createNICForm.get('resource_group').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: any) => {
      this.vmCreationResourceGroup = val;
      this.createNICForm.get('resource_grp_name').setValue(this.vmCreationResourceGroup);
      this.svc.getVirtualnetworks(this.accountId, this.vmCreationResourceGroup).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.createNICForm.get('vnet').enable({ emitEvent: false });
        this.virtualNetworks = [];
        this.virtualNetworks = data;
      });
    });

    this.createNICForm.get('vnet').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: any) => {
      this.vnet = val.name;
      this.svc.getSubnetsForVirtualNetworks(this.accountId, this.vmCreationResourceGroup, this.vnet).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.createNICForm.get('subnet').enable({ emitEvent: false });
        this.virtualNetworkSubnets = [];
        this.virtualNetworkSubnets = data;
      });
    });
  }

  confirmNICCreate() {
    if (this.createNICForm.invalid) {
      this.createNICFormErrors = this.utilService.validateForm(this.createNICForm, this.createNICValidationMessages, this.createNICFormErrors);
      this.createNICForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.createNICFormErrors = this.utilService.validateForm(this.createNICForm, this.createNICValidationMessages, this.createNICFormErrors); });
    } else {
      this.spinner.start('main');
      this.svc.createNICForResourceGroup(this.accountId, this.createNICForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.createNICModalRef.hide();
        if (data.result.data) {
          this.notification.success(new Notification('NIC created successfully.'));
        } else {
          this.notification.error(new Notification(data.result.error));
        }
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.createNICModalRef.hide();
        this.spinner.stop('main');
        if (err.error.detail) {
          this.notification.error(new Notification(err.error.detail));
        } else {
          this.notification.error(new Notification(err.error));
        }
      });
    }
  }
}

