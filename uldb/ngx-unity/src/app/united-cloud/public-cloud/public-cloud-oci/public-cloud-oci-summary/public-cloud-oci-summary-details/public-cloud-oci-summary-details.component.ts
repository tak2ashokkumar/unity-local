import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, interval, throwError } from 'rxjs';
import { catchError, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { TaskError, TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { OCI_VM_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { OCIAvailabilityDomainType, OCICompartmentType, OCIImageType, OCIRegionType, OCIShapeType, OCISubnetType } from 'src/app/united-cloud/shared/oci-virtual-machines/oci-vm-type';
import { environment } from 'src/environments/environment';
import { OciAccountType } from '../public-cloud-oci-summary.type';
import { AccountsDetailListViewData, OciPowerToggleInput, OciResourcesViewData, PublicCloudOciSummaryDetailsService, ResourceDetailsViewData } from './public-cloud-oci-summary-details.service';

@Component({
  selector: 'public-cloud-oci-summary-details',
  templateUrl: './public-cloud-oci-summary-details.component.html',
  styleUrls: ['./public-cloud-oci-summary-details.component.scss'],
  providers: [PublicCloudOciSummaryDetailsService]
})
export class PublicCloudOciSummaryDetailsComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  private ngUnsubscribeOnchange = new Subject();
  currentCriteria: SearchCriteria;
  @Input() accountId: string;
  // @Input() regionId: string;

  poll: boolean;
  count: number;
  viewData: OciResourcesViewData[] = [];
  resourcesDetailViewData: ResourceDetailsViewData = new ResourceDetailsViewData();
  ociAccountViewData: OciAccountType[] = [];
  allResource: string;
  ociSummary: AccountsDetailListViewData = new AccountsDetailListViewData();
  selectedResourceName: string = "Resources";
  resourceId: number | string;
  ociLocations: { display: string; value: string }[] = [];
  confirmInput: OciPowerToggleInput;
  @ViewChild('confirm') confirm: ElementRef;
  @ViewChild('bucketconfirm') bucketconfirm: ElementRef;
  confirmModalRef: BsModalRef;
  filteredViewData: OciResourcesViewData[] = [];
  pagedviewData: OciResourcesViewData[] = [];
  selectedViewData: OciResourcesViewData;
  @ViewChild('terminate') terminate: ElementRef;
  terminateModalRef: BsModalRef;

  @ViewChild('vmCreateRef') vmCreateRef: ElementRef;
  vmCreateModelRef: BsModalRef;
  vmCreateForm: FormGroup;
  vmCreateFormErrors: any;
  vmCreateFormValidationMessages: any;
  nonFieldErr: string = '';
  availabiltyDomains: OCIAvailabilityDomainType[] = [];
  shapes: OCIShapeType[] = [];
  subnets: OCISubnetType[] = [];
  images: OCIImageType[] = [];
  regions: OCIRegionType[] = [];
  compartments: OCICompartmentType[] = [];

  @ViewChild('uploadFile') uploadFile: ElementRef;
  uploadFileModalRef: BsModalRef;
  fileToUpload: File = null;

  @ViewChild('fileList') fileList: ElementRef;
  filesUploadedModalRef: BsModalRef;
  filesUploaded: any[] = [];

  @ViewChild('create') create: ElementRef;
  createModalRef: BsModalRef;
  createFormErrors: any;
  createValidationMessages: any;
  createForm: FormGroup;

  @ViewChild('tagsRef') tagsRef: ElementRef;
  tagsModalRef: BsModalRef;
  tagForm: FormGroup;
  tagFormErrors: any;
  tagFormValidationMessages: any;
  tags: { [key: string]: string };

  syncInProgress: boolean = false;
  actionInput: OciResourcesViewData;
  fieldsToFilterOn: string[] = ['instanceId', 'instanceType', 'publicIp', 'availabilityZone'];
  uuid: string;


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

  locationSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "display",
    keyToSelect: "value",
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

  constructor(private svc: PublicCloudOciSummaryDetailsService,
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
    private termService: FloatingTerminalService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private clientSidePage: ClientSidePage) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.resourceId = params.get('resourceId');
      this.getResourceDetails();
    });
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { account_uuid: [], region: [] }
    };
  }

  subscribeToTerminal() {
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll && !this.syncInProgress), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => {
        this.createTaskAndPoll()
      });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    setTimeout(() => {
      this.loadData();
      this.getLocation();
      this.getOciSubscriptionDetails();
    }, 0);
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
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { account_uuid: [], region: [] }
    };
    this.filterResource();
    this.createTaskAndPoll();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getOciResourceDetails();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getOciResourceDetails();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getOciResourceDetails();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getOciResourceDetails();
  }

  onFilterChange() {
    this.currentCriteria.pageNo = 1;
    this.getOciResourceDetails();
  }

  private filterAndPage() {
    this.filteredViewData = this.clientSideSearchPipe.transform(this.viewData, this.currentCriteria.searchValue, this.fieldsToFilterOn);
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }


  createTaskAndPoll() {
    if (this.syncInProgress) {
      this.spinner.stop('main');
      return;
    }
    this.syncInProgress = true;
    this.svc
      .createTaskAndPoll(null)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          this.filterAndPage();
          this.spinner.stop('main');
          this.syncInProgress = false;
          this.subscribeToTerminal();
        },
        (err: Error) => {
          this.syncInProgress = false;
          this.subscribeToTerminal();
          this.spinner.stop('main');
          this.notification.error(
            new Notification('Error while fetching OCI virtual machines')
          );
        }
      );
  }

  //* loads data(uuid of the selected account) from session staorage

  loadData() {
    const ociUuid = this.storageService.getByKey('ociAccounts', StorageType.SESSIONSTORAGE);
    this.currentCriteria.multiValueParam.account_uuid = [];
    ociUuid.uuid.forEach(s => {
      this.currentCriteria.multiValueParam.account_uuid.push(s);
    });
    // if (ociUuid.uuid.length > 0) {
    //   this.accountId = ociUuid.uuid[0];
    // }
  }

  //*gets oracle accounts and info related to it 

  getOciSubscriptionDetails() {
    this.svc.getOciSubscriptionDetails().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.ociAccountViewData = data;
      this.ociSummary = this.svc.convertOciCustomerListDetailsViewData(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to load subscription detail'));
      this.spinner.stop('main');
    });
  }

  // getOciLocations() {
  //   this.svc.getOciLocations().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
  //     this.ociLocations = this.svc.convertToLocationViewData(data);
  //   }, (err: HttpErrorResponse) => {
  //     this.notification.error(new Notification('Failed to load regions'));
  //     this.spinner.stop('main');
  //   });
  // }

  getLocation() {
    this.svc.getLocation().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: { display: string; value: string }[]) => {
      this.ociLocations = data;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  //* gets the oci resources for the left panel 

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

  //* checks if any service is selected from the left panel and shows that(only runs initial round of loading) 

  filterResource() {
    const source = this.resourcesDetailViewData.resourceCounts.find(resource => resource.id == this.resourceId);
    if (source) {
      this.selectedResourceName = source.name;
      this.currentCriteria.params = [{ resource_type: source.id }];
    } else {
      this.selectedResourceName = 'Resources';
      this.allResource = 'Resources';
      this.router.navigate(['../', 'allresources'], { relativeTo: this.route });
    }
    this.loadData();
    this.getOciResourceDetails();
  }

  //* gets all the info related to the selected service from the left panel to display on the right table

  getOciResourceDetails() {
    // this.spinner.start('main');
    this.svc.getOciResourceDetails(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewdata(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.notification.error(new Notification('Failed to load resource details. Please try again!!'));
      this.spinner.stop('main');
    })
  }
  //* checks if any service is selected BY USER from the left panel and shows that

  filterByResourceType(id?: number, resourceName?: string) {
    if (resourceName) {
      this.resourceId = id;
      this.allResource = '';
      const selectedResource = this.resourcesDetailViewData.resourceCounts.find(resource => resource.id == id);
      if (selectedResource) {
        this.selectedResourceName = selectedResource.name;
        this.currentCriteria.params = [{ resource_type: id }];
        this.router.navigate(['../', this.resourceId], { relativeTo: this.route });
      }
    } else {
      this.selectedResourceName = 'Resources';
      this.currentCriteria.params = [{}];
      this.allResource = 'Resources';
      this.router.navigate(['../', 'allresources'], { relativeTo: this.route });
    }
    this.getOciResourceDetails();
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  goToCost() {
    this.router.navigate(['/cost-analysis/public-cloud/oci']);
  }

  filterDataFromIndex(view: OciResourcesViewData) {
    const index = this.viewData.map((data) => data.name).indexOf(view.name);
    this.uuid = this.viewData[index].uuid;
  }

  goToResource(view: OciResourcesViewData) {
    this.router.navigate(['services', this.resourceId, view.accountUuid, 'resources', view.uuid], { relativeTo: this.route.parent });
  }

  //? VM CRUD action buttons---------------------------------------------------------------------

  powerToggle(view: OciResourcesViewData) {
    if (!view.isPowerIconEnabled) {
      return;
    }
    // this.action = view
    this.selectedViewData = view;
    this.confirmInput = this.svc.getToggleInput(view);
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmToggle() {
    this.confirmModalRef.hide();
    let action = this.selectedViewData.powerStatusOn ? 'STOP' : 'START'
    const index = this.viewData.map(data => data.name).indexOf(this.selectedViewData.name);
    this.viewData[index].isPowerIconEnabled = !this.viewData[index].isPowerIconEnabled;
    this.filterDataFromIndex(this.selectedViewData);
    this.viewData[index].powerStatusIcon = 'fa-spinner fa-spin';
    this.svc.togglePowerStatus(this.selectedViewData.uuid, { account: this.selectedViewData.accountUuid, action: action, name: this.selectedViewData.name }).pipe(switchMap(res => {
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
      this.notification.success(new Notification(msg + this.confirmInput.deviceId + ' successfully.'));
    }, (err: Error) => {
      this.viewData[index].powerStatusIcon = 'fa-power-off';
      this.viewData[index].powerStatus = this.confirmInput.currentPowerStatus ? 'Up' : 'Down';
      this.viewData[index].isPowerIconEnabled = !this.viewData[index].isPowerIconEnabled;
      this.viewData[index].powerTooltipMessage = this.confirmInput.currentPowerStatus ? 'Power Off' : 'Power On';
      const msg = this.confirmInput.currentPowerStatus ? 'Stopping ' : 'Starting ';
      this.notification.error(new Notification(msg + this.confirmInput.deviceId + ' Failed. Please try again later.'));
    });
  }

  terminateInstance(view: OciResourcesViewData) {
    if (!view.isTerminateIconEnabled) {
      return;
    }
    this.selectedViewData = view;
    this.confirmInput = this.svc.getToggleInput(view);
    this.terminateModalRef = this.modalService.show(this.terminate, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmTerminate() {
    this.terminateModalRef.hide();
    this.selectedViewData.terminateIcon = 'fa-spinner fa-spin';
    this.selectedViewData.isTerminateIconEnabled = false;
    this.selectedViewData.terminateTooltipMessage = 'Terminating';
    this.svc.terminateInstance(this.selectedViewData.uuid, { account: this.selectedViewData.accountUuid, name: this.selectedViewData.name }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.notification.success(new Notification('Terminated ' + this.selectedViewData.name + ' Successfully'));
      this.selectedViewData.terminateIcon = 'fa-ban';
      this.selectedViewData.terminateTooltipMessage = 'Terminated';
      this.accountId = this.selectedViewData.accountUuid;
      this.createTaskAndPoll();
    }, err => {
      this.selectedViewData.isTerminateIconEnabled = true;
      this.selectedViewData.terminateIcon = 'fa-ban';
      this.selectedViewData.terminateTooltipMessage = 'Terminate';
      this.notification.error(new Notification('Terminating ' + this.selectedViewData.name + ' Failed. Please try again later.'));
    });
  }

  createTicket(data: OciResourcesViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.ORACLE_VIRTUAL_MACHINE, data.name),
      metadata: OCI_VM_TICKET_METADATA(data.name, data.powerStatus, data.location)
    }, DeviceMapping.VIRTUAL_MACHINE);
  }

  unScubscribeOnChange() {
    this.ngUnsubscribeOnchange.next();
    this.ngUnsubscribeOnchange.unsubscribe();
    this.ngUnsubscribeOnchange = new Subject();
  }

  createVm() {
    this.nonFieldErr = '';
    this.vmCreateForm = this.svc.createVMForm(this.accountId);
    this.vmCreateFormErrors = this.svc.resetVmCreateFormErrors();
    this.vmCreateFormValidationMessages = this.svc.vmCreateValidationMessages;
    this.vmCreateModelRef = this.modalService.show(this.vmCreateRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    this.vmCreateForm.get('account').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: any) => {
      this.unScubscribeOnChange()
      this.accountId = val;
      this.getRegions()
      this.getCompartments()
      this.vmCreateForm.get('region').enable();
    })
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

  getAvailabiltyDomain(compartmentId: string) {
    this.svc.getAvailabiltyDomain(this.accountId, compartmentId).pipe(takeUntil(this.ngUnsubscribeOnchange)).subscribe(res => {
      this.availabiltyDomains = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching Availabilty Domain.'));
    });
  }

  getSubnet(compartmentId: string) {
    this.svc.getSubnet(this.accountId, compartmentId).pipe(takeUntil(this.ngUnsubscribeOnchange)).subscribe(res => {
      this.subnets = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching Subnets.'));
    });
  }

  getShape(compartmentId: string) {
    this.svc.getShape(this.accountId, compartmentId).pipe(takeUntil(this.ngUnsubscribeOnchange)).subscribe(res => {
      this.shapes = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching Shapes.'));
    });
  }

  getImages(compartmentId: string, shape: string) {
    this.svc.getImages(this.accountId, compartmentId, shape).pipe(takeUntil(this.ngUnsubscribeOnchange)).subscribe(res => {
      this.images = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching Images.'));
    });
  }

  getRegions() {
    this.svc.getSubscribedRegions(this.accountId).pipe(takeUntil(this.ngUnsubscribeOnchange)).subscribe(res => {
      this.regions = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching compartments.'));
    });
  }

  getCompartments() {
    this.svc.getCompartments(this.accountId).pipe(takeUntil(this.ngUnsubscribeOnchange)).subscribe(res => {
      this.compartments = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching compartments.'));
    });
  }

  handleCreateFormError(err: any) {
    if (err instanceof HttpErrorResponse) {
      this.vmCreateFormErrors = this.svc.resetVmCreateFormErrors();
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
      this.spinner.stop('main');
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
      this.spinner.start('main');
      this.svc.createVM(this.vmCreateForm.getRawValue()).pipe(catchError((e: HttpErrorResponse) => {
        return throwError(e);
      }), switchMap(res => {
        if (res.task_id) {
          this.vmCreateModelRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Request is being processed. Status will be updated shortly'));
          return this.appService.pollForTask(res.task_id, 5, 300).pipe(take(1));
        } else {
          this.spinner.stop('main');
          throw new Error('Something went wrong !... Please try again later');
        }
      }), take(1), takeUntil(this.ngUnsubscribe)).subscribe((status: TaskStatus) => {
        if (status.result.data) {
          this.notification.success(new Notification(`VM create request accepted successfully. Please refresh after sometime.`));
          this.getResourceDetails()
        } else if (status.result['error']) {
          this.notification.error(new Notification(status.result['error']));
        } else {
        }
      }, (err: HttpErrorResponse | TaskError | Error) => this.handleCreateFormError(err));
    }
  }

  buildTagForm(key?: string) {
    this.tagFormErrors = this.svc.resetTagFormErrors();
    this.tagFormValidationMessages = this.svc.tagValidationMessages;
    this.tagForm = this.svc.buildTagForm(key ? { key: key, value: this.tags[key] } : null);
  }

  manageTags(view: OciResourcesViewData) {
    this.selectedViewData = view;
    this.tags = view.tags ? Object.assign({}, view.tags) : {};
    this.buildTagForm();
    this.tagsModalRef = this.modalService.show(this.tagsRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }



  addTag(): void {
    if (this.tagForm.invalid) {
      this.tagFormErrors = this.utilService.validateForm(this.tagForm, this.tagFormValidationMessages, this.tagFormErrors);
      this.tagForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.tagFormErrors = this.utilService.validateForm(this.tagForm, this.tagFormValidationMessages, this.tagFormErrors);
        });
    } else {
      const obj = this.tagForm.getRawValue();
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
    if (this.tagForm.invalid) {
      this.tagFormErrors = this.utilService.validateForm(this.tagForm, this.tagFormValidationMessages, this.tagFormErrors);
      this.tagForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.tagFormErrors = this.utilService.validateForm(this.tagForm, this.tagFormValidationMessages, this.tagFormErrors);
        });
    } else {
      const obj = this.tagForm.getRawValue();
      this.tags[obj.key] = obj.value;
      this.tagsModalRef.hide();
      this.spinner.start('main');
      this.svc.updateTags(this.selectedViewData, this.tags).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
        this.getResourceDetails()
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to update tags. Please try again later.'));
      });
    }
  }



  //? STORGE DEVICES CRUD-----------------------------------------

  goToInventory(view: OciResourcesViewData) {
    this.router.navigate([view.accountUuid, view.name, 'files'], { relativeTo: this.route });
  }

  deleteBucket(view: OciResourcesViewData) {
    this.selectedViewData = view;
    this.confirmInput = this.svc.getBucketInput(view);
    this.confirmModalRef = this.modalService.show(this.bucketconfirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.confirmModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteBucket(this.selectedViewData.accountUuid, this.selectedViewData.name).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.getResourceDetails()
      this.spinner.stop('main');
      this.notification.success(new Notification('Bucket deleted successfully'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      if (err.error.error == 'BucketNotEmpty') {
        this.notification.error(new Notification('Bucket deletion failed as only empty buckets can be deleted!!'));
      } else {
        this.notification.error(new Notification('Bucket could not be deleted!!'));
      }
    });
  }

  uploadFileToBucket(view: OciResourcesViewData) {
    this.fileToUpload = null;
    this.selectedViewData = view;
    this.uploadFileModalRef = this.modalService.show(this.uploadFile, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  detectFileChange(files: FileList) {
    if (!files.length) {
      return;
    }
    this.fileToUpload = files.item(0);
  }

  confirmUploadFile() {
    this.spinner.start('main');
    this.uploadFileModalRef.hide();
    this.svc.uploadFileToBucket(this.selectedViewData.accountUuid, this.selectedViewData.name, this.fileToUpload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('File uploaded to bucket'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to upload File to bucket. Please try again later.'));
    })
  }

  createBucket() {
    this.createFormErrors = this.svc.resetFormErrors();
    this.createValidationMessages = this.svc.validationMessages;
    this.createForm = this.svc.createForm();
    this.createModalRef = this.modalService.show(this.create, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    this.createForm.get('account').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: any) => {
      this.unScubscribeOnChange()
      this.accountId = val;
    })
  }

  confirmCreate() {
    if (this.createForm.invalid) {
      this.createFormErrors = this.utilService.validateForm(this.createForm, this.createValidationMessages, this.createFormErrors);
      this.createForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.createFormErrors = this.utilService.validateForm(this.createForm, this.createValidationMessages, this.createFormErrors); });
    } else {
      this.createModalRef.hide();
      this.spinner.start('main');
      this.svc.createBucket(this.accountId, this.createForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
        this.getResourceDetails()
        this.notification.success(new Notification('Bucket created successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        if (err.error.error == 'BucketAlreadyExists') {
          this.notification.error(new Notification('The requested bucket name is not available, Please select a different name and try again!!'));
        } else if (err.error.error == 'InvalidBucketName') {
          this.notification.error(new Notification('Bucket name should contain only letters, numbers, dashes and underscores'));
        } else {
          this.notification.error(new Notification('Something went wrong. Please try again!!'));
        }
        this.spinner.stop('main');
      });
    }
  }



}
