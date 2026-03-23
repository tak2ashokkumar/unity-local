import { Component, OnDestroy, OnInit } from '@angular/core';
import { ZabbixNetworkControllersCiscoMerakiOrganizationsDetailsService } from './zabbix-network-controllers-cisco-meraki-organizations-details.service';
import { Subject } from 'rxjs';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'zabbix-network-controllers-cisco-meraki-organizations-details',
  templateUrl: './zabbix-network-controllers-cisco-meraki-organizations-details.component.html',
  styleUrls: ['./zabbix-network-controllers-cisco-meraki-organizations-details.component.scss'],
  providers: [ZabbixNetworkControllersCiscoMerakiOrganizationsDetailsService]
})
export class ZabbixNetworkControllersCiscoMerakiOrganizationsDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceId: string;
  device: DeviceTabData;
  view: any;
  detailForm: FormGroup;
  detailFormErrors: any;
  detailFormValidationMessages: any;
  licenseDataForm: FormGroup;
  licenseDataFormErrors: any;
  licenseDataFormValidationMessages: any;
  licenseStateForm: FormGroup;
  licenseStateFormErrors: any;
  licenseStateFormValidationMessages: any;
  systemManagerForm: FormGroup;
  systemManagerFormErrors: any;
  systemManagerFormValidationMessages: any;
  isDetailsOpen: boolean = true;
  isLicenseOpen: boolean = true;
  isLicenseDataOpen: boolean = true;
  isSystemManagerOpen: boolean = true;

  constructor(private svc: ZabbixNetworkControllersCiscoMerakiOrganizationsDetailsService,
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
  }

  ngOnInit(): void {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.device.uuid = this.deviceId;
    // this.getDeviceDetails();
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

    this.licenseDataForm = this.svc.buildLicenseDataForm(_clone(this.view));
    this.licenseDataFormErrors = this.svc.resetLicenseDataFormErrors();
    // this.detailFormValidationMessages = this.svc.detailFormValidationMessages;

    this.licenseStateForm = this.svc.buildLicenseStateForm(_clone(this.view));
    this.licenseStateFormErrors = this.svc.resetLicenseStateFormErrors();
    // this.detailFormValidationMessages = this.svc.detailFormValidationMessages;

    this.systemManagerForm = this.svc.buildSystemManagerForm(_clone(this.view));
    this.systemManagerFormErrors = this.svc.resetSystemManagerFormErrors();
  }

  toggleAccordion() {
    this.isDetailsOpen = !this.isDetailsOpen;
  }
  toggleLicenseAccordian() {
    this.isLicenseOpen = !this.isLicenseOpen;
  }
  toggleLicenseDataAccordian() {
    this.isLicenseDataOpen = !this.isLicenseDataOpen;
  }

  toggleSystemManagerAccordian() {
    this.isSystemManagerOpen = !this.isSystemManagerOpen;
  }

}
