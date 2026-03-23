import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, from } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UnitedCloudSharedService } from '../../united-cloud-shared.service';
import { ZabbixEventsComponent } from '../../zabbix-events/zabbix-events.component';
import { AllDevicesAlertsService } from '../all-devices-alerts/all-devices-alerts.service';
import { AllDevicesVmsService, AllVMViewData } from './all-devices-vms.service';

@Component({
  selector: 'all-devices-vms',
  templateUrl: './all-devices-vms.component.html',
  styleUrls: ['./all-devices-vms.component.scss'],
  providers: [AllDevicesVmsService]
})
export class AllDevicesVmsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private pcId: string;
  viewData: AllVMViewData[] = [];
  count: number;
  currentCriteria: SearchCriteria;
  private scolled: boolean;
  platformType: PlatFormMapping;
  configured: { observium: boolean, zabbix: boolean };
  showCard: boolean = true;
  modalRef: BsModalRef;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private storageService: StorageService,
    private cloudSharedService: UnitedCloudSharedService,
    private alertService: AllDevicesAlertsService,
    private utilService: AppUtilityService,
    private allVmSrvice: AllDevicesVmsService,
    private appService: AppLevelService,
    private modalService: BsModalService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: 0, params: [{ 'cloud_id': this.pcId }] };
    });
  }

  ngOnInit() {
    this.loadCriteria();
    setTimeout(() => {
      this.spinnerService.start('allvm');
      this.getPlatformType();
    }, 0);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAllVms();
  }

  loadCriteria() {
    let filter = <{ criteria: SearchCriteria, deviceType: DeviceMapping }>this.storageService.getByKey('criteria', StorageType.SESSIONSTORAGE);
    if (filter && filter.deviceType == DeviceMapping.VIRTUAL_MACHINE) {
      this.currentCriteria.searchValue = filter.criteria.searchValue;
    }
  }

  saveCriteria() {
    this.storageService.put('criteria', { criteria: this.currentCriteria, deviceType: DeviceMapping.VIRTUAL_MACHINE }, StorageType.SESSIONSTORAGE)
  }

  getPlatformType() {
    this.allVmSrvice.getPrivateCloud(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.platformType = this.utilService.getCloudTypeByPlatformType(res.platform_type);
      this.getAllVms();
    }, err => { })
  }

  getAllVms() {
    this.allVmSrvice.getAllVms(this.platformType, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = res;
      this.spinnerService.stop('allvm');
      this.count = this.viewData.length;
      if (this.currentCriteria.searchValue == '') {
        this.showCard = this.count ? true : false;
      }
      this.getMappedMonitoringTool();
      this.getDeviceData();
    }, err => { this.spinnerService.stop('allvm'); });
  }

  private getDeviceTypeByPlatform() {
    switch (this.platformType) {
      case PlatFormMapping.VMWARE:
        return DeviceMapping.VMWARE_VIRTUAL_MACHINE;
      case PlatFormMapping.OPENSTACK:
        return DeviceMapping.OPENSTACK_VIRTUAL_MACHINE;
      case PlatFormMapping.CUSTOM:
        return DeviceMapping.CUSTOM_VIRTUAL_MACHINE;
      case PlatFormMapping.VCLOUD:
        return DeviceMapping.VCLOUD;
      case PlatFormMapping.PROXMOX:
        return DeviceMapping.PROXMOX;
      case PlatFormMapping.G3_KVM:
        return DeviceMapping.G3_KVM;
      case PlatFormMapping.HYPER_V:
        return DeviceMapping.HYPER_V;
      case PlatFormMapping.ESXI:
        return DeviceMapping.ESXI;
      default: throw new Error('Invalid platform type');
    }
  }

  getMappedMonitoringTool() {
    this.appService.getMappedMonitoringTool().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.configured = this.appService.getMonitoringToolByDeviceType(DeviceMapping.VIRTUAL_MACHINE, res);
      if (this.configured.observium) {
        this.getFailedCount();
      } else {
        this.getZabbixCount();
      }
    }, err => {
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.allVmSrvice.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  getFailedCount() {
    const params: HttpParams = new HttpParams().set('alert_type', 'failed');
    from(this.viewData).pipe(mergeMap(e => this.cloudSharedService.getAlertsCountByDeviceTypeDeviceIdAndAlertType(e.deviceType, e.vmId, params)), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const value = res.get(key);
          const index = this.viewData.map(data => data.vmId).indexOf(key);
          if (this.viewData[index]) {
            this.viewData[index].failedAlertsCount = value;
            this.viewData[index].showAlerts =
              this.viewData[index].failedAlertsCount &&
              (this.viewData[index].failedAlertsCount !== 'N/A' && this.viewData[index].failedAlertsCount !== '0');
          }
        },
        err => console.log(err),
        () => { }
      );
  }

  getZabbixCount() {
    from(this.viewData).pipe(mergeMap(e => this.cloudSharedService.getZabbiEventsCountByDeviceTypeDeviceId(e.deviceType, e.vmId)), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const value = res.get(key);
          const index = this.viewData.map(data => data.vmId).indexOf(key);
          if (this.viewData[index]) {
            // this.viewData[index].failedAlertsCount = value;
            // this.viewData[index].showAlerts = this.viewData[index].failedAlertsCount && (this.viewData[index].failedAlertsCount !== 'N/A' && this.viewData[index].failedAlertsCount !== '0');
            this.viewData[index].eventsCount = value;
            this.viewData[index].showEvents = this.viewData[index].eventsCount &&
              (this.viewData[index].eventsCount !== 'N/A' && this.viewData[index].eventsCount !== '0');
          }
        },
        err => console.log(err),
        () => { }
      );
  }

  goToStats(view: AllVMViewData) {
    this.saveCriteria();
    this.storageService.put('device', { name: view.name, deviceType: view.deviceType, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    if (view.monitoring.observium) {
      if (view.monitoring.configured) {
        this.router.navigate(['vms', view.vmId, 'obs', 'overview'], { relativeTo: this.route });
      } else {
        this.router.navigate(['vms', view.vmId, 'obs', 'configure'], { relativeTo: this.route });
      }
    } else {
      if (view.monitoring.configured) {
        this.router.navigate(['vms', view.vmId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
      } else {
        this.router.navigate(['vms', view.vmId, 'zbx', 'configure'], { relativeTo: this.route });
      }
    }
  }

  showAlerts(view: AllVMViewData) {
    // if (this.configured.observium) {
    //   this.alertService.showAlerts(view.deviceType, view.vmId);
    // } else {
    //   this.alertService.showZabbixAlerts(view.deviceType, view.vmId);
    // }
    if (view.showEvents) {
      this.storageService.put('device', { name: view.name, deviceType: view.deviceType, configured: view.monitoring.configured, uuid: view.vmId }, StorageType.SESSIONSTORAGE);
      this.modalRef = this.modalService.show(ZabbixEventsComponent, Object.assign({}, { class: 'modal-xl pl-5', keyboard: true, ignoreBackdropClick: true }))
    }
  }

}
