import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { UnitySetupMonitoringService } from '../unity-setup-monitoring.service';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'on-boarding-vm-monitoring',
  templateUrl: './on-boarding-vm-monitoring.component.html',
  styleUrls: ['./on-boarding-vm-monitoring.component.scss'],
  providers: [UnitySetupMonitoringService]
})
export class OnBoardingVmMonitoringComponent implements OnInit, OnDestroy {
  @Output() emitToParent: EventEmitter<string> = new EventEmitter<string>();

  clouds: string[] = ['VMware vCenter', 'VMware vCloud', 'OpenStack', 'Proxmox'];
  selectedCloudType: string = '';
  private ngUnsubscribe = new Subject();
  fileToUpload: File = null;
  invalidFileSize: string = null;

  constructor(private monitoringService: UnitySetupMonitoringService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  validateFileSize() {
    const size = this.fileToUpload.size / 1000000;
    if (size > 1) {
      this.invalidFileSize = `File too large (Uploaded ${size}MB : Max allowed 1MB)`;
      return;
    }
    this.invalidFileSize = null;
  }

  detectFiles(files: FileList) {
    if (!files.length) {
      return;
    }
    this.fileToUpload = files.item(0);
    this.validateFileSize();
  }

  uploadFile() {
    this.spinner.start('main');
    this.monitoringService.uploadFile(this.selectedCloudType, this.fileToUpload, 'vm_file').pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('All the assets have been successfully added.'));
      this.emitToParent.emit();
    }, err => {
      this.emitToParent.emit();
      this.spinner.stop('main');
      this.notification.error(new Notification('Error occured while adding devices. Please check the excel file for details.'));
    });
  }

}
