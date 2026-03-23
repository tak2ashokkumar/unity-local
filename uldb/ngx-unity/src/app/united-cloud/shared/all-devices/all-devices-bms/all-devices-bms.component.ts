import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, from } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BMServerViewData, BmServersService } from '../../bm-servers/bm-servers.service';
import { BMServer } from '../../entities/bm-server.type';
import { UnitedCloudSharedService } from '../../united-cloud-shared.service';
import { AllDevicesAlertsService } from '../all-devices-alerts/all-devices-alerts.service';

@Component({
  selector: 'all-devices-bms',
  templateUrl: './all-devices-bms.component.html',
  styleUrls: ['./all-devices-bms.component.scss']
})
export class AllDevicesBmsComponent implements OnInit, OnDestroy {
  private pcId: string;
  viewData: AllDeviceBMSViewData[] = [];
  count: number;
  currentCriteria: SearchCriteria;
  configured: { observium: boolean, zabbix: boolean };
  private ngUnsubscribe = new Subject();
  constructor(private router: Router,
    private route: ActivatedRoute,
    private bmService: BmServersService,
    private spinnerService: AppSpinnerService,
    private storageService: StorageService,
    private cloudSharedService: UnitedCloudSharedService,
    private alertService: AllDevicesAlertsService,
    private appService: AppLevelService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: 0, params: [{ 'uuid': this.pcId }] };
    });
  }

  ngOnInit() {
    this.loadCriteria();
    setTimeout(() => {
      this.spinnerService.start('allbms');
      this.getBMServers();
    }, 0);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.getByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.BARE_METAL_SERVER) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
      this.storageService.removeByKey('criteria', StorageType.SESSIONSTORAGE);
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.BARE_METAL_SERVER }, StorageType.SESSIONSTORAGE)
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getBMServers();
  }

  getBMServers() {
    this.bmService.getAllBMServers(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: BMServer[]) => {
      this.count = data.length;
      this.viewData = this.bmService.converToViewData(data);
      this.spinnerService.stop('allbms');
      this.getDeviceData();
      this.getMappedMonitoringTool();
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.bmService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  getMappedMonitoringTool() {
    this.appService.getMappedMonitoringTool().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.configured = this.appService.getMonitoringToolByDeviceType(DeviceMapping.BARE_METAL_SERVER, res);
      if (this.configured.observium) {
        this.getObserviumFailedCount();
      } else {
        this.getZabbixCount();
      }
    }, err => {
    });
  }

  getObserviumFailedCount() {
    const params: HttpParams = new HttpParams().set('alert_type', 'failed');
    from(this.viewData).pipe(mergeMap(e => this.cloudSharedService.getAlertsCountByDeviceTypeDeviceIdAndAlertType(DeviceMapping.BARE_METAL_SERVER, e.serverId, params)), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const value = res.get(key);
          const index = this.viewData.map(data => data.serverId).indexOf(key);
          this.viewData[index].failedAlertsCount = value;
          this.viewData[index].showAlerts = this.viewData[index].failedAlertsCount && (this.viewData[index].failedAlertsCount !== 'N/A' && this.viewData[index].failedAlertsCount !== '0');
        },
        err => console.log(err),
        () => { }
      );
  }

  getZabbixCount() {
    from(this.viewData).pipe(mergeMap(e => this.cloudSharedService.getZabbixAlertsCountByDeviceTypeDeviceId(DeviceMapping.BARE_METAL_SERVER, e.serverId)), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const value = res.get(key);
          const index = this.viewData.map(data => data.serverId).indexOf(key);
          this.viewData[index].failedAlertsCount = value;
          this.viewData[index].showAlerts = this.viewData[index].failedAlertsCount && (this.viewData[index].failedAlertsCount !== 'N/A' && this.viewData[index].failedAlertsCount !== '0');
        },
        err => console.log(err),
        () => { }
      );
  }

  goToStats(view: AllDeviceBMSViewData) {
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.BARE_METAL_SERVER, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.observium) {
      if (view.monitoring.configured) {
        this.router.navigate(['bmservers', view.serverId, 'obs', 'overview'], { relativeTo: this.route });
      } else {
        this.router.navigate(['bmservers', view.serverId, 'obs', 'configure'], { relativeTo: this.route });
      }
    } else {
      if (view.monitoring.configured) {
        this.router.navigate(['bmservers', view.serverId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      } else {
        this.router.navigate(['bmservers', view.serverId, 'zbx', 'configure'], { relativeTo: this.route });
      }
    }
  }

  showAlerts(view: AllDeviceBMSViewData) {
    if (this.configured.observium) {
      this.alertService.showAlerts(DeviceMapping.BARE_METAL_SERVER, view.bmServerId);
    } else {
      this.alertService.showZabbixAlerts(DeviceMapping.BARE_METAL_SERVER, view.bmServerId);
    }
  }

}
class AllDeviceBMSViewData extends BMServerViewData {
  okAlertsCount?: string;
  failedAlertsCount?: string;
  showAlerts?: boolean;
}