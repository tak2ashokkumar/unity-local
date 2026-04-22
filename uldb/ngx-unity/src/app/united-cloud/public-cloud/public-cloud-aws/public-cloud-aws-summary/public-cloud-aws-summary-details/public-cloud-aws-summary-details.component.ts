import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AWSInstanceCreateDropdownData, AWSPowerToggleInput, AWSS3FileUploadsViewData, AWSS3ViewData, AccountsDetailListViewData, AutoScaleGroupDropDown, AwsLocationData, AwsResourcesViewData, LoadBalancerDropDown, NetworkInterfaceDropDown, PublicCloudAwsSummaryDetailsService, ResourceDetailsViewData } from './public-cloud-aws-summary-details.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { Subject, from, interval } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { mergeMap, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AwsAccountsType } from './public-cloud-aws-summary-details.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { AppLevelService } from 'src/app/app-level.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { AWS_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { AWSVm } from 'src/app/united-cloud/shared/entities/aws.type';

@Component({
  selector: 'public-cloud-aws-summary-details',
  templateUrl: './public-cloud-aws-summary-details.component.html',
  styleUrls: ['./public-cloud-aws-summary-details.component.scss'],
  providers: [PublicCloudAwsSummaryDetailsService]
})
export class PublicCloudAwsSummaryDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  @Input() accountId: number;
  @Input() regionId: string;

  count: number;
  viewData: AwsResourcesViewData[] = [];
  resourcesDetailViewData: ResourceDetailsViewData = new ResourceDetailsViewData();
  awsAccountViewData: AwsAccountsType[] = [];
  allResource: string;
  awsSummary: AccountsDetailListViewData = new AccountsDetailListViewData();
  selectedResourceName: string = "Resources";
  resourceId: number | string;
  awsLocations: AwsLocationData[] = [];
  showServiceOrStatus: boolean = false;
  currentServiceName: string;

  @ViewChild('createInstanceRef') createInstanceRef: ElementRef;
  createInstanceModalRef: BsModalRef;
  createInstanceErrors: any;
  createInstanceValidationMessages: any;
  createInstanceForm: FormGroup;


  imageList: Array<{ id: string, name: string }> = [];
  instanceTypes: Array<AWSInstanceCreateDropdownData> = [];
  availableZones: Array<AWSInstanceCreateDropdownData> = [];
  vpcList: Array<AWSInstanceCreateDropdownData> = [];
  subnetArray: Array<AWSInstanceCreateDropdownData> = [];
  storageTypes: Array<{ id: string, name: string }> = [];
  securityGroups: Array<AWSInstanceCreateDropdownData> = [];
  keyPairs: Array<{ KeyName: string, KeyFingerprint: string }> = [];

  accountUuid: string;
  accountUuidS3: string;
  region: string;
  poll: boolean = false;
  syncInProgress: boolean = false;

  filteredViewData: AwsResourcesViewData[] = [];
  pagedviewData: AwsResourcesViewData[] = [];
  actionInput: AwsResourcesViewData;
  confirmInput: AWSPowerToggleInput;
  dateFormat: string = environment.unityDateFormat;
  uuid: string;

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  @ViewChild('terminate') terminate: ElementRef;
  terminateModalRef: BsModalRef;

  @ViewChild('createImageModal') createImageModal: ElementRef;
  createImageModalRef: BsModalRef;
  createImageFormErrors: any;
  createImageValidationMessages: any;
  createImageForm: FormGroup;

  @ViewChild('nwInterface') nwInterface: ElementRef;
  nwInterfaceModalRef: BsModalRef;
  nwInterfaceFormErrors: any;
  nwInterfaceValidationMessages: any;
  nwInterfaceForm: FormGroup;
  nwInterfaces: NetworkInterfaceDropDown[] = [];

  @ViewChild('loadBalancer') loadBalancer: ElementRef;
  loadBalancerModalRef: BsModalRef;
  loadBalancerFormErrors: any;
  loadBalancerValidationMessages: any;
  loadBalancerForm: FormGroup;
  lbs: LoadBalancerDropDown[] = [];

  @ViewChild('autoScale') autoScale: ElementRef;
  autoScaleModalRef: BsModalRef;
  autoScaleFormErrors: any;
  autoScaleValidationMessages: any;
  autoScaleForm: FormGroup;
  asgs: AutoScaleGroupDropDown[];

  @ViewChild('info') info: ElementRef;
  infoModalRef: BsModalRef;
  infoFormErrors: any;
  infoValidationMessages: any;
  infoForm: FormGroup;
  instanceDetails: AWSDetails;

  @ViewChild('createS3') createS3: ElementRef;
  createS3ModelRef: BsModalRef;
  createS3FormErrors: any;
  createS3ValidationMessages: any;
  createS3Form: FormGroup;
  regions: Region[] = [];
  bucketName: string;
  bucketUUID: string;

  @ViewChild('uploadFileS3') uploadFile: ElementRef;
  uploadS3FileModalRef: BsModalRef;
  fileToUploadS3: File = null;

  @ViewChild('fileListS3') fileList: ElementRef;
  filesUploadedS3ModalRef: BsModalRef;
  filesUploadedS3: AWSS3FileUploadsViewData[] = [];

  @ViewChild('deleteS3') deleteS3: ElementRef;
  deleteS3ModalRef: BsModalRef;

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
    lableToDisplay: "key",
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

  fieldsToFilterOn: string[] = ['instanceId', 'instanceType', 'publicIp', 'availabilityZone'];
  constructor(private svc: PublicCloudAwsSummaryDetailsService,
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
      this.resourceId = params.get('serviceId');
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
    this.createTaskAndPoll();
    this.loadData();
    this.getAwsSubscriptionDetails();
    this.getAwsLocations();
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
    this.callSyncAws();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getAwsResourceDetails();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAwsResourceDetails();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getAwsResourceDetails();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getAwsResourceDetails();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getAwsResourceDetails();
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
      .createTaskAndPoll(this.accountId, this.regionId)
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
            new Notification('Error while fetching AWS virtual machines')
          );
        }
      );
  }

  loadData() {
    const azureUuid = this.storageService.getByKey('awsAccounts', StorageType.SESSIONSTORAGE);
    this.currentCriteria.multiValueParam.account_uuid = [];
    azureUuid.uuid.forEach(s => {
      this.currentCriteria.multiValueParam.account_uuid.push(s);
    });
  }

  getAwsResourceDetails() {
    this.svc.getAwsResourceDetails(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
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
        this.selectedResourceName = selectedResource.name;
        this.showServiceOrStatus = (this.selectedResourceName === 'DBInstance' && selectedResource.service === 'RDS') || (this.selectedResourceName === 'Cluster' && selectedResource.service === 'ECS') || (this.selectedResourceName == 'LoadBalancer') || (this.selectedResourceName == 'Bucket') || (this.selectedResourceName === 'Instance' && selectedResource.service === 'EC2');
        this.currentServiceName = selectedResource.service;
        this.currentCriteria.params = [{ resource_type: id }];
        this.router.navigate(['../', this.resourceId], { relativeTo: this.route });
      }
    } else {
      this.selectedResourceName = 'Resources';
      this.currentCriteria.params = [{}];
      this.allResource = 'Resources';
      this.router.navigate(['../', 'allresources'], { relativeTo: this.route });
    }
    this.getAwsResourceDetails();
  }


  filterResource() {
    const source = this.resourcesDetailViewData.resourceCounts.find(resource => resource.id == this.resourceId);
    if (source) {
      this.selectedResourceName = source.name;
      this.showServiceOrStatus = (this.selectedResourceName === 'DBInstance' && source.service === 'RDS') || (this.selectedResourceName === 'Cluster' && source.service === 'ECS') || (this.selectedResourceName == 'LoadBalancer') || (this.selectedResourceName == 'Bucket') || (this.selectedResourceName === 'Instance' && source.service === 'EC2');
      this.currentServiceName = source.service;
      this.currentCriteria.params = [{ resource_type: source.id }];
    } else {
      this.selectedResourceName = 'Resources';
      this.allResource = 'Resources';
      this.router.navigate(['../', 'allresources'], { relativeTo: this.route });
    }
    this.loadData();
    this.getAwsResourceDetails();
  }

  getAwsSubscriptionDetails() {
    this.svc.getAwsSubscriptionDetails().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.awsAccountViewData = data;
      this.awsSummary = this.svc.convertAwsCustomerListDetailsViewData(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to load subscription detail'));
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
    this.router.navigate(['/cost-analysis/public-cloud/aws']);
  }

  goToResource(view: AwsResourcesViewData) {
    this.router.navigate(['services', this.resourceId, view.accountUuid, 'resources', view.uuid], { relativeTo: this.route.parent });
  }

  getAwsLocations() {
    this.svc.getAwsLocations().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.awsLocations = this.svc.convertToLocationViewData(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to load regions'));
      this.spinner.stop('main');
    });
  }

  getImages() {
    this.svc.getImages(this.accountUuid, this.region).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.imageList = res;
    });
  }

  getInstanceLaunchData() {
    this.svc.getInstanceLaunchData(this.accountUuid, this.region).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.availableZones = this.svc.convertAvailableZoneList(res);
    });
  }

  getVPCList() {
    this.svc.getVPCList(this.accountUuid, this.region).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.vpcList = this.svc.convertVPCList(res.result.data.Vpcs);
    })
  }

  getKeyPairs() {
    this.svc.getKeyPairs(this.accountUuid, this.region).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.keyPairs = res.result.data.KeyPairs;
    });
  }

  getSubnetIds(vpcId: string, zone: string) {
    this.svc.getSubnetIds(this.accountUuid, this.region, vpcId, zone).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.subnetArray = this.svc.convertSubnetList(res.result.data.Subnets);
    })
  }

  getSecurityGroups(vpcId: string) {
    this.svc.getSecurityGroups(this.accountUuid, this.region, vpcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.securityGroups = this.svc.convertSecurityGroups(res.result.data.SecurityGroups);
    });
  }

  getInstanceTypes(zone: string) {
    this.svc.getInstanceTypes(this.accountUuid, this.region, zone).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.result.data.Reservations[0]) {
        this.instanceTypes = this.svc.convertInstanceTypeList(res.result.data.Reservations[0].Instances);
      } else {
        this.instanceTypes = [];
      }
    });
  }

  createInstance() {
    this.createInstanceErrors = this.svc.resetFormError();
    this.createInstanceValidationMessages = this.svc.validationMessages;
    this.createInstanceForm = this.svc.buildForm();
    this.createInstanceModalRef = this.modalService.show(this.createInstanceRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    this.createInstanceForm.get('account_uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.accountUuid = val;
    });
    this.createInstanceForm.get('region').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.region = val;
      this.getImages();
      this.getVPCList();
      this.getInstanceLaunchData();
      this.getKeyPairs();
      this.createInstanceForm.get('image_id').enable();
      this.createInstanceForm.get('vpc').enable();
      this.createInstanceForm.get('availability_zone').enable();
    });

    this.createInstanceForm.get('vpc').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.getSubnetIds(val, this.createInstanceForm.get('availability_zone').value);
      this.getSecurityGroups(val);
      this.createInstanceForm.get('subnet_id').enable();
      this.createInstanceForm.get('security_group').enable();
    });

    this.createInstanceForm.get('availability_zone').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.getSubnetIds(this.createInstanceForm.get('vpc').value, val);
      this.getInstanceTypes(val);
      this.createInstanceForm.get('subnet_id').enable();
      this.createInstanceForm.get('instance_type').enable();
    });

    this.createInstanceForm.get('keypair_behavior').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val == 'b') {
        this.createInstanceForm.addControl('keypairname', new FormControl('', [Validators.required]));
      } else {
        this.createInstanceForm.removeControl('keypairname');
      }
    });
  }

  getRegions() {
    this.svc.getRegions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.regions = res;
    });
  }

  createBucket() {
    this.createS3FormErrors = this.svc.resetS3FormErrors();
    this.createS3ValidationMessages = this.svc.validationMessagesS3;
    this.createS3Form = this.svc.buildS3BucketForm();
    this.createS3Form.get('account_uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.accountUuidS3 = val;
    });
    this.createS3ModelRef = this.modalService.show(this.createS3, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmCreateS3() {
    if (this.createS3Form.invalid) {
      this.createS3FormErrors = this.utilService.validateForm(this.createS3Form, this.createS3ValidationMessages, this.createS3FormErrors);
      this.createS3Form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.createS3FormErrors = this.utilService.validateForm(this.createS3Form, this.createS3ValidationMessages, this.createS3FormErrors); });
    } else {
      this.createS3ModelRef.hide();
      this.spinner.start('main');
      const data = this.createS3Form.getRawValue();
      this.syncInProgress = true;
      const reqBody = {
        account_uuid: this.accountUuidS3,
        region: data.region,
        bucket_name: data.bucketName
      }
      this.svc.createBucket(reqBody).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
        this.notification.success(new Notification('S3 Bucket created successfully'));
        this.spinner.stop('main');
        if (status.result) {
          // this.getAwsResourceDetails();
        }
        this.syncInProgress = false;
        this.subscribeToTerminal();
      }, (err: HttpErrorResponse) => {
        this.syncInProgress = false;
        this.subscribeToTerminal();
        if (err.message.includes('(BucketAlreadyExists)')) {
          this.notification.error(new Notification('The requested bucket name is not available, Please select a different name and try again!!'));
        }
        else if (err.message.includes('(InvalidBucketName)')) {
          this.notification.error(new Notification('The requested bucket name is not valid, Please select a different name and try again!!'));
        }
        else if (err.message.includes('(InvalidLocationConstraint)')) {
          this.notification.error(new Notification('The requested bucket cannot be created at this location, Please select a different location and try again!!'));
        }
        else {
          this.notification.error(new Notification('Something went wrong. Please try again!!'));
        }
        this.spinner.stop('main');
      });
    }
  }

  deleteBucket(bucketName: string, bucketUUID: string) {
    this.bucketName = bucketName;
    this.bucketUUID = bucketUUID;
    this.deleteS3ModalRef = this.modalService.show(this.deleteS3, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.deleteS3ModalRef.hide();
    this.spinner.start('main');
    this.syncInProgress = true;
    this.svc.deleteBucket(this.bucketUUID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.spinner.stop('main');
      if (status.result) {
        // this.convert(status.result.data);
      }
      this.syncInProgress = false;
      this.subscribeToTerminal();
      this.notification.success(new Notification('Bucket deleted successfully'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.syncInProgress = false;
      this.subscribeToTerminal();
      if (err.message.includes('(BucketNotEmpty)')) {
        this.notification.error(new Notification('Bucket deletion failed as only empty buckets can be deleted!!'));
      } else {
        this.notification.error(new Notification('Bucket could not be deleted!!'));
      }
    });
  }

  uploadFiletoS3(view: AwsResourcesViewData) {
    this.fileToUploadS3 = null;
    this.bucketName = view.name;
    this.bucketUUID = view.uuid;
    this.uploadS3FileModalRef = this.modalService.show(this.uploadFile, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmUploadFileToS3() {
    this.spinner.start('main');
    this.uploadS3FileModalRef.hide();
    this.svc.uploadFileToS3(this.bucketName, this.bucketUUID, this.fileToUploadS3).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('File uploaded to S3 bucket'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to upload File to S3 bucket. Please try again later.'));
    });
  }

  getFileUploadHistory(view: AWSS3ViewData) {
    this.filesUploadedS3 = [];
    this.spinner.start('main');
    this.svc.getFileUploadHistory(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.filesUploadedS3 = this.svc.convertFileHistoryViewData(data.results);
      this.spinner.stop('main');
      this.filesUploadedS3ModalRef = this.modalService.show(this.fileList, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to list uploaded files. Please try again later.'))
    })
  }

  detectFileChange(files: FileList) {
    if (!files.length) {
      return;
    }
    this.fileToUploadS3 = files.item(0);
  }

  submitCreateInstance() {
    if (this.createInstanceForm.invalid) {
      this.createInstanceErrors = this.utilService.validateForm(this.createInstanceForm, this.createInstanceValidationMessages, this.createInstanceErrors);
      this.createInstanceForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.createInstanceErrors = this.utilService.validateForm(this.createInstanceForm, this.createInstanceValidationMessages, this.createInstanceErrors); });
    } else {
      this.createInstanceModalRef.hide();
      this.spinner.start('main');
      this.svc.createInstance(this.accountId, this.regionId, this.createInstanceForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.notification.success(new Notification('Instance Created Successfully'));
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.notification.error(new Notification('Instance Creation Failed. Please try again later.'));
          this.spinner.stop('main');
        });
    }
  }

  getDeviceData(res) {
    let vm: AWSVm[] = res.results;
    from(vm).pipe(mergeMap(e => this.svc.getDeviceData(e.uuid)), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const index = this.viewData.map(data => data.uuid).indexOf(key);
          if (res.get(key)) {
            const value = res.get(key).device_data;
            this.viewData[index].popOverDetails.uptime = this.utilService.getDeviceUptime(value);
            this.viewData[index].popOverDetails.lastreboot = (Number(value.last_rebooted) * 1000).toString();
            this.viewData[index].popOverDetails.status = value.status;
            this.viewData[index].isStatsIconEnabled = true;
            this.viewData[index].statsTooltipMessage = 'AWS Virtual Machine Statistics';
          } else {
            this.viewData[index].popOverDetails.uptime = '0';
            this.viewData[index].popOverDetails.lastreboot = '0';
            this.viewData[index].statsTooltipMessage = 'Monitoring not enabled';
            this.viewData[index].isStatsIconEnabled = false;

          }
        },
        err => console.log(err),
        () => {
          //Do anything after everything done
        }
      );
  }

  filterDataFromIndex(view: AwsResourcesViewData) {
    const index = this.viewData.map((data) => data.name).indexOf(this.actionInput.name);
    this.uuid = this.viewData[index].uuid;
  }

  terminateInstance(view: AwsResourcesViewData) {
    if (!view.isTerminateIconEnabled) {
      return;
    }
    this.actionInput = view;
    this.confirmInput = this.svc.getToggleInput(view);
    this.terminateModalRef = this.modalService.show(this.terminate, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmTerminate() {
    this.terminateModalRef.hide();
    this.actionInput.terminateIcon = 'fa-spinner fa-spin';
    this.actionInput.isTerminateIconEnabled = false;
    this.actionInput.terminateTooltipMessage = 'Terminating';
    this.svc.terminateInstance(this.actionInput).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.notification.success(new Notification('Terminated ' + this.actionInput.name + ' Successfully'));
      this.actionInput.terminateIcon = 'fa-ban';
      this.actionInput.terminateTooltipMessage = 'Terminated';
      this.createTaskAndPoll();
    }, err => {
      this.actionInput.isTerminateIconEnabled = true;
      this.actionInput.terminateIcon = 'fa-ban';
      this.actionInput.terminateTooltipMessage = 'Terminate';
      this.notification.error(new Notification('Terminating ' + this.actionInput.name + ' Failed. Please try again later.'));
    });
  }

  powerToggle(view: AwsResourcesViewData) {
    if (!view.isPowerIconEnabled) {
      return;
    }
    this.actionInput = view;
    this.confirmInput = this.svc.getToggleInput(view);
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmToggle() {
    this.confirmModalRef.hide();
    const index = this.viewData.map(data => data.name).indexOf(this.actionInput.name);
    this.viewData[index].isPowerIconEnabled = !this.viewData[index].isPowerIconEnabled;
    this.filterDataFromIndex(this.actionInput);
    this.viewData[index].powerStatusIcon = 'fa-spinner fa-spin';
    this.svc.togglePowerStatus(this.confirmInput, this.uuid).pipe(switchMap(res => {
      if (res.celery_task.task_id) {
        const msg = this.confirmInput.currentPowerStatus ? 'power off ' : 'power on ';
        this.viewData[index].powerStatus = this.confirmInput.currentPowerStatus ? 'Stopping' : 'Starting';
        this.viewData[index].powerTooltipMessage = this.confirmInput.currentPowerStatus ? 'Stopping' : 'Starting';
        this.notification.success(new Notification('Request for ' + msg + ' submitted'));
        return this.appService.pollForTask(res?.celery_task.task_id, 2, 20).pipe(take(1));
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

  showInfo(view: AwsResourcesViewData) {
    if (!view.isInfoIconEnabled) {
      return;
    }
    this.spinner.start('main');
    this.svc.getInstanceDetails(view).pipe(takeUntil(this.ngUnsubscribe)).subscribe(detail => {
      this.instanceDetails = <AWSDetails>detail.result.data[0];
      this.spinner.stop('main');
      this.infoModalRef = this.modalService.show(this.info, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    }, err => {
      this.spinner.stop('main');
    });
  }

  gotToCloudWatch(view: AwsResourcesViewData) {
    if (!view.isCloudWatchIconEnabled) {
      return;
    }
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.AWS_VIRTUAL_MACHINE }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.uuid, 'cloudwatch', 'overview'], { relativeTo: this.route });
  }

  goToStats(view: AwsResourcesViewData) {
    if (!view.isStatsEnabled) {
      return;
    }
    if (view.resourceType == 'Instance') {
      this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.AWS_VIRTUAL_MACHINE, configured: view.monitoring.configured, uuid: `${view.account}` }, StorageType.SESSIONSTORAGE);
    } else {
      this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.AWS_RESOURCES, configured: view.monitoring.configured, uuid: `${view.account}` }, StorageType.SESSIONSTORAGE);
    }
    if (view.monitoring.zabbix) {
      if (view.monitoring.configured) {
        this.router.navigate([view.uuid, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      }
    }
  }

  createTicket(data: AwsResourcesViewData) {
    if (!data.isCreateTicketIconEnabled) {
      return;
    }
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.AWS_VIRTUAL_MACHINE, data.name), metadata: AWS_TICKET_METADATA(DeviceMapping.AWS_VIRTUAL_MACHINE, data.name, data.availabilityZone, data.instanceType, data.publicIp)
    });
  }

  createImage(view: AwsResourcesViewData) {
    if (!view.isCreateImageIconEnabled) {
      return;
    }
    this.createImageFormErrors = this.svc.resetCreateImageFormErrors();
    this.createImageValidationMessages = this.svc.createImageValidationMessages;
    this.createImageForm = this.svc.createImageForm(view);
    this.actionInput = view;
    this.createImageModalRef = this.modalService.show(this.createImageModal, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  submitCreateImage() {
    if (this.createImageForm.invalid) {
      this.createImageFormErrors = this.utilService.validateForm(this.createImageForm, this.createImageValidationMessages, this.createImageFormErrors);
      this.createImageForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.createImageFormErrors = this.utilService.validateForm(this.createImageForm, this.createImageValidationMessages, this.createImageFormErrors); });
    } else {
      this.filterDataFromIndex(this.actionInput);
      this.spinner.start('main');
      this.svc.submitCreateImage(this.uuid, this.createImageForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(status => {
          this.spinner.stop('main');
          this.createImageModalRef.hide();
          this.notification.success(new Notification('Image created successfully'));
        }, (err: Error) => {
          this.spinner.stop('main');
          this.notification.error(new Notification('Error while creating image '));
        });
    }
  }

  attachAutoScaleGroup(view: AwsResourcesViewData) {
    if (!view.isAttachASGIconEnabled) {
      return;
    }
    this.svc.getAutoScaleGroups(view.uuid, view.location, view.name).pipe(takeUntil(this.ngUnsubscribe)).subscribe(asgs => {
      this.asgs = asgs.data;
      this.autoScaleFormErrors = this.svc.resetAutoScaleFormErrors();
      this.autoScaleValidationMessages = this.svc.autoScaleValidationMessages;
      this.actionInput = view;
      this.autoScaleForm = this.svc.createAutoScaleForm(view);
      this.autoScaleModalRef = this.modalService.show(this.autoScale, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    }, err => {
    });
  }

  submitAutoScale() {
    if (this.autoScaleForm.invalid) {
      this.autoScaleFormErrors = this.utilService.validateForm(this.autoScaleForm, this.autoScaleValidationMessages, this.autoScaleFormErrors);
      this.autoScaleForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.autoScaleFormErrors = this.utilService.validateForm(this.autoScaleForm, this.autoScaleValidationMessages, this.autoScaleFormErrors); });
    } else {
      this.spinner.start('main');
      this.svc.submitAutoScale(this.actionInput, this.autoScaleForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(status => {
          this.spinner.stop('main');
          this.autoScaleModalRef.hide();
          this.notification.success(new Notification('Autoscale group attached successfully'));
        }, (err: Error) => {
          this.autoScaleModalRef.hide();
          this.spinner.stop('main');
          this.notification.error(new Notification('Error while attaching autoscale group'));
        });
    }
  }

  attachNetworkInterface(view: AwsResourcesViewData) {
    if (!view.isAttachNwInfIconEnabled) {
      return;
    }
    this.svc.getNetworkInterfaceGroups(view.uuid, view.location, view.name).pipe(takeUntil(this.ngUnsubscribe)).subscribe(nwis => {
      this.nwInterfaces = nwis;
      this.nwInterfaceFormErrors = this.svc.resetNetworkInterfaceFormErrors();
      this.nwInterfaceValidationMessages = this.svc.networkInterfaceValidationMessages;
      this.actionInput = view;
      this.nwInterfaceForm = this.svc.createNetworkInterfaceForm(view);
      this.nwInterfaceModalRef = this.modalService.show(this.nwInterface, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    }, err => {
    });
  }

  submitNwInterface() {
    if (this.nwInterfaceForm.invalid) {
      this.nwInterfaceFormErrors = this.utilService.validateForm(this.nwInterfaceForm, this.nwInterfaceValidationMessages, this.nwInterfaceFormErrors);
      this.nwInterfaceForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.nwInterfaceFormErrors = this.utilService.validateForm(this.nwInterfaceForm, this.nwInterfaceValidationMessages, this.nwInterfaceFormErrors); });
    } else {
      this.spinner.start('main');
      this.svc.submitNwInterface(this.actionInput, this.nwInterfaceForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(status => {
          this.spinner.stop('main');
          this.nwInterfaceModalRef.hide();
          this.notification.success(new Notification('Network interface attached successfully'));
        }, (err: Error) => {
          this.nwInterfaceModalRef.hide();
          this.spinner.stop('main');
          this.notification.error(new Notification('Error while attaching Network interface'));
        });
    }
  }

  callSyncAws() {
    this.svc.syncAws().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(status => {
        this.getAwsResourceDetails();
      }, (err: Error) => {
        this.notification.error(new Notification('Sync API Failed'));
      });
  }
}
