import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, from } from 'rxjs';
import { filter, mergeMap, takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { KubernetesPodType } from 'src/app/shared/SharedEntityTypes/kubernetes-pod.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { PrivateCloudType } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { UsageStatistics } from 'src/app/shared/SharedEntityTypes/usage-statistics.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping, FaIconMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SUMMARY_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { PcCrudService } from 'src/app/app-shared-crud/pc-crud/pc-crud.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { UsageData, UsageStatsPercent } from '../entities/usage-data.type';
import { CustomVirtualMachine, VCenterDataStore, VirtualMachine } from '../entities/vm.type';
import { EsxiHypervisorUsageData, IconViewData, SummaryService, SummaryUsageViewData, SummaryViewData } from './summary.service';
import { UnitedCloudSharedService } from '../united-cloud-shared.service';

@Component({
  selector: 'pc-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  providers: [SummaryService]
})
export class SummaryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  view: IconViewData;
  activeCloud: PrivateCLoudFast;
  platformType: PlatFormMapping;
  platFormMapping = PlatFormMapping;
  iconMapping = FaIconMapping;

  privateCloud: PrivateCloudType;
  vmsCount: number = 0;
  defaultVMs: VirtualMachine[] = null;
  customVMs: CustomVirtualMachine[] = null;
  usageData: SummaryUsageViewData = null;
  usageStatistics: UsageStatistics;
  showStastics: boolean = true;
  summaryData: SummaryViewData;
  statsPercent: UsageStatsPercent = { vcpuPercent: 0, ramPercent: 0, storageDiskPercent: 0 };
  vCenterDatastores: VCenterDataStore[] = [];
  hypervisorUsagedata: EsxiHypervisorUsageData[] = [];
  cloudForAPI: string = '';

  constructor(private summaryService: SummaryService,
    private crudServie: PcCrudService,
    private route: ActivatedRoute,
    private router: Router,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private storageService: StorageService,
    private appService: AppLevelService,
    private ticketService: SharedCreateTicketService,
    private notificationService: AppNotificationService,
    private ucSharedService: UnitedCloudSharedService) {
    this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
    });
    this.route.parent.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.activeCloud = data.tabItems.find((ti: PrivateCLoudFast) => ti.uuid == this.pcId);
      if (this.activeCloud) {
        this.platformType = this.utilService.getCloudTypeByPlatformType(this.activeCloud.platform_type);
        if (this.platformType != PlatFormMapping.VMWARE && this.platformType != PlatFormMapping.NUTANIX) {
          this.getCloudDetails();
        }
      }
      this.cloudForAPI = this.ucSharedService.getCloudNameForEndpoint(this.activeCloud.platform_type);
    });
  }

  ngOnInit() {
    this.subscribeForVMSyncOnCreate();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.getCloudDetails();
  }

  getCloudDetails() {
    this.summaryService.getCloudDetails(this.pcId, this.activeCloud.platform_type).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PrivateCloudType) => {
      this.privateCloud = data;
      this.summaryData = this.summaryService.getSummaryComponentViewData(this.privateCloud);
      this.getVMs();
      this.getUsageData();
      this.pollForUsageDataUpdate();
      this.getContainerPodsCount();
      if (this.platformType == PlatFormMapping.ESXI) {
        this.getEsxiUsageData();
      }
      this.spinnerService.stop('main');
    }, err => {
      //TODO: Do what needs to be done
      this.spinnerService.stop('main');
    });
  }

  getPCStatus(status: string): string {
    return this.utilService.getDeviceStatus(status);
  }

  subscribeForVMSyncOnCreate() {
    this.crudServie.syncVMAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.vmsCount = data.vmCount;
      if (this.summaryData) {
        this.summaryData.vmsCount = data.vmCount;
      } else {
        this.summaryData = new SummaryViewData();
        this.summaryData.vmsCount = data.vmCount;
      }
    });
  }

  getVMs() {
    this.spinnerService.start('main');
    if (this.platformType == PlatFormMapping.CUSTOM) {
      this.summaryService.getCustomVM(this.pcId, this.platformType).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<CustomVirtualMachine>) => {
        this.spinnerService.stop('main');
        this.vmsCount = data.count;
        this.summaryData.vmsCount = this.vmsCount;
      }, err => {
        //TODO: Do what needs to be done
        this.spinnerService.stop('main');
      });
    } else {
      if (this.platformType != PlatFormMapping.ESXI) {
        this.view = this.summaryService.getActionIconViewData(this.privateCloud, this.platformType);
      }
      this.summaryService.getDefaultVM(this.pcId, this.platformType).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<VirtualMachine>) => {
        this.spinnerService.stop('main');
        this.vmsCount = data.count;
        this.summaryData.vmsCount = this.vmsCount;
      }, err => {
        //TODO: Do what needs to be done
        this.spinnerService.stop('main');
      });
    }
  }

  getUsageData() {
    if (this.platformType != PlatFormMapping.CUSTOM && this.platformType != PlatFormMapping.HYPER_V) {
      this.summaryService.getUsageData(this.pcId, this.cloudForAPI).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: UsageData) => {
        this.usageData = this.summaryService.convertToUsageViewData(data);
        this.statsPercent = this.utilService.getStatsPercent(data);
      }, (err: HttpErrorResponse) => {
        //TODO: Do what needs to be done
        if (err.error == `Private Cloud data doesn't exist`) {
        } else {
          this.showStastics = false;
          this.notificationService.error(new Notification('Unable to fetch statistcs. Please contact Administrator (support@unitedlayer.com)'));
        }
        this.spinnerService.stop('main');
      });
    } else {
      this.showStastics = false;
    }
  }

  getVcenterDataStoreDetails() {
    this.summaryService.getVcenterDataStoreDetails(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.vCenterDatastores = res;
    }, (err: HttpErrorResponse) => {
      this.vCenterDatastores = [];
      this.notificationService.error(new Notification(err.error.detail));
    });
  }

  getEsxiUsageData() {
    this.hypervisorUsagedata = [];
    from(this.privateCloud.servers).pipe(filter(s => s.esxi),
      mergeMap(server => this.summaryService.getEsxiUsageData(this.pcId, server.id.toString())), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const index = this.privateCloud.servers.map(data => data.id).indexOf(Number(key));
          if (res.get(key)) {
            this.hypervisorUsagedata.push(Object.assign({ name: this.privateCloud.servers[index].name, uuid: this.privateCloud.servers[index].uuid, usageDataExists: true }, res.get(key)));
          } else {
            this.hypervisorUsagedata.push(Object.assign({ name: this.privateCloud.servers[index].name, uuid: this.privateCloud.servers[index].uuid, usageDataExists: false }, res.get(key)));
          }
        },
        err => console.log(err),
        () => {
          //Do anything after everything done
        }
      );
  }

  pollForUsageDataUpdate() {
    if (this.cloudForAPI == '') {
      this.summaryService.pollForUsageDataUpdate(this.pcId, this.cloudForAPI).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.getUsageData();
      }, (err: HttpErrorResponse) => {
      });
    }
  }

  getCustomDevices() {
    this.spinnerService.start('main');
    this.summaryService.getCustomDevices(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<CustomDevice>) => {
      this.spinnerService.stop('main');
      this.summaryData.otherCount = data.count;
    }, err => {
      //TODO: Do what needs to be done
      this.spinnerService.stop('main');
    });
  }

  getContainerPodsCount() {
    this.spinnerService.start('main');
    this.summaryService.getContainerPods(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<KubernetesPodType>) => {
      this.spinnerService.stop('main');
      this.summaryData.containerCount = data.count;
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  getProgressClass(value: number): string {
    return value < 65 ? 'bg-success' : value >= 65 && value < 85 ? 'bg-warning' : 'bg-danger';
  }

  webAccessSameTab(view: IconViewData) {
    if (!view.sameTabWebAccessUrl) {
      return;
    }
    this.storageService.put('url', view.sameTabWebAccessUrl, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.vmId, 'webaccess'], { relativeTo: this.route });
  }

  webAccessNewTab(view: IconViewData) {
    if (!view.newTabWebAccessUrl) {
      return;
    }
    this.appService.updateActivityLog(view.deviceType, view.vmId);
    window.open(view.newTabWebAccessUrl);
  }

  createTicket(data: IconViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(this.platformType, this.privateCloud.name),
      metadata: SUMMARY_TICKET_METADATA(this.platformType, this.privateCloud.name)
    });
  }

  editPrivateCloud() {
    if (this.cloudForAPI === '') {
      // this.crudServie.addOrEdit(this.pcId);
      this.router.navigate([this.pcId, 'edit'], { relativeTo: this.route });
    } else {
      this.router.navigate([this.pcId, this.getRouteName(this.cloudForAPI), 'edit'], { relativeTo: this.route });
    }
  }

  getRouteName(cloudName: string) {
    switch (cloudName) {
      case 'vcenter': return 'vmware-vcenter';
      default: return cloudName;
    }
  }

  changePassWord() {
    this.crudServie.changePassword(this.privateCloud.uuid, this.privateCloud.uuid, this.privateCloud.platform_type);
  }

  deletePrivateCloud() {
    this.crudServie.delete(this.pcId, this.cloudForAPI);
  }

  goToHypVms(view: EsxiHypervisorUsageData) {
    this.storageService.put('device', { name: view.name }, StorageType.SESSIONSTORAGE);
    this.router.navigate(['../', 'hypervisors', view.uuid, 'vms'], { relativeTo: this.route });
  }

  goToContentLib() {
    this.router.navigate(['contentlib'], { relativeTo: this.route });
  }

  goToDetails(view: PrivateCloudType) {
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.NUTANIX_ACCOUNT, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    this.router.navigate(['zbx', 'details'], { relativeTo: this.route.parent });
  }

  goToStats(view: PrivateCloudType) {
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.NUTANIX_ACCOUNT, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (view.monitoring?.configured && view.monitoring?.enabled) {
      this.router.navigate(['zbx', 'monitoring-graphs'], { relativeTo: this.route });
    } else {
      this.router.navigate(['zbx', 'configure'], { relativeTo: this.route });
    }
  }
}