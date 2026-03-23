import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PrivateCloudType } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { FaIconMapping, PlatFormMapping, AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { TICKET_SUBJECT, SUMMARY_TICKET_METADATA } from 'src/app/shared/create-ticket.const';
import { PcCrudService } from 'src/app/shared/pc-crud/pc-crud.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { environment } from 'src/environments/environment';
import { NutanixDataStore } from '../entities/nutanix.type';
import { UsageStatsPercent, UsageData } from '../entities/usage-data.type';
import { NutanixService, IconViewData, SummaryUsageViewData, SummaryViewData } from './nutanix.service';

@Component({
  selector: 'nutanix',
  templateUrl: './nutanix.component.html',
  styleUrls: ['./nutanix.component.scss'],
  providers: [NutanixService]
})
export class NutanixComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  view: IconViewData;
  
  privateCloud: PrivateCloudType;
  platformType: PlatFormMapping;
  iconMapping = FaIconMapping;
  nutanixImg: string = `${environment.assetsUrl}external-brand/logos/nutanix.svg`;

  vmsCount: number = 0;
  usageData: SummaryUsageViewData = null;
  showStastics: boolean = true;
  summaryData: SummaryViewData;
  statsPercent: UsageStatsPercent = { vcpuPercent: 0, ramPercent: 0, storageDiskPercent: 0 };
  isNutanix: boolean = false;
  nutanixDatastores: NutanixDataStore[] = [];

  constructor(private svc: NutanixService,
    private crudSvc: PcCrudService,
    private route: ActivatedRoute,
    private router: Router,
    private utilSvc: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private storageSvc: StorageService,
    private ticketSvc: SharedCreateTicketService,
    private notificationSvc: AppNotificationService,) {
    this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
    });
  }

  ngOnInit() {
    this.getPrivateCloud();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getPrivateCloud();
  }

  getPrivateCloud() {
    this.spinnerService.start('main');
    this.svc.getPrivateCloud(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PrivateCloudType) => {
      this.privateCloud = data;
      this.platformType = this.utilSvc.getCloudTypeByPlatformType(this.privateCloud.platform_type);
      this.summaryData = this.svc.getSummaryComponentViewData(this.privateCloud);
      this.getUsageData();
      this.pollForUsageDataUpdate();
      this.getNutanixDataStoreDetails();
      this.spinnerService.stop('main');
    }, () => {
      //TODO: Do what needs to be done
      this.spinnerService.stop('main');
    });
  }

  getUsageData() {
    this.svc.getUsageData(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: UsageData) => {
      this.usageData = this.svc.convertToUsageViewData(data);
      this.statsPercent = this.utilSvc.getStatsPercent(data);
    }, (err: HttpErrorResponse) => {
      //TODO: Do what needs to be done
      if (err.error == `Private Cloud data doesn't exist`) {
      } else {
        this.showStastics = false;
        this.notificationSvc.error(new Notification('Unable to fetch statistcs. Please contact Administrator (support@unitedlayer.com)'));
      }
      this.spinnerService.stop('main');
    });
  }

  pollForUsageDataUpdate() {
    this.svc.pollForUsageDataUpdate(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getUsageData();
    });
  }

  getNutanixDataStoreDetails() {
    this.svc.getNutanixDataStoreDetails(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.nutanixDatastores = res;
    }, () => {
      this.nutanixDatastores = [];
    });
  }

  getProgressClass(value: number): string {
    return value < 65 ? 'bg-success' : value >= 65 && value < 85 ? 'bg-warning' : 'bg-danger';
  }

  createTicket() {
    this.ticketSvc.createTicket({
      subject: TICKET_SUBJECT(this.platformType, this.privateCloud.name),
      metadata: SUMMARY_TICKET_METADATA(this.platformType, this.privateCloud.name)
    });
  }

  goToEditNutanixCloud() {
    this.router.navigate(['setup/integration/nutanix', this.pcId, 'edit']);
  }

  deletePrivateCloud() {
    this.crudSvc.delete(this.pcId);
  }

  goTo(url: string) {
    this.router.navigate(['../', url], { relativeTo: this.route });
  }

  goToDetails(view: PrivateCloudType) {
    this.storageSvc.put('device', { name: view.name, deviceType: DeviceMapping.NUTANIX_ACCOUNT, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    this.router.navigate(['zbx', 'details'], { relativeTo: this.route.parent });
  }

  goToStats(view: PrivateCloudType) {
    this.storageSvc.put('device', { name: view.name, deviceType: DeviceMapping.NUTANIX_ACCOUNT, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (view.monitoring?.configured && view.monitoring?.enabled) {
      this.router.navigate(['zbx', 'monitoring-graphs'], { relativeTo: this.route });
    } else {
      this.router.navigate(['zbx', 'configure'], { relativeTo: this.route });
    }
  }
}