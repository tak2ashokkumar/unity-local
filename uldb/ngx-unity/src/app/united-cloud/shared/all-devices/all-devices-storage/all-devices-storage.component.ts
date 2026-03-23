import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, from } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { StorageDeviceViewData, StorageDevicesService } from '../../storage-devices/storage-devices.service';
import { UnitedCloudSharedService } from '../../united-cloud-shared.service';
import { ZabbixEventsComponent } from '../../zabbix-events/zabbix-events.component';
import { AllDevicesAlertsService } from '../all-devices-alerts/all-devices-alerts.service';

@Component({
  selector: 'all-devices-storage',
  templateUrl: './all-devices-storage.component.html',
  styleUrls: ['./all-devices-storage.component.scss']
})
export class AllDevicesStorageComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private pcId: string;
  viewData: AllDeviceStorageViewData[] = [];
  count: number;
  currentCriteria: SearchCriteria;
  private scolled: boolean;
  configured: { observium: boolean, zabbix: boolean };
  modalRef: BsModalRef;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private storageDevicesService: StorageDevicesService,
    private spinnerService: AppSpinnerService,
    private alertService: AllDevicesAlertsService,
    private storageService: StorageService,
    private cloudSharedService: UnitedCloudSharedService,
    private notification: AppNotificationService,
    private appService: AppLevelService,
    private utilService: AppUtilityService,
    private modalService: BsModalService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: 0, params: [{ 'uuid': this.pcId }] };
    });
  }

  ngOnInit() {
    this.loadCriteria();
    setTimeout(() => {
      this.spinnerService.start('allstorage');
      this.getStorage();
    }, 0);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.getByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.STORAGE_DEVICES) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
      this.storageService.removeByKey('criteria', StorageType.SESSIONSTORAGE);
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.STORAGE_DEVICES }, StorageType.SESSIONSTORAGE)
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getStorage();
  }

  getStorage() {
    this.storageDevicesService.getAllStorageDevices(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.length;
      this.viewData = this.storageDevicesService.convertToViewData(data);
      this.spinnerService.stop('allstorage');
      this.getMappedMonitoringTool();
      this.getDeviceData();
    }, err => {
      this.spinnerService.stop('allstorage');
      this.notification.error(new Notification('Error while fetching Storage Devices.'));
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.storageDevicesService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  getMappedMonitoringTool() {
    this.appService.getMappedMonitoringTool().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.configured = this.appService.getMonitoringToolByDeviceType(DeviceMapping.STORAGE_DEVICES, res);
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
    from(this.viewData).pipe(mergeMap(e => this.cloudSharedService.getAlertsCountByDeviceTypeDeviceIdAndAlertType(DeviceMapping.STORAGE_DEVICES, e.deviceId, params)), takeUntil(this.ngUnsubscribe))
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
    from(this.viewData).pipe(mergeMap(e => this.cloudSharedService.getZabbiEventsCountByDeviceTypeDeviceId(DeviceMapping.STORAGE_DEVICES, e.deviceId)), takeUntil(this.ngUnsubscribe))
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

  goToStats(view: AllDeviceStorageViewData) {
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.STORAGE_DEVICES, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.observium) {
      if (view.monitoring.configured) {
        this.router.navigate(['storagedevices', view.deviceId, 'obs', 'overview'], { relativeTo: this.route });
      } else {
        this.router.navigate(['storagedevices', view.deviceId, 'obs', 'configure'], { relativeTo: this.route });
      }
    } else {
      if (view.monitoring.configured) {
        this.router.navigate(['storagedevices', view.deviceId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      } else {
        this.router.navigate(['storagedevices', view.deviceId, 'zbx', 'configure'], { relativeTo: this.route });
      }
    }
  }

  showAlerts(view: AllDeviceStorageViewData) {
    // if (this.configured.observium) {
    //   this.alertService.showAlerts(DeviceMapping.STORAGE_DEVICES, view.deviceId);
    // } else {
    //   this.alertService.showZabbixAlerts(DeviceMapping.STORAGE_DEVICES, view.deviceId);
    // }
    if (view.showEvents) {
      this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.STORAGE_DEVICES, configured: view.monitoring.configured, uuid: view.deviceId }, StorageType.SESSIONSTORAGE);
      this.modalRef = this.modalService.show(ZabbixEventsComponent, Object.assign({}, { class: 'modal-xl pl-5', keyboard: true, ignoreBackdropClick: true }))
    }
  }

}

class AllDeviceStorageViewData extends StorageDeviceViewData {
  okAlertsCount?: string;
  failedAlertsCount?: string;
  showAlerts?: boolean;
  showEvents?: boolean;
  eventsCount?: string;
}