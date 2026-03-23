import { Component, OnDestroy, OnInit } from '@angular/core';
import { cpuStatsViewData, DeviceOverviewService, fansViewData, memoryStatsViewData, physicalDiskStatsViewData, powerStatsViewData, serverHealthViewData, serverInfoViewData, tempStatsViewData, virtualDiskViewData } from './device-overview.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { DeviceTabData } from '../device-tab/device-tab.component';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';


@Component({
  selector: 'device-overview',
  templateUrl: './device-overview.component.html',
  styleUrls: ['./device-overview.component.scss'],
  providers: [DeviceOverviewService]
})
export class DeviceOverviewComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  deviceId: string;
  viewServerHealthData: serverHealthViewData[] = []
  viewServerInfoData: serverInfoViewData[] = []
  fansWidget: fansViewData = new fansViewData();
  powerStatsWidget: powerStatsViewData = new powerStatsViewData();
  cpuStatsWidget: cpuStatsViewData = new cpuStatsViewData();
  memoryStatsWidget: memoryStatsViewData = new memoryStatsViewData();
  tempStatsWidget: tempStatsViewData = new tempStatsViewData();
  physicalDiskStatsWidget: physicalDiskStatsViewData = new physicalDiskStatsViewData();
  viewVirtualDiskData: virtualDiskViewData[] = [];

  device: DeviceTabData;
  deviceType: DeviceMapping;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private svc: DeviceOverviewService,
    private storage: StorageService,
    private refreshService: DataRefreshBtnService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE }
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceid');
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.device = <DeviceTabData>this.storage.getByKey('device', StorageType.SESSIONSTORAGE);
    this.deviceType = this.device.deviceType;
    setTimeout(() => {
      this.getServerHealthDetails();
      this.getServerInfoDetails();
      this.getFansData();
      this.getPowerStatsData();
      this.getCPUStatsData();
      this.getMemoryData();
      this.getTemperatureStatsData();
      this.getPhysicalDiskStatsData();
      this.getVirtualDiskDetails();
      this.syncRedfishSystem();
    }, 0)
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete()
  }

  refreshData() {
    this.getServerHealthDetails();
    this.getServerInfoDetails();
    this.getFansData();
    this.getPowerStatsData();
    this.getCPUStatsData();
    this.getMemoryData();
    this.getTemperatureStatsData();
    this.getPhysicalDiskStatsData();
    this.getVirtualDiskDetails();
    this.syncRedfishSystem();
  }

  syncRedfishSystem() {
    this.svc.syncRedfishSystem(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Unable to Sync Redfish Systems'));
    });
  }

  getServerHealthDetails() {
    this.spinner.start('viewServerHealthData');
    this.svc.getServerHealthtDetails(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewServerHealthData = this.svc.convertServerHealthListToViewData(data);
      if (data.length) {
        this.spinner.stop('viewServerHealthData');
      }
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('viewServerHealthData');
      this.notification.error(new Notification('Failed to get Server Health Details'));
    });
  }

  getServerInfoDetails() {
    this.spinner.start('viewServerInfoData');
    this.svc.getSyncFans(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.svc.getServerInfoDetails(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.viewServerInfoData = this.svc.convertServerInfoListToViewData(data);
        if (data.length) {
          this.spinner.stop('viewServerInfoData');
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('viewServerInfoData');
        this.notification.error(new Notification('Failed to get Server Information Details'));
      });
    });
  }

  getFansData() {
    this.spinner.start(this.fansWidget.loader);
    this.fansWidget.fanTypeChartData = null;
    this.svc.getSyncFans(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.svc.getFanData(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.fansWidget.count = res?.count ?? 0;
        if (res?.results?.length) {
          // Pass only results (fan array) to the chart converter
          this.spinner.stop(this.fansWidget.loader);
          this.fansWidget.fanTypeChartData = this.svc.convertToFanReadingChartData(res.results);
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.stop(this.fansWidget.loader);
        this.notification.error(new Notification('Failed to get Fans Details'));
      });
    });
  }

  getPowerStatsData() {
    this.spinner.start(this.powerStatsWidget.loader);
    this.powerStatsWidget.fanTypeChartData = null;
    this.svc.getSyncPowerStatsData(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.svc.getPowerStatsData(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.powerStatsWidget.count = res?.count ?? 0;
        if (res?.results?.length) {
          // Pass only results (fan array) to the chart converter
          this.spinner.stop(this.powerStatsWidget.loader);
          this.powerStatsWidget.fanTypeChartData = this.svc.convertToPowerStatsChartData(res.results);
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.stop(this.powerStatsWidget.loader);
        this.notification.error(new Notification('Failed to get Power Details'));
      });
    })
  }

  getCPUStatsData() {
    this.spinner.start(this.cpuStatsWidget.loader);
    this.cpuStatsWidget.fanTypeChartData = null;
    this.svc.getSyncCPUData(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.svc.getCPUData(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.cpuStatsWidget.count = res?.count ?? 0;
        if (res?.results?.length) {
          // Pass only results (fan array) to the chart converter
          this.spinner.stop(this.cpuStatsWidget.loader);
          this.cpuStatsWidget.fanTypeChartData = this.svc.convertToCpuStatsBarChartData(res.results);
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.stop(this.cpuStatsWidget.loader);
        this.notification.error(new Notification('Failed to get CPU Details'));
      });
    });
  }

  getMemoryData() {
    this.spinner.start(this.memoryStatsWidget.loader);
    this.memoryStatsWidget.fanTypeChartData = null;
    this.svc.getSyncMemoryData(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.svc.getMemoryData(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.memoryStatsWidget.count = res?.count ?? 0;
        if (res?.results?.length) {
          // Pass only results (fan array) to the chart converter
          this.spinner.stop(this.memoryStatsWidget.loader);
          this.memoryStatsWidget.fanTypeChartData = this.svc.convertToMemoryChartData(res.results);
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.stop(this.memoryStatsWidget.loader);
        this.notification.error(new Notification('Failed to get Memory Attribute Details'));
      });
    });
  }

  getTemperatureStatsData() {
    this.spinner.start(this.tempStatsWidget.loader);
    this.tempStatsWidget.fanTypeChartData = null;
    this.svc.getSyncTemperatureData(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.svc.getTemperatureData(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.tempStatsWidget.count = res?.count ?? 0;
        if (res?.results?.length) {
          // Pass only results (fan array) to the chart converter
          this.spinner.stop(this.tempStatsWidget.loader);
          this.tempStatsWidget.fanTypeChartData = this.svc.convertToTempStatsBarChartData(res.results);
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.stop(this.tempStatsWidget.loader);
        this.notification.error(new Notification('Failed to get Temperature Details'));
      });
    });
  }

  getPhysicalDiskStatsData() {
    this.spinner.start(this.physicalDiskStatsWidget.loader);
    this.physicalDiskStatsWidget.fanTypeChartData = null;
    this.svc.getSyncPhysicalDiskData(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.svc.getPhysicalDiskData(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.physicalDiskStatsWidget.count = res?.count ?? 0;
        if (res?.results?.length) {
          // Pass only results (fan array) to the chart converter
          this.spinner.stop(this.physicalDiskStatsWidget.loader);
          this.physicalDiskStatsWidget.fanTypeChartData = this.svc.convertToPhysicalDiskChartData(res.results);
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.stop(this.physicalDiskStatsWidget.loader);
        this.notification.error(new Notification('Failed to get Physical Disk Details'));
      });
    });
  }

  getVirtualDiskDetails() {
    this.spinner.start('viewVirtualDiskData');
    this.svc.getSyncVirtualDiskData(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.svc.getVirtualDiskData(this.deviceType, this.deviceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.viewVirtualDiskData = this.svc.convertVirtualDiskListToViewData(data.results);
        if (data.results.length) {
          this.spinner.stop('viewVirtualDiskData');
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('viewVirtualDiskData');
        this.notification.error(new Notification('Failed to get Virtual Disk Details'));
      });
    });
  }


  goToDetails(view: serverHealthViewData): void {
    this.router.navigate(['../', 'details'], {
      relativeTo: this.route,
      queryParams: { HealthServer: view.name }
    });
  }

}
