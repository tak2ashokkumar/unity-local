import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, from } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { MacMini } from '../../entities/mac-mini.type';
import { MacMiniService, MacMiniViewData } from '../../mac-mini/mac-mini.service';
import { UnitedCloudSharedService } from '../../united-cloud-shared.service';
import { ZabbixEventsComponent } from '../../zabbix-events/zabbix-events.component';
import { AllDevicesAlertsService } from '../all-devices-alerts/all-devices-alerts.service';

@Component({
  selector: 'all-devices-macmini',
  templateUrl: './all-devices-macmini.component.html',
  styleUrls: ['./all-devices-macmini.component.scss']
})
export class AllDevicesMacminiComponent implements OnInit, OnDestroy {
  private pcId: string;
  viewData: AllDeviceMacMiniViewData[] = [];
  count: number;
  currentCriteria: SearchCriteria;
  private scolled: boolean;
  private ngUnsubscribe = new Subject();
  configured: { observium: boolean, zabbix: boolean };
  modalRef: BsModalRef;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private macMiniService: MacMiniService,
    private alertService: AllDevicesAlertsService,
    private spinnerService: AppSpinnerService,
    private storageService: StorageService,
    private cloudSharedService: UnitedCloudSharedService,
    private utilService: AppUtilityService,
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
      this.spinnerService.start('allmacmini');
      this.getMacMinis(false);
    }, 0);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.getByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.MAC_MINI) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
      this.storageService.removeByKey('criteria', StorageType.SESSIONSTORAGE);
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.MAC_MINI }, StorageType.SESSIONSTORAGE)
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getMacMinis(false);
  }

  getMacMinis(scrolled: boolean) {
    this.macMiniService.getAllMacMinis(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: MacMini[]) => {
      if (scrolled) {
        this.scolled = false;
        let temp = this.macMiniService.converToViewData(data);
        temp.forEach(e => this.viewData.push(e));
      } else {
        this.count = data.length;
        this.viewData = this.macMiniService.converToViewData(data);
      }
      this.spinnerService.stop('allmacmini');
      this.getDeviceData();
      this.getMappedMonitoringTool();
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.macMiniService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  getMappedMonitoringTool() {
    this.appService.getMappedMonitoringTool().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.configured = this.appService.getMonitoringToolByDeviceType(DeviceMapping.MAC_MINI, res);
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
    from(this.viewData).pipe(mergeMap(e => this.cloudSharedService.getAlertsCountByDeviceTypeDeviceIdAndAlertType(DeviceMapping.MAC_MINI, e.id, params)), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const value = res.get(key);
          const index = this.viewData.map(data => data.id).indexOf(key);
          this.viewData[index].failedAlertsCount = value;
          this.viewData[index].showAlerts =
            this.viewData[index].failedAlertsCount &&
            (this.viewData[index].failedAlertsCount !== 'N/A' && this.viewData[index].failedAlertsCount !== '0');
        },
        err => console.log(err),
        () => { }
      );
  }

  getZabbixCount() {
    from(this.viewData).pipe(mergeMap(e => this.cloudSharedService.getZabbiEventsCountByDeviceTypeDeviceId(DeviceMapping.MAC_MINI, e.id)), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const value = res.get(key);
          const index = this.viewData.map(data => data.id).indexOf(key);
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

  goToStats(view: AllDeviceMacMiniViewData) {
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.MAC_MINI, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.observium) {
      if (view.monitoring.configured && view.monitoring.enabled) {
        this.router.navigate(['macdevices', view.id, 'obs', 'overview'], { relativeTo: this.route });
      } else {
        this.router.navigate(['macdevices', view.id, 'obs', 'configure'], { relativeTo: this.route });
      }
    } else {
      if (view.monitoring.configured && view.monitoring.enabled) {
        this.router.navigate(['macdevices', view.id, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      } else {
        this.router.navigate(['macdevices', view.id, 'zbx', 'configure'], { relativeTo: this.route });
      }
    }
  }

  showAlerts(view: AllDeviceMacMiniViewData) {
    // if (this.configured.observium) {
    //   this.alertService.showAlerts(DeviceMapping.MAC_MINI, view.id);
    // } else {
    //   this.alertService.showZabbixAlerts(DeviceMapping.MAC_MINI, view.id);
    // }
    if (view.showEvents) {
      this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.MAC_MINI, configured: view.monitoring.configured, uuid: view.id }, StorageType.SESSIONSTORAGE);
      this.modalRef = this.modalService.show(ZabbixEventsComponent, Object.assign({}, { class: 'modal-xl pl-5', keyboard: true, ignoreBackdropClick: true }))
    }
  }

}
class AllDeviceMacMiniViewData extends MacMiniViewData {
  okAlertsCount?: string;
  failedAlertsCount?: string;
  showAlerts?: boolean;
  showEvents?: boolean;
  eventsCount?: string;
}