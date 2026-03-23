import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ZabbixSdwanDeviceDetailsService } from './zabbix-sdwan-device-details.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { takeUntil } from 'rxjs/operators';
import moment from 'moment';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { SdwanDevice } from 'src/app/united-cloud/shared/entities/sdwan-devices.type';
import { FormGroup } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';
import { SdwanDeviceDetails } from 'src/app/unity-setup/unity-setup-integration/usi-others/usio-sdwan/usio-sdwan.type';

@Component({
  selector: 'zabbix-sdwan-device-details',
  templateUrl: './zabbix-sdwan-device-details.component.html',
  styleUrls: ['./zabbix-sdwan-device-details.component.scss'],
  providers: [ZabbixSdwanDeviceDetailsService]
})
export class ZabbixSdwanDeviceDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceId: string;
  device: DeviceTabData;
  view: SdwanDeviceDetails;
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

  constructor(private svc: ZabbixSdwanDeviceDetailsService,
    private route: ActivatedRoute,
    private router: Router,
    private refreshService: DataRefreshBtnService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private readonly sso: ScrollStrategyOptions,
    private storageService: StorageService,
    private modalService: BsModalService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.deviceId = params.get('deviceid');
      if (this.deviceId) {
        this.getDeviceDetails();
      }
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
    // setInterval(() => { this.now = moment(); }, 1);
    // this.scrollStrategy = this.sso.noop();
  }

  ngOnInit() {
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
    }, err => {
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
