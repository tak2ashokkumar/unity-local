import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { UnitySetupMonitoringService } from '../unity-setup-monitoring.service';
import { Subject } from 'rxjs';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil, switchMap, take, tap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'on-boarding-device-monitoring',
  templateUrl: './on-boarding-device-monitoring.component.html',
  styleUrls: ['./on-boarding-device-monitoring.component.scss'],
  providers: [UnitySetupMonitoringService]
})
export class OnBoardingDeviceMonitoringComponent implements OnInit, OnDestroy {
  @Input() onbDetails: OnbDetails;
  @Output() emitTaskId: EventEmitter<string> = new EventEmitter<string>();

  monitoringStatus: 'notstarted' | 'inprogress' | 'error' | 'completed';
  unmappedDevices: { [key: string]: string[] } = null;
  private ngUnsubscribe = new Subject();

  constructor(private monitoringService: UnitySetupMonitoringService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService) { }

  ngOnInit() {
    this.monitoringStatus = this.monitoringService.convertToDeviceMonitoringViewData(this.onbDetails);
    this.loadUnmappedDevies();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadUnmappedDevies() {
    if (this.monitoringStatus !== 'error') {
      return;
    }
    this.monitoringService.getUnMappedDevices().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.unmappedDevices = res;
    }, err => {

    });
  }

  activateMonitoring() {
    this.monitoringService.activateMonitoring().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.emitTaskId.emit(res.task_id);
      this.notification.success(new Notification('Activate monitoring is initiated. Please check status after some time.'));
    }, err => {
      this.emitTaskId.emit(null);
      this.notification.success(new Notification('Error while activate monitoring. Please contact support@unityonecloud.com'));
    });
  }
}
