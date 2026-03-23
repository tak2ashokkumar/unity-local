import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ServerSidePlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { TabData } from 'src/app/shared/tabdata';
import { VmBackupService } from './vm-backup.service';

@Component({
  selector: 'vm-backup',
  templateUrl: './vm-backup.component.html',
  styleUrls: ['./vm-backup.component.scss'],
  providers: [VmBackupService]
})
export class VmBackupComponent implements OnInit, OnDestroy {
  tabItems: TabData[] = tabData;
  cloud: PrivateCLoudFast;
  clouds: PrivateCLoudFast[];
  count: number;
  vmId: string;
  PLATFORM_TYPE = ServerSidePlatFormMapping;
  private ngUnsubscribe = new Subject();

  constructor(private backupService: VmBackupService,
    private spinnerService: AppSpinnerService,
    private notificationService: AppNotificationService) {

  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getClouds();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getClouds() {
    this.backupService.getClouds().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PrivateCLoudFast[]) => {
      this.clouds = data;
      if (this.clouds.length) {
        this.cloud = this.clouds[0];
      }
    }, err => {
      this.notificationService.error(new Notification('Error while fetching private clouds.'))
    }, () => {
      this.spinnerService.stop('main');
    });
  }
}
const tabData: TabData[] = [
  {
    name: 'VM Backup',
    url: '/services/vmbackup'
  }
];