import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { VcenterCloudService, VcenterIconViewData, VcenterSummaryUsageViewData, VcenterSummaryViewData } from './vcenter-cloud.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService, DeviceMapping, FaIconMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PrivateCloudType } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { PcCrudService } from 'src/app/app-shared-crud/pc-crud/pc-crud.service';
import { UnitedCloudSharedService } from '../united-cloud-shared.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { SUMMARY_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { VirtualMachine } from '../entities/vm.type';
import { HttpErrorResponse } from '@angular/common/http';
import { UsageStatsPercent } from '../entities/usage-data.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppLevelService } from 'src/app/app-level.service';
import { VcenterComponentSummary, VcenterSummaryAlerts } from './vcenter-cloud.type';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'vcenter-cloud',
  templateUrl: './vcenter-cloud.component.html',
  styleUrls: ['./vcenter-cloud.component.scss'],
  providers: [VcenterCloudService]
})
export class VcenterCloudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  activeCloud: PrivateCLoudFast;
  platformType: PlatFormMapping;
  platFormMapping = PlatFormMapping;
  iconMapping = FaIconMapping;
  cloudAPIType: string;

  cloudDetails: PrivateCloudType;
  view: VcenterIconViewData;
  componentSummary: VcenterComponentSummary;
  alertSummary: VcenterSummaryAlerts;

  showStastics: boolean = true;
  usageData: VcenterSummaryUsageViewData;
  statsPercent: UsageStatsPercent = { vcpuPercent: 0, ramPercent: 0, storageDiskPercent: 0 };

  constructor(private svc: VcenterCloudService,
    private crudServie: PcCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private storageSvc: StorageService,
    private notification: AppNotificationService,
    private appService: AppLevelService,
    private utilService: AppUtilityService,
    private ticketService: SharedCreateTicketService,
    private sharedSvc: UnitedCloudSharedService) {
    this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
    });
    this.route.parent.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.activeCloud = data.tabItems.find((ti: PrivateCLoudFast) => ti.uuid == this.pcId);
      if (this.activeCloud) {
        this.platformType = this.utilService.getCloudTypeByPlatformType(this.activeCloud.platform_type);
        this.cloudAPIType = this.sharedSvc.getCloudNameForEndpoint(this.activeCloud.platform_type);
        this.getCloudDetails();
      }
    })
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.getCloudDetails();
  }

  getCloudDetails() {
    this.spinner.start('main');
    this.svc.getCloudDetails(this.pcId, this.cloudAPIType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cloudDetails = res;
      this.view = this.svc.getActionIconViewData(this.cloudDetails);
      if (this.view.monitoring?.configured && this.view.monitoring?.enabled && !this.view.deviceStatus) {
        this.svc.getDeviceData(this.view);
      }
      this.getComponentSummary();
      this.getAlertSummary();
      this.getUsageData();
      this.spinner.stop('main');
    }, err => {
      //TODO: Do what needs to be done
      this.spinner.stop('main');
    })
  }

  getComponentSummary() {
    this.svc.getComponentSummary(this.pcId, this.cloudAPIType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.componentSummary = res;
    }, err => {
      this.componentSummary = null;
      this.spinner.stop('main');
    })
  }

  getAlertSummary() {
    this.svc.getAlertSummary(this.pcId, this.cloudAPIType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alertSummary = res;
    }, err => {
      this.alertSummary = null;
      this.spinner.stop('main');
    })
  }

  getUsageData() {
    this.svc.getUsageData(this.pcId, this.cloudAPIType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.usageData = this.svc.convertToUsageViewData(data);
      this.statsPercent = this.utilService.getStatsPercent(data);
    }, (err: HttpErrorResponse) => {
      //TODO: Do what needs to be done
      if (err.error == `Private Cloud data doesn't exist`) {
      } else {
        this.showStastics = false;
        this.notification.error(new Notification('Unable to fetch statistcs. Please contact Administrator (support@unitedlayer.com)'));
      }
      this.spinner.stop('main');
    });
  }

  getProgressClass(value: number): string {
    return value < 65 ? 'bg-success' : value >= 65 && value < 85 ? 'bg-warning' : 'bg-danger';
  }

  editPrivateCloud() {
    if (this.platformType == this.platFormMapping.VMWARE) {
      this.router.navigate([this.pcId, 'vmware-vcenter', 'edit'], { relativeTo: this.route });
    } else {
      this.router.navigate([this.pcId, 'unity-vcenter', 'edit'], { relativeTo: this.route });
    }
  }

  changePassWord() {
    this.crudServie.changePassword(this.cloudDetails.uuid, this.cloudDetails.uuid, this.cloudDetails.platform_type);
  }

  deletePrivateCloud() {
    this.crudServie.delete(this.pcId, this.cloudAPIType);
  }

  goToContentLib() {
    this.router.navigate(['contentlib'], { relativeTo: this.route });
  }

  webAccessNewTab(view: VcenterIconViewData) {
    if (!view.newTabWebAccessUrl) {
      return;
    }
    this.appService.updateActivityLog(view.deviceType, view.vmId);
    window.open(view.newTabWebAccessUrl);
  }

  createTicket() {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(this.platformType, this.cloudDetails.name),
      metadata: SUMMARY_TICKET_METADATA(this.platformType, this.cloudDetails.name)
    });
  }

  goToStats(view: VcenterIconViewData) {
    this.storageSvc.put('device', { name: view.vmName, deviceType: DeviceMapping.VMWARE_ACCOUNT, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.observium) {
      if (view.monitoring.configured && view.monitoring.enabled) {
        this.router.navigate(['vcenter', 'obs', 'overview'], { relativeTo: this.route });
      } else {
        this.router.navigate(['vcenter', 'obs', 'configure'], { relativeTo: this.route });
      }
    } else {
      if (view.monitoring.configured && view.monitoring.enabled) {
        this.router.navigate(['vcenter', 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      } else {
        this.router.navigate(['vcenter', 'zbx', 'configure'], { relativeTo: this.route });
      }
    }
  }
}
