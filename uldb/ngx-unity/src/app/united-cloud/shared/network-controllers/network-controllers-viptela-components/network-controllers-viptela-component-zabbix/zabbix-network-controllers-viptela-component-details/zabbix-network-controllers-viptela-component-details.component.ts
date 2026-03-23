import { Component, OnDestroy, OnInit } from '@angular/core';
import { ZabbixNetworkControllersViptelaComponentDetailsService } from './zabbix-network-controllers-viptela-component-details.service';
import { Subject } from 'rxjs';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { FormGroup } from '@angular/forms';
import { ViptelaDeviceType } from 'src/app/united-cloud/shared/entities/viptela-device.type';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { cloneDeep as _clone } from 'lodash-es';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'zabbix-network-controllers-viptela-component-details',
  templateUrl: './zabbix-network-controllers-viptela-component-details.component.html',
  styleUrls: ['./zabbix-network-controllers-viptela-component-details.component.scss'],
  providers: [ZabbixNetworkControllersViptelaComponentDetailsService]
})
export class ZabbixNetworkControllersViptelaComponentDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  deviceId: string;
  device: DeviceTabData;
  view: ViptelaDeviceType;

  detailForm: FormGroup;
  detailFormErrors: any;
  detailFormValidationMessages: any;

  metaDataForm: FormGroup;
  metaDataFormErrors: any;
  metaDataFormValidationMessages: any;

  certificateForm: FormGroup;
  certificateFormErrors: any;
  certificateFormValidationMessages: any;

  isDetailsOpen: boolean = true;
  isMetadataOpen: boolean = true;
  isCertificateOpen: boolean = true;

  constructor(private svc: ZabbixNetworkControllersViptelaComponentDetailsService,
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
      // this.storageService.put('device', { name: res.name, deviceType: DeviceMapping.SWITCHES, configured: res.monitoring.configured }, StorageType.SESSIONSTORAGE);
      this.buildForm();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to get device details"));
    })
  }

  buildForm() {
    this.detailForm = this.svc.buildDetailForm(_clone(this.view));
    this.detailFormErrors = this.svc.resetDetailFormErrors();
    this.detailFormValidationMessages = this.svc.detailFormValidationMessages;

    this.metaDataForm = this.svc.buildMetaDataForm(_clone(this.view));
    this.metaDataFormErrors = this.svc.resetMetaDataFormErrors();
    // this.detailFormValidationMessages = this.svc.detailFormValidationMessages;

    this.certificateForm = this.svc.buildCertificateForm(_clone(this.view));
    this.certificateFormErrors = this.svc.resetCertificateFormErrors();
    // this.detailFormValidationMessages = this.svc.detailFormValidationMessages;
  }

  toggleAccordion() {
    this.isDetailsOpen = !this.isDetailsOpen;
  }

  toggleMetadataAccordian() {
    this.isMetadataOpen = !this.isMetadataOpen;
  }

  toggleCertificateAccordian() {
    this.isCertificateOpen = !this.isCertificateOpen;
  }

}
