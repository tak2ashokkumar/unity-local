import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, from } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Switch } from '../../entities/switch.type';
import { SwitchViewData, SwitchesService } from '../../switches/switches.service';
import { UnitedCloudSharedService } from '../../united-cloud-shared.service';
import { ZabbixEventsComponent } from '../../zabbix-events/zabbix-events.component';
import { AllDevicesAlertsService } from '../all-devices-alerts/all-devices-alerts.service';

@Component({
  selector: 'all-devices-switches',
  templateUrl: './all-devices-switches.component.html',
  styleUrls: ['./all-devices-switches.component.scss']
})
export class AllDevicesSwitchesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private pcId: string;
  viewData: AllDeviceSwitchViewData[] = [];
  count: number;
  currentCriteria: SearchCriteria;
  private scolled: boolean;
  configured: { observium: boolean, zabbix: boolean };
  modalRef: BsModalRef;
  constructor(private router: Router,
    private route: ActivatedRoute,
    private switchesService: SwitchesService,
    private alertService: AllDevicesAlertsService,
    private spinnerService: AppSpinnerService,
    private storageService: StorageService,
    private cloudSharedService: UnitedCloudSharedService,
    private appService: AppLevelService,
    private modalService: BsModalService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: 0, params: [{ 'uuid': this.pcId }] };
    });
  }

  ngOnInit() {
    this.loadCriteria();
    setTimeout(() => {
      this.spinnerService.start('allsw');
      this.getSwitches();
    }, 0);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.getByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.SWITCHES) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
      this.storageService.removeByKey('criteria', StorageType.SESSIONSTORAGE);
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.SWITCHES }, StorageType.SESSIONSTORAGE)
  }


  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getSwitches();
  }

  getSwitches() {
    this.switchesService.getAllSwitches(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: Switch[]) => {
      this.count = data.length;
      this.viewData = this.switchesService.convertToViewData(data);
      this.spinnerService.stop('allsw');
      this.getMappedMonitoringTool();
      this.getDeviceData();
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.switchesService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  getMappedMonitoringTool() {
    this.appService.getMappedMonitoringTool().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.configured = this.appService.getMonitoringToolByDeviceType(DeviceMapping.SWITCHES, res);
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
    from(this.viewData).pipe(mergeMap(e => this.cloudSharedService.getAlertsCountByDeviceTypeDeviceIdAndAlertType(DeviceMapping.SWITCHES, e.deviceId, params)), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const value = res.get(key);
          const index = this.viewData.map(data => data.deviceId).indexOf(key);
          this.viewData[index].failedAlertsCount = value;
          this.viewData[index].showAlerts = this.viewData[index].failedAlertsCount && (this.viewData[index].failedAlertsCount !== 'N/A' && this.viewData[index].failedAlertsCount !== '0');
        },
        err => console.log(err),
        () => { }
      );
  }

  getZabbixCount() {
    from(this.viewData).pipe(mergeMap(e => this.cloudSharedService.getZabbiEventsCountByDeviceTypeDeviceId(DeviceMapping.SWITCHES, e.deviceId)), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const value = res.get(key);
          const index = this.viewData.map(data => data.deviceId).indexOf(key);
          // this.viewData[index].failedAlertsCount = value;
          // this.viewData[index].showAlerts = this.viewData[index].failedAlertsCount && (this.viewData[index].failedAlertsCount !== 'N/A' && this.viewData[index].failedAlertsCount !== '0');
          this.viewData[index].eventsCount = value;
          this.viewData[index].showEvents = this.viewData[index].eventsCount &&
            (this.viewData[index].eventsCount !== 'N/A' && this.viewData[index].eventsCount !== '0');

        },
        err => console.log(err),
        () => { }
      );
  }

  goToStats(view: AllDeviceSwitchViewData) {
    if (view.isShared) {
      return;
    }
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.SWITCHES, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.observium) {
      if (view.monitoring.configured) {
        this.router.navigate(['switches', view.deviceId, 'obs', 'overview'], { relativeTo: this.route });
      } else {
        this.router.navigate(['switches', view.deviceId, 'obs', 'configure'], { relativeTo: this.route });
      }
    } else {
      if (view.monitoring.configured) {
        this.router.navigate(['switches', view.deviceId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      } else {
        this.router.navigate(['switches', view.deviceId, 'zbx', 'configure'], { relativeTo: this.route });
      }
    }
  }

  showAlerts(view: AllDeviceSwitchViewData) {
    // if (this.configured.observium) {
    //   this.alertService.showAlerts(DeviceMapping.SWITCHES, view.deviceId);
    // } else {
    //   this.alertService.showZabbixAlerts(DeviceMapping.SWITCHES, view.deviceId);
    // }
    if (view.showEvents) {
      this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.SWITCHES, configured: view.monitoring.configured, uuid: view.deviceId }, StorageType.SESSIONSTORAGE);
      this.modalRef = this.modalService.show(ZabbixEventsComponent, Object.assign({}, { class: 'modal-xl pl-5', keyboard: true, ignoreBackdropClick: true }))
    }
  }

}
class AllDeviceSwitchViewData extends SwitchViewData {
  okAlertsCount?: string;
  failedAlertsCount?: string;
  showAlerts?: boolean;
  showEvents?: boolean;
  eventsCount?: string;
}