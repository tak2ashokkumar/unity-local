import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, from, interval } from 'rxjs';
import { mergeMap, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { AWS_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { DevicePopoverData } from '../devices-popover/device-popover-data';
import { AWSInstanceCreateDropdownData, AWSPowerToggleInput, AWSVMViewData, AutoScaleGroupDropDown, AwsVirtualMachinesService, LoadBalancerDropDown, NetworkInterfaceDropDown } from './aws-virtual-machines.service';
import { AWSVm } from '../entities/aws.type';

@Component({
  selector: 'aws-virtual-machines',
  templateUrl: './aws-virtual-machines.component.html',
  styleUrls: ['./aws-virtual-machines.component.scss'],
  providers: [AwsVirtualMachinesService]
})
export class AwsVirtualMachinesComponent implements OnInit, OnDestroy, OnChanges {

  @Input() accountId: number;
  @Input() regionId: string;
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number = 0;
  poll: boolean = false;
  syncInProgress: boolean = false;
  popData: DevicePopoverData;

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

  @ViewChild('createInstanceRef') createInstanceRef: ElementRef;
  createInstanceModalRef: BsModalRef;
  createInstanceErrors: any;
  createInstanceValidationMessages: any;
  createInstanceForm: FormGroup;

  viewData: AWSVMViewData[] = [];
  filteredViewData: AWSVMViewData[] = [];
  pagedviewData: AWSVMViewData[] = [];
  actionInput: AWSVMViewData;
  confirmInput: AWSPowerToggleInput;
  dateFormat: string = environment.unityDateFormat;

  imageList: Array<{ id: string, name: string }> = [];
  instanceTypes: Array<AWSInstanceCreateDropdownData> = [];
  availableZones: Array<AWSInstanceCreateDropdownData> = [];
  vpcList: Array<AWSInstanceCreateDropdownData> = [];
  subnetArray: Array<AWSInstanceCreateDropdownData> = [];
  storageTypes: Array<{ id: string, name: string }> = [];
  securityGroups: Array<AWSInstanceCreateDropdownData> = [];
  keyPairs: Array<{ KeyName: string, KeyFingerprint: string }> = [];
  uuid: string;


  fieldsToFilterOn: string[] = ['instanceId', 'instanceType', 'publicIp', 'availabilityZone'];
  constructor(private awsService: AwsVirtualMachinesService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private router: Router,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private ticketService: SharedCreateTicketService,
    private storageService: StorageService,
    private utilService: AppUtilityService,
    private appService: AppLevelService,
    public userInfo: UserInfoService,
    private clientSidePage: ClientSidePage,
    private termService: FloatingTerminalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  subscribeToTerminal() {
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll && !this.syncInProgress), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => {
        this.createTaskAndPoll()
      });
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.createTaskAndPoll();
    if (this.accountId && this.regionId) {
      this.getVPCList();
      this.getImages();
      this.getInstanceLaunchData();
      this.getStorageTypes();
      // this.getSecurityGroup();
      this.getKeyPairs();
    }
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    const currentRegionId = changes.regionId;
    if (!currentRegionId.isFirstChange()) {
      this.spinnerService.start('main');
      this.regionId = currentRegionId.currentValue;
      this.syncInProgress = false;
      this.createTaskAndPoll();
    }
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
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.createTaskAndPoll();
  }

  filterDataFromIndex(view: AWSVMViewData) {
    const index = this.viewData.map((data) => data.instanceId).indexOf(view.instanceId);
    this.uuid = this.viewData[index].uuid;
  }
  createTaskAndPoll() {
    if (this.syncInProgress) {
      this.spinnerService.stop('main');
      return;
    }
    this.syncInProgress = true;
    this.awsService
      .createTaskAndPoll(this.accountId, this.regionId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res) => {
          // if (status.result) {
          //   this.viewData = this.awsService.convertToViewData(status.result.data);
          //   this.filterAndPage();
          //   this.getDeviceData(status.result.data);
          // }
          this.viewData = this.awsService.convertToViewData(res);
          this.filterAndPage();
          // this.getDeviceData(res);
          this.spinnerService.stop('main');
          this.syncInProgress = false;
          this.subscribeToTerminal();
        },
        (err: Error) => {
          this.syncInProgress = false;
          this.subscribeToTerminal();
          this.spinnerService.stop('main');
          this.notification.error(
            new Notification('Error while fetching AWS virtual machines')
          );
        }
      );
  }

  getDeviceData(res) {
    let vm: AWSVm[] = res.results;
    from(vm).pipe(mergeMap(e => this.awsService.getDeviceData(e.uuid)), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const index = this.viewData.map(data => data.vmId).indexOf(key);
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

  powerToggle(view: AWSVMViewData) {
    if (!view.isPowerIconEnabled) {
      return;
    }
    this.actionInput = view;
    this.confirmInput = this.awsService.getToggleInput(view);
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmToggle() {
    this.confirmModalRef.hide();
    // this.spinnerService.start('main');
    const index = this.viewData.map(data => data.instanceId).indexOf(this.actionInput.instanceId);
    this.viewData[index].isPowerIconEnabled = !this.viewData[index].isPowerIconEnabled;
    this.filterDataFromIndex(this.actionInput);
    this.viewData[index].powerStatusIcon = 'fa-spinner fa-spin';
    this.awsService.togglePowerStatus(this.confirmInput, this.uuid).pipe(switchMap(res => {
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
      // this.spinnerService.stop('main');
      this.viewData[index].powerStatusIcon = 'fa-power-off';
      this.viewData[index].powerStatus = status.result.data.instance_state === 'running' ? 'Up' : 'Down';
      this.viewData[index].powerStatusOn = !this.viewData[index].powerStatusOn;
      this.viewData[index].isPowerIconEnabled = !this.viewData[index].isPowerIconEnabled;
      this.viewData[index].powerTooltipMessage = this.viewData[index].powerStatus === 'running' ? 'Power Off' : 'Power On';
      const msg = this.confirmInput.currentPowerStatus ? 'Stopped ' : 'Started ';
      this.notification.success(new Notification(msg + this.confirmInput.deviceId + ' successfully.'));
    }, (err: Error) => {
      // this.spinnerService.stop('main');
      this.viewData[index].powerStatusIcon = 'fa-power-off';
      this.viewData[index].powerStatus = this.confirmInput.currentPowerStatus ? 'Up' : 'Down';
      this.viewData[index].isPowerIconEnabled = !this.viewData[index].isPowerIconEnabled;
      this.viewData[index].powerTooltipMessage = this.confirmInput.currentPowerStatus ? 'Power Off' : 'Power On';
      const msg = this.confirmInput.currentPowerStatus ? 'Stopping ' : 'Starting ';
      this.notification.error(new Notification(msg + this.confirmInput.deviceId + ' Failed. Please try again later.'));
    });
  }

  terminateInstance(view: AWSVMViewData) {
    if (!view.isTerminateIconEnabled) {
      return;
    }
    this.actionInput = view;
    this.confirmInput = this.awsService.getToggleInput(view);
    this.terminateModalRef = this.modalService.show(this.terminate, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmTerminate() {
    this.terminateModalRef.hide();
    this.actionInput.terminateIcon = 'fa-spinner fa-spin';
    this.actionInput.isTerminateIconEnabled = false;
    this.actionInput.terminateTooltipMessage = 'Terminating';
    this.awsService.terminateInstance(this.actionInput).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.notification.success(new Notification('Terminated ' + this.actionInput.instanceId + ' Successfully'));
      this.actionInput.terminateIcon = 'fa-ban';
      this.actionInput.terminateTooltipMessage = 'Terminated';
      this.createTaskAndPoll();
    }, err => {
      this.actionInput.isTerminateIconEnabled = true;
      this.actionInput.terminateIcon = 'fa-ban';
      this.actionInput.terminateTooltipMessage = 'Terminate';
      this.notification.error(new Notification('Terminating ' + this.actionInput.instanceId + ' Failed. Please try again later.'));
    });
  }

  createImage(view: AWSVMViewData) {
    if (!view.isCreateImageIconEnabled) {
      return;
    }
    this.createImageFormErrors = this.awsService.resetCreateImageFormErrors();
    this.createImageValidationMessages = this.awsService.createImageValidationMessages;
    this.createImageForm = this.awsService.createImageForm(view);
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
      this.spinnerService.start('main');
      this.awsService.submitCreateImage(this.uuid, this.createImageForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(status => {
          this.spinnerService.stop('main');
          this.createImageModalRef.hide();
          this.notification.success(new Notification('Image created successfully'));
        }, (err: Error) => {
          this.spinnerService.stop('main');
          this.notification.error(new Notification('Error while creating image'));
        });
    }
  }

  attachAutoScaleGroup(view: AWSVMViewData) {
    if (!view.isAttachASGIconEnabled) {
      return;
    }
    this.awsService.getAutoScaleGroups(view.uuid, view.regionId, view.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(asgs => {
      this.asgs = asgs.data;
      this.autoScaleFormErrors = this.awsService.resetAutoScaleFormErrors();
      this.autoScaleValidationMessages = this.awsService.autoScaleValidationMessages;
      this.actionInput = view;
      this.autoScaleForm = this.awsService.createAutoScaleForm(view);
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
      this.spinnerService.start('main');
      this.awsService.submitAutoScale(this.actionInput, this.autoScaleForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(status => {
          this.spinnerService.stop('main');
          this.autoScaleModalRef.hide();
          this.notification.success(new Notification('Autoscale group attached successfully'));
        }, (err: Error) => {
          this.autoScaleModalRef.hide();
          this.spinnerService.stop('main');
          this.notification.error(new Notification('Error while attaching autoscale group'));
        });
    }
  }

  attachNetworkInterface(view: AWSVMViewData) {
    if (!view.isAttachNwInfIconEnabled) {
      return;
    }
    this.awsService.getNetworkInterfaceGroups(view.uuid, view.regionId, view.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(nwis => {
      this.nwInterfaces = nwis.data;
      this.nwInterfaceFormErrors = this.awsService.resetNetworkInterfaceFormErrors();
      this.nwInterfaceValidationMessages = this.awsService.networkInterfaceValidationMessages;
      this.actionInput = view;
      this.nwInterfaceForm = this.awsService.createNetworkInterfaceForm(view);
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
      this.spinnerService.start('main');
      this.awsService.submitNwInterface(this.actionInput, this.nwInterfaceForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(status => {
          this.spinnerService.stop('main');
          this.nwInterfaceModalRef.hide();
          this.notification.success(new Notification('Network interface attached successfully'));
        }, (err: Error) => {
          this.nwInterfaceModalRef.hide();
          this.spinnerService.stop('main');
          this.notification.error(new Notification('Error while attaching Network interface'));
        });
    }
  }

  attachLoadBalancer(view: AWSVMViewData) {
    if (!view.isAttachLBIconEnabled) {
      return;
    }
    this.awsService.getLoadBalancerGroups(view.accountId, view.regionId, view.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(lbs => {
      this.lbs = lbs.data;
      this.loadBalancerFormErrors = this.awsService.resetLoadBalancerFormErrors();
      this.loadBalancerValidationMessages = this.awsService.LoadBalancerValidationMessages;
      this.actionInput = view;
      this.loadBalancerForm = this.awsService.createLoadBalancerForm(view);
      this.loadBalancerModalRef = this.modalService.show(this.loadBalancer, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    }, err => {
    });
  }

  submitLB() {
    if (this.loadBalancerForm.invalid) {
      this.loadBalancerFormErrors = this.utilService.validateForm(this.loadBalancerForm, this.loadBalancerValidationMessages, this.loadBalancerFormErrors);
      this.loadBalancerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.loadBalancerFormErrors = this.utilService.validateForm(this.loadBalancerForm, this.loadBalancerValidationMessages, this.loadBalancerFormErrors); });
    } else {
      this.spinnerService.start('main');
      this.awsService.submitLB(this.actionInput, this.loadBalancerForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(status => {
          this.spinnerService.stop('main');
          this.loadBalancerModalRef.hide();
          this.notification.success(new Notification('Loadbalancer attached successfully'));
        }, (err: Error) => {
          this.loadBalancerModalRef.hide();
          this.spinnerService.stop('main');
          this.notification.error(new Notification('Error while attaching Loadbalancer'));
        });
    }
  }

  showInfo(view: AWSVMViewData) {
    if (!view.isInfoIconEnabled) {
      return;
    }
    this.spinnerService.start('main');
    this.awsService.getInstanceDetails(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(detail => {
      this.instanceDetails = <AWSDetails>detail.result.data[0];
      this.spinnerService.stop('main');
      this.infoModalRef = this.modalService.show(this.info, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  goToStats(view: AWSVMViewData) {
    if (!view.isStatsEnabled) {
      return;
    }
    this.storageService.put('device', { name: view.instanceId, deviceType: DeviceMapping.AWS_VIRTUAL_MACHINE, configured: view.monitoring.configured, uuid: `${view.accountId}` }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.zabbix) {
      if (view.monitoring.configured) {
        this.router.navigate([view.uuid, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      }
    }
  }

  gotToCloudWatch(view: AWSVMViewData) {
      this.storageService.put('device', { name: view.instanceId, deviceType: DeviceMapping.AWS_VIRTUAL_MACHINE }, StorageType.SESSIONSTORAGE);
      this.router.navigate([view.uuid, 'cloudwatch', view.instanceId,'overview'], { relativeTo: this.route });
  }

  createTicket(data: AWSVMViewData) {
    if (!data.isCreateTicketIconEnabled) {
      return;
    }
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.AWS_VIRTUAL_MACHINE, data.instanceId), metadata: AWS_TICKET_METADATA(DeviceMapping.AWS_VIRTUAL_MACHINE, data.instanceId, data.availabilityZone, data.instanceType, data.publicIp)
    });
  }

  getImages() {
    this.awsService.getImages(this.accountId.toString(), this.regionId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.imageList = res;
    });
  }

  getInstanceLaunchData() {
    this.awsService.getInstanceLaunchData(this.accountId.toString(), this.regionId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.availableZones = this.awsService.convertAvailableZoneList(res);
    });
  }

  getInstanceTypes(zone: string) {
    this.awsService.getInstanceTypes(this.accountId.toString(), this.regionId, zone).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.result.data.Reservations[0]){
        this.instanceTypes = this.awsService.convertInstanceTypeList(res.result.data.Reservations[0].Instances);  
      } else {
        this.instanceTypes = [];
      }
    });
  }

  getVPCList() {
    this.awsService.getVPCList(this.accountId.toString(), this.regionId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.vpcList = this.awsService.convertVPCList(res.result.data.Vpcs);
    })
  }

  getSubnetIds(vpcId: string, zone: string) {
    this.awsService.getSubnetIds(this.accountId.toString(), this.regionId, vpcId, zone).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.subnetArray = this.awsService.convertSubnetList(res.result.data.Subnets);
    })
  }

  getStorageTypes() {
    this.awsService.getStorageTypes().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.storageTypes = res;
    });
  }

  getSecurityGroups(vpcId: string) {
    this.awsService.getSecurityGroups(this.accountId.toString(), this.regionId, vpcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.securityGroups = this.awsService.convertSecurityGroups(res.result.data.SecurityGroups);
    });
  }

  getKeyPairs() {
    this.awsService.getKeyPairs(this.accountId.toString(), this.regionId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.keyPairs = res.result.data.KeyPairs;
    });
  }

  createInstance() {
    this.createInstanceErrors = this.awsService.resetFormError();
    this.createInstanceValidationMessages = this.awsService.validationMessages;
    this.createInstanceForm = this.awsService.buildForm();
    this.createInstanceModalRef = this.modalService.show(this.createInstanceRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    this.createInstanceForm.get('vpc').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.getSubnetIds(val, this.createInstanceForm.get('availability_zone').value);
      this.getSecurityGroups(val);
    });

    this.createInstanceForm.get('availability_zone').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.getSubnetIds(this.createInstanceForm.get('vpc').value, val);
      this.getInstanceTypes(val);
    });

    

    this.createInstanceForm.get('keypair_behavior').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val == 'b') {
        this.createInstanceForm.addControl('keypairname', new FormControl('', [Validators.required]));
      } else {
        this.createInstanceForm.removeControl('keypairname');
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
      this.spinnerService.start('main');
      this.awsService.createInstance(this.accountId, this.regionId, this.createInstanceForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.notification.success(new Notification('Instance Created Successfully'));
          this.spinnerService.stop('main');
        }, (err: HttpErrorResponse) => {
          this.notification.error(new Notification('Instance Creation Failed. Please try again later.'));
          this.spinnerService.stop('main');
        });
    }
  }
}
