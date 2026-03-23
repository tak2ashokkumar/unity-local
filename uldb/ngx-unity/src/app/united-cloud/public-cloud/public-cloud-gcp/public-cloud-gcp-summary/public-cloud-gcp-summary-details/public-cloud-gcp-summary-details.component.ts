import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AccountsDetailListViewData, GCPVMImageType, GCPVMMachineType, GcpResourcesViewData, PublicCloudGcpSummaryDetailsService, ResourceCountAndNames, ResourceDetailsViewData, SubcategoriesItemViewData } from './public-cloud-gcp-summary-details.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { switchMap, takeUntil, tap, takeWhile, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { TICKET_SUBJECT, GCP_ACCOUNT_TICKET_METADATA, CONTAINER_CONTROLLER_TICKET_METADATA } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { GcpAccountType } from '../public-cloud-gcp-summary.type';
import { PowerToggleInput } from 'src/app/united-cloud/shared/server-power-toggle/server-power-toggle.service';
import { FormGroup } from '@angular/forms';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Component({
  selector: 'public-cloud-gcp-summary-details',
  templateUrl: './public-cloud-gcp-summary-details.component.html',
  styleUrls: ['./public-cloud-gcp-summary-details.component.scss'],
  providers: [PublicCloudGcpSummaryDetailsService]
})
export class PublicCloudGcpSummaryDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  selection: string;
  resourceId: number | string;
  subCategoryId: number | string;
  count: number;
  viewData: GcpResourcesViewData[] = [];
  selectedResource: GcpResourcesViewData;
  selectedResourceName: string;
  resourcesDetailViewData: ResourceDetailsViewData = new ResourceDetailsViewData();
  gcpAccountData: GcpAccountType[] = [];

  gcpSummary: AccountsDetailListViewData = new AccountsDetailListViewData();
  gcpRegions: string[] = [];

  region: string;
  architecture: string;

  @ViewChild('createInstanceRef') createInstanceRef: ElementRef;
  createInstanceModalRef: BsModalRef;
  createInstanceErrors: any;
  createInstanceValidationMessages: any;
  createInstanceForm: FormGroup;
  accountUuid: string;

  imageList: GCPVMImageType[] = [];
  machineTypeList: GCPVMMachineType[] = [];

  actionInput: GcpResourcesViewData;
  confirmInput: PowerToggleInput;
  @ViewChild('confirmPower') confirm: ElementRef;
  confirmModalRef: BsModalRef;
  dateFormat: string = environment.unityDateFormat;

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

  regionSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    // lableToDisplay: "key",
    // keyToSelect: "value",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  userSelectionRegionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Region',
  };

  machineTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "display_name",
    keyToSelect: "name",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    selectionLimit: 1,
    autoUnselect: true,
    closeOnSelect: true,
  };

  imageListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "deprecated",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    selectionLimit: 1,
    autoUnselect: true,
    closeOnSelect: true,
  };

  constructor(private svc: PublicCloudGcpSummaryDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private storageService: StorageService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private modalService: BsModalService,
    private appService: AppLevelService,
    public userInfo: UserInfoService,
    private ticketService: SharedCreateTicketService,
  ) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.selection = this.router.url.includes('services/category/') ? 'category' : 'resource';
      this.resourceId = params.get('resourceId');
      this.subCategoryId = params.get('subcategoryId');
      this.resetCurrentCriteria();
      if (this.selection == 'resource') {
        this.getServicesCountDetails();
      } else {
        this.getCategoriesCountDetails();
      }
    });
    this.resetCurrentCriteria();
  }

  ngOnInit(): void {
    this.loadData();
    this.getGcpSubscriptionDetails();
    this.getGcpLocations();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    // this.storageService.removeByKey('GcpAccounts', StorageType.SESSIONSTORAGE);
  }

  resetCurrentCriteria() {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { account_uuid: [], region: [] } };
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.resetCurrentCriteria();
    this.filterSelection();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getGcpResourceDetails();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getGcpResourceDetails();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getGcpResourceDetails();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getGcpResourceDetails();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getGcpResourceDetails();
  }

  getServicesCountDetails() {
    this.spinner.start('main');
    this.svc.getServicesCountDetails().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.resourcesDetailViewData = this.svc.convertToResourceViewData(res);
      this.filterSelection();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to load service details. Please try again!!'));
      this.spinner.stop('main');
    })
  }

  getCategoriesCountDetails() {
    this.spinner.start('main');
    this.svc.getCategoriesCountDetails().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.resourcesDetailViewData = this.svc.convertToResourceViewData(res);
      this.filterSelection();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to load category details. Please try again!!'));
      this.spinner.stop('main');
    })
  }

  filterSelection() {
    if (this.selection == 'resource') {
      this.filterResource();
    } else {
      this.filterCategory();
    }
    this.loadData();
    this.getGcpResourceDetails();
  }

  filterResource() {
    const resource = this.resourcesDetailViewData?.resourceCounts?.find(resource => resource.id == this.resourceId);
    this.selectedResourceName = resource ? resource.name : 'Resources';
    if (resource) {
      this.currentCriteria.params = [{ resource_type: resource.id }];
    } else {
      this.router.navigate(['services', this.selection, this.resourceId], { relativeTo: this.route.parent });
    }
  }

  filterCategory() {
    const subcategories = this.resourcesDetailViewData?.resourceCounts?.map(resource => resource.subcategories);
    let subcategory = subcategories.flat().find(subCategory => subCategory.id == this.subCategoryId);
    this.selectedResourceName = subcategory ? subcategory.service : 'Resources';
    if (subcategory) {
      this.currentCriteria.params = [{ category_type: subcategory.id }];
    } else {
      this.router.navigate(['services', this.selection, this.subCategoryId], { relativeTo: this.route.parent });
    }
    const category = subcategory ? this.resourcesDetailViewData.resourceCounts.find(cat => cat.id == subcategory.categoryId) : '';
    if (category) {
      category.isOpen = true;
    }
  }

  loadData() {
    const gcpUuid = this.storageService.getByKey('GcpAccounts', StorageType.SESSIONSTORAGE);
    this.currentCriteria.multiValueParam.account_uuid = [];
    gcpUuid.uuid.forEach(id => {
      this.currentCriteria.multiValueParam.account_uuid.push(id);
    });
  }

  manageOpenWidget(index: number) {
    const category = this.resourcesDetailViewData?.resourceCounts[index];
    if (category && !category.isOpen) {
      this.resourcesDetailViewData?.resourceCounts?.forEach(c => {
        c.isOpen = false;
      });
    }
    category.isOpen = !category.isOpen;
  }

  getGcpResourceDetails() {
    this.svc.getGcpResourceDetails(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewdata(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.notification.error(new Notification('Failed to load resource details. Please try again!!'));
      this.spinner.stop('main');
    })
  }

  filterByResourceType(view?: ResourceCountAndNames) {
    this.currentCriteria.pageNo = 1;
    // const selectedResource = view?.id ? this.resourcesDetailViewData.resourceCounts.find(resource => resource.id == view.id) : '';
    if (view) {
      this.resourceId = view.id;
      this.selectedResourceName = view.name;
      this.currentCriteria.params = [{ resource_type: view.id }];
      this.router.navigate(['services/resource', this.resourceId], { relativeTo: this.route.parent });
    } else {
      this.selectedResourceName = 'Resources';
      this.currentCriteria.params = [{}];
      this.router.navigate(['services/resource/allresources'], { relativeTo: this.route.parent });
    }
    // this.getGcpResourceDetails();
  }

  filterByCategoryType(view?: SubcategoriesItemViewData) {
    this.currentCriteria.pageNo = 1;
    // const subcategories = this.resourcesDetailViewData.resourceCounts.map(category => category.subcategories);
    // let selectedSubCategory = subcategories.flat().find(subcategory => subcategory.id === view.id);
    if (view) {
      let subCategoryId = view.id;
      this.selectedResourceName = view.service;
      this.currentCriteria.params = [{ category_type: view.id }];
      this.router.navigate(['services/category', subCategoryId], { relativeTo: this.route.parent });
    } else {
      this.selectedResourceName = 'Resources';
      this.currentCriteria.params = [{}];
      this.router.navigate(['services/category/allcategories'], { relativeTo: this.route.parent });
    }
    // this.getGcpResourceDetails();
  }

  getGcpSubscriptionDetails() {
    this.svc.getGcpSubscriptionDetails().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.gcpAccountData = data;
      this.gcpSummary = this.svc.convertGcpAccountDetailsViewData(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to load subscription detail'));
      this.spinner.stop('main');
    });
  }

  goBack() {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }

  goToCost() {
    this.router.navigate(['/cost-analysis/public-cloud/gcp']);
  }

  goToResource(view: GcpResourcesViewData) {
    const id = this.selection == 'category' ? this.subCategoryId : this.resourceId;
    this.router.navigate(['services', this.selection, id, view.accountUuid, 'resources', view.uuid], { relativeTo: this.route.parent });
  }

  getGcpLocations() {
    this.svc.getGcpLocations().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.gcpRegions = data;
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to load GCP regions'));
      this.spinner.stop('main');
    });
  }

  getMachineTypes() {
    this.svc.getMachineTypes(this.region).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.machineTypeList = res;
      this.machineTypeList.forEach(i => { i.display_name = `${i.name} -- ${i.description}`; })
      this.createInstanceForm.get('machine_type').enable();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to load GCP VM machine types'));
      this.spinner.stop('main');
    });
  }

  getImages() {
    this.svc.getImages(this.architecture).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.imageList = res;
      this.createInstanceForm.get('image').enable();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to load GCP VM images'));
      this.spinner.stop('main');
    });
  }

  createInstance() {
    this.createInstanceErrors = this.svc.resetInstanceFormError();
    this.createInstanceValidationMessages = this.svc.instanceFormValidationMessages;
    this.createInstanceForm = this.svc.buildInstanceForm();
    this.createInstanceModalRef = this.modalService.show(this.createInstanceRef, Object.assign({}, { class: 'modal-md', keyboard: true, ignoreBackdropClick: true }));
    // this.createInstanceForm.get('account_uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
    //   this.accountUuid = val;
    // });
    this.createInstanceForm.get('zone').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val && val.length) {
        this.region = val;
        this.getMachineTypes();
      }
    });
    this.createInstanceForm.get('machine_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val && val.length) {
        this.architecture = this.machineTypeList.filter(m => val == m.name)[0]?.architecture;
        this.getImages();
      }
    });
  }

  submitCreateInstance() {
    if (this.createInstanceForm.invalid) {
      this.createInstanceErrors = this.utilService.validateForm(this.createInstanceForm, this.createInstanceValidationMessages, this.createInstanceErrors);
      this.createInstanceForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.createInstanceErrors = this.utilService.validateForm(this.createInstanceForm, this.createInstanceValidationMessages, this.createInstanceErrors); });
    } else {
      this.createInstanceModalRef.hide();
      this.spinner.start('main');
      let form = this.createInstanceForm.getRawValue();
      form.image = form.image.getFirst();
      form.machine_type = form.machine_type.getFirst();
      this.svc.createInstance(form).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.syncVmNow(form.account_uuid);
          this.notification.success(new Notification('Instance Created Successfully'));
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.notification.error(new Notification('Instance Creation Failed. Please try again later.'));
          this.spinner.stop('main');
        });
    }
  }

  syncVmNow(uuid: string) {
    this.svc.syncVmNow(uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: TaskStatus) => {
      this.filterSelection();
    }, (err: HttpErrorResponse) => {
    })
  }

  powerToggle(view: GcpResourcesViewData) {
    if (!view.isPowerIconEnabled) {
      return;
    }
    this.accountUuid = view.accountUuid;
    this.actionInput = view;
    this.confirmInput = this.svc.getToggleInput(view);
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmToggle() {
    this.confirmModalRef.hide();
    const index = this.viewData.map(data => data.name).indexOf(this.actionInput.name);
    this.viewData[index].isPowerIconEnabled = !this.viewData[index].isPowerIconEnabled;
    this.viewData[index].powerStatusIcon = 'fa-spinner fa-spin';
    this.svc.togglePowerStatus(this.confirmInput).pipe(switchMap(res => {
      if (res.task_id) {
        const msg = this.confirmInput.currentPowerStatus ? 'power off ' : 'power on ';
        this.viewData[index].powerStatus = this.confirmInput.currentPowerStatus ? 'Stopping' : 'Starting';
        this.viewData[index].powerTooltipMessage = this.confirmInput.currentPowerStatus ? 'Stopping' : 'Starting';
        this.notification.success(new Notification('Request for ' + msg + ' submitted'));
        return this.appService.pollForTask(res?.task_id, 2, 20).pipe(take(1));
      } else {
        throw new Error('Something went wrong');
      }
    }), takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.viewData[index].powerStatusIcon = 'fa-power-off';
      this.viewData[index].powerStatus = status.result.data.instance_state === 'running' ? 'Up' : 'Down';
      this.viewData[index].powerStatusOn = !this.viewData[index].powerStatusOn;
      this.viewData[index].isPowerIconEnabled = !this.viewData[index].isPowerIconEnabled;
      this.viewData[index].powerTooltipMessage = this.viewData[index].powerStatus === 'running' ? 'Power Off' : 'Power On';
      const msg = this.confirmInput.currentPowerStatus ? 'Stopped ' : 'Started ';
      // this.syncVmNow(this.accountUuid);
      if (status && status.state == 'SUCCESS') {
        this.getGcpResourceDetails()
      }
      this.notification.success(new Notification(msg + this.confirmInput.deviceName + ' successfully.'));
    }, (err: Error) => {
      this.viewData[index].powerStatusIcon = 'fa-power-off';
      this.viewData[index].powerStatus = this.confirmInput.currentPowerStatus ? 'Up' : 'Down';
      this.viewData[index].isPowerIconEnabled = !this.viewData[index].isPowerIconEnabled;
      this.viewData[index].powerTooltipMessage = this.confirmInput.currentPowerStatus ? 'Power Off' : 'Power On';
      const msg = this.confirmInput.currentPowerStatus ? 'Stopping ' : 'Starting ';
      // this.syncVmNow(this.accountUuid);
      this.getGcpResourceDetails()
      this.notification.error(new Notification(msg + this.confirmInput.deviceName + ' Failed. Please try again later.'));
    });
  }

  createVMTicket(data: GcpResourcesViewData) {
    if (!data.isCreateTicketIconEnabled) {
      return;
    }
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.GCP_VIRTUAL_MACHINE, data.name), metadata: GCP_ACCOUNT_TICKET_METADATA(DeviceMapping.GCP_ACCOUNTS, data.name, data.accountName)
    });
  }

}