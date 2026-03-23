import { Component, OnDestroy, OnInit } from '@angular/core';
import { ZabbixNetworkControllersCiscoMerakiDevicesDetailsService } from './zabbix-network-controllers-cisco-meraki-devices-details.service';
import { Subject } from 'rxjs';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { FormGroup } from '@angular/forms';
import { MerakiDeviceType } from 'src/app/united-cloud/shared/entities/cisco-meraki-device.type';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'zabbix-network-controllers-cisco-meraki-devices-details',
  templateUrl: './zabbix-network-controllers-cisco-meraki-devices-details.component.html',
  styleUrls: ['./zabbix-network-controllers-cisco-meraki-devices-details.component.scss'],
  providers: [ZabbixNetworkControllersCiscoMerakiDevicesDetailsService]
})
export class ZabbixNetworkControllersCiscoMerakiDevicesDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  deviceId: string;
  device: DeviceTabData;
  view: MerakiDeviceType;

  detailForm: FormGroup;

  metaDataForm: FormGroup;

  isDetailsOpen: boolean = true;
  isMetadataOpen: boolean = true;

  constructor(private svc: ZabbixNetworkControllersCiscoMerakiDevicesDetailsService,
    private route: ActivatedRoute,
    private refreshService: DataRefreshBtnService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storageService: StorageService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceid');
      if (this.deviceId) {
        this.getDeviceDetails();
      }
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.device.uuid = this.deviceId;
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getDeviceDetails();
  }

  getDeviceDetails() {
    this.spinner.start('main');
    this.svc.getDeviceDetails(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.view = res;
      this.buildForm();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to get device details"));
    })
  }

  buildForm() {
    this.detailForm = this.svc.buildDetailForm(_clone(this.view));

    this.metaDataForm = this.svc.buildMetaDataForm(_clone(this.view));
  }

  toggleAccordion() {
    this.isDetailsOpen = !this.isDetailsOpen;
  }

  toggleMetadataAccordian() {
    this.isMetadataOpen = !this.isMetadataOpen;
  }

}
