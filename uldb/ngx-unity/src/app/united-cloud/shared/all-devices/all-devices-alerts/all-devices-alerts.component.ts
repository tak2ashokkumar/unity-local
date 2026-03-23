import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AllDevicesAlertsService, AllDevicesAlertsViewData } from './all-devices-alerts.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ZabbixMonitoringAlertsViewdata } from 'src/app/united-view/unity-alerts/device-alerts/zabbix-alerts/zabbix-alerts.service';

@Component({
  selector: 'all-devices-alerts',
  templateUrl: './all-devices-alerts.component.html',
  styleUrls: ['./all-devices-alerts.component.scss']
})
export class AllDevicesAlertsComponent implements OnInit, OnDestroy {

  viewData: AllDevicesAlertsViewData[] = [];
  zabbixViewData: ZabbixMonitoringAlertsViewdata[] = [];
  private ngUnsubscribe = new Subject();
  alertInput: { deviceType: DeviceMapping, uuid: string };
  modalRef: BsModalRef;
  @ViewChild('alertinfo') alertinfo: ElementRef;
  @ViewChild('zabbixAlertInfo') zabbixAlertInfo: ElementRef;

  constructor(private alertService: AllDevicesAlertsService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService) {
    this.alertService.alertAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alertInput = res;
      this.getAlerts();
    });

    this.alertService.zabbixAlertAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.alertInput = res;
      this.getZabbixAlert();
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getAlerts() {
    this.spinner.start('main');
    this.alertService.getAlerts(this.alertInput.deviceType, this.alertInput.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.alertService.convertToViewdata(res.alerts);
      this.modalRef = this.modalService.show(this.alertinfo, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while loading alerts. Please try again'));
      this.spinner.stop('main');
    });
  }

  getZabbixAlert() {
    this.spinner.start('main');
    this.alertService.getZabbixAlerts(this.alertInput.deviceType, this.alertInput.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.zabbixViewData = this.alertService.convertToZabbixViewData(res);
      this.modalRef = this.modalService.show(this.zabbixAlertInfo, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while loading alerts. Please try again'));
      this.spinner.stop('main');
    });
  }
}
